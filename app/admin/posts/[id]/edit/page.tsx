import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { getPost, getFlairs } from "@/lib/actions/posts";
import { EditPostForm } from "./EditPostForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const [post, flairs] = await Promise.all([getPost(id), getFlairs()]);

  if (!post) notFound();

  const contentBlocks = post.content as { type: string; text?: string }[];
  const contentText = contentBlocks
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text)
    .join("\n\n");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Edit Post</h1>
      <EditPostForm
        post={{
          id: post.id,
          title: post.title,
          content: contentText,
          status: post.status,
          flairIds: post.flairs.map((pf) => pf.flairId),
        }}
        flairs={flairs}
      />
    </div>
  );
}
