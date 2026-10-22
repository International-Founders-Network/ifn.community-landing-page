# Proposal

## Why

Blog posts had no on-page imagery, and only the three Week 1 posts had share images (PR #43). Every post that goes live needs a branded hero, an index thumbnail and a 1200x630 OG image, and nothing stopped a post going live without them.

## What Changes

- One image set per post under `public/blog/`: `<slug>-hero.webp` (1600x900), `<slug>-hero-800.webp` (800x450), `<slug>-thumb.webp` (640x360, monochrome, unlabeled) and `<slug>-og.png` (1200x630). All 13 posts have one.
- `scripts/build-blog-og-images.mjs` renders all four from one entry in `scripts/blog-og-manifest.json` with Puppeteer. Brand: real IFN. wordmark (`assets/brand/ifn-wordmark-light.svg`, copied from the ifn-brand repo), Archivo, ink and paper tokens, one crimson (#A81B36) element per image, no gradients, shadows, photos or people.
- Frontmatter gains `imageAlt`; `ogImage` points at the generated PNG.
- `/blog` cards show the thumbnail (lazy); `/blog/<slug>` shows the hero (eager, high priority, srcset). Both reserve 16:9 space.
- Per-post `og:image`, `twitter:image` and BlogPosting `image` use absolute URLs (folds in PR #43).
- Build gate in `scripts/compile-blog.mjs` (logic in `scripts/lib/blogImages.mjs`): a public post missing any file of its set or `imageAlt` fails the build, naming slug, file and command. Non-public posts warn.
- `blog-queue.json` gains `imagesReady` and `imagesMissing`; Admin Blog shows them.

## Capabilities

### Modified Capabilities
- `blog`: image sets, build gate, page rendering.
- `admin-dashboard`: image readiness in the Blog queue.

## Impact

Changes how live posts look; needs Venkat's visual approval. No status, draft or publishAt changes.
