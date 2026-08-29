import { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToAnchor } from './components/ScrollToAnchor';
import { ScrollToTop } from './components/ScrollToTop';
import { Head } from './components/Head';
import { ConsentBanner } from './components/ConsentBanner';

// Lazy load pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Careers = lazy(() => import('./pages/Careers').then(module => ({ default: module.Careers })));
const Partners = lazy(() => import('./pages/Partners').then(module => ({ default: module.Partners })));
const Contact = lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
const Blog = lazy(() => import('./pages/Blog').then(module => ({ default: module.Blog })));
const Playbooks = lazy(() => import('./pages/Playbooks').then(module => ({ default: module.Playbooks })));
const Events = lazy(() => import('./pages/Events').then(module => ({ default: module.Events })));
const Gallery = lazy(() => import('./pages/Gallery').then(module => ({ default: module.Gallery })));
const Newsletter = lazy(() => import('./pages/Newsletter').then(module => ({ default: module.Newsletter })));
const Membership = lazy(() => import('./pages/Membership').then(module => ({ default: module.Membership })));
const Mentorship = lazy(() => import('./pages/Mentorship').then(module => ({ default: module.Mentorship })));
const Chapters = lazy(() => import('./pages/Chapters').then(module => ({ default: module.Chapters })));
const CodeOfConduct = lazy(() => import('./pages/CodeOfConduct').then(module => ({ default: module.CodeOfConduct })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions').then(module => ({ default: module.TermsAndConditions })));
const ResourcesHub = lazy(() => import('./pages/ResourcesHub').then(module => ({ default: module.ResourcesHub })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));

const JoinModal = lazy(() => import('./components/JoinModal').then(module => ({ default: module.JoinModal })));

/**
 * Route metadata now lives in src/data/seo.ts and is applied by the <Head>
 * component below. The ROUTE_TITLES map and the RouteTitle component that used
 * to sit here were removed rather than extended: they set document.title and
 * nothing else, so every route still shared one meta description and one Open
 * Graph block. seo.ts holds the title AND the description AND the indexability
 * of each route in one record, which is also what generates sitemap.xml and the
 * prerender route list, so the three can no longer drift apart.
 *
 * The COMING_SOON_PATHS set went with it. Those six routes are now ordinary
 * `indexable: false` entries in ROUTE_SEO, which gives them correct titles
 * without a second list to keep in sync.
 */

/**
 * The route-level Suspense fallback.
 *
 * `--prerendered-main-height` is set by src/main.tsx from the height of the
 * prerendered <main> before React mounts, and it is the whole reason this
 * component is not a plain `min-h-[60vh]` box: without it the fallback collapses
 * a 14,000px page to 384px for one frame and the footer takes a round trip that
 * Lighthouse scored as CLS 0.400. The 60vh is the fallback's fallback, used on
 * routes that were never prerendered.
 *
 * The spinner text stays vertically centred in whatever height is reserved, so
 * a tall reservation does not push it off screen.
 */
function PageFallback() {
    return (
        <div
            className="flex items-start justify-center pt-[30vh]"
            style={{ minHeight: 'var(--prerendered-main-height, 60vh)' }}
            role="status"
            aria-live="polite"
        >
            <span className="text-muted">Loading&hellip;</span>
        </div>
    );
}

function Layout() {
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const openJoinModal = () => setIsJoinModalOpen(true);

    return (
        <div className="min-h-screen bg-paper flex flex-col">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-5 focus:py-3 focus:text-paper focus:font-semibold"
            >
                Skip to main content
            </a>
            <Navbar onJoinClick={openJoinModal} />
            <main id="main-content" className="flex-grow">
                <Suspense fallback={<PageFallback />}>
                    <Outlet context={{ openJoinModal }} />
                </Suspense>
            </main>
            <Suspense fallback={<div className="h-24" />}>
                <Footer />
            </Suspense>
            <Suspense fallback={null}>
                <JoinModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
            </Suspense>
            {/* Renders nothing unless analytics is configured AND the visitor
                has not already answered. Inside Layout, so it is absent from
                /admin, which is not a public page. */}
            <ConsentBanner />
        </div>
    );
}

function App() {
    return (
        // reducedMotion="user" makes every Framer Motion animation in the tree
        // honour prefers-reduced-motion without touching each component.
        <MotionConfig reducedMotion="user">
            <BrowserRouter>
                <ScrollToAnchor />
                <ScrollToTop />
                <Head />
                <Routes>
                    <Route
                        path="/admin"
                        element={
                            <Suspense fallback={<PageFallback />}>
                                <Admin />
                            </Suspense>
                        }
                    />
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/careers" element={<Careers />} />
                        <Route path="/partners" element={<Partners />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/playbooks" element={<Playbooks />} />
                        <Route path="/events" element={<Events />} />
                        {/* ADDED, not moved. Every existing route, slug and
                            anchor id is untouched; /gallery collides with none
                            of them. It sits beside /events because the two are
                            the same subject seen forwards and backwards: the
                            dates that are coming, and the evenings that were
                            photographed. */}
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/resources" element={<ResourcesHub />} />
                        <Route path="/newsletter" element={<Newsletter />} />
                        <Route path="/membership" element={<Membership />} />
                        <Route path="/mentorship" element={<Mentorship />} />
                        <Route path="/chapters" element={<Chapters />} />
                        <Route path="/code-of-conduct" element={<CodeOfConduct />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </MotionConfig>
    );
}

export default App;
