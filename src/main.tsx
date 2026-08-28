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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
