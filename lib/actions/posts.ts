"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { notifySubscribers } from "@/lib/actions/notify-subscribers";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function extractPlaintext(content: { type: string; text?: string }[]): string {
  return content
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text)
    .join("\n");
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 238));
}

export async function createPost(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const contentRaw = formData.get("content") as string;
  const flairIds = formData.getAll("flairs") as string[];
  const status = (formData.get("status") as string) || "draft";

  if (!title || !contentRaw) {
    throw new Error("Title and content are required.");
  }

  const content = JSON.parse(contentRaw) as { type: string; text?: string }[];
  const plaintext = extractPlaintext(content);
  const slug = slugify(title);

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      status: status === "published" ? "published" : "draft",
      publishedAt: status === "published" ? new Date() : null,
      content,
      contentPlaintext: plaintext,
      readingTimeMinutes: estimateReadingTime(plaintext),
      excerpt: plaintext.slice(0, 200) || null,
      flairs: {
        create: flairIds.map((flairId) => ({ flairId })),
      },
    },
  });

  if (status === "published") {
    notifySubscribers({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: plaintext.slice(0, 200) || null,
    }).catch((err) => console.error("Email fanout error:", err));
  }

  revalidatePath("/blog");
  revalidatePath("/admin");
  return { id: post.id, slug: post.slug };
}

export async function getFlairs() {
  return prisma.flair.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { flairs: { include: { flair: true } } },
  });
}

export async function getPublishedPosts(flairSlugs?: string[]) {
  return prisma.post.findMany({
    where: {
      status: "published",
      ...(flairSlugs && flairSlugs.length > 0
        ? { flairs: { some: { flair: { slug: { in: flairSlugs } } } } }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    include: { flairs: { include: { flair: true } } },
  });
}

export async function getPost(id: string) {
  await requireAdmin();
  return prisma.post.findUnique({
    where: { id },
    include: { flairs: { include: { flair: true } } },
  });
}

export async function updatePost(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const contentRaw = formData.get("content") as string;
  const flairIds = formData.getAll("flairs") as string[];
  const status = (formData.get("status") as string) || "draft";

  if (!id || !title || !contentRaw) {
    throw new Error("ID, title, and content are required.");
  }

  const content = JSON.parse(contentRaw) as { type: string; text?: string }[];
  const plaintext = extractPlaintext(content);

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw new Error("Post not found.");

  const wasPublished = existing.status === "published";
  const isNowPublished = status === "published";

  await prisma.postFlair.deleteMany({ where: { postId: id } });

  const post = await prisma.post.update({
    where: { id },
    data: {
      title,
      status: isNowPublished ? "published" : "draft",
      publishedAt: isNowPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
      content,
      contentPlaintext: plaintext,
      readingTimeMinutes: estimateReadingTime(plaintext),
      excerpt: plaintext.slice(0, 200) || null,
      flairs: {
        create: flairIds.map((flairId) => ({ flairId })),
      },
    },
  });

  if (!wasPublished && isNowPublished) {
    notifySubscribers({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: plaintext.slice(0, 200) || null,
    }).catch((err) => console.error("Email fanout error:", err));
  }

  revalidatePath("/blog");
  revalidatePath("/admin");
  return { id: post.id, slug: post.slug };
}

export async function unpublishPost(id: string) {
  await requireAdmin();

  await prisma.post.update({
    where: { id },
    data: { status: "draft" },
  });

  revalidatePath("/blog");
  revalidatePath("/admin");
}

export async function deletePost(id: string) {
  await requireAdmin();

  await prisma.post.delete({ where: { id } });

  revalidatePath("/blog");
  revalidatePath("/admin");
}
