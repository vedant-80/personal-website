import { requireAdmin } from "@/lib/admin-guard";
import { getFlairs } from "@/lib/actions/posts";
import { PostForm } from "./PostForm";

export default async function NewPostPage() {
  await requireAdmin();
  const flairs = await getFlairs();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">New Post</h1>
      <PostForm flairs={flairs} />
    </div>
  );
}
