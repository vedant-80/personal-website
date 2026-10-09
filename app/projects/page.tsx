import Link from "next/link";

export default function ProjectsPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow"><span /> Things I’m building</p>
        <h1 className="page-heading">Projects<span className="hero-period">.</span></h1>
        <p className="page-copy">A home for experiments, ideas, and the things I learn by making them.</p>
      </header>
      <section className="quiet-card space-y-4">
        <p className="eyebrow">01 / Personal website</p>
        <h2 className="text-2xl font-bold">This corner of the internet</h2>
        <p className="page-copy">A place to share projects and write about tech, college, running, and life.</p>
        <Link href="/blog" className="inline-block text-sm text-[hsl(var(--color-link))]">Explore the blog <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}
