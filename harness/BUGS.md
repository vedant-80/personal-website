# Running bug list

## Open

- **ENV-001 — Prisma migrate deploy has no datasource URL.** User reported the error; only `.env.example` exists in the inspected checkout. Set DATABASE_URL via root `.env` or exported shell environment to the intended Supabase connection. Resolution awaits a successful migration run; do not treat local guidance as production verification.

- **AUTH-001 — Google OAuth redirect mismatch.** Preferred production callback: `https://www.vedantb.app/api/auth/callback/google`. Register that exact authorized redirect URI on the Google OAuth client matching Vercel's `AUTH_GOOGLE_ID`. External configuration; resolution has not been verified. Authentication is still restricted to `ADMIN_EMAIL`.

- **DEPLOY-001 — New shared content/metrics schema is not yet applied to production.** Local migration and upgrade checks pass; production configuration was not accessed. Run `npm run prisma:migrate:deploy` against the deployment database before deploying the new application. See DEPLOYMENT.md.

## Resolved

- **CONTENT-002 — Projects were hardcoded and not editable.** Shared database-backed blog/project model, listings/details, and CRUD editor now support both kinds, including YouTube blocks.
- **AUTH-002 — No discoverable owner access across public routes.** Added visible sign-in, persistent owner session, global toolbar, collection/detail controls, and shared server authorization. One real signed test session works across all website sections; non-owners are denied.
- **LAYOUT-002 — Tilt and desktop face cropping.** Swapped first/second images, removed tilt, kept center largest, and switched desktop images to contain; four viewport checks pass.
- **METRICS-001 — Stats rejected the actual host after Next.js URL normalization.** Compare browser origin with the incoming Host and validated protocol; actual-host and HTTPS proxy regression tests pass, as do real counter checks.

- **CONTENT-001 — Public page placeholders.** Replaced home, about, and projects placeholder text with concise copy grounded in the requested topics and actual website. Additional project descriptions and an expanded biography remain optional content follow-up.
- **LAYOUT-001 — Hero photos extend beyond short desktop viewport.** Added compact hero sizing below 800px viewport height. Browser checks show all three complete photo figures visible at 1280×720 and 1440×900, as well as 390×844 and 320×700 mobile sizes.
- **REPO-001 — Generated dependencies/build artifacts appear as untracked files.** Added `.gitignore` for `node_modules/`, `.next/`, build/test output, local environment files, and photo Zone.Identifier metadata.
- **BUILD-001 — Admin `post` implicitly has type `any`.** Generate Prisma Client before the Next.js build so schema-derived query types exist. Production build verified before redesign.
- **BUILD-002 — Email test assigns read-only `NODE_ENV`.** Replace the test environment object rather than assigning that property. Tests and build verified before redesign.

Add newly discovered bugs here with reproduction, impact, and verification status. Do not mark external configuration resolved without evidence.
