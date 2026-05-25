import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Navbar } from "@/components/Navbar";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe("Navbar", () => {
  test("renders site name", () => {
    render(<Navbar />);
    expect(screen.getByText("Vedant Bhattacharyya")).toBeInTheDocument();
  });

  test("renders all nav links", () => {
    render(<Navbar />);
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Professional")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  test("nav links have correct hrefs", () => {
    render(<Navbar />);
    expect(screen.getByText("About").closest("a")).toHaveAttribute("href", "/about");
    expect(screen.getByText("Blog").closest("a")).toHaveAttribute("href", "/blog");
  });

  test("does not render Admin link in public nav", () => {
    render(<Navbar />);
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });
});
