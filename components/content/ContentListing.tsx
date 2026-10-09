import Link from "next/link";
import { FlairBadge } from "@/components/FlairBadge";
import { FlairFilter } from "@/app/blog/FlairFilter";
import { getFlairs, getPublishedPosts } from "@/lib/actions/posts";
import { getAdminSession } from "@/lib/admin-guard";
import { contentBasePath, type ContentKind } from "@/lib/content-model";

export async function ContentListing({ kind, activeSlugs = [] }: { kind: ContentKind; activeSlugs?: string[] }) {
  const [posts, flairs, admin] = await Promise.all([
    getPublishedPosts(activeSlugs.length ? activeSlugs : undefined, kind),
    kind === "blog" ? getFlairs() : Promise.resolve([]),
    getAdminSession(),
  ]);
  const heading = kind === "blog" ? "Blog" : "Projects";
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="page-heading">{heading}<span className="hero-period">.</span></h1>
        <p className="page-copy">{kind === "blog" ? "Thoughts on tech, college, running, and life." : "Experiments, ideas, and the things I learn by making them."}</p>
        {admin && <div className="flex gap-4 text-sm text-[hsl(var(--color-link))]"><Link href={`/admin/posts/new?kind=${kind}`}>Add {kind === "blog" ? "post" : "project"}</Link><Link href="/admin">Manage content</Link></div>}
      </header>
      {kind === "blog" && <FlairFilter flairs={flairs} activeSlugs={activeSlugs} />}
      <section className="grid gap-4" aria-label={heading}>
        {!posts.length && <p className="text-sm text-[hsl(var(--color-muted))]">{activeSlugs.length ? "No posts match the selected filters." : `No published ${kind === "blog" ? "posts" : "projects"} yet.`}</p>}
        {posts.map((post) => (
          <article key={post.id} className="quiet-card space-y-3">
            <div className="flex flex-wrap gap-2">{post.flairs.map((pf) => <FlairBadge key={pf.flairId} name={pf.flair.name} slug={pf.flair.slug} />)}</div>
            <h2 className="text-xl font-semibold"><Link href={`${contentBasePath(kind)}/${post.slug}`} className="hover:text-[hsl(var(--color-link))]">{post.title}</Link></h2>
            <p className="text-sm text-[hsl(var(--color-muted))]">{post.publishedAt?.toLocaleDateString()}{post.readingTimeMinutes ? ` · ${post.readingTimeMinutes} min read` : ""} · {post.viewCount.toLocaleString()} views</p>
            {post.excerpt && <p className="page-copy">{post.excerpt}</p>}
            {admin && <Link href={`/admin/posts/${post.id}/edit`} className="inline-block text-sm text-[hsl(var(--color-link))]">Edit {kind === "blog" ? "post" : "project"}</Link>}
          </article>
        ))}
      </section>
    </div>
  );
}
