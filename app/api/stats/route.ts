import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { publicTrackingTarget, readMetrics, recordVisit } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const cookieName = "site-visitor";
const noCache = { "Cache-Control": "no-store" };

function isSameOrigin(req: NextRequest) {
  const rawOrigin = req.headers.get("origin");
  if (!rawOrigin) return false;
  // Next may normalize nextUrl to its internal localhost URL behind a proxy.
  // Use the actual Host, never forwarded-host, to bind the browser origin to this request.
  const host = req.headers.get("host") || req.nextUrl.host;
  const forwardedProtocol = req.headers.get("x-forwarded-proto");
  const protocol = forwardedProtocol === "https" || forwardedProtocol === "http"
    ? `${forwardedProtocol}:` : req.nextUrl.protocol;
  try {
    const origin = new URL(rawOrigin);
    const expected = new URL(`${protocol}//${host}`);
    return ["https:", "http:"].includes(origin.protocol)
      && !origin.username && !origin.password && !origin.search && !origin.hash
      && origin.pathname === "/"
      && !expected.username && !expected.password && expected.pathname === "/"
      && !expected.search && !expected.hash
      && origin.origin === expected.origin;
  } catch { return false; }
}

export async function GET(req: NextRequest) {
  const contentId = req.nextUrl.searchParams.get("contentId") || undefined;
  if (contentId && (contentId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(contentId))) {
    return NextResponse.json({ error: "invalid_content" }, { status: 400, headers: noCache });
  }
  try {
    return NextResponse.json(await readMetrics(contentId), { headers: noCache });
  } catch {
    return NextResponse.json({ error: "stats_unavailable" }, { status: 503, headers: noCache });
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403, headers: noCache });
  }
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "invalid_content_type" }, { status: 415, headers: noCache });
  }
  let pathname: unknown;
  try { pathname = (await req.json())?.pathname; } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: noCache });
  }
  if (!publicTrackingTarget(pathname)) {
    return NextResponse.json({ error: "invalid_path" }, { status: 400, headers: noCache });
  }
  const existingVisitor = req.cookies.get(cookieName)?.value;
  const visitor = existingVisitor && /^[a-f0-9-]{36}$/i.test(existingVisitor) ? existingVisitor : randomUUID();
  try {
    const metrics = await recordVisit(pathname, visitor);
    if (!metrics) return NextResponse.json({ error: "content_not_found" }, { status: 404, headers: noCache });
    const response = NextResponse.json(metrics, { headers: noCache });
    response.cookies.set(cookieName, visitor, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 30 * 60 });
    return response;
  } catch {
    return NextResponse.json({ error: "stats_unavailable" }, { status: 503, headers: noCache });
  }
}
