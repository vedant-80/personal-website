import { requireAdmin } from "@/lib/admin-guard";
import { getFlairs } from "@/lib/actions/posts";
import { PostForm } from "./PostForm";

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind: requestedKind } = await searchParams;
  const kind = requestedKind === "project" ? "project" : "blog";
  await requireAdmin(`/admin/posts/new?kind=${kind}`);
  const flairs = await getFlairs();
  return <div className="space-y-6"><h1 className="text-3xl font-semibold tracking-tight">New {kind === "project" ? "project" : "post"}</h1><PostForm flairs={flairs} kind={kind} /></div>;
}
