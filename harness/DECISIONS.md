# Architectural decisions

- **Keep the current Next.js App Router app.** Existing admin, authentication, Prisma posts, subscriptions, and server actions remain the functional foundation.
- **Use global HSL tokens for the dark palette.** Existing components already consume these tokens; one shared palette keeps all routes consistent.
- **Use a `/projects` route.** Navigation reflects the requested project page; preserve `/professional` compatibility with a redirect.
- **Use inline SVG navigation icons.** Accessible labels convey meaning while the visible dock contains icons only; no icon package is needed.
- **Preserve source photos.** Next.js static image imports optimize the supplied photos; CSS grayscale and wine overlays provide reversible coloring without altering faces or source files.
- **Separate ambient effects from page content.** A small client component owns pointer tracking and decorative SVG contours; pages stay server rendered. Effects ignore pointer events and respect reduced motion.
- **Centralize flair colors by slug.** One palette gives the same category the same color in public and admin views. Unknown categories retain a neutral gray fallback.
- **Keep the harness file based.** Markdown records the goal, roadmap, progress, bugs, and decisions without introducing runtime dependencies.
