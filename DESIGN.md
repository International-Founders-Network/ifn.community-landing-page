---
name: International Founders Network
description: A warm, professional community interface for international founders building in Austin — navy structure, amber welcome.
colors:
  deep-harbor: "#0f172a"
  deep-harbor-light: "#1e293b"
  deep-harbor-abyss: "#020617"
  welcome-amber: "#f97316"
  welcome-amber-deep: "#ea580c"
  welcome-amber-ink: "#0f172a"
  paper: "#ffffff"
  harbor-mist: "oklch(98.4% 0.003 247.858)"
  harbor-haze: "oklch(96.8% 0.007 247.896)"
  hairline: "oklch(92.9% 0.013 255.508)"
  field-edge: "oklch(86.9% 0.022 252.894)"
  quiet-ink: "oklch(70.4% 0.04 256.788)"
  meta-ink: "oklch(55.4% 0.046 257.417)"
  body-ink: "oklch(44.6% 0.043 257.281)"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.1em"
  wordmark:
    fontFamily: "MuseoModerno, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    letterSpacing: "-0.05em"
rounded:
  sm: "0.25rem"
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
  3xl: "1.5rem"
  full: "9999px"
spacing:
  base: "0.25rem"
  gutter: "1rem"
  gutter-lg: "2rem"
  card-pad: "1.5rem"
  card-pad-lg: "2rem"
  section-tight: "5rem"
  section: "6rem"
  section-loose: "8rem"
components:
  button-primary:
    backgroundColor: "{colors.welcome-amber}"
    textColor: "{colors.deep-harbor}"
    rounded: "{rounded.lg}"
    padding: "0 1.5rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.welcome-amber-deep}"
  button-secondary:
    backgroundColor: "{colors.deep-harbor}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "0 1.5rem"
    height: "2.75rem"
  button-secondary-hover:
    backgroundColor: "{colors.deep-harbor-light}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.deep-harbor}"
    rounded: "{rounded.lg}"
    padding: "0 1.5rem"
    height: "2.75rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.lg}"
    padding: "0 1.5rem"
    height: "2.75rem"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.deep-harbor}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
    width: "100%"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.card-pad-lg}"
  badge:
    backgroundColor: "{colors.harbor-haze}"
    textColor: "{colors.meta-ink}"
    rounded: "{rounded.full}"
    padding: "0.5rem 1rem"
    typography: "{typography.label}"
---

# Design System: International Founders Network

## Overview

**Creative North Star: "The Long Table"**

Austin communal hospitality given professional footing. The organizing image is a long table where everyone gets a seat and room to spread out — nobody perched, nobody crowded, no head of the table. That translates directly into the system's most consistent physical property: generosity of space. Containers run wide (1280px), section gaps run deep (80–128px), and cards breathe at 24–32px of internal padding. When a layout feels tight here, it has stopped being the long table.

The interface has two voices and it needs both. **Deep Harbor** navy carries nearly all the structure — headings, buttons, dark feature slabs, the wordmark — and it does the work of looking like a real organization rather than a hobby group. **Welcome Amber** carries the warmth, and it is deliberately rare: an italic word in a headline, the period after the logo, the primary action. The ratio is the design. Navy everywhere and amber nowhere reads as corporate and cold; amber spread across a page reads as a marketing funnel. Neither is IFN.

Surfaces are honest and quiet: white and near-white grounds, hairline borders instead of heavy chrome, flat cards that lift only when you reach for them. Depth is a response to intent, not a decoration applied at rest. The audience is arriving in an unfamiliar country and shopping specifically for trustworthiness, so the system leans on clarity, whitespace, and restraint rather than on visual persuasion. The one place it permits real drama is the dark inset slab — a navy panel with deeply rounded corners, floated inside the page margins with soft colored light bleeding from its corners.

**Key Characteristics:**

- Generous vertical rhythm; sections separated by 80–128px, never crowded
- Two carrying colors — structural navy, rare amber — over a cool slate neutral ramp
- One typeface (Inter) doing all the work, with a single display face reserved for the wordmark
- Flat at rest, hairline borders, elevation only on hover and focus
- Rounded but not soft: 16px cards, 8px buttons, full-round pills
- Motion is short, upward, and once — a 20px rise into place, never a loop

## Colors

A cool, near-monochrome navy-and-slate system interrupted by a single warm accent that is rationed on purpose.

### Primary

- **Deep Harbor** (`#0f172a`): The structural voice of the entire system. Every heading, every dark section, the wordmark, secondary buttons, and all high-emphasis text. It is the same value as the neutral ramp's darkest step, which is why the system reads as genuinely monochrome rather than as navy applied over gray. Two supporting steps exist: **Deep Harbor Light** (`#1e293b`) for hover states on navy surfaces and base body text, and **Deep Harbor Abyss** (`#020617`) for the deepest backgrounds.

### Secondary

- **Welcome Amber** (`#f97316`): Warmth and action. It appears on primary buttons, the italicized emphasis word in headlines, the period in the IFN wordmark, and small iconographic highlights — and essentially nowhere else. **Welcome Amber Deep** (`#ea580c`) is its hover state. This is signal warmth, not urgency: it says *welcome*, not *buy now*.

  **Text set on an amber fill is Deep Harbor, never white.** White on `#f97316` measures 2.80:1 and fails WCAG AA for both normal and large text; Deep Harbor on the same fill measures 6.37:1. The amber itself is unchanged — only the label colour is. This is recorded as **Welcome Amber Ink** (`#0f172a`, the `--color-accent-ink` token).

### Neutral

- **Paper** (`#ffffff`): The default page ground and the fill of every card and input.
- **Harbor Mist** (`oklch(98.4% 0.003 247.858)`): Section alternation. The primary tool for separating one band of content from the next without drawing a line.
- **Harbor Haze** (`oklch(96.8% 0.007 247.896)`): Placeholder surfaces, image wells, badge fills, ghost-button hover.
- **Hairline** (`oklch(92.9% 0.013 255.508)`): The default border for cards and dividers. Present but barely.
- **Field Edge** (`oklch(86.9% 0.022 252.894)`): Input borders only — one step darker than a card border, because a field must read as enterable.
- **Quiet Ink** (`oklch(70.4% 0.04 256.788)`): Inline icons beside metadata, disabled and empty states.
- **Meta Ink** (`oklch(55.4% 0.046 257.417)`): Eyebrow labels, timestamps, captions, footnotes.
- **Body Ink** (`oklch(44.6% 0.043 257.281)`): All body copy and paragraph text. Body text is never pure navy — that weight belongs to headings.

*Note on formats: the project's own tokens are authored as hex in `src/index.css`, while the neutral ramp is Tailwind v4's slate scale emitted as OKLCH. Both are preserved in their native form rather than converted, so neither has a second source of truth.*

### Named Rules

**The Rationed Amber Rule.** Welcome Amber appears at most three times in a single viewport, and never on two adjacent elements. Its scarcity is what makes it read as warmth instead of as a call-to-action pattern. If a screen needs a fourth amber moment, the screen has a hierarchy problem, not a color problem.

**The Monochrome Spine Rule.** Structure — layout, borders, type, dark surfaces — is built entirely from navy and the slate ramp. Color is never load-bearing. Remove every amber pixel and the page must still be completely legible and correctly ordered.

**The Navy-On-Navy Rule.** Deep Harbor (`#0f172a`) is byte-identical to Tailwind's `slate-900`, so navy drawn on a dark slab self-cancels — it renders at roughly 1.1:1 and disappears. On any dark surface, never use `text-primary`, `bg-primary` or `ring-primary`. Use white, Quiet Ink, or Welcome Amber instead. This single collision produced four separate invisible-element bugs before it was caught.

**The Two-Color Ceiling Rule.** The palette is navy plus amber plus neutrals. There is no third brand color. A teal was previously declared in the theme and used exactly once; it has been cut. New hues require a real, recurring semantic job — not a single badge.

## Typography

**Body & Display Font:** Inter (with `sans-serif` fallback), loaded from Google Fonts at weights 400/500/600/700
**Wordmark Font:** MuseoModerno (with `sans-serif` fallback), weights 400–900 — **used exclusively for the "IFN." logotype**, never for headings or body

**Character:** A single-voice system. Inter does everything — display headlines, section headings, card titles, body copy, and uppercase labels — and the hierarchy is carried entirely by size, weight, and tracking rather than by contrast between faces. The effect is plain-spoken and utilitarian, which suits an audience reading in a second language. MuseoModerno's geometric warmth appears only in the wordmark, where its personality is a signature rather than a texture.

### Hierarchy

- **Display** (700, 36px → 48px → 60px responsive, line-height 1.15, tracking -0.025em): Hero and page-opening headlines only. Always tightly tracked; the tightening is what keeps large Inter from looking like a system dialog.
- **Headline** (700, 30px → 36px, line-height ~1.2, tracking -0.025em): Section headings within a page. Frequently centered above a max-width intro paragraph.
- **Title** (700, 20px, line-height ~1.4): Card headings, benefit titles, event names.
- **Body** (400, 18px lead / 16px default, line-height 1.625): Paragraph text in Body Ink. Lead paragraphs under a headline take 18px; everything else takes 16px. Constrain measure to roughly 65–75 characters — `max-w-2xl`/`max-w-3xl` on centered intros.
- **Label** (700, 12px, letter-spacing 0.1em, uppercase): Eyebrows, category tags, stat captions, date badges. Usually Meta Ink.

### Named Rules

**The Italic Welcome Rule.** The system's signature typographic move is exactly one italicized word inside an otherwise upright headline, set in Welcome Amber — *"Where **Immigrant** Founders Connect"*, *"IFN **Membership**"*, *"Our **Partners**"*. One word, never two, and it is the word carrying the meaning of the headline — the thing the page is actually about. This is the single most recognizable thing about IFN's typography and it should appear on essentially every page-opening headline.

**The One Voice Rule.** Inter carries every piece of running text on the site. MuseoModerno is permitted on the wordmark and nowhere else — not on headings, not on numerals, not on pull quotes. A second display face would break the plain-spoken register the audience depends on.

**The Tight Display Rule.** Any type at 36px or above takes negative tracking (-0.025em) and line-height at or below 1.2. Large Inter set at default tracking reads as an operating system, not as a brand.

## Layout

A centered, single-column-of-sections model. The default container is 1280px (`max-w-7xl`) with responsive gutters of 16px / 24px / 32px; narrower variants at 768px, 1024px, and 1152px are available for reading-width content, and centered intro copy is constrained to roughly 672–768px regardless of container.

Vertical rhythm is the system's defining spatial property, built on a 4px base unit. Standard sections take 96px of vertical padding; tighter bands take 80px; dark feature slabs take 128px. Content blocks within a section separate by 64px, cards within a grid by 32px, and stacked elements inside a card by 12px. **Whitespace is the primary compositional device** — there are almost no rules or dividers in the system, because bands of near-white and generous gaps do that work instead.

Grids are simple and predictable: three-column card grids collapsing to one on mobile (`grid md:grid-cols-3 gap-8`), and two-column split layouts for narrative sections (`lg:grid-cols-2 gap-20`) that stack on tablet. Responsive behavior is stepped rather than fluid — sizes jump at breakpoints (640 / 768 / 1024 / 1280px) rather than scaling continuously with `clamp()`.

The page is topped by a fixed navigation bar that begins transparent with 24px of vertical padding and, past 20px of scroll, transitions to a translucent white bar with backdrop blur, a hairline shadow, and 16px padding. Because of it, every page's first section carries top padding of at least 96px.

### Named Rules

**The Breathing Room Rule.** No section is separated from its neighbor by less than 80px on desktop. When a page feels cramped, the fix is vertical space, not smaller type.

**The Whitespace-Not-Rules Rule.** Sections are separated by changes in background tone (Paper ↔ Harbor Mist) and by space. Horizontal rules between sections are not part of this system.

## Elevation & Depth

**Flat at rest, lifted on intent.** Surfaces sit flush against the page with a hairline border and no shadow in their resting state; elevation is a response to the user reaching for something. Cards raise on hover with a soft shadow and a one-step-darker border, over a 300ms transition. Depth is therefore behavioral, not decorative, which keeps a page of a dozen cards visually calm.

There is exactly one persistent exception: the primary call-to-action carries a soft navy-tinted glow at rest (`shadow-lg`/`shadow-xl` in Deep Harbor at 20% opacity). It is the only element in the system permitted to float when nobody is touching it, and that privilege is what marks it as the primary action.

### Shadow Vocabulary

- **Hairline** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): The scrolled navigation bar. Just enough to separate it from content beneath.
- **Card Lift** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Card hover state.
- **Panel Lift** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): Floating overlay elements — modals, the offset stat card, hover on large feature cards.
- **Action Glow** (`box-shadow: 0 10px 15px -3px rgb(15 23 42 / 0.2)`): The persistent tinted glow beneath primary CTAs. Navy-tinted, never neutral-gray.

### Named Rules

**The Flat-By-Default Rule.** A new surface gets a hairline border and no shadow. If it needs to be distinguished further, the answer is a background tone change, not elevation. Shadows are reserved for hover, focus, overlay, and the primary action.

## Shapes

Rounded but not soft — the corner language is consistent and scales with the size of the element, on a five-step ramp: 4px, 8px, 12px, 16px, 24px, plus fully round.

**Fully round** (9999px) is the most-used value in the system and belongs to anything pill-shaped or circular: eyebrow badges, category tags, avatars, status dots, icon wells, and the blurred light orbs inside dark slabs. **16px** is the card radius — benefit cards, event cards, stat panels, feature containers. **12px** covers inset elements: image wells inside cards, date badges, and inset CTA panels. **8px** is the interactive radius — buttons and form fields both take it, which is what visually pairs a submit button with the field above it. **24px** is reserved for large dark slabs.

Borders are always 1px and always hairline-weight, with one exception: the outline button variant takes a 2px navy border, because a transparent button needs the extra weight to hold its own beside a filled one. Icons come from Lucide at 1.5px stroke weight, sized 16px inline with text, 20–24px standing alone, and 48px in empty states.

### Named Rules

**The Radius Ladder Rule.** Radius scales with element size: fields and buttons 8px, inset elements 12px, cards 16px, large slabs 24px, pills fully round. An element that is smaller than its neighbor never carries a larger radius than it.

**The Hairline Border Rule.** Borders are 1px, in Hairline for surfaces and Field Edge for inputs. A border heavier than 1px means the element is either an outline button or a mistake.

## Components

### Buttons

- **Shape:** Gently rounded (8px), fully rounded on pill variants. Heights are fixed at 36px (sm), 44px (md), 56px (lg) with horizontal padding of 16px / 24px / 32px.
- **Primary:** Welcome Amber fill, **Deep Harbor label** (never white — see Colors), semibold weight. The single highest-intent action on a view. Hovers to Welcome Amber Deep. Large primary CTAs carry the navy Action Glow.
- **Secondary:** Deep Harbor fill, white label. Used when an amber button would over-emphasize, or when two actions sit side by side and only one can be amber.
- **Outline:** 2px Deep Harbor border, navy label, transparent fill; hovers to a 5% navy wash. The standard companion to a primary button.
- **Ghost:** No fill or border, Body Ink label; hovers to navy text on a Harbor Haze wash. Tertiary and in-table actions.
- **Hover / Focus:** Color transitions only — no movement on hover. Focus shows a 2px ring in the button's own color, offset by 2px. Press compresses the button to 98% scale.
- **On dark surfaces:** pass `onDark`. A navy focus ring is invisible against Deep Harbor, so the ring switches to amber or white and the offset colour switches to the slab.

### Inputs / Fields

- **Style:** Full-width, white fill, 1px Field Edge border, 8px radius, 16px horizontal and 8px vertical padding. Labels sit above the field in 14px medium Body Ink.
- **Focus:** The border shifts to Deep Harbor and a soft 20%-opacity navy ring appears around it. The native outline is suppressed and replaced, never simply removed.
- **Error:** Border and helper text shift to a warm red; the helper message sits beneath the field and is referenced by `aria-describedby`.
- **Disabled:** Harbor Haze fill, Quiet Ink text, no border shift.

### Cards / Containers

- **Corner Style:** 16px.
- **Background:** Paper on tinted sections, Paper or Harbor Mist on white sections.
- **Border:** 1px Hairline, deepening one step on hover.
- **Shadow Strategy:** None at rest; Card Lift on hover over 300ms. See Elevation & Depth.
- **Internal Padding:** 24px for dense cards with media, 32px for text-only cards.
- **Behavior:** Cards in a grid are equal-height with the action pinned to the bottom, separated from the content above by a hairline rule and 24px of space.

### Navigation

- **Style:** Fixed to the top, full width. Transparent with 24px vertical padding at rest; past 20px of scroll it becomes 90%-opacity white with backdrop blur, a Hairline shadow, and 16px padding, over a 300ms transition.
- **Links:** 14px medium Meta-to-Body Ink, transitioning to Deep Harbor on hover. No underlines, no pill backgrounds.
- **Actions:** A single primary button sits at the right edge — the nav carries one action, not several.
- **Mobile:** Below 768px, links collapse behind a hamburger into a white panel that expands by animating its height, with links stacked at 16px and a full-width button at the bottom.

### Badges & Eyebrows

- **Style:** Fully rounded, 12px bold uppercase text with wide letter-spacing (0.1em), 8px vertical and 16px horizontal padding.
- **Variants:** A tinted-fill badge in Harbor Haze with Meta Ink text for categories; a translucent white pill with backdrop blur and a hairline border for hero eyebrows, sometimes preceded by a small pulsing navy dot.

### The Italic Welcome Headline (signature)

The system's defining component is not a container — it is a headline in which exactly one word is set in italic Welcome Amber while the rest stays upright Deep Harbor. It appears at the top of essentially every page. On the home hero the italic word additionally cycles through a set of related terms (*Global* / *International* / *Immigrant*) with a short cross-fade, which is the single piece of ambient motion the system permits.

### The Dark Inset Slab (signature)

A Deep Harbor panel inset from the page edges by 16–32px with a 24px corner radius, running 128px of vertical padding, used once per page at most for a values or closing-CTA moment. Large blurred orbs of navy and amber at 10% opacity bleed in from opposing corners to give the flat navy some atmosphere. Text inside inverts: white headings, Quiet Ink body copy.

### Motion

Motion is short, upward, and non-repeating. Content enters by fading in from 20px below over 500ms, triggered once when scrolled into view; grouped items stagger by 100ms. State transitions run 300ms; image scale-on-hover runs 500ms. Buttons compress to 98% on press. Nothing loops, nothing bounces, and nothing moves that the user did not scroll to or touch — with the single exception of the cycling hero word.

## Do's and Don'ts

### Do:

- **Do** open every page with an Italic Welcome headline — one word, italic, in Welcome Amber, inside an otherwise upright Deep Harbor headline.
- **Do** separate sections with 80–128px of vertical space and alternating Paper / Harbor Mist grounds rather than with rules.
- **Do** keep cards flat at rest with a 1px Hairline border, and let them lift only on hover.
- **Do** set body copy in Body Ink at 16–18px with relaxed line-height, constrained to a 65–75 character measure.
- **Do** give large display type negative tracking (-0.025em) and line-height at or below 1.2.
- **Do** pair a Welcome Amber primary button with an Outline secondary — one amber action per view.
- **Do** write plainly. The audience is largely reading in a second language; expand acronyms on first use and avoid American idiom.

### Don't:

- **Don't** use MuseoModerno for anything but the "IFN." wordmark. It is a logotype face, not a display face.
- **Don't** introduce a third brand color. The palette is navy, amber, and the slate ramp — a teal was declared and cut for exactly this reason.
- **Don't** spread Welcome Amber across a view. Three appearances per viewport is the ceiling, and never on adjacent elements.
- **Don't** apply resting shadows to cards or sections. The primary CTA's Action Glow is the only permanent elevation in the system.
- **Don't** put borders heavier than 1px on anything except the outline button.
- **Don't** italicize more than one word in a headline — the emphasis lands on the single word carrying the headline's meaning, or it stops reading as a signature.
- **Don't** add looping, bouncing, or attention-seeking motion. Entrances play once; the cycling hero word is the only ambient animation.
- **Don't** publish invented statistics, logos, or attributed testimonials. Community-scale claims are a standing credibility risk for this audience — see PRODUCT.md's Evidence on Hand for what is real.
