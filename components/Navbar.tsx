import Link from "next/link";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/professional", label: "Professional" },
  { href: "/blog", label: "Blog" },
  { href: "/subscribe", label: "Subscribe" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface)/0.85)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[hsl(var(--color-fg))]"
        >
          Vedant Bhattacharyya
        </Link>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-bg))]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

