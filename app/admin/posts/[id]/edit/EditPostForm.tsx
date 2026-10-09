"use client";
import { ContentEditor, type EditorPost, type EditorFlair } from "@/components/content/ContentEditor";
export function EditPostForm({ post, flairs }: { post: EditorPost; flairs: EditorFlair[] }) {
  return <ContentEditor post={post} flairs={flairs} />;
}
