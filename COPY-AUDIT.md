# IFN copy audit

**Revised 27 Aug 2026.** The change list in section 4 was rebuilt after the first pass was rejected for treating IFN as a meetup company. The scorecard, diagnosis and blockers below are unchanged — they are frame-independent — but every proposed rewrite is new.

---

## 1. The verdict

Every high-intent moment on this site ends at the same place — a free email modal whose own success screen reads "This form does not send email, so nothing will arrive in your inbox. There is nothing to wait for." (`src/components/JoinModal.tsx:516`) — so the site's single best-converting asset is spent, on every route, collecting addresses it has already promised never to use. The word "$149" appears on exactly one page of eighteen, and the two components that render on all eighteen — Navbar (42) and Footer (43) — mention neither a price nor a date nor a free meetup, which means the cheapest fix on the site has been sitting unmade since launch. The prose is not the problem: FAQ (75), FinalCTA (66) and ValueProps (51) contain the best audience writing I have read on a community site this small, and every one of them is attached to either no CTA at all or a CTA that sells nothing. The problem is that IFN has written a magazine and forgotten to put a price on the cover. Calibration confirmed the pattern the brief predicted — five of twelve cuts were D2_audience, including a section (`HowItWorks`) where a grep for every international token in the file returns only the CSS word "border" in three layout comments, and which nine reviewers still scored as audience-aware.

---

---

## 2. The scorecard

Sorted worst first. Dimensions are post-calibration; composites recomputed with the rubric weights.

| Surface | Route | Spec | Aud | Offer | Objn | CTA | Hon | **Composite** | Member→ | Resource→ | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| resourcesData.ts † | data (`/`, `/resources`) | 2 | 2 | 1 | 1 | 1 | 1 | **28** | 1 | 1 | 113 titles, zero links, mostly wrong audience |
| /gallery | `/gallery` | 2 | 1 | 1 | 1 | 1 | 5 | **32** | 1 | 1 | Best asset on site, zero actions |
| /partners (sponsor lens) | `/partners` | 2 | 1 | 1 | 1 | 2 | 5 | **36** | 1 | 1 | Largest revenue line has no offer page |
| Gallery preview † | `/`, `/gallery` | 2 | 1 | 1 | 1 | 2 | 5 | **36** | 1 | 1 | Routes home traffic into a terminal page |
| Navbar † | all 18 routes | 2 | 1 | 2 | 2 | 3 | 3 | **42** | 2 | 3 | Most-rendered control on the site sells nothing |
| PartnersStrip | `/` only ‡ | 3 | 1 | 1 | 3 | 2 | 3 | **42** | 1 | 1 | Vendor job descriptions, no reader benefit |
| Footer † | all 18 routes | 2 | 3 | 2 | 1 | 2 | 3 | **43** | 2 | 1 | Best targeting, worst monetisation, 18× over |
| Home — Hero | `/` | 2 | 3 | 2 | 1 | 2 | 3 | **43** | 2 | 2 | "Connect, Grow, and Succeed" on the busiest screen |
| /404 | `*` | 2 | 2 | 1 | 3 | 3 | 3 | **46** | 1 | 1 | Every dead link lands here; no product named |
| /partners (founder lens) | `/partners` | 3 | 2 | 1 | 2 | 2 | 5 | **47** | 1 | 1 | Logo wall with no founder path off it |
| /resources | `/resources` | 2 | 3 | 2 | 3 | 2 | 3 | **49** | 2 | 2 | Admits nothing is finished, then asks for nothing |
| Home — ValueProps | `/` | 3 | 4 | 2 | 3 | 1 | 2 | **51** | 2 | 1 | Best prose on the page, no link anywhere in it |
| /events | `/events` | 3 | 2 | 3 | 3 | 2 | 3 | **52** | 1 | 3 | Proof page never says "international"; two phantom dates |
| Home — FounderStory | `/` | 2 | 5 | 1 | 3 | 1 | 4 | **52** | 1 | 1 | Warmest paragraph on the site, nowhere to click |
| JoinModal † | modal, all routes | 2 | 1 | 3 | 3 | 3 | 5 | **52** | 1 | 2 | Highest intent on the site, tells them they get nothing |
| /membership | `/membership` | 2 | 3 | 4 | 3 | 2 | 2 | **53** | 2 | 1 | Prints a price it never justifies |
| /about | `/about` | 3 | 4 | 2 | 3 | 2 | 3 | **57** | 2 | 2 | Names the pain, names no human, hides the price |
| Coming-soon lot † | 6 routes | 3 | 4 | 2 | 3 | 2 | 3 | **57** | 2 | 1 | Six intent-only URLs with no capture field |
| /contact | `/contact` | 3 | 3 | 2 | 2 | 3 | 5 | **58** | 2 | 2 | The checkout page is headed "Ask us a question" |
| Home — ResourcesPreview | `/` | 3 | 3 | 2 | 4 | 2 | 4 | **58** | 1 | 2 | Builds the want, offers a mailto |
| Home — HowItWorks | `/` | 3 | 2 | 3 | 4 | 3 | 3 | **59** | 3 | 3 | Raises payment, refuses to name the number |
| Events preview † | `/`, `/about` | 3 | 3 | 3 | 3 | 3 | 3 | **60** | 2 | 2 | Mentions membership only to defuse it |
| Home — FinalCTA | `/` | 3 | 5 | 3 | 3 | 3 | 2 | **66** | 2 | 3 | Peak intent converts a buyer into a free email |
| Home — FAQ | `/` | 4 | 5 | 4 | 5 | 2 | 2 | **75** | 2 | 2 | Best argument on the site, collapsed by default |

† Shared surfaces — a fix here pays off on every listed route:
- **Navbar**, **Footer** — all 18 routes.
- **JoinModal** — opened from `/`, `/about`, `/resources`, and the navbar button on every route.
- **Events preview** — `/` and `/about`.
- **Gallery preview** — `/` and `/gallery`.
- **Coming-soon lot** (one shared `ComingSoon.tsx` template) — `/blog`, `/careers`, `/chapters`, `/mentorship`, `/newsletter`, `/playbooks`.
- **resourcesData.ts** — the data behind `/` (ResourcesPreview) and `/resources`.

‡ **PartnersStrip is not shared.** It renders on exactly one route, `src/pages/Home.tsx:163`. `About.tsx:19` and `Chapters.tsx:14` are comment mentions, not render sites, and `/partners` does not include it. Any earlier prioritisation that assumed 4× leverage here was wrong.

`/partners` appears twice because it was scored through two different buyers' eyes — the founder who arrives from the home strip, and the partnerships lead at a law firm. Both readings are of the same file; the sponsor reading is the worse page and the more expensive one.

**Nothing on this site scores above 75.** FAQ is the only surface I would call genuinely good writing, and it is buried inside a closed accordion.

---

---

## 3. Conversion diagnosis

### Path to a $149 membership

A cold visitor lands on `/`. **Hero (43)** gives them "For international founders building in the U.S." (`Hero.tsx:178`) and two buttons, neither of which names a price, a date, or the word free. **ValueProps (51)** does the best persuading on the page and then terminates at `ValueProps.tsx:459` with no Button, ButtonLink, Link or form anywhere in the section — a reader convinced here can only keep scrolling. **HowItWorks (59)** is the first surface to admit money exists: "you decide from there whether it is worth paying for" (`HowItWorks.tsx:161`) — and then withholds the number, which is the exact sentence that sends a reader to the nav to hunt for it. **Events preview (60)** is the only home-page mention of membership and its content is that you do not need one: "Free to attend, whether or not you are a member" (`EventsPreview.tsx:261`). **FinalCTA (66)** reaches peak intent and spends it on `openJoinModal`. **FAQ (75)** holds the entire lower page's only membership link, inside the `fee` answer, which is **not** in the `defaultOpen` set — only `who` and `meetup` are. The price renders collapsed.

The reader who hunts finds **Navbar (42)**: a bare noun, "Membership", one gap from a button labelled "Join the community" that goes somewhere else entirely. On **/membership (53)** they get "Membership runs for a full year." (`Membership.tsx:91`) directly above the price — a billing term where the justification should be — and one CTA, ~700px below the fold, reading "Request your membership link". That routes to **/contact (58)**, headed "Ask us a question" (`Contact.tsx:132`), with a form of Name / Email / Phone / Company / Message and no reason-for-contact field, no `$149`, no "Founding Member", and no reply-time commitment anywhere before submission.

**Where it breaks:** in three places, in order of cost. (1) The price is absent from all 18 routes' chrome and from the first screen of every page including `/membership` itself. (2) The home page's only membership mention exists to tell you not to buy. (3) The handoff from the priced page to the checkout page is built on one side only — `/membership` explains that a human sends a payment link, and `/contact` contains zero acknowledgement that a hand-run checkout exists. That is the difference between a broken checkout with a staffed counter and a broken checkout with a suggestion box.

### Path to an email address

**JoinModal (52)** is the site's only real capture and it is honest to the point of self-harm: four fields traded for "Your details are saved. This form does not send email, so nothing will arrive in your inbox. There is nothing to wait for." (`JoinModal.tsx:516`). The word "international" never appears in the modal. Membership is never mentioned.

Everywhere else the want is manufactured and then dropped. **ResourcesPreview (58)** does the best job on the site of making a reader need the guides — "Being written" on every panel, a display-scale count — and then offers a `mailto:` at `ResourcesPreview.tsx:584`, which opens an app, loses the reader and stores nothing. **/resources (49)** is a page whose entire product is future content, and its only email path is `openJoinModal` rendered inside `{nothingPublishedHere && …}` (`Resources.tsx:413,429`) — on the one page where "email me when it's written" is the obvious ask, that ask does not exist. **/gallery (32)** and **Gallery preview (36)** are the clearest loss: the preview spends home-page real estate moving readers *away* from every capture point, into a page that has no link, no button and no form between its header and `Gallery.tsx:786`. Its one pointer to `/events` lives inside an empty state that cannot render while nineteen frames are compiled in. The **coming-soon lot (57)** is six URLs reachable only by deliberate intent — the highest-quality visitor IFN gets — met with a form-free page, and `/newsletter` actively routes them to Luma, so the address lands in a platform IFN does not own.

The one working capture, the notify form on **/events (52)**, asks for an email in exchange for "the next date is open" — a date the reader can already see three rows above — under a button reading "Notify me".

**Where it breaks:** there is no lead magnet, so the only honest thing to trade for an address today is the meetup invitation itself, and the two surfaces that create the most want for a written artifact (`ResourcesPreview`, `/resources`) are the two with no field on them.

---

---

## 4. The change list — rebuilt against the three-leg positioning

## What changed, and why

The previous audit treated the meetup as the product and rewrote nearly every CTA into a variant of "come to the next meetup"; the corrected frame is IFN's own V2 pitch — monthly meetups, a paid resource library, and direct connections to vetted immigration and venture law, banking and EOR providers, positioned as the practical middle ground between an informal meetup and an expensive accelerator. Sixty-seven surviving edits were rewritten under that frame, fifteen were kept unchanged because they were already frame-neutral, and twelve are new edits the previous pass never proposed — including the first sentence anywhere on the site that names the provider leg. Twenty-five edits were dropped: fifteen rejected by the enforcer (most for attaching "vetted providers" to membership as a present-tense deliverable that `src/data/partnersData.ts` disproves, or for a ship-order dependency stated as an optional note), eight that only made sense under meetup-as-product, one superseded by a longer edit at the same anchor, and one whose accent-mark licence rested on a rejected edit. Two items are flagged out of scope because they would change positioning or commercial structure rather than express it.

## The three legs, as the site now expresses them

| Leg | Where it lives on the site | Was it expressed before | Is it now |
| --- | --- | --- | --- |
| Monthly meetups | /events, EventCard, EventsPreview, the HowItWorks steps, /gallery, the /404 events row | Yes — as the entire product, including on Footer, Navbar and JoinModal | Yes — as the free channel into IFN, and never the lead on Footer, Navbar, JoinModal, /membership, /contact, /partners or /resources |
| Paid resource library | /resources and `resourcesData.ts`, ResourcesPreview, ValueProps row 4, FAQ, the Navbar and Footer labels | Partly — as "Resources" and "Founder Resources", a generic utility with no owner, no price and no status | Yes — one label ("Resource library") across nav and footer, named as something membership buys, and staged honestly: nothing downloadable yet, first nine being assembled |
| Vetted service providers (immigration and venture law, banking, EOR) | /partners and `partnersData.ts`, PartnersStrip, ValueProps row 4, the FAQ visas answer, FounderStory, /about | No — zero words across all 95 edits of the previous audit | Yes — twelve provider-led edits plus the provider clause inside the multi-leg blocks, always staged as a list being built, never as something a $149 buyer already receives |

## The change list

| # | Surface | File:line | Current | Proposed | Lifts | Effort | Mark? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Footer † | `src/components/Footer.tsx:174` | "A practical network for international founders building in the U.S., starting in Austin. IFN helps founders navigate visas, U.S. banking, hiring, fundraising, and building a network from zero." | block 1 | D1 2→4 | small | no |
| 2 | JoinModal † | `src/components/JoinModal.tsx:380` | "Monthly, in person, in Austin, Texas, and running for more than six months. Tell us who you are, and come to the next one." | block 2 | D2 1→4 | small | no |
| 3 | Navbar † | `src/components/Navbar.tsx:18` | `{ name: 'Membership', href: '/membership' },` | `{ name: 'Membership · $149', href: '/membership' },` | D3 2→4 | trivial | no |
| 4 | Footer † | `src/components/Footer.tsx:41` | `{ name: 'Membership', href: '/membership' },` | `{ name: 'Membership · $149', href: '/membership' },` | D5 2→3 | trivial | no |
| 5 | Navbar † | `src/components/Navbar.tsx:178` (and `:244`) | "Join the community" | Join IFN | D5 3→4 | trivial | no |
| 6 | Navbar † | `src/components/Navbar.tsx:19` | `{ name: 'Resources', href: '/resources' },` | `{ name: 'Resource library', href: '/resources' },` | D1 2→3 | trivial | no |
| 7 | Footer † | `src/components/Footer.tsx:48` | `{ name: 'Founder Resources', href: '/resources' },` | `{ name: 'Resource library', href: '/resources' },` | D1 2→3 | trivial | no |
| 8 | JoinModal † | `src/components/JoinModal.tsx:499` | "Your details go to the IFN organizers in Austin." | block 8 | D4 3→5 | trivial | no |
| 9 | JoinModal † | `src/components/JoinModal.tsx:496` | `{isSubmitting ? 'Sending…' : 'Send my details'}` | `{isSubmitting ? 'Saving…' : 'Put me on the list'}` | D5 3→4 | trivial | no |
| 10 | JoinModal † | `src/components/JoinModal.tsx:516` | "Your details are saved. This form does not send email, so nothing will arrive in your inbox. There is nothing to wait for." | block 10 | D3 3→4 | trivial | no |
| 11 | ValueProps | `src/components/ValueProps.tsx:387` (the `title` of the fourth statement, immediately above the body at :390) | "Resources you can use the same week" | Written answers, and who to call next | D3 2→4 (new) | trivial | no |
| 12 | ValueProps | `src/components/ValueProps.tsx:390` | "The resource library covers immigration paperwork, U.S. banking, first hires, raising here and getting a product into the U.S. market, `<Mark reduce={reduce}>written from the questions</Mark>` founders actually bring us. Membership adds a private member channel and a members-only call each month." | block 12 | D6 2→4 | small | no |
| 13 | Hero | `src/components/Hero.tsx:381-383` | "Visas, U.S. banking, hiring, fundraising. Practical answers and introductions from founders who have done it, starting in Austin." | block 13 | D3 2→4 | small | no |
| 14 | Hero | `src/components/Hero.tsx:410` | "Browse our resources" | block 14 | D6 3→5 | small | no |
| 15 | Hero | `src/components/Hero.tsx:392` | "Join the community" | Join IFN | D5 2→4 | trivial | no |
| 16 | HowItWorks | `src/components/HowItWorks.tsx:159-161` | "Everything after that (the member channel, the library, the monthly call) is optional, and you decide from there whether it is worth paying for." | block 16 | D3 3→5 | trivial | no |
| 17 | FinalCTA | `src/components/FinalCTA.tsx:342-343` | "Membership is the paid layer and it is optional: the private member channel, the resource library and monthly office hours." | block 17 | D6 2→4 | small | no |
| 18 | FAQ | `src/components/FAQ.tsx:341-345` | "Membership is a separate, optional layer: `{MEMBERSHIP_PRICE_STANDARD}` a year. It adds the private member channel on Slack/Discord, the resource library, and monthly members-only office hours." | block 18 | D6 2→4 | small | no |
| 19 | ValueProps | `src/components/ValueProps.tsx:439` (append after the closing `</ul>` at `:459`) | *(section ends with no action of any kind)* | block 19 | D5 1→3 | small | no |
| 20 | HowItWorks | `src/components/HowItWorks.tsx:273` | "Join the community" | Join IFN | D5 3→4 | trivial | no |
| 21 | Events preview | `src/components/EventsPreview.tsx:259` | "One meetup a month, in person. Open to anyone building a company here, and to the investors, attorneys and operators who work with founders crossing borders. Free to attend, whether or not you are a member." | block 21 | D2 3→4 | small | no |
| 22 | FAQ | `src/components/FAQ.tsx:375-376` | "Members also get a resource library of notes and templates on immigration, U.S. banking, hiring and raising here, written out of those conversations." | block 22 | D6 2→4 | trivial | no |
| 23 | FAQ | `src/components/FAQ.tsx:387-391` | "There are no other chapters, and we are not opening any right now. Everything else works from anywhere: the member channel, the resource library and the monthly office-hours call are all remote. The in-person evenings are the strongest part of IFN, and they happen here." | block 23 | D4 5→5 (conversion) | small | yes |
| 24 | HowItWorks | `src/components/HowItWorks.tsx:79-80` | "A short form: your name, your email, your LinkedIn address, and the stage your company is at. Nothing else." | block 24 | D4 4→5 | trivial | no |
| 25 | ValueProps | `src/components/ValueProps.tsx:382` | "Introductions through people who know your work" | The introduction you cannot cold-email your way into | D2 4→5 | trivial | no |
| 26 | PartnersStrip | `src/components/PartnersStrip.tsx:242-244` | "These are working relationships rather than paid placements: nobody on this page bought their way onto it." | block 26 | D4 1→4 | trivial | no |
| 27 | PartnersStrip | `src/components/PartnersStrip.tsx:202` | `<span className="font-extrabold">Three named partners</span>, and what each one does` | block 27 | D2 1→3 | trivial | no |
| 28 | PartnersStrip | `src/components/PartnersStrip.tsx:269` | "Read about each partner" | See the list, and what's open | D5 2→3 | trivial | no |
| 29 | FounderStory | `src/components/FounderStory.tsx:389-391` | "We are a small, founder-run organization, so we would rather show you what already exists than describe a plan. We host the meetups in downtown Austin, and the rest of IFN is built from the questions founders keep bringing into the room." | block 29 | D5 1→3 | small | no |
| 30 | ResourcesPreview | `src/components/ResourcesPreview.tsx:328-330` | "Guides, templates and checklists on visas, banking, incorporating, hiring and raising here, sorted by the kind of founder you are and the stage you have reached, in the order the questions actually come up." | block 30 | D2 4→5 | trivial | no |
| 31 | ResourcesPreview | `src/components/ResourcesPreview.tsx:575-584` | "Something missing that you needed? `<a href="mailto:hello@ifn.community">Email hello@ifn.community</a>`" | block 31 | D5 2→4 | trivial | no |
| 32 | ResourcesPreview | `src/components/ResourcesPreview.tsx:346-347` | "The library is `<Mark>being built now</Mark>` from questions founders bring to IFN. The first guides are being prepared for publication." | block 32 | D3 2→3 | trivial | yes |
| 33 | HowItWorks | `src/components/HowItWorks.tsx:90-92` | "The speed-networking part is run by our format partner, so you are paired into short one-to-one conversations rather than left to introduce yourself to strangers on your own." | block 33 | D1 3→4 | trivial | no |
| 34 | FinalCTA | `src/components/FinalCTA.tsx:114` | "The address is on every event listing." | block 34 | D6 2→4 | trivial | no |
| 35 | FAQ | `src/components/FAQ.tsx:492-494` | "Direct answers about what IFN is, what it costs (nothing for the meetups, `{MEMBERSHIP_PRICE_STANDARD}` a year for optional membership), and what it does not do." | block 35 | D6 2→3 | trivial | no |
| 36 | Gallery preview † | `src/components/GalleryPreview.tsx:352` | "What a meetup looks like" | What the room actually looks like | D1 2→3 | trivial | no |
| 37 | /membership | `src/pages/Membership.tsx:102-110` (new second plate below the Founding Member plate) and `src/data/membershipData.ts` | (new block; no copy at this anchor today — the page shows one price plate and never mentions the Charter tier) | block 37 | D1 1→4 | medium | no |
| 38 | /membership | `src/pages/Membership.tsx:32-33` | "The monthly IFN meetup in Austin is open to everyone, and it stays that way. Membership is what happens in between: a private channel with other international founders, a written library built from six months of those meetups, and one members-only call a month." | block 38 | D2 3→4 | small | no |
| 39 | /membership | `src/pages/Membership.tsx:47-49` (replaces the subhead under "What you get for the year") | "Three things, and only three. All of them cover the weeks between one monthly meetup and the next." | block 39 | D2 2→4 | small | no |
| 40 | /membership | `src/pages/Membership.tsx:125` | "Membership is arranged by hand while we finish setting up online payment. Send a message through the contact form and a person from the IFN team will reply with a payment link for the price above." | block 40 | D5 2→4 | trivial | no |
| 41 | /membership | `src/data/membershipData.ts:77` | "One call every month, for members only" | You bring your own situation and get a direct answer on it, rather than watching a webinar | D3 4→5 | trivial | no |
| 42 | /contact | `src/pages/Contact.tsx:135` | "IFN is a community for international founders building in Austin, Texas. We have run an in-person meetup here every month for more than six months. Ask us about a meetup, about membership, or about working together. This form reaches us directly." | block 42 | D4 2→4 | small | no |
| 43 | /contact | `src/pages/Contact.tsx:238` | "Thank you. IFN is run by a small founder team, and your message comes straight to us. We read every one." | block 43 | D4 2→4 | trivial | no |
| 44 | /contact | `src/pages/Contact.tsx:346` | "Message" | block 44 | D2 3→4 | small | no |
| 45 | /contact | `src/pages/Contact.tsx:190` | "One in-person meetup a month, hosted by our venue partner in downtown Austin. Dates and sign-up are published on Luma." | block 45 | D5 3→4 | trivial | no |
| 46 | /resources | `src/components/Resources.tsx:202-208` | "Being honest about where this stands: most of these guides are still being written. We work through them in the order the questions come up at our monthly meetups in Austin, and members receive each one as it is finished." | block 46 | D6 3→5, D4 3→5 | small | no |
| 47 | /resources | `src/components/Resources.tsx:419-427` | "These are the guides we are writing, in the order the questions come up at the monthly meetups in Austin. Members read each one first. `<Link to="/membership">`See what membership includes`</Link>`." | block 47 | D4 3→5 | small | no |
| 48 | /resources | `src/components/Resources.tsx:430-436` | "Join the community" | Tell me when these are published | D5 2→4 | trivial | no |
| 49 | /resources | `src/components/Resources.tsx:537-540` | "Bring the question to the next Austin meetup" (`<Link to="/events">`) | block 49 | D5 2→4 | trivial | no |
| 50 | resourcesData.ts † | `src/data/resourcesData.ts:711-713` | `title: 'SSN & ITIN Acquisition Guide'` / `description: 'How to get your Social Security Number or Individual Taxpayer ID as a foreign national.'` | block 50 | resource_capture 1→4 | small | no |
| 51 | resourcesData.ts † | `src/data/resourcesData.ts:716-720` | `title: 'US Business Banking Setup for Non-Citizens'` / `description: 'Which banks work with international founders and how to open accounts.'` | block 51 | resource_capture 1→4 | small | no |
| 52 | resourcesData.ts † | `src/data/resourcesData.ts:744-747` | `title: 'EIN & Tax Registration Walkthrough'` / `description: 'Step-by-step instructions for getting your Employer Identification Number.'` | block 52 | resource_capture 1→4 | small | no |
| 53 | resourcesData.ts † | `src/data/resourcesData.ts:762-767` | `title: 'US Employment Law Basics for Foreign Founders'` / `description: 'What you need to know about hiring, payroll, and compliance in the US.'` | block 53 | resource_capture 1→4 | small | no |
| 54 | resourcesData.ts † | `src/data/resourcesData.ts:483-484` | `title: 'SBA Loan Application Guide'` / `description: 'Step-by-step walkthrough of the SBA loan process with tips for approval.'` | block 54 | D6 1→2 | trivial | no |
| 55 | resourcesData.ts † | `src/data/resourcesData.ts:870-875` | `title: 'IFN Ambassador Program Guide'` / `description: 'How to lead an IFN chapter in your city and grow the international founder community.'` | block 55 | D6 1→2 | trivial | no |
| 56 | /partners (sponsor) | `src/pages/Partners.tsx:127-128` | "The venues, tools, and companies that help IFN run its monthly meetups for international founders in Austin." | block 56 | D2 1→4 | trivial | no |
| 57 | /partners (sponsor) | `src/pages/Partners.tsx:197-199` | `<ButtonLink to="/contact" variant="primary" size="lg" className="shadow-lg">Get in Touch</ButtonLink>` | block 57 | D5 2→5 | trivial | no |
| 58 | /partners (sponsor) | `src/pages/Partners.tsx:190` | "Interested in partnering with IFN?" | Take a category for twelve months | D4 assist | trivial | no |
| 59 | /partners (both) | `src/pages/Partners.tsx:139` | "Who we work with" | Named today | D3 assist | trivial | no |
| 60 | /partners (founder) | `src/data/partnersData.ts:158` | "Fractional CTO and technology consulting for founders and growing teams. Founded by the same team behind IFN." | block 60 | D4 assist (D6 already 5) | trivial | no |
| 61 | /about | `src/pages/About.tsx:106` | "The International Founders Network (IFN) runs a monthly in-person meetup in Austin, Texas for people building a company in a country they did not grow up in. We have run it every month for more than six months." | block 61 | D1 3→4 | small | no |
| 62 | /about | `src/pages/About.tsx:217` | "The honest way to find out whether IFN is useful to you is to spend one evening in the room and talk to the people there. One city, one venue, once a month. You do not have to be selected to come." | block 62 | D5 2→4 | small | no |
| 63 | /about | `src/pages/About.tsx:216` (closing h2) | "Come to the next meetup" | Start with an evening, or start with membership | D3 2→4 | trivial | no |
| 64 | /about | `src/pages/About.tsx:85` | "You do not give up any part of your company to be here, and you are not screened for admission. Membership is a flat yearly fee, and it is optional." | block 64 | D3 2→4 | trivial | no |
| 65 | /about | `src/pages/About.tsx:150` | "Four things you can check before you decide whether to come." | block 65 | D1 3→4 | trivial | no |
| 66 | /about | `src/pages/About.tsx:51` | "A small founding team" | The team behind Yani Partners | D1 3→4 | trivial | no |
| 67 | /about | `src/pages/About.tsx:52` | "The same people who founded Yani Partners, a fractional technology firm. We say so because you should know who is behind this." | block 67 | D1 3→4 | small | no |
| 68 | /about | `src/pages/About.tsx:142` | "Around 100 to 300 people are on our meetup and newsletter list: a real number, and a modest one. We would rather print it than round it up." | block 68 | D1 3→4 | small | no |
| 69 | /events | `src/pages/Events.tsx:107` | `Monthly <Emphasis>meetups</Emphasis> in Austin, Texas` | `Monthly <Emphasis>meetups</Emphasis> for international founders in Austin` | D2 2→3 | trivial | yes |
| 70 | /events | `src/pages/Events.tsx:308` | "Notify me" | Send me the dates | D5 2→3 | trivial | no |
| 71 | /events | `src/components/EventCard.tsx:236` | `label="Find this meetup on Luma"` | See all IFN dates on Luma | D5 2→3 | small | no |
| 72 | /gallery | `src/pages/Gallery.tsx:678` | "Photographs from the meetups" | What a room full of international founders looks like | D2 1→3 | trivial | no |
| 73 | Coming-soon lot † | `src/pages/Mentorship.tsx:12` | "What already happens: at each monthly Austin meetup, founders are paired into structured one-to-one conversations, and members can bring a question to the monthly members-only office-hours call. In practice most of the useful advice at IFN comes from another founder who solved the same problem a year earlier." | block 73 | D6 4→5 | trivial | no |
| 74 | Coming-soon lot † | `src/pages/Mentorship.tsx:14-15` (actions array) | `{ label: 'See the next meetup', to: '/events' },` then `{ label: 'What membership includes', to: '/membership' },` | block 74 | D3 2→3 | trivial | no |
| 75 | Coming-soon lot † | `src/pages/Playbooks.tsx:12` | "Until then, our resources page collects the tools and links we already hand to founders, and the monthly meetup is where most of these questions actually get answered by someone who has been through it." | block 75 | D1 3→4 | small | no |
| 76 | Coming-soon lot † | `src/pages/Chapters.tsx:19` | "IFN has one in-person community, and it is in Austin, Texas: a monthly meetup hosted by our venue partner, where founders are paired into structured one-to-one conversations. There are no IFN groups in other cities, and none have been announced." | block 76 | D4 3→4 | trivial | no |
| 77 | Coming-soon lot † | `src/pages/Newsletter.tsx:14` | `{ label: 'Follow IFN events on Luma', href: LUMA_CALENDAR_URL },` then `{ label: 'See upcoming meetups', to: '/events' },` | block 77 | D5 2→4 | trivial | no |
| 78 | Coming-soon lot † | `src/pages/Newsletter.tsx:13` (detail) | "Following IFN on Luma is the reliable way to hear about the next meetup. If we ever start sending our own email, we will say what it contains and how often it arrives before asking for your address." | block 78 | D5 2→4 | small | no |
| 79 | /404 | `src/pages/NotFound.tsx:52-71` (add a fifth `<li>` after the Resources row) | The onward list offers four destinations: Home, Upcoming meetups, Resources, Contact us. Membership is absent. | block 79 | D3 1→3 | small | no |
| 80 | /404 | `src/pages/NotFound.tsx:68` | "Contact us" / "Ask us anything directly." | Ask a question, or ask for the membership payment link. A person reads it and replies. | D3 1→3 | small | no |
| 81 | /404 | `src/pages/NotFound.tsx:65` | "Practical notes on visas, banking, and hiring." | block 81 | D6 4→5 | trivial | no |
| 82 | /404 | `src/pages/NotFound.tsx:59` | "Our monthly gathering in Austin." | Next one in Austin, with the date and the address on the page. | D1 2→3 | trivial | no |

### Full proposed copy

**Block 1** - `src/components/Footer.tsx:174` (lives in `max-w-sm`, about seven lines at current size; if the column unbalances, cut "for founders building in the U.S. on a foreign passport" rather than the middle sentence)

```
International Founders Network is the practical middle ground between an informal meetup and an expensive accelerator, for founders building in the U.S. on a foreign passport. Membership is a resource library plus direct introductions to vetted immigration and venture lawyers, bankers and EOR providers — both being built now. The monthly Austin meetup stays free.
```

**Block 2** - `src/components/JoinModal.tsx:380` (renders inside `<p className="text-ink leading-relaxed">` at :378; the blank line means a second `<p>` — give the pair `space-y-3` or keep them in the existing `space-y-5` form flow. No accent mark.)

```
International Founders Network is the middle ground between an informal meetup and an expensive accelerator. Membership is a written resource library and direct introductions to vetted immigration and venture lawyers, bankers and EOR providers — both being built now. The free monthly Austin meetup is where it started, and it runs alongside.

Tell us who you are and we'll put you on the list.
```

**Block 8** - `src/components/JoinModal.tsx:499` (confirm the PrivacyPolicy §4 wording still matches before shipping)

```
Your details go to the IFN organizers in Austin. No newsletter, no list rental, no automated email — we read them ourselves.
```

**Block 10** - `src/components/JoinModal.tsx:516` (keep to the single paragraph at :516)

```
Your details are saved. Nothing will arrive in your inbox — this form does not send email, and we would rather say so than have you wait.
```

**Block 12** - `src/components/ValueProps.tsx:390` (the `<Mark reduce={reduce}>written from the questions</Mark>` element keeps the same words, position and referent, so no re-measure of the `-bottom-1` clearance and no change to the founder's five-mark list. Ship with row 11.)

```
The resource library covers immigration paperwork, U.S. banking, first hires, raising here and getting a product into the U.S. market, <Mark reduce={reduce}>written from the questions</Mark> founders actually bring us. Membership adds a private member channel, a members-only call each month, and direct introductions to vetted immigration and venture lawyers, bankers and EOR providers — that list is being built now, and members get it first.
```

**Block 13** - `src/components/Hero.tsx:381-383` (130 characters against the outgoing 129; spot re-measure at 1024 against the file's rendered-line table. Do not accept a longer variant.)

```
Visas, U.S. banking, hiring, fundraising. Answers and introductions from founders who have done it, in Austin. More than a meetup.
```

**Block 14** - `src/components/Hero.tsx:410` (change the `to` prop from `/resources` to `/membership`; stays a ButtonLink, variant/size unchanged)

```
See what membership includes
```

**Block 16** - `src/components/HowItWorks.tsx:159-161` (add `import { MEMBERSHIP_PRICE_STANDARD } from '../data/membershipData';` — the price must not be hardcoded; the paragraph is already JSX)

```
Membership at {MEMBERSHIP_PRICE_STANDARD} a year adds the private member channel, the resource library and a members-only call each month. We are building those now, and members hear the day each one opens.
```

**Block 17** - `src/components/FinalCTA.tsx:342-343` (wrap "request your membership link" in `<Link to="/contact">`; `MEMBERSHIP_PRICE_STANDARD` is already imported in this file)

```
Membership is the separate paid layer, and it is optional: a private member channel, monthly members-only office hours, and a written resource library, at {MEMBERSHIP_PRICE_STANDARD} a year. It is opening in stages, so request your membership link and we will tell you exactly what is live the day you join.
```

**Block 18** - `src/components/FAQ.tsx:341-345` (set `defaultOpen: true` on the `fee` entry at `:337`; keep the existing `<Link to="/membership">See what membership includes</Link>` at `:346-348` verbatim as the closing sentence. "on Slack/Discord" is deliberately cut — the vendor choice is unresolved.)

```
The meetups are free to attend. You never need to be a member to walk in. Membership is a separate, optional layer: {MEMBERSHIP_PRICE_STANDARD} a year. It adds the private member channel, monthly members-only office hours, and the written resource library. It is opening in stages, so ask for your link and we will tell you exactly what is live the day you join. See what membership includes.
```

**Block 19** - `src/components/ValueProps.tsx:439` (add `import { ButtonLink } from './ui/Button';`; verify `variant`/`size` prop names against Hero.tsx:404-409. Placed outside the `<ul role="list">`, after its close, so the list's item count is unaffected. No change to Home.tsx and no new prop on ValueProps.)

```
<div className="mt-20 md:mt-24">
    <ButtonLink to="/membership" variant="primary" size="lg">
        See what membership includes
    </ButtonLink>
</div>
```

**Block 21** - `src/components/EventsPreview.tsx:259` (wrap "the membership page" in `<Link to="/membership">`; `EventsPreview.tsx` does not currently import `Link` from react-router-dom)

```
One meetup a month, in person, and the part of IFN you can walk into without paying. It is for founders building a U.S. company from outside the U.S. — the visa, the bank that wants a credit history you do not have, the network you are starting from zero — and for the investors, attorneys and operators who work with them. Free to attend, member or not. Membership is a separate paid layer running alongside the meetups — the private member channel, monthly office hours and the written resource library — and what it includes is on the membership page.
```

**Block 22** - `src/components/FAQ.tsx:375-376` (sits at the end of the `visas` answer; the `<Mark>Not as a professional service</Mark>` at `:368` is untouched)

```
Those introductions are the part we take seriously, and members get them written down as well: a library of notes and templates on immigration, U.S. banking, hiring and raising here, built from those same conversations and publishing in stages.
```

**Block 23** - `src/components/FAQ.tsx:387-391` (the `<Mark>Austin only</Mark>` at `:385-386` is preserved verbatim at 11 characters and its sentence is unchanged; wrap "tell us where you are building from" in `<Link to="/contact">`)

```
There are no other chapters, and we are not opening any right now. Everything else is built to work from anywhere: the private member channel, the monthly office-hours call and the resource library are all remote, and they are opening in stages — tell us where you are building from and we will tell you what you can use today. The in-person evenings happen here, and they are worth the trip once.
```

**Block 24** - `src/components/HowItWorks.tsx:79-80`

```
A short form: your name, your email, your LinkedIn address, and the stage your company is at. No payment, no application, and nobody deciding whether you are in. Membership is a separate decision you make later.
```

**Block 26** - `src/components/PartnersStrip.tsx:242-244` (only the final sentence of the paragraph changes; the Station Austin / Reuneo / Yani sentences before it stay as they are)

```
These are working relationships rather than paid placements: nobody on this row
bought their way onto it. The categories international founders ask about most —
immigration law, venture and corporate law, banking, employer of record — are
open, and each of those four goes to a single company.
```

**Block 27** - `src/components/PartnersStrip.tsx:202` (evidenced on the same page by row 26 — do not ship this heading without it)

```
<span className="font-extrabold">Three named partners</span>, and the categories
still open
```

**Block 29** - `src/components/FounderStory.tsx:389-391` (wrap "see what membership includes" in `<Link to="/membership">` — the same label and destination the FAQ already uses at `:346-348`)

```
We are a small, founder-run organization, so we would rather show you what already exists than describe a plan. The meetups run monthly in downtown Austin; the membership, the written library and the introductions to the attorneys and bankers founders here have actually used are all built from the questions people keep bringing into that room. If you want the paid layer as well, see what membership includes.
```

**Block 30** - `src/components/ResourcesPreview.tsx:328-330`

```
Guides, templates and checklists on the things a U.S.-born founder never has to look up: visas, opening a bank account with no credit history, incorporating from abroad, hiring across borders, and raising from investors who have never heard of you. Sorted by the kind of founder you are and the stage you have reached, in the order the questions actually come up.
```

**Block 31** - `src/components/ResourcesPreview.tsx:575-584` (keep the existing `<a href="mailto:hello@ifn.community">` and its class list exactly as they are at `:577-584`; only the surrounding sentences change. No `openJoinModal` wiring.)

```
The library opens to members first. Something missing that you needed? Email hello@ifn.community and it goes on the list of what gets written next.
```

**Block 32** - `src/components/ResourcesPreview.tsx:346-347` (touches the mark, but "being built now" is preserved byte for byte, so the licence, the 3px rule and the descender clearance at `:198-202` are unaffected)

```
The library is <Mark>being built now</Mark> from questions founders bring to IFN. The first guides are being prepared for publication, and members get them first.
```

**Block 33** - `src/components/HowItWorks.tsx:90-92` (the name comes from `partnersData.ts` and already renders on the home page via PartnersStrip)

```
The speed-networking part is run by Reuneo, our format partner, so you are paired into short one-to-one conversations rather than left to introduce yourself to a room of strangers on your own.
```

**Block 34** - `src/components/FinalCTA.tsx:114`

```
The street address is printed with the next meetup further up this page, and on the Luma and Meetup listings.
```

**Block 35** - `src/components/FAQ.tsx:492-494`

```
Direct answers about what IFN is, what it costs (nothing for the meetups, {MEMBERSHIP_PRICE_STANDARD} a year for optional membership), what it does not do, and what is still being built.
```

**Block 37** - `src/pages/Membership.tsx:102-110` (render as a SECOND plate stacked BELOW the Founding Member plate, not beside it; the comment at `Membership.tsx:96-101` must be updated rather than contradicted. Add `MEMBERSHIP_PRICE_CHARTER = '$499'`, `MEMBERSHIP_CHARTER_SEATS = 15` and `MEMBERSHIP_CHARTER_CLOSES` to `membershipData.ts`, with a doc comment that explicitly distinguishes Charter from the $99 warm-list rate the file's standing warning forbids.)

```
Charter Member · $499 · 15 seats · closes Saturday 23 January 2027

The same membership, at the price of backing it. Charter is for founders who want IFN to be here in five years and are willing to fund the year that proves it. Fifteen places is the whole run, and the tier closes whether or not it fills. Charter is not sold from this page: write to us and a person will talk it through with you first.
```

**Block 38** - `src/pages/Membership.tsx:32-33` (do not hardcode the price here; the plate lower on the page already renders `MEMBERSHIP_PRICE_STANDARD`)

```
International Founders Network is the practical middle ground between an informal meetup and an expensive accelerator — monthly meetups in Austin, a written resource library, and direct connections to the vetted service providers international founders need to operate in the U.S.: immigration and venture law, banking, EOR. Membership is the part that does not wait for the next room to fill: a private channel with other international founders, the written library, and one members-only call. The meetup itself is open to everyone, and it stays that way.
```

**Block 39** - `src/pages/Membership.tsx:47-49` (pure copy swap at the existing `<p className="text-lg text-muted leading-relaxed">`; this is the one paragraph on the page with a shelf life — revisit when the library or channel goes live)

```
Three things, and only three. Two of them are being built right now — the library is being assembled from six months of meeting notes, and the private channel opens once we have settled where it lives. We would rather tell you that here than let you find out after paying. Founding Members are the people it is being built for.
```

**Block 40** - `src/pages/Membership.tsx:125` (reply time is "two business days" here, matching rows 42 and 43 — if the founder will not commit to it, cut the clause from all three in the same pass)

```
Online checkout is not wired up yet, so places are set up by hand. Write "membership" in the contact form and a person from the IFN team — not an autoresponder — replies within two business days with your payment link. The upside of a human doing this is that you can ask anything before you pay: what is in the library today, when the private channel opens, what happens if you leave Austin.
```

**Block 42** - `src/pages/Contact.tsx:135` ("for more than six months" is the existing sourced phrasing and is kept verbatim; two business days must match rows 40 and 43)

```
International Founders Network is Austin's community for international founders — monthly meetups, a written resource library, and direct connections to the vetted service providers international founders need to operate in the U.S. We have run an in-person meetup here every month for more than six months. This form is also where membership is arranged while online checkout is being finished, so most messages are one of three: joining as a Founding Member at $149 for the year, asking what is in the library or the member channel before paying, or partnering with us if your firm works with international founders. It reaches a person, not a queue, and we reply within two business days.
```

**Block 43** - `src/pages/Contact.tsx:238` (gated on row 37 exactly as the dropped footer and contact-form Charter lines were — if the Charter plate slips, cut the "$499 Charter place" clause. Two business days must match rows 40 and 42. The "Meanwhile, see the next Austin meetup" Luma link at `:250-261` is an off-ramp on a confirmation screen shown to someone who just asked to pay — flagged for the events cluster, not rewritten here.)

```
Thank you. Your message went to a person, not a queue, and we reply within two business days. If you wrote about membership, that reply carries your payment link — Founding Member at $149 for the year, or the $499 Charter place if you asked for one.
```

**Block 44** - `src/pages/Contact.tsx:346` (render the second paragraph as a hint beneath the label, wired with `aria-describedby` in the same pattern as `contact-phone-hint`)

```
Message

If you are joining, one line is enough — we will reply with the link. Otherwise, tell us what you are building and where you moved from, so we can point you at the person who has already been through it.
```

**Block 45** - `src/pages/Contact.tsx:190`

```
One in-person meetup a month, hosted by our venue partner in downtown Austin. Coming is free and you do not have to be a member. Dates and sign-up are published on Luma.
```

**Block 46** - `src/components/Resources.tsx:202-208` (sits directly under the H1; ships with rows 47-49)

```
Being honest about where this stands: nothing here is downloadable yet. The first nine guides &mdash; three on immigration, three on banking and entity, three on hiring and ops &mdash; are being assembled from material we already use in workshops and answer in the room, and members receive each one as it lands. The rest of this list is the plan behind them.
```

**Block 47** - `src/components/Resources.tsx:419-427`

```
Nothing in this stage is published yet. The library is part of what a membership buys, and the first nine guides are being assembled before anything else on this list. Members receive each one as it lands.{' '}
<Link to="/membership" className={TEXT_LINK}>
    See what membership includes
</Link>
.
```

**Block 49** - `src/components/Resources.tsx:537-540` (also change the `to` prop from `/events` to `/contact`; matches the CTA already used in the empty-search state at `:411`. Its sibling in the same flex row was dropped, so only this half ships.)

```
Missing something? Tell us what to add
```

**Block 50** - `src/data/resourcesData.ts:711-713` (day-one nine, category Immigration, alongside `visa-pathways` at `:667-671` and `legal-counsel-eval` at `:726-731`, which need no copy change)

```
title: 'SSN or ITIN: Which One You Actually Need',
description: 'A decision tree by visa status, the Form W-7 route that does not mean mailing your passport, and the six systems that ask for a number you may not be eligible for.',
```

**Block 51** - `src/data/resourcesData.ts:716-720` (day-one nine, category Banking & Entity; no bank is named — naming which banks said yes would be an unevidenced claim about third parties)

```
title: 'Opening a U.S. Business Account With No SSN',
description: 'The document stack that gets an account opened, the two things branches ask for that nobody expects, and what to bring on the second attempt after a refusal.',
```

**Block 52** - `src/data/resourcesData.ts:744-747` (day-one nine, category Banking & Entity)

```
title: 'EIN Without an SSN: The Form SS-4 Route',
description: 'What to enter on line 7b when you have no SSN or ITIN, the fax and international phone routes side by side, and the three things that stay blocked until the letter arrives.',
```

**Block 53** - `src/data/resourcesData.ts:762-767` (day-one nine, category Hiring & Ops — the thinnest category; pairs with `first-10-hires` at `:357-360` and `employee-hiring-checklist` at `:549-552`)

```
title: 'Hiring in the U.S. Before You Have an Entity',
description: 'Employer of Record, contractor, or your own payroll: what each route costs, what it exposes you to, and the point at which founders switch.',
```

**Block 54** - `src/data/resourcesData.ts:483-484` (cut `'IPO Readiness Roadmap'` at `:432`, `'M&A Process Overview'` at `:418` and `'Secondary Sales Guide'` at `:425` in the same pass)

```
title: 'SBA Loans and Immigration Status: Who Is Eligible',
description: 'SBA 7(a) eligibility turns on the ownership&rsquo;s citizenship or status. What the categories are, and where non-citizen owners stand.',
```

**Block 55** - `src/data/resourcesData.ts:870-875` (a deletion, in two files)

```
DELETE the entry, then delete `SUPPRESSED_RESOURCE_IDS` and `visibleResources()` at `src/components/Resources.tsx:36-40`
```

**Block 56** - `src/pages/Partners.tsx:127-128` (no attendance figures — the previous proposal's "20–50 founders each time" is unsourced)

```
The companies IFN works with directly, and what each one actually does for an
international founder. Three are named below. The categories founders ask us
about most — immigration law, venture and corporate law, banking, and employer
of record — are open, and we are filling them one company at a time.
```

**Block 57** - `src/pages/Partners.tsx:197-199` (`to="/contact"` unchanged; single CTA only)

```
<ButtonLink to="/contact" variant="primary" size="lg" className="shadow-lg">
    Ask about an open category
</ButtonLink>
```

**Block 60** - `src/data/partnersData.ts:158` (do not re-add a related-party disclosure sentence to /partners or PartnersStrip; the founder removed that twice on 2026-08-10)

```
Fractional CTO and technology work for founders and small teams. Run by the same
team that runs IFN, and it has never paid for this placement.
```

**Block 61** - `src/pages/About.tsx:106` (leaves the h1 above it untouched, so the marked word "Austin" and its rule are unaffected)

```
The International Founders Network (IFN) is Austin's community for people building a company in a country they did not grow up in. The monthly in-person meetup has run every month for more than six months. The paid layer around it — a member resource library, and a vetted bench of the service providers international founders actually need for immigration and venture law, banking and cross-border hiring — is being built now, and we will tell you which parts are standing before you pay for any of it.
```

**Block 62** - `src/pages/About.tsx:217` (button labels at `:223` and `:226` are untouched; ship with row 63)

```
The honest way to find out whether IFN is useful to you is to spend one evening in the room and talk to the people there. One city, one venue, once a month, and you do not have to be selected to come. If what you want is the part that runs between meetups, membership is $149 for the year — and we will tell you plainly which of it is already running and which is still being built before you pay.
```

**Block 64** - `src/pages/About.tsx:85` ($149 is `MEMBERSHIP_PRICE_STANDARD` in `src/data/membershipData.ts`; import the constant if you would rather have one source)

```
You do not give up any part of your company to be here, and you are not screened for admission. Membership is optional, and it is one flat price for everyone: $149 for a year, billed once.
```

**Block 65** - `src/pages/About.tsx:150` (ships only alongside rows 66 and 67 — without them the "Who runs it" row names nothing and the third address goes nowhere)

```
Four things you can check before you decide whether to come. Each one is printed somewhere else: on an event listing, on our public calendar, or on our partners page.
```

**Block 67** - `src/pages/About.tsx:52` (kept to /about only)

```
Yani Partners is a fractional technology firm, and it is named among our partners on this site, so the overlap is on the record rather than buried. You are deciding who to trust in a country you are new to; you should know who is behind this before you spend an evening or a fee with us.
```

**Block 68** - `src/pages/About.tsx:142` (replace with the real deduplicated count once that query has actually been run)

```
The list of people who have come to a meetup, or asked to hear about the next one, is in the low hundreds: a real number, and a modest one. We would rather print it than round it up.
```

**Block 73** - `src/pages/Mentorship.tsx:12` (prose only; no prop or component change)

```
What already happens instead: at each monthly Austin meetup, founders are paired into structured one-to-one conversations rather than left to mingle. Most of the useful advice at IFN comes from another founder who solved the same problem a year earlier, which is why the pairing is structured instead of left to whoever you happen to stand next to.
```

**Block 74** - `src/pages/Mentorship.tsx:14-15` (reorder the two existing entries; the first action renders `primary` in ComingSoon. No label text changes.)

```
{ label: 'What membership includes', to: '/membership' },
{ label: 'See the next meetup', to: '/events' },
```

**Block 75** - `src/pages/Playbooks.tsx:12` (113 is countable in `src/data/resourcesData.ts`; if that file grows, this number moves with it)

```
Until then, the resources page is a directory of 113 tools, filings and services we point founders at — names and one-line descriptions today, not files you can download — and the monthly Austin meetup is where these questions get answered out loud, by a founder who has already filed the same form.
```

**Block 76** - `src/pages/Chapters.tsx:19` (no change to the surrounding `detail`, which is what keeps this lead compliant)

```
IFN has one in-person community, and it is in Austin, Texas: a monthly meetup hosted by our venue partner, where founders are paired into structured one-to-one conversations. There are no IFN groups in other cities, none have been announced, and nobody is being asked to start one.
```

**Block 77** - `src/pages/Newsletter.tsx:14` (replaces both entries; `LUMA_CALENDAR_URL` stays imported, the `/events` entry is dropped, keeping ComingSoon at its two-action maximum. Ship with row 78.)

```
{ label: 'Ask us to email you', to: '/contact' },
{ label: 'Follow IFN events on Luma', href: LUMA_CALENDAR_URL },
```

**Block 78** - `src/pages/Newsletter.tsx:13` (pairs with row 77; do not ship one without the other)

```
Following IFN on Luma is the reliable way to hear about the next meetup. If you want something narrower — the resource library as it goes up, or what membership costs and what is actually running yet — write to us and say so, and we will use your address for that and nothing else. If we ever start sending a regular email, we will say what it contains and how often it arrives before asking anyone to subscribe.
```

**Block 79** - `src/pages/NotFound.tsx:52-71` (insert between the Resources and Contact rows so Contact stays last; `Link` is already imported and `ONWARD_LINK` already defined at `:30`)

```
<li>
    <Link to="/membership" className={ONWARD_LINK}>
        Membership
    </Link>
    <p className="text-muted">$149 a year, and a plain account of what is running and what is still being built.</p>
</li>
```

**Block 81** - `src/pages/NotFound.tsx:65` (113 is countable in `src/data/resourcesData.ts`)

```
A directory of 113 tools, filings and services for immigration, banking and hiring. Names and descriptions today, not downloads.
```

## Dropped from the previous list

| Surface | What it proposed | Why it is gone |
| --- | --- | --- |
| JoinModal — `src/components/JoinModal.tsx:521` | "The next meetup is free and every date is on Luma. Membership — the resource library, the vetted providers, the members-only call — is $149 a year…", plus a second ButtonLink | Enforcer rejection. It leads with the meetup on JoinModal, which prohibition 3 names, and asserts the vetted providers as a present membership deliverable with no staging clause — `partnersData.ts` holds a venue, a format partner and the founder's own CTO firm. |
| /resources — `src/components/Resources.tsx:199-201` | "The library is one of the three things a membership buys — alongside the monthly meetups and direct introductions to vetted…" | Enforcer rejection. "A membership buys … the monthly meetups" contradicts six other surfaces in this batch that say the meetups are free, and the provider half is asserted as a present deliverable. |
| /events — `src/pages/Events.tsx:110` | A multi-leg rewrite of the /events intro paragraph | Enforcer rejection. The "being assembled" hedge attaches only to the library, leaving the provider introductions as a benefit a member gets today. |
| /gallery — `src/pages/Gallery.tsx:786` | "The rest of IFN is not in the photographs" — a closing membership block with $149 and a hand-run checkout | Enforcer rejection. Recasts the elevator pitch as the contents of a $149 purchase; the hedge does not reach the providers. The page keeps no closing action as a result. |
| /partners (sponsor) — `src/pages/Partners.tsx:192` | The ten-category partner ladder with a Tactical Spotlight in every tier | Enforcer rejection. Tier C has no Spotlight, cross-border tax/CPA is Tier B with sole occupancy rather than a non-exclusive supporter listing, and v2 sells ten slots across twelve categories. Residual: the paragraph keeps its shipped text ("We're always looking for venues, tools, and service providers who want to support international founders in Austin") between the new heading in row 58 and the new CTA in row 57, so the heading and button make a commercial offer the paragraph between them does not. Either ship a corrected ladder paragraph with terms scoped to Tiers A and B, or hold rows 57 and 58 until one exists. |
| /partners — `src/pages/Partners.tsx:182-185` | The "How this list works" section, including the no-SLA / no-guaranteed-introductions / no-attribution-report paragraph | Enforcer rejection. "Nobody on this page paid to be here" would render directly above a block selling twelve-month paid placements and goes false at the first Tier C close. |
| FounderStory — `src/components/FounderStory.tsx:486-503` | "An IFN meetup in downtown Austin, 2026." as a photo caption | Enforcer rejection. Reverses the founder's 2026-08-10 removal of every visible caption, and the year is not in the data — it would have to be read off a filename. |
| /resources — `src/components/Resources.tsx:488` | `{resource.isComingSoon ? 'Being assembled' : 'Planned'}` | Enforcer rejection. The mapping is backwards: `isComingSoon` is false on the three flagship items per audience, so this labels the closest-to-ready items "Planned". |
| /resources — `src/components/Resources.tsx:533-536` | "Nine of them are being assembled now, and members receive each one as it lands." | Enforcer rejection. The nine are the whole-library minimum bar, not nine of the per-stage count the sentence is appended to. |
| FinalCTA — `src/components/FinalCTA.tsx:271-281` | Keep "Join the community" and add "Or see what membership adds" beneath it | Enforcer rejection: the keep-the-label half contradicts rows 5, 15 and 20, which rename the same control. Residual, and it needs an owner — dropping this edit leaves `FinalCTA.tsx:271-281` as the only surface still reading "Join the community" while Navbar, Hero, HowItWorks and `About.tsx:223` say "Join IFN", and the `<Link to="/membership">Or see what membership adds</Link>` the enforcer called good goes with it, so Home's peak-intent block keeps no route to the paid tier. |
| /membership — `src/pages/Membership.tsx:29` | "Membership: the middle ground between a meetup and an accelerator", with `<Emphasis>` deleted | Enforcer rejection. Misapplies the accent licence: `<Emphasis>` is not the marked-phrase device, and removing it breaks a documented pattern across eleven titles. |
| /contact — `src/pages/Contact.tsx:132` | "Talk to a person at IFN", with `<Emphasis>` deleted | Enforcer rejection, in the same entry as the /membership H1 — same misapplied licence. |
| /resources — `src/components/Resources.tsx:194` | "A members&rsquo; `<Emphasis>library</Emphasis>` for international founders" | Enforcer rejection. Only 2 of 113 rows set `isMembersOnly`, so an H1 relabelling a fully public catalogue as members' is disproved by the page under it. |
| Footer — `src/components/Footer.tsx:205` | "Founding Member is $149 a year. Charter Member is $499, capped at 15 seats, closing Sat Jan 23, 2027." | Enforcer rejection. A hard ship-order dependency written as an optional note: it advertises on all eighteen routes a tier the site cannot describe until row 37 and its three new constants land. |
| /contact — `src/pages/Contact.tsx:266` | A "What are you writing about?" select with "(b) The $499 Charter Member place" | Enforcer rejection, in the same entry as the footer price line — same Charter dependency. |
| Hero — `src/components/Hero.tsx:291-292` | "Stop Guessing at the U.S. System" as the H1 | Writer's drop. Carries no leg and no positioning; the file records seven candidates measured at eight widths with none taken, and rows 13-15 now carry the repositioning instead. |
| ValueProps — `src/components/ValueProps.tsx:429` | "every single month since January 2026" | Writer's drop. `src/data/events.json` begins at 2026-03-26, so the precision fails the artifact a reader would check it against. |
| Events preview — `src/components/EventsPreview.tsx:68` | "Open this meetup on Luma" | Writer's drop. Less accurate than the shipping label — the fallback link lands on IFN's whole calendar, which the adjacent comment says the label must not promise. |
| /partners — `src/pages/Partners.tsx:198` | "Get in Touch" replacement | Writer's drop. Same control as row 57, which replaces the whole button; shipping both would conflict. |
| PartnersStrip — `src/components/PartnersStrip.tsx:193` | "Who makes it work" | Writer's drop. Only reads as an improvement if the thing being made to work is the meetup; the shipped eyebrow is already frame-neutral. |
| Gallery preview — `src/components/GalleryPreview.tsx:436` | Relabelling "Meetup Photographs" | Writer's drop. A lateral nav link rather than an offer, and byte-for-byte identical to `Footer.tsx:39` by explicit design. |
| /gallery — `src/pages/Gallery.tsx:786` | A return reason resting on "new photographs go up after each meetup" | Writer's drop. Nothing evidences that cadence, and the page's own subhead contradicts it. |
| resourcesData.ts — `src/data/resourcesData.ts:753-757` | A month-by-month twelve-month credit-building programme as hero copy | Writer's drop. Authored content with no existing artifact behind it; the day-one nine belong in immigration, banking and entity, and hiring and ops. |
| Events preview — `src/components/EventsPreview.tsx:261` | "Free to attend, member or not. Membership is a separate paid layer…" | Superseded. Row 21's full paragraph already contains this text verbatim; shipping both double-applies it. |
| /partners — `src/pages/Partners.tsx:124` | "Partners, and `<Emphasis>open categories</Emphasis>`" | Void by its own terms. The edit is explicitly conditional on the "How this list works" block shipping in the same pass, and the enforcer rejected that block, so the mark loses the artifact its licence named. |

## Flagged as out of scope

**Charter tier on the home page and in the FAQ** — `src/components/FinalCTA.tsx:342-343`, `src/components/FAQ.tsx:337-349`. v2.md §2 requires the $499 Charter tier, its 15-seat cap and the Sat Jan 23 2027 close date to be visible **on the membership page** — that is where the scarcity claim has to live so it can be enforced. Putting it on the home page or in the FAQ instead would make a hard scarcity claim on one surface with its terms, seat count and deadline on another, which is weaker than not making it. The fix is a membership-page edit plus a data-layer addition (`src/pages/Membership.tsx` and `src/data/membershipData.ts`, which today exports only `MEMBERSHIP_PRICE_STANDARD`), which is row 37 — not a home-page line.

**Mapping the three existing partners onto the A/B/C tier names** — `src/data/partnersData.ts:81` and the two sibling `category` fields. Renaming Venue Partner, Speed-Networking Partner and Business & Technology Partner to Founding Category Partner / Category Partner / Community Supporter is a positioning decision about whether current relationships are retroactively priced. That belongs in `../ifn-strategy/` first, not in this repo's copy. The three shipped labels are accurate descriptions of real relationships and do not encode the meetup-as-product frame, so they are left exactly as they are.

---

## 5. Blockers that copy cannot fix

**1. The resource library has 113 titles and zero links.** `link?: string` is declared at `src/data/resourcesData.ts:21` and used by none of the 113 entries — it is the only occurrence of `link` in 958 lines. **What it costs:** it is the site's single largest honesty exposure and the reason six surfaces score D6 ≤ 3. It also removes the only lead magnet IFN could otherwise trade for an email, which is why `resource_capture` is 1 or 2 on 20 of 24 surfaces. **Smallest unblock:** publish one guide. Edit #52 (the EIN walkthrough) is the right one — highest frequency, pure procedure, almost no advice risk, fully producible from Q&A already had. One finished guide converts the whole library from a bluff into a queue.

**2. `/membership` prints $149 and cannot charge it.** `Membership.tsx:122` routes to `/contact`; `STRIPE_PAYMENT_LINK` points at a different product ($79/mo). **What it costs:** every membership CTA on the site terminates in a general-purpose contact form with no membership field, no price, and no reply-time commitment. **Smallest unblock:** edit #43, a success state that names the payment link. The "What are you writing about?" select that paired with it was dropped: it offered a `$499 Charter Member` option, and the edit that carried this was dropped in the reframe (see *Dropped from the previous list*) because the site cannot yet describe that tier until #37 lands. That does not fix the checkout; it converts a broken checkout with a suggestion box into a broken checkout with a staffed counter, which is worth more this week than wiring Stripe.

**3. No lead-magnet capture outside JoinModal and the contact form.** **What it costs:** the six coming-soon routes, `/gallery`, `/resources` and the ResourcesPreview rail all reach peak intent with no field on the page. **Smallest unblock:** the calibration rejected the *heading* on the `ComingSoon.tsx:135` capture block, not the block — its own rejection note says "The capture block itself and the disclosure paragraph are the strongest idea in the batch for blocker 3 and should ship under a heading the body does not contradict," and proposes **"Leave your details with IFN in Austin"**. Ship the block under that heading. It renders `JoinModal`'s existing name/email fields and POST target — no new endpoint — and closes the gap on all six orphan routes in one edit. Then ship #31 (the ResourcesPreview list join). The `/resources` email gate was dropped — its label mapping was backwards, so the edit that carried this was dropped in the reframe (see *Dropped from the previous list*).

**4. Two phantom meetups are live on the home page right now.** `src/data/events.json:87` — Vol. 11 at `2026-11-27T00:30:00.000Z` is Thu Nov 26, **Thanksgiving Day**; Vol. 12 at `2026-12-25T00:30:00.000Z` is Thu Dec 24, **Christmas Eve**. `EventsPreview.tsx:52` sets `INDEX_LIMIT = 4`, so both render under "Also on the calendar" on `/` and `/about` today, and both render under "Upcoming meetups" on `/events`. **What it costs:** a meetup on Thanksgiving evening is the kind of error that costs more credibility than the section's whole design earns. **Smallest unblock:** fix the dates in Luma, not in copy. Do not paper over it — the calibration rejected "dates confirmed on Luma" precisely because it converts a data defect into a printed falsehood.

**5. No event can be registered for.** Every row in `src/data/events.json` carries `"registrations": [{}]`. `EventsPreview.tsx:181` and `EventCard.tsx:143` both filter on `reg.url`, so every card and the featured object fall through to the "Find this meetup on Luma" fallback and href to the calendar root. **What it costs:** the primary conversion action on the proof page is a search task. **Smallest unblock:** populate `registrations[].url`. That one data change is worth more than every copy edit on `/events` combined; #71 is a patch until it lands.

**6. `/partners` sells nothing, and category partnerships are revenue line 1.** $64,000 of a $111,869 plan across ten slots (`v2.md:382-390`), currently logged as zero contacted, on a page whose only offer-shaped sentence reads "We're always looking for venues, tools, and service providers who want to support international founders in Austin" (`Partners.tsx:192`) — a donation ask, not a marketing-budget ask. **What it costs:** the largest line in the plan has no landing page. **Smallest unblock:** edits #57 and #56 — a pre-subjected mailto and a qualifying sentence. **Read the residual on #57/#58 first**: the enforcer rejected the paragraph that would sit between the new heading and the new button, so shipping them alone leaves a commercial offer with nothing supporting it. The **priced tier ladder is rejected** and must not ship (Appendix A), and no version of this page should go live before **Fri Sep 4**, the summit gate.

**7. Six live routes are unlinked orphans.** `/blog`, `/careers`, `/chapters`, `/mentorship`, `/newsletter`, `/playbooks` are noindexed and referenced by no Navbar, Footer or component link. Their only traffic is a typed URL or a stale inbound link — i.e. the highest-intent visitor IFN gets. **Smallest unblock:** the capture block in blocker 3, plus a decision about whether these routes should be linked at all.

**8. A false claim is being held out of sight by a view-layer filter.** `resourcesData.ts:870-875` claims an "IFN Ambassador Program Guide" — "How to lead an IFN chapter in your city" — for an organisation with one city and no chapter programme. It is suppressed only by `SUPPRESSED_RESOURCE_IDS` at `Resources.tsx:36-40`, so it returns the moment anything else renders this file. **Smallest unblock:** edit #55. Deletes the claim and five lines of machinery.

**9. `/about` publishes a list size double the founder's own derived figure.** "Around 100 to 300 people are on our meetup and newsletter list: a real number, and a modest one. We would rather print it than round it up." (`About.tsx:142`) against `v2.md:191`'s derived ~150. **Smallest unblock:** edit #68 today; then actually run the deduplication `v2.md:191` schedules, so a real number can be printed.

---

---

## 6. The first five things to do on Monday

Each points at a numbered change above.

1. Ship **#3** and **#4** — `Membership · $149` into the Navbar and Footer link labels — because that is fifteen minutes of work and it is the first time the price appears anywhere outside `/membership`.
2. Ship **#1** and **#2** — the Footer description and the JoinModal lead — because those two sentences are where IFN describes itself on all eighteen routes, and they are currently the meetup and nothing else.
3. Ship **#8**, **#9** and **#10** on JoinModal, so the site's only email capture stops telling every converting visitor that nothing will arrive and there is nothing to wait for.
4. Ship **#37** — the `$499` Charter Member plate with its 15-seat cap and Sat Jan 23 2027 close — because `v2.md` §2 requires the cap and the date to be visible, and four other edits are blocked behind it.
5. Start writing the guide in **#52**, the EIN walkthrough, because until one artifact in that library exists, blocker 1 keeps every honesty score capped and the library leg unsellable.

---

## Appendix A — rejected edits

Twenty-two edits were dropped by the calibrators. Reasons are theirs, condensed.

| Surface | Edit | Why rejected |
|---|---|---|
| FinalCTA | `FinalCTA.tsx:110` "More than six months of monthly meetups" → "Seven monthly meetups since January 2026" | **Untrue today.** `events.json` carries Vol. 08 at `2026-08-27` — the count is eight. And the site's own feed begins at Vol. 03 (March 2026), so a reader who opens Luma to check "seven since January" cannot. A hard number wrong the week it ships is worse than the hedge it replaces. |
| /partners (sponsor) | `Partners.tsx:190-193` — the full priced three-rung tier table | **Off-positioning.** $12,000 is $8,000 base plus a $4,000 summit add-on that is contingent and refundable if the summit does not run, and only becomes $12,000 flat after Dec 3. The summit has no venue, and `v2.md` gates summit-linked sponsor outreach on Fri Sep 4. A public rate card cannot be retracted the way a cold email can. |
| Coming-soon lot | `Newsletter.tsx:11` lead adding "the $99 founding rate goes to rather than the public $149" | **Off-positioning.** `membershipData.ts:9-24`, `v2.md:162` and `FinalCTA.tsx:314-329` all forbid publishing the $99 rate — three files were written to prevent exactly this. |
| /membership | `Membership.tsx:47` "$12 a month — less than one hour of the immigration lawyer…" | **Off-positioning.** `v2.md:98` forbids a $12/month option by name (at $144/yr it undercuts $149). Separately, anchoring against an immigration lawyer devalues the buyer of the $12,000 immigration-law category partnership to close a $149 sale. |
| /membership | `membershipData.ts:64` → "More than a hundred written entries… notes you read inside the library" | **Untrue today.** Replaces a false promise with a harder one: it asserts authored, readable content for 113 entries of which zero are written. |
| /membership | `membershipData.ts:53` → "Post 'my bank rejected me for having no SSN' and get an answer that night" | **Untrue today.** The channel is an unresolved Slack-or-Discord vendor choice (`v2.md:790`). Adds a same-night response promise and an invented member for a room nobody can enter. The pain framing is the best in the batch and needs a channel to exist. |
| /membership | `Membership.tsx:122` "Request your membership link" → "Claim your Founding Member place" | **Worse than original.** The repo's own rule (`EventsPreview.tsx:60-66`) is that a label must describe what the click does; the click opens a general contact form. "Claim your place" also implies capped inventory the tier does not have. |
| /membership | `Membership.tsx:91` → "Membership gets you the other twenty-nine days" | **Untrue today.** Sells continuous access to three deliverables `v2.md:99` records as none standing, in the sentence immediately above the price plate, on a page whose CTA cannot complete a purchase. |
| FounderStory | `FounderStory.tsx:268-270` marked detail → "printed with the next date further up this page" | **Untrue today.** `Home.tsx:134-149` renders FounderStory *before* EventsPreview — the address is below, not above. On the section's only marked fact, a pointer aimed the wrong way is exactly the unevidenced mark the accent licence exists to catch. The idea is right; the word is "below". |
| FounderStory | `FounderStory.tsx:265` → "Seven monthly meetups since January 2026" | **Off-positioning.** The founder cut the count from this exact rail (`FounderStory.tsx:209-216`) because the section cannot evidence it — the events index is upcoming-only and no photograph prints a date. |
| /partners (founder) | `Partners.tsx:127` subhead naming Yani "handles the technical side" | **Off-positioning.** Reinstates on `/partners` the disclosure the founder had removed from `/partners` on 2026-08-10 (`Partners.tsx:182-185`), and invents a role nothing in the repo supports. |
| PartnersStrip | `PartnersStrip.tsx:240` paragraph rewrite | **Off-positioning.** Same reinstatement on the other surface it was cut from (`PartnersStrip.tsx:249-252`). Also attributes IFN's own free-to-attend pricing decision to a named third party, a commercial claim about someone else's business that nothing on record supports. |
| /partners (founder) | `partnersData.ts:80` → "It is the reason the meetups are free to attend" | **Untrue today.** The causal attribution is unsupported, and "you can walk in without a membership" is IFN's admissions policy, not the venue's doing. A worse claim than the marketing adjectives it removes. |
| /partners (founder) | `Partners.tsx:124` → "Three partners, no sponsors" | **Off-positioning.** "No sponsors" denies the thing v2 is actively selling — $64,000 across ten paid slots — on the page where those slots will be listed. Also hard-codes a count the same revenue line is designed to change. |
| /events | `Events.tsx:228` opening "at Station Austin, 701 Brazos St" | **Off-positioning.** Breaks the founder's rule that partner names appear only on PartnersStrip, `/partners` and `partnersData.ts`. The address is legitimate on this page **from the feed**, as `EventCard.tsx:212` already prints it, but not typed into marketing copy. |
| /events | `Events.tsx:226` → "Get the next Austin date before the room fills" | **Untrue today.** Nothing records a capacity, a fill or a waitlist; the photographs argue the room does *not* fill. Manufactured scarcity is the one move this site has explicitly forsworn (`About.tsx:88-90`, "We only claim what we can prove"). "Get" instead of "Hear about" survives — it is #68's verb, applied to the button. |
| Events preview | `EventsPreview.tsx:420` → "Also on the calendar — dates confirmed on Luma" | **Worse than original.** Stamps "confirmed" on the Thanksgiving and Christmas Eve rows. Containment copy has to be weaker than the underlying claim, not stronger. |
| /gallery | `Gallery.tsx:681` → "About fifteen people in a circle…" | **Off-positioning.** Contradicts the "20–50 attendees each" figure used in every sponsor touch (`v2.md:257`) on the revenue line worth $64,000. Also breaks the file's own rule at `Gallery.tsx:671`. |
| Gallery preview | `GalleryPreview.tsx:362` → "About fifteen people in a circle, once a month in Austin…" | **Off-positioning.** Same contradiction, and worse here because it reads as a description of the meetup rather than of one photograph. `GalleryPreview.tsx:355-361` bans numerals outright: "The safe number of numbers here is none." The audience clause survives and is in #88/#89's neighbourhood. |
| /resources | `Resources.tsx:203-205` honesty paragraph rewrite | **Untrue today.** Publishes a "first three out" editorial queue that exists nowhere — no titles, order or dates are assigned anywhere in the repo. And "Zero of the 113 titles below" invites a count the page fails (112 render). *Replacing "most" with "none" is exactly right and should still ship.* |
| resourcesData.ts | `:789-793` service-directory rewrite | **Untrue today.** Asserts a dataset IFN does not have — reported fee bands, engagement-to-submission times, "the ones they would not use again" — while zero of 113 entries are written. Also unsellable alongside the immigration/bank/CPA category exclusivity IFN is selling. The other four lead magnets carry none of this exposure. |
| Coming-soon lot | `ComingSoon.tsx:135` heading → "Be told when this page is real" | **Worse than original.** The heading promises a notification the paragraph beneath it retracts three lines later. Ship the capture block under a heading the body does not contradict — the calibrator proposes "Leave your details with IFN in Austin". *See blocker 3; the block itself is the best idea in the batch.* |

---

---

## Appendix B — calibration notes

**Twelve dimensions lowered, none raised.** Every adjustment was checked by opening the file; two rest on claims the original scorers never quoted. All twelve composites were recomputed with `round(D1*20 + D2*20 + D3*15 + D4*15 + D5*20 + D6*10)/5`.

| Surface | Dimension | From → To | Composite |
|---|---|---|---|
| Home — HowItWorks | D2_audience | 3 → 2 | 63 → **59** |
| Home — ResourcesPreview | D2_audience | 4 → 3 | 62 → **58** |
| Home — FounderStory | D6_honesty | 5 → 4 | 54 → **52** |
| Events preview | D3_offer | 4 → 3 | 66 → **60** |
| Events preview | D4_objection | 4 → 3 | *(same row)* |
| /about | D6_honesty | 4 → 3 | 59 → **57** |
| /events | D1_specificity | 4 → 3 | 56 → **52** |
| PartnersStrip | D1_specificity | 4 → 3 | 46 → **42** |
| /404 | D6_honesty | 4 → 3 | 48 → **46** |
| Coming-soon lot | D6_honesty | 4 → 3 | 59 → **57** |
| Navbar | D2_audience | 2 → 1 | 46 → **42** |
| Footer | D2_audience | 4 → 3 | 47 → **43** |

**One arithmetic correction, independent of any adjustment.** `/gallery` was submitted at composite 35. Its own unchanged dimensions give `2*20 + 1*20 + 1*15 + 1*15 + 1*20 + 5*10 = 160`, `/5 = 32`. All 24 composites were recomputed; the other 23 originals were correct.

**The pattern.** D2_audience was the inflated dimension, exactly as the brief predicted — five of twelve cuts. The clearest is HowItWorks, where a grep for every international token in the file returns only the CSS word "border" in three layout comments; a section with zero audience words in its rendered strings was scored 3, and that anchor requires the copy to at least mention international founders. Two more D2 cuts (Footer, ResourcesPreview) are the same four-noun topic list — "visas, U.S. banking, hiring, fundraising" — that the Hero was correctly scored 3 for. The reviewers rated the weaker instances higher than the stronger one.

**Both D1 cuts are structural inversions, not marginal calls.** `/events` scored 4 on feed-driven specificity that the same panel discounted to 3 on Events preview — and two of the dates it prints as upcoming are Thanksgiving and Christmas Eve. PartnersStrip scored 4 while `/partners`, which contains everything the strip contains *plus* two live outbound `Visit website` links and three vendored logos, scored 3. In both cases the derivative surface outscored its source.

**All five D6 cuts share one failure mode: the scorer read the hedge and stopped.** `Playbooks.tsx` was praised for "None of these are finished, so there is nothing to download" while the very next prop in the same file claims "our resources page collects the tools and links we already hand to founders". FounderStory's D6=5 rests on a section whose opening sentence says the resource library "came afterwards, built out of what people kept asking for". `/404`'s only D6 evidence is an overclaim the scorer describes as one and then scores at 4.

**What survived challenge — do not re-litigate.** FAQ D2=5 and D4=5 (verified in full context at `FAQ.tsx:250-258` and `:331-332`). FinalCTA D2=5 at `:233-236`. FounderStory D2=5 at `:384-386`. `/contact` D6=5 — a grep of `Contact.tsx` for library, templates, office-hours, download and resource returns nothing, so the page makes no undeliverable promise. JoinModal D6=5 and both Gallery D6=5 scores. ResourcesPreview D6=4, because three separate hedges including the marked one at `:346-347` keep it meaningfully above `/membership`'s D6=2, where the identical "templates and checklists" phrase sits unhedged behind a paywall. `/membership` D3=4 — what, cost and next step are all stated, however unattractive the next step is.

**Two editorial flags I am raising rather than acting on, because neither was formally rejected.**

- **Edit #41 (`Membership.tsx:32`) carries the same "twenty-nine days" frame the calibrator rejected at `:91`.** The rejection reasoning applies identically. See amendment B — ship the price and the timing sentences, cut the rest.
- **Edits #83 and #86 were written to be sequenced with the priced tier table, which is rejected.** #83's second sentence and #86 in full both depend on it. See amendments C and D. #86 should not ship at all under current conditions.

Also noted: `NotFound.tsx:42` carries a deliberate **non-edit** — the reviewer flagged the marked word "page" and recommended leaving it, on the grounds that it is defensible as a denial and that rewriting the lowest-value headline on the site would spend the accent budget badly. That recommendation stands and appears in no change-list row because there is nothing to do.

**Edit-verification note.** All ~100 `current` quotes were grepped against their stated refs. Every one was genuinely present — no fabricated anchors, so nothing was voided on that ground.

**Two patterns behind most rejections, worth carrying into the next round.** First, five rejected edits reverse a decision the repo records in a comment three lines away — the Yani disclosure (removed 2026-08-10, twice), the $99 rate, the $12/month frame, the FounderStory meetup count. Reviewers read the copy and not the comment above it; **on this codebase the comment is the spec.** Second, several honesty edits overshot into a harder claim than the one they removed — "more than a hundred written entries", "get an answer that night", "dates confirmed on Luma". Removing a false claim is not the same as replacing it, and on this site the empty version usually scores higher than the confident one.
