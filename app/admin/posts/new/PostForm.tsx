"use client";
import { ContentEditor, type EditorFlair } from "@/components/content/ContentEditor";
import type { ContentKind } from "@/lib/content-model";
export function PostForm({ flairs, kind = "blog" }: { flairs: EditorFlair[]; kind?: ContentKind }) {
  return <ContentEditor flairs={flairs} kind={kind} />;
}
