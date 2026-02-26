import { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
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
const ExperimentalHero = lazy(() => import('./pages/ExperimentalHero').then(module => ({ default: module.ExperimentalHero })));
const ResourcesHub = lazy(() => import('./pages/ResourcesHub').then(module => ({ default: module.ResourcesHub })));

const JoinModal = lazy(() => import('./components/JoinModal').then(module => ({ default: module.JoinModal })));

function Layout() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const openJoinModal = () => setIsJoinModalOpen(true);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onJoinClick={openJoinModal} />
      <main className="flex-grow">
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
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
    <BrowserRouter>
      <ScrollToAnchor />
      <ScrollToTop />
      <Routes>
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
          <Route path="/experimental-hero" element={<ExperimentalHero />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
