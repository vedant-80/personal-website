# Architectural decisions

- **Keep the current Next.js App Router app.** Existing admin, authentication, Prisma posts, subscriptions, and server actions remain the functional foundation.
- **Use global HSL tokens for the dark palette.** Existing components already consume these tokens; one shared palette keeps all routes consistent.
- **Use a `/projects` route.** Navigation reflects the requested project page; preserve `/professional` compatibility with a redirect.
- **Use inline SVG navigation icons.** Accessible labels convey meaning while the visible dock contains icons only; no icon package is needed.
- **Preserve source photos.** Next.js static image imports optimize the supplied photos; CSS grayscale and wine overlays provide reversible coloring without altering faces or source files.
- **Separate ambient effects from page content.** A small client component owns pointer tracking and decorative SVG contours; pages stay server rendered. Effects ignore pointer events and respect reduced motion.
- **Centralize flair colors by slug.** One palette gives the same category the same color in public and admin views. Unknown categories retain a neutral gray fallback.
- **Keep the harness file based.** Markdown records the goal, roadmap, progress, bugs, and decisions without introducing runtime dependencies.

## Shared content and owner access extension

- **Extend the existing Post model instead of duplicating projects.** A default-blog content kind keeps all existing records intact and allows both kinds to share validated CRUD, editor blocks, public listing/detail components, flairs, and counters. Existing slugs stay globally unique; new slug collisions receive a suffix.
- **Preserve mixed content when editing.** The shared block editor handles text, images, and YouTube videos without flattening old JSON to paragraphs. YouTube IDs are validated on the server and embedded using youtube-nocookie.com. Raw iframe HTML is not accepted.
- **Use a persistent owner session throughout the app.** Ownership is determined server-side by verified Google email and ADMIN_EMAIL, backed by a 30-day JWT session. Root layout reads the session per request; the owner toolbar and mutation/private-query authorization share the same guard. No self-promotion endpoint is introduced.
- **Use transactional updates.** Existing content and flair replacements commit together; projects never send blog-subscriber notifications.
- **Persist anonymous session metrics in PostgreSQL.** Unique visitor-hash/target events and rollups commit in the same transaction. Requests are serialized on the client before the first cookie exists. Metrics describe sessions/views rather than unique people; owner browsing is read-only.
- **Keep smooth scrolling compatible with native inputs.** A small rAF wheel-easing component bypasses touch, editable fields, nested scrollers, zoom gestures, keyboard scrolling, and reduced motion.
- **Show complete source photos on desktop.** Photos are portrait/athlete/track, unrotated, with the athlete frame largest. Desktop uses contain; mobile retains cover framing. Contour drift is now 18 seconds.
- **Deploy schema separately and explicitly.** The checked-in additive migration is validated locally; production migration/deployment is not executed implicitly during editing.

- **Preferred production origin is https://www.vedantb.app.** Use it for Auth.js and generated site links; Supabase remains the same database backend. External Vercel/Google settings must be configured separately and have not been verified.
