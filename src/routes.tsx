/**
 * THE ROUTE COMPONENTS, AND WHY THEY ARE NOT PLAIN `React.lazy` ANY MORE.
 *
 * Every page used to be a bare `lazy(() => import(...))` declared in App.tsx.
 * That is correct for a client-rendered app and wrong for a prerendered one:
 * a lazy component ALWAYS suspends on its first render, even when its module is
 * already in memory, because `lazy` wraps the import in a fresh promise and
 * only resolves on a later microtask. During hydration a boundary that suspends
 * cannot be matched against the server markup, so React throws the whole
 * prerendered subtree away and rebuilds it on the client.
 *
 * That is not a theoretical cost, it was visible three ways in production:
 *
 *   1. `Uncaught Error: Minified React error #418` on every page load — the
 *      hydration mismatch, reported by Lighthouse as the sole failing
 *      best-practices audit.
 *   2. The dev build printed the mismatch verbatim: at `<main id="main-content">`
 *      React rendered `+<Suspense fallback={<PageFallback>}>` where the HTML
 *      held `-<section className="relative flex min-h-[100dvh]...">`.
 *   3. The layout shift that CLS 0.400 was measuring. That shift was patched in
 *      an earlier change by reserving the prerendered height (see
 *      `--prerendered-main-height` in src/main.tsx); this file removes the
 *      cause rather than the symptom. Both are kept: the height reservation is
 *      still the floor for the eight routes that are never prerendered and for
 *      client-side navigation, where suspending is correct and expected.
 *
 * `lazyRoute` below returns a component that renders the real page synchronously
 * once `preload()` has resolved, and falls back to ordinary `lazy` behaviour
 * otherwise. src/main.tsx awaits `preload()` for the landing route before it
 * hydrates, so the first render of a prerendered page never suspends at all.
 */

import {
    createElement,
    lazy,
    type ComponentProps,
    type ComponentType,
    type ReactElement,
} from 'react';

export interface Preloadable {
    /** Resolve the chunk and record it, so the next render is synchronous. */
    preload: () => Promise<void>;
}

export type PreloadableRoute<P> = ((props: P) => ReactElement) & Preloadable;

/**
 * The generic mirrors React's own `lazy` — infer the COMPONENT type, not its
 * props — because inferring props directly makes them contravariant and TS
 * rejects every page that takes none.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyRoute<T extends ComponentType<any>>(
    load: () => Promise<{ default: T }>,
): PreloadableRoute<ComponentProps<T>> {
    let Resolved: T | null = null;
    let pending: Promise<void> | null = null;
    const Lazy = lazy(load);

    const preload = () => {
        pending ??= load().then((module) => {
            Resolved = module.default;
        });
        return pending;
    };

    const Route = (props: ComponentProps<T>) => createElement(Resolved ?? Lazy, props);
    Route.preload = preload;
    return Route;
}

export const Home = lazyRoute(() => import('./pages/Home').then((m) => ({ default: m.Home })));
export const About = lazyRoute(() => import('./pages/About').then((m) => ({ default: m.About })));
export const Careers = lazyRoute(() => import('./pages/Careers').then((m) => ({ default: m.Careers })));
export const Partners = lazyRoute(() => import('./pages/Partners').then((m) => ({ default: m.Partners })));
export const Contact = lazyRoute(() => import('./pages/Contact').then((m) => ({ default: m.Contact })));
export const Blog = lazyRoute(() => import('./pages/Blog').then((m) => ({ default: m.Blog })));
export const Playbooks = lazyRoute(() => import('./pages/Playbooks').then((m) => ({ default: m.Playbooks })));
export const Events = lazyRoute(() => import('./pages/Events').then((m) => ({ default: m.Events })));
export const Gallery = lazyRoute(() => import('./pages/Gallery').then((m) => ({ default: m.Gallery })));
export const Newsletter = lazyRoute(() => import('./pages/Newsletter').then((m) => ({ default: m.Newsletter })));
export const Membership = lazyRoute(() => import('./pages/Membership').then((m) => ({ default: m.Membership })));
export const Mentorship = lazyRoute(() => import('./pages/Mentorship').then((m) => ({ default: m.Mentorship })));
export const Chapters = lazyRoute(() => import('./pages/Chapters').then((m) => ({ default: m.Chapters })));
export const CodeOfConduct = lazyRoute(() =>
    import('./pages/CodeOfConduct').then((m) => ({ default: m.CodeOfConduct })),
);
export const PrivacyPolicy = lazyRoute(() =>
    import('./pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })),
);
export const TermsAndConditions = lazyRoute(() =>
    import('./pages/TermsAndConditions').then((m) => ({ default: m.TermsAndConditions })),
);
export const ResourcesHub = lazyRoute(() =>
    import('./pages/ResourcesHub').then((m) => ({ default: m.ResourcesHub })),
);
export const NotFound = lazyRoute(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));
export const Admin = lazyRoute(() => import('./pages/Admin').then((m) => ({ default: m.Admin })));

/**
 * The modal is not a route, but it lives inside Layout, so it is part of every
 * hydrated tree and must be preloaded alongside the page.
 *
 * It is tempting to leave this one alone — closed, it renders nothing, and its
 * Suspense fallback is also nothing, so surely the two agree. They do not.
 * SUSPENDING is what breaks hydration, not what the boundary would have
 * rendered: React cannot match a suspended boundary against server markup at
 * all, and the error it reports names the outer `<main>`, which sends you
 * hunting in the wrong place. Verified — with only the page preloaded, all
 * eleven routes still mismatched, and this was why.
 */
export const JoinModal = lazyRoute(() =>
    import('./components/JoinModal').then((m) => ({ default: m.JoinModal })),
);
