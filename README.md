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

   # Membership subscription billing. TEST-mode values locally: a live secret
   # key here charges real cards from your laptop.
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."    # from `stripe listen`, see below
   ```

   **There is no price id here, on purpose.** Prices are resolved by Stripe
   **lookup key** at request time — see the `PLANS` table at the top of
   `netlify/functions/checkout.ts`, which maps a public plan slug to a lookup
   key. Set the same lookup key on the price in **both test and live mode** and
   one code path serves both; a price id only ever works in one of them, and each
   new product would need another variable set in two places.

   The price must be **recurring** (yearly). `checkout.ts` checks this and logs
   which price is wrong, because a one-time price in a subscription-mode session
   fails in a way that reads like a bad API key.

   `PLANS` is also the published-price allowlist. The warm-lead price stays
   sellable in Stripe and unreachable from the site simply by not being listed —
   adding a slug publishes a price.

   No publishable key is needed: Checkout is redirect-based, so the browser never
   talks to Stripe directly and no Stripe value is bundled into `src/`.

3. **Run Development Server**:
   To test both frontend and backend (Netlify Functions), run:

   ```bash
   npx netlify dev
   ```

   Plain `npm run dev` / `vite` only serves the frontend — `/api/*` calls will fail without `netlify dev`.

   To exercise the Stripe webhook, run this alongside it in a second terminal:

   ```bash
   stripe listen --forward-to localhost:8888/api/stripe-webhook
   ```

   Use the port `netlify dev` actually prints — it does not always get 8888, and
   a listener pointed at the wrong port fails silently. It prints its own
   `whsec_...`, which differs from the deployed endpoint's; put that one in
   `.env` while testing. The webhook **cannot** be verified on a Netlify deploy
   preview — previews are blocked before build on Git-contributor identity (see
   `AGENTS.md`) — so local is the only place end-to-end verification happens.

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
- **Scope the Stripe keys per deploy context.** Live keys on Production only,
  test keys on deploy previews and branch deploys. A single value for all
  contexts means every preview takes real money from anyone who clicks Subscribe.
- To let a price change in Stripe republish the site by itself, create a build
  hook (Project configuration → Build & deploy → Build hooks), set its URL as
  `NETLIFY_BUILD_HOOK_URL`, and add `price.created`, `price.updated`,
  `price.deleted` and `product.updated` to the Stripe webhook endpoint. Without
  it the site still picks up the current price on the next ordinary deploy.
- For membership billing, also set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
  there (no price id — see above), give the **live** price the same lookup key as
  the test one, and register the live endpoint at
  `https://ifn.community/api/stripe-webhook` for `checkout.session.completed`,
  `customer.subscription.{created,updated,deleted}` and `invoice.payment_failed`.
  The live endpoint's signing secret is not the one `stripe listen` prints.

## 💵 The price comes from Stripe, at build time

`npm run build` starts with `node scripts/sync-pricing.mjs`, which reads the
published-price allowlist in `src/data/plans.json`, asks Stripe for those lookup
keys, and writes `src/data/pricing.generated.ts`. `membershipData.ts` re-exports
it, so **Stripe is the only place a price is edited.** The five surfaces that
print it — the membership page, the final CTA, two FAQ answers and the JSON-LD
`Offer` — all follow automatically.

**Why build time rather than the browser.** The price is baked into prerendered
HTML and into the JSON-LD that answer engines quote. `scripts/prerender.mjs`
exists because GPTBot, ClaudeBot, PerplexityBot and CCBot do not run JavaScript;
fetching the price client-side would blank it on exactly the surfaces this repo
works hardest to fill.

What fails the build and what does not:

- **No `STRIPE_SECRET_KEY`, or Stripe unreachable** → warns loudly and uses the
  committed `pricing.generated.ts`. A contributor without credentials can still
  build, and a Stripe outage cannot block a deploy.
- **A lookup key with no active price, or a price that is not recurring** →
  fails the build. Those are real misconfigurations, and one of them (a price
  with no lookup key) genuinely shipped to test mode and was found by hand.

`npm run check-pricing-drift` compares test and live for every allowlisted key
and reports any difference in amount, currency or interval. Price ids always
differ between modes — that is expected, and is why prices are addressed by
lookup key — so only the terms are compared. Run it before going live:

```bash
STRIPE_TEST_KEY=sk_test_... STRIPE_LIVE_KEY=sk_live_... npm run check-pricing-drift
```

## 🗄️ Database & Migrations

- Schema changes are tracked in `db/migrations/`.
- For more details, see [db/README.md](./db/README.md).
