"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { SiteMetrics } from "@/lib/analytics";

// Serialize requests so fast navigation and StrictMode cannot create multiple initial cookies.
let trackingQueue: Promise<unknown> = Promise.resolve();
const pendingRequests = new Map<string, Promise<SiteMetrics>>();
function fetchMetrics(pathname: string, isAdmin: boolean) {
  const key = `${isAdmin}:${pathname}`;
  const pending = pendingRequests.get(key);
  if (pending) return pending;
  const request = trackingQueue.catch(() => undefined).then(async () => {
    const response = await fetch("/api/stats", isAdmin ? { cache: "no-store" } : {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname }), cache: "no-store",
    });
    if (!response.ok) throw new Error("Statistics unavailable");
    const metrics: SiteMetrics = await response.json();
    window.dispatchEvent(new CustomEvent("site-metrics", { detail: metrics }));
    return metrics;
  });
  trackingQueue = request;
  pendingRequests.set(key, request);
  request.then(() => pendingRequests.delete(key), () => pendingRequests.delete(key));
  return request;
}

export function SiteStats({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [visits, setVisits] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    let active = true;
    fetchMetrics(pathname, isAdmin).then((metrics) => {
      if (active) { setVisits(metrics.visits); setUnavailable(false); }
    }).catch(() => { if (active) setUnavailable(true); });
    return () => { active = false; };
  }, [pathname, isAdmin]);
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/api")) return null;
  return (
    <section aria-label="Website statistics" className="relative z-10 mx-auto mt-16 max-w-5xl border-t border-[hsl(var(--color-border))] px-6 py-8 text-center">
      <p className="text-sm text-[hsl(var(--color-muted))]">Site visits</p>
      <p className="my-2 text-3xl font-bold tabular-nums">{unavailable ? "Unavailable" : visits === null ? "…" : visits.toLocaleString()}</p>
      <p className="text-xs text-[hsl(var(--color-muted))]">Visits count anonymous browser sessions. Blog and project views count once per session per page. A session expires after 30 minutes of inactivity.</p>
    </section>
  );
}
