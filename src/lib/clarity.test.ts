import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Vitest runs these in the node environment (vitest.config.ts), so the few
 * browser globals the analytics modules touch are stubbed by hand. Each test
 * re-imports the modules after stubbing the env, because the ids are read from
 * import.meta.env once, at module evaluation.
 */

type FakeScript = { src?: string; async?: boolean };

let appended: FakeScript[];
let loadListeners: (() => void)[];
let store: Record<string, string>;
let fakeWindow: {
    location: { pathname: string; origin: string };
    clarity?: ((...args: unknown[]) => void) & { q?: ArrayLike<unknown>[] };
    dataLayer?: unknown[];
    requestIdleCallback?: unknown;
    addEventListener: (type: string, fn: () => void) => void;
    setTimeout: (fn: () => void) => number;
};
let fakeDocument: { readyState: string };

function setup({
    pathname = '/',
    readyState = 'complete',
    consent,
    webdriver = false,
}: {
    pathname?: string;
    readyState?: string;
    consent?: 'granted' | 'denied';
    webdriver?: boolean;
} = {}) {
    appended = [];
    loadListeners = [];
    store = consent ? { 'ifn-analytics-consent': consent } : {};
    fakeWindow = {
        location: { pathname, origin: 'https://ifn.community' },
        addEventListener: (type, fn) => {
            if (type === 'load') loadListeners.push(fn);
        },
        setTimeout: (fn) => {
            fn();
            return 0;
        },
    };
    fakeDocument = {
        readyState,
        createElement: () => ({}),
        head: { appendChild: (el: FakeScript) => appended.push(el) },
    } as unknown as { readyState: string };
    vi.stubGlobal('window', fakeWindow);
    vi.stubGlobal('document', fakeDocument);
    vi.stubGlobal('navigator', { webdriver });
    vi.stubGlobal('localStorage', {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
            store[k] = v;
        },
    });
}

async function load(clarityId: string | undefined, ga4Id = '') {
    vi.stubEnv('VITE_CLARITY_PROJECT_ID', clarityId ?? '');
    vi.stubEnv('VITE_GA4_MEASUREMENT_ID', ga4Id);
    vi.resetModules();
    const analytics = await import('./analytics');
    const clarity = await import('./clarity');
    return { ...analytics, ...clarity };
}

const clarityScripts = () => appended.filter((s) => s.src?.includes('clarity.ms'));
/** The stub queues `arguments` objects; compare them as plain arrays. */
const queued = () => Array.from(fakeWindow.clarity?.q ?? [], (args) => Array.from(args));

beforeEach(() => setup());

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe('parseClarityProjectId', () => {
    it('accepts a short alphanumeric id and trims it', async () => {
        const { parseClarityProjectId } = await load(undefined);
        expect(parseClarityProjectId('testclarity')).toBe('testclarity');
        expect(parseClarityProjectId('  testclarity ')).toBe('testclarity');
    });

    it('rejects empty, non-string and anything that could escape the URL', async () => {
        const { parseClarityProjectId } = await load(undefined);
        for (const bad of [undefined, null, 42, '', '   ', 'abc', 'test/../x', 'test clarity', 'a"b', 'x'.repeat(33)]) {
            expect(parseClarityProjectId(bad)).toBeNull();
        }
    });
});

describe('Clarity consent gate', () => {
    it('injects nothing before the visitor consents', async () => {
        const { initAnalytics, trackPageview } = await load('testclarity');
        initAnalytics();
        trackPageview('/', 'Home');
        expect(clarityScripts()).toHaveLength(0);
        expect(fakeWindow.clarity).toBeUndefined();
    });

    it('injects the tag and sends consentv2 once the visitor accepts', async () => {
        const { initAnalytics, setConsent } = await load('testclarity');
        initAnalytics();
        setConsent('granted');
        expect(clarityScripts()).toEqual([{ async: true, src: 'https://www.clarity.ms/tag/testclarity' }]);
        expect(queued()).toEqual([
            ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }],
        ]);
        expect(store['ifn-analytics-consent']).toBe('granted');
    });

    it('loads on page load, deferred until window load, when consent was stored earlier', async () => {
        setup({ consent: 'granted', readyState: 'loading' });
        const { initAnalytics } = await load('testclarity');
        initAnalytics();
        expect(clarityScripts()).toHaveLength(0);
        loadListeners.forEach((fn) => fn());
        expect(clarityScripts()).toHaveLength(1);
        expect(queued()[0]).toEqual(['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }]);
    });

    it('never injects twice', async () => {
        setup({ consent: 'granted' });
        const { initAnalytics, setConsent, trackPageview } = await load('testclarity');
        initAnalytics();
        setConsent('granted');
        trackPageview('/about', 'About');
        expect(clarityScripts()).toHaveLength(1);
    });

    it('stays out when consent was stored as denied', async () => {
        setup({ consent: 'denied' });
        const { initAnalytics, trackPageview } = await load('testclarity');
        initAnalytics();
        trackPageview('/', 'Home');
        expect(clarityScripts()).toHaveLength(0);
    });

    it('never loads in the prerender (navigator.webdriver)', async () => {
        setup({ consent: 'granted', webdriver: true });
        const { initAnalytics, setConsent } = await load('testclarity');
        initAnalytics();
        setConsent('granted');
        expect(clarityScripts()).toHaveLength(0);
    });
});

describe('Clarity project id', () => {
    it('is fully inert when VITE_CLARITY_PROJECT_ID is unset', async () => {
        setup({ consent: 'granted' });
        const { initAnalytics, setConsent, isAnalyticsEnabled, isClarityConfigured } = await load(undefined);
        initAnalytics();
        setConsent('granted');
        expect(isClarityConfigured).toBe(false);
        expect(isAnalyticsEnabled).toBe(false);
        expect(clarityScripts()).toHaveLength(0);
        expect(fakeWindow.clarity).toBeUndefined();
    });

    it('is inert when the id fails validation', async () => {
        const { setConsent, isClarityConfigured } = await load('bad"id/');
        setConsent('granted');
        expect(isClarityConfigured).toBe(false);
        expect(clarityScripts()).toHaveLength(0);
    });

    it('shows the consent banner when only Clarity is configured', async () => {
        const { isAnalyticsEnabled } = await load('testclarity');
        expect(isAnalyticsEnabled).toBe(true);
    });
});

describe('Clarity on /admin', () => {
    it.each(['/admin', '/admin/', '/admin/blog/some-post'])('never initial-loads on %s', async (pathname) => {
        setup({ pathname, consent: 'granted' });
        const { initAnalytics, setConsent, trackPageview } = await load('testclarity');
        initAnalytics();
        setConsent('granted');
        trackPageview(pathname, 'Admin');
        expect(clarityScripts()).toHaveLength(0);
        expect(fakeWindow.clarity).toBeUndefined();
    });

    it('does not treat lookalike public paths as admin', async () => {
        const { isClarityExcludedPath } = await load('testclarity');
        expect(isClarityExcludedPath('/administration')).toBe(false);
        expect(isClarityExcludedPath('/about')).toBe(false);
    });

    it('drops a deferred load that is overtaken by navigation into /admin', async () => {
        setup({ consent: 'granted', readyState: 'loading' });
        const { initAnalytics } = await load('testclarity');
        initAnalytics();
        fakeWindow.location.pathname = '/admin';
        loadListeners.forEach((fn) => fn());
        expect(clarityScripts()).toHaveLength(0);
    });

    it('loads when the visitor leaves /admin for a public page', async () => {
        setup({ pathname: '/admin', consent: 'granted' });
        const { initAnalytics, trackPageview } = await load('testclarity');
        initAnalytics();
        expect(clarityScripts()).toHaveLength(0);
        fakeWindow.location.pathname = '/';
        trackPageview('/?utm_source=x', 'Home');
        expect(clarityScripts()).toHaveLength(1);
    });

    it('stops recording on client side navigation into /admin', async () => {
        const { setConsent, trackPageview } = await load('testclarity');
        setConsent('granted');
        fakeWindow.location.pathname = '/admin';
        trackPageview('/admin', 'Admin');
        trackPageview('/admin/blog/x', 'Admin');
        expect(queued().filter((args) => args[0] === 'stop')).toHaveLength(1);
        fakeWindow.location.pathname = '/';
        trackPageview('/', 'Home');
        expect(clarityScripts()).toHaveLength(1);
    });
});

describe('Clarity revoke', () => {
    it('denies consent and erases cookies when the visitor declines after loading', async () => {
        const { setConsent } = await load('testclarity');
        setConsent('granted');
        setConsent('denied');
        expect(queued()).toEqual([
            ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }],
            ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' }],
            ['consent', false],
        ]);
        expect(store['ifn-analytics-consent']).toBe('denied');
    });

    it('cancels a pending deferred load and touches nothing when declined first', async () => {
        setup({ consent: 'granted', readyState: 'loading' });
        const { initAnalytics, setConsent, trackPageview } = await load('testclarity');
        initAnalytics();
        setConsent('denied');
        loadListeners.forEach((fn) => fn());
        trackPageview('/about', 'About');
        expect(clarityScripts()).toHaveLength(0);
        expect(fakeWindow.clarity).toBeUndefined();
    });
});

describe('GA4 is unaffected', () => {
    it('still loads gtag.js under Consent Mode without consent, with no Clarity', async () => {
        const { initAnalytics } = await load('testclarity', 'G-TEST000000');
        initAnalytics();
        expect(appended.map((s) => s.src)).toEqual([
            'https://www.googletagmanager.com/gtag/js?id=G-TEST000000',
        ]);
        expect(fakeWindow.dataLayer?.length).toBeGreaterThan(0);
    });
});
