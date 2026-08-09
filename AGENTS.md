# AGENTS.md

Guidance for coding agents (Claude Code, Antigravity, Cursor, Kimi CLI, or anything else reading this file) working in this repo. This is the canonical instructions file — read natively by Antigravity and Cursor; Claude Code reads it via the `@AGENTS.md` import in `CLAUDE.md`.

## Company strategy and context

For IFN's mission, positioning, messaging, event playbook, and governance (bylaws, board minutes), see the sibling **`../ifn-strategy/`** repo — a separate private repo, not part of this one. Check there before writing marketing copy or making decisions that touch positioning; this repo's `BACKLOG.md`/`openspec/specs/` cover product/engineering work only. Legal filings, financial records, and banking live in Google Drive, not in either git repo — see `ifn-strategy/README.md` for the map.

## Spec-driven development

This repo uses [OpenSpec](https://github.com/Fission-AI/OpenSpec). Before implementing any non-trivial change:

1. Check `openspec/specs/` for an existing capability spec covering the area you're touching.
2. Propose new work with `/opsx:propose` (or the equivalent `openspec-propose` skill) — it scaffolds a proposal, design, delta spec, and task list under `openspec/changes/<name>/` before any code is written.
3. Implement against the acceptance criteria in the delta spec.
4. Archive the change (`/opsx:archive` or `openspec archive <name>`) once done — this merges the delta into `openspec/specs/` and moves the change to `openspec/changes/archive/` as a permanent historical record. Specs are never deleted after shipping.

`BACKLOG.md` is an index into these specs, not a spec itself — it links each open item to the capability spec that documents its current behavior and known gaps.

**`apps/qr` has its own, separate OpenSpec instance** at `apps/qr/openspec/` — see below.

## `apps/qr` is a fully independent app

`apps/qr` (the QR code generator, deployed at `qr.ifn.community`) is treated as a standalone codebase that may be extracted into its own git repository later. It has its own `eslint.config.js`, `tsconfig*.json`, `package.json`/lockfile, and `openspec/` — root tooling does not reach into it (root's `eslint.config.js` explicitly ignores `apps/`). Do not add cross-imports between `apps/qr` and the root `src/`, and do not add an npm workspaces field tying them together — that coupling is deliberately avoided so extraction later requires no untangling.

Working in `apps/qr`: `cd apps/qr && npm run lint && npm run build` — verify independently, not via root's scripts.

## Deployment

**Production is Netlify**, deployed via Netlify's own git integration (configured in Netlify's dashboard, outside this repo). `.github/workflows/ci.yml` is verification-only (lint, typecheck, test) — it does not deploy anything. There used to be a `.github/workflows/deploy.yml` publishing to GitHub Pages; it was removed because it was serving a live but unlinked decoy at the repo's `github.io` URL where every form/API call would silently fail (GitHub Pages can't run Netlify Functions). Don't reintroduce a GitHub Actions deploy step without checking this is still true.

To exercise `/api/*` endpoints locally (root or `apps/qr`), run `npx netlify dev`, not plain `vite`/`npm run dev` — the latter won't serve the Netlify Functions.

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

## Database schema is intentionally defined twice

`db/migrations/*.sql` is the documented schema history. Each Netlify Function also runs its own `CREATE TABLE IF NOT EXISTS` at request time (idempotent, so the app works even against an empty database). These two can drift silently — if you change a table's shape, update both, or at least check `db/README.md` for the current convention before assuming one is authoritative.

## Testing

`npm test` runs Vitest against `netlify/tests/**/*.test.ts`.

**Tests must NOT live inside `netlify/functions/`.** Netlify treats every file in
the functions directory as a function, and a name containing a dot
(`contact.test`) fails its "alphanumeric characters, hyphen & underscores" rule.
That blocks the entire deploy with `Incorrect function names`, while `CI / verify`
passes because Vitest does not care where the files sit. Keep tests in
`netlify/tests/` — validation logic and the admin auth (session sign/verify, allowlist revocation) are covered; page components are not (see `openspec/specs/*` non-goals for why each was or wasn't tested). `apps/qr` doesn't have its own test setup yet.
