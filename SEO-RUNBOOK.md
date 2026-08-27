# SEO, AEO and analytics runbook

Everything on branch `seo/aeo-analytics-and-crawlability` is **committed locally
and nothing else**. Not pushed, not merged, not deployed. No visitor has seen any
of it. This file is the path from there to live and measured.

Work top to bottom. Part 1 is review, Part 2 is deploy, Part 3 is monitoring.
Part 4 is what to do afterwards, on a schedule.

---

## Part 0 — the state of things right now

| | |
|---|---|
| Branch | `seo/aeo-analytics-and-crawlability`, 1 commit, **local only** |
| Sits on top of | `feat/gallery-and-photo-selection` — 19 commits, 184 files, **unmerged** |
| Netlify deploys | `main` |
| Netlify project | `incandescent-dusk-aa82c2`, team IFN |
| Live site today | the old pre-redesign build |

Because the SEO branch sits on top of the redesign branch, **shipping SEO to
production also ships the redesign**. That is the single biggest decision in this
document. There is no way to ship one without the other short of cherry-picking.

---

## Part 1 — review before anything is pushed

### 1.1 Read the diff in a sensible order

Not alphabetically. In order of how much damage each file could do:

```sh
git checkout seo/aeo-analytics-and-crawlability

# 1. The two that change how the SERVER behaves. Read these properly.
git show --stat HEAD
git diff feat/gallery-and-photo-selection...HEAD -- netlify.toml public/_headers public/robots.txt

# 2. The build pipeline.
git diff feat/gallery-and-photo-selection...HEAD -- vite.config.ts package.json
git show HEAD -- scripts/prerender.mjs

# 3. The app changes.
git diff feat/gallery-and-photo-selection...HEAD -- src/

# 4. Everything at once, if you prefer.
git diff feat/gallery-and-photo-selection...HEAD
```

### 1.2 The three riskiest lines in the whole change

Look at these specifically, because they are the ones that could take the site
down rather than merely fail to help:

1. **`netlify.toml`, the catch-all is now `status = 404`** (was `200`). If
   Netlify does not serve prerendered files ahead of this rule, every page 404s.
   Verified in Part 2.3 before it can reach production.
2. **`public/_headers`, `immutable` caching on `/assets/*`.** Safe only because
   of the 404 change above. **If you ever revert the catch-all to 200, delete
   this file in the same commit.** Otherwise a stale script request returns HTML
   and the browser pins it for a year with no recovery.
3. **`package.json`, `build` now ends with `node scripts/prerender.mjs`.** The
   build now needs Chrome and takes ~2 minutes longer. It fails loudly if the
   prerender fails, which is deliberate — silently shipping blank pages is the
   failure this whole branch exists to prevent.

### 1.3 Run it yourself locally

```sh
npm ci
npx puppeteer browsers install chrome   # one-off, ~150 MB
npm run build
```

Expect: `✓ built in ~2s` then eleven `prerendered /… NN kB` lines, then
`Prerendered 11 routes.` Any `FAILED` line means stop.

Then confirm the output is real rather than the old empty shell:

```sh
# Real content, not a 3.3 kB shell
wc -c dist/index.html dist/membership/index.html

# Every page has its own title
grep -h -o '<title>[^<]*</title>' dist/index.html dist/*/index.html

# Structured data is present
grep -c 'application/ld+json' dist/index.html

# The crawler files exist as real files
head -5 dist/sitemap.xml
head -5 dist/llms.txt
```

Preview it in a browser:

```sh
npx vite preview
```

Check the consent banner appears only if you set a GA4 ID, that dark mode still
works, and that nothing looks broken. **The banner will not appear locally** —
it is dormant without `VITE_GA4_MEASUREMENT_ID`, which is intended.

### 1.4 Look at the new share image

```sh
open public/og-image.png
```

This replaces `public/logo.png`, which was a screenshot of the retired site
advertising "Free to join" and "Next cohort opens Monday". If you would rather
ship a properly designed card from the brand repo, replace this file — the
filename is all that matters, `index.html` already points at it.

---

## Part 2 — deploy

### 2.1 Push and open a PR

```sh
git push -u origin seo/aeo-analytics-and-crawlability

gh pr create \
  --base feat/gallery-and-photo-selection \
  --head seo/aeo-analytics-and-crawlability \
  --title "Make the site legible to search and answer engines, and measure it" \
  --body "See SEO-RUNBOOK.md. Verify the three checks in section 2.3 against the deploy preview before merging."
```

Netlify builds a **Deploy Preview** automatically and posts the URL on the PR.

### 2.2 Watch the build log

New failure modes to expect, in order of likelihood:

| Symptom | Cause | Fix |
|---|---|---|
| `Could not find Chrome` | The install step didn't run or wasn't cached | Confirm `netlify.toml` `[build] command` still begins with `npx puppeteer browsers install chrome` |
| `N route(s) failed to prerender` | A page threw during render | Read which route; run `npm run build` locally to reproduce |
| Build times out | Chrome download on a cold cache | Retry; `PUPPETEER_CACHE_DIR` makes the second build fast |

### 2.3 The three checks — do not skip these

Against the **deploy preview URL**, not production:

```sh
PREVIEW="https://deploy-preview-N--incandescent-dusk-aa82c2.netlify.app"

# 1. Prerendered file wins over the catch-all.  MUST be 200.
curl -sI "$PREVIEW/membership" | head -1

# 2. The page carries its OWN metadata, not the homepage's.
curl -s "$PREVIEW/membership" | grep -o '<meta property="og:title"[^>]*>'
#    want: content="Membership | International Founders Network"

# 3. Junk URLs are honestly 404.
curl -sI "$PREVIEW/nonsense-xyz" | head -1
```

Bonus — prove the AEO fix actually landed, by fetching as a bot that runs no
JavaScript:

```sh
curl -s -A "GPTBot" "$PREVIEW/" | wc -c        # want tens of thousands, not 3306
curl -s "$PREVIEW/sitemap.xml" | head -3       # want XML, not HTML
curl -s "$PREVIEW/llms.txt" | head -3          # want text, not HTML
```

**If check 1 returns 404**, Netlify is not preferring static files. One-line
rollback:

```toml
# netlify.toml — restore the old behaviour
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

and `git rm public/_headers` in the same commit. Both, together, always.

### 2.4 Merge

```sh
gh pr merge --squash            # SEO branch → feat/gallery-and-photo-selection
```

Then merge the redesign to production. **This is the moment 184 files go live.**

```sh
gh pr create --base main --head feat/gallery-and-photo-selection \
  --title "Ship the redesign, plus search and answer-engine visibility"
```

Re-run the section 2.3 checks against `https://ifn.community` once it deploys.

---

## Part 3 — monitoring setup

### 3.1 Google Analytics 4 — 15 minutes

The code is written and completely dormant until one environment variable exists.

1. Go to **analytics.google.com** → Admin (gear, bottom left) → **Create** →
   **Property**.
2. Property name `ifn.community`, timezone **United States — Central**, currency
   **USD**.
3. Business details: industry "Other", size "Small".
4. Choose platform **Web**. Website URL `https://ifn.community`, stream name
   `ifn.community`.
5. Copy the **Measurement ID**. It looks like `G-XXXXXXXXXX`.
6. **Turn off Enhanced Measurement's "Page changes based on browser history
   events"** (Admin → Data streams → your stream → Enhanced measurement → gear).
   This site sends its own page views deliberately; leaving GA4's automatic
   version on produces **double-counted page views**.

Then set it in Netlify:

- **app.netlify.com** → project `incandescent-dusk-aa82c2` → **Site
  configuration** → **Environment variables** → **Add a variable**
- Key: `VITE_GA4_MEASUREMENT_ID`
- Value: your `G-XXXXXXXXXX`
- Scopes: **Builds** (it is compiled into the bundle at build time, not read at
  runtime)
- Deploy contexts: **Production only.** Not deploy previews, not branch
  deploys — otherwise your own preview traffic pollutes the numbers.

It is a build-time variable, so **trigger a redeploy** — an env var alone changes
nothing until the site is rebuilt:

```sh
npx netlify deploy --build --prod
# or just: Deploys → Trigger deploy → Deploy site
```

Confirm it worked:

```sh
curl -s https://ifn.community/ | grep -c googletagmanager    # want 1
```

Then load the site and check GA4 → **Reports → Realtime**. You should see
yourself. Accept the consent banner, and you should still see yourself — refusal
also reports, anonymously and without cookies, by design.

### 3.2 Google Search Console — already verified, just go read it

**You do not need to set this up.** It is verified via a DNS TXT record on the
apex, which is why nothing in this repo mentions it:

```sh
dig +short TXT ifn.community | grep google-site-verification
```

1. Sign in at **search.google.com/search-console** with the Google account that
   owns the domain. There may be months of data waiting.
2. **Sitemaps** → submit `sitemap.xml`. It will now parse; before this branch the
   URL returned HTML and registered as a parse error.
3. **URL Inspection** → paste `https://ifn.community/membership` → **Test live
   URL** → **View tested page** → **HTML**. Confirm you see real content, not an
   empty `<div id="root">`. Then **Request indexing**. Repeat for `/`, `/events`
   and `/about`.
4. **Settings → Associations** → link your new GA4 property. This is what lets
   you see search queries and on-site behaviour in one place.

The reports that matter: **Performance** (queries, impressions, clicks,
position), **Pages → Indexing** (watch "Crawled – currently not indexed" fall),
and **Core Web Vitals**.

### 3.3 Bing Webmaster Tools — 5 minutes, genuinely worth it

Bing powers ChatGPT search, Copilot and DuckDuckGo, so this is an AEO tool as
much as a search one.

1. **bing.com/webmasters** → **Import from Google Search Console**.
2. Authorise. It copies verification and sitemaps — no DNS work.
3. Confirm `sitemap.xml` came across.

### 3.4 Validate the structured data

After production deploys:

- **search.google.com/test/rich-results** → paste `https://ifn.community/` →
  expect Organization, WebSite, WebPage, FAQPage detected with no errors.
- **validator.schema.org** → same URL, stricter, catches shape problems Google
  tolerates.
- **opengraph.xyz** or just paste the link into Slack → confirm the new share
  card and the right title appear. Do this for `/membership` too, which
  previously unfurled as the homepage.
- **pagespeed.web.dev** → baseline Core Web Vitals now, so later changes have
  something to compare against.

---

## Part 4 — after it is live

### 4.1 The Luma fix, and why it is urgent

Your live events feed says **Capital Factory, 701 Brazos St**. Every other
surface says Station Austin.

`.github/workflows/sync-events.yml` regenerates `src/data/events.json` from Luma
on the **1st and 15th of every month**, which is why a hand-edit to that file
keeps disappearing — a hand-edit cannot survive a generator.

`scripts/update-events.js` now rewrites the two known-stale strings on the way
in, so the contradiction stops returning. **That treats the symptom.** Fix the
venue on the Luma event records themselves. Once that is done:

- Delete `KNOWN_STALE_VENUES` from `scripts/update-events.js`.
- Add `Event` JSON-LD to `src/data/structuredData.ts` — deliberately withheld
  until now, because marking up a venue that contradicts the visible page is a
  Google structured-data policy violation. It is the most valuable schema type
  available to an events-driven site, so this is worth doing promptly.

### 4.2 Confirm or remove the unverified social profiles

`src/data/socialLinks.ts` flags LinkedIn and Instagram `verified: false` — they
are guesses at your handle nobody checked. The structured data deliberately
includes only verified profiles, so Google is currently told about your Luma
calendar and nothing else. Check both handles, then flip the flag.

`sameAs` is an identity claim. Pointing it at an account you do not own is how a
stranger's profile gets merged into your knowledge panel.

### 4.3 What to check, and how often

**Week 1 after deploy**

- Search Console → Pages: is Google fetching the prerendered pages?
- GA4 → Realtime: are page views firing on client-side navigation, not just
  landings?
- GA4 → Reports → Engagement → Events: do `join_submit`, `contact_submit`,
  `event_signup` appear after you test each form?
- Mark those three as **conversions** in GA4 (Admin → Events → toggle "Mark as
  key event").

**Monthly**

- Search Console → Performance: are you ranking for *"international founders
  network"* yet? You currently lose your own name to your own Meetup page.
- Search Console → Sitemaps: still parsing, all 11 URLs discovered.
- Run the section 2.3 curls against production. A future change to
  `netlify.toml` could silently reintroduce the soft-404.

**Whenever you add a page**

Add a `ROUTE_SEO` entry in `src/data/seo.ts`. Without one the page is not
prerendered, not in the sitemap, and not in `llms.txt`. Nothing catches this
automatically — see the AGENTS.md section for why.

### 4.4 The listings that matter more than your website

Live search results say you cannot out-rank Eventbrite, Meetup and Built In for
generic Austin startup queries. The pages winning those clicks are listings you
control. Highest return per hour, and none of it is code:

- Meetup, Eventbrite and Luma profiles → identical full name and description,
  each linking to `ifn.community` as the canonical home.
- Austin Chamber of Commerce member directory — submittable.
- Visit Austin events calendar — public submission form, real domain authority.
- Built In Austin — organisation profile.
- Ask **Station Austin** for a link from their community page. You are a
  resident monthly program; this is the easiest high-value backlink you have.
- Ask **Reunio** and **Yani Partners** for reciprocal links — you already list
  them on `/partners`.

---

## Part 5 — production readiness beyond SEO

Checked against the live site and the Netlify project, not from a generic
checklist. Split into what is now handled and what is still a decision for you.

### 5.1 Already correct — no action

| | |
|---|---|
| HTTPS + certificate | Valid, auto-renewing |
| `http://` → `https://` | 301, working |
| `www` → apex | 301, working |
| Database credentials | `NETLIFY_DATABASE_URL` (+ unpooled) set |
| Admin auth | `ADMIN_ALLOWED_EMAILS`, `ADMIN_SESSION_SECRET` set; enforced server-side in every `/api/admin-*` function |
| Functions | All 8 bundle cleanly |

### 5.2 Fixed on this branch

- **Security headers.** The site sent exactly one — HSTS, in its weakest form.
  Added `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`, and upgraded HSTS with `includeSubDomains` (verified
  safe: `qr.` and `www.` are the only subdomains that resolve, both already
  HTTPS). `preload` deliberately left off — it is close to irreversible.
- **Node version pinned** to 24 via `.nvmrc` and `NODE_VERSION`. It was
  unpinned, so the build ran on whatever the build image defaulted to that week.
- **`SECRETS_SCAN_OMIT_KEYS`** set for the two `VITE_` variables. Without it,
  adding `VITE_GA4_MEASUREMENT_ID` **would have failed your build** with
  "secrets scanning found secrets in build output" — Vite inlines `VITE_`
  values into the bundle by design, and Netlify's scanner cannot tell that apart
  from a leak. This one is worth knowing about because the cause is unguessable.
- **Visitor PII removed from function logs.** `contact.ts` was writing
  `{ name, email, company }` and `event-signup.ts` was writing the email address
  into Netlify's function logs — a third-party store, readable by anyone with
  project access, disclosed nowhere in the privacy policy, and duplicating data
  already in Postgres under the deletion promise the policy makes.

### 5.3 Still open — your call

**Content Security Policy.** Documented in `public/_headers`, not enabled. The
sha256 hash of the inline theme script is computed and a starting policy is
written out. It is off because a wrong CSP breaks the site silently for real
visitors while passing every check you would think to run. Deploy it as
`Content-Security-Policy-Report-Only` first, watch the console on `/admin` and
`/gallery` specifically, then enforce.

**No rate limiting on public POST endpoints.** `/api/contact`, `/api/join` and
`/api/event-signup` accept unlimited submissions with no throttle, captcha or
honeypot. Nothing stops a script filling your database with junk and, since each
writes to Postgres, that is both a data-quality and a cost problem. Cheapest
credible fix is a honeypot field plus a per-IP limit in the function; Netlify
also has built-in rate limiting on paid plans.

**The events table is empty.** Verified: `/api/events` returns a byte-identical
copy of the bundled `src/data/events.json`, which is the fallback path — so the
Postgres table has zero rows. Worth knowing because `AGENTS.md` recommends
fixing the venue by running a SQL migration against that table, and **that
advice is moot**: there is nothing in the table to fix. Luma → `events.json` is
the only path that matters.

**No error tracking or uptime monitoring.** A function throwing 500s in
production is currently invisible unless someone reports it. Sentry has a free
tier; Netlify deploy notifications (Site configuration → Notifications) at
minimum will tell you when a build fails, which now matters more because the
build has a new failure mode in the prerender step.

**No database backups configured** that I can see from here. Neon has
point-in-time restore depending on plan — worth confirming it is on, since the
membership and contact records are the only copy.

**Deploy previews and search.** Netlify sends `X-Robots-Tag: noindex` on deploy
previews by default. Confirm it on your first preview rather than assume, since
an indexed preview URL competes with production for the same content:

```sh
curl -sI "$PREVIEW/" | grep -i x-robots-tag   # want: noindex
```
