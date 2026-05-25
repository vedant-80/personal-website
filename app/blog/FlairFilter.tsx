"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Flair {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  flairs: Flair[];
  activeSlugs: string[];
}

export function FlairFilter({ flairs, activeSlugs }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggleFlair = useCallback(
    (slug: string) => {
      const current = new Set(activeSlugs);
      if (current.has(slug)) {
        current.delete(slug);
      } else {
        current.add(slug);
      }

      const params = new URLSearchParams(searchParams.toString());
      if (current.size > 0) {
        params.set("topic", Array.from(current).join(","));
      } else {
        params.delete("topic");
      }

      router.push(`/blog${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [activeSlugs, router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/blog");
  }, [router]);

  return (
    <section className="rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Filters</div>
        {activeSlugs.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-[hsl(var(--color-link))] hover:text-[hsl(var(--color-link-hover))]"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {flairs.map((flair) => {
          const isActive = activeSlugs.includes(flair.slug);
          return (
            <button
              key={flair.id}
              onClick={() => toggleFlair(flair.slug)}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
                isActive
                  ? "border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-contrast))]"
                  : "border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] text-[hsl(var(--color-fg))] hover:border-[hsl(var(--color-primary)/0.5)]"
              }`}
            >
              {flair.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
