"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { flairClassName } from "@/components/FlairBadge";
import { createPost, updatePost } from "@/lib/actions/posts";
import { contentBasePath, getYouTubeId, type ContentBlock, type ContentKind } from "@/lib/content-model";

export interface EditorPost {
  id: string;
  title: string;
  kind: ContentKind;
  content: ContentBlock[];
  status: string;
  flairIds: string[];
}
export interface EditorFlair { id: string; name: string; slug: string }
const fieldClass = "w-full rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-focus-ring))]";
const buttonClass = "rounded-md border border-[hsl(var(--color-border))] px-3 py-2 text-sm hover:bg-[hsl(var(--color-surface))] disabled:opacity-50";

export function ContentEditor({ post, kind = "blog", flairs }: { post?: EditorPost; kind?: ContentKind; flairs: EditorFlair[] }) {
  const router = useRouter();
  const contentKind = post?.kind ?? kind;
  const [title, setTitle] = useState(post?.title ?? "");
  const [blocks, setBlocks] = useState<ContentBlock[]>(post?.content ?? [{ type: "text", text: "" }]);
  const [flairIds, setFlairIds] = useState(post?.flairIds ?? []);
  const [status, setStatus] = useState(post?.status === "published" ? "published" : "draft");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function replaceBlock(index: number, block: ContentBlock) {
    setBlocks((current) => current.map((entry, position) => position === index ? block : entry));
  }
  function moveBlock(index: number, direction: number) {
    setBlocks((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!blocks.length) { setError("Add at least one content block."); return; }
    if (blocks.some((block) => block.type === "youtube" && !getYouTubeId(block.url))) { setError("Use a valid YouTube video URL."); return; }
    setSubmitting(true);
    try {
      const data = new FormData();
      if (post) data.set("id", post.id);
      data.set("kind", contentKind);
      data.set("title", title);
      data.set("content", JSON.stringify(blocks));
      data.set("status", status);
      flairIds.forEach((id) => data.append("flairs", id));
      const saved = await (post ? updatePost(data) : createPost(data));
      router.push(status === "published" ? `${contentBasePath(contentKind)}/${saved.slug}` : "/admin");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to save. Please try again.");
    } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
      {error && <p role="alert" className="rounded-md border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
      <fieldset disabled={submitting} className="space-y-5 disabled:opacity-70">
        <div className="space-y-2"><label htmlFor="title" className="block text-sm font-semibold">Title</label><input id="title" required value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} /></div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Content</h2>
          {blocks.map((block, index) => (
            <fieldset key={index} className="space-y-3 rounded-xl border border-[hsl(var(--color-border))] p-4">
              <legend className="px-1 text-sm">Block {index + 1}: {block.type === "youtube" ? "YouTube video" : block.type}</legend>
              {block.type === "text" && <div><label htmlFor={`block-${index}-text`} className="mb-1 block text-sm">Text</label><textarea id={`block-${index}-text`} required rows={5} value={block.text} onChange={(event) => replaceBlock(index, { ...block, text: event.target.value })} className={fieldClass} /></div>}
              {block.type === "image" && <><div><label htmlFor={`block-${index}-src`} className="mb-1 block text-sm">Image URL</label><input id={`block-${index}-src`} required value={block.src} onChange={(event) => replaceBlock(index, { ...block, src: event.target.value })} className={fieldClass} placeholder="https://… or /images/…" /></div><div><label htmlFor={`block-${index}-alt`} className="mb-1 block text-sm">Image description</label><input id={`block-${index}-alt`} value={block.alt ?? ""} onChange={(event) => replaceBlock(index, { ...block, alt: event.target.value })} className={fieldClass} /></div></>}
              {block.type === "youtube" && <div><label htmlFor={`block-${index}-url`} className="mb-1 block text-sm">YouTube URL</label><input id={`block-${index}-url`} required type="url" value={block.url} onChange={(event) => replaceBlock(index, { ...block, url: event.target.value })} className={fieldClass} placeholder="https://www.youtube.com/watch?v=…" /></div>}
              <div className="flex flex-wrap gap-2"><button type="button" aria-label={`Move block ${index + 1} up`} disabled={index === 0} onClick={() => moveBlock(index, -1)} className={buttonClass}>Move up</button><button type="button" aria-label={`Move block ${index + 1} down`} disabled={index === blocks.length - 1} onClick={() => moveBlock(index, 1)} className={buttonClass}>Move down</button><button type="button" aria-label={`Remove block ${index + 1}`} onClick={() => setBlocks((current) => current.filter((_, position) => position !== index))} className={buttonClass}>Remove</button></div>
            </fieldset>
          ))}
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setBlocks((current) => [...current, { type: "text", text: "" }])} className={buttonClass}>Add text</button><button type="button" onClick={() => setBlocks((current) => [...current, { type: "image", src: "", alt: "" }])} className={buttonClass}>Add image</button><button type="button" onClick={() => setBlocks((current) => [...current, { type: "youtube", url: "" }])} className={buttonClass}>Add YouTube video</button></div>
        </div>
        <fieldset className="space-y-2"><legend className="mb-2 text-sm font-semibold">Flairs</legend><div className="flex flex-wrap gap-2">{flairs.map((flair) => <button key={flair.id} type="button" aria-pressed={flairIds.includes(flair.id)} onClick={() => setFlairIds((current) => current.includes(flair.id) ? current.filter((id) => id !== flair.id) : [...current, flair.id])} className={flairClassName(flair.slug, flairIds.includes(flair.id))}>{flair.name}</button>)}</div></fieldset>
        <fieldset className="flex gap-4"><legend className="mb-2 text-sm font-semibold">Status</legend>{["draft", "published"].map((value) => <label key={value} className="flex items-center gap-2 text-sm"><input type="radio" name="status" value={value} checked={status === value} onChange={() => setStatus(value)} />{value === "draft" ? "Draft" : "Published"}</label>)}</fieldset>
        <button type="submit" className="rounded-md bg-[hsl(var(--color-primary))] px-6 py-3 text-sm font-semibold text-[hsl(var(--color-primary-contrast))] disabled:opacity-50">{submitting ? "Saving…" : post ? "Save changes" : status === "published" ? "Publish" : "Save draft"}</button>
      </fieldset>
    </form>
  );
}
