import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow"><span /> Behind the pages</p>
        <h1 className="page-heading">Hi, I’m Vedant<span className="hero-period">.</span></h1>
        <p className="page-copy">I’m a runner with a curious mind, interested in tech, college, and the everyday moments that make life interesting.</p>
      </header>
      <section className="quiet-card space-y-4">
        <h2 className="text-2xl font-bold">A place to think out loud</h2>
        <p className="page-copy">This site brings those interests together: things I’m building, miles I’m running, and notes from along the way.</p>
        <div className="flex flex-wrap gap-6 text-sm text-[hsl(var(--color-link))]">
          <Link href="/projects">See my projects <span aria-hidden="true">↗</span></Link>
          <Link href="/blog">Read the blog <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

