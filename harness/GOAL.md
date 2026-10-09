# Current goal

Status: implementation complete and verified locally. Production schema deployment and Google configuration are separately documented; no production changes were made.

Extend the existing personal website with smooth scrolling, corrected photo composition, faster contours, owner access across the website, database-backed projects sharing the blog architecture, YouTube embedding, and persistent visit counters.

Acceptance criteria:

- Smooth desktop wheel scrolling without breaking touch, keyboard, forms, nested scrolling, or reduced motion.
- First and second photos swapped; no tilt; center remains largest. Desktop images show the complete source image, including faces.
- Contour animation slightly faster.
- Visible owner sign-in on every page; one persistent Google session grants owner/superuser controls throughout the website.
- Add, edit, unpublish, and delete both blogs and projects; secure every server mutation and private query.
- Shared content storage, editor, listing/detail rendering, video embedding, and metrics, with content-kind differences isolated.
- Preserve existing blog rows, URLs, flairs, and mixed media when adding the new database schema.
- Persistent site visits and per-content views, deduplicated per anonymous browsing session. No claim of identifying unique people.
- Validate migrations on an isolated database, meaningful tests, TypeScript, production build, and browser checks. Production deployment remains a separate action.
