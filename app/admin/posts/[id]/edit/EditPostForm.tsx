"use client";

import { useState } from "react";
import { flairClassName } from "@/components/FlairBadge";
import { updatePost } from "@/lib/actions/posts";
import { useRouter } from "next/navigation";

interface Flair {
  id: string;
  name: string;
  slug: string;
}

interface PostData {
  id: string;
  title: string;
  content: string;
  status: string;
  flairIds: string[];
}

export function EditPostForm({ post, flairs }: { post: PostData; flairs: Flair[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [selectedFlairs, setSelectedFlairs] = useState<string[]>(post.flairIds);
  const [status, setStatus] = useState<"draft" | "published">(
    post.status === "published" ? "published" : "draft"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleFlair(id: string) {
    setSelectedFlairs((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const contentBlocks = content
        .split("\n\n")
        .filter(Boolean)
        .map((block) => ({ type: "text", text: block }));

      const formData = new FormData();
      formData.set("id", post.id);
      formData.set("title", title);
      formData.set("content", JSON.stringify(contentBlocks));
      formData.set("status", status);
      for (const id of selectedFlairs) {
        formData.append("flairs", id);
      }

      await updatePost(formData);
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-semibold">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="h-11 w-full rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 text-sm text-[hsl(var(--color-fg))] placeholder:text-[hsl(var(--color-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-focus-ring))]"
          placeholder="Post title"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="block text-sm font-semibold">
          Content (paragraphs separated by blank lines)
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={12}
          className="w-full rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm text-[hsl(var(--color-fg))] placeholder:text-[hsl(var(--color-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-focus-ring))]"
          placeholder="Write your post content here..."
        />
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-semibold">Flairs</span>
        <div className="flex flex-wrap gap-2">
          {flairs.map((flair) => (
            <button
              key={flair.id}
              type="button"
              onClick={() => toggleFlair(flair.id)}
              aria-pressed={selectedFlairs.includes(flair.id)}
              className={`${flairClassName(flair.slug, selectedFlairs.includes(flair.id))} transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
            >
              {flair.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <span className="block text-sm font-semibold">Status</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={status === "draft"}
              onChange={() => setStatus("draft")}
            />
            Draft
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="status"
              value="published"
              checked={status === "published"}
              onChange={() => setStatus("published")}
            />
            Published
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-11 items-center rounded-md bg-[hsl(var(--color-primary))] px-6 text-sm font-semibold text-[hsl(var(--color-primary-contrast))] hover:bg-[hsl(var(--color-accent))] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-bg))]"
      >
        {submitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
