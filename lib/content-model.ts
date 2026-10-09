export type ContentKind = "blog" | "project";
export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; src: string; alt?: string }
  | { type: "youtube"; url: string };

export function contentBasePath(kind: ContentKind) { return kind === "project" ? "/projects" : "/blog"; }
export function contentLabel(kind: ContentKind) { return kind === "project" ? "project" : "post"; }
export function isContentKind(value: unknown): value is ContentKind { return value === "blog" || value === "project"; }

export function getYouTubeId(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be" || host === "www.youtu.be") id = url.pathname.split("/")[1];
    else if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else if (/^\/(embed|shorts|live)\//.test(url.pathname)) id = url.pathname.split("/")[2];
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

export function isSafeImageUrl(raw: string): boolean {
  if (/^\/(?!\/)/.test(raw)) return !raw.includes("\\") && !/[\x00-\x20]/.test(raw);
  try { const url = new URL(raw); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; }
  catch { return false; }
}

export function parseContent(raw: string): ContentBlock[] {
  if (raw.length > 1_000_000) throw new Error("Content is too large.");
  let data: unknown;
  try { data = JSON.parse(raw); } catch { throw new Error("Content must be valid JSON."); }
  if (!Array.isArray(data) || data.length === 0 || data.length > 200) throw new Error("Add between 1 and 200 content blocks.");
  return data.map((value: unknown): ContentBlock => {
    if (!value || typeof value !== "object") throw new Error("Invalid content block.");
    const block = value as Record<string, unknown>;
    if (block.type === "text" && typeof block.text === "string" && block.text.trim() && block.text.length <= 30_000) return { type: "text", text: block.text };
    if (block.type === "image" && typeof block.src === "string" && block.src.length <= 2048 && isSafeImageUrl(block.src) && (block.alt === undefined || (typeof block.alt === "string" && block.alt.length <= 1000))) return { type: "image", src: block.src, ...(typeof block.alt === "string" ? { alt: block.alt } : {}) };
    if (block.type === "youtube" && typeof block.url === "string" && block.url.length <= 2048 && getYouTubeId(block.url)) return { type: "youtube", url: block.url };
    throw new Error("Use nonempty text, a valid image URL, or a valid YouTube URL.");
  });
}

export function slugify(title: string) { return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "") || "untitled"; }
export function extractPlaintext(content: ContentBlock[]) { return content.filter((block) => block.type === "text").map((block) => block.text).join("\n"); }
export function estimateReadingTime(text: string) { return Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 238)); }
