import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { flairs: { include: { flair: true } } },
  });

  if (!post || post.status !== "published") {
    notFound();
  }

  const content = post.content as { type: string; text?: string; src?: string; alt?: string }[];

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/blog"
        className="text-sm text-[hsl(var(--color-link))] hover:text-[hsl(var(--color-link-hover))]"
      >
        ← Back to Blog
      </Link>

      <header className="space-y-3">
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
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        <div className="text-sm text-[hsl(var(--color-muted))]">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
          {post.readingTimeMinutes ? ` · ${post.readingTimeMinutes} min read` : ""}
        </div>
      </header>

      <article className="prose max-w-none space-y-4">
        {content.map((block, i) => {
          if (block.type === "text" && block.text) {
            return (
              <p key={i} className="text-[hsl(var(--color-fg))] leading-7">
                {block.text}
              </p>
            );
          }
          if (block.type === "image" && block.src) {
            return (
              <figure key={i}>
                <img
                  src={block.src}
                  alt={block.alt || ""}
                  className="rounded-lg border border-[hsl(var(--color-border))]"
                />
                {block.alt && (
                  <figcaption className="mt-1 text-center text-sm text-[hsl(var(--color-muted))]">
                    {block.alt}
                  </figcaption>
                )}
              </figure>
            );
          }
          return null;
        })}
      </article>

      <section className="rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-6">
        <p className="text-sm font-semibold">Enjoyed this post?</p>
        <p className="mt-1 text-sm text-[hsl(var(--color-muted))]">
          <Link href="/subscribe" className="text-[hsl(var(--color-link))] hover:text-[hsl(var(--color-link-hover))]">
            Subscribe
          </Link>{" "}
          to get notified when new posts go live.
        </p>
      </section>
    </div>
  );
}
