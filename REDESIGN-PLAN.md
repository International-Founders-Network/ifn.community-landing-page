# Landing page redesign plan

**Branch:** `design/landing-redesign` · **Worktree:** `../ifn-landing-redesign`
**Baseline commit:** `2e8ea80` (the remediated site, after both audit rounds and the final integration pass)
**Mode:** Redesign, full overhaul. New visual language over preserved content and IA.

> No em-dash character appears in this document or in any copy it specifies. The
> design skill bans it outright as the single most recognisable machine-writing
> tell, and specimen copy has to model the rule it is written under.

---

## 1. Design read and dials

**Reading this as:** a community and event landing page for trust-shopping
international founders in Austin, with a wayfinding and documentary language,
leaning toward Tailwind v4 plus Geist over Inter and restrained scroll-reveal
motion.

| Dial | Value | Why this value |
|---|---|---|
| `DESIGN_VARIANCE` | **9** | Overhaul pushes it up, and layout asymmetry carries no accessibility cost. This is where the visual ambition lives. |
| `MOTION_INTENSITY` | **5** | Overhaul pushes up, the audience pulls down. Trust-shopping readers in a second language are not here to be impressed by movement. Motivated reveals only. |
| `VISUAL_DENSITY` | **3** | Airy. Inherited from the outgoing system's one genuinely good instinct, its generosity of space. |

The two modifiers conflicted. Resolution: variance is free, motion is not, so
variance takes the ambition and motion stays disciplined.

---

## 2. The point of view: Arrivals

Everyone in this audience has stood in an arrivals hall reading signs in a second
language, looking for the right exit. They landed knowing their product and not
knowing the terrain. IFN is the person waiting past customs who already knows
where to go.

That gives two design languages that are earned rather than decorative:

**Wayfinding.** Transit and airport signage: maximum contrast, generous scale,
directional, unambiguous. Signage is designed for stressed people reading a
second language, which is the exact constraint `PRODUCT.md` names as a product
requirement. The aesthetic and the accessibility requirement are the same thing
here, which is rare and worth building on.

**Documentary.** Real, unretouched photographs of real meetups. This is the
warmth, and it answers "is this actually real?" in a way that no sentence can.

Those two halves resolve the brand tension `PRODUCT.md` states explicitly: keep
the genuine informal identity of the meetup that worked, and add a professional
layer that makes it fundable. Signage is the professional layer. Documentary is
the community. This is the brand strategy made visual, not a mood board.

**Why not just polish the outgoing system.** "The Long Table" was navy structure
plus rationed amber. It was coherent, but it was also indistinguishable from any
competent B2B startup site, and its central colour pairing could not pass contrast
in the role it was assigned. Retiring it is the point of an overhaul.

---

## 3. Visual system

### 3.1 Palette, with measured contrast

One accent, locked across the whole page. Every value below is computed, not
estimated.

| Token | Value | Role |
|---|---|---|
| `ink` | `#0F1115` | Ground for dark surfaces, and all body text on paper. Off-black, never `#000`. Warm-neutral so it does not read as the retired navy. |
| `paper` | `#FAFAF7` | Default page ground. Off-white, never `#fff`. |
| `arrivals` | `#0B7A53` | The single accent. Green as in cleared, arrived, go. |

| Pairing | Ratio | Requirement | Verdict |
|---|---|---|---|
| `ink` on `paper` (body) | **18.07:1** | 4.5:1 | AAA |
| `arrivals` on `paper` (body text) | **5.12:1** | 4.5:1 | Pass |
| `arrivals` on `ink` (large text) | **3.53:1** | 3:1 | Pass |
| white label on `arrivals` fill | **5.35:1** | 4.5:1 | Pass |

That last row is the one that matters. Welcome Amber could not carry a legible
label on its own fill (2.80:1), could not carry text on white (2.80:1), and
needed two separate correction tokens this session to limp through. `#0B7A53`
works in all three roles unmodified. **The accent is chosen partly because it
passes, which is how it should have been chosen the first time.**

Rejected candidates, for the record: Signal Green `#109D6B` fails as body on
paper (3.32:1); Transit Blue `#1D4ED8` fails as large text on ink (2.82:1).

### 3.2 Type

| Role | Face | Note |
|---|---|---|
| Display and body | **Geist** | OFL, free, self-hostable. Large x-height, unambiguous terminals, a signage grotesque without costume. |
| Data and board | **Geist Mono** | Dates, times, the departure board, numerals. |
| Wordmark only | **MuseoModerno** | Unchanged. `PRODUCT.md` lists it as an existing brand asset. |

Inter is retired. It was defensible on legibility grounds and I defended it twice
this session, but Geist meets the same legibility bar with an actual point of
view, and self-hosting it also removes the render-blocking Google Fonts request
that survived both audits.

Emphasis inside a headline is **italic or weight of the same family**. Never a
second family, never a colour swap as the only signal.

### 3.3 Shape, surface, motion

- **Radius: zero.** Signage does not have rounded corners. This is the sharpest
  break from the outgoing system and it does most of the work of making the page
  feel like a different product. One system, applied everywhere, no exceptions.
- **Rules over cards.** Hairlines and space group content. Cards appear only
  where elevation carries real meaning, which on this page is almost nowhere.
- **Motion at 5:** scroll-reveal stagger on section entry via Motion's
  `whileInView` (skill Section 5.C), and exactly one motivated flourish, the
  departure board resolving its next date on load. No marquee, no parallax, no
  scroll hijack, no GSAP. Everything degrades through the `MotionConfig
  reducedMotion="user"` wrapper already in `App.tsx`.
- **Dark mode: build it.** The site is light-only today, which the skill treats
  as a mandatory gap for a consumer-facing page. `ink` and `paper` swap roles;
  `arrivals` holds. CSS custom properties, one strategy, set once at the root.

---

## 4. Section architecture

Nine sections. The current page runs five of them as card grids, which is the
real reason it reads as competent rather than striking. The skill wants at least
four distinct layout families across eight sections. This plan has eight.

| # | Section | Layout family | What changes |
|---|---|---|---|
| 1 | Hero | Full-bleed media, overlaid asymmetric type | Replaces the CSS glass sphere with the wide room photo. Headline at signage scale, two lines maximum, one primary action. |
| 2 | Partners | Horizontal proof strip | Logos only, no category labels under them. Moves directly under the hero where a trust strip belongs. |
| 3 | What it is for | Asymmetric editorial, two columns of unequal weight | Stops being a card grid. Text and one photo, offset. |
| 4 | What actually happens | Horizontal numbered sequence | The Reuneo pairing, as a signage route rather than three equal cards. |
| 5 | The meetups came first | Full-bleed split, media left | Two photos from visibly different nights, side by side. The strongest available proof of a recurring meetup. |
| 6 | Next meetup | **Departure board** | Monospace, time-ordered, ruled. Dates, venue, the one live action. This component comes out of the concept rather than being applied to it. |
| 7 | Resources | Index directory | A directory board, not cards. |
| 8 | Questions | Disclosure list | Quiet. Unchanged in behaviour, restyled. |
| 9 | Come to one | Full-bleed media, single action | One photo, one sentence, one button. |

Eyebrow budget: nine sections allows at most three eyebrow labels. Plan uses two.

---

## 5. What is preserved, and why the last two rounds were not wasted

This is a **visual** overhaul on a **structurally sound** base. Everything below
carries forward untouched. This is the answer to the reasonable worry about
reworking the same ground twice.

| Preserved | Detail |
|---|---|
| All copy and every truth rule | Austin-first, plain language, zero fabricated claims. The hard part is already done. |
| Information architecture | Every route, slug, anchor and nav label. No SEO migration risk. |
| Accessibility structure | 137 ARIA attributes, 21 roles, the Join dialog's focus trap and restore, labelled fields, `aria-pressed` toggles, live regions, skip link, per-route titles. |
| Correctness fixes | Timezone with DST, server-side join validation, the 404 route, events API fallback state. |
| Component primitives | `Button`, `ButtonLink`, `buttonClasses`, `Container`. They get new token values, not new structure. |
| Performance work | 5.8 MB to 1.4 MB, route splitting, zero infinite animations, the reduced-motion architecture. |
| Admin and legal surfaces | Out of scope. Untouched. |

**Retired deliberately:** the navy and amber tokens, `Emphasis`'s specific colour
logic, Inter, all rounded corners, and the five card-grid section compositions.

The one piece of this session's work that the overhaul discards is the
amber-on-light contrast correction, which is expected: the whole reason it was
needed is that the outgoing accent could not do its job.

---

## 6. Build sequence

Each phase leaves the site shippable.

1. **Tokens and type.** New CSS custom properties, self-hosted Geist and Geist
   Mono, radius to zero, dark-mode variables. Nothing else changes. The whole
   site shifts underneath at once.
2. **Hero.** Highest single lift, and the only section that is currently a
   placeholder rather than a design.
3. **Departure board and partner strip.** The two most concept-specific
   components.
4. **Remaining sections**, in page order.
5. **Motion pass.** Reveals and the one board flourish, reduced-motion verified.
6. **Verification.** Contrast measured with alpha compositing rather than
   eyeballed, both themes, real mobile viewports, `detect.mjs`, then a fresh
   `/impeccable audit`.

Phases 1 and 2 alone deliver most of the visible change.

---

## 7. Open items and risks

| Item | Status |
|---|---|
| **Real photographs** | **Blocking for phases 2 and 4.** Upload folder and shot list are at `public/photos/README.md`. Without them the concept degrades to typographic only, which the skill explicitly warns is incomplete work rather than minimalism. |
| Consent for identifiable faces | Flagged in the photo README. A trust-first brand cannot publish faces without permission. |
| `DESIGN.md` rewrite | Required by an overhaul. Happens at the end of phase 1 so the document describes what is actually shipped. |
| Mobile verification | The browser harness could not resize the tab's viewport in either audit round. Real-device or emulated-viewport checking is needed before sign-off rather than canvas measurement. |
| Stripe links, social URLs, testimonials | Unchanged founder-input items from `AUDIT-2.md`. Not blocking the redesign. |

---

## 8. Pre-flight commitments

Held to at build time, from the skill's Section 14: zero em-dashes; one theme
locked per page; one accent used identically everywhere; one radius system; every
CTA contrast-checked; no CTA label wrapping at desktop; no duplicate CTA intent;
logo wall with no category labels; at most three eyebrows; no three consecutive
image-and-text splits; no section-number labels; no scroll cues; no decorative
status dots; no locale or weather strips; no fake product previews built from
divs; navigation on one line under 80px; real images or labelled placeholder
slots, never decorative SVG filler.
