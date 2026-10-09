# Current verification evidence

## Production build

`npm run build` passed after the integrated shared content, owner toolbar, and stats origin fix. Prisma generation, compilation, TypeScript, and dynamic routes succeeded. Root layout explicitly uses dynamic rendering so signed-in owner controls are never cached as public HTML and build-time rendering does not query an unconfigured database.

## Isolated database upgrade

Started a temporary PostgreSQL 16 container on localhost port 55432, with no production database access. Applied the original migration, inserted a legacy published blog containing text and an image, then applied the new additive migration with Prisma Migrate.

Verified the record retained its ID, slug, mixed-media JSON, and default blog kind, with viewCount initially zero. `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code` reported no difference. Fixtures were used only in the isolated database.

## Real browser and server-action checks

Used installed headless Chrome with actual viewport emulation against the built application and the temporary database.

- 1440×900, 1280×720, 390×844, and 320×700: no horizontal overflow; all three photo figures initially visible; portrait/athlete/track order; no tilt; center frame widest/tallest.
- Desktop photo computed object-fit is contain for every photo; source images are not cropped. Mobile retains cover framing.
- Contour animation computes to 18 seconds; reduced-motion animation computes to none.
- Public pages contain an Admin sign in button. Public project detail embeds the validated YouTube ID using youtube-nocookie.com and omits owner controls.
- A valid signed JWT for a non-owner account is redirected away from admin. One valid signed owner session exposes global controls across home, projects, blog, and admin without page-specific authentication.
- Real browser form submissions created a published project containing text and video, updated its title while preserving the video, and deleted it with confirmation. A legacy blog edit retained its original image block and slug.
- Twenty-four concurrent repeated HTTP visits to the same project with one session cookie incremented the site and content counters once. Invalid/private/draft/missing/wrong-kind/cross-origin requests were excluded. The real test database persisted the counts.
- Browser testing caught and fixed a real request-origin regression caused by Next.js localhost normalization; new tests cover actual Host and HTTPS proxy protocol handling.

## Automated checks

The full test suite and TypeScript/build checks cover owner guards, safe login returns, authorization before database access, published/kind filtering, transaction/flair replacement, unsafe media rejection, project email exclusion, mixed-media editor preservation, failure/retry handling, counter deduplication, client request serialization, global stats, smooth scrolling, cursor preferences and cleanup, and navigation/filter behavior.

Final test totals are recorded in PROGRESS.md. `git diff --check` passes.

## Limits and production steps

Google itself was not contacted for OAuth in integration testing; signed test sessions exercised the actual application's session and authorization logic. The production Google callback registration and production database migration state remain unverified. No production database, commit, or deployment was changed. Apply the migration to the deployment's database before releasing this code; see DEPLOYMENT.md.

Headless Chrome reports no fine pointer, so desktop wheel easing and cursor tracking are verified with controlled media/rAF component tests. Native touch, zoom, editable fields, nested scrollers, keyboard interruption, and reduced motion are covered there.
