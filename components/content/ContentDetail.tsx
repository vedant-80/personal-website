import Link from "next/link";
import { notFound } from "next/navigation";
import { FlairBadge } from "@/components/FlairBadge";
import { ViewCount } from "@/components/ViewCount";
import { PostActions } from "@/app/admin/PostActions";
import { getPublishedPost } from "@/lib/actions/posts";
import { getAdminSession } from "@/lib/admin-guard";
import { contentBasePath, getYouTubeId, type ContentKind, type ContentBlock } from "@/lib/content-model";

export async function ContentDetail({ kind, slug }: { kind: ContentKind; slug: string }) {
  const [post, admin] = await Promise.all([getPublishedPost(slug, kind), getAdminSession()]);
  if (!post) notFound();
  const blocks = post.content as ContentBlock[];
  return (
    <div className="max-w-3xl space-y-6">
      <Link href={contentBasePath(kind)} className="text-sm text-[hsl(var(--color-link))]">← Back to {kind === "blog" ? "Blog" : "Projects"}</Link>
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">{post.flairs.map((pf) => <FlairBadge key={pf.flairId} name={pf.flair.name} slug={pf.flair.slug} />)}</div>
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        <div className="text-sm text-[hsl(var(--color-muted))]">{post.publishedAt?.toLocaleDateString()}{post.readingTimeMinutes ? ` · ${post.readingTimeMinutes} min read` : ""} · <ViewCount contentId={post.id} initialCount={post.viewCount} /></div>
        {admin && <PostActions postId={post.id} status={post.status} />}
      </header>
      <article className="space-y-6">
        {blocks.map((block, index) => {
          if (block.type === "text") return <p key={index} className="whitespace-pre-wrap leading-7">{block.text}</p>;
          if (block.type === "image") return <figure key={index}><img src={block.src} alt={block.alt || ""} className="h-auto max-w-full rounded-lg border border-[hsl(var(--color-border))]" />{block.alt && <figcaption className="mt-2 text-center text-sm text-[hsl(var(--color-muted))]">{block.alt}</figcaption>}</figure>;
          if (block.type === "youtube") {
            const videoId = getYouTubeId(block.url);
            return videoId ? <iframe key={index} src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={`${post.title} — video ${index + 1}`} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="aspect-video w-full rounded-lg border border-[hsl(var(--color-border))]" /> : null;
          }
          return null;
        })}
      </article>
      {kind === "blog" && <section className="quiet-card"><p className="text-sm font-semibold">Enjoyed this post?</p><p className="mt-1 page-copy"><Link href="/subscribe" className="text-[hsl(var(--color-link))]">Subscribe</Link> to get notified when new posts go live.</p></section>}
    </div>
  );
}
