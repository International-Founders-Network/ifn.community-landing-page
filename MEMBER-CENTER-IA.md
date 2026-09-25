# Member center: information architecture

Status: scaffold on the deploy preview. No real entitlement check exists yet.
This document records what is decided, what is deliberately open, and the one
mistake that would be easy to make and expensive to undo.

## Route

`/members`, wired in `src/App.tsx` **inside `Layout`**, unlike `/admin`. A
non-member is expected to land here from a resource card or a shared link, so
the page needs the navbar, footer and join-modal wiring that Layout provides.
`/admin` stays outside Layout because it is an internal dashboard, not a page
anyone should arrive at.

Supporting wiring, all of which has to move together:

| Place | Entry | Why |
| --- | --- | --- |
| `src/App.tsx` | `<Route path="/members">` under `Layout` | Renders the page |
| `src/data/seo.ts` | `ROUTE_SEO['/members']`, `indexable: false` | Title and description for the tab and for the GA4 pageview; `false` keeps it out of the sitemap and the prerender list |
| `src/data/seo.ts` | `NOINDEX_PATHS` | Makes `Head.tsx` emit `noindex` on client-side navigation |
| `netlify.toml` | `/members` rewrite, `status = 200` | The catch-all is 404 now. Without this rewrite a direct hit answers 404 while rendering the page correctly |
| `netlify.toml` | `X-Robots-Tag: noindex, follow` on `/members` and `/members/*` | `follow`, because the outbound links to `/membership` and `/resources` are worth following |

It is not prerendered on purpose. A members area has nothing a search result
should point at, and prerendering would bake the non-member view into static
HTML as though that were the page.

## Two views, one route

**Not entitled:** a soft call to action. `Become a member ($149/year)` to
`/membership`, plus a link to the free resource library, plus the titles of the
three guides that sit behind membership. No paywall wall, no error, no
sign-in demand.

**Entitled (stubbed):** the download list for `visa-pathways`,
`entity-selection` and `austin-ecosystem-map`. Every download is a disabled
control reading `PDF not uploaded yet`, because that is true.

The stub is `STUB_MEMBER_DEFAULT = false` in `src/pages/Members.tsx`, plus
`?stubMember=1` for one page view. It is a preview affordance, not access
control, and there is nothing behind it to protect: the PDFs are not deployed.
Both go in the same commit that adds a real check.

Full PDFs are delivered from this member center, not from Gumroad or any other
storefront. That is decided.

## Open question 1: how does a member sign in?

Undecided. The candidates:

- **Google sign-in**, mirroring `/admin`. Lowest new code: the Google id-token
  verification and the signed httpOnly cookie in
  `netlify/functions/_lib/auth.ts` are already written and tested. Costs a
  member a Google account, and the email Google returns may not be the email
  they paid Stripe with.
- **Emailed magic link**, keyed to the Stripe customer email. Matches the
  payment record exactly, needs an email sender IFN does not have wired yet.
- **Stripe customer portal login link** as the only door. No new auth at all,
  but it lands the member in Stripe's UI rather than on `/members`.

Whichever wins, the session cookie is `ifn_member_session`
(`netlify/functions/_lib/memberSession.ts`), **not** `ifn_admin_session`, and it
gets its own secret. Reasons are in that file: shared cookies mean shared
revocation and shared verification, and the admin verification path ends in an
allowlist check.

## Open question 2: where does entitlement come from?

Undecided. Stripe subscription state is the only honest source, and
`netlify/functions/stripe-webhook.ts` already receives it. The two shapes:

- **Read through to Stripe** on each request. Always current, adds a Stripe API
  call to every page view, and fails closed during a Stripe outage.
- **Persist entitlement** from the webhook into Neon and read that. Fast, works
  during an outage, and drifts the moment a webhook is missed. Needs a
  reconciliation job, which is real work, not a footnote.

Whichever wins: the browser does not decide this. A response of
`{ entitled: true }` from a function is the only thing the page may trust, and
the entitlement check is separate from the session check so that a valid session
belonging to a lapsed member returns false rather than a PDF.

## Open question 3: where do the PDFs live?

Undecided, and nothing can ship until it is. What is ruled out: a public path
under `dist/`. Anything at `/assets/visa-pathways.pdf` is a link away from being
a public download, and the bundle is not a place to put gated files. Candidates
are Netlify Blobs or an object store behind short-lived signed URLs minted by a
function after the entitlement check. Signed URL lifetime, and whether a URL is
per-member (so a leak is traceable), are part of this question.

## The admin allowlist is not membership

`isAllowedEmail` in `netlify/functions/_lib/auth.ts` answers one question: is
this person an IFN operator with dashboard access. It reads
`ADMIN_ALLOWED_EMAILS`, which is a handful of staff addresses.

It must never be used to answer whether someone has paid $149. The two sets
barely overlap, so using it as an entitlement check would hand the member
library to staff and withhold it from every paying member, while looking
entirely correct in a local test where the only signed-in account is the
founder's. Copy the session plumbing from that file. Do not copy the allowlist.
