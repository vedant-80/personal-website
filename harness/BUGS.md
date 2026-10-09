# Running bug list

## Open

- **AUTH-001 — Google OAuth redirect mismatch.** Reported callback: `https://personal-website-taupe-tau-36.vercel.app/api/auth/callback/google`. Register that exact authorized redirect URI on the Google OAuth client matching Vercel's `AUTH_GOOGLE_ID`. External configuration; resolution has not been verified. Authentication is still restricted to `ADMIN_EMAIL`.

## Resolved

- **CONTENT-001 — Public page placeholders.** Replaced home, about, and projects placeholder text with concise copy grounded in the requested topics and actual website. Additional project descriptions and an expanded biography remain optional content follow-up.
- **LAYOUT-001 — Hero photos extend beyond short desktop viewport.** Added compact hero sizing below 800px viewport height. Browser checks show all three complete photo figures visible at 1280×720 and 1440×900, as well as 390×844 and 320×700 mobile sizes.
- **REPO-001 — Generated dependencies/build artifacts appear as untracked files.** Added `.gitignore` for `node_modules/`, `.next/`, build/test output, local environment files, and photo Zone.Identifier metadata.
- **BUILD-001 — Admin `post` implicitly has type `any`.** Generate Prisma Client before the Next.js build so schema-derived query types exist. Production build verified before redesign.
- **BUILD-002 — Email test assigns read-only `NODE_ENV`.** Replace the test environment object rather than assigning that property. Tests and build verified before redesign.

Add newly discovered bugs here with reproduction, impact, and verification status. Do not mark external configuration resolved without evidence.
