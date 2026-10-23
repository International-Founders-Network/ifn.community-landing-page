# AGENTS.md

Guidance for coding agents (Claude Code, Antigravity, Cursor, Kimi CLI) working in `apps/qr`. Read natively by Antigravity/Cursor; Claude Code reads it via the `@AGENTS.md` import in this folder's `CLAUDE.md`.

## This app is fully independent from the root repo

`apps/qr` is a standalone codebase that may be extracted into its own git repository later. It has its own `eslint.config.js`, `tsconfig*.json`, `package.json`/lockfile, and `openspec/`. Always run commands from inside this directory (`cd apps/qr && ...`), not from the repo root — root's tooling deliberately ignores `apps/` and shouldn't be relied on here. Don't add cross-imports with the root app's `src/` or `netlify/functions/`, and don't add an npm workspaces field tying the two together.

## Spec-driven development

This app has its own OpenSpec instance at `apps/qr/openspec/`, separate from the root app's. Check `openspec/specs/` before implementing anything non-trivial; propose changes with `/opsx:propose`, implement against the delta spec's acceptance criteria, archive with `/opsx:archive`. See `../../AGENTS.md`'s "Spec-driven development" section for the full workflow — it applies here identically, just scoped to this folder's `openspec/`.

## Deployment

Deployed at **qr.ifn.community** as its own Netlify site (`ifn-qr`), independent of the root app's deploy. That site has **no linked git repo**: it is deployed manually with the Netlify CLI, so merging to `main` does not deploy it and PRs get no QR deploy preview. Run `npx netlify dev` (not plain `vite`) to exercise `/api/*` locally; `qr-create`, `qr-manage`, `qr-redirect` and the `auth-*` functions all depend on it.

Only files directly in `netlify/functions/` become functions. Shared helpers go in `netlify/functions/_lib/` (a `_db.ts` in the root used to deploy as a public function).

## Short links are admin only, and destinations are allowlisted

- Creating, viewing and editing trackable links requires an admin session: Google Sign-In on this host, `ADMIN_ALLOWED_EMAILS`, and an `ADMIN_SESSION_SECRET`-signed httpOnly SameSite=Strict cookie (`netlify/functions/_lib/auth.ts`). Every new short-link endpoint must call `requireAdmin()` before touching the body or the database. Missing env vars make it answer 503; keep it failing closed.
- The edit token in `/manage/<token>` identifies a link; it is not authorization.
- `src/lib/redirectAllowlist.ts` is the only list of allowed destinations, imported by both the UI and the functions, and enforced at create, edit and redirect time. Add hosts there, never as a pattern, and only domains the organisation actually operates. `GET /r/<code>` stays public.
- `public/_headers` carries an enforcing CSP. Anything that adds a third-party script, style, font, frame or fetch must update it, and re-verify in a browser with the console open.

## Company context

For IFN's mission/positioning/messaging, see the sibling `../../../ifn-strategy/` repo (same as the root app — see its `AGENTS.md`).
