"use server";

import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { notifySubscribers } from "@/lib/actions/notify-subscribers";
import { contentBasePath, estimateReadingTime, extractPlaintext, isContentKind, parseContent, slugify, type ContentKind } from "@/lib/content-model";

const withFlairs = { flairs: { include: { flair: true } } } as const;
function formValues(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title || title.length > 200) throw new Error("Title must be between 1 and 200 characters.");
  const content = parseContent(String(formData.get("content") ?? ""));
  const plaintext = extractPlaintext(content);
  const status = formData.get("status");
  if (status !== "draft" && status !== "published") throw new Error("Invalid publishing status.");
  const flairIds = [...new Set(formData.getAll("flairs").map(String))];
  if (flairIds.length > 16 || flairIds.some((id) => !id || id.length > 128)) throw new Error("Invalid flair selection.");
  return { title, content, contentPlaintext: plaintext, readingTimeMinutes: estimateReadingTime(plaintext), excerpt: plaintext.slice(0, 200) || null, status, flairIds };
}
function invalidate(kind: ContentKind, slug: string) {
  revalidatePath(contentBasePath(kind));
  revalidatePath(`${contentBasePath(kind)}/${slug}`);
  revalidatePath("/admin");
}
function notifyPublished(post: { id: string; title: string; slug: string; excerpt: string | null; kind: ContentKind }) {
  if (post.kind === "blog") notifySubscribers(post).catch((error) => console.error("Email fanout error:", error));
}

export async function createPost(formData: FormData) {
  await requireAdmin();
  const kind = formData.get("kind") ?? "blog";
  if (!isContentKind(kind)) throw new Error("Invalid content type.");
  const { flairIds, ...data } = formValues(formData);
  const baseSlug = slugify(data.title);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const post = await prisma.post.create({ data: { ...data, status: data.status as "draft" | "published", kind, slug: attempt === 0 ? baseSlug : `${baseSlug}-${randomUUID().slice(0, 8)}`, publishedAt: data.status === "published" ? new Date() : null, flairs: { create: flairIds.map((flairId) => ({ flairId })) } } });
      if (post.status === "published") notifyPublished(post);
      invalidate(post.kind, post.slug);
      return { id: post.id, slug: post.slug, kind: post.kind };
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002" || attempt === 2) throw error;
    }
  }
  throw new Error("Unable to create content.");
}

export async function getFlairs() { return prisma.flair.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }); }
export async function getPosts(kind?: ContentKind) {
  await requireAdmin();
  return prisma.post.findMany({ where: kind ? { kind } : {}, orderBy: { createdAt: "desc" }, include: withFlairs });
}
export async function getPublishedPosts(flairSlugs?: string[], kind: ContentKind = "blog") {
  return prisma.post.findMany({ where: { kind, status: "published", ...(flairSlugs?.length ? { flairs: { some: { flair: { slug: { in: flairSlugs } } } } } : {}) }, orderBy: { publishedAt: "desc" }, include: withFlairs });
}
export async function getPublishedPost(slug: string, kind: ContentKind) { return prisma.post.findFirst({ where: { slug, kind, status: "published" }, include: withFlairs }); }
export async function getPost(id: string) { await requireAdmin(); return prisma.post.findUnique({ where: { id }, include: withFlairs }); }

export async function updatePost(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || id.length > 128) throw new Error("Invalid content ID.");
  const { flairIds, ...data } = formValues(formData);
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.post.findUnique({ where: { id } });
    if (!existing) throw new Error("Content not found.");
    if (formData.has("kind") && formData.get("kind") !== existing.kind) throw new Error("The content type cannot be changed.");
    const post = await tx.post.update({ where: { id }, data: { ...data, status: data.status as "draft" | "published", publishedAt: data.status === "published" ? existing.publishedAt ?? new Date() : existing.publishedAt, flairs: { deleteMany: {}, create: flairIds.map((flairId) => ({ flairId })) } } });
    return { post, newlyPublished: existing.status !== "published" && post.status === "published" };
  });
  if (result.newlyPublished) notifyPublished(result.post);
  invalidate(result.post.kind, result.post.slug);
  return { id: result.post.id, slug: result.post.slug, kind: result.post.kind };
}
export async function unpublishPost(id: string) {
  await requireAdmin();
  const post = await prisma.post.update({ where: { id }, data: { status: "draft" } });
  invalidate(post.kind, post.slug);
}
export async function deletePost(id: string) {
  await requireAdmin();
  const post = await prisma.post.delete({ where: { id } });
  invalidate(post.kind, post.slug);
}
