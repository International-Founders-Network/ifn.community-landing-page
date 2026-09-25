# Member center: information architecture

Status: thin v1 shell on the deploy preview. The session and entitlement
plumbing is real; the sign-in door and the PDFs are not. This document records
what is wired, what is deliberately open, and the one mistake that would be easy
to make and expensive to undo.

## What is wired, and what is still open

| Piece | State |
| --- | --- |
| `ifn_member_session` cookie, HS256 signed, 30 day TTL | **Wired.** `netlify/functions/_lib/memberSession.ts` |
| Entitlement read from the `memberships` table | **Wired.** `netlify/functions/_lib/memberEntitlement.ts` |
| `GET /api/member-me` | **Wired.** Session plus entitlement, per request |
| `POST /api/member-logout` | **Wired.** Clears the member cookie only |
| `GET /api/member-download?id=` | **Gate wired, delivery not.** 401 / 403 / 503, never a file |
| `/members` renders the server answer | **Wired.** `src/pages/Members.tsx` |
| How a real member signs in | **Open.** Question 1 below. `/api/member-auth-stub` is a preview-only placeholder |
| Where the PDFs live | **Open.** Question 3 below. Nothing to serve, so nothing is served |
| Reconciling missed Stripe webhooks | **Open.** Question 2 below |

### Environment variables

| Variable | Used by | Missing behaviour |
| --- | --- | --- |
| `MEMBER_SESSION_SECRET` | `_lib/memberSession.ts` | Signing throws; `/api/member-me` logs it and answers 401, so `/members` degrades to the public view rather than to an error |
| `NETLIFY_DATABASE_URL` | `_lib/memberEntitlement.ts` | `{ entitled: false, reason: 'database_not_configured' }`. Never guesses |
| `ALLOW_MEMBER_STUB_AUTH` | `member-auth-stub.ts` | Stub auth stays on for `dev`, `deploy-preview` and `branch-deploy` via Netlify's `CONTEXT`, and off for `production`. **Never set it to `true` on production** |
| `MEMBER_PDF_BUCKET` | `member-download.ts` | 503 `pdf_not_deployed` |
| `MEMBER_PDF_SIGNING_SECRET` | `member-download.ts` | 503 `pdf_not_deployed` |

Deliberately absent from that table: `ADMIN_SESSION_SECRET` and
`ADMIN_ALLOWED_EMAILS`. No member code path reads either one.

### The stub death plan

Four things exist only because there is no sign-in mechanism yet, and all four
are deleted in the **same commit** that lands one:

1. `STUB_MEMBER_DEFAULT` in `src/pages/Members.tsx`
2. the `?stubMember=1` query parameter
3. `netlify/functions/member-auth-stub.ts`
4. the `ALLOW_MEMBER_STUB_AUTH` variable, from `.env.example` and from Netlify

Until then, two properties keep them from being an access-control hole. The
client flags change the LAYOUT and nothing else, because `/api/member-download`
never sees them. And a session minted by the stub endpoint carries `stub: true`,
which `member-download` refuses outright, so even a preview pointed at the
production database gets the entitled layout and never a file.

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

## Three views, one route

**Not entitled:** a soft call to action. `Become a member ($149/year)` to
`/membership`, plus a link to the free resource library, plus the titles of the
three guides that sit behind membership. No paywall wall, no error, no
sign-in demand.

**Entitled:** the download list for `visa-pathways`, `entity-selection` and
`austin-ecosystem-map`, sourced from `src/data/memberDownloads.ts`. Each button
calls `/api/member-download`, which answers 503 `pdf_not_deployed` today, and
the page renders that as "not uploaded yet" rather than as a failure.

There is a third state the scaffold did not have. **Signed in, not entitled:**
distinct copy that names the signed-in address and points at the usual cause, a
different email on the Stripe receipt. Telling someone we recognise to "become a
member" with no acknowledgement reads as a bug.

`src/data/memberDownloads.ts` is shared by the page and by the download
function on purpose: one table means the page cannot offer a guide the function
rejects as unknown. Its ids match `src/data/resourcesData.ts`, so change both
together.

The client preview flags (`STUB_MEMBER_DEFAULT = false`, `?stubMember=1`) only
ever add the entitled layout, and only when the server has not already granted
it. See the stub death plan above.

Full PDFs are delivered from this member center, not from Gumroad or any other
storefront. That is decided.

## Open question 1: how does a member sign in?

Undecided, and it is the one thing blocking a real member from reaching a real
member view. There is no sign-in UI on `/members`, on purpose: a login control
that cannot work is worse than a sentence saying it is not live yet, which is
what the page shows. The stand-in is `POST /api/member-auth-stub`, which mints a
`stub: true` session for any email on previews only.

The candidates:

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

## Open question 2 (answered): where does entitlement come from?

**Entitlement is read from the `memberships` table**, which
`netlify/functions/stripe-webhook.ts` already keeps current (schema:
`db/migrations/03_memberships.sql`). `isMemberEntitled` in
`netlify/functions/_lib/memberEntitlement.ts` is the only implementation, and it
is called per request rather than baked into the session at sign-in, so a
membership that lapses is reflected on the next page load.

Entitling statuses are `active` and `trialing`. **`past_due` is excluded.**
Stripe sets it when a renewal charge fails and retries are still scheduled, so
including it would be a defensible grace period, but a grace period needs an
expiry and a dunning email to be honest and IFN has neither. Excluding it is the
conservative half of that pair and is one line to reverse.

The alternative, reading through to the Stripe API on each request, is rejected:
it puts a third-party outage between a member and a file they already bought.

**The gap this accepts, stated so nobody rediscovers it as a bug:** if a webhook
delivery is missed, the table is wrong until the next event for that
subscription arrives, and nothing notices. `current_period_end` is reported but
NOT enforced, because enforcing it would trade a cancelled member keeping access
for a worse failure, locking out a paying member whose renewal webhook was
dropped. Closing the gap properly needs a reconciliation job that re-reads
Stripe on a schedule. That is real work and it is not done.

The browser does not decide any of this. `{ entitled: true }` from a function is
the only thing the page may trust, and the entitlement check is separate from
the session check so that a valid session belonging to a lapsed member returns
false rather than a PDF.

## Open question 3: where do the PDFs live?

Undecided, and no guide can be delivered until it is. What is ruled out: a
public path under `dist/` or `public/`. Anything at `/assets/visa-pathways.pdf`
is a link away from being a public download, and no check in
`member-download.ts` would be involved. Candidates are Netlify Blobs or an
object store behind short-lived signed URLs minted by the function after the
entitlement check. Signed URL lifetime, and whether a URL is per-member (so a
leak is traceable), are part of this question.

`member-download.ts` is written up to that boundary and stops. It runs the full
gate (session, then stub refusal, then entitlement) and then answers 503
`pdf_not_deployed` for everyone, including a genuinely entitled member. A 200
with a placeholder body would be a lie the page would render as a working
download. The two environment variables it looks for, `MEMBER_PDF_BUCKET` and
`MEMBER_PDF_SIGNING_SECRET`, are names only: no store is provisioned and no
credentials exist.

## The admin allowlist is not membership

`isAllowedEmail` in `netlify/functions/_lib/auth.ts` answers one question: is
this person an IFN operator with dashboard access. It reads
`ADMIN_ALLOWED_EMAILS`, which is a handful of staff addresses.

It must never be used to answer whether someone has paid $149. The two sets
barely overlap, so using it as an entitlement check would hand the member
library to staff and withhold it from every paying member, while looking
entirely correct in a local test where the only signed-in account is the
founder's. Copy the session plumbing from that file. Do not copy the allowlist.

That is what the member code does: `_lib/memberSession.ts` mirrors the sign,
verify and cookie handling and imports nothing from `_lib/auth.ts`.
`netlify/tests/memberSession.test.ts` pins the separation, including that an
admin cookie cannot act as a member session, that a member cookie cannot act as
an admin session, and that rotating one secret leaves the other alone.
