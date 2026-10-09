import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/stats/route";
import { hashVisitor, publicTrackingTarget, recordVisit } from "@/lib/analytics";

const events = new Set<string>();
let visits = 0;
let views = 0;
let published = true;
const mockPostFind = jest.fn(async (args: { where: { status: string; kind?: string; slug?: string } }) =>
  published && args.where.status === "published" && args.where.kind !== "project" ? { id: "post1", viewCount: views } : null);
const mockTransaction = jest.fn();
jest.mock("@/lib/db", () => ({ prisma: {
  $transaction: (...args: unknown[]) => mockTransaction(...args),
  siteStats: { findUnique: async () => ({ visitCount: visits }) },
  post: { findFirst: (...args: unknown[]) => mockPostFind(...args as [never]) },
} }));

function request(pathname: string, options: { origin?: string; cookie?: string } = {}) {
  return new NextRequest("https://example.com/api/stats", {
    method: "POST", headers: {
      origin: options.origin ?? "https://example.com", "content-type": "application/json",
      ...(options.cookie ? { cookie: options.cookie } : {}),
    }, body: JSON.stringify({ pathname }),
  });
}

beforeEach(() => {
  events.clear(); visits = 0; views = 0; published = true;
  jest.clearAllMocks();
  mockTransaction.mockImplementation(async (run: (tx: unknown) => unknown) => run({
    post: {
      findFirst: mockPostFind,
      update: async (args: { data: { viewCount: { increment: number } } }) => ({ viewCount: views += args.data.viewCount.increment }),
    },
    visitEvent: { createMany: async (args: { data: { visitorHash: string; targetKey: string }[]; skipDuplicates: boolean }) => {
      expect(args.skipDuplicates).toBe(true);
      const key = `${args.data[0].visitorHash}:${args.data[0].targetKey}`;
      if (events.has(key)) return { count: 0 };
      events.add(key); return { count: 1 };
    } },
    siteStats: { upsert: async (args: { update: { visitCount: { increment: number } } }) => ({ visitCount: visits += args.update.visitCount.increment }) },
  }));
});

test("rejects private, malformed and unknown routes before using the database", async () => {
  for (const pathname of ["/admin", "/api/auth", "/blog/draft/edit", "/missing", "/blog/a?admin=1", "/blog/../admin"]) {
    expect(publicTrackingTarget(pathname)).toBeNull();
    expect((await POST(request(pathname))).status).toBe(400);
  }
  expect(mockTransaction).not.toHaveBeenCalled();
});

test("same visitor counts once site-wide and once on each content page", async () => {
  const visitor = "a0c7505b-a422-4ca0-adc7-12637bb34358";
  const cookie = `site-visitor=${visitor}`;
  const first = await POST(request("/blog/example", { cookie }));
  expect(await first.json()).toEqual({ visits: 1, contentId: "post1", views: 1 });
  expect(await (await POST(request("/blog/example", { cookie }))).json()).toEqual({ visits: 1, contentId: "post1", views: 1 });
  expect(await (await POST(request("/about", { cookie }))).json()).toEqual({ visits: 1, contentId: null, views: null });
  expect(events).toEqual(new Set([`${hashVisitor(visitor)}:site`, `${hashVisitor(visitor)}:post:post1`]));
  expect(first.headers.get("set-cookie")).toContain("HttpOnly");
  expect(first.headers.get("set-cookie")).toContain("Max-Age=1800");
});

test("a new session increments counters again", async () => {
  await recordVisit("/blog/example", "session-one");
  expect(await recordVisit("/blog/example", "session-two")).toEqual({ visits: 2, contentId: "post1", views: 2 });
});

test("drafts, nonexistent pages and wrong content kind never increment totals", async () => {
  published = false;
  expect((await POST(request("/blog/draft"))).status).toBe(404);
  published = true;
  expect((await POST(request("/projects/example"))).status).toBe(404);
  expect(events.size).toBe(0);
  expect(visits).toBe(0);
  expect(mockPostFind).toHaveBeenCalledWith(expect.objectContaining({ where: { slug: "example", kind: "project", status: "published" } }));
});

test("rejects cross-origin recording", async () => {
  expect((await POST(request("/", { origin: "https://other.example" }))).status).toBe(403);
  expect(mockTransaction).not.toHaveBeenCalled();
});

test("uses actual Host when Next normalizes its internal URL", async () => {
  const response = await POST(new NextRequest("http://localhost:3002/api/stats", {
    method: "POST", headers: { host: "127.0.0.1:3002", origin: "http://127.0.0.1:3002", "content-type": "application/json" },
    body: JSON.stringify({ pathname: "/" }),
  }));
  expect(response.status).toBe(200);
});

test("accepts proxy HTTPS while rejecting unrelated origins and forwarded-host overrides", async () => {
  for (const [origin, status] of [["https://example.com", 200], ["http://example.com", 403], ["https://unrelated.example", 403]] as const) {
    const response = await POST(new NextRequest("http://localhost:3000/api/stats", {
      method: "POST", headers: {
        host: "example.com", "x-forwarded-proto": "https", "x-forwarded-host": "unrelated.example",
        origin, "content-type": "application/json",
      }, body: JSON.stringify({ pathname: "/" }),
    }));
    expect(response.status).toBe(status);
  }
});

test("database outage returns unavailable instead of fabricated counters", async () => {
  mockTransaction.mockRejectedValue(new Error("database unavailable"));
  const response = await POST(request("/"));
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ error: "stats_unavailable" });
  expect(response.headers.get("set-cookie")).toBeNull();
});

test("GET excludes unpublished content and is never cached", async () => {
  published = false;
  const response = await GET(new NextRequest("https://example.com/api/stats?contentId=post1"));
  expect(await response.json()).toEqual({ visits: 0, contentId: null, views: null });
  expect(response.headers.get("cache-control")).toBe("no-store");
});
