# Technical Audit #2 — ifn.community

**Date:** 2026-08-08 · **Branch:** `feat/openspec-adoption` (uncommitted working tree) · **Scope:** main site. `apps/qr` out of scope by project convention; `/admin` excluded from scoring as an internal Operate surface.

**Re-derived from scratch**, not from the previous round's claims. Because I made the changes being audited, I weighted looking for defects the remediation *introduced* at least as heavily as confirming the old ones were gone. That turned out to matter: **one finding I reported as fixed was not fixed, and I had verified it incorrectly.**

**Method:** fresh detector run; full read of the shared foundation, `Hero`, `JoinModal`, `HowItWorks` and the changed config; targeted greps across all 7,150 lines for every banned pattern and claim; production build measured; a live browser pass with alpha-composited, canvas-resolved contrast measurement across `main`, `nav` and `footer`; live inspection of the Join dialog's runtime semantics.

---

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | **3**/4 | Structurally transformed (3 → 137 ARIA attributes, full dialog semantics), but the signature italic amber word measures 2.68–2.80:1 against a 3:1 requirement across 12 files, and the reduced-motion rule freezes every loading spinner |
| 2 | Performance | **4**/4 | `dist` 5.8 MB → 1.4 MB, zero infinite animations, route splitting everywhere, 126 KB gzip shell. One open item: the home page's LCP content is gated behind a JS animation with no CSS resting state |
| 3 | Responsive Design | **3**/4 | The unbreakable-headline bug is genuinely fixed with an overlapping-grid technique; touch targets now clear 44px. Real mobile viewports remain unverified — harness limitation, same as round 1 |
| 4 | Theming | **3**/4 | Token collision fixed and codified as a named rule; teal gone; two-colour ceiling restored. But `DESIGN.md` still mandates a failing amber-on-light pairing, and button styling is hand-rolled in 10 files |
| 5 | Implementation Integrity | **4**/4 | Detector returns zero. No fabricated claim survives anywhere. The honest copy is more persuasive than the invented copy it replaced |
| **Total** | | **17/20** | **Good — address weak dimensions** |

Previous round: **8/20 (Poor)**. This is a real improvement, not 20/20, and the gap is concentrated in the two findings below.

*Scoring note:* the LCP-gating defect is counted once, under Performance, where it does its damage. Accessibility is scored on the contrast failure and the spinner regression alone. Double-counting one finding across two dimensions would understate both.

---

## Implementation Integrity Verdict — **PASS**

The site now expresses a coherent, product-specific system. Evidence:

- **The bundled detector returns `[]`** (was 10 findings).
- **Every fabricated claim is gone**, verified by sweeping for each one individually: no chapters, mentor programme, matching system, founder profiles, tracks, advisory circles, virtual summits, masterclasses, coffee chats, "post-IPO", "500+/20+/85+", "Sarah Chen", the fictional phone number, or any response-time or confirmation-email promise. The only surviving mentions of "chapter" are *denials* — "not a network of chapters in other cities", "we are not opening any right now".
- **The honest version out-performs the invented one.** `/mentorship` now opens "We have not built one. Nobody is being matched with a mentor" and redirects to what does exist. The Join modal's success screen says "This form does not send email, so nothing will arrive in your inbox — there is nothing to wait for", then converts the former dead end into a live link to the next Austin meetup. That is better product design than the fabrication it replaced, not merely more truthful.
- **Copy is Austin-first and plain** throughout, with the cross-border specifics `PRODUCT.md` asks for ("Visas, U.S. banking, hiring across borders, funding norms nobody explained to you").

---

## The two findings that hold the score down

### [P1] The signature italic amber word fails WCAG AA — and `DESIGN.md` mandates it

**Location:** 17 occurrences across 12 files (`Hero`, `FinalCTA`, `ValueProps`, `JoinModal`, `Resources`, `FounderStory`, `Events`, `Partners`, `Contact`, `Membership`, `NotFound`, `About`) · **Category:** Accessibility · **WCAG 1.4.3**

Measured live with alpha compositing and canvas colour resolution:

| Instance | Size | Foreground | Background | Ratio | Required |
|---|---|---|---|---|---|
| "International" (hero `<h1>`) | 60px/700 | `#f97316` | `#ffffff` | **2.80:1** | 3:1 |
| "zero" | 36px/700 | `#f97316` | `#ffffff` | **2.80:1** | 3:1 |
| "first" | 36px/700 | `#f97316` | `#f8fafc` | **2.68:1** | 3:1 |

Last round I fixed white-on-amber for *fills* by switching the button label to Deep Harbor (2.80 → 6.37:1). I did not fix amber-as-*text on light grounds*, which is the same root cause: **Welcome Amber `#f97316` is too light to carry text on white**. Because `DESIGN.md` requires the italic amber word on essentially every page-opening headline, this is a system-level defect, not twelve local ones.

**Impact:** the single most brand-defining element on every page is below the legibility floor for exactly the audience — people reading in a second language — that `PRODUCT.md` says plain legibility is a product requirement for.

**The threshold, stated precisely.** All 17 occurrences sit in headings of 20px bold or larger (smallest: `JoinModal.tsx:225`, `text-xl` bold), so every one qualifies as WCAG large text and needs **3:1** — none need 4.5:1. The replacement must clear 3:1 against **`#f8fafc`**, the *darkest* ground the word appears on, not against white:

| Candidate | on `#ffffff` | on `#f8fafc` |
|---|---|---|
| Welcome Amber `#f97316` (current) | 2.80:1 ✗ | 2.68:1 ✗ |
| **Welcome Amber Deep `#ea580c`** | **3.56:1 ✓** | **3.40:1 ✓** |
| orange-700 `#c2410c` | 5.18:1 ✓ | 4.95:1 ✓ |

**Recommendation:** use **Welcome Amber Deep `#ea580c` for amber text on light grounds**, keeping `#f97316` for fills and for text on dark. This introduces no new hue — `#ea580c` is already a token in `DESIGN.md` as the primary button's hover state — so the two-colour ceiling holds and the warmth is unchanged. Then update `DESIGN.md`, which currently specifies the failing pairing. If you want more headroom than 3.40:1, `#c2410c` buys it at the cost of reading browner. **Suggested command: `/impeccable colorize`**

### [P1] The home page's LCP content is invisible until JavaScript animates it — I previously reported this fixed

**Location:** `src/components/Hero.tsx:70` · **Category:** Performance (counted here only — see the scoring note above)

`Hero.tsx:70` wraps the badge, the `<h1>`, the lead paragraph, both CTAs and the hero visual in a `motion.div` with `initial={{ opacity: 0, x: -30 }}`. Measured in the browser:

```
h1 own opacity:        1
h1 EFFECTIVE opacity:  0      ← product of the ancestor chain
CTA effective opacity: 0
hero visual:           0
gating ancestor:       <div class="flex-1 text-center lg:text-left z-10">
                       inline style: "opacity: 0; transform: translateX(-30px)"
document.getAnimations().length: 0    ← nothing queued to un-hide it
```

**Why I got this wrong last round:** I measured `getComputedStyle(h1).opacity`, which returns the element's own value (`1`), and reported the finding closed. Opacity is multiplicative down the ancestor chain; the correct measurement is the product. The four page-header `motion.h1` → plain `<h1>` conversions I made *were* real fixes for `/about`, `/partners`, `/membership` and `/resources` — but the home hero's `<h1>` is gated by its *parent*, which I never checked.

**Honest bound on severity:** this was observed in a background tab, where the frame loop is throttled. Framer Motion generally resumes on `visibilitychange`, and the harness would not let me foreground the tab to confirm recovery — so "permanently invisible" is **not** established. What *is* established: the hero renders with an inline `opacity: 0` and **zero animations queued**, so any path where the frame loop does not run leaves the largest contentful element of the site blank. Opening the site in a background tab (cmd-click, session restore) is the common case.

**Recommendation:** give the wrapper a visible CSS resting state — animate `x` only, or drop the wrapper entrance and let the child elements stagger. The Hero's own `<h1>` is already a plain element; the wrapper undoes that. **Suggested command: `/impeccable animate`**

---

## Also found

### [P2] My global reduced-motion rule freezes every loading spinner

**Location:** `src/index.css:41–48` · **Category:** Accessibility

The block I added sets `animation-duration: 0.01ms !important; animation-iteration-count: 1 !important` on `*`. For transitions that is correct. For the six `animate-spin` / `animate-pulse` indicators (`EventsPreview.tsx:109`, `Events.tsx:183`, and four in `Admin.tsx`) it completes one rotation in 0.01ms and stops — the spinner becomes a static icon with no indication that anything is loading.

This is precisely what the audit playbook warns about: *"flag a global `0.01ms` kill that destroys useful feedback."* My own code comment claims the opposite ("state changes still land, they just don't move"), which is true of transitions and false of looping indicators.

**Recommendation:** scope the blanket rule to exclude deliberate status indicators, and give those a non-motion alternative (an animated ellipsis, a determinate bar, or text that updates). **`/impeccable animate`**

### [P2] No shared link-button primitive; button styling is hand-rolled in 10 files

**Location:** `ComingSoon`, `EventCard`, `EventsPreview` (×2), `Hero`, `JoinModal`, `Resources` (×5), `ResourcesPreview`, `About`, `Membership` (×2), `Partners` (×2) · **Category:** Theming

`Button.tsx` renders a `<button>`, so every link-that-looks-like-a-button re-declares the same class string. They are all *correct and consistent today* — they were written against one contract — but the next change to button styling has to be made in eleven places. The original audit flagged four hand-rolled CTAs as design-system drift; the count is now seventeen, and only discipline is holding them in sync.

**Recommendation:** add a `ButtonLink` (or an `asChild`/`as` prop on `Button`) sharing one class function, and migrate. **`/impeccable extract`**

### [P3] `scroll-margin-top` is applied to every element with an `id`

**Location:** `src/index.css:31–34` · **Category:** Theming

`:target, [id] { scroll-margin-top: 6rem }` was meant for anchor targets but matches every id'd element on the page, including form fields. It affects any programmatic `scrollIntoView`, not just hash navigation. Harmless in practice today, but it is a blunt selector that will produce a confusing 96px offset somewhere eventually. Scope it to `:target` and the section ids that are actually linked.

---

## Verified fixed (spot-checked, not taken on trust)

| Claim | How it was verified | Result |
|---|---|---|
| Detector clean | fresh `detect.mjs --json src` | `[]` (was 10) |
| Bundle size | production build + `du` | **1.4 MB** (was 5.8 MB) |
| ARIA coverage | `grep -o` across `src/` | **137** attributes, **21** roles (was 3 / 1) |
| Join dialog semantics | live DOM inspection with the modal open | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → "Join IFN", body scroll locked, all 4 fields labelled + `autoComplete`, close button named |
| Event timezones | live render of `<time>` elements | "Thu, Aug 27, 2026 · 6:30 PM **CDT**" — and correctly **CST** for the November event, so DST is handled |
| Fabricated claims | individual grep per banned claim | zero survivors |
| Heading structure | DOM ladder per route | h1 → h2 → h3, no skips, exactly one `h1` per route |
| Per-route titles | live navigation | unique on every route; stubs also inject `noindex` |
| Infinite animations | grep | 0 (was 10) |
| Dead utility classes | grep | 0 (was 9 classes + 2 undefined vars) |
| Hero responsive floor | canvas text measurement + code read | the `min-w-[240px]` floor is gone; the overlapping-grid slot wraps naturally |

## Verified false positives — dismissed, not reported as defects

- **`01` / `02` / `03` step numerals at 1.37:1** (`HowItWorks.tsx:70`). They are `text-white/10`, `aria-hidden="true"`, `pointer-events-none select-none` watermarks positioned behind `z-10` content, with step order carried semantically by the `<ol>`. Decorative text is out of scope for 1.4.3.
- **63 of my first 65 "contrast failures."** My initial script parsed `oklch()` / `oklab()` colour strings as RGB and did not composite alpha. Re-run with canvas colour resolution and proper compositing, the real count was 6.
- **`Button` receiving a `ref` without `forwardRef`.** React 19 passes `ref` as an ordinary prop to function components, so `{...props}` forwards it correctly. Typechecks and works.
- **Hero headline "not fitting" at 360px.** The round-1 defect was an *unbreakable* `min-w-[240px]` box wider than the viewport. The replacement sizes to content and wraps like normal text.

---

## Scope and confidence

- **Responsive (dimension 3) has the thinnest live evidence.** `resize_window` did not move the tab's viewport in this harness, so mobile behaviour is inferred from code plus canvas text measurement, not observed. Same limitation as round 1, stated for the same reason.
- **Every browser observation was made in a background tab** (`visibilityState: "hidden"`); the harness would not foreground it. This is why the Hero opacity finding is reported with an explicit bound on severity rather than as a confirmed permanent failure.
- **`/admin` was not audited.** It still carries two `<h1>` elements. `/impeccable audit src/pages/Admin.tsx` would cover it as the Operate surface it is.

## Still blocked on founder input — unchanged from round 1

1. The correct **Stripe Payment Links**. `/membership` shows $149/yr and $99/yr honestly and routes to `/contact`; nothing charges the wrong amount, and nothing takes money.
2. **LinkedIn and Instagram URLs are guessed** (`socialLinks.ts`, `verified: false`). They ship as live links and will 404 if the handles are wrong.
3. **Real member testimonials** — nothing was invented to fill the gap.
4. Whether **"Cancel anytime"** is a commitment IFN honours on an annual membership.

---

## Recommended Actions

1. **[P1] `/impeccable colorize`** — resolve amber-on-light. One token decision fixes 17 occurrences across 12 files, then `DESIGN.md` must be updated to stop specifying the failing pairing.
2. **[P1] `/impeccable animate`** — give `Hero.tsx:70`'s wrapper a visible CSS resting state so the LCP element never depends on a frame loop; while there, scope the reduced-motion rule so loading spinners keep communicating.
3. **[P2] `/impeccable extract`** — pull a `ButtonLink` primitive out of the seventeen hand-rolled copies.
4. **[P3] `/impeccable polish`** — narrow the `[id]` scroll-margin selector and sweep whatever the three fixes above disturb.
