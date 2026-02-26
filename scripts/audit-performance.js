import puppeteer from 'puppeteer';

const PAGES = [
    { name: 'Home', url: 'http://localhost:8888/' },
    { name: 'About', url: 'http://localhost:8888/about' },
    { name: 'Events', url: 'http://localhost:8888/events' },
    { name: 'Partners', url: 'http://localhost:8888/partners' },
];

async function runAudit(page, name, url) {
    console.log(`\n--- Auditing ${name} (${url}) ---`);

    await page.goto(url, { waitUntil: 'networkidle2' });

    // 1. Measure Core Web Vitals (Approximate)
    const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
            const results = {
                lcp: 0,
                cls: 0,
                tbt: 0,
                images: [],
                totalRequests: 0,
                totalWeight: 0,
            };

            // Observe LCP
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                results.lcp = entries[entries.length - 1].startTime;
            }).observe({ type: 'largest-contentful-paint', buffered: true });

            // Observe CLS
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        results.cls += entry.value;
                    }
                }
            }).observe({ type: 'layout-shift', buffered: true });

            // Identify images and lazy loading status
            const imgs = Array.from(document.querySelectorAll('img'));
            results.images = imgs.map(img => ({
                src: img.src.substring(0, 50) + '...',
                loading: img.getAttribute('loading') || 'none',
                width: img.naturalWidth,
                height: img.naturalHeight,
                displayWidth: img.clientWidth,
                displayHeight: img.clientHeight,
                isOversized: img.naturalWidth > img.clientWidth * 2,
            }));

            // Basic network stats
            const resources = performance.getEntriesByType('resource');
            results.totalRequests = resources.length;
            results.totalWeight = resources.reduce((acc, res) => acc + (res.transferSize || 0), 0) / 1024; // KB

            // Allow some time for observers to fire
            setTimeout(() => resolve(results), 2000);
        });
    });

    console.log(`LCP: ${metrics.lcp.toFixed(2)}ms`);
    console.log(`CLS: ${metrics.cls.toFixed(4)}`);
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Total Weight: ${metrics.totalWeight.toFixed(2)} KB`);

    const missingLazy = metrics.images.filter(img => img.loading === 'none').length;
    console.log(`Images missing lazy loading: ${missingLazy} / ${metrics.images.length}`);

    const oversized = metrics.images.filter(img => img.isOversized).length;
    console.log(`Oversized images: ${oversized}`);

    return { name, ...metrics };
}

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const results = [];

    try {
        for (const p of PAGES) {
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            const stats = await runAudit(page, p.name, p.url);
            results.push(stats);
            await page.close();
        }

        console.log('\n--- PERFORMANCE AUDIT SUMMARY ---');
        console.table(results.map(r => ({
            Page: r.name,
            LCP: `${r.lcp.toFixed(0)}ms`,
            CLS: r.cls.toFixed(3),
            Requests: r.totalRequests,
            'Weight (KB)': r.totalWeight.toFixed(0),
            'No Lazy': r.images.filter(i => i.loading === 'none').length
        })));

    } catch (error) {
        console.error('Audit failed:', error);
    } finally {
        await browser.close();
    }
})();
