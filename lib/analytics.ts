import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";

export type SiteMetrics = { visits: number; contentId: string | null; views: number | null };

export function publicTrackingTarget(pathname: unknown) {
  if (typeof pathname !== "string" || pathname.length > 200) return null;
  if (["/", "/about", "/blog", "/projects", "/subscribe"].includes(pathname)) return { kind: null, slug: null };
  const match = /^\/(blog|projects)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(pathname);
  return match ? { kind: match[1] === "blog" ? "blog" as const : "project" as const, slug: match[2] } : null;
}

export function hashVisitor(visitor: string) {
  return createHash("sha256").update(visitor).digest("hex");
}

/** Persistent session deduplication and rollups commit together, including concurrent requests. */
export async function recordVisit(pathname: unknown, visitor: string): Promise<SiteMetrics | null> {
  const target = publicTrackingTarget(pathname);
  if (!target) return null;
  return prisma.$transaction(async (tx) => {
    const post = target.slug ? await tx.post.findFirst({
      where: { slug: target.slug, kind: target.kind!, status: "published" },
      select: { id: true, viewCount: true },
    }) : null;
    if (target.slug && !post) return null;
    const visitorHash = hashVisitor(visitor);
    const siteEvent = await tx.visitEvent.createMany({ data: [{ visitorHash, targetKey: "site" }], skipDuplicates: true });
    const site = await tx.siteStats.upsert({
      where: { id: "site" },
      create: { id: "site", visitCount: siteEvent.count },
      update: { visitCount: { increment: siteEvent.count } },
    });
    let views = post?.viewCount ?? null;
    if (post) {
      const event = await tx.visitEvent.createMany({ data: [{ visitorHash, targetKey: `post:${post.id}` }], skipDuplicates: true });
      const updated = await tx.post.update({ where: { id: post.id }, data: { viewCount: { increment: event.count } }, select: { viewCount: true } });
      views = updated.viewCount;
    }
    return { visits: site.visitCount, contentId: post?.id ?? null, views };
  });
}

export async function readMetrics(contentId?: string): Promise<SiteMetrics> {
  const [site, post] = await Promise.all([
    prisma.siteStats.findUnique({ where: { id: "site" } }),
    contentId ? prisma.post.findFirst({ where: { id: contentId, status: "published" }, select: { id: true, viewCount: true } }) : null,
  ]);
  return { visits: site?.visitCount ?? 0, contentId: post?.id ?? null, views: post?.viewCount ?? null };
}
