# IFN QR

A free QR code generator for International Founders Network — single and bulk generation, on-brand styling, and optional "dynamic" (trackable, re-pointable) short links. Deployed at **qr.ifn.community**.

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Netlify Functions (Serverless)
- **Database**: Neon (Postgres)
- **QR rendering**: [`qr-code-styling`](https://www.npmjs.com/package/qr-code-styling)
- **Spec-driven development**: [OpenSpec](https://github.com/Fission-AI/OpenSpec)

## 🧩 Independence from the root app

This app is **fully independent** of the `ifn.community` root app it lives alongside in this monorepo, on purpose — it may be extracted into its own git repository in the future, and that extraction should require no untangling:

- Its own `package.json` / lockfile — no npm workspaces tying it to root.
- Its own `eslint.config.js` and `tsconfig*.json` — root's tooling explicitly ignores `apps/` and never lints or typechecks this directory.
- Its own `openspec/` — see below. Not part of the root app's `openspec/`.
- No cross-imports with the root app's `src/` or `netlify/functions/`.

If you're working in this directory, always run its scripts *from here* (`cd apps/qr && ...`), not from the repo root.

## 🛠️ Project Structure

```bash
apps/qr/
├── netlify/
│   ├── functions/     # qr-create, qr-manage, qr-redirect, auth-google/-me/-logout
│   │   └── _lib/      # auth, db, http helpers (not deployed as functions)
│   └── tests/         # Vitest; run from the repo root with `npm test`
├── openspec/           # This app's own spec-driven development artifacts
├── src/
│   ├── components/     # ContentTypeTabs, ContentFields, StylePanel, DownloadBar, QRCodePreview
│   ├── lib/            # qrContent, qrStyle, api client, redirectAllowlist (shared with functions)
│   └── pages/          # Generator (/), Bulk (/bulk), Manage (/manage/:token)
├── eslint.config.js
├── netlify.toml         # Includes the /r/* → qr-redirect rewrite for short links
└── package.json
```

## 💻 Local Development

1. **Install Dependencies** (from this directory):

   ```bash
   cd apps/qr
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in `apps/qr/`:

   ```bash
   NETLIFY_DATABASE_URL="your-neon-dev-connection-string"
   # Admin sign-in for trackable links. Without all three, every short-link
   # endpoint answers 503 (fail closed). Static QR codes still work.
   ADMIN_ALLOWED_EMAILS="you@ifn.community"
   ADMIN_SESSION_SECRET="any-long-random-string-for-local-dev"
   VITE_GOOGLE_CLIENT_ID="the-oauth-client-id.apps.googleusercontent.com"
   ```

   Google Sign-In only works on origins listed as Authorized JavaScript origins on that OAuth client (`http://localhost:8888` for `netlify dev`).

3. **Run Development Server**:
   To test both frontend and backend (Netlify Functions), run:

   ```bash
   npx netlify dev
   ```

   Plain `npm run dev` only serves the frontend — dynamic-link creation, redirects, and link management all depend on the Netlify Functions in `netlify/functions/`.

4. **Run Checks**:

   ```bash
   npm run lint    # ESLint (own config, independent of root)
   npm run build   # tsc -b && vite build (typecheck + production build)
   ```

   Tests live in `netlify/tests/` and run from the repo root (`cd ../.. && npm test`), which includes them via the root `vitest.config.ts`.

## 📐 Spec-Driven Development

This app has its **own, independent** [OpenSpec](https://github.com/Fission-AI/OpenSpec) instance at `apps/qr/openspec/` — separate from the root app's `openspec/`, so its specs travel with it if it's ever split into its own repository. Full upstream docs: **[github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)**.

### Current specs

| Capability | Spec |
| :--- | :--- |
| Single QR generation (static + dynamic mode, styling, download) | [`openspec/specs/qr-generator`](openspec/specs/qr-generator/spec.md) |
| Bulk generation (paste a list, per-item failure isolation, ZIP export) | [`openspec/specs/qr-bulk-generation`](openspec/specs/qr-bulk-generation/spec.md) |
| Short-link redirect, scan logging, token-gated destination editing | [`openspec/specs/qr-link-management`](openspec/specs/qr-link-management/spec.md) |

### Workflow

Same process as the root app (see the root [`README.md`](../../README.md#-spec-driven-development) for the full walkthrough) — the only difference is you run it **from inside `apps/qr/`**, so it operates on this app's own `openspec/` root rather than the root app's:

```bash
cd apps/qr

# 1. Propose a change before writing code
/opsx:propose "add SVG logo upload validation"
# or: npx @fission-ai/openspec@latest new change <name>

# 2. Implement against the delta spec's WHEN/THEN scenarios in
#    openspec/changes/<name>/specs/<capability>/spec.md

# 3. Archive once done — merges the delta into openspec/specs/ and
#    keeps a permanent record under openspec/changes/archive/
npx @fission-ai/openspec@latest archive <name> -y
# or: /opsx:archive
```

Claude Code and Kimi CLI slash commands/skills for this instance are installed under `apps/qr/.claude/` and `apps/qr/.kimi/` — separate from the root app's, matching the independence goal above.
