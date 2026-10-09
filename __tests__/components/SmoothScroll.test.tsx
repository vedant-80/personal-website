import { cleanup, render } from "@testing-library/react";
import { SmoothScroll } from "@/components/SmoothScroll";

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");
const originalScrollY = Object.getOwnPropertyDescriptor(window, "scrollY")!;
const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight")!;
let reduced = false;
let fine = true;
let position = 0;
let frames: Map<number, FrameRequestCallback>;
let frameId = 0;
let now = 0;

beforeEach(() => {
  reduced = false;
  fine = true;
  position = 0;
  frames = new Map();
  frameId = 0;
  now = 0;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: jest.fn((query: string) => ({
      get matches() { return query.includes("reduced-motion") ? reduced : fine; },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
  Object.defineProperty(window, "scrollY", { configurable: true, get: () => position });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  jest.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2400);
  jest.spyOn(performance, "now").mockImplementation(() => now);
  jest.spyOn(window, "scrollTo").mockImplementation((options: ScrollToOptions | number) => {
    if (typeof options !== "number") position = options.top ?? position;
  });
  jest.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
    frames.set(++frameId, callback);
    return frameId;
  });
  jest.spyOn(window, "cancelAnimationFrame").mockImplementation(id => { frames.delete(id); });
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
  Object.defineProperty(window, "scrollY", originalScrollY);
  Object.defineProperty(window, "innerHeight", originalInnerHeight);
  if (originalMatchMedia) Object.defineProperty(window, "matchMedia", originalMatchMedia);
  else Reflect.deleteProperty(window, "matchMedia");
});

function wheel(options: WheelEventInit = {}, target: EventTarget = window) {
  const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 200, ...options });
  target.dispatchEvent(event);
  return event;
}

function tick() {
  now += 16;
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach(callback => callback(now));
}

test("eases and coalesces desktop wheel input, then reaches the requested position", () => {
  render(<SmoothScroll />);
  expect(wheel().defaultPrevented).toBe(true);
  expect(wheel().defaultPrevented).toBe(true);
  expect(frames.size).toBe(1);
  tick();
  expect(position).toBeGreaterThan(0);
  expect(position).toBeLessThan(400);
  for (let index = 0; index < 50; index++) tick();
  expect(position).toBeCloseTo(400);
  expect(frames.size).toBe(0);
});

test.each(["reduced", "coarse", "zoom", "horizontal", "shift"])("preserves native scrolling for %s input", mode => {
  if (mode === "reduced") reduced = true;
  if (mode === "coarse") fine = false;
  render(<SmoothScroll />);
  const options = mode === "zoom" ? { ctrlKey: true } : mode === "horizontal" ? { deltaX: 400 } : mode === "shift" ? { shiftKey: true } : {};
  expect(wheel(options).defaultPrevented).toBe(false);
  expect(frames.size).toBe(0);
});

test("keeps textarea and nested scrolling native", () => {
  const { container } = render(<><SmoothScroll /><textarea /><div style={{ overflowY: "auto" }}><span>Nested content</span></div></>);
  expect(wheel({}, container.querySelector("textarea")!).defaultPrevented).toBe(false);
  const scroller = container.querySelector("div")!;
  jest.spyOn(scroller, "scrollHeight", "get").mockReturnValue(500);
  jest.spyOn(scroller, "clientHeight", "get").mockReturnValue(100);
  expect(wheel({}, scroller.querySelector("span")!).defaultPrevented).toBe(false);
  expect(frames.size).toBe(0);
});

test("clamps document boundaries and allows native overscroll at the boundary", () => {
  render(<SmoothScroll />);
  expect(wheel({ deltaY: -200 }).defaultPrevented).toBe(false);
  wheel({ deltaY: 5000 });
  for (let index = 0; index < 60; index++) tick();
  expect(position).toBe(1600);
  expect(wheel().defaultPrevented).toBe(false);
});

test("keyboard and externally initiated scrolling cancel pending motion", () => {
  render(<SmoothScroll />);
  wheel();
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown" }));
  expect(frames.size).toBe(0);
  wheel();
  position = 500;
  tick();
  expect(position).toBe(500);
  expect(frames.size).toBe(0);
});

test("cleans up pending frames and wheel interception on unmount", () => {
  const { unmount } = render(<SmoothScroll />);
  wheel();
  unmount();
  expect(frames.size).toBe(0);
  expect(wheel().defaultPrevented).toBe(false);
});
