"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { deletePost, unpublishPost } from "@/lib/actions/posts";
import { useState } from "react";

interface Props {
  postId: string;
  status: string;
}

export function PostActions({ postId, status }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    await deletePost(postId);
    router.refresh();
  }

  async function handleUnpublish() {
    setLoading(true);
    await unpublishPost(postId);
    router.refresh();
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <Link
        href={`/admin/posts/${postId}/edit`}
        className="inline-flex h-8 items-center rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 text-xs font-medium text-[hsl(var(--color-fg))] hover:bg-[hsl(var(--color-surface))]"
      >
        Edit
      </Link>

      {status === "published" && (
        <button
          onClick={handleUnpublish}
          disabled={loading}
          className="inline-flex h-8 items-center rounded-md border border-yellow-300 bg-yellow-50 px-3 text-xs font-medium text-yellow-700 hover:bg-yellow-100 disabled:opacity-50"
        >
          Unpublish
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium disabled:opacity-50 ${
          confirming
            ? "border-red-400 bg-red-100 text-red-700 hover:bg-red-200"
            : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
        }`}
      >
        {confirming ? "Confirm Delete" : "Delete"}
      </button>

      {confirming && (
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-fg))]"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
