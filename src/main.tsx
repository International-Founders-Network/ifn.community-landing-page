import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics'

/**
 * Registered before the first render so that Consent Mode defaults are in place
 * before any pageview can be queued. Inert unless VITE_GA4_MEASUREMENT_ID is
 * set, so local dev and preview deploys stay out of the production property.
 */
initAnalytics()

/**
 * WHY THIS CLIENT-RENDERS INSTEAD OF HYDRATING, HAVING TRIED THE OTHER WAY.
 *
 * scripts/prerender.mjs writes real HTML into #root for all eleven indexable
 * routes, so `hydrateRoot` looks like the obviously correct call. It was tried,
 * shipped, and reverted, and the reason is structural rather than a bug that
 * could be fixed with more care:
 *
 *   React 19 delimits every Suspense boundary in server markup with `<!--$-->`
 *   comment markers, emitted by `renderToString`. Our HTML is not a server
 *   render — it is a snapshot of a CLIENT render, taken by driving headless
 *   Chrome over the built site, so those markers do not exist. React therefore
 *   cannot match any Suspense boundary in the document, and every route in this
 *   app renders behind one. Hydration failed on all eleven, reporting minified
 *   error #418 against `<main id="main-content">` on every page load.
 *
 * Resolving the lazy chunks before mounting does not help: the boundary breaks
 * hydration by existing, not by suspending. That was verified with the chunks
 * pre-resolved and again with the boundaries removed entirely, where the error
 * merely changed shape (`args[]=HTML` became `args[]=text`) rather than going
 * away. Making hydration work would mean adopting real server rendering, which
 * is a different project than prerendering the built artefact.
 *
 * NOTHING IS LOST BY CLIENT-RENDERING, and this is the part worth stating
 * plainly: React was already discarding the prerendered tree and re-rendering
 * it, because that is what it does when hydration fails. The only difference
 * now is that it no longer attempts the match first, fails, and logs an error
 * to every visitor's console. The prerendered HTML still does its whole job —
 * it exists for crawlers and unfurlers that never execute JavaScript, and they
 * never reach this file.
 *
 * The layout shift that `hydrateRoot` was introduced to fix is NOT fixed by
 * hydration and never was; see the height reservation below, which is the
 * measure that actually moved CLS from 0.400 to 0.000 and which stays.
 */

/**
 * RESERVE THE PRERENDERED HEIGHT SO THE FALLBACK CANNOT COLLAPSE THE PAGE.
 *
 * Every route sits behind React.lazy, and the Suspense fallback is a short box.
 * Between React mounting and the route chunk arriving, `<main>` collapses from
 * its prerendered height to that box, and the footer takes the round trip:
 *
 *   4400ms  main 14417px   prerendered markup, correct
 *   4658ms  main   384px   React mounts, PageFallback renders
 *   4891ms  main 14203px   route chunk resolves -> layout shift 0.400
 *
 * Lighthouse scored that CLS 0.23/1 and attributed 0.4 of 0.422 to the footer
 * alone. It only appears under load: at 4x CPU throttling on a 150ms/1.6Mbps
 * link the gap is long enough to paint, while on an unthrottled localhost the
 * chunk wins the race and CLS measures 0.000.
 *
 * The prerendered markup is still in the document when this runs, so its height
 * can be read and handed to the fallback as a floor. `<main>` then keeps its
 * size across the swap and nothing below it moves.
 *
 * Published as a custom property rather than passed through props because the
 * fallback is rendered deep inside App.tsx by react-router, and a CSS variable
 * needs no plumbing. src/App.tsx falls back to 60vh when it is absent, which is
 * the case for every route that was never prerendered.
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
