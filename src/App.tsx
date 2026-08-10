import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToAnchor } from './components/ScrollToAnchor';
import { ScrollToTop } from './components/ScrollToTop';

// Lazy load pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Careers = lazy(() => import('./pages/Careers').then(module => ({ default: module.Careers })));
const Partners = lazy(() => import('./pages/Partners').then(module => ({ default: module.Partners })));
const Contact = lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
const Blog = lazy(() => import('./pages/Blog').then(module => ({ default: module.Blog })));
const Playbooks = lazy(() => import('./pages/Playbooks').then(module => ({ default: module.Playbooks })));
const Events = lazy(() => import('./pages/Events').then(module => ({ default: module.Events })));
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

const SITE_NAME = 'International Founders Network';

/**
 * Every route shared one <title>, which fails WCAG 2.4.2 (Page Titled) and makes
 * tabs, history and search results indistinguishable.
 *
 * The six "coming soon" routes are deliberately absent: ComingSoon.tsx sets its
 * own title alongside the noindex tag it injects, and owns both.
 */
const ROUTE_TITLES: Record<string, string> = {
    '/': `${SITE_NAME} | Austin, Texas`,
    '/about': `About IFN | ${SITE_NAME}`,
    '/partners': `Partners | ${SITE_NAME}`,
    '/contact': `Contact us | ${SITE_NAME}`,
    '/events': `Monthly meetups in Austin | ${SITE_NAME}`,
    '/resources': `Founder resources | ${SITE_NAME}`,
    '/membership': `Membership | ${SITE_NAME}`,
    '/code-of-conduct': `Code of conduct | ${SITE_NAME}`,
    '/privacy-policy': `Privacy policy | ${SITE_NAME}`,
    '/terms-and-conditions': `Terms and conditions | ${SITE_NAME}`,
};

function RouteTitle() {
    const { pathname } = useLocation();

    useEffect(() => {
        const title = ROUTE_TITLES[pathname];
        if (title) {
            document.title = title;
        } else if (!(pathname in ROUTE_TITLES)) {
            // Unmatched path renders NotFound; ComingSoon routes set their own.
            const isComingSoon = COMING_SOON_PATHS.has(pathname);
            if (!isComingSoon) document.title = `Page not found | ${SITE_NAME}`;
        }
    }, [pathname]);

    return null;
}

const COMING_SOON_PATHS = new Set([
    '/blog',
    '/careers',
    '/chapters',
    '/mentorship',
    '/newsletter',
    '/playbooks',
]);

function PageFallback() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
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
                <RouteTitle />
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
