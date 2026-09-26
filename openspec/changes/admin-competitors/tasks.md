## 1. OpenSpec / branch hygiene
- [x] 1.1 Create `openspec/changes/admin-competitors/` (proposal, design, tasks, delta spec)
- [x] 1.2 Worktree branch `site/admin-competitors` from `origin/main`

## 2. Seed data
- [x] 2.1 Add `src/data/competitorsData.ts` typed to planned Competitor shape
- [x] 2.2 Map all 18 Research board rows; `status: 'draft'`; preserve Research activity as `activityStatus`; no invented metrics

## 3. Admin UI
- [x] 3.1 Extend `Tab` + `TAB_META` with `competitors`
- [x] 3.2 Add CompetitorsPanel (table + search + link-outs) like RoadmapPanel
- [x] 3.3 Confirm no public-page imports of competitorsData; `/admin` remains noindex

## 4. Verify and open preview PR
- [x] 4.1 `npm run lint` / `npm test` / `npm run build` pass
- [x] 4.2 Push branch and open PR **without merging**; report preview URL
