"use client";

import { useEffect, useState } from "react";
import type { SiteMetrics } from "@/lib/analytics";

export function ViewCount({ contentId, initialCount }: { contentId: string; initialCount: number }) {
  const [views, setViews] = useState(initialCount);
  useEffect(() => {
    setViews(initialCount);
    const listener = (event: Event) => {
      const metrics = (event as CustomEvent<SiteMetrics>).detail;
      if (metrics.contentId === contentId && typeof metrics.views === "number") setViews(metrics.views);
    };
    window.addEventListener("site-metrics", listener);
    return () => window.removeEventListener("site-metrics", listener);
  }, [contentId, initialCount]);
  return <span title="Views count once per anonymous browser session">{views.toLocaleString()} {views === 1 ? "view" : "views"}</span>;
}
