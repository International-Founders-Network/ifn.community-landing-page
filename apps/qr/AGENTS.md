# AGENTS.md

Guidance for coding agents (Claude Code, Antigravity, Cursor, Kimi CLI) working in `apps/qr`. Read natively by Antigravity/Cursor; Claude Code reads it via the `@AGENTS.md` import in this folder's `CLAUDE.md`.

## This app is fully independent from the root repo

`apps/qr` is a standalone codebase that may be extracted into its own git repository later. It has its own `eslint.config.js`, `tsconfig*.json`, `package.json`/lockfile, and `openspec/`. Always run commands from inside this directory (`cd apps/qr && ...`), not from the repo root — root's tooling deliberately ignores `apps/` and shouldn't be relied on here. Don't add cross-imports with the root app's `src/` or `netlify/functions/`, and don't add an npm workspaces field tying the two together.

## Spec-driven development

This app has its own OpenSpec instance at `apps/qr/openspec/`, separate from the root app's. Check `openspec/specs/` before implementing anything non-trivial; propose changes with `/opsx:propose`, implement against the delta spec's acceptance criteria, archive with `/opsx:archive`. See `../../AGENTS.md`'s "Spec-driven development" section for the full workflow — it applies here identically, just scoped to this folder's `openspec/`.

## Deployment

Deployed at **qr.ifn.community** via Netlify's own git integration, independent of the root app's deploy. Run `npx netlify dev` (not plain `vite`) to exercise `/api/*` locally — `qr-create`, `qr-manage`, `qr-redirect` all depend on it.

## Company context

For IFN's mission/positioning/messaging, see the sibling `../../../ifn-strategy/` repo (same as the root app — see its `AGENTS.md`).
