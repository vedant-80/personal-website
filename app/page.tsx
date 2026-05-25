import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-[hsl(var(--color-border))] bg-[linear-gradient(135deg,hsl(var(--color-primary)/0.20),hsl(var(--color-accent)/0.20))] p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Placeholder headline</h1>
        <p className="mt-3 max-w-2xl text-[hsl(var(--color-muted))]">
          Placeholder intro text describing experiences, aspirations, and ideas.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/professional"
            className="inline-flex h-11 items-center rounded-md bg-[hsl(var(--color-primary))] px-4 text-sm font-semibold text-[hsl(var(--color-primary-contrast))] hover:bg-[hsl(var(--color-accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-bg))]"
          >
            View Professional
          </Link>
          <Link
            href="/blog"
            className="inline-flex h-11 items-center rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 text-sm font-semibold text-[hsl(var(--color-fg))] hover:bg-[hsl(var(--color-bg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-bg))]"
          >
            Read Blog
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          { href: "/about", title: "About", desc: "Placeholder blurb for About." },
          { href: "/professional", title: "Professional", desc: "Placeholder blurb for Professional." },
          { href: "/blog", title: "Blog", desc: "Placeholder blurb for Blog." },
          { href: "/subscribe", title: "Subscribe", desc: "Placeholder blurb for Subscribe." },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-6 shadow-[0_2px_8px_hsl(0_0%_0%/0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-bg))]"
          >
            <div className="text-lg font-semibold">{card.title}</div>
            <div className="mt-2 text-sm text-[hsl(var(--color-muted))]">{card.desc}</div>
          </Link>
        ))}
      </section>
    </div>
  );
}

