import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { getPost, getFlairs } from "@/lib/actions/posts";
import type { ContentBlock, ContentKind } from "@/lib/content-model";
import { EditPostForm } from "./EditPostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/posts/${id}/edit`);
  const [post, flairs] = await Promise.all([getPost(id), getFlairs()]);
  if (!post) notFound();
  return <div className="space-y-6"><h1 className="text-3xl font-semibold tracking-tight">Edit {post.kind === "project" ? "project" : "post"}</h1><EditPostForm post={{ id: post.id, title: post.title, kind: post.kind as ContentKind, content: post.content as ContentBlock[], status: post.status, flairIds: post.flairs.map((pf) => pf.flairId) }} flairs={flairs} /></div>;
}
