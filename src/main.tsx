import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics'
import { INDEXABLE_PATHS, normalisePath } from './data/seo'
import {
  About,
  CodeOfConduct,
  Contact,
  Events,
  Gallery,
  Home,
  JoinModal,
  Membership,
  Partners,
  PrivacyPolicy,
  ResourcesHub,
  TermsAndConditions,
  type Preloadable,
} from './routes'

/**
 * Registered before the first render so that Consent Mode defaults are in place
 * before any pageview can be queued. Inert unless VITE_GA4_MEASUREMENT_ID is
 * set, so local dev and preview deploys stay out of the production property.
 */
initAnalytics()

/**
 * HYDRATE THE PRERENDERED HTML; ONLY CLIENT-RENDER WHEN THERE IS NONE.
 *
 * scripts/prerender.mjs writes real HTML into #root for every indexable route.
 * `createRoot` THROWS THAT AWAY and rebuilds the tree from scratch, and that is
 * not a theoretical cost — it was measured at CLS 0.400 on the homepage:
 *
 *   1. The prerendered page paints in full at ~341ms.
 *   2. React discards it and renders the app, where every route sits behind
 *      React.lazy and shows the 60vh `PageFallback` until its chunk arrives.
 *   3. The footer, which had been sitting at y≈14700, jumps to just under the
 *      fallback and then drops back when the route chunk resolves.
 *
 * A ~14,000px round trip on the largest element on the page. Lighthouse scored
 * the resulting CLS 0.23/1 and attributed 0.4 of 0.422 to the footer alone.
 * Reproduced locally at 4x CPU throttling with a 150ms/1.6Mbps link; on an
 * unthrottled localhost the chunks win the race and CLS measures 0.000, which
 * is why this never showed up in local testing.
 *
 * `hydrateRoot` adopts the existing DOM instead — but only if the first render
 * matches it. A boundary that SUSPENDS during hydration cannot be matched, and
 * React then discards that subtree exactly as `createRoot` would, so hydration
 * on its own was necessary and not sufficient. See the next block.
 *
 * The `hasChildNodes` branch is not defensive clutter, it is load-bearing: the
 * prerender itself loads the freshly built index.html, whose #root IS empty,
 * and hydrating an empty container would make React log a hydration failure and
 * fall back to client rendering on every build.
 */
/**
 * RESOLVE THE CURRENT ROUTE'S CHUNK BEFORE MOUNTING.
 *
 * Hydration alone does not fix the shift described above, and the reason is
 * worth writing down: a component behind `React.lazy` suspends on its FIRST
 * render no matter what, because `lazy` re-wraps the import in a fresh promise
 * that can only settle a microtask later. React cannot match a suspended
 * boundary against server markup, so it discarded the prerendered <main> and
 * rebuilt it — measured still at CLS 0.400, and logged in production as
 * `Minified React error #418` on every single page load.
 *
 * src/routes.tsx therefore wraps each page so that it can be resolved AHEAD of
 * the first render; awaiting `preload()` here means the landing route renders
 * synchronously and its boundary never suspends. Only the eleven prerendered
 * routes are in the map. Anything else — the six placeholder pages, /admin, a
 * 404 — has no markup to preserve and takes the normal lazy path.
 */
const PRERENDERED_ROUTES: Record<string, Preloadable> = {
  '/': Home,
  '/about': About,
  '/events': Events,
  '/membership': Membership,
  '/resources': ResourcesHub,
  '/gallery': Gallery,
  '/partners': Partners,
  '/contact': Contact,
  '/code-of-conduct': CodeOfConduct,
  '/privacy-policy': PrivacyPolicy,
  '/terms-and-conditions': TermsAndConditions,
}

/**
 * A route added to ROUTE_SEO but missing from the map above would be
 * prerendered and then hydrate through the suspending path, silently
 * reintroducing the mismatch this preload exists to remove. Nothing else
 * catches that. AGENTS.md flags the same drift class between App.tsx and
 * seo.ts; this is the one case where it can be asserted.
 */
if (import.meta.env.DEV) {
  const missing = INDEXABLE_PATHS.filter((route) => !(route in PRERENDERED_ROUTES))
  if (missing.length > 0) {
    throw new Error(
      `Prerendered but not preloadable: ${missing.join(', ')}. Add each to PRERENDERED_ROUTES in src/main.tsx.`,
    )
  }
}

/**
 * WHY THIS IS AN ASYNC FUNCTION AND NOT TOP-LEVEL AWAIT.
 *
 * Awaiting the chunk at module scope deadlocks the build. Top-level await
 * suspends evaluation of the entry chunk, but the page chunk being awaited
 * imports shared bindings back OUT of that same entry chunk, so it can never
 * finish evaluating and the promise never settles. The symptom is silent and
 * total: the page chunk downloads, nothing throws, nothing renders, #root stays
 * empty, and the prerender times out on all eleven routes. Evaluating the entry
 * to completion and mounting from inside a callback breaks the cycle.
 */
async function mount() {
  const path = normalisePath(window.location.pathname)
  const prerenderedRoute = PRERENDERED_ROUTES[path]
  if (prerenderedRoute) {
    try {
      /* JoinModal renders inside Layout on every page, so it has to resolve
         before the first render too — see the note on it in src/routes.tsx. */
      await Promise.all([prerenderedRoute.preload(), JoinModal.preload()])
    } catch {
      /* A failed chunk is the router's problem, not the mount's. Carry on. */
    }
  }
  /**
   * RESERVE THE PRERENDERED HEIGHT SO THE FALLBACK CANNOT COLLAPSE THE PAGE.
   *
   * This was the original fix for the shift, from before the preload above
   * removed its cause. The trace it was built against:
   *
   *   4400ms  main 14417px   prerendered markup, correct
   *   4658ms  main   384px   React mounts, PageFallback (60vh of 640) renders
   *   4891ms  main 14203px   route chunk resolves -> layout shift 0.400
   *
   * KEPT DELIBERATELY, not left behind. The eleven prerendered routes no longer
   * reach the fallback at all, but every other route still does, and so does
   * every client-side navigation, where suspending is correct and expected. It is
   * also the floor if anything else in the tree ever suspends during hydration —
   * which is exactly the failure it was written to absorb.
   *
   * The prerendered markup is still in the document at this point, so its height
   * can simply be read and handed to the fallback as a floor. `<main>` then keeps
   * its size across the swap and the footer never moves.
   *
   * Published as a custom property rather than passed through props because the
   * fallback is rendered deep inside App.tsx by react-router, and a CSS variable
   * needs no plumbing. src/App.tsx falls back to 60vh when it is absent, which is
   * the case for every non-prerendered route.
   */
  const prerenderedMain = document.querySelector('main')
  if (prerenderedMain) {
    const height = prerenderedMain.getBoundingClientRect().height
    if (height > 0) {
      document.documentElement.style.setProperty(
        '--prerendered-main-height',
        `${Math.round(height)}px`,
      )
    }
  }

  const container = document.getElementById('root')!

  if (container.hasChildNodes()) {
    hydrateRoot(
      container,
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } else {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  }
}

void mount()
