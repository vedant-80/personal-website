import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));

describe("Navbar", () => {
  beforeEach(() => {
    jest.mocked(usePathname).mockReturnValue("/");
  });

  test("renders exactly four accessible icon links with the correct routes", () => {
    render(<Navbar />);
    expect(screen.getAllByRole("link")).toHaveLength(4);
    for (const [label, href] of [["Home", "/"], ["Projects", "/projects"], ["About", "/about"], ["Blog", "/blog"]]) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
      expect(link.textContent).toBe("");
      expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("marks only home active on the home page", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Blog" })).not.toHaveAttribute("aria-current");
  });

  test("marks the blog active on a nested article route", () => {
    jest.mocked(usePathname).mockReturnValue("/blog/my-post");
    render(<Navbar />);
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  test("does not mark similar route prefixes active", () => {
    jest.mocked(usePathname).mockReturnValue("/blogroll");
    render(<Navbar />);
    expect(screen.getByRole("link", { name: "Blog" })).not.toHaveAttribute("aria-current");
  });
});
