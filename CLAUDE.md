# CLAUDE.md

Guidance for Claude Code (and other spec-driven agentic CLIs, e.g. Kimi CLI) working in this repo.

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

## Database schema is intentionally defined twice

`db/migrations/*.sql` is the documented schema history. Each Netlify Function also runs its own `CREATE TABLE IF NOT EXISTS` at request time (idempotent, so the app works even against an empty database). These two can drift silently — if you change a table's shape, update both, or at least check `db/README.md` for the current convention before assuming one is authoritative.

## Testing

`npm test` runs Vitest against `netlify/functions/**/*.test.ts` — validation logic and the admin auth (session sign/verify, allowlist revocation) are covered; page components are not (see `openspec/specs/*` non-goals for why each was or wasn't tested). `apps/qr` doesn't have its own test setup yet.
