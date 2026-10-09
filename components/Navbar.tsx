"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", path: "m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9" },
  { href: "/projects", label: "Projects", path: "M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" },
  { href: "/about", label: "About", path: "M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" },
  { href: "/blog", label: "Blog", path: "M12 6v15M3 3h5a4 4 0 0 1 4 3 4 4 0 0 1 4-3h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3V3Z" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg)/0.85)] backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-5xl items-center justify-center gap-4 px-6 py-4 sm:gap-8">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={`flex h-12 w-12 items-center justify-center rounded-xl border text-[hsl(var(--color-accent))] transition-colors hover:border-[hsl(var(--color-accent))] hover:bg-[hsl(var(--color-accent)/0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-bg))] ${active ? "border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent)/0.15)]" : "border-transparent"}`}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.path} />
              </svg>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
