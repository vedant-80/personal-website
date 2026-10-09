const flairColors: Record<string, string> = {
  life: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  technical: "border-blue-400/40 bg-blue-400/10 text-blue-300",
  running: "border-red-400/40 bg-red-400/10 text-red-300",
  college: "border-amber-400/40 bg-amber-400/10 text-amber-300",
};

export function flairClassName(slug: string, selected = false) {
  const normalizedSlug = slug.trim().toLowerCase();
  const color = Object.hasOwn(flairColors, normalizedSlug)
    ? flairColors[normalizedSlug]
    : "border-zinc-400/40 bg-zinc-400/10 text-zinc-300";

  return `inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${color}${
    selected ? " ring-2 ring-current ring-offset-2 ring-offset-black" : ""
  }`;
}

export function FlairBadge({ name, slug }: { name: string; slug: string }) {
  return <span className={flairClassName(slug)}>{name}</span>;
}
