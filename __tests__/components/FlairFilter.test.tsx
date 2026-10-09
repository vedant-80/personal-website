import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FlairFilter } from "@/app/blog/FlairFilter";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams("topic=life&sort=newest"),
}));

const flairs = [
  { id: "1", name: "Life", slug: "life" },
  { id: "2", name: "Technical", slug: "technical" },
];

beforeEach(() => mockPush.mockClear());

test("exposes active selections and adds a topic without losing other query parameters", () => {
  render(<FlairFilter flairs={flairs} activeSlugs={["life"]} />);

  expect(screen.getByRole("button", { name: "Life" })).toHaveAttribute("aria-pressed", "true");
  const technical = screen.getByRole("button", { name: "Technical" });
  expect(technical).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(technical);
  expect(mockPush).toHaveBeenCalledWith("/blog?topic=life%2Ctechnical&sort=newest");
});

test("removes the topic parameter when the final selected flair is toggled off", () => {
  render(<FlairFilter flairs={flairs} activeSlugs={["life"]} />);
  fireEvent.click(screen.getByRole("button", { name: "Life" }));
  expect(mockPush).toHaveBeenCalledWith("/blog?sort=newest");
});
