import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { getPosts } from "@/lib/actions/posts";
import { PostActions } from "./PostActions";

export default async function AdminPage() {
  await requireAdmin();
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-11 items-center rounded-md bg-[hsl(var(--color-primary))] px-4 text-sm font-semibold text-[hsl(var(--color-primary-contrast))] hover:bg-[hsl(var(--color-accent))]"
        >
          New Post
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-[hsl(var(--color-muted))]">No posts yet.</p>
        ) : (
          <ul className="space-y-2">
            {posts.map((post) => (
              <li
                key={post.id}
                className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{post.title}</div>
                    <div className="text-sm text-[hsl(var(--color-muted))]">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                          post.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {post.status}
                      </span>
                      {" · "}
                      {post.slug}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {post.flairs.map((pf) => (
                      <span
                        key={pf.flairId}
                        className="inline-flex items-center rounded-full border border-[hsl(var(--color-border))] px-2 py-0.5 text-xs"
                      >
                        {pf.flair.name}
                      </span>
                    ))}
                  </div>
                </div>
                <PostActions postId={post.id} status={post.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
