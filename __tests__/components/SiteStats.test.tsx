import React, { StrictMode } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SiteStats } from "@/components/SiteStats";
import { ViewCount } from "@/components/ViewCount";

let mockPathname = "/";
jest.mock("next/navigation", () => ({ usePathname: () => mockPathname }));
const mockFetch = jest.fn();
beforeEach(() => {
  mockPathname = "/";
  mockFetch.mockReset();
  global.fetch = mockFetch;
});

test("StrictMode shares its pending initial request and updates matching content count", async () => {
  mockPathname = "/blog/example";
  let resolve!: (value: unknown) => void;
  mockFetch.mockReturnValue(new Promise((done) => { resolve = done; }));
  render(<StrictMode><SiteStats /><ViewCount contentId="post1" initialCount={5} /><ViewCount contentId="other" initialCount={10} /></StrictMode>);
  await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  await act(async () => resolve({ ok: true, json: async () => ({ visits: 42, contentId: "post1", views: 6 }) }));
  expect(await screen.findByText("42")).toBeInTheDocument();
  expect(screen.getByText("6 views")).toBeInTheDocument();
  expect(screen.getByText("10 views")).toBeInTheDocument();
});

test("serializes fast navigation until the first session cookie response finishes", async () => {
  let resolve!: (value: unknown) => void;
  mockFetch.mockReturnValueOnce(new Promise((done) => { resolve = done; }))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ visits: 7, contentId: null, views: null }) });
  const { rerender } = render(<SiteStats />);
  await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  mockPathname = "/projects";
  rerender(<SiteStats />);
  expect(mockFetch).toHaveBeenCalledTimes(1);
  await act(async () => resolve({ ok: true, json: async () => ({ visits: 7, contentId: null, views: null }) }));
  await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  expect(JSON.parse(mockFetch.mock.calls[1][1].body)).toEqual({ pathname: "/projects" });
});

test("admin pages never record visits and authenticated owners only read statistics", async () => {
  mockPathname = "/admin";
  const { rerender } = render(<SiteStats isAdmin />);
  expect(mockFetch).not.toHaveBeenCalled();
  expect(screen.queryByLabelText("Website statistics")).not.toBeInTheDocument();
  mockPathname = "/blog";
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ visits: 9, contentId: null, views: null }) });
  rerender(<SiteStats isAdmin />);
  expect(await screen.findByText("9")).toBeInTheDocument();
  expect(mockFetch).toHaveBeenCalledWith("/api/stats", { cache: "no-store" });
});

test("failed persistence shows unavailable without inventing totals", async () => {
  mockFetch.mockResolvedValue({ ok: false });
  render(<SiteStats />);
  expect(await screen.findByText("Unavailable")).toBeInTheDocument();
});
