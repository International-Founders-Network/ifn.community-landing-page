---
name: International Founders Network
description: A signage system for international founders building in Austin. Monochrome structure, one red mark, and the red only marks what a reader can check.
system: "The Sign"
shipped: 2026-08-09
supersedes: "The Long Table (navy + amber + Inter). Retired in full. See Retired Contracts at the end of this file."
modes: [light, dark]
colors:
  light:
    paper: "#FBFBFA"
    band: "#F0F0EC"
    ink: "#131311"
    muted: "#5B5B55"
    rule: "#7C7C74"
    edge: "#6E6E67"
    accent: "#A81B36"
    accent-press: "#93132C"
    on-accent: "#FBFBFA"
  dark:
    paper: "#131311"
    band: "#1D1D1A"
    ink: "#FBFBFA"
    muted: "#A5A59C"
    rule: "#75756D"
    edge: "#82827A"
    accent: "#E85C77"
    accent-press: "#EF7389"
    on-accent: "#131311"
  invariant:
    accent-plate: "#A81B36"
    on-plate: "#FBFBFA"
    scrim: "rgb(19 19 17 / 0.6)"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 5.25rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(1.875rem, 4.6vw, 4rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  emphasis:
    fontFamily: "Archivo, sans-serif"
    fontWeight: 800
    note: "A weight step inside the same family. Never italic, never a second family, never colour."
  lead:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    maxMeasure: "62ch"
  label:
    fontFamily: "Archivo, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.14em"
    textTransform: "uppercase"
  wordmark:
    fontFamily: "MuseoModerno, sans-serif"
    fontWeight: 900
    note: "The IFN. lockup only. Never a heading, never body, never a numeral."
rounded:
  surface: "0"
  control: "9999px"
spacing:
  base: "0.25rem"
  gutter: "1rem"
  gutter-sm: "1.5rem"
  gutter-lg: "2rem"
  section: "7rem"
  section-lg: "9rem"
  hero-gutter: "clamp(1rem, 6vw, 6.5rem)"
  container: "80rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    heights: "44px (sm, md), 56px (lg)"
  button-primary-hover:
    backgroundColor: "{colors.accent-press}"
  button-secondary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    border: "2px {colors.edge}"
    rounded: "{rounded.control}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
  button-on-plate:
    backgroundColor: "{colors.invariant.on-plate}"
    textColor: "{colors.invariant.accent-plate}"
    border: "2px {colors.invariant.on-plate}"
    rounded: "{rounded.control}"
  input:
    backgroundColor: "{colors.band}"
    textColor: "{colors.ink}"
    border: "1px {colors.edge}"
    rounded: "{rounded.control}"
  plate:
    backgroundColor: "{colors.band}"
    border: "1px {colors.rule}"
    rounded: "{rounded.surface}"
  focus-ring:
    boxShadow: "0 0 0 2px var(--paper), 0 0 0 4px var(--ink)"
    note: "Identical in both modes. Never reversed. No ring-offset."
---

# Design System: International Founders Network

## Overview

**Creative north star: "The Sign".**

IFN prints a sign and stands under it every month. On a projector in an Austin
room, the same slide is up at every meetup: a flat ground, `IFN.` small at top
left, a date and an arrow at top right, `International` set light, `Founders`
set enormous and black, `Network` set medium, a metadata row along the bottom,
and exactly one word in red. This system is that object, rebuilt for a screen a
stranger reads at 360px in their second language.

Signage is the discipline of making a stranger certain, at a glance, that they
are in the right room. That is why the aesthetic requirement and the
accessibility requirement point the same way here: poster scale, one voice of
type, flat material, high contrast measured rather than assumed, and one colour
used so rarely that it means something when it appears.

**Inside the sign, one rule governs the colour: the red marks only what you can
check.**

The accent is licensed to exactly three roles and no others.

1. **The mark.** Accent type plus a 3px accent rule under the phrase, applied
   only to a phrase checkable against a named artifact on the same page: a date
   in the events feed, a named partner, a photograph on the page, a standing
   disclosure, or a denial of something IFN does not offer. A denial is the most
   checkable sentence there is.
2. **The primary action.** Accent fill, `--on-accent` label.
3. **The wordmark period**, unchanged from the shipped lockup.

Error states carry no accent at all. That is deliberate: an error is not a
claim, and the colour that means "checkable" cannot also mean "wrong".

**Key characteristics:**

- Two grounds per mode and no more. Every neutral is locked to hue 60, so warm
  and cool greys cannot mix.
- One family, Archivo, doing display, body and numerals. There is no mono face.
- Radius 0 on every surface, full pill on every discrete control. No third value.
- Flat. Zero shadows, zero glows, zero gradients, zero blur, zero glass.
- One accent, three roles, at most two marks in any viewport.
- Emphasis is a weight step inside Archivo, never italic and never colour.
- Motion is transform and opacity only. No pinning, no scrub, no parallax, no
  loops, no scroll listeners.

## Colors

Two grounds per mode, one type colour, one secondary type colour, two
structural greys, and one accent. Twelve tokens total, nine of which swap
between modes and three of which deliberately do not.

Every ratio below was computed with the WCAG relative-luminance formula
(`c/12.92` under 0.03928 else `((c+0.055)/1.055)^2.4`, then
`0.2126R + 0.7152G + 0.0722B`, then `(Lmax+0.05)/(Lmin+0.05)`), against both
grounds in both modes. Alpha composites are done per channel in sRGB gamma
space, which is what browsers do.

### The swapping nine

| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | `#FBFBFA` | `#131311` | Page ground |
| `--band` | `#F0F0EC` | `#1D1D1A` | The only second surface: recessed sections, plate fills, field fills |
| `--ink` | `#131311` | `#FBFBFA` | All body and display type |
| `--muted` | `#5B5B55` | `#A5A59C` | Captions, helper text, placeholders, index metadata |
| `--rule` | `#7C7C74` | `#75756D` | Every 1px structural hairline and every plate border |
| `--edge` | `#6E6E67` | `#82827A` | Control boundaries: input borders, secondary button strokes |
| `--accent` | `#A81B36` | `#E85C77` | The mark, the primary action fill, the wordmark period |
| `--accent-press` | `#93132C` | `#EF7389` | Hover and active on accent fills and accent links |
| `--on-accent` | `#FBFBFA` | `#131311` | The only label colour on an accent **fill** |

### The invariant three

| Token | Value | Role |
|---|---|---|
| `--accent-plate` | `#A81B36` | The closing section's full-bleed field, the same object in both modes |
| `--on-plate` | `#FBFBFA` | Everything that sits on the plate: type, the pill fill, the better focus-ring layer |
| `--scrim` | `#131311` at 60% | The `JoinModal` backdrop, and the only alpha composite on the page |

### Measured contrast, the rows that bind

| Pairing | Light | Dark | Floor |
|---|---|---|---|
| `--ink` on `--paper` | 17.965 | 17.965 | 4.5 |
| `--ink` on `--band` | 16.281 | 16.318 | 4.5 |
| `--muted` on `--paper` | 6.601 | 7.496 | 4.5 |
| `--muted` on `--band` | 5.982 | 6.808 | 4.5 |
| `--accent` as marked type on `--paper` | 7.054 | 5.517 | 4.5 |
| `--accent` as marked type on `--band` | 6.393 | 5.011 | 4.5 |
| `--on-accent` on the `--accent` fill | 7.054 | 5.517 | 4.5 |
| `--on-accent` on `--accent-press` | 8.557 | 6.629 | 4.5 |
| `--rule` hairline against `--paper` | 4.063 | 4.005 | 3.0 |
| `--rule` against `--band` | 3.682 | 3.638 | 3.0 |
| `--edge` against `--paper` | 4.960 | 4.804 | 3.0 |
| `--edge` against `--band` | 4.495 | 4.363 | 3.0 |
| `--on-plate` on the `--accent-plate` | 7.054 | 7.054 | 4.5 |
| `--accent-plate` label on an `--on-plate` pill | 7.054 | 7.054 | 4.5 |
| Focus ring layers against each other | 17.965 | 17.965 | 3.0 |

### The failures, kept on the page because each one produces a rule

| Pairing | Ratio | Rule it produces |
|---|---|---|
| `--accent` against surrounding `--ink` body text, light | 2.547 | **Every inline link carries an underline, in both modes, always.** Colour alone can never identify a link here. WCAG technique G183 measures the link against the surrounding text, not against the ground, and light mode fails it. |
| `--band` plate against the `--paper` ground, tone only | 1.103 light, 1.101 dark | **Every plate carries a full-opacity 1px `--rule` border.** Ground tone alone cannot carry a boundary; the border measures 4.063 and 4.005 and does the work. |
| `--on-accent` on the `--accent-plate`, dark | 2.547 | **This is why `--on-plate` exists.** The naive repair, locking `--on-accent` to `#FBFBFA` in both modes, measures 3.256 on the dark accent fill and fixes the plate by breaking the fill. Two grounds that do not move together need two label tokens. Do not fold them back together. |
| `--rule` at 75% pixel coverage over its own ground | 2.665 light, 2.764 dark | **Hairlines are full-opacity 1px.** Never expressed with `opacity`, never with an alpha colour, never on a fractional device-pixel offset. Full opacity clears the floor by 35.4% light and 33.5% dark; 75% coverage spends all of that and 11.2% more. |
| `--rule` against the `--accent-plate` | 1.736 light, 1.573 dark | **No hairline, table rule or plate border ever terminates on the accent field.** Separation inside the plate is space only. |
| `JoinModal` surface against `--scrim` over the dark page ground | 1.000 | **The modal boundary is carried by its 1px border in dark mode, not by tone.** A 60% scrim over `#131311` composites back to `#131311`. The border is mandatory rather than stylistic. |

### Named rules

**The Checkable Mark Rule.** The accent may only mark a phrase that a reader can
verify against something named on the same page. A marketing adjective can never
be marked, because there is nothing to point at. This is the mechanism that
turns "provable beats impressive" into a constraint the CSS enforces: a
fabricated claim cannot be styled.

**The Two Marks Rule.** No viewport ever holds more than two marks plus the
wordmark period. The nav is fixed, so the period is always on screen and is
always one of them. Verified mechanically by sliding a viewport-tall window down
the rendered document; the home page peaks at exactly two at every width from
390px to 1920px.

**The One Accent Rule.** There is no second brand hue anywhere, including error
states. Errors are `--ink` type plus a 3px `--ink` rule, on both `--paper` and
`--band`, at 17.965 in both modes.

**The Invariant Plate Rule.** Anything that sits on the `--accent-plate` is
theme-invariant, because the plate is. Use `--on-plate`, never the per-mode
`--on-accent`, and never `--paper` or `--ink`.

**The Underlined Link Rule.** Every inline link is underlined in both modes. See
the 2.547 row above.

**The Full-Opacity Hairline Rule.** 1px, full opacity, integer device pixel. No
`opacity`, no alpha colour, no fractional offset.

## Typography

**Display, body and numerals:** Archivo variable (Omnibus-Type), axes
`wght 100..900` and `wdth 62..125`, SIL Open Font License 1.1, self-hosted from
`/fonts/` with `font-display: swap` in two subsets (latin, latin-ext) that carry
an identical axis space.

**Wordmark:** MuseoModerno 900, self-hosted, used by exactly one thing, the
`IFN.` lockup, reached through the arbitrary utility `font-['MuseoModerno']`.

**There is no mono face.** The slide has none. Numerals that need to align use
Archivo's tabular lining figures through `tabular-nums`.

### Hierarchy

- **Hero display:** `clamp(2.75rem, 6vw, 5.25rem)`, `wght 500`, `leading 0.95`,
  `tracking -0.025em`. It runs the full content measure rather than a column,
  which is the slide's own construction. Resolves to 82.0px at 1366 and sets in
  2 lines; 84px at 1920, 2 lines; 44px at 360, 5 lines.
- **Section headline:** `leading 1.02`, `tracking -0.025em`, `wght 500` with the
  emphasised phrase at `800`. Size is set per section against that section's
  job, and the range that shipped runs `clamp(1.875rem, 4.2vw, 3rem)` at the
  quietest (ValueProps) to `clamp(2.25rem, 4.6vw, 4rem)` at the loudest
  (FinalCTA, the page's second-largest type). EventsPreview is deliberately the
  smallest of the nine at `text-3xl md:text-4xl`, because a founder deciding
  whether to come needs the date at display scale before the sentence explaining
  what the date is.
- **Lead paragraph:** 18px, `leading 1.6`, `--muted` or `--ink` by section.
- **Body:** 17px (`1.0625rem`), `wght 400`, `leading 1.6`, measure capped at
  62ch. Declared on the element that carries the 17px, because `ch` resolves
  against the element's own font size: put `max-w-[62ch]` on a 16px container
  and it silently gives a narrower measure than it claims.
- **Label / eyebrow:** 12px, `wght 600`, uppercase, tracking 0.14em to 0.18em,
  `--muted`. Rationed, see below.

### Named rules

**The Weight Ladder Rule.** Emphasis inside a headline is a weight step within
Archivo: `wght 800` against a `500` line, exactly as the slide sets
`International` light against `Founders` black. Never a second family. Never
italic. Never colour, because colour is licensed to checkable phrases and a
headline's most meaningful word is usually not one.

**The One Voice Rule.** Archivo carries every piece of running text. MuseoModerno
is permitted on the wordmark and nowhere else.

**The Tight Display Rule.** Any type at 30px or above takes `-0.025em` tracking
and line-height at or below 1.02, and the h1 takes 0.95.

**The Eyebrow Budget.** At most one eyebrow per three sections. The home page has
nine sections and a budget of three; it uses two, on the Hero
("Monthly meetups in Austin, Texas") and on PartnersStrip ("Who we work with").
An eyebrow is a small uppercase tracked label sitting **above a section
headline**. A label inside a box, a datum inside a date block, a footer column
heading and a form legend are not eyebrows and do not count against the budget.

## Layout

The default container is `max-w-7xl` (1280px) with responsive gutters of
16 / 24 / 32px. The Hero is the one exception: it takes its own asymmetric page
gutter of `clamp(1rem, 6vw, 6.5rem)` outside the container, resolving to 82.0px
at 1366 and 104px at 1920, because a poster runs to the page edge.

Sections run `py-28 md:py-36` (112px, 144px). The Hero and the closing accent
field both run `min-h-[100dvh]`, never `h-screen`.

Vertical rhythm and asymmetry do the separating. There are almost no rules on
this page, and the ones that exist organize real content: one spine in
HowItWorks, one hairline over the FounderStory rail, one per FAQ cluster, one
per events index row.

### The nine layout families

The Section-Layout-Repetition ban is the hardest rule on a nine-section page, so
each family is recorded by its geometry rather than by a label, and the two
closest neighbours are told apart explicitly.

| # | Section | Family | The geometry that makes it distinct | Ground |
|---|---|---|---|---|
| 1 | Hero | Poster stack over a full-bleed photographic band | h1 runs the full measure as a three-weight ladder inside its own `clamp(1rem, 6vw, 6.5rem)` gutter, then the band breaks the container edge to edge | `--paper` |
| 2 | ValueProps `#mentorship` | Staircased statements in open space | 12-col grid, four rows whose column-start walks 1, 3, 2, 4 at spans 7 / 8 / 7 / 8, so both edges are ragged. No rules, no containers, no icons | `--paper` |
| 3 | HowItWorks | Single-rule sequence with unequal stops | One 2px `--rule` spine across the container with three ticks, stops at `1fr 2fr 1fr`, only the wide middle stop carries an image | `--band` |
| 4 | FounderStory | Prose measure with a hanging gutter rail | Two tracks at `minmax(0,36rem) minmax(0,17rem)`, both capped so surplus width falls off the right edge; the rail hangs beside the prose on grid row 2, never beside the headline | `--paper` |
| 5 | EventsPreview `#events` | Masthead plus ruled register | One datum at display scale (`clamp(2.75rem, 7vw, 4.5rem)`, `tnum`, accent, arrow) over a baseline row of its supporting facts, then a compact index of up to four dates, one hairline per row | `--paper` |
| 6 | PartnersStrip `#partners` | Logo baseline with running prose | Three marks on one optical baseline at unequal heights and wide gaps, one 65ch paragraph beneath, nothing printed under any individual mark, and deliberately no hairline under the row | `--band` |
| 7 | ResourcesPreview `#resources` | Horizontal scroll-snap rail | Panels at unequal widths cycling 24rem / 19rem / 21rem on a native snap rail that bleeds to the container edge, grounds alternating `--paper` and `--band` on a cycle keyed off the last stage panel so the `--band` terminal panel is always the first tint after a `--paper` one, each panel's focusable link carried on its stage name, filter chips above as a second snap row | `--paper` |
| 8 | FAQ `#faq` | Clustered disclosure register | Eight rows in three named clusters, **one** hairline per cluster and space between rows inside a cluster | `--band` |
| 9 | FinalCTA | Full-bleed accent field | The page's one colour block, edge to edge, content distributed head to foot across a full-height ground | `--accent-plate` |

**Five and eight are the closest pair and here is the discriminator.**
EventsPreview rules **every** row of its index and hangs a display-scale datum
above it. FAQ rules **only** its three cluster headings and separates rows by
space. One is a masthead over a ruled index; the other is space inside ruled
groups. They are also different section grounds and different interaction
models.

**Exactly one section is an image-plus-text split** (HowItWorks, section 3), so
the zigzag alternation cap of two consecutive splits is not approached. The Hero
band is full-bleed rather than a split, and no other section carries a
photograph.

### Named rules

**The Ragged Edge Rule.** Asymmetry is produced by grid geometry that is printed
in the component, not by ad-hoc margins. Every asymmetric layout declares its
sub-768px collapse in the same file that declares the asymmetry.

**The Whitespace-Not-Rules Rule.** Sections are separated by a change of ground
tone (`--paper` to `--band`) and by space. A horizontal rule between two sections
is not part of this system.

**The Anchor Clearance Rule.** The navbar is 64px plus a 1px bottom edge, so
`:target` and `section[id]` carry `scroll-margin-top: 4.5rem` (72px). Retune it
in the same commit as any change to the bar's height.

## Material

**The page is flat.** Zero shadows, zero glows, zero gradients (including in
display type), zero blur, zero glass, zero `backdrop-filter`. Separation is
carried by ground tone, by full-opacity 1px `--rule` hairlines that clear 3:1 on
every ground, by plate borders, and by space.

**The only non-flat surfaces on the page are the photographs.**

### The Plate Rule

**No type sits on a photograph anywhere on this site.** This is a measurement,
not a preference: an ink scrim composited over the worst real pixel inside a
candidate frame's type zone needs an alpha that erases the photograph before it
reaches AAA. Every caption sits outside its frame. This deletes an entire class
of uncomputable contrast case (scrims, ghost buttons over images, per-pixel
variation, dark-mode veil alphas) rather than mitigating it, which is why no
veil token exists in the palette.

## Shape

**One radius rule, two values, no third.**

- **Every non-interactive surface is radius 0.** Plates, photographic frames, the
  events index, disclosure rows, the accent field.
- **Every discrete interactive control is full pill.** Buttons, inputs, the
  resources filter chips, the nav action.
- **Boundary, stated because it otherwise breaks on contact:** "control" means a
  *discrete* control. Full-width interactive rows (FAQ disclosure triggers,
  events index rows) and nav links stay radius 0 and carry their pressability
  through the focus ring, not through shape.

The reason is wayfinding, not taste. Shape tells a reader what can be pressed
before they read the label and independent of language or colour, which is the
strongest non-verbal affordance available to a substantially second-language
audience. It also resolves a collision: MuseoModerno is a rounded geometric
logotype, and on an all-square page it would be the only curved object on
screen. Here the wordmark rhymes with the controls.

Borders are 1px `--rule` on surfaces and 1px `--edge` on inputs, with one
exception: the outline button and the plate pill take a 2px stroke, because a
transparent or inverted button needs the extra weight beside a filled one.

Icons come from `lucide-react` at `strokeWidth` 1.5, every glyph `aria-hidden`.
One family, no hand-rolled paths.

## Components

### Buttons

- **Shape:** full pill. Heights 44px (sm and md) and 56px (lg), padding 20 / 24 /
  32px. 44px is the touch floor and it is encoded in `SIZES` in
  `src/lib/buttonStyles.ts`, which governs every control on the site.
- **Primary:** `--accent` fill, `--on-accent` label, hovering to
  `--accent-press`. 7.054 light, 5.517 dark.
- **Secondary:** `--ink` fill, `--paper` label. 17.965 in both modes.
- **Outline:** `--paper` fill, 2px `--edge` stroke, `--ink` label. 4.960 stroke,
  17.965 label. Never a transparent button with no border.
- **Ghost:** no fill, `--muted` label, hovering to `--band` with an `--ink`
  label.
- **On the accent plate:** the primary button inverted onto its own field, an
  `--on-plate` fill carrying an `--accent-plate` label with a 2px `--on-plate`
  stroke, 7.054 in both modes and both directions. It is deliberately **not** a
  `--paper` fill with an `--ink` label: `--paper` is per-mode and a dark-mode
  `#131311` pill on the plate measures 2.547 at its boundary.
- **Feedback:** 150ms colour transition on hover; `translate-y-px` plus
  `scale(0.985)` on `:active`. No movement on hover.
- **Focus:** `box-shadow: 0 0 0 2px var(--paper), 0 0 0 4px var(--ink)`. No
  `ring-offset`. Identical in both modes and never reversed, because `--paper`
  is always the page colour and `--ink` is always the type colour, so the
  construction already inverts itself when the tokens swap. Writing a reversal on
  top of the swap inverts it twice and collapses the ring to one line. Swept
  across all 256 grey values, the better layer never drops below 4.264.

### Inputs and fields

- Full-width, `--band` fill, 1px `--edge` border, full pill, label **above** the
  field. No placeholder-as-label, ever.
- Placeholder is `--muted` on `--band`: 5.982 light, 6.808 dark.
- Helper text is `--muted` on `--paper`: 6.601 light, 7.496 dark.
- **Error is `--ink` type plus a 3px `--ink` left rule and no fill.** 17.965 on
  every ground in both modes. No accent, no second hue, no coloured slab.

### Plates

`--band` fill, 1px `--rule` border, radius 0. The border is mandatory: ground
tone alone measures 1.103 against `--paper`, which is too weak to carry a
boundary. A plate never terminates a hairline on the accent field.

### Full-width interactive rows

FAQ disclosure triggers and events index rows. Radius 0. **They never use a
ground swap for hover**, because FAQ sits on `--band` and a `--band` hover ground
would measure 1.000 against its own section. The row's 1px `--rule` hairline
promotes to a 2px `--edge` instead, which measures 4.960 on `--paper` and 4.495
on `--band` and works identically on every ground in both modes.

### The snap rail

`role="group"` with an `aria-label`, `tabindex="0"` so it is reachable and
scrollable by keyboard, `snap-x snap-mandatory`, panels at unequal widths, and a
focusable link inside every panel so Tab reaches all of them. The filter chips
above it keep their labelled `role="group"`, their `aria-pressed` state and the
44px floor.

### Navigation

Fixed, 64px at rest plus a 1px `--rule` bottom edge, flat, solid `--paper`, one
line at `lg`, no transparent state, no backdrop blur, no height change on
scroll, and therefore no scroll listener. One action at the right edge.

### The modal

`--paper` surface, `--band` field fills, a 1px `--rule` border, over a
theme-invariant `--scrim` of `#131311` at 60%. In light mode the boundary is
carried by tone (4.793 over `--paper`); in dark mode the scrim composites back
to the page ground and the boundary is carried entirely by the border (4.005).
Both modes clear 3:1 by different means, which is stated rather than assumed. The
focus trap restores focus to the opener, the body scroll lock restores the prior
overflow, and the `role="status"` region is permanently mounted.

## Motion

`MOTION_INTENSITY 4`. Six behaviours, all transform or opacity, all in the
installed `framer-motion`. No GSAP, no three.js, no pinning, no scrub, no
parallax, no marquee, no counters, no infinite loops, and no
`window.addEventListener('scroll')` anywhere in the tree.

| # | Behaviour | Why it earns its place | Reduced motion |
|---|---|---|---|
| 1 | Hero copy block translates `y` 16px to 0 over 700ms | Establishes reading order at the top of the page | Renders at rest |
| 2 | **The mark draw:** a 3px accent rule scales `scaleX(0)` to `scaleX(1)` from the left over 260ms, `whileInView`, once | It enacts the system's whole idea, a hand marking the checkable parts in reading order. It is the only animation here that carries meaning rather than polish | Resting state is `scaleX(1)`, so the mark is drawn with JavaScript disabled and under reduced motion |
| 3 | Section entry: `whileInView` `y` 16px plus opacity, 60ms stagger, once, `amount: 0.25`, non-LCP content only | Reveals content in reading sequence | Renders at rest |
| 4 | The HowItWorks spine draws left to right via `scaleX` with `transform-origin: left` | The line **is** the sequence, so drawing it communicates order rather than decorating it | Renders full width instantly |
| 5 | The cycling headline word rolls vertically inside an `overflow-hidden` slot on a 3000ms interval, transform only | It is three ways this audience names itself, and a roll says "and also this" without ranking them | Hand-written `useReducedMotion` early return, settles on "International" |
| 6 | Controls take `translateY(1px)` and `scale(0.985)` on `:active` plus a 150ms hover colour transition | Physical feedback on the page's one action | Transform kept; it is instantaneous feedback rather than an animation |

### The LCP guard, absolute

**No ancestor of the h1, the subtext, the CTAs or the hero band may animate
`opacity`, `clip-path` or `mask`, or use `whileInView`.** Opacity composites
multiplicatively down the ancestor chain, and a single-element read of
`getComputedStyle(h1).opacity` cannot detect it: an audit once reported this
fixed while the hero was rendering at effective opacity 0. A transform-only
entrance degrades to "sits 16px low", never to a blank page.

### Descender clearance

Any clipped or rolling type slot containing a descender (`y g j p q`) runs
`leading-[1.15]` minimum with `pb-1` reserve, applied identically to the visible
element and to any invisible sizing twins so the slot's metrics stay in
agreement. The hero's cycling word contains "Immigrant".

## Photography

Real documentary photography only. Two frames ship on the home page, both from
one April meetup, separated by subject and scale rather than by date: a full room
seen from behind the back row in the hero band at 2.4:1, and one conversation at
close range in the HowItWorks middle stop at 1093:874.

- Derivatives are built at build time by `scripts/build-photos.mjs` from
  `assets/photos-source/` (which stays outside `public/`) against a checked-in
  manifest, and delivered as AVIF plus WebP through `<picture>` with `srcset`
  and `sizes`. Sources are never published.
- **Every `<img>` carries explicit `width` and `height`.** Verified on the
  rendered page: three images, zero missing dimensions.
- Alt text is written by hand per photograph and describes the room. It **names
  no individual**, because consent to appear in a photograph is not consent to
  be named in markup, and it **names no venue**, because the venue is stated by
  the events feed where it can be kept current.
- Grade is baked in at build: per-night white balance, saturation to about 0.55,
  black point lifted 4%, white point pulled to 92%. No duotone, no heavy
  stylisation. The amateurness of these photographs is the credibility.

**These photographs do not prove recurrence.** Neither prints a date and both
come from one evening. Recurrence is carried by one sentence of copy and by
nothing else. The events index is upcoming-only and can never evidence past
recurrence.

## Dark mode

Dark mode is live site-wide, with a three-state footer toggle (system, light,
dark).

- The light palette is declared on bare `:root`. The dark palette is declared
  twice: once under `@media (prefers-color-scheme: dark)` guarded as
  `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`,
  so a manual choice wins in **both** directions.
- `color-scheme: light dark` is declared on `:root` and narrowed to the chosen
  scheme by the two attribute rules, so form control internals, scrollbars, the
  caret and the native `<select>` popup follow the choice.
- `index.html` carries a classic non-deferred bootstrap on
  `localStorage['ifn-theme']`, so there is no flash.
- Nine custom properties swap. Nothing else in the tree is mode-aware: there is
  no `dark:` variant anywhere, because `@theme inline` compiles `.text-accent`
  to `color: var(--accent)` and the swap retargets every utility at once.

**Test both modes before shipping anything.** Section heights are theme
invariant (verified at five viewports in both modes, identical to the pixel), but
contrast is not.

## Do's and Don'ts

### Do

- **Do** mark only what a reader can check on the same page, and mark it with
  accent type plus a 3px accent rule.
- **Do** emphasise with a weight step inside Archivo: `800` against a `500` line.
- **Do** keep every surface at radius 0 and every discrete control at full pill.
- **Do** draw hairlines at full opacity, 1px, on integer device pixels.
- **Do** underline every inline link, in both modes.
- **Do** use `--on-plate` for anything sitting on the accent field, and
  `--on-accent` only on a per-mode accent fill.
- **Do** put explicit `width` and `height` on every image, and re-measure the
  `Suspense` fallback heights in `src/pages/Home.tsx` whenever a section's
  composition changes.
- **Do** write plainly. The audience is largely reading in a second language;
  expand acronyms on first use and avoid American idiom.

### Don't

- **Don't** use the accent for anything that is not one of its three licensed
  roles. Never for an error, never for a decorative dot, never for a status chip.
- **Don't** put more than two marks in one viewport.
- **Don't** italicise for emphasis, and don't emphasise with colour alone.
- **Don't** introduce a second family, a mono face, or a serif.
- **Don't** add a shadow, a glow, a gradient, a blur or a glass surface. The page
  is flat and the photographs are the only texture.
- **Don't** set type over a photograph. Captions go outside the frame.
- **Don't** terminate a hairline on the accent field. Separation there is space.
- **Don't** reverse the focus ring per mode, and don't reintroduce `ring-offset`
  without an explicit `ring-offset-paper` beside it.
- **Don't** put an eyebrow above every section. The budget is one per three
  sections and the home page has already spent two of three.
- **Don't** put `border-t` and `border-b` on every row of a list. Group into
  clusters with one rule each.
- **Don't** reach for `window.addEventListener('scroll')`, a marquee, a pinned
  section or an infinite loop.
- **Don't** hotlink a third-party favicon as a brand mark. Vendor real artwork
  into `public/partners/`, or ship a labelled reserved slot until it arrives.
- **Don't** publish invented statistics, logos, or attributed testimonials.
  Community-scale claims are a standing credibility risk for this audience. See
  PRODUCT.md's Evidence on Hand for what is real.

## Retired contracts

Recorded rather than deleted, because this file previously specified a contract
that twelve correct components then implemented correctly and wrongly. If any of
the following reappears in a review, it is a regression and not a revival.

| Retired | Replaced by | Why |
|---|---|---|
| Deep Harbor navy `#0f172a` and the slate ramp | `--ink` `#131311` and a hue-60 neutral family | The navy was byte-identical to Tailwind `slate-900` and produced four invisible-element bugs, including a focus ring that could not be seen. |
| Welcome Amber `#f97316` | `--accent` `#A81B36` light, `#E85C77` dark | Amber as text on the old page ground measured 2.679 against a 3:1 floor. It was a system-level defect mandated by this document. |
| Inter | Archivo variable | One family for display, body and numerals, self-hosted, with a real weight axis to carry emphasis. |
| The Italic Welcome headline (one italic amber word) | The weight ladder, `800` against `500` | Italic clipped the descender on "Immigrant" and carried emphasis in a hue, which a colourblind reader cannot see. This was the documented brand signature and its loss is a real cost, named rather than hidden. |
| The dark inset slab with blurred corner orbs | The `--accent-plate` closing field | Two dark navy slabs inverted the page mid-scroll. Blurred orbs are banned by the flat-material rule. |
| The radius ladder (4 / 8 / 12 / 16 / 24 / full) | Radius 0 on surfaces, full pill on discrete controls | Five radii cannot tell a reader what is pressable. Two can. |
| Resting shadows, the CTA action glow, backdrop blur | Nothing | Flat material. |
| The transparent-then-blurred scrolling navbar | A flat solid 64px fixed bar | It required a scroll listener, which is banned. |
| The three-appearance amber ceiling | The two-marks rule plus the checkable licence | A count without a licence still permits decorative colour. |
| The hand-rolled CSS globe medallion and `GlobeIcon` | The hero photographic band | A globe is a stock idea of internationalism. A photograph of the actual room is evidence. |
| Google Fonts `<link>` | Self-hosted `@font-face` with `font-display: swap` | One fewer render-blocking third-party request. |
| Em-dashes and en-dashes | Periods, commas, colons, parentheses, hyphens | Zero across `src/` and `index.html`, and it is a pass condition. |
