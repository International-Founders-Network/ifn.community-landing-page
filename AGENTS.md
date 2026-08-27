# AGENTS.md

Guidance for coding agents (Claude Code, Antigravity, Cursor, Kimi CLI, or anything else reading this file) working in this repo. This is the canonical instructions file, read natively by Antigravity and Cursor; Claude Code reads it via the `@AGENTS.md` import in `CLAUDE.md`.

## Company strategy and context

For IFN's mission, positioning, messaging, event playbook, and governance (bylaws, board minutes), see the sibling **`../ifn-strategy/`** repo, a separate private repo, not part of this one. Check there before writing marketing copy or making decisions that touch positioning; this repo's `BACKLOG.md`/`openspec/specs/` cover product/engineering work only. Legal filings, financial records, and banking live in Google Drive, not in either git repo. See `ifn-strategy/README.md` for the map.

## Spec-driven development

This repo uses [OpenSpec](https://github.com/Fission-AI/OpenSpec). Before implementing any non-trivial change:

1. Check `openspec/specs/` for an existing capability spec covering the area you're touching.
2. Propose new work with `/opsx:propose` (or the equivalent `openspec-propose` skill). It scaffolds a proposal, design, delta spec, and task list under `openspec/changes/<name>/` before any code is written.
3. Implement against the acceptance criteria in the delta spec.
4. Archive the change (`/opsx:archive` or `openspec archive <name>`) once done. This merges the delta into `openspec/specs/` and moves the change to `openspec/changes/archive/` as a permanent historical record. Specs are never deleted after shipping.

`BACKLOG.md` is an index into these specs, not a spec itself: it links each open item to the capability spec that documents its current behavior and known gaps.

**`apps/qr` has its own, separate OpenSpec instance** at `apps/qr/openspec/`. See below.

## `apps/qr` is a fully independent app

`apps/qr` (the QR code generator, deployed at `qr.ifn.community`) is treated as a standalone codebase that may be extracted into its own git repository later. It has its own `eslint.config.js`, `tsconfig*.json`, `package.json`/lockfile, and `openspec/`, and root tooling does not reach into it (root's `eslint.config.js` explicitly ignores `apps/`). Do not add cross-imports between `apps/qr` and the root `src/`, and do not add an npm workspaces field tying them together. That coupling is deliberately avoided so extraction later requires no untangling.

Working in `apps/qr`: `cd apps/qr && npm run lint && npm run build`. Verify independently, not via root's scripts.

## Deployment

**Production is Netlify**, deployed via Netlify's own git integration (configured in Netlify's dashboard, outside this repo). `.github/workflows/ci.yml` is verification-only (lint, typecheck, test) and it does not deploy anything. There used to be a `.github/workflows/deploy.yml` publishing to GitHub Pages; it was removed because it was serving a live but unlinked decoy at the repo's `github.io` URL where every form/API call would silently fail (GitHub Pages can't run Netlify Functions). Don't reintroduce a GitHub Actions deploy step without checking this is still true.

To exercise `/api/*` endpoints locally (root or `apps/qr`), run `npx netlify dev`, not plain `vite`/`npm run dev`, because the latter won't serve the Netlify Functions.

### Netlify Free plan blocks deploys by GIT PUSHER identity

The IFN Netlify account is on the **Free** plan with strict contributor
verification enabled. It blocks private-repo deploys before the build starts:

> Build blocked: Unrecognized Git contributor. This plan allows only verified
> account members to push to private repos.

**Netlify matches on the GitHub account that PUSHED, not on the commit's
author/committer email.** An earlier commit in this repo claimed the fix was
stamping `venkat@ifn.community` into both fields. That is wrong, and the deploy
data disproves it: three failed deploys spanning pre- and post-rewrite commits
carry byte-identical `error_message` and `strict_contributor_verification_failure:
true`. Netlify recorded `committer: venkatvellaichamy` (the pushing account) even
for an older commit whose email was `...@Venkats-MacBook-Pro-2.local`.

**Do not try to fix this by rewriting commit authorship. It cannot work.**

The fix is in the Netlify dashboard, not the repo: Team settings -> Members ->
link a **Git identity** to the team member, attaching the GitHub account that
actually pushes. As of this writing the sole team member has only a Google
identity connected (`connected_accounts: {google: venkat@ifn.community}`) and no
GitHub identity, so no push can ever be recognised.

**How to recognise this failure:** four red checks (`Header rules`, `Pages
changed`, `Redirect rules`, `netlify deploy-preview`) while `CI / verify` passes,
AND no build log exists. Confirm with:

```sh
npx netlify api getDeploy --data '{"deploy_id":"<id>"}'   # state=error, deploy_time=null
```

A 404 from the deploy's `/log` endpoint plus a lifespan of ~2 seconds means no
build ran, so the cause is never in the code. A real build failure posts a
`pending` status first and runs for 30-60s.

### The live `events` rows can contradict the deployed copy

**Check this after any deploy that touches events or venue wording.** A stale
venue in Postgres is invisible locally, invisible in CI, and invisible in every
test, because `netlify/functions/events.ts` serves the bundled
`src/data/events.json` ONLY when the table has zero rows. On a database with
rows, the JSON snapshot is never consulted, so the deployed page can say one
venue in its copy and a different one in the event feed right beneath it.

The founder reported on 2026-08-10 that this is the live state: every other
surface says Station Austin while the Postgres rows still say Capital Factory,
and the fix below has not been applied. That was not verified from this repo,
because nothing here connects to a production database. Do not trust the date.
Run the check instead:

```sh
curl -s https://ifn.community/api/events | grep -o 'Capital Factory[^"]*' | sort -u
```

No output is healthy. Any output means the live feed contradicts the page.

Fix it with `db/migrations/02_event_venue_station_austin.sql`, applied through
its runner. Preview is the default and writes nothing:

```sh
DATABASE_URL='<connection string>' node scripts/fix-event-venue.mjs
DATABASE_URL='<connection string>' node scripts/fix-event-venue.mjs --apply
```

No connection string lives in this repo. The deployed functions read
`NETLIFY_DATABASE_URL`; the runner accepts either variable name. The update
matches two exact old strings and writes a third, so running it twice is
harmless, and any Capital Factory variant it does not recognise is reported
rather than silently rewritten.

One caveat worth knowing before you call it done: `scripts/update-events.js`
regenerates `src/data/events.json` from Luma's `geo_address_info.full_address`.
If the Luma event records themselves still say Capital Factory, the next sync
writes it back into the JSON and the contradiction returns from the other
direction. Correct the venue in Luma as well as in the database.

## The site is prerendered. Do not treat it as a pure SPA any more

`npm run build` is now `tsc -b && vite build && node scripts/prerender.mjs`. The
last step drives a real headless Chrome over the built output and writes
`dist/<route>/index.html` for each of the eleven indexable routes. This exists
because every URL previously returned the same 3.3 KB empty `<div id="root">`,
which Google renders but GPTBot, ClaudeBot, PerplexityBot, CCBot and every
social unfurler do not.

Consequences worth knowing before you change anything here:

- **`src/data/seo.ts` is the source of truth for routes.** Adding a `<Route>` in
  `App.tsx` without adding a `ROUTE_SEO` entry means the page is not
  prerendered, not in `sitemap.xml`, and not in `llms.txt`. The sitemap and the
  prerender list are both generated from that one table by the `ifn-seo-assets`
  plugin in `vite.config.ts`, so they cannot drift from each other — but they
  can drift from `App.tsx`, and nothing catches that automatically.
- **`src/components/Head.tsx` is the ONLY writer of title, description,
  canonical, `og:*` and JSON-LD.** The duplicate head-management effects that
  used to live in `ComingSoon.tsx` and `Admin.tsx` were removed. A second writer
  breaks Head's ability to remove a stale `noindex` on client-side navigation.
- **The build needs Chrome.** `netlify.toml` runs
  `npx puppeteer browsers install chrome` before the build and pins
  `PUPPETEER_CACHE_DIR` so the download is cached between deploys. Locally, run
  it once if the prerender fails to launch.
- **A failed route fails the build, on purpose.** A route that does not
  prerender falls back to the empty shell, which is exactly the state this
  machinery exists to eliminate, and it would do so silently.

### The catch-all returns 404 now, and the order of that change mattered

`netlify.toml`'s `/*` rule is `status = 404`, not `200`. Previously every
nonexistent URL — and every missing asset — answered 200 with the HTML shell.
The six placeholder routes and `/admin` are listed as explicit `status = 200`
rewrites **before** the catch-all, because they are not prerendered and would
otherwise answer 404 while rendering fine.

`public/_headers` sets `immutable` caching on `/assets/*` and `/fonts/*`. **That
file could not safely exist until the soft-404 was fixed.** While the catch-all
returned 200, a stale hashed chunk request got an HTML body with a 200; marking
that `immutable` would have pinned an HTML document at a `.js` URL for a year
with no revalidation and no recovery short of clearing site data. If you ever
revert the catch-all to 200, delete `public/_headers` in the same commit.

### robots.txt no longer disallows anything, and that is the fix

`Disallow:` and `X-Robots-Tag: noindex` on the same path cancel each other out:
a compliant crawler never fetches a disallowed URL, so it never reads the
noindex, and the page can be indexed as a URL-only result that nothing can then
remove. Crawling is allowed everywhere so the noindex headers in `netlify.toml`
can actually be obeyed. `/admin` access control was never robots.txt's job and
is unaffected.

### Event JSON-LD is deliberately absent

`src/data/structuredData.ts` emits Organization, WebSite, WebPage, BreadcrumbList,
Offer and FAQPage — but no `Event`, which would be the most valuable type on an
events-driven site. `src/data/events.json` is regenerated from Luma by
`.github/workflows/sync-events.yml` on the 1st and 15th, and Luma still says
Capital Factory while the site says Station Austin. `scripts/update-events.js`
now rewrites the two known-stale venue strings on the way in, but that is a
stopgap: **fix the venue on the Luma records**, then add Event markup. Marking
up a venue that contradicts the rendered page is a structured-data policy
violation, not merely untidy.

## Database schema is intentionally defined twice

`db/migrations/*.sql` is the documented schema history. Each Netlify Function also runs its own `CREATE TABLE IF NOT EXISTS` at request time (idempotent, so the app works even against an empty database). These two can drift silently, so if you change a table's shape, update both, or at least check `db/README.md` for the current convention before assuming one is authoritative.

## Testing

`npm test` runs Vitest against `netlify/tests/**/*.test.ts`.

**Tests must NOT live inside `netlify/functions/`.** Netlify treats every file in
the functions directory as a function, and a name containing a dot
(`contact.test`) fails its "alphanumeric characters, hyphen & underscores" rule.
That blocks the entire deploy with `Incorrect function names`, while `CI / verify`
passes because Vitest does not care where the files sit. Keep tests in
`netlify/tests/`. Validation logic and the admin auth (session sign/verify, allowlist revocation) are covered; page components are not (see `openspec/specs/*` non-goals for why each was or wasn't tested). `apps/qr` doesn't have its own test setup yet.
