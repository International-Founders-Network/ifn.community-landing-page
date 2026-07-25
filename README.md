# IFN Community

International Founders Network (IFN) is a global ecosystem for founders to connect, grow, and succeed.

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Netlify Functions (Serverless)
- **Database**: Neon (Postgres)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Spec-driven development**: [OpenSpec](https://github.com/Fission-AI/OpenSpec)
- **Testing**: Vitest

## 🛠️ Project Structure

```bash
├── apps/
│   └── qr/          # QR code generator — a fully independent app (own tooling, own specs). See apps/qr/README.md
├── db/               # Database migrations and schema
├── netlify/
│   ├── functions/    # Backend API endpoints
│   └── functions/_lib/  # Shared server-side helpers (e.g. admin auth)
├── openspec/         # Spec-driven development artifacts for this app — see "Spec-Driven Development" below
├── src/
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   └── pages/        # Page components
├── CLAUDE.md         # Agent-facing repo conventions (deploy target, spec workflow, gotchas)
├── BACKLOG.md         # Index of open work, linking to the relevant openspec/specs/*.md
└── netlify.toml      # Netlify configuration and API routing
```

## 💻 Local Development

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in the root:

   ```bash
   NETLIFY_DATABASE_URL="your-neon-dev-connection-string"
   ```

3. **Run Development Server**:
   To test both frontend and backend (Netlify Functions), run:

   ```bash
   npx netlify dev
   ```

   Plain `npm run dev` / `vite` only serves the frontend — `/api/*` calls will fail without `netlify dev`.

4. **Run Checks**:

   ```bash
   npm run lint    # ESLint
   npm run build   # tsc -b && vite build (typecheck + production build)
   npm test        # Vitest — netlify/functions/**/*.test.ts
   ```

   These three are exactly what `.github/workflows/ci.yml` runs on every PR and push to `main`.

## 📐 Spec-Driven Development

This repo develops new features spec-first using [**OpenSpec**](https://github.com/Fission-AI/OpenSpec), an open-source, model-agnostic spec-driven development toolkit. Full upstream docs: **[github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)** (see its `README.md` and `docs/` for the canonical CLI reference — the summary below covers how *this repo* uses it).

### Why

Before OpenSpec was adopted, two real features (the `apps/qr` app and the admin dashboard) shipped with no written spec anywhere in the repo — the only record of *why* and *what was intended* was the code itself and a couple of commit messages. `BACKLOG.md` was a checklist, not a contract, so there was nothing for a human or an AI coding agent to verify a change against. OpenSpec fixes that: every non-trivial change gets a spec with testable acceptance criteria *before* implementation, and the spec survives after the change ships as permanent documentation.

### Where things live

```
openspec/
├── config.yaml     # schema: spec-driven (this repo's OpenSpec config)
├── specs/          # Durable, current-state specs — one folder per capability
│   └── <capability>/spec.md
├── changes/        # Active, in-progress change proposals
│   └── <change-name>/
│       ├── proposal.md   # Why / What Changes / Capabilities / Impact
│       ├── design.md     # Context / Goals & Non-Goals / Decisions / Risks
│       ├── tasks.md       # Checklist of implementation steps
│       └── specs/<capability>/spec.md   # The delta this change makes to the capability's spec
└── changes/archive/   # Completed changes, permanently kept as historical record
```

`openspec/specs/*.md` is the one place to check "what does this app actually do and why" for any capability — e.g. [`openspec/specs/admin-dashboard/spec.md`](openspec/specs/admin-dashboard/spec.md) documents the full Google OAuth → allowlist → session contract behind `/admin`.

**`apps/qr` has its own, completely separate OpenSpec instance** at `apps/qr/openspec/` — see [`apps/qr/README.md`](apps/qr/README.md). It is not part of this repo's `openspec/`, by design (see "Independence" in that README).

### The workflow

OpenSpec's CLI (`npx @fission-ai/openspec@latest ...`) is already initialized for both Claude Code and Kimi CLI — restart your agent session once after a fresh clone and the slash commands below are available directly.

1. **Propose** a change before writing code:

   ```
   /opsx:propose "add a founder directory page"
   ```

   (or, without an agent, `npx @fission-ai/openspec@latest new change <kebab-case-name>` and hand-write `proposal.md`/`design.md`/`tasks.md`/`specs/<capability>/spec.md` from the templates OpenSpec scaffolds)

   This creates `openspec/changes/<name>/` with a proposal, a design doc, a task checklist, and a **delta spec** — a `spec.md` using `## ADDED Requirements` / `## MODIFIED Requirements` sections, each requirement written as a testable `SHALL` statement with `WHEN`/`THEN` scenarios, e.g.:

   ```markdown
   ### Requirement: Visitors can submit a contact message
   The system SHALL provide a Contact form requiring name, email, and message.

   #### Scenario: Submitting complete required fields
   - **WHEN** a visitor submits the form with name, email, and message filled in
   - **THEN** a `POST` request is made to `/api/contact` and a success message is shown
   ```

2. **Implement** against the acceptance criteria — the `WHEN`/`THEN` scenarios are written so they translate almost directly into Vitest `it(...)` blocks (see `netlify/functions/*.test.ts` for the existing pattern). A change isn't done until its `tasks.md` checklist is fully checked off.

3. **Archive** once implemented:

   ```bash
   npx @fission-ai/openspec@latest archive <change-name> -y
   ```

   or `/opsx:archive`. This merges the delta spec into `openspec/specs/<capability>/spec.md` (the durable, current-state spec) and moves the change folder to `openspec/changes/archive/<date>-<name>/` as a permanent record — **specs are never deleted after shipping.**

Other useful commands: `openspec list` (active changes), `openspec spec list` (all capabilities), `openspec validate <name>` (check a change's structure before archiving), `openspec show <spec-id>` (print a spec). Run `npx @fission-ai/openspec@latest --help` for the full reference, or see the upstream docs linked above.

### How this relates to `BACKLOG.md`

`BACKLOG.md` is an **index**, not a spec — each open item links to the `openspec/specs/*.md` file that documents that capability's full contract and known gaps. New backlog items should reference a spec (write one via `/opsx:propose` first); don't add prose acceptance criteria directly to `BACKLOG.md`.

## 🌐 Deployment

The project is configured for deployment on **Netlify**.

- Push to the main branch to trigger a deploy.
- Ensure `NETLIFY_DATABASE_URL` is set in the Netlify Dashboard.

## 🗄️ Database & Migrations

- Schema changes are tracked in `db/migrations/`.
- For more details, see [db/README.md](./db/README.md).
