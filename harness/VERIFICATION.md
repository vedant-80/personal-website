# Verification evidence

## Production build

`npm run build` passed after the final hero sizing changes. Prisma Client generation, compilation, TypeScript, and static page generation all succeeded. `/projects` is present in the route output; authenticated and database routes remain dynamic.

Next.js needs a local port for its build worker in this environment, so the production build ran with approved sandbox escalation.

## Automated checks

`npm test -- --runInBand`: six suites, 27 tests passed.

`tsc --noEmit --incremental false`: passed after the additional ambient-effect tests were added.

`git diff --check`: passed.

## Browser checks

Used installed headless Chrome against a temporary local production server, with actual DevTools viewport emulation. Verified all three source images load, there are exactly four navigation links, there is no horizontal overflow, and complete photo figures appear in the initial viewport at:

| Viewport | Result |
| --- | --- |
| 1440×900 desktop | Passed |
| 1280×720 short desktop | Passed |
| 390×844 mobile | Passed |
| 320×700 small mobile | Passed |

Verified `/projects` and `/about` render with the correct active navigation item, and `/professional` redirects to `/projects`.

With reduced motion enabled, the contour animation computes to `none` and the cursor glow computes to `display: none`.

## Cursor behavior

Installed headless Chrome reports no fine pointer, including in a fresh desktop target; the glow correctly remains disabled there. Component tests use controlled media-query and animation-frame mocks to verify the fine-pointer path, coalesced updates, touch/coarse-pointer suppression, reduced motion, preference changes, leaving/blur, and cleanup. Real mouse hardware was not available in this environment.

## Limits

Google OAuth settings were not changed. Sign-in requires the registered redirect URI and matching `ADMIN_EMAIL`. Database-backed blog/admin interactions were not exercised against a live database. Existing queries and server actions were preserved; filter interaction tests verify topic selection behavior.
