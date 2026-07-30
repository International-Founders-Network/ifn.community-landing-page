## 1. Membership page content

- [x] 1.1 Create `src/data/membershipData.ts` with the paid tier's price range, what's included, and the Stripe Payment Link URL
- [x] 1.2 Replace the `Membership.tsx` stub with a real page: hero intro, "what's included" content, pricing card, CTA linking to the Stripe Payment Link
- [x] 1.3 Match existing design-system conventions (Container, Framer Motion fade-in, Tailwind tokens), same pattern as `partners-page`

## 2. Admin roadmap tab

- [x] 2.1 Add a `roadmap` value to `Admin.tsx`'s `Tab` union
- [x] 2.2 Add a static `RoadmapPanel` component rendering the free / V2-paid / V3-Pro tier table
- [x] 2.3 Wire the new tab into the existing tab bar and conditional render, without touching the submissions-fetching logic

## 3. Spec housekeeping

- [x] 3.1 Archive this change, removing `/membership` from `placeholder-pages`, creating the `membership-page` spec, and adding the roadmap-tab requirement to `admin-dashboard`

## 4. Verification

- [x] 4.1 `npm run lint`, `npm run build`, `npm test` all pass
- [x] 4.2 Visually verify `/membership` and the `/admin` Roadmap tab in a browser
