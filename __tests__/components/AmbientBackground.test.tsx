import { cleanup, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AmbientBackground } from "@/components/AmbientBackground";

function mediaQuery(initial: boolean) {
  const events = new EventTarget();
  let matches = initial;
  return {
    get matches() { return matches; },
    addEventListener: jest.fn(events.addEventListener.bind(events)),
    removeEventListener: jest.fn(events.removeEventListener.bind(events)),
    change(next: boolean) {
      matches = next;
      events.dispatchEvent(new Event("change"));
    },
  };
}

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");
let fine: ReturnType<typeof mediaQuery>;
let reduced: ReturnType<typeof mediaQuery>;
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;

beforeEach(() => {
  fine = mediaQuery(true);
  reduced = mediaQuery(false);
  frames = new Map();
  nextFrame = 1;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: jest.fn((query: string) => query.includes("reduced-motion") ? reduced : fine),
  });
  jest.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
    const id = nextFrame++;
    frames.set(id, callback);
    return id;
  });
  jest.spyOn(window, "cancelAnimationFrame").mockImplementation(id => {
    frames.delete(id);
  });
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
  if (originalMatchMedia) Object.defineProperty(window, "matchMedia", originalMatchMedia);
  else Reflect.deleteProperty(window, "matchMedia");
});

function move(x: number, y: number, pointerType = "mouse") {
  const event = new MouseEvent("pointermove", { clientX: x, clientY: y });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  window.dispatchEvent(event);
}

function flushFrame() {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach(callback => callback(16));
}

function setup() {
  const result = render(<AmbientBackground />);
  const glow = result.container.querySelector<HTMLDivElement>(".ambient-background__glow")!;
  return { ...result, glow };
}

test("coalesces desktop pointer events into one frame at the latest coordinates", () => {
  const { glow, container } = setup();
  expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  move(100, 150);
  move(300, 250);
  expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
  expect(glow.style.transform).toBe("");
  flushFrame();
  expect(glow.style.opacity).toBe("1");
  expect(glow.style.transform).toBe("translate3d(300px, 250px, 0) translate(-50%, -50%)");
  move(400, 350);
  expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  flushFrame();
  expect(glow.style.transform).toContain("400px, 350px");
});

test.each(["reduced motion", "coarse pointer"])("does not track the cursor with %s", preference => {
  if (preference === "reduced motion") reduced.change(true);
  else fine.change(false);
  const { glow } = setup();
  move(300, 250);
  expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  expect(glow.style.transform).toBe("");
});

test("ignores touch input even when a fine pointer is available", () => {
  setup();
  move(300, 250, "touch");
  expect(window.requestAnimationFrame).not.toHaveBeenCalled();
});

test("reacts to motion and pointer preference changes and cancels pending movement", () => {
  const { glow } = setup();
  move(300, 250);
  reduced.change(true);
  expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  flushFrame();
  expect(glow.style.opacity).toBe("0");
  expect(glow.style.transform).toBe("");
  reduced.change(false);
  move(400, 350);
  flushFrame();
  expect(glow.style.opacity).toBe("1");
  fine.change(false);
  expect(glow.style.opacity).toBe("0");
  move(500, 450);
  expect(frames.size).toBe(0);
});

test("keeps the glow while moving between elements and hides it on leaving or blur", () => {
  const { glow } = setup();
  move(300, 250);
  flushFrame();
  window.dispatchEvent(new MouseEvent("pointerout", { relatedTarget: document.body }));
  expect(glow.style.opacity).toBe("1");
  window.dispatchEvent(new MouseEvent("pointerout"));
  expect(glow.style.opacity).toBe("0");
  move(400, 350);
  window.dispatchEvent(new Event("blur"));
  expect(frames.size).toBe(0);
  expect(glow.style.opacity).toBe("0");
});

test("removes its event listeners and cancels its pending frame on unmount", () => {
  const addListener = jest.spyOn(window, "addEventListener");
  const removeListener = jest.spyOn(window, "removeEventListener");
  const { unmount } = setup();
  move(300, 250);
  unmount();
  expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  expect(frames.size).toBe(0);
  for (const event of ["pointermove", "pointerout", "blur"]) {
    const registered = addListener.mock.calls.find(([type]) => type === event)!;
    expect(removeListener).toHaveBeenCalledWith(event, registered[1]);
  }
  for (const media of [fine, reduced]) {
    expect(media.removeEventListener).toHaveBeenCalledWith("change", media.addEventListener.mock.calls[0][1]);
  }
  move(400, 350);
  expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
});
