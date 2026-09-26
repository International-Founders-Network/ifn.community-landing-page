## 1. OpenSpec
- [x] 1.1 Create `openspec/changes/blog-editorial-publish/` (proposal, design, tasks, delta specs for `blog` and `admin-dashboard`)

## 2. Data
- [x] 2.1 `db/migrations/04_blog_editorial.sql` + `db/README.md` entry
- [x] 2.2 Request-time `CREATE TABLE IF NOT EXISTS` in `_lib/blogEditorial.ts`

## 3. Compile gate
- [x] 3.1 Parse `status` (legacy `draft` mapping, unknown → draft), `publishAt` (ISO with offset, invalid → unset + warn), syndication stubs
- [x] 3.2 Merge Neon overlay by slug when `NETLIFY_DATABASE_URL` is set
- [x] 3.3 Public gate: live, or scheduled with publishAt <= now
- [x] 3.4 Write metadata-only `netlify/functions/_data/blog-queue.json`
- [x] 3.5 Welcome post: `status: live`, `publishAt: null`, syndication stubs false

## 4. Functions
- [x] 4.1 `admin-blog.ts` GET (queue + overlay) / PATCH (approve, schedule, mark_live, hold); 401 / 400 / 503
- [x] 4.2 `blog-publish-due.ts` scheduled every 15 min; promotes due scheduled → live; build hook
- [x] 4.3 Unit tests: transitions, gate, merge, handler auth/503 (`netlify/tests/blog-editorial.test.ts`)

## 5. Admin
- [x] 5.1 Blog tab: queue table, Chicago publishAt, actions
- [x] 5.2 Month calendar grouped by Chicago day
- [x] 5.3 Chicago datetime-local → ISO with offset (`src/lib/chicagoTime.ts` + tests)

## 6. Verify and PR
- [x] 6.1 compile with temporary fixtures (in_review / approved / scheduled future / scheduled due); only live + due scheduled public; fixtures removed
- [x] 6.2 `npm test`, `npm run lint`, `tsc -b`
- [ ] 6.3 Apply `04_blog_editorial.sql` to production Neon and set `NETLIFY_BUILD_HOOK_URL` (Venkat)
- [ ] 6.4 End-to-end on production: approve → schedule → promoted within 15 min
- [x] 6.5 Draft PR, **HOLD merge**
