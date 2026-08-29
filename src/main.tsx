import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics'
import { normalisePath } from './data/seo'

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
 * `hydrateRoot` adopts the existing DOM instead. React keeps the server markup
 * for a suspended boundary until its lazy chunk is ready, so nothing is removed
 * and nothing moves.
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
 * worth writing down: React can only hold server markup for a suspended
 * boundary when that boundary is delimited by the `<!--$-->` comment markers
 * that `renderToString` emits. Our HTML is a snapshot of a CLIENT render taken
 * in headless Chrome, so those markers do not exist. React sees one ordinary
 * tree, the lazy route suspends during hydration, and the content is removed
 * and replaced by the fallback exactly as before — measured still at CLS 0.400.
 *
 * So the route chunk is awaited first. Every page in App.tsx sits behind
 * React.lazy; importing the same specifier here resolves the same module
 * instance from Vite's registry, so by the time `<Suspense>` renders, its
 * promise is already fulfilled and no fallback is ever shown.
 *
 * Only the eleven prerendered routes are listed. Anything else (the six
 * placeholder pages, /admin, a 404) has no prerendered markup to protect and
 * takes the normal lazy path.
 */
const PRERENDERED_ROUTE_CHUNKS: Record<string, () => Promise<unknown>> = {
  '/': () => import('./pages/Home'),
  '/about': () => import('./pages/About'),
  '/events': () => import('./pages/Events'),
  '/membership': () => import('./pages/Membership'),
  '/resources': () => import('./pages/ResourcesHub'),
  '/gallery': () => import('./pages/Gallery'),
  '/partners': () => import('./pages/Partners'),
  '/contact': () => import('./pages/Contact'),
  '/code-of-conduct': () => import('./pages/CodeOfConduct'),
  '/privacy-policy': () => import('./pages/PrivacyPolicy'),
  '/terms-and-conditions': () => import('./pages/TermsAndConditions'),
}

const path = normalisePath(window.location.pathname)
const loadRouteChunk = PRERENDERED_ROUTE_CHUNKS[path]
if (loadRouteChunk) {
  try {
    await loadRouteChunk()
  } catch {
    /* A failed chunk is the router's problem, not the mount's. Carry on. */
  }
}

/**
 * RESERVE THE PRERENDERED HEIGHT SO THE FALLBACK CANNOT COLLAPSE THE PAGE.
 *
 * Awaiting the chunk above is necessary but not sufficient. React.lazy wraps
 * the import in a fresh `.then()` on every call, so even a fully cached module
 * leaves the boundary suspended for one microtask — and at 4x CPU throttling
 * that microtask is long enough for the browser to paint. Measured trace:
 *
 *   4400ms  main 14417px   prerendered markup, correct
 *   4658ms  main   384px   React mounts, PageFallback (60vh of 640) renders
 *   4891ms  main 14203px   route chunk resolves -> layout shift 0.400
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
