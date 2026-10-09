import Link from "next/link";
import { FlairBadge } from "@/components/FlairBadge";
import { requireAdmin } from "@/lib/admin-guard";
import { getPosts } from "@/lib/actions/posts";
import { contentBasePath } from "@/lib/content-model";
import { PostActions } from "./PostActions";

export default async function AdminPage() {
  await requireAdmin("/admin");
  const posts = await getPosts();
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-semibold tracking-tight">Manage website</h1><div className="flex gap-3 text-sm text-[hsl(var(--color-link))]"><Link href="/admin/posts/new?kind=blog">New post</Link><Link href="/admin/posts/new?kind=project">New project</Link></div></header>
      {(["blog", "project"] as const).map((kind) => {
        const entries = posts.filter((post) => post.kind === kind);
        return <section key={kind} className="space-y-3"><h2 className="text-lg font-semibold">{kind === "blog" ? "Posts" : "Projects"} ({entries.length})</h2>{!entries.length ? <p className="text-sm text-[hsl(var(--color-muted))]">No {kind === "blog" ? "posts" : "projects"} yet.</p> : <ul className="space-y-3">{entries.map((post) => <li key={post.id} className="quiet-card"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{post.status === "published" ? <Link href={`${contentBasePath(kind)}/${post.slug}`} className="hover:text-[hsl(var(--color-link))]">{post.title}</Link> : post.title}</h3><p className="mt-1 text-sm text-[hsl(var(--color-muted))]">{post.status} · {post.viewCount.toLocaleString()} views</p></div><div className="flex flex-wrap gap-2">{post.flairs.map((pf) => <FlairBadge key={pf.flairId} name={pf.flair.name} slug={pf.flair.slug} />)}</div></div><PostActions postId={post.id} status={post.status} /></li>)}</ul>}</section>;
      })}
    </div>
  );
}
