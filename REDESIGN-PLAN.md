# REDESIGN PLAN: The Sign

Branch `design/landing-redesign-v2`. Replaces the previous plan entirely (the "Arrivals" concept, git history has it). Scope: the home page and the token layer it sits on. Mode: redesign-overhaul. Content and information architecture preserved.

---

## 1. Design read and dials

**Reading this as:** redesign-overhaul of a community and event landing page for international founders trust-shopping in Austin, plus the lawyers and banks deciding whether to sponsor, with a signage language taken from IFN's own event slide, leaning toward Tailwind v4 CSS custom-property tokens, self-hosted Archivo, and transform-only motion.

| Dial | Value | Reasoning |
|---|---|---|
| `DESIGN_VARIANCE` | **7** | The outgoing build reads as 4 (six of nine sections are the same bordered-card grid). Overhaul adds +2, and I am claiming 7 rather than 8 because I will print the geometry that delivers it: a 7fr/5fr hero, staircased column starts at 1/3/2/4 in section 2, unequal 1fr/2fr/1fr stops in section 3, a 62ch measure against a gutter rail in section 4, and an asymmetric page gutter of `clamp(1rem, 6vw, 6.5rem)`. That is offset-and-fractional, which is what 7 means. It is not masonry and it is not chaos, because a reader working in a second language needs a predictable reading path more than a surprising one. Two of the five judged concepts declared 8 or 9 and specified a 6. I would rather under-declare and deliver. |
| `MOTION_INTENSITY` | **4** | Overhaul default would be 6. The trust-first row of the skill's own dial table says 2 to 3 for this audience. Four is the honest midpoint and it is what actually ships: six behaviours, all transform or opacity, no pinning, no scrub, no parallax, no loops. The largest contentful element on this site is legally barred from opacity gating by a measured audit finding, which caps how much entrance choreography is even available. |
| `VISUAL_DENSITY` | **3** | Inherits the one good instinct of the outgoing "Long Table" system, generosity of space. Sections run `py-28 md:py-36`. The single local density spike is the events index in section 5, and there the density is information a founder needs. |

---

## 2. The point of view

**IFN already prints a sign and stands under it every month. The website has never once looked at it.**

In the photographs from all three documented nights, on screens and on a projector, the same slide is up: a saturated blue-violet ground, `IFN.` small at top left, a date and an arrow at top right, `International` set light, `Founders` set enormous and black, `Network` set medium, a four-item metadata row along the bottom, and exactly one word in red script. I opened the files and read it. The ground is measured, not eyeballed: sampling the bright field of the slide away from the type returns `#8189CE` at hue 233.8 and saturation 44.0% in `venue/20260226_184628.jpg`, and `#C7D4FD` at hue 225.6 in `meetups/20260423_184515.jpg`. It is a good piece of design and it is the only piece of visual identity IFN owns that was made for the room the meetup actually happens in.

A sign is the correct object for this brand for a reason that is not aesthetic. The audience's stated problem, in `PRODUCT.md` line 11, is that they arrive knowing their product and not knowing the terrain, and line 108 makes plain-language legibility a product requirement rather than a style preference because most readers are working in a second language. Signage is the discipline of making a stranger certain, at a glance, that they are in the right room. The aesthetic requirement and the accessibility requirement are the same object here, which is rare, and it is why this direction can be maximal about scale and contrast without becoming decoration.

**Inside the sign, one rule: the red marks only what you can check.**

This is the second half, and it is the part that makes the accent do work instead of looking nice. On the slide, exactly one word is red and it is the human one. On the page, the accent is licensed to three roles and no others:

1. **The mark.** Accent type plus a 3px accent rule under the phrase, applied only to a phrase that is checkable against a named artifact on this page: a date in the events feed, a named partner, a photograph on this page, a standing disclosure, or a denial of something IFN does not offer. A denial is the most checkable sentence there is, which is why the FAQ's limits copy is markable and a marketing adjective never is.
2. **The primary action.** Accent fill, paper label.
3. **The wordmark period**, unchanged from the shipped lockup.

Error states carry no accent at all. That is deliberate and it is stated in the token rules below.

**Density rule, so the licence is countable rather than felt:** one marked phrase per claim, and **no viewport ever holds more than two marks plus the wordmark period**. The nav is fixed, so the period is always on screen and is always one of them. ValueProps carries four marks, one per staircased row, across a section taller than one viewport, which is how it stays inside the rule.

**And one deliberate exception, named rather than discovered.** Section 9 is a full viewport of accent, which marks nothing. That is the single place on the page where the red stops being a mark and becomes a field. It is placed last on purpose: the reader has spent nine sections seeing exactly one red thing at a time, always attached to something they could check, and the closing frame is entirely that colour. It reads as arrival at the thing all the marks were pointing to. Anywhere else on the page it would read as inconsistency, which is why it happens once and at the end.

**Why this is earned rather than decorative.** `PRODUCT.md` line 100 states the surviving product principle after two integrity audits: "Provable beats impressive. Every claim on every surface must survive a member asking 'is that actually true?'" A design system whose one colour is licensed only to checkable claims turns that principle into a mechanical constraint. A fabricated claim cannot be styled, because there is nothing to point the mark at. It also resolves the brand tension `PRODUCT.md` line 68 calls "the brand": the monochrome grotesque and the ruled structure are the professional layer a sponsor can back, and the single red mark is the human hand inside it, which is exactly the role the red script word plays on the real slide.

And it fixes the audited inversion at the root. The page leads with a specific Austin date and a photograph of a specific Austin room, not with a globe. The hand-rolled CSS globe medallion, the dashed rings and the hand-drawn `GlobeIcon` are deleted outright.

### Answering the strongest argument against this direction

The sharpest charge levelled at the concept this plan is built on was that the derivation does not survive its own inventory: the slide supplies monochrome, a heavy grotesque, a date with an arrow and one red mark, and the system that got built out of it was hairlines, mono metadata, flat surfaces and fractional grids, none of which are on the screen in any photograph. The slide's actual charisma, its gradient-filled `Founders`, its script word and its poster scale, all got discarded, and then the slide got credited for the result.

That charge was correct and this plan changes three things because of it.

- **Poster scale is kept, not reduced to a 68px headline in a narrow column.** The hero h1 is a three-weight ladder at `clamp(2.75rem, 6vw, 5.25rem)` running to the page gutter, which is the slide's construction at the slide's proportions.
- **The script word's job is kept, in a form that scales and passes contrast.** A script face on the page would be a second family and a Tell. The mark is that gesture translated: one red thing per view, marking the human, checkable part. The mechanism differs, the role is identical, and the role is what was being borrowed.
- **The mono metadata layer is cut entirely.** There is no mono face on this page. The slide has no mono. Numerals in the events index use Archivo's tabular lining figures. That removes a repeated device that had become a tic in the source concept, saves 25 to 45KB, and is more faithful, not less.

What I cannot bring across is the gradient fill on `Founders`. A gradient-filled display headline is banned outright by the skill (Section 9.A, no excessive gradient text for large headers), and it is also the single most common AI tell in display type. So the slide's tonal drama becomes weight and scale drama instead.

**The violet ground is discarded too, and that is the same charge again, so it gets the same answer.** The slide's ground is not white and this plan does not pretend otherwise: it measures `#8189CE` at hue 233.8 in the February frame and `#C7D4FD` at hue 225.6 in the April one. Those two readings are 8 degrees of hue and 23 points of HSL lightness apart, which is the same problem the accent has in section 4.1 and for the same reason. These are photographs of an emissive screen under mixed tungsten in one case and daylight in the other, so a ground value is no more recoverable from these files than the red is, and unlike the red there is no second frame that narrows it. The difference is that the red gets carried across as a hue family because its **role** is recoverable even when its value is not, and the violet has no role to carry: it is the slide's page, and the page's ground on this site is set by the paper family for reasons that are measured in section 4.2 rather than borrowed. So the honest accounting is that the sign supplies monochrome plus one red **after** two deliberate subtractions, the gradient and the ground, and this plan does not get to credit the slide for a monochrome system the slide does not have.

**Residual risk, stated plainly: the shipped page is more austere than the slide it derives from.** If the founder sees the two side by side and misses the shine, the honest answer is that the page has to survive being read at 360px in a second language and the slide does not.

---

## 3. Why the other four directions lost

**Contact Sheet (ranked 2, the photographic direction).** The best single idea in the whole set came from here and I took it, so this is not a dismissal. It measured a real thing instead of asserting one: it composited an ink scrim over the worst real pixel inside the type zone of an actual candidate photograph and found that the alpha which reaches AAA erases the picture. From that it derived the Plate Rule, no type over any photograph, ever. That is a design rule falling out of a number and it is worth ten that fall out of a mood board. What killed the direction as a whole is that it stakes the entire page on the photographs and then, by its own selection, ships a hero contact sheet of five frames of which four are empty rooms, one of which contains a US flag, a Texas flag and an illuminated Capital Factory eagle in the same document that refuses a different frame for exactly that reason. When a concept applies its own rule to one slot and abandons it in the most prominent slot on the site, the rule is decorating the design rather than governing it. It also specified nine sections at declared variance 8 and never declared a single sub-768px collapse.

**Out Loud (ranked 3, the typographic direction).** Scored the highest single number in the whole judged set, an 8 from the buildability lens, and it deserved it: every claim it made about this codebase was true and specifically characterised, and its emphasis system, carrying headline emphasis on a variable width axis rather than a hue, is a structural fix rather than a repaint. I took that reasoning. It lost on its own boldest move. To feed a justified specimen block it lifted the hero lead's first sentence downpage, leaving the most-read string on the site reading "Once a month in Austin, you can ask about any of it out loud, with founders who have solved it" with no antecedent anywhere above the fold for either pronoun. A direction whose whole thesis is that plain language for second-language readers is the design cannot open by stranding two pronouns to make room for the layout. Underneath that, the strategic argument does not hold either: `PRODUCT.md`'s plain-language requirement is a vocabulary constraint about idiom and unexpanded acronyms, satisfied by copy this project already ships. Setting preserved copy at poster scale advances it by nothing.

**Marked Copy (ranked 4, the wildcard).** Contains the single most valuable move in the competition and I grafted it wholesale: an accent licensed only to grounds carrying a verifiable fact, so a fabricated claim literally cannot be styled. It also contributed the shape-as-wayfinding rule that this plan adopts. It lost on its centrepiece. It nominated a full-bleed monospace ledger of "every meetup in the feed" as the page's stopping moment and called it buildable today with zero new data. I read `src/data/events.json`. It holds Vol. 03 through Vol. 12 dated 2026-03-26 through 2026-12-25; today is 2026-08-09, so five of the ten rows are calendar entries that have not happened. An artefact whose entire rhetorical job is to let volume numbering imply operating history without IFN asserting anything would have printed five scheduled dates as things that occurred. That is fabrication by layout, on the exact axis two integrity audits existed to protect. Two of its four columns are also dead: `location_name` is the identical string on all ten rows and every `registrations` entry is `[{}]`, which `normalizeRegistrations` drops. The idea survives; the section it was demonstrated in does not.

**The Circle (ranked 5, the human direction).** Earned the best accessibility score in the set, and its boldest move is an argument worth recording even though I am not taking it: a page for international founders should not cycle "International / Global / Immigrant" as if the reader's origin were a swappable label. That is a real reading and the founder should hear it. The direction lost on execution against the files. Its designated 70dvh closer is `venue/20260226_184645.jpg`; I opened it and the CAPITAL FACTORY gear sits dead centre as the highest-contrast object in the frame, on a page whose adjacent copy says "Hosted at Station Austin". Its designated April frame, `meetups/20260423_184536.jpg`, is described as needing a crop to remove "the single bottom-right profile"; there are three identifiable people there and the crop that removes them also has to remove the right half, and the Capital Factory gear is in what remains. Beyond the photography it never reckoned with `App.tsx` rendering one `Navbar` and one `Footer` around an `Outlet` shared by seventeen routes, so making the home page dark by default would have put a dark shell around sixteen pages still carrying 436 hardcoded `slate-` utilities.

---

## 4. Visual system

### 4.1 Palette

Two grounds per mode, no more. Every neutral is locked to hue 60 so warm and cool greys cannot mix. Saturation on the neutrals runs 3.2% to 11.8%, which puts the paper family nowhere near the banned premium-consumer cream ramp (`#f5f1ea` measures HSL S **35.5%**, `#faf7f1` measures **47.4%**, both at hue 38 to 40).

| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | `#FBFBFA` | `#131311` | Page ground. In dark mode the light value becomes the type colour and vice versa. |
| `--band` | `#F0F0EC` | `#1D1D1A` | The only second surface per mode. Recessed sections, plate fills, form field fills. |
| `--ink` | `#131311` | `#FBFBFA` | All body and display type. |
| `--muted` | `#5B5B55` | `#A5A59C` | Secondary type: captions, helper text, placeholders, the events index metadata. |
| `--rule` | `#7C7C74` | `#75756D` | Every 1px structural hairline and every plate border. |
| `--edge` | `#6E6E67` | `#82827A` | Control boundaries: input borders, secondary-button strokes. |
| `--accent` | `#A81B36` | `#E85C77` | The mark, the primary action fill, the wordmark period. Hue 348.5 light, 348.4 dark, so it reads as one colour across modes. |
| `--accent-press` | `#93132C` | `#EF7389` | `:hover` and `:active` on accent fills and accent links. |
| `--on-accent` | `#FBFBFA` | `#131311` | The only label colour on an accent **fill** (`--accent`, `--accent-press`). Per-mode, because the fill is per-mode. |
| `--accent-plate` | `#A81B36` | `#A81B36` | Deliberately theme-invariant. The section 9 field is the same object in both modes. |
| `--on-plate` | `#FBFBFA` | `#FBFBFA` | Theme-invariant. **Every mark on the `--accent-plate`**: type, the pill fill in section 9, the better focus-ring layer. |
| `--scrim` | `#131311` at 60% | `#131311` at 60% | Theme-invariant. The `JoinModal` backdrop, and the only alpha composite left on the page. |

**Why `--on-plate` exists as a fourth accent token rather than being folded into `--on-accent`.** The plate is theme-invariant and the accent fill is not, so one label token cannot serve both. `--on-accent` is per-mode because it follows a per-mode fill: on the dark fill `#E85C77` it must be dark, and `#131311` on `#E85C77` measures **5.517**. Put that same per-mode token on the theme-invariant plate and dark mode resolves it to `#131311` on `#A81B36`, which measures **2.547** and puts the page's entire closing frame below even the 3:1 large-text floor. The obvious repair is to lock `--on-accent` to `#FBFBFA` in both modes, and it is wrong: `#FBFBFA` on the dark accent fill `#E85C77` measures **3.256**, so locking the token fixes the plate by breaking the fill. Two grounds that do not move together need two label tokens. Rule, stated once and applied everywhere below: **anything that sits on the `--accent-plate` is theme-invariant, because the plate is.**

**The `JoinModal` surfaces, named because they were the last unnamed grounds on the page.** The scrim is `--scrim`, a theme-invariant `#131311` at 60%, replacing the shipped `bg-slate-900/60 backdrop-blur-sm` (the blur goes with it, under the flat-material rule). The modal surface is `--paper`, its field fills are `--band`, and it carries a 1px `--rule` border like every other plate. That border is not decoration: composited per channel in sRGB gamma space, the scrim over the light page ground resolves to `#70706E` and the modal's `--paper` surface reads **4.793** against it, so in light mode the modal boundary is carried by tone. In dark mode the scrim over `#131311` resolves to `#131311`, so the surface reads **1.000** against its own backdrop and the tone carries nothing at all. The 1px `--rule` border is the mechanism there, at **4.005**. Both modes clear 3:1 at the modal boundary by different means, which is stated rather than assumed. Because the modal ground is `--paper`, error text inside it lands on `--paper` at **17.965** and takes the same `--ink` treatment plus 3px `--ink` rule as every other error on the page, with no accent.

The accent hue is IFN's, recovered by measurement rather than chosen by eye. I sampled the 300 most saturated red pixels of the script word in two independent February frames: `venue/20260226_184628.jpg` returns `#8B0337` at hue 337.1, `venue/20260226_184639.jpg` returns `#84051F` at hue 347.7. These are photographs of an emissive screen under mixed tungsten, so the exact value is not recoverable from the files and I am not going to pretend it is. The hue family is the brand's; the shipped value was picked by contrast sweep inside that family and sits at hue 348.5, saturation 72.3%, under the 80% ceiling.

### 4.2 Measured contrast

Every row below was computed with the WCAG relative-luminance formula (`c/12.92` below 0.03928 else `((c+0.055)/1.055)^2.4`, then `0.2126R + 0.7152G + 0.0722B`, then `(Lmax+0.05)/(Lmin+0.05)`), against **both** grounds in **both** modes. Alpha composites are done per channel in sRGB gamma space, which is what browsers do. **Sixty-five rows: 31 light and 28 dark that pass, plus 6 that fail and the rule each failure produces.** The counts are stated separately because an earlier draft said "forty-four rows, including the four that fail" while the tables held 44 passing rows and 4 failing ones, so the total was 48 and the word "including" made it 44. A contrast table whose own row count is off by four is not a document anyone should trust the other numbers in, which is the whole reason this section exists.

**Light mode**

| Pairing | Ratio | Requirement | Result |
|---|---|---|---|
| `--ink` body and display on `--paper` | **17.965** | 4.5 body, 7 AAA target | pass |
| `--ink` on `--band` | **16.281** | 4.5 | pass |
| `--muted` secondary and captions on `--paper` | **6.601** | 4.5 | pass |
| `--muted` on `--band` (the darker ground) | **5.982** | 4.5 | pass |
| `--muted` as input placeholder on the `--band` field fill | **5.982** | 4.5 | pass |
| `--muted` as form helper text on `--paper` | **6.601** | 4.5 | pass |
| `--accent` as marked type on `--paper` | **7.054** | 4.5 | pass |
| `--accent` as marked type on `--band` | **6.393** | 4.5 | pass |
| `--on-accent` label on `--accent` fill | **7.054** | 4.5 | pass |
| `--accent-press` fill, `--on-accent` label | **8.557** | 4.5 | pass |
| `--accent` fill boundary vs `--paper` | **7.054** | 3.0 non-text | pass |
| `--accent` fill boundary vs `--band` | **6.393** | 3.0 | pass |
| 3px `--accent` mark rule vs `--paper` | **7.054** | 3.0 | pass |
| 3px `--accent` mark rule vs `--band` | **6.393** | 3.0 | pass |
| `--rule` 1px hairline and plate border vs `--paper` | **4.063** | 3.0 | pass |
| `--rule` vs `--band` | **3.682** | 3.0 | pass |
| `--edge` input and secondary-button border vs `--paper` | **4.960** | 3.0 | pass |
| `--edge` vs `--band` field fill | **4.495** | 3.0 | pass |
| `--ink` label on secondary button (`--paper` fill, `--edge` stroke) | **17.965** | 4.5 | pass |
| Focus ring outer `--ink` vs `--paper` | **17.965** | 3.0 | pass |
| Focus ring, better layer (`--paper` inner) vs the `--accent-plate` `#A81B36` | **7.054** | 3.0 | pass |
| Focus ring inner/outer boundary, `--paper` vs `--ink` | **17.965** | 3.0 | pass |
| Error text `--ink` on `--paper`, plus 3px `--ink` rule | **17.965** | 4.5 text, 3.0 rule | pass |
| Disabled label `--muted` on `--band` fill | **5.982** | not required, held anyway | pass |
| `--on-plate` `#FBFBFA` type on the `--accent-plate` `#A81B36` | **7.054** | 4.5 | pass |
| `--on-plate` pill fill boundary vs the `--accent-plate` | **7.054** | 3.0 | pass |
| `--accent-plate` `#A81B36` label on the `--on-plate` pill | **7.054** | 4.5 | pass |
| `JoinModal` `--paper` surface vs `--scrim` over `--paper` (composite `#70706E`) | **4.793** | 3.0 | pass |
| `JoinModal` `--paper` surface vs `--scrim` over `--band` (composite `#6B6B69`) | **5.158** | 3.0 | pass |
| `JoinModal` 1px `--rule` border vs the modal `--paper` ground | **4.063** | 3.0 | pass |
| Error text `--ink` on the modal `--paper` ground | **17.965** | 4.5 | pass |

**Dark mode**

| Pairing | Ratio | Requirement | Result |
|---|---|---|---|
| `--ink` body and display on `--paper` ground `#131311` | **17.965** | 4.5, 7 AAA target | pass |
| `--ink` on `--band` `#1D1D1A` | **16.318** | 4.5 | pass |
| `--muted` `#A5A59C` on the page ground | **7.496** | 4.5 | pass |
| `--muted` on `--band` | **6.808** | 4.5 | pass |
| `--muted` as placeholder on the `--band` field fill | **6.808** | 4.5 | pass |
| `--accent` `#E85C77` as marked type on the page ground | **5.517** | 4.5 | pass |
| `--accent` as marked type on `--band` (the lighter dark ground, the binding case) | **5.011** | 4.5 | pass |
| `--on-accent` `#131311` label on the `--accent` **fill** `#E85C77` | **5.517** | 4.5 | pass |
| `--accent-press` `#EF7389` fill, `--on-accent` label | **6.629** | 4.5 | pass |
| `--accent` fill boundary vs page ground | **5.517** | 3.0 | pass |
| `--accent` fill boundary vs `--band` | **5.011** | 3.0 | pass |
| 3px `--accent` mark rule vs page ground | **5.517** | 3.0 | pass |
| 3px `--accent` mark rule vs `--band` | **5.011** | 3.0 | pass |
| `--rule` `#75756D` vs page ground | **4.005** | 3.0 | pass |
| `--rule` vs `--band` | **3.638** | 3.0 | pass |
| `--edge` `#82827A` vs page ground | **4.804** | 3.0 | pass |
| `--edge` vs `--band` field fill | **4.363** | 3.0 | pass |
| Focus ring outer `--ink` vs the `--paper` page ground | **17.965** | 3.0 | pass |
| Focus ring, better layer (`--ink` outer) vs the `--accent-plate` `#A81B36` | **7.054** | 3.0 | pass |
| Focus ring inner/outer boundary, `--paper` vs `--ink` | **17.965** | 3.0 | pass |
| Error text `--ink` on page ground | **17.965** | 4.5 | pass |
| `--on-plate` `#FBFBFA` type on the `--accent-plate` `#A81B36` | **7.054** | 4.5 | pass |
| `--on-plate` pill fill boundary vs the `--accent-plate` | **7.054** | 3.0 | pass |
| `--accent-plate` `#A81B36` label on the `--on-plate` pill | **7.054** | 4.5 | pass |
| `JoinModal` 1px `--rule` border vs the modal `--paper` ground | **4.005** | 3.0 | pass |
| `JoinModal` `--rule` border vs `--scrim` over `--paper` (composite `#131311`) | **4.005** | 3.0 | pass |
| `JoinModal` `--rule` border vs `--scrim` over `--band` (composite `#171715`) | **3.865** | 3.0 | pass |
| Error text `--ink` on the modal `--paper` ground | **17.965** | 4.5 | pass |

**Rows that fail, and the rule each one produces**

| Pairing | Ratio | Requirement | Rule it produces |
|---|---|---|---|
| `--accent` `#A81B36` against surrounding `--ink` body text, light | **2.547** | 3.0 (WCAG 1.4.1, technique G183) | **Every inline link carries an underline, in both modes, always.** Colour alone can never identify a link on this page. G183 measures the link against the surrounding text, not the ground, and light mode fails it. This is the row that was missing from every one of the five judged contrast tables. |
| `--accent` `#E85C77` against surrounding `--paper` body text, dark | **3.256** | 3.0 | Marginal pass, and the underline rule applies anyway so the page never depends on it. |
| `--band` plate against the `--paper` ground, tone only | **1.103** | not governed, but too weak to carry meaning | **Every plate carries a 1px `--rule` border.** Ground tone alone is 1.10:1 in light and 1.10:1 in dark, so banding is a supporting device and never the mechanism by which a plate is perceived. The border measures 4.063 and 4.005. |
| `JoinModal`'s `--paper` surface against `--scrim` over the dark page ground | **1.000** | 3.0 non-text | **The modal boundary is carried by tone in light mode and by its 1px `--rule` border in dark, so the border is mandatory rather than stylistic.** A 60% scrim over `#131311` composites back to `#131311`, so in dark mode the modal surface and its own backdrop are the same colour. The border measures 4.005 and does the work. |
| `--on-accent` `#131311` on the `--accent-plate`, dark | **2.547** | 3.0 large text, 4.5 body | **This is why `--on-plate` exists.** Recorded rather than fixed silently, because the naive repair (locking `--on-accent` to `#FBFBFA`) fails the other direction at 3.256 on the dark accent fill. Published so the two-token split cannot be "simplified" back out later. |
| `--rule` at 75% pixel coverage over its own ground | **2.665 light, 2.764 dark** | 3.0 | **Hairlines are full-opacity 1px, never expressed with `opacity` or an alpha colour, and never on a fractional device-pixel offset.** At 75% antialiased coverage a compliant rule drops below the floor. The margins, recomputed rather than quoted: at full opacity `--rule` clears the 3.0 floor by **35.4% in light** (4.063) and **33.5% in dark** (4.005), which is real headroom; 75% coverage spends all of it and then **11.2% more in light** and **7.9% more in dark**. No token in this palette can be specified generously enough to survive being drawn at partial coverage, which is why the rule is about how the hairline is drawn and not about which grey it uses. |

**Two further stated bans, each measured**

- `--rule` against the `--accent-plate` measures **1.736 in light** (`#7C7C74`) and **1.573 in dark** (`#75756D`). Both tokens are quoted because `--rule` is per-mode and the plate is not, so there is no single number here. No hairline, table rule or plate border ever terminates on the section 9 accent field in either mode. Separation inside the plate is space only.
- The focus ring is a two-layer ring, **2px `--paper` inner plus 2px `--ink` outer, identical in both modes**, with no `ring-offset`. This replaces the shipped `focus-visible:ring-offset-2` pattern, which assumed a known solid ground. **There is no dark-mode reversal, and an earlier draft of this plan specified one, which was a bug.** `--paper` is always the page colour and `--ink` is always the type colour, so the construction already inverts itself when the tokens swap. Writing the reversal on top of that swap inverts it twice: the outer layer becomes `--paper`, which in dark mode is `#131311`, which **is** the page ground, at **1.000**. Every focus indicator on all seventeen routes would collapse to a single 2px line. Unreversed, the ring is correct in both modes with one declaration.

  Swept across all 256 grey values, the better of the two layers never drops below **4.264** (worst case at `#787878`), so the ring survives any conceivable ground including a photograph. That sweep is unaffected by the fix above, because it swept the construction rather than the reversal. The layers also contrast with each other at **17.965** in both modes, so the ring reads as a shape rather than as a colour, and a shape is what survives a ground the sweep did not anticipate. On the `--accent-plate` the better layer measures **7.054** in both modes (the `--paper` inner in light, the `--ink` outer in dark), so the plate is not the binding case; the grey sweep is. Nothing focusable sits on a photograph under the Plate Rule, so this is belt and braces, but it is computed rather than assumed.

**Token collision check.** `--ink` `#131311` measures **1.042** against Tailwind `slate-900`, **1.084** against `slate-950`, **1.272** against `slate-800`. That is the same class of luminance collision that produced four bugs in this repo including an invisible focus ring on the events newsletter input. There are currently **436** hardcoded `slate-` utilities across `src/`. Purging them from every redesigned component is a phase gate, not a cleanup task, and `grep -ro 'slate-' src/components/ src/pages/Home.tsx | wc -l` returning zero is the pass condition.

**Retired for the record.** `--color-accent` `#f97316` as text on `#f8fafc` measures **2.679** against a 3:1 floor. That is the live system-level defect this palette replaces, and it is reproduced here so the tooling that produced the sixty-five rows above can be checked against a known-bad value.

### 4.3 Type

| Role | Face | Licence | Usage |
|---|---|---|---|
| Display and body | **Archivo** variable (Omnibus-Type), axes `wght 100-900` and `wdth 62-125` | SIL Open Font License 1.1, self-hostable | One family for everything. Display at `wght 500-800`, `tracking -0.025em`, `leading 0.95` for the h1 and `1.02` for section headlines. Body at `wght 400`, 17px base, `leading 1.6`, measure capped at 65ch. |
| Numerals | Archivo with `font-feature-settings: 'tnum' 1` | same file | The events index, membership prices, counts. **There is no mono face on this page.** The slide has none. |
| Wordmark only | **MuseoModerno** 900 | SIL Open Font License 1.1, self-hostable | `IFN` plus the accent period, unchanged. Locked brand asset. |

No commercial face is named anywhere in this plan. All faces are self-hosted via `@font-face` with `font-display: swap`, which also removes the render-blocking Google Fonts link still live at `index.html:17`. Archivo is preloaded; MuseoModerno is not, because the wordmark is small and a swap there is invisible.

**Weight budget, honestly stated.** Archivo variable, latin plus latin-ext, two axes, lands around 70 to 78KB as woff2. MuseoModerno 900 as a Google static latin subset is roughly 20 to 25KB. Subsetting it to the four glyphs the wordmark actually uses would take it to roughly 2 to 3KB, and that requires `pyftsubset` from `fonttools`, which **is not installed on this machine**. Name it as a dev dependency or skip the subset and ship the 22KB file. Do not claim the 3KB figure without adding the tool.

**Emphasis rule.** Emphasis inside a headline is a weight step within Archivo, `wght 800` against a `500` line, exactly as the slide sets `International` light against `Founders` black. Never a second family. Never colour alone. Italic is retired from display type entirely, which also retires the italic descender-clearance trap and collapses `Emphasis.tsx` from two ground-dependent colour branches to one branch with no colour logic at all.

**The hero's cycling word takes no accent and no mark.** It is the third rung of the weight ladder and nothing else. This is deliberate on two counts: the mark means "checkable", and how a founder names their own origin is not a checkable fact; and it means the overlapping inline-grid that sizes the slot to the longest candidate needs only identical `font-variation-settings` on its invisible twins, with no rule to render on one span and not the others. The 360px overflow fix survives untouched.

**Descender clearance on that slot.** "Immigrant" carries a `g`, and a vertical roll inside an `overflow-hidden` slot clips a descender exactly the way `leading-none` does. The slot runs `leading-[1.15]` minimum with `pb-1` bottom reserve, applied identically to the visible span and to both invisible sizing twins so the slot's metrics stay in agreement.

### 4.4 Shape, surface, material

**One radius rule, two values, no third.**

- **Every non-interactive surface is radius 0.** Plates, photographic frames, the events index, disclosure rows, the accent field.
- **Every discrete interactive control is full pill.** Buttons, inputs, the resources filter chips, the nav action.
- **Boundary, stated because it will otherwise break on contact:** "control" means a discrete control. Full-width interactive rows (FAQ disclosure triggers, events index rows) and nav links stay radius 0 and carry their pressability through the focus ring, not through shape.
- **Full-width interactive rows never use a ground swap for hover.** FAQ sits on `--band`, so a `--band` hover ground would measure 1.0:1 against its own section. Instead the row's 1px `--rule` hairline promotes to a 2px `--edge` on hover, which measures 4.960 on `--paper` and 4.495 on `--band` and works identically on every ground in both modes.

The reason is wayfinding, not taste. Shape tells a reader what can be pressed before they read the label and independent of language or colour, which is the strongest non-verbal affordance available to a substantially second-language audience. It also resolves a collision that two of the judged concepts acknowledged and neither fixed: MuseoModerno is a rounded geometric logotype, and on an all-square page it would be the only curved object on screen, fighting the system. Here the wordmark rhymes with the controls.

**Material.** The page is flat. Zero shadows, zero glows, zero gradients (including in display type), zero blur, zero glass, zero backdrop-filter. Separation is carried by ground tone, by full-opacity 1px `--rule` hairlines that clear 3:1 on every ground, by plate borders, and by space. The only non-flat surfaces on the page are the photographs.

**No type sits on a photograph anywhere on this page.** This is the Plate Rule, grafted from the Contact Sheet concept and adopted because its derivation is a measurement rather than a preference: an ink scrim over the worst real pixel inside a candidate frame's type zone needs an alpha that erases the photograph before it reaches AAA. Every caption sits outside its frame. This deletes an entire class of uncomputable contrast case (scrims, ghost buttons over images, per-pixel variation, dark-mode veil alphas) rather than mitigating it, and it is the reason no veil token exists in section 4.1.

**Navigation.** Fixed, 64px at rest, flat, one 1px `--rule` bottom edge, no backdrop blur, no transparent state. It renders on one line at `lg` and the wordmark drops from `text-3xl` to `text-xl`. Coupling to retune in the same commit: `src/index.css:41` sets `scroll-margin-top: 6rem` for the current ~92px bar and must move to `4.5rem`, or every anchor lands under the bar.

---

## 5. Section architecture

Order, anchor ids and nav labels are frozen. `id="mentorship"` sits on ValueProps, has nothing to do with the section's content, and moves with it verbatim; it is called out here because it is the one most likely to be silently dropped in a restructure.

| # | Section | Layout family | Geometry that makes it distinct | Ground | Eyebrow |
|---|---|---|---|---|---|
| 1 | Hero | Poster stack above a full-bleed photographic band | h1 runs the full content measure as a three-weight ladder, then a `7fr 5fr` split below it carries the subtext and CTAs with the 5fr column deliberately empty, gutter `clamp(1rem, 6vw, 6.5rem)`, band breaks the container edge to edge | `--paper` | **1 of 3** |
| 2 | ValueProps `#mentorship` | Staircased statements in open space | 12-col grid, four rows whose column-start walks 1, 3, 2, 4, no rules, no containers, no icons, vertical stack per row | `--paper` | none |
| 3 | HowItWorks | Single-rule sequence with unequal stops | One 2px `--rule` across the container with three ticks, stops at `1fr 2fr 1fr`, only the wide middle stop carries an image cell | `--band` | none |
| 4 | FounderStory | Prose measure with a hanging gutter rail | Single 62ch measure left, three-fact `<dl>` hanging in the right gutter under one rule, no image | `--paper` | none |
| 5 | EventsPreview `#events` | Featured object plus compact index | One large object (date at display scale with `tnum`, arrow, zone-correct time, venue, one action) above a compact ruled index of the remaining upcoming dates | `--paper` | none |
| 6 | PartnersStrip `#partners` | Logo baseline with running prose | Three marks on one optical baseline sized by eye, one full-measure paragraph beneath, no cards, nothing printed under any individual mark | `--band` | **2 of 3** |
| 7 | ResourcesPreview `#resources` | Horizontal scroll-snap rail | Four unequal snap panels on a native CSS rail, filter chips above as a snap row | `--paper` | none |
| 8 | FAQ `#faq` | Interactive disclosure register | Full-width rows on hairlines, open answers indent into a 7-of-12 column so an open panel differs in structure and not only in height | `--band` | none |
| 9 | FinalCTA | Full-bleed accent field | The page's one colour block, `--accent-plate` edge to edge, `--on-plate` type, one pill action filled `--on-plate` and labelled `--accent-plate`, no photograph, no rules | `--accent-plate` | none |

**Eyebrow count: 2 used against a budget of `ceil(9 / 3) = 3`.** The hero keeps the shipped string "Monthly meetups in Austin, Texas" and PartnersStrip keeps "Who we work with". ValueProps and ResourcesPreview both currently carry eyebrows and both lose them.

**Nine layout families across nine sections.** Sections 2, 4 and 8 are all type on ground with no containers, so their distinguishing geometry is printed above rather than left to a family label: staircased column starts with no rules, a single measure against a gutter rail, and full-width interactive rows. Exactly one section is an image plus text split (section 3), so the zigzag cap is nowhere near. Photographs appear in exactly two places on day one, at different sizes, in different orientations, from different nights.

**Section notes that carry real constraints**

- **Hero.** Four text elements exactly: eyebrow, headline, subtext, CTAs. The eyebrow string is preserved verbatim but **the decorative accent dot inside the eyebrow pill is deleted** (`src/components/Hero.tsx:87`, `h-2 w-2 rounded-full bg-primary`). It is banned by skill 9.F, and independently of the skill it breaks two of this plan's own rules: it is accent that marks nothing, which the licence in section 2 does not permit, and it would consume one of the two marks the density rule allows per viewport for no informational return. Preserving the copy does not mean preserving the ornament attached to it. Two actions, no more: "Join the community" (primary, accent fill, opens the existing modal) and "Browse our resources" (secondary, `--paper` fill with a 2px `--edge` stroke, links to `/resources`). No Luma link, no live date, no proof cards, no globe. The two `HeroVisual` proof claims move down: "Six months of monthly meetups, in person" to section 2, "Speed networking by Reuneo" to section 6.

  **Font scale and fit, recomputed rather than asserted.** The h1 is `clamp(2.75rem, 6vw, 5.25rem)` at `leading 0.95`, and it runs the full content measure rather than a 7fr column, which is the slide's own construction and is what makes the line count work. **This is the same clamp quoted in section 2, and it is the only h1 clamp in this document.** An earlier draft answered the "poster scale got discarded" charge with `clamp(2.75rem, 6vw, 5.25rem)` and then did the fold arithmetic against `clamp(2.5rem, 4.6vw, 4.5rem)`, which resolves to 62.8px at 1366px against this one's 82.0px. A rebuttal that ships a headline 23% smaller than the one it argued for is not a rebuttal, so the larger clamp is kept and the arithmetic below is redone against it.

  **The metric, printed so the next reader recomputes rather than re-asserts.** Every line count here uses an average advance of **0.503em per character for display type** (Archivo's roughly 0.528em base, less the 0.025em display tracking) and **0.529em for body** at `wght 400` with no tracking. Wrapping is greedy at word boundaries. The longest cycling headline is **"Where International Founders Connect, Grow, and Succeed"**, which is **55 characters**, not 53; the overlapping inline-grid sizes the slot to that longest candidate, so the line count is stable across all three words rather than shifting every 3000ms.

  At **1366x768**: gutter resolves to 82.0px, content measure 1202px, font 82.0px, 29.2 characters per line, so **2 lines** ("Where International Founders" at 28, "Connect, Grow, and Succeed" at 26) at 77.9px each = 156px. Subtext sits in the 7fr column at 701px, 78 characters per line, 186 characters, so **3 lines** at 82px. Stack: 64 nav + 80 `pt-20` + 44 eyebrow + 156 h1 + 24 + 82 subtext + 32 + 56 CTAs + 64 bottom = **601px to the top of the band**. Browser chrome takes roughly 120px of 768, leaving 648 visible, so the copy clears the fold with **47px of band showing**. That is a thinner "there is more" signal than the 110px an earlier draft claimed off the smaller clamp, and it is the price of poster scale, stated rather than hidden.

  **The 28-against-29.2 first line is the fragile number in this section and it is named as such.** It carries 4% headroom, so a heavier rendered advance than the metric above pushes "Founders" down and the h1 goes to 3 lines. The degradation is graceful and was computed rather than hoped: 3 lines takes the stack to 679px, the CTA block's bottom edge still lands at 615px against 648 visible, so the actions stay above the fold and only the band drops below it. The hero loses its band preview, not its buttons. This is the first thing to measure in Phase 4.

  At **1920x1080**: font caps at 84px, the container caps at `max-w-7xl` (1280px), still **2 lines** at 79.8px, subtext column 747px at 83 characters per line, still 3 lines, stack totals **605px**, band visible from 605 to 960. At **360px**: font floors at 44px, measure 317px, 14.3 characters per line, so the headline runs **5 lines** ("Where" / "International" / "Founders" / "Connect, Grow," / "and Succeed"), not the 4 an earlier draft assumed off the 40px floor. Five lines at 41.8px is 209px, which is fine on a scrolling mobile view where there is no fold to clear, but it is the exact measurement risk 4 exists to catch and it is not treated as settled here. All of these are build-time measurements to re-verify, not assumptions. Hero top padding is `pt-20` and never exceeds `pt-24`.

  **The subtext exceeds the skill's hero rule and is kept anyway. Naming the collision rather than resolving it by assertion.** The preserved string (`src/components/Hero.tsx` lines 139 to 143) measures **33 words and 186 characters** against a pre-flight commitment of 20 words. That is a 65% overrun and it is a genuine conflict between two binding constraints, not an oversight. The hero rule wants the shortest possible lead; the brief's content-preservation-and-honesty constraint wants shipped copy left alone. The string is preserved, for a reason this document is not free to ignore: section 3 rejects the Out Loud direction specifically for relocating this string's second sentence and stranding two pronouns above the fold. Trimming the same sentence here to make a word count would be the identical move under a different justification, and a plan cannot charge a rival with a fault and then commit it silently one section later. **The price is stated: the hero carries 3 lines of subtext where the rule budgets 2, which is the 27px that took the band preview from 74px to 47px at 1366x768.** If the founder wants the rule met instead, the specific trimmed string is "Visas, U.S. banking, hiring across borders, funding norms nobody explained to you. Once a month in Austin, you can ask about any of it out loud." That is 24 words and still over budget, it drops "with founders who have already solved it" which is the clause that answers "ask who?", and **it is a copy change to shipped text, so it needs founder sign-off and is not made unilaterally here.** Absent sign-off, 33 words ship and the commitment line records the overrun rather than the aspiration.
- **ValueProps.** The four shipped claims survive verbatim. Exactly one clause in each is marked, and only the checkable one: "a meetup you can put in your calendar" is marked because there is a dated feed below it; "There is no matching system here" is marked because a denial is checkable.
- **HowItWorks.** Three identical cards and the giant ghost numerals are both deleted. Order is carried by the existing semantic `<ol>`; the ticks are `aria-hidden`. The dark navy slab is gone, replaced by a `--band` tone, so the page never inverts mid-scroll. The relocated sub-CTA line lands here as three stacked lines, retiring its middle-dot separators.
- **EventsPreview.** Every piece of `EventCard`'s logic is preserved verbatim: formatting in the event's own zone rather than the reader's, the DST-correct CDT and CST label, the "In your time zone" second line when they differ, `<time dateTime>`, the past/upcoming split reading `Date.now()` once at mount, and the sr-only event title appended to repeated Luma links. **The index shows upcoming meetups only and never renders a historical record.** Five of the ten rows in `src/data/events.json` are dated after today, so a "record" built from that feed would present scheduled dates as operating history. **Recurrence is carried by the copy ("more than six months of monthly meetups") and by nothing else.** Not by the feed, which is upcoming-only by the rule immediately above. Not by the photographs either: two frames ship on day one, section 7 says in as many words that they do not prove recurrence, and no caption in this plan prints a date, so crediting them here would be asserting evidence the page does not actually display.

  **Featured-plus-index retires the dot pager, and that is a real accessibility deletion rather than a layout simplification, so it is itemised.** It is the reason this section does not become the hairline-under-every-row spec table the skill bans, but it removes machinery that `EventsPreview.tsx` currently ships: `role="group"` with `aria-label="Choose a meetup page"` (line 125), a per-dot `aria-label` (line 133), `aria-current` (line 134), a documented 44px hit area around an 8px dot (line 143), width-not-colour state on the current dot, and an `aria-live="polite"` page counter reading "Page N of M" (line 76). Five of those six have no replacement and need none: featured-plus-index has no pages, so there is nothing to group, label, mark current, or hit. **The live region is the one that does need a named replacement, because the non-regression promise below is binding and the announcement it made would otherwise simply vanish.** It is replaced by the section's permanently-mounted `role="status"` region, which already exists in this spec for the loading state and which announces the resolved result in place of the page count: "Showing the next N meetups", or the empty-state sentence when N is zero. Same region, same politeness, one announcement instead of one per page turn, and it now fires on the transition a reader actually cannot see (a fetch resolving) rather than on one they just caused by clicking. The 44px floor is unaffected because it is encoded in `SIZES` and governs every control on the page independently of this section.

  Loading state is skeleton rows in the final row shape with the existing `.motion-status` spinner kept inside the live region; the empty state ("The next date is not on the calendar yet") gets the full measure and its own composition.
- **PartnersStrip.** No category label under any mark. The information those labels carried moves into one 65ch paragraph beneath the row, so the shipped headline stays true. The Yani Partners disclosure is reproduced verbatim, unshortened, at body scale, and it is **marked**, because a standing disclosure is the most checkable sentence on the page. **Blocking:** `Icons.tsx` currently hotlinks the Station Austin and Reuneo marks from `google.com/s2/favicons`, which is the same third-party-request and visitor-IP class this repo already removed from the hero. Real artwork must be vendored into `public/partners/` before this section ships. If a mark cannot be obtained with permission, the partner is omitted from the row rather than set as a text wordmark.
- **ResourcesPreview.** The animated stage timeline, the counted stat strip and the example card grid are all cut. Four topic panels with genuine visual variation, one carrying oversized display type on `--band`. **Keyboard contract, stated because a snap rail is where this regresses:** the rail is `role="group"` with an `aria-label`, `tabindex="0"` so it is reachable and scrollable by keyboard, and every panel contains a focusable link so Tab reaches all four. The `aria-pressed` filter toggles keep their labelled `role="group"` and their 44px floor, and each stage description is still rendered exactly once.
- **FAQ.** Restyle, explicitly not rebuild. Preserved byte for byte: `hidden="until-found"` set imperatively because React 19 coerces the prop to a boolean, the `beforematch` listener that syncs state when Chrome reveals a panel via find-in-page, the re-hide in `onAnimationComplete`, the `<h3>`-wrapped trigger, `aria-expanded`, `aria-controls`, `role="region"` with `aria-labelledby`, ids from `useId`, and the two entries open by default. `focus:outline-none` does not return. The answers that name IFN's limits are the emotional centre of this page, set at full body scale rather than as fine print, and their denials carry the mark.
- **FinalCTA.** One action, one field, no photograph. The preserved headline sits at the page's second-largest size. The four-item "What you are signing up for" panel keeps all four items verbatim (Every month in person / Hosted at Station Austin / Structured one-to-one networking / Free to attend) and loses only its bordered box: the four run as four **`--on-plate`** lines on the field at **7.054:1 in both modes**, stacked, no rules, no icons, no bullets, because a hairline cannot terminate on the accent plate (1.736:1 light, 1.573:1 dark) and space is the only separator available there. **Every mark in this section takes `--on-plate` and not `--on-accent`**, for the reason measured in section 4.1: `--on-accent` is per-mode, so in dark mode it would resolve to `#131311` on `#A81B36` at 2.547:1 and render the page's closing frame unreadable. The single action is a pill filled `--on-plate` `#FBFBFA` (boundary 7.054:1 against the plate) carrying an `--accent-plate` `#A81B36` label (7.054:1 against the pill), which is the page's primary button inverted onto its own field. It is deliberately **not** a `--paper` fill with an `--ink` label, because `--paper` is per-mode and a dark-mode `#131311` pill on the plate measures 2.547:1 at its boundary, which is the same defect one component further down. The pricing sentence imports `MEMBERSHIP_PRICE_STANDARD` and `MEMBERSHIP_PRICE_ATTENDEE` from `src/data/membershipData.ts` rather than hardcoding figures. No checkout is designed and `STRIPE_PAYMENT_LINK` is not wired to anything.

  **Flagged, because it lands in the page's closing frame:** item two of those four is "Hosted at Station Austin", so the unresolved venue question sits in the last thing a reader sees. I am not resolving it by editing the string, because the string is shipped copy and the contradiction is a content fact, not a layout problem: `src/data/events.json` sets `location_name` to "Capital Factory, 701 Brazos St" on all ten rows and every photograph across all three nights carries Capital Factory branding. This is why the venue question is listed below as a ship blocker rather than a nice-to-have. The design's obligation is to not make it worse, which is why no photograph on this page names a venue and why no frame in which Capital Factory branding is legible ships at all.

**On the theme lock.** Section 9 is a full-bleed saturated field on a page that is otherwise `--paper` or `--band`. That is the skill's single permitted colour-block exception and I am claiming it deliberately rather than by accident, with one mitigation that makes it defensible: **the plate is theme-invariant.** `#A81B36` carrying `--on-plate` `#FBFBFA` type at 7.054:1 is the same object in light mode and in dark mode, and the theme-invariance is what forces the separate `--on-plate` token rather than being a free consequence of it, so it is a brand field rather than a theme inversion, and no reader in either mode feels they walked into a different website. The two dark navy slabs in the outgoing design are both retired, so this is the only ground change on the page.

**One CTA label per intent.** The page currently ships five spellings of one intent: "Join the Community", "Join the community", "Join International Founders Network", "Join Network", "Join IFN". This unifies on **"Join the community"** in the hero, HowItWorks, FinalCTA and the nav action. The modal title stays "Join IFN" because a dialog title is not a CTA. Changing the nav button from "Join Network" touches a nav label, which is locked, so it needs founder sign-off; the fallback if sign-off does not arrive is to unify everything on "Join Network" instead, which is stiffer English but still one label per intent.

---

## 6. Motion

`MOTION_INTENSITY 4`. Six behaviours, all deliverable in the installed `framer-motion` ^12.29.2, all transform or opacity, no new dependency. GSAP and three.js are not installed and neither is proposed; this project fought `dist` from 5.8MB to about 1.5MB and neither would repay its weight here.

| # | Behaviour | Why it earns its place | Reduced motion |
|---|---|---|---|
| 1 | Hero copy block translates `y` 16px to 0 over 700ms | Establishes reading order at the top of the page | Renders at rest |
| 2 | **The mark draw.** A pseudo-element under a marked phrase scales `scaleX(0)` to `scaleX(1)` from the left over 260ms, `whileInView`, once | It enacts the page's whole idea, a hand marking the checkable parts in reading order, and it is the only animation here that carries meaning rather than polish | CSS resting state is `scaleX(1)`, the transition lives inside `@media (prefers-reduced-motion: no-preference)`, so the mark is drawn with JavaScript disabled and under reduced motion |
| 3 | Section entry: `whileInView` `y` 16px plus opacity, 60ms stagger, once, `amount: 0.25`, non-LCP content only | Reveals content in reading sequence | Renders at rest via `MotionConfig` |
| 4 | The HowItWorks rule draws left to right via `scaleX` with `transform-origin: left` on view | The line is the sequence, so drawing it communicates order rather than decorating it | Renders full width instantly |
| 5 | The cycling headline word rolls vertically inside an `overflow-hidden` slot on the preserved 3000ms interval, transform only | It is three ways this audience names itself and a roll says "and also this" without ranking them | A `setInterval` is a JS timer that `MotionConfig` cannot reach, so it keeps its hand-written `useReducedMotion` early return and settles on "International" |
| 6 | Controls take `translateY(1px)` and `scale(0.985)` on `:active`, plus a 150ms background transition to `--accent-press` on hover | Physical feedback on the page's one action | Transform kept, it is instantaneous feedback rather than an animation |

**The LCP guard, absolute.** No ancestor of the h1, the subtext, the CTAs or the hero band may animate `opacity`, `clip-path`, `mask`, or use `whileInView`. The second audit measured the current hero at effective opacity 0 with zero animations queued, after the first audit reported it fixed, because opacity composites multiplicatively down the ancestor chain and a single-element read cannot detect it. A transform-only entrance degrades to "sits 16px low", never to a blank page.

**Explicitly not built:** no text scramble or date shuffle (the source concept had one on the events date and it mutates the most actionable string on the page in front of a reader parsing a US date format for the first time), no parallax, no marquee, no pinning, no scrub, no scroll hijack, no counters, no infinite loops. `window.addEventListener('scroll')` at `Navbar.tsx:39` is a hard ban and is **deleted with no replacement**: the new nav is flat, solid and fixed at 64px with no transparent state and no height change, so there is no scroll-driven state to track and reaching for `useScroll` would be replacing a banned listener with an unused hook.

**The reduced-motion CSS block in `src/index.css` is kept exactly as written**, including its `*:not(.motion-status)` selector-exclusion form. The naive repair that used `revert` was measured to be inert and froze six spinners harder than no rule at all. `.motion-status` must stay on the same element as the `animate-*` utility, never on an ancestor. No new blanket animation rule is added.

---

## 7. Photography

I opened every candidate frame and audited each on three axes: identifiable faces, third-party branding, and whether it is redundant with another selection. The third axis is the one every judged concept skipped, and it is the one that changed the plan.

### The honest constraint

**Every frame in this folder that carries no identifiable face is a photograph of a screen.** That is not a preference, it is the inventory. So a "three dated nights" photographic argument cannot be made on day one without either publishing faces without consent or shipping three redundant pictures of the same object. Both are worse than shipping fewer images.

**Day one ships two photographs, and they do not prove recurrence.** Recurrence is carried by the copy ("more than six months of monthly meetups") and by nothing else. Not by the events index: it is upcoming-only by the rule in section 5, and an index of future dates cannot evidence past recurrence in any case, which is the exact fabrication-by-layout this plan disqualified the Marked Copy ledger for. Not by these two photographs either, since neither carries a printed date. One sentence of copy is the whole of the evidence, that is a real cost, and I am naming it rather than dressing two screen photographs or a calendar as proof of a history.

### What ships

| Slot | File | Crop | Why it survives all three axes |
|---|---|---|---|
| Hero band, full bleed, 2.4:1 | `assets/photos-source/venue/20260226_184628.jpg` | `(0, 0, 4000, 1667)`, which removes both figures at the bottom edge with margin | The IFN sign glowing at night, its sibling screen at left, and **two mirror reflections in the window glass** over the faintly lit Austin skyline. No people. No third-party branding. It is the page's thesis rendered literally, and the reflections and the city are what make it a room rather than a screenshot of a screen. |
| HowItWorks middle stop, **1093:874** | `assets/photos-source/meetups/20260423_184515.jpg` | `(2907, 160, 4000, 1034)`, the upper-right architectural region. 1093 x 874, ratio **1.2506** | Daylight, April, a steel truss ceiling and an industrial pendant over a full-height glass wall looking down on downtown Austin from a high floor. No people in the crop. No branding. It is the only day-one image that is not a screen, and it says "a real room in a real building in Austin" without asking anyone's permission. |

**The slot ratio is stated exactly rather than nominally, because the nominal figure does not divide.** It is **1093:874 = 1.2506**, which is 5:4 to within 0.05 percent but is not 5:4: 1093 and 874 share no common factor, so the ratio does not reduce and no tier height falls out of it as a whole number. Calling it "5:4" in an earlier draft was the kind of rounding that turns into an off-by-one in a build script, so **the manifest carries the output width and height per tier as literal integers rather than deriving heights from a ratio**: 640x512 and 1024x819 on day one, 1440x1151 when the drop-in unlocks the third tier. It remains near-5:4 by choice rather than by accident, so the consent drop-in satisfies the same slot: `20260423_184540.jpg` is a 4000x2252 landscape frame and a 1093:874 crop of it is 2816x2252, which comfortably covers every width tier. The day-one source is only 1093px wide, so **the manifest carries a per-slot maximum width, not one global ladder**: this slot renders 640 and 1024 only on day one and never upscales, and the 1440 tier unlocks when the drop-in lands. At a slot that occupies roughly 600 CSS px in the 2fr middle column, 1024 gives about 1.7x device-pixel coverage, which is acceptable for a supporting mid-page image and is stated here rather than discovered. The hero band's per-slot maximum is 1920.

Alt text is written by hand per photograph, describes the room, and names no individual and no venue.

### What is excluded, and why

| File | Reason |
|---|---|
| `venue/20260226_184645.jpg` | CAPITAL FACTORY sits dead centre as the highest-contrast object in the frame. On a page whose copy says "Hosted at Station Austin" this is unusable at any size, and there is no crop that saves it because the logo is the composition. |
| `meetups/20260423_184536.jpg` | The Capital Factory gear is large and centre-right, and three identifiable people occupy the lower right including one man in sharp three-quarter profile. The only clean crop is the left third, which is another photograph of a screen and therefore redundant with the hero band. |
| `venue/20260723_175654.jpg` and `venue/20260723_190952.jpg` | Both carry the US flag, the Texas flag and an illuminated Capital Factory eagle. For a brand named International Founders Network addressing people arriving from other countries, a wall of national and service flags is a specific signal, and it is one I am not willing to send by accident. The left crop of `190952` is clean but is a third screen. |
| `venue/20260226_184639.jpg` | Handsome, and the frame I sampled the accent hue from, but it is a third photograph of the same slide and redundant with the hero band. |
| `meetups/20260226_184622.jpg` | Six people among a dozen empty chairs. Honest and self-defeating at the same time. |
| `meetups/20260423_201820.jpg` | A posed camera-facing line-up of sixteen fully identifiable people. Wrong genre, worst consent-to-usefulness ratio in the set. |
| `meetups/20260423_184509`, `_184523`, `_184527`, `20260723_190939` | Consent-gated and redundant with the two named upgrades below. |
| `meetups/20260423_184620.jpg` | **Reclassified.** Two of the judged concepts shipped this as a zero-consent hero on the grounds that faces are unidentifiable at delivered width. I cropped the seated group out of the 4000px original and rendered it at 1400px: several people are plainly identifiable. At a 1600px delivered width the faces fall to roughly 15 to 25px, which is probably below a stranger's recognition threshold, but "probably unidentifiable" is a statistical argument, not a consent argument. This frame carries people, so it is consent-gated like every other frame that carries people. |

### The consent gate and the upgrade path

`assets/photos-source/DO-NOT-USE.txt` does not exist. Per the folder README's own protocol that file is created when someone declines, so its absence means consent was **never recorded**, not that it was granted. No identifiable face ships until the founder answers.

**The ask is two files, in this order.** Both slots keep their exact crop ratio, so each upgrade is a manifest edit and not a re-layout.

1. `meetups/20260423_184540.jpg` replaces the architectural crop at the HowItWorks middle stop. It is the best conversational frame in the set, a man in a grey blazer mid-gesture with the room listening, the skyline behind, and it carries **zero third-party branding**. This is the frame that turns "come to a meetup" from a claim into a picture.
2. `meetups/20260423_184515.jpg` (full frame, cropped left of the Capital Factory gear) replaces the hero band. A full, visibly international circle in daylight with the city outside the glass. This is the strongest photograph IFN owns.

**The shots that do not exist and cost nothing to take.** Detail frames (a name badge, hands around a cup, the sign-in sheet), any vertical frame at all (all fifteen sources are 16:9 landscape, so every non-landscape slot is currently a destructive crop), and an exterior of the building at dusk. None of those need anyone's consent and all three could be shot in ten minutes at the next meetup.

### Pipeline

`sharp` is added as a **devDependency**. It is not installed today and it is the only new runtime-adjacent dependency in this plan; it runs at build time only and adds zero bytes to the client bundle.

`scripts/build-photos.mjs` reads from `assets/photos-source/`, which stays outside `public/` because Vite copies `public/` into `dist` verbatim and would otherwise publish 41MB of originals. It reads a checked-in manifest that names, per slot: source file, crop box in source pixels, output ratio, per-breakpoint art-directed crop, maximum long edge, and alt text. It writes `public/photos/` plus a generated `photos.json` carrying intrinsic width and height per derivative, so every `<img>` ships explicit `width` and `height` and CLS stays at zero.

- **Formats and widths:** AVIF plus WebP, delivered through `<picture>` with `srcset` and `sizes`. Width tiers 640, 1024, 1440, 1920, but **each slot declares its own maximum in the manifest and the script never upscales past the source**. No JPEG tier; WebP has been universally supported since 2020 and a third tier roughly doubles repository weight for nothing.
- **Hard cap:** 1920px long edge globally, enforced in the manifest rather than in prose. Originals are never published.
- **Grade, baked in at build so it costs nothing at runtime:** per-night white balance normalisation (February off its green cast, April neutral), saturation to about 0.55, black point lifted 4%, white point pulled to 92%. No duotone and no heavy stylisation. The amateurness of these photographs is the credibility, and converting evidence into a graphic device is the point at which documentary stops being proof.
- **Delivery:** the hero band is `loading="eager"` `decoding="async"`. Whether it also gets `rel="preload"` with `fetchpriority="high"` is decided by measurement, not by default: at 1366x768 it sits below the fold and preloading it would compete with the font load that gates the text LCP, while at 1920x1080 it is above the fold and is plausibly the LCP element itself. Measure at both viewport heights and preload only if it wins.
- **Budget:** under 500KB total page photography at 1x on a 1440 viewport, hero band under 110KB at 1440w AVIF. Measured, not estimated, before the phase closes.

---

## 8. What is preserved, and why the two audits were not wasted

The visual language is being replaced. Almost none of the engineering is.

**Preserved verbatim, with the reasoning that produced each one:**

- **The full information architecture.** Every route, slug, nav label and anchor id. `#mentorship`, `#events`, `#partners`, `#resources`, `#faq`, `#main-content`.
- **The accessibility floor. The gate is the named checklist below, item by item, and it is not a count.**

  | # | Affordance that must still exist and work after the redesign |
  |---|---|
  | 1 | The Join dialog's focus trap **with focus restored to the opener on close** |
  | 2 | Its capture-phase keydown handler that re-queries focusables on every Tab |
  | 3 | The body scroll lock, **with the prior overflow restored on close** |
  | 4 | A permanently-mounted `role="status"` region in `JoinModal` (mounted at all times, never conditionally rendered) |
  | 5 | A permanently-mounted `role="status"` region in `EventsPreview`, now announcing the resolved meetup count in place of the retired pager's page counter |
  | 6 | `role="alert"` on submit error, **with focus returned to the submit button** |
  | 7 | The FAQ's `hidden="until-found"` set imperatively, its `beforematch` listener, and the re-hide in `onAnimationComplete` |
  | 8 | `ButtonLink`'s union type keeping navigation as real anchors, including the sr-only "(opens in a new tab)" |
  | 9 | The `aria-pressed` filter group with its labelled `role="group"` |
  | 10 | The skip link, resolving to `#main-content` |
  | 11 | Exactly one `<main>` landmark |
  | 12 | Per-route `document.title` on all seventeen routes |
  | 13 | The 44px touch floor encoded in `SIZES`, governing every control including the new snap rail and the section 9 pill |
  | 14 | The resources rail's `role="group"`, `tabindex="0"` and per-panel focusable link |

  **Why this replaces the count that stood here before.** An earlier draft made `grep -roE 'aria-[a-z]+=' src/ | wc -l` returning **140** and `grep -ro 'role=' src/ | wc -l` returning **27** binding pass conditions. Both numbers are correct today and both are the wrong instrument, for two reasons that point in opposite directions. The gate is arithmetically impossible to meet: this plan deletes `HeroVisual.tsx` (6 aria attributes), `GlobeIcon.tsx` (2) and the events dot pager (roughly 4 aria and 1 role), so about 12 aria attributes and 1 role leave the tree before a single one is added. And most of what leaves is `aria-hidden` on decorative divs, which is precisely what deleting the hand-rolled globe medallion is **for**. A raw count penalises the deletions this plan exists to make and can be satisfied in the other direction by scattering redundant attributes that help nobody. Counting sightings instead of enumerating roles is the same error section 4.2 was rewritten to stop making with contrast.

  **The counts are kept as an informational note, not a gate:** 140 aria and 27 role today, expected to land near 128 aria and 26 role after the deletions above and before any additions. Report the delta and explain it; do not defend the number.
- **The correctness fixes.** Zone-correct and DST-correct event formatting, server-side join validation, the 404 route, the events API fallback.
- **The primitives.** `Button`, `ButtonLink`, `buttonClasses`, `Container`. These get new token values, not new structure. `buttonStyles.ts` stays outside the component file because of the React Fast Refresh rule.
- **The performance work.** Per-section `Suspense` boundaries in `Home.tsx`, lazy sections, the 1.5MB dist.
- **The honesty.** No invented testimonial, no counted metric, no fabricated partner, no chapter, no matching system, no mentor programme, no response-time promise, no confirmation-email claim. `portraits/` is empty, so no face-plus-quote treatment is buildable and none is proposed.

**Two audit findings are load-bearing in this plan rather than merely respected.**

The amber failure was not twelve local bugs, it was one token deployed into a role whose contrast was never computed, mandated by a design document, so twelve components were correct against a wrong contract. Section 4.2 above exists in the form it does because of that: every token is measured in every role it plays, against both grounds, in both modes, before it is adopted, and the failing rows are published rather than deleted. The one row every judged concept still missed, accent against surrounding body text at 2.547:1, is in that table because the lesson is to enumerate roles rather than sightings.

The LCP opacity gating was reported fixed and was not, because the verification method read `getComputedStyle(h1).opacity` on a single element and opacity composites down the ancestor chain. The motion section's LCP guard is written as a structural ban on the ancestor chain rather than as a per-component instruction, because a per-component instruction is what failed.

**Two couplings that will produce CLS if missed.** Each of the six lazy sections in `Home.tsx` hardcodes both its ground tone and an approximate height into its `Suspense` fallback (`bg-slate-50 min-h-[36rem]` and five more). All six must be retuned to the new tokens and the new section heights or the page bands wrong before hydration and shifts when each chunk lands. And `scroll-margin-top` must move from `6rem` to `4.5rem` with the nav height.

---

## 9. Build sequence

Each phase is independently shippable and leaves the site in a better state than it found it.

**Phase 1: the token layer, type, and the shell. Light only. No photographs. One founder decision required before the phase can close: the nav CTA label.**

*Precondition, corrected.* An earlier draft headed this phase "no founder input, no blockers", which was wrong on its own terms. The pre-flight commitment in section 11 requires one CTA label per intent across nav, hero, HowItWorks and FinalCTA; section 5 states that changing the nav button from "Join Network" touches a locked nav label and therefore needs founder sign-off; and `Navbar` is restyled in **this** phase, so that is where the decision lands. The phase is still independently shippable, because the fallback is stated and mechanical: if sign-off has not arrived, ship the nav reading "Join Network" and unify hero, HowItWorks and FinalCTA on it too, which satisfies one-label-per-intent with stiffer English and is a one-string edit to reverse later. What must not happen is shipping the nav on one label and the page on another, which is the current defect with extra steps.
Rewrite `src/index.css` `@theme` to reference swappable CSS custom properties rather than holding literal hexes, so Tailwind utilities can track a runtime theme swap later. Define the light values on bare `:root`. Self-host Archivo and MuseoModerno, delete the render-blocking Google Fonts link at `index.html:17`. Restyle `Button`, `ButtonLink`, `Container`, `Navbar` (drop to 64px, delete `window.addEventListener('scroll')` at line 39 outright with no replacement, since a flat solid fixed bar has no scroll-driven state to track), `Footer`, `JoinModal` and the FAQ shell.

**Dark mode is defined at the token layer in this phase and deliberately not activated.** `App.tsx` renders one `Navbar` and one `Footer` around an `Outlet` shared by seventeen routes, and sixteen of those routes still carry hardcoded `slate-` utilities that will not respond to a token swap. Turning dark mode on here would ship a dark shell around sixteen light pages, which is exactly the failure I charged The Circle with. Shipping light-only is safe because the new light tokens are near-equivalents of the slate values they replace, so any not-yet-migrated utility still reads correctly. Ships as: the whole site gets a new typeface and a new palette, one fewer render-blocking request, one fewer banned pattern, and no regression anywhere.

**Phase 2: the sweeps, then dark mode. Mechanical, no design decisions.**
Two mechanical passes across the whole tree. First, punctuation: **151 em-dash occurrences across 46 files** in `src/` plus `index.html`, measured not estimated, including every route title in `ROUTE_TITLES`, the `<title>`, `og:title` and `twitter:title` strings, and three literal `&mdash;` entities in `JoinModal`, plus **6 en-dashes** used as separators in `roadmapData.ts`. No words change. Second, tokens: migrate all **436** hardcoded `slate-` utilities across `src/` to semantic tokens.

**The pass condition greps for the outgoing accent as well as the outgoing neutrals, because greping only `slate-` returns zero while the old palette is still live.** `slate-` is the neutral ramp; it says nothing about `--color-accent` `#f97316`, the token whose 2.679 failure this palette exists to replace. Measured today across `src/`: `grep -roE '(bg|text|border|ring|shadow)-(primary|accent)[a-z-]*' src/ | wc -l` returns **158**, of which `grep -ro 'text-accent-on-light' src/ | wc -l` returns **4** and is the retired Welcome Amber specifically. A gate that misses 158 utilities pointing at a known-bad token is not a colour gate. Pass condition is site-wide and both halves must hold: `grep -ro 'slate-' src/ | wc -l` returns **0** **and** the `(primary|accent)` expression above returns **0**, with every one of those 158 call sites repointed at a semantic token measured in section 4.2.

Only once that returns zero does dark mode switch on, in the same phase: redefine the tokens under `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])` and again under `:root[data-theme="dark"]` so a manual toggle wins in both directions, declare `color-scheme: light dark` on `:root` (which matters concretely, because `JoinModal` has a native `<select>` that would otherwise render as a white system dropdown in the middle of the conversion path), and add the footer toggle that closes the open `BACKLOG.md` item. Ships as: correct punctuation everywhere, a token system that cannot collide with a Tailwind default, and a dark mode that is genuinely site-wide.

**Phase 3: sections 2, 3, 4, 8 and 9. Composition only, no photographs. Blocked on the venue answer, which is a content decision this phase cannot route around.**

*Precondition, stated plainly rather than inherited.* FinalCTA keeps "Hosted at Station Austin" verbatim and sets it at the page's second-largest size in the closing frame. That string is already live, so an earlier draft treated the contradiction as inherited. It is not, and this is the phase where it stops being inherited: `src/data/events.json` carries `location_name` = "Capital Factory, 701 Brazos St" on all ten rows, and section 5's featured event object **prints the venue**. So once Phase 5 lands, the page itself prints "Capital Factory" in section 5 and "Station Austin" in section 9 on one scroll. The feed does not merely contain the conflict, it publishes it, and Phase 3 promotes the unresolved half into the last thing a reader sees. **Ship Phase 3's sections 2, 3, 4 and 8 freely; hold section 9's four-item panel until the venue question is answered**, or ship it knowing the page will contradict itself in public the moment section 5 arrives. This is a founder decision, listed as a blocker in section 10, and it is not resolvable by editing a string, because whichever string is edited becomes a claim about a fact.

ValueProps, HowItWorks, FounderStory, FAQ and FinalCTA. The HowItWorks middle stop ships with a `--band` display-type cell where the photograph will go. Ships as: five sections rebuilt, three banned patterns retired (three identical cards, ghost step numerals, the 2x2 icon-card grid), both dark slabs gone, and the accent field closing the page.

**Phase 4: the photo pipeline and sections 1 and 7.**
Add `sharp`, write `scripts/build-photos.mjs` and the manifest, generate the two day-one derivatives, build the hero and the resources rail. Retune all six `Suspense` fallbacks and `scroll-margin-top` here, because this is where section heights settle. Measure the photography budget and decide the preload by measurement. Ships as: the finished page minus partners.

**Phase 5: sections 5 and 6. Gated on founder input.**
EventsPreview can ship immediately. PartnersStrip is blocked on vendored partner artwork, since two of three marks are currently hotlinked from a third-party favicon endpoint.

**Phase 6: consent upgrades and documentation.**
Swap in `184540` and `184515` when consent lands. Rewrite `DESIGN.md` so it describes what actually shipped, because a design document that specifies a wrong contract is how twelve correct components ended up wrong. Update `openspec/specs/home-page/spec.md`, which still lists eight sections while the code renders nine.

---

## 10. Open risks and founder input

**Risks I own**

1. **Day one carries no photograph of a person.** Two images, one of a sign at night and one of a room in daylight, cannot make the page's central argument that a room with people in it recurs. The page ships at roughly 75% of its strength until consent lands on two files. I would rather state that than dress a screen photograph as proof of a community.
2. **A deep crimson on near-white is a taste bet.** It is derived by measurement from IFN's own slide, but a sponsor could read red as alarm rather than as a mark. The mitigations are structural: the accent never carries an error state, the density rule caps it at two marks plus the wordmark period in any viewport, and the neutrals are locked to one hue so the red is the only colour on the page. If the founder's read is that it reads as warning, the honest fallback is a deep petrol at the same three roles, re-measured by the same sweep, not a retreat to navy.
3. **The page is more austere than the slide it derives from.** The slide's gradient-filled `Founders` cannot come across, because gradient display type is banned and it is the most common AI tell in headline treatment. Stated above in full.
4. **Mobile verification is unresolved for a third round.** The browser harness could not resize the viewport in either audit. I am not making a fourth promise. What I am doing instead is declaring the sub-768px collapse for every asymmetric layout in the same component that declares the asymmetry, and re-measuring the hero h1 at 360px against the preserved overlapping-grid slot before ship, because that exact bug (a `min-w-[240px]` slot making line one unbreakable) has already happened here once.
5. **Retiring italic display emphasis removes a documented brand signature.** `DESIGN.md` calls the italic accent word the signature typographic move. It goes because Archivo's weight ladder is the slide's own emphasis mechanism and because colour-only emphasis is the defect this whole palette exists to fix. It is still a loss and the founder should be told rather than discover it.

**Founder input this plan cannot supply**

| Question | Why it blocks |
|---|---|
| **Photo consent on `20260423_184540` and `20260423_184515`.** | Two files, one evening of messages. Unlocks the only photographic proof that people come. |
| **Station Austin or Capital Factory?** | Every photograph across all three nights carries Capital Factory branding, `src/data/events.json` sets `location_name` to "Capital Factory, 701 Brazos St" on all ten rows, and every shipped surface says "Hosted at Station Austin". `v1/event-playbook.md` conflates the two. This is a content contradiction, not a caption problem. No photograph on this page names a venue and the FounderStory fact strip keeps its existing wording until this is answered. |
| **Nav CTA label.** | Unifying on "Join the community" changes a locked nav label. Fallback stated in section 5. |
| **The exact brand red.** | Recovered from photographs of an emissive screen, so the hue family is certain and the value is not. If a source file exists, the hex should be re-derived from it and then re-swept for contrast. |
| **Vendored partner artwork.** | Station Austin and Reuneo marks, with permission. Blocks section 6. |
| **Real LinkedIn and Instagram URLs.** | `socialLinks.ts` flags them `verified: false`; they ship as live links and will 404 if wrong. |
| **Correct Stripe Payment Links, and whether "Cancel anytime" is a commitment IFN honours on an annual membership.** | Both still open from the second audit. |

---

## 11. Pre-flight commitments

Drawn from skill Section 14. These are the conditions the built page is held to, not aspirations.

- **Zero em-dash and en-dash characters** anywhere visible: headlines, eyebrows, body, quotes, attribution, captions, buttons, alt text, route titles, meta tags. Phase 2 is the mechanism. This document contains zero, verified by grep.
- **Page Theme Lock:** one theme end to end, both dark navy slabs retired, with exactly one declared colour-block exception at section 9 which is theme-invariant and therefore not an inversion.
- **Color Consistency Lock:** one accent, three licensed roles, identical hue across modes. No second brand hue anywhere, including error states.
- **Shape Consistency Lock:** radius 0 on surfaces, full pill on discrete controls, radius 0 on full-width interactive rows. Documented boundary, applied everywhere.
- **Button Contrast Check:** primary 7.054 light and 5.517 dark on the per-mode `--accent` fill; the section 9 pill is `--on-plate` filled with an `--accent-plate` label at 7.054 in both modes, because the plate is theme-invariant and anything on it must be too; secondary is a `--paper` fill with a 4.960 `--edge` stroke and a 17.965 label, never a transparent button with no border. No CTA label wraps at desktop; "Join the community" is three words.
- **Form Contrast Check:** input border 4.960 and 4.495, placeholder 5.982 and 6.808, helper text 6.601 and 7.496, error text 17.965 on the modal's `--paper` ground with no accent, focus ring never below 3:1 on any ground (4.264 worst case on the grey sweep, 7.054 on the accent plate, both layers declared identically in both modes with no reversal). The `JoinModal` scrim and surface are named tokens with measured rows, not an unspecified overlay: boundary 4.793 by tone in light, 4.005 by border in dark. Labels above inputs, no placeholder-as-label, field names and order unchanged.
- **No Duplicate CTA Intent:** one label per intent across nav, hero, HowItWorks and FinalCTA.
- **Eyebrow count:** 2 against a budget of 3, counted mechanically.
- **Section-Layout-Repetition:** nine families across nine sections, geometry printed per section rather than asserted by label. One image-plus-text split, so the zigzag cap is not approached.
- **Hero:** four text elements, two actions, no decorative dot in the eyebrow pill, headline `clamp(2.75rem, 6vw, 5.25rem)` running 2 lines at desktop and 5 at 360px, `pt-20` top padding, **601px to the band at 1366x768** and **605px at 1920x1080**, both re-measured at build against the 0.503em display metric printed in section 5.
- **Hero subtext, recorded as a miss rather than a commitment:** the rule is 20 words; the preserved string is **33 words and 186 characters** and ships at 3 lines. The conflict with the content-preservation constraint is argued in section 5 and priced there at 27px of band preview. A trimmed 24-word alternative is specified there and needs founder sign-off. This line states the overrun; it does not restate the rule as if it were met.
- **Logo wall:** logos only, no category label under any mark, real vendored artwork or the partner is omitted.
- **Motion:** every behaviour justified in one sentence, all transform or opacity, reduced motion explicit per behaviour, no `window.addEventListener('scroll')`, no marquee, no pinning, no loops, `useEffect` cleanups strict.
- **Images:** real documentary photography only, no hand-rolled decorative SVG, no div-based fake previews, explicit `width` and `height` on every image, `min-h-[100dvh]` never `h-screen`.
- **Icons:** `lucide-react`, already a project dependency and permitted on that basis by skill 3.C, `strokeWidth` standardised at 1.5, every glyph `aria-hidden`, no hand-rolled paths, no second family.
- **States:** empty, loading and error designed for the events section and the join form, not just the successful state.
- **Mobile:** every asymmetric layout declares its sub-768px collapse in the same component.
- **Copy self-audit:** every visible string re-read before ship. No invented metric, no invented person, no invented partner, no fake precision.
- **Core Web Vitals:** LCP under 2.5s with a transform-only hero entrance and a measured preload decision, CLS zero via explicit image dimensions and retuned `Suspense` fallback heights, INP under 200ms with no scroll listeners and no rAF loops touching React state.
