# Technical Audit — ifn.community

> **⚠️ SUPERSEDED by [AUDIT-2.md](AUDIT-2.md) — 2026-08-08.** A second audit re-derived
> everything from scratch and found that **one claim in this document's "Post-remediation
> state" section is wrong**: P2-13 (content gated behind JS animation) was reported fixed
> on the strength of a measurement error. `getComputedStyle(h1).opacity` returns the
> element's own value, not the product of its ancestor chain; the home hero's `<h1>` is
> still gated by its parent wrapper. The four page-header conversions were real fixes; the
> home hero was not among them. See AUDIT-2.md for the corrected finding and two others.
>
> **STATUS: REMEDIATED — 2026-08-08.** Every finding below has been actioned except
> where explicitly marked *founder input required*. Re-verified state: typecheck, lint,
> 23 tests and production build all pass; the bundled detector returns **zero** findings
> (was 10); `dist` is **1.4 MB** (was 5.8 MB); ARIA attributes went from **3 to 137**
> across 21 landmark/widget roles. This document is kept as the record of what was wrong
> and why. See "Post-remediation state" at the end for what remains open.

**Date:** 2026-08-08 · **Branch:** `feat/openspec-adoption` @ `bfbd7fe` · **Scope:** main site (`src/`, `index.html`, `netlify/functions/join.ts`). `apps/qr` excluded by design (independent codebase). `/admin` treated as an internal Operate surface and excluded from scoring — see *Scope notes*.

**Method:** every public-route page and component reviewed — roughly 30 read in full, the remainder via targeted inspection of headings, ARIA, focus, colour, motion and claims. Plus: the bundled detector run over `src/` with each hit adjudicated in context; the production build measured chunk by chunk; contrast ratios computed from the WCAG relative-luminance formula against the literal token values; and one bounded browser pass against `vite preview` for layout measurement and live DOM state.

---

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | **1**/4 | 1 `aria-label`, 1 `aria-hidden`, 1 `role=` in the entire codebase; the primary conversion form has no label associations; 10 infinite animations with zero `prefers-reduced-motion` |
| 2 | Performance | **2**/4 | Route splitting and lazy images are in place, but 4.6 MB of Spline/physics JS ships for one unlinked route and a `fetchpriority="high"` preload fires on every page for an image used only on `/about` |
| 3 | Responsive Design | **2**/4 | Hero `<h1>` needs 365px on its first line inside a 328px content box at 360px wide; three "proof" panels are `hidden` below `xl`; 8px pagination targets |
| 4 | Theming | **2**/4 | `--color-primary` *is* `slate-900`, so four navy-on-navy compositions render invisible; six brand colors where DESIGN.md permits two; nine utility classes that resolve to nothing |
| 5 | Implementation Integrity | **1**/4 | Fabricated statistics, an invented FAQ that contradicts the live paid product, a reserved-fictional phone number, four dead social links, and a CTA button wired to nothing |
| **Total** | | **8/20** | **Poor — major overhaul** |

**Important context on the score:** a large share of the Integrity failures are *already documented in `PRODUCT.md`* as known-untrue content awaiting the founder's real data. The 8/20 therefore reflects a known content backlog **plus** a genuine, previously undocumented accessibility and correctness gap — not thirty surprises.

---

## Implementation Integrity Verdict — **FAIL**

The implementation does not currently express a coherent, product-specific system. Three independent failures, each verified:

**1. The site contradicts itself about its own commercial model.** `FAQ.tsx:12` tells every home-page visitor *"There are no membership fees at this point in time… completely free of charge."* `/membership` sells a `$99–$149/year` membership. Both are live, one scroll and one click apart.

**2. Claims are unverifiable or invented across the primary surfaces.** Beyond the items `PRODUCT.md` already logs (`About.tsx` "500+ / 20+" and the "Sarah Chen, EcoSync" testimonial; `HeroVisual.tsx` "85+ Founders in Austin"), the audit found the entire `FAQ.tsx` block is fabricated product surface — tracks for "early-stage, growth, and established founders", "local chapter in my city", "virtual coffee chats, masterclasses, and regional groups", "Advisory circles meet once a month for 90 minutes", founders "from idea to post-IPO". None exist. `ValueProps.tsx` promises "Two high-signal founder sessions per month" against a monthly meetup, plus "virtual summits" and "local chapter meetups". `HowItWorks.tsx` promises a founder profile and a matching system that are not built. `Contact.tsx:77` publishes `+1 (512) 555-0123` — the reserved fictional-number range — as a phone channel.

**3. The copy is interchangeable with any generic accelerator.** "rich tapestry", "democratize access", "Our DNA", "Bias for Action", "high-impact entrepreneurs", "finding your tribe", "changemakers", "Seamlessly integrated across our ecosystem". Nearly every page leads global and mentions Austin late or never — the exact inversion `PRODUCT.md` Principle 2 warns against. This also violates the stated plain-language requirement for a largely second-language readership.

This starts with how the site describes itself. `index.html:17` — the meta description search engines and link previews quote verbatim — reads *"a global community connecting founders worldwide. Access mentorship, investors, events…"*. Global-first, Austin absent, and it advertises an investor-facing offering that `PRODUCT.md` lists as researched but undecided.

For an organization whose stated brand commitment is *"Honesty is a brand commitment, not just a compliance matter"* and whose audience is specifically shopping for trustworthiness, this is the highest-leverage dimension on the board.

**Detector findings — verified, not transcribed.** The bundled detector returned 10 hits. Verdicts:
- **6 × font-size-off-ramp** (`HeroVisual.tsx:81,98`; `Resources.tsx:304,308,358`; `ResourcesPreview.tsx:125`) — **confirmed**, and worse than the detector implies: `Resources.tsx:308` is `text-[9px]`. Nine-pixel uppercase type is below any reasonable floor, especially for this audience. Filed as P2 below.
- **1 × overused font (Inter)** — **false positive, dismissed.** `DESIGN.md` pins Inter deliberately ("One Voice Rule": a single plain-spoken face chosen because the audience reads in a second language). A pinned brief outranks a saturation warning.
- **3 × side-tab accent border** (`CodeOfConduct.tsx:76,80,84`) — **false positive as slop, dismissed.** Read in context, these are an indent rule on a numbered enforcement ladder (Correction → Warning → Expulsion), not decorative tabs on cards. They are, however, the only 4px borders in the codebase against a documented 1px system — logged as P3 drift, not as slop.

---

## Executive Summary

- **Audit Health Score: 8/20 (Poor — major overhaul)**
- **Issues by severity: 3 × P0 · 16 × P1 · 15 × P2 · 6 × P3**

**Top 5:**

1. **[P0] `/about`'s only call to action does nothing.** `About.tsx:151` is a `<button>` with no `onClick` and no `href`, three lines below a source comment where the author noted it was unfinished.
2. **[P0] The Join modal fails silently.** `JoinModal.tsx:54` handles a failed submit with `console.error` and the comment *"You might want to show an error message to the user here."* The spinner stops, the form sits there, nothing is said. This is the primary conversion action on every page of the site.
3. **[P0] The Stripe link on `/membership` points at the wrong product.** Already documented in `PRODUCT.md` — the page shows `$99–$149/year`, the wired link goes to "IFN Pro," `$79/mo`. Still live. Flagged here because it is the single money-losing defect in the audit, not because it is new.
4. **[P1] Event times render in the visitor's timezone with no label.** `EventCard.tsx:25` calls `toLocaleTimeString` with no `timeZone` and prints no zone. The next Austin meetup (`2026-08-27T23:30Z`, 6:30 PM CDT) displays to a founder in Berlin as **1:30 AM, Aug 28**. For an explicitly international audience being invited to an in-person Austin event, this is the most audience-specific correctness defect found.
5. **[P1] The site is effectively unusable with a screen reader or keyboard in its highest-value flows.** Across ~4,100 lines and 18 routes there is exactly **one** `aria-label`, **one** `aria-hidden`, and **one** `role=`. The Join modal has no dialog semantics, no focus trap, and no label-to-input associations. The FAQ accordion kills its focus ring outright.

---

## Detailed Findings by Severity

### P0 — Blocking

**[P0-1] `/about` primary CTA is inert**
`src/pages/About.tsx:151` · Integrity / Correctness
"Apply to Join IFN" is a bare `<button>` — no `onClick`, no navigation. Lines 147–150 contain the author's unresolved comment about how to wire it. The About page has no other conversion path.
→ Pass `openJoinModal` through `useOutletContext` as `Home.tsx` does, or link to `/membership`. **`/impeccable harden`**

**[P0-2] Join modal swallows submission failures**
`src/components/JoinModal.tsx:35–60` · Correctness / UX
On a non-OK response or network error the catch block only logs. No error state, no message, no retry affordance — and `console.log('Form submitted successfully')` ships to production at line 52. A user on a flaky connection cannot tell whether they joined.
→ Add an error state rendered in the modal with `role="alert"`. **`/impeccable harden`**

**[P0-3] Membership checkout link mismatched (known)**
`src/data/membershipData.ts:9` · Integrity
`STRIPE_PAYMENT_LINK` resolves to a different product and billing period than the page advertises. Documented in `PRODUCT.md`; repeated here because it is live and it takes money.
→ Founder action: supply the correct Payment Links. No command can fix this.

### P1 — Major

**[P1-1] Primary button fails WCAG AA contrast — and `DESIGN.md` mandates it**
`src/components/Button.tsx:27`, `DESIGN.md` `button-primary` · Accessibility · WCAG 1.4.3
White label on Welcome Amber `#f97316` = **2.80:1**. AA needs 4.5:1 for normal text and 3:1 for large. The hover state `#ea580c` reaches 3.56:1 — the button becomes *more* legible when you touch it. This is a design-system defect, not a component bug: the token pairing is written into `DESIGN.md`, so it needs a decision (darken the amber for fills, or set the label to Deep Harbor), not a sweep.
→ Founder/design decision, then update `DESIGN.md` and `Button.tsx` together.

**[P1-2] `--color-primary` *is* `slate-900`, so four compositions render invisible**
`src/index.css:4` · Theming / Accessibility — **systemic root cause**
`--color-primary: #0f172a` is byte-identical to Tailwind's `slate-900`. Every place navy is drawn on a dark slab self-cancels:
- `About.tsx:128` — the six "Our DNA" value icons (`bg-primary/20 text-primary`) on the `bg-slate-900` slab. ~1.1:1. **The icons are not visible.**
- `Events.tsx:193` — the "Get Notified" submit button (`bg-primary`) inside the `bg-slate-900` panel. The button plate vanishes; only its white text reads.
- `Events.tsx:188` — `focus:ring-primary/50` inside that same panel. **The focus indicator is invisible** on the input. WCAG 2.4.7.
- `CodeOfConduct.tsx:92` — the `Users` icon on the closing `bg-slate-900` card.
→ Introduce an on-dark variant token and forbid `text-primary`/`bg-primary` inside dark surfaces. **`/impeccable colorize`**, then **`/impeccable polish`**

**[P1-3] The primary conversion form has no accessible labels**
`src/components/JoinModal.tsx:92–137` · Accessibility · WCAG 1.3.1, 3.3.2
All four `<label>` elements are siblings of their inputs with no `htmlFor` and no `id`. Screen readers announce four unlabeled fields; clicking a label does not focus its input. `Contact.tsx` does this correctly — the modal does not.
→ **`/impeccable harden`**

**[P1-4] The Join modal is not a dialog**
`src/components/JoinModal.tsx:73–78` · Accessibility · WCAG 2.4.3, 4.1.2
No `role="dialog"`, no `aria-modal`, no `aria-labelledby`. Focus is never moved into the modal, never trapped, never restored on close. The page behind is neither inert nor scroll-locked. The close button (line 84) is icon-only with no accessible name. Escape works — that is the one thing implemented.
→ **`/impeccable harden`**

**[P1-5] Ten infinite animations, zero `prefers-reduced-motion`**
`Hero.tsx:38–55,130`; `HeroVisual.tsx:17–56`; `FinalCTA.tsx:48–96`; plus 11 `animate-pulse`/`animate-spin` classes · Accessibility · WCAG 2.2.2, 2.3.3
`grep` for reduced-motion across `src/` returns **0 results**. The home page runs two 400–500px blurred orbs on endless scale/translate loops, two counter-rotating rings, a scaling globe, three floating avatars, a floating card, two orbital systems, a headline word that swaps every 3s with no pause control, and — `FinalCTA.tsx:40` — the sentence *"Applications reviewed weekly."* set to `animate-pulse` forever.
This also directly violates `DESIGN.md`: *"Don't add looping, bouncing, or attention-seeking motion. Entrances play once; the cycling hero word is the only ambient animation."* Nine of the ten are unsanctioned.
→ **`/impeccable animate`**

**[P1-6] `/resources` has no `<h1>` and its headings start at `<h3>`**
`src/components/Resources.tsx:91,153,196,285` · Accessibility / SEO · WCAG 1.3.1
The page's top heading is a `motion.h2`, then the structure runs h3 → h4 → h5. `/resources` is one of only two links in the site navigation.
→ **`/impeccable harden`**

**[P1-7] Four dead social links with no accessible names**
`src/components/Footer.tsx:76–87` · Accessibility / Integrity · WCAG 2.4.4
Twitter, LinkedIn, Instagram and Mail are all `href="#"`. Each is icon-only — a screen reader announces four consecutive links called "link". Clicking any of them jumps to the top of the page. Additionally, `text-slate-400` on the `bg-slate-50` footer is ~2.4:1, below the 3:1 non-text minimum (WCAG 1.4.11).
→ Founder action: real URLs, or remove the row. Then **`/impeccable harden`** for the labels.

**[P1-8] The FAQ accordion has no visible focus and no state semantics**
`src/components/FAQ.tsx:52–60` · Accessibility · WCAG 2.4.7, 4.1.2
`focus:outline-none` with **no replacement style** — the only such case in the codebase. Five triggers a keyboard user cannot locate. No `aria-expanded`, no `aria-controls`. Answers unmount when collapsed, so they are invisible to Ctrl+F and to crawlers.
→ **`/impeccable harden`**

**[P1-9] Newsletter form on `/events` is unusable in three ways at once**
`src/pages/Events.tsx:182–196` · Accessibility
No `<label>` — placeholder-as-label. `placeholder-slate-500` on the `bg-white/10`-over-navy field is ~2.0:1, so the only instruction on screen is barely readable. The invisible submit button and invisible focus ring are covered in P1-2.
→ **`/impeccable harden`**

**[P1-10] Filter controls convey state by colour alone**
`Events.tsx:64–90` (6 buttons), `Resources.tsx:118,156,204,243` · Accessibility · WCAG 1.3.1, 4.1.2
No `aria-pressed`, no `role="group"`/`aria-label`, no `aria-expanded` on the filter dropdown, no live region on the "N Resources matched" count. A screen-reader user cannot tell what is selected or that anything changed. Two groups on `/events` both offer an option labelled "All".
→ **`/impeccable harden`**

**[P1-11] The success screen states something that never happened**
`src/components/JoinModal.tsx:160` · Integrity
*"We've sent a confirmation email to {email}."* `netlify/functions/join.ts` inserts a row and returns. It sends no email. There is no mail integration anywhere in the repo.
→ **`/impeccable clarify`** (or build the email; the copy must not ship as-is)

**[P1-12] Two contradictory, undeliverable response promises**
`JoinModal.tsx:161` ("We review applications every 24 hours") vs `FinalCTA.tsx:41` ("Applications reviewed weekly") · Integrity
They disagree with each other, and `PRODUCT.md` is explicit that founder-operated means no staffed-operations commitments.
→ **`/impeccable clarify`**

**[P1-13] The home-page FAQ contradicts the paid product**
`src/components/FAQ.tsx:12` · Integrity — see the Integrity Verdict above.
→ **`/impeccable clarify`**

**[P1-14] Fabricated numbers and an invented testimonial are live (known)**
`About.tsx:78,82,98`; `HeroVisual.tsx:82`; `ExperimentalHero.tsx` · Integrity
Logged in `PRODUCT.md`. Restated because they remain deployed. `/experimental-hero` is publicly routed (`App.tsx:83`) and indexable.
→ Founder action, plus `noindex` for `/experimental-hero`.

**[P1-15] `/join` API has no validation and logs PII**
`netlify/functions/join.ts:12,13,30` · Correctness / Privacy
`contact.ts` and `event-signup.ts` validate input and are unit-tested. `join.ts` does neither: it parses the body and inserts it straight into a `NOT NULL` column, so a missing `name` becomes a 500 (which the client then swallows — see P0-2). Line 13 logs the applicant's full name, email and LinkedIn to Netlify function logs.
→ **`/impeccable harden`**

**[P1-16] A 1200px image is preloaded at top priority on every page for one page's benefit**
`index.html:11–13`, `About.tsx:89–95` · Performance
The `<link rel="preload" fetchpriority="high">` fires on every route. `photo-1522071820081` is used only on `/about`, where it is *also* `loading="eager" fetchPriority="high"`. Every home-page visitor pays for it. The image carries no `width`/`height`, so `/about` also shifts layout on load.
→ **`/impeccable optimize`**

### P2 — Minor

**[P2-1] 4.6 MB of JavaScript is built and deployed for one unlinked route.** Measured from the production build: `ExperimentalHero` 2,042 kB + `physics` 1,988 kB + `opentype` 174 kB + `gaussian-splat-compression` 83 kB + `ui` 92 kB + `process` 68 kB + `boolean` 57 kB + `navmesh` 55 kB + `howler` 27 kB ≈ **4.58 MB raw / ~1.47 MB gzip**, out of a 5.8 MB `dist`. All of it is `@splinetool` pulled in by `/experimental-hero`. Lazy-loaded, so it does not block the home page — but it is built, shipped, and one URL away. → **`/impeccable optimize`**

**[P2-2] Nine utility classes and two CSS variables resolve to nothing.** `animate-in`, `fade-in`, `slide-in-from-top-1`, `zoom-in` (`Contact.tsx:180`, `Events.tsx:173,199`) require `tailwindcss-animate`, which is not a dependency. `animate-fade-in` (`ExperimentalHero.tsx:17`), `animate-pulse-slow` (`HeroVisual.tsx:9,10`, `FinalCTA.tsx:93`), `perspective-1000` (`Hero.tsx:124`) and `scrollbar-hide` (`Resources.tsx:113,154`) are undefined. `var(--color-accent-light)` (`Hero.tsx:34`) and `var(--color-primary-rgb)` (`HeroVisual.tsx:41`) are not declared in `@theme`, so that gradient and that drop-shadow render nothing. Net effect: the Contact form's error message, which was written to animate in, appears instantly with no transition. → **`/impeccable distill`**

**[P2-3] Six brand colors where `DESIGN.md` permits two.** `ValueProps.tsx:11,17,23,29` introduce `bg-indigo-500`, `bg-emerald-500`, `bg-blue-500`, `bg-amber-500` in the first content section of the home page. `index.css:11–12` still declares `--color-teal-500/600`, which `DESIGN.md` records as cut; `Resources.tsx:24` still uses teal. `FinalCTA.tsx:87` adds a sky-blue glow. → **`/impeccable distill`**

**[P2-4] Four pages are unreachable from any navigation.** The navbar carries two links (Events, Resources). The footer carries six. `/membership` — the paid product — `/partners`, `/newsletter` and `/resources` appear in neither. `/membership` and `/partners` were the last two features shipped. → **`/impeccable shape`**

**[P2-5] The rotating headline word cannot fit on mobile.** `Hero.tsx:78` sets `min-w-[240px]` on the word slot. At the mobile `text-4xl` size, "Where " measures 125px, so line one needs **365px**. Content box is 358px at 390px viewport, 343px at 375px, **328px at 360px**, 288px at 320px. It never fits. Because the word inside is `absolute inset-0` (left-aligned) within a 240px box while the `<h1>` is `text-center`, the word also renders visibly off-centre against the lines above and below. "Founders Connect," alone measures 336px and overflows a 360px viewport's content box. → **`/impeccable adapt`**

**[P2-6] Touch targets below 44px.** Measured live: pagination dots 8px wide; "Join the Community" text button in `HowItWorks` 24px tall; navbar links 20px tall; `Button size="sm"` 36px. → **`/impeccable adapt`**

**[P2-7] The site's only proof points are hidden below 1280px.** `HeroVisual.tsx:74,91` (`hidden xl:block`) and `Hero.tsx:132` (`hidden sm:block`) carry every credibility signal in the hero. Mobile and laptop visitors see none of them. Separately, `FinalCTA.tsx:45` mounts a 384×384 orbital system as `hidden lg:block` — `display:none` stops layout and paint, but Framer Motion keeps driving transform writes for elements that will never be seen. → **`/impeccable adapt`**

**[P2-8] Six "Coming soon…" pages are live and indexable, with their `<h1>` under the navbar.** `/blog`, `/careers`, `/chapters`, `/mentorship`, `/newsletter`, `/playbooks` are byte-identical stubs. All use `py-20` (80px) against a fixed navbar that measures ~84px at rest, so the heading sits partly beneath it; every other page uses `pt-24`. No `noindex` anywhere. → **`/impeccable shape`**

**[P2-9] `dist` has no 404 route.** `netlify.toml` rewrites `/*` to `index.html`, and `App.tsx` has no catch-all `Route`. Any typo'd URL renders navbar + footer around an empty `<main>`. → **`/impeccable harden`**

**[P2-10] Six pages nest `<main>` inside `<main>`.** `App.tsx:37` wraps the outlet; `Home`, `About`, `Events`, `Membership`, `Partners` and `ResourcesHub` each open another. Nested `<main>` is invalid HTML and duplicates the landmark. → **`/impeccable harden`**

**[P2-11] The events API failure mode is silent, and the fallback data is stale.** `useEvents.ts` sets `error` on API failure; `Events.tsx:9` destructures only `events` and `loading`, so "showing cached data" is never displayed. The bundled `events.json` runs 2026-03 → 2026-12 and `Events.tsx` filters nothing by date, so five past meetups list as upcoming under "All Time". → **`/impeccable harden`**

**[P2-12] Broken and fragile anchor links.** `Footer.tsx:15` points at `/#resources`, but `id="resources"` lives in `Resources.tsx`, which renders on `/resources` — the link lands on Home and does nothing. `ScrollToAnchor.tsx` waits a fixed 100ms, which races the lazy-loaded home sections, and `scrollIntoView` has no offset for the fixed navbar, so any target that does resolve lands underneath it. `behavior: 'smooth'` is unconditional. → **`/impeccable harden`**

**[P2-13] Roughly 30 elements are gated on JavaScript animation to become visible.** Every `initial={{ opacity: 0 }}` in `Hero`, `About`, `Partners`, `Membership`, `Resources`, `EventCard` and `FinalCTA` has no CSS resting state — if Framer Motion does not run its entrance, the content stays transparent. This is narrower than it sounds for a client-rendered SPA (no React, no page at all), so it only bites when React renders and the animation layer specifically does not. One observation worth recording: in a background tab the hero's left column measured a frozen `opacity: 0.538` with the rotating word at `0`, for as long as it was sampled. That is most likely a paused frame loop in an unfocused window rather than a product defect — the harness could not bring the tab to the foreground to confirm recovery, so treat it as unverified. The structural point stands on its own. → **`/impeccable animate`**

**[P2-14] A third-party image is fetched on the home page critical path.** `Hero.tsx:35` loads `bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]` at `opacity-[0.03]` — an external request, an external dependency, and a third-party host learning every home-page visitor's IP, for three percent of a texture. There is no fallback if the host is slow or gone. → **`/impeccable optimize`**

**[P2-15] The home page skips a heading level.** `ResourcesPreview.tsx:34` is an `<h2>` and `ResourcesPreview.tsx:118` an `<h4>`, with no `<h3>` between. Separate from P1-6, which covers `/resources`. → **`/impeccable harden`**

### P3 — Polish

- **[P3-1] Dead code.** `HeroGlobe.tsx` (257 lines, sole importer of `three`), `Testimonials.tsx` and `SocialProof.tsx` (both flagged in `PRODUCT.md` as fabricated landmines) are imported nowhere. `src/fonts.css` declares `@font-face` rules pointing at `/fonts/*.woff2`; it is imported nowhere and `public/fonts/` contains only `.gitkeep`. → **`/impeccable distill`**
- **[P3-2] Type below the ramp.** `text-[10px]` × 4 and `text-[9px]` × 1 (`Resources.tsx:308`). Nine-pixel uppercase type is unreadable, particularly for a second-language readership. → **`/impeccable typeset`**
- **[P3-3] Radii off the documented ladder.** `rounded-[3rem]` (`About.tsx:106`, `Events.tsx:124`), `rounded-[2.5rem]` (`Resources.tsx:148`), `rounded-3xl` on cards, `rounded-xl` on buttons where `DESIGN.md` specifies 8px. → **`/impeccable polish`**
- **[P3-4] Registration and external links are `window.open` calls on `<button>`s.** `EventCard.tsx:82`, `Events.tsx:116`. Not middle-clickable, not copyable, blockable by popup blockers, and announced as buttons rather than links. → **`/impeccable harden`**
- **[P3-5] Forms have no `autoComplete` attributes.** Neither the Join modal nor the Contact form; `Contact.tsx:174` also sets `resize-none` on a 4-row textarea. → **`/impeccable harden`**
- **[P3-6] Join modal select desyncs from its display.** `JoinModal.tsx:17` initialises `stage: 'Idea'`; the first `<option>` is `'Idea Stage'`. A user who never touches the control sees "Idea Stage" and the server records `"Idea"`. → **`/impeccable harden`**

---

## Patterns & Systemic Issues

1. **ARIA is essentially absent.** One `aria-label`, one `aria-hidden`, one `role=` across 18 routes. Every custom control — modal, accordion, two filter groups, a dropdown, a mobile menu, four icon-only links — was built without it. This is not a set of oversights; it is a missing practice.
2. **One token collision produces four separate visual bugs.** `--color-primary === slate-900` (P1-2). Fixing the token fixes all four.
3. **Motion carries the layout instead of decorating it.** ~30 elements start at `opacity: 0` with no CSS resting state, and 10 animations loop forever with no reduced-motion path. The system is simultaneously more fragile and more hostile than `DESIGN.md` describes.
4. **The design system is documented but not enforced.** `DESIGN.md` records the amber primary button, the amber italic headline word, 8px button radii, 1px borders, flat-at-rest surfaces, and a two-colour ceiling. In practice: `About`, `Partners`, `Membership` and `Contact` each hand-roll a navy `rounded-xl` CTA instead of using `Button`; the italic word is navy on all three of those pages, not amber; `shadow-xl` sits at rest on several cards; and six colours are in play. `DESIGN.md` names one known exception — there are now at least four.
5. **Content promises outrun the product.** Profiles, matching, chapters, tracks, advisory circles, virtual summits, weekly insights, two sessions a month, confirmation emails, 24-hour reviews. None exist. This is one authoring problem, not fifteen copy bugs.
6. **The two form pipelines were built to different standards.** `contact.ts` and `event-signup.ts` validate, return structured errors, and are unit-tested; their UIs surface errors and label their fields. `join.ts` and `JoinModal.tsx` do none of it — and that is the pipeline the whole site funnels into.

---

## Positive Findings

- **`/partners` is the strongest page on the site** and should be the template for the rest: real partners from `partnersData.ts`, real logos, honest scope ("venues, tools, and companies that help IFN run events"), Austin named explicitly, a working CTA, no invented numbers.
- **`Contact.tsx` gets forms right** — `htmlFor`/`id` on every field, a real error state rendered to the user, a success state, and cleared input on submit. It is the in-repo model for fixing the Join modal.
- **`contact.ts` and `event-signup.ts`** are validated server-side and covered by Vitest.
- **Route-level code splitting is already in place** across all 18 routes, and 9 of 10 images carry `loading="lazy"`.
- **`Button.tsx` and `Container.tsx` are well-built primitives** with sensible variants and `twMerge` composition. The problem is that pages bypass them, not that they are wrong.
- **`DESIGN.md` and `PRODUCT.md` are unusually good.** Most of the content failures in this audit were already identified there. The gap is execution against them, not awareness.

---

## Recommended Actions

1. **[P0] Founder input first — no command can substitute.** The correct Stripe Payment Links; real or removed social URLs; a real phone number or none; real member numbers or none; the real testimonials `PRODUCT.md` says are collectible from LinkedIn. Everything in `/impeccable clarify` below is blocked on these.
2. **[P0/P1] `/impeccable harden`** — the largest single win. Wire the `/about` CTA; give the Join modal dialog semantics, a focus trap, labels and a visible error state; add server-side validation to `join.ts` and stop logging PII; restore the FAQ focus ring; label the `/events` newsletter input; add `aria-pressed`/`aria-expanded` to the filter controls; add a 404 route; unnest `<main>`; surface the events API error; fix the anchor links.
3. **[P1] `/impeccable clarify`** — rewrite the fabricated FAQ, the `ValueProps` and `HowItWorks` promises, and the About narrative against what IFN can actually deliver; reconcile the free-vs-paid contradiction; remove the confirmation-email claim; settle on one honest review timeline; replace the accelerator boilerplate with the cross-border specifics `PRODUCT.md` Principle 3 asks for; lead Austin.
4. **[P1] `/impeccable animate`** — add `prefers-reduced-motion`; cut nine of the ten infinite loops down to what `DESIGN.md` sanctions; while in there, give the `initial: opacity 0` elements a CSS resting state (P2-13).
5. **[P1] `/impeccable colorize`** — resolve the `--color-primary`/`slate-900` collision with an on-dark variant, which fixes the invisible icons, button and focus ring in one change; then address the amber-on-white contrast decision (P1-1) and update `DESIGN.md` to match.
6. **[P1/P2] `/impeccable optimize`** — drop the wrong-page `fetchpriority` preload; decide whether `/experimental-hero` and its 4.6 MB of Spline should ship at all; split the home page's single Suspense boundary so five lazy sections do not block on the slowest; add image dimensions.
7. **[P2] `/impeccable adapt`** — fix the hero headline's 240px floor; raise touch targets to 44px; reconsider proof points that disappear below `xl`; fix the six stub pages' navbar clipping. Note: dimension 3 was scored from code plus one measured browser pass, and the harness kept the tab backgrounded, so this dimension has thinner live evidence than the other four.
8. **[P2/P3] `/impeccable distill`** — delete `HeroGlobe`, `Testimonials`, `SocialProof` and `fonts.css`; remove the nine no-op utility classes and two undefined CSS variables; collapse six brand colours back to two.
9. **[P2] `/impeccable shape`** — the navigation exposes 2 of 18 routes and hides the paid product; six identical stubs are live and indexable.
10. **[P3] `/impeccable polish`** — radii, off-ramp type sizes, resting shadows, and the four hand-rolled CTAs that should be `Button`.

---

## Scope notes

- `/admin` (`Admin.tsx`, 419 lines) was **excluded from scoring**. It is an internal Operate surface behind Google sign-in with a server-verified allowlist, not a visitor-facing surface, and auditing it against Persuade-mode criteria would distort the score. Two observations if you want it covered: it renders two `<h1>` elements, and `Admin.tsx:370` is the only place outside `Button.tsx` that gets its focus ring right. A separate `/impeccable audit src/pages/Admin.tsx` would do it properly.
- `apps/qr` is out of scope by project convention.
- Contrast figures were computed from the WCAG relative-luminance formula against the literal token values in `src/index.css`, not sampled from a screenshot.


---

## Post-remediation state (2026-08-08)

Fixed in a 13-agent parallel pass over disjoint file groups, plus a shared foundation and
an integration pass. Verified independently, not taken from agent self-reports.

**Verification:** `tsc -b` clean · `eslint` clean · 23/23 tests pass (a `join.ts`
validation suite was added) · production build succeeds · impeccable detector returns `[]`.

**Measured deltas:**

| Metric | Before | After |
|---|---|---|
| `dist` total | 5.8 MB | **1.4 MB** |
| ARIA attributes in `src/` | 3 | **137** |
| `role=` attributes | 1 | **21** |
| Detector findings | 10 | **0** |
| Primary button contrast | 2.80:1 (fail) | **6.37:1** (AA) |
| `repeat: Infinity` animations | 10 | **0** |
| Routes with a unique `<title>` | 1 | **all** |
| Heading levels in use | h1–h5, with skips | **h1–h3, no skips** |
| Stock photos of non-existent people | 4 | **0** |

**Systemic fixes worth knowing about:**

- `--color-accent-ink` — the primary button keeps Welcome Amber but takes a Deep Harbor
  label. `DESIGN.md` has been updated, since it was the document that mandated the
  failing white-on-amber pairing.
- `<MotionConfig reducedMotion="user">` in `App.tsx` makes every framer-motion animation
  on the site honour `prefers-reduced-motion` in one line, backed by a CSS block in
  `index.css` for Tailwind's `animate-*` utilities.
- The **Navy-On-Navy Rule** is now recorded in `DESIGN.md`. `--color-primary` is
  byte-identical to `slate-900`; that one collision caused four separate
  invisible-element bugs.
- Page-opening headings are plain elements, not `motion.h1`. A page's only `<h1>` is
  never gated behind a JS entrance — caught in browser verification on `/resources`,
  where the `<h1>` was rendering at `opacity: 0`.
- `netlify.toml` now sends `X-Robots-Tag: noindex, follow` for the six placeholder
  routes, which is the durable version of the client-side tag `ComingSoon.tsx` injects.

**Still open — founder input required, no code change can supply these:**

1. **The correct Stripe Payment Links.** `/membership` now shows the confirmed $149/year
   and $99/year prices honestly and routes to `/contact` with "Request your membership
   link". Nothing can charge the wrong amount. `STRIPE_PAYMENT_LINK` remains exported and
   commented as unverified — a one-line swap when the real link arrives.
2. **Two unverified social URLs.** `src/data/socialLinks.ts` marks each entry
   `verified: true|false`. Luma and the `mailto:` are real. **LinkedIn and Instagram are
   guessed handles** and will ship as 404s if wrong. Confirm both or delete the entries —
   the footer renders whatever the array contains.
3. **Real member testimonials.** `PRODUCT.md` says these are collectible from LinkedIn.
   Nothing was invented to fill the gap, so the social-proof sections are honest but
   plainer than they could be.
4. **Whether "Cancel anytime" is a commitment IFN honours** on an annual membership.

**Deliberately not done:**

- `/admin` was excluded from the original audit as an internal Operate surface and was
  not touched. It still has two `<h1>` elements. A separate
  `/impeccable audit src/pages/Admin.tsx` would cover it properly.
- `apps/qr` remains out of scope by project convention.
