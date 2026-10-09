"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { deletePost, unpublishPost } from "@/lib/actions/posts";
import { useState } from "react";

export function PostActions({ postId, status }: { postId: string; status: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function mutate(action: "delete" | "unpublish") {
    setLoading(true);
    setError(null);
    try {
      await (action === "delete" ? deletePost(postId) : unpublishPost(postId));
      router.push("/admin");
      router.refresh();
      setConfirming(false);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to update content. Please try again.");
    } finally { setLoading(false); }
  }
  const buttonClass = "rounded-md border border-[hsl(var(--color-border))] px-3 py-2 text-xs hover:bg-[hsl(var(--color-surface))] disabled:opacity-50";
  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2"><Link href={`/admin/posts/${postId}/edit`} className={buttonClass}>Edit</Link>{status === "published" && <button disabled={loading} onClick={() => mutate("unpublish")} className={buttonClass}>Unpublish</button>}<button disabled={loading} onClick={() => confirming ? mutate("delete") : setConfirming(true)} className={`${buttonClass} text-red-300`}>{confirming ? "Confirm delete" : "Delete"}</button>{confirming && <button disabled={loading} onClick={() => setConfirming(false)} className={buttonClass}>Cancel</button>}</div>
      {confirming && <p className="text-xs text-[hsl(var(--color-muted))]">Delete this item permanently? This cannot be undone.</p>}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
