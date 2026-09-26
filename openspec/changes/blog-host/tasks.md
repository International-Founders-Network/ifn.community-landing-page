## 1. OpenSpec / branch hygiene
- [x] 1.1 Confirm change artifacts under `openspec/changes/blog-host/` are complete and valid
- [x] 1.2 Work on branch `site/blog-host` from `origin/main` (worktree)

## 2. Markdown pipeline
- [x] 2.1 Add `content/blog/` and deps (`gray-matter`, remark/rehype stack as needed)
- [x] 2.2 Add `scripts/compile-blog.mjs` writing committed `src/data/blog.generated.ts` (posts metadata + HTML; exclude `draft: true`)
- [x] 2.3 Wire compile into `npm run build` (before `tsc`/vite) like pricing sync
- [x] 2.4 Add sample post `welcome-to-the-ifn-blog.md` (copy locks: no em dashes; no founding disclosure; private member channel; no newsletter CTA)

## 3. Routes and UI
- [x] 3.1 Replace `Blog.tsx` ComingSoon with real index consuming generated posts
- [x] 3.2 Add `BlogPost` page and `/blog/:slug` route in `App.tsx` (unknown slug → NotFound)
- [x] 3.3 Add **Navbar** Blog link (required; desktop + mobile) near Resources
- [x] 3.4 Optionally add Footer Community Blog link

## 4. SEO / prerender / Netlify / RSS
- [x] 4.1 Extend `seo.ts` so `/blog` is indexable and post paths get frontmatter meta via generated data; remove `/blog` from `NOINDEX_PATHS`
- [x] 4.2 Extend `ifn-seo-assets` (and/or compile step): sitemap lastmod from post dates when present; write `rss.xml`; include Blog in llms.txt primary pages
- [x] 4.3 Ensure prerender list includes `/blog` and each post; verify catch-all will not 404 those paths
- [x] 4.4 Add BlogPosting/Article JSON-LD for posts in structuredData/Head path
- [x] 4.5 Netlify: remove `/blog` SPA 200 rewrite; remove `X-Robots-Tag` noindex for `/blog` and `/blog/*`; keep other placeholders noindexed
- [x] 4.6 Add `rel="alternate"` RSS link on blog index (via Head or page)

## 5. Verify and open preview PR
- [x] 5.1 `npm run lint`, `npm test`, `npm run build` pass
- [x] 5.2 Push `site/blog-host` and open PR **without merging**; report preview URL if available
