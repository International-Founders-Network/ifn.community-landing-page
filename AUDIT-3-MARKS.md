# AUDIT-3: the accent licence, mark by mark

Scope: `REDESIGN-PLAN.md` and `DESIGN.md` against the code as it stands on
`copy/international-founder-positioning` at `ae91252`. Report only. No code
changed. Every line number is a live call site, not a comment.

---

## 0. The rule everything resolves against

There is one discriminator and it is a sentence, not a count
(`REDESIGN-PLAN.md:31`, restated `DESIGN.md:237`):

> The accent may mark only a phrase that is checkable against a named artifact
> **on this page**: a date in the events feed, a named partner, a photograph on
> this page, a standing disclosure, or a denial of something IFN does not offer.
> A marketing adjective can never be marked, because there is nothing to point at.

Two corollaries that matter for reading the verdicts below:

- **It is a cap, not a quota** (`ValueProps.tsx:81`). A section with zero marks
  passes. A section with an unevidenced mark is the defect.
- **The plan contradicts itself on the count.** §2 says "ValueProps carries four
  marks"; §5 says "exactly one clause in each is marked, and only the checkable
  one" and then names two. `ValueProps.tsx:87-92` already adjudicated this in
  favour of the licence. That adjudication is not re-opened here.

---

## 1. THE HEADLINE FINDING: ValueProps documents zero marks and ships four

`src/components/ValueProps.tsx` lines 48-126 are a 79-line comment block whose
subject is that this section carries no marks:

- `:52` — "**THIS SECTION NOW CARRIES NO MARK AT ALL.**"
- `:66` — "**NONE OF THE FOUR ROWS QUALIFIES NOW**", then argues it row by row.
- `:92` — "**Do not 'restore' any of them.**"
- `:104` — "DENSITY: zero marks against a ceiling of two per viewport."
- `:63` — "With no call site left, the `Mark` component itself was deleted."

The `Mark` component is at `:296`. Four call sites are at `:370`, `:379`, `:393`
and `:411`. Commit `ae91252` restored the marks and did not touch this comment.

This is the single worst thing in the audit, and not because the marks are
wrong (they are, see §2). It is worst because the file now instructs the next
reader to delete something it ships, so the next person to work here either
deletes four founder-approved marks as rot, or reads the block as stale and
stops trusting the other 700 lines of reasoning in this component. **Whichever
way the marks go, this block has to be rewritten in the same commit.**

---

## 2. Line by line: every mark on the home page

Nine marks ship. Verdict format: phrase → the artifact on this page that checks
it → result.

| # | Site | Phrase | Artifact that checks it | Verdict |
|---|---|---|---|---|
| 1 | `ValueProps.tsx:411` | "Built for founders" | none | **FAIL** |
| 2 | `ValueProps.tsx:370` | "been through" | none | **FAIL** |
| 3 | `ValueProps.tsx:379` | "meet the network" | none | **FAIL** |
| 4 | `ValueProps.tsx:393` | "Resources" | none on this section | **FAIL** |
| 5 | `FounderStory.tsx:415` | "Hosted in downtown Austin" | `EventsPreview` prints 701 Brazos St | **PASS** |
| 6 | `EventsPreview.tsx:351/379` | the featured date | the date *is* the artifact | **PASS** |
| 7 | `FAQ.tsx:370` | "Not as a professional service" | it is a denial | **PASS** |
| 8 | `FAQ.tsx:388` | "Austin only" | it is a denial | **PASS** |
| 9 | `ResourcesPreview.tsx:346` | "being built now" | its own stage panels | **PASS, weakest** |

### 1. `ValueProps.tsx:411` — "Built for founders" starting from zero

**Fails hardest of the nine.** This is the section headline, and "built for
founders" is a marketing adjective phrase — the licence's own named
counter-example. There is no artifact anywhere on the page a reader can hold it
against. It is also structurally odd: the other three ValueProps marks sit one
per row-claim, so this is a fifth mark on a claim that has no row.

Note the collision the file itself flags at `:412-421`: the same heading already
carries `<span className="font-extrabold">zero</span>`, the weight-ladder
device. One short heading now runs both emphasis mechanisms. The comment argues
this is legible because they are different devices. It is still two emphasis
systems in eight words, and it is the least polished line in the section.

**Recommendation: delete the mark, keep the weight step on "zero".**

### 2-4. `ValueProps.tsx:370`, `:379`, `:393`

I am not going to argue these from scratch, because the file already argues them
against these exact rows at `:66-79`:

- `:68` on row 1 ("been through") — "Row 1 asserts who is in the room. True, and
  **nothing on this page is a named artifact a reader can check it against**."
- `:59-62` on row 2 ("meet the network") — the founder's copy edit replaced the
  old title, and "**the new title makes no checkable claim, so there is nothing
  left in it to licence**."
- `:76-79` on row 4 ("Resources") — the artifact would be ResourcesPreview's
  panels, "**owned by another section and whose final topics this component
  cannot inspect**. Marking a claim against an artifact you have not read is the
  same move the plan disqualified the Marked Copy ledger for."

Row 3 (`:386`) is correctly unmarked and needs nothing.

Independent of the licence, mark 4 has a second problem: "Resources" is a bare
noun, not a phrase making a claim. Marks 1-3 at least mark a predicate. Marking
a single common noun makes the accent read as decoration on a keyword, which is
the exact reading the licence exists to prevent.

### 5. `FounderStory.tsx:415` — "Hosted in downtown Austin" — PASS

Checkable against `events.json`, where all ten rows carry "701 Brazos St,
Austin, TX 78701" and `EventsPreview` prints it two sections below.

Carry forward the standing deletion condition `ae91252` attached to it: the
retitle from "Hosted by our venue partner" removed the `PartnersStrip` half of
its evidence, so the events feed is now its **only** artifact. If that feed ever
empties, this mark must be deleted rather than relicensed.

### 6. `EventsPreview.tsx:351` + `:379` — the featured date — PASS

The strongest mark on the page. A date at display scale in accent with a 3px
rule under it, where the date is itself the checkable artifact, and it is the
slide's own device (date plus arrow) reproduced.

### 7-8. `FAQ.tsx:370`, `:388` — PASS

Denials, which the licence at `REDESIGN-PLAN.md:31` calls the most checkable
sentence there is. These are the marks the system was designed for. See §4 for a
rendering defect that stops them looking like the other seven.

### 9. `ResourcesPreview.tsx:346` — "being built now" — PASS, but thinly

Recorded as the weakest passing mark rather than grouped with the FAQ pair. Its
artifact is inside its own component (the stage panels printing "Being written",
and the terminal panel's counted total). Every other passing mark points at an
artifact in a *different* section, which is a harder test. This one is
self-referential — true, and a thinner kind of true.

---

## 3. Better placement: where a ValueProps mark could legitimately go

The user asked specifically for this. There is exactly one candidate, and it
comes with an objection already on the record.

**Candidate:** ValueProps row 2's **body** (`:382`) reads "Every date is
published openly on Luma and Meetup, so you can see the history before you
commit to anything." That is checkable against `#events` two sections down —
genuinely, not thinly. It is the best unmarked sentence in the section.

**The objection, from the file itself at `:71-74`:** "The mark that used to live
in this row was in its TITLE, and moving it into the body to preserve a count is
**relicensing**, which is the one move the licence forbids outright."

Both halves are real. The sentence qualifies on its merits; moving a mark
downward inside a row to keep a count is the move the licence bans. The
discriminator is intent, and intent is the founder's call, not mine: if the mark
lands there because that sentence is the checkable one, it is licensed; if it
lands there because ValueProps "should have a mark", it is relicensing.

Two further constraints if it is taken:

- The mark would sit in a `text-muted` paragraph. `ValueProps.tsx:118` states the
  standing rule: **no mark is ever placed inside a `--muted` paragraph**, because
  accent against muted measures 1.069 light and 1.359 dark. Taking this candidate
  means either promoting that line to `--ink` or dropping the idea.
- "published openly" contains a `p` and a `y`. `ValueProps.tsx:250-253` requires
  a descender re-measure before marking any phrase containing `p`, `q`, `y` or
  `j` at these rule offsets.

**My read: the cleanest outcome is ValueProps at zero marks.** It was compliant
at zero, the file is already written for zero, and the section's geometry — the
1/3/2/4 staircase — is doing the work marks would otherwise be asked to do.

---

## 4. Four `Mark` components, four spellings, one of them half-built

This is the direct answer to "make the site more polished". The page's signature
device is implemented four times and no two agree:

| Component | Accent type? | Rule offset | Other |
|---|---|---|---|
| `ValueProps.tsx:302` | yes | `-bottom-1`, `w-full` | wraps freely |
| `ResourcesPreview.tsx:208` | yes | `pb-1.5` + `bottom-0` | inset-x |
| `FAQ.tsx:117` | **NO** | `-bottom-0.5` | `whitespace-nowrap` |
| `FounderStory.tsx:429` | yes (on the `dt`) | `mt-[0.3em]` | block rule |

**`FAQ.tsx:117` is a real defect, not just an inconsistency.** The plan defines a
mark as "**accent type plus** a 3px accent rule" (`REDESIGN-PLAN.md:31`). The FAQ
`Mark` span carries no `text-accent`, so its two denials render as ink type with
a red rule under it — half a mark. Those two are the page's *best* marks by
licence and its *weakest* by rendering. A reader scrolling the page sees seven
red phrases and two black ones underlined in red, and has no way to know they are
the same device.

The four rule offsets (`-bottom-1` = 4px, `bottom-0` on a `pb-1.5` = 6px,
`-bottom-0.5` = 2px, `mt-[0.3em]`) each have a descender argument written above
them, and each argument is locally sound. Collectively they mean the mark sits at
four different distances from its baseline on one page.

**Recommendation:** one `Mark` primitive, one offset rule, taking a descender
flag rather than a hand-tuned offset per call site. This is the highest-value
polish item in the audit and it changes no copy and no licence verdict.

---

## 5. Accent in unlicensed roles

`DESIGN.md:165` — "One accent, three roles": the mark, the primary action fill,
the wordmark period. Two live sites are none of the three.

- **`Footer.tsx:318`** — the "Built with ♥ from Austin" heart, accent-filled, no
  rule, no claim.
- **`EventsPreview.tsx:363`** — the `ArrowUpRight` beside the featured date,
  `text-accent`, no rule of its own.

**The counter-argument, which `ae91252` makes explicitly for the heart:** the
licence governs *marks*, and a mark is accent type plus a rule under a checkable
phrase. A glyph makes no claim, so there is nothing to check and the licence has
no purchase on it. That argument is coherent, and it extends to the arrow whether
or not anyone made it there — arguably more strongly, since the arrow is part of
the date object the plan describes as "the sign's own device: a date, and an
arrow pointing off it."

**But the three-role list is a closed enumeration, not a list of examples**, and
it is quoted as a pre-flight commitment at `REDESIGN-PLAN.md:672` ("one accent,
three licensed roles"). Two accent glyphs that are not marks make it four roles.
The honest resolution is not to delete them — the heart is genuinely charming and
the arrow is genuinely the slide's device — but to **amend the licence to name a
fourth role explicitly** ("an accent glyph standing in for a word, carrying no
rule"), so the enumeration stays closed and countable. Reported as one finding
with the counter-argument, not as two bugs.

---

## 6. `Emphasis.tsx` is the largest violation in the audit, and it is not on the home page

`src/components/Emphasis.tsx:27`:

```tsx
return <span className="italic text-accent">{children}</span>;
```

Both halves are banned, in four places:

- `DESIGN.md:166` — "Emphasis is a weight step inside Archivo, **never italic and
  never colour**."
- `DESIGN.md:321-324` — the Weight Ladder Rule: "Never italic. Never colour,
  because colour is licensed to checkable phrases."
- `DESIGN.md:709` — "**Don't** italicise for emphasis, and don't emphasise with
  colour alone."
- `DESIGN.md:740` — records the italic accent word as **already retired** and
  replaced by the weight ladder, with its loss "named rather than hidden".
- `REDESIGN-PLAN.md:224` — "Italic is retired from display type entirely, which
  also **collapses `Emphasis.tsx` ... to one branch with no colour logic at all**."

The component's own docstring at `:23-24` admits it: "The italic is untouched
here. Section 4.3 retires italic from display type, and that is a composition
change **owned by Phase 3**." Phase 3 shipped on 2026-08-09 and did not do it.

This is not a style nit. It is **colour-only emphasis with no 3px rule**, which
measures **2.547 against surrounding `--ink`** in light mode — under the WCAG
G183 3.0 floor. It is the precise failure the entire mark mechanism was built to
prevent, shipped on eleven surfaces:

`About.tsx:103`, `Contact.tsx:132`, `Membership.tsx:29`, `Partners.tsx:121`,
`PrivacyPolicy.tsx:15`, `TermsAndConditions.tsx:16`, `CodeOfConduct.tsx:44`,
`NotFound.tsx:42`, `Events.tsx:107`, `Resources.tsx:194`, `ComingSoon.tsx:125`.

It survived every gate because every gate in the plan was scoped to the home
page. `ComingSoon.tsx:30-31` even carries a comment describing `Emphasis` as
"one accent that measures on both grounds" — measuring it against the *ground*,
which passes, and never against the *surrounding text*, which is the measurement
G183 requires and the one row `REDESIGN-PLAN.md:194` says every judged concept
missed.

**Recommendation, and it is the top-ranked item in this report:** collapse
`Emphasis` to a weight step — `font-extrabold` against the headline's `500` — and
drop both the italic and the accent. Eleven pages, one component, no copy change.

---

## 7. Mark density: NOT verified, and stated as unverified

`REDESIGN-PLAN.md:594` records the shipped gate as "**Peak of exactly two marks
in any viewport-tall window**, at 390, 768, 1024, 1366 and 1920, in both light
and dark. Measured by collecting every 3px accent rule's document position off
the rendered page and sliding a window down it, **rather than by counting call
sites**."

That measurement has not been re-run since `ae91252` restored the marks. I have
not run it either, and I am not going to assert a peak I did not measure —
counting sightings instead of measuring positions is the error
`REDESIGN-PLAN.md:478` exists to stop.

**The suspect seam, named so it can be measured:** `ValueProps` now carries marks
at its h2 (`:411`), row 1 (`:370`), row 2 (`:379`) and row 4 (`:393`), where the
plan's gate was measured against a section carrying **zero**. Rows are `gap-y-24`
(96px) apart at `md`. The h2 plus row 1 is already two marks, and the fixed nav
wordmark period (`Navbar.tsx:120`) is on screen at all times by construction, so
the h2/row-1 window is **at the ceiling before row 2 enters it**. Whether row 2
enters the same 1080px window is the open question, and `ValueProps.tsx:106-108`
flags a second seam with `HowItWorks` below.

**If the four ValueProps marks go on licence grounds, this question dissolves
entirely** — the remaining five marks sit in five different sections. That is a
further argument for resolving §2 before spending time on measurement.

---

## 8. Documentation that now points at things that do not exist

These change no verdict above, but leaving them unlisted means the next reader
greps the plan for authority and reinstates a deleted mark as a bug fix.

| Doc site | What it says | What is true |
|---|---|---|
| `REDESIGN-PLAN.md:301` | "The four shipped claims survive verbatim", and cites "There is no matching system here" as a marked phrase | The claims were rewritten in `4be43bf`/`7bb4e5a`; that denial no longer exists anywhere in the codebase |
| `REDESIGN-PLAN.md:301` | cites "a meetup you can put in your calendar" as the other marked phrase | Replaced by "A monthly place to meet the network" |
| `REDESIGN-PLAN.md:37` | "ValueProps carries four marks, one per staircased row" | True again by accident after `ae91252`, but for different phrases than the ones §5 names, and none of them licensed |
| `ValueProps.tsx:48-126` | the section carries zero marks; do not restore them | It carries four |
| `Emphasis.tsx:23-24` | the italic is "owned by Phase 3" | Phase 3 shipped 2026-08-09 without it |
| `DESIGN.md:740` | the italic accent word is retired | It ships on eleven pages |

`ValueProps.tsx:94-102` explicitly hands the `REDESIGN-PLAN.md:301` fix to
whoever amends the plan, on the rule that the plan is not the component's file.
It is still unamended.

---

## 9. Ranked change list

Nothing below has been applied.

| # | Change | Files | Why it ranks here |
|---|---|---|---|
| 1 | Collapse `Emphasis` to a weight step; drop italic and accent | `Emphasis.tsx` | A live G183 failure at 2.547 on eleven pages, banned in four places, no copy change |
| 2 | Add `text-accent` to the FAQ `Mark`, or state why its denials render differently | `FAQ.tsx:117` | The page's two best marks currently render as half a mark |
| 3 | Delete the four ValueProps marks; rewrite the `:48-126` block to match whatever ships | `ValueProps.tsx` | All four fail the licence by the file's own argument; the file contradicts its own code either way |
| 4 | Unify the four `Mark` implementations into one primitive with one offset rule | 4 components | The signature device has four spellings; highest polish return |
| 5 | Amend the licence to name the glyph role, keeping the heart and the arrow | `DESIGN.md`, `REDESIGN-PLAN.md` | Keeps the three-role enumeration closed and countable rather than quietly four |
| 6 | Re-run the density gate by its own method after 1-4 land | rendered page | Currently unverified; dissolves if 3 lands |
| 7 | Amend `REDESIGN-PLAN.md:301` and `:37` to stop citing deleted phrases | `REDESIGN-PLAN.md` | Prevents the next reader reinstating a deleted mark |

Items 1, 2 and 4 change no copy and no licence decision, so they can proceed
without a founder call. Item 3 is a founder decision. Items 5 and 7 are
documentation.
