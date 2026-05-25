import Link from "next/link";
import { getPublishedPosts, getFlairs } from "@/lib/actions/posts";
import { FlairFilter } from "./FlairFilter";

interface Props {
  searchParams: Promise<{ topic?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { topic } = await searchParams;

  const activeSlugs = topic
    ? topic.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const [posts, flairs] = await Promise.all([
    getPublishedPosts(activeSlugs.length > 0 ? activeSlugs : undefined),
    getFlairs(),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="text-[hsl(var(--color-muted))]">
          Thoughts on tech, college, running, and life.
        </p>
      </div>

      <FlairFilter flairs={flairs} activeSlugs={activeSlugs} />

      <section className="grid gap-4">
        {posts.length === 0 ? (
          <p className="text-sm text-[hsl(var(--color-muted))]">
            {activeSlugs.length > 0
              ? "No posts match the selected filters."
              : "No published posts yet."}
          </p>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <article className="rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-6 transition hover:-translate-y-0.5 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.10)]">
                <div className="flex items-center gap-2">
                  {post.flairs.map((pf) => (
                    <span
                      key={pf.flairId}
                      className="inline-flex items-center rounded-full border border-[hsl(var(--color-border))] px-2 py-0.5 text-xs font-medium"
                    >
                      {pf.flair.name}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-lg font-semibold">{post.title}</div>
                <div className="mt-1 text-sm text-[hsl(var(--color-muted))]">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : ""}
                  {post.readingTimeMinutes
                    ? ` · ${post.readingTimeMinutes} min read`
                    : ""}
                </div>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-[hsl(var(--color-muted))]">
                    {post.excerpt}
                  </p>
                )}
              </article>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
