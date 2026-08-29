/**
 * PRERENDER: turn the single-page app into real HTML files, one per route.
 *
 * THE PROBLEM THIS SOLVES. Before this script, every URL on ifn.community
 * returned the same 3,306-byte document — `/`, `/about`, `/membership`,
 * `/events` and a nonexistent path all had the identical md5. The body was
 * `<div id="root"></div>`. Google renders JavaScript and so eventually saw the
 * real pages; GPTBot, ClaudeBot, PerplexityBot, CCBot and every social unfurler
 * do not, and so saw nothing at all. For answer engines the site was blank.
 *
 * HOW IT WORKS. `vite build` produces dist/. This script serves dist/ over a
 * local HTTP server, drives a real headless Chrome across each indexable route,
 * waits for the app to finish rendering, and writes the resulting DOM to
 * dist/<route>/index.html. Netlify serves those files directly — its redirect
 * engine matches existing static files before applying the non-forced `/*`
 * rewrite — so a crawler requesting /membership gets prerendered HTML while the
 * client-side router continues to own navigation after hydration.
 *
 * WHY PUPPETEER RATHER THAN A PLUGIN. `vite-plugin-prerender-spa` does not
 * exist on npm. `vite-plugin-prerender` is an unmaintained port of the
 * abandoned prerender-spa-plugin with no Vite 7 story. `vite-react-ssg` is real
 * but owns the entry point and requires the route tree as an enumerable array,
 * which is genuine surgery on an App.tsx with twenty `lazy()` routes and a
 * `useLocation`-driven head component. Puppeteer was already a devDependency of
 * this repo. Driving the built artefact is also the only approach that
 * validates what actually ships rather than a parallel render path.
 *
 * THE THREE HAZARDS THIS SCRIPT IS BUILT AROUND, each of which produces output
 * that looks fine and is worse than doing nothing:
 *
 *   1. BAKING "Loading…" INTO THE HTML. Every route is behind React.lazy and a
 *      Suspense fallback that renders the literal text "Loading…". A snapshot
 *      taken at load, or at networkidle, can capture that instead of the page.
 *      Wrong content is worse than no content: it is indexable, and it says the
 *      page is broken. waitForRender() below refuses to snapshot until the
 *      fallback is gone and real content has arrived.
 *
 *   2. BAKING A FAILED API CALL INTO THE HTML. /events fetches /api/events at
 *      runtime. There is no Netlify Functions server here, so the request would
 *      fail and the error state would be frozen into the page. The request is
 *      intercepted and answered from src/data/events.json — the same file the
 *      deployed function itself falls back to.
 *
 *   3. PHANTOM ANALYTICS TRAFFIC. Chrome sets navigator.webdriver, and
 *      src/lib/analytics.ts refuses to initialise when it is true, so a
 *      production build does not fire eleven pageviews from a build machine.
 *      That guard lives in the app rather than here on purpose: it holds for
 *      anything else that ever automates the site.
 */

import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST = join(ROOT, 'dist')
const PORT = 4183

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.woff2': 'font/woff2',
    '.xml': 'application/xml',
    '.txt': 'text/plain; charset=utf-8',
}

/**
 * A static server with the same SPA fallback semantics as production: a real
 * file wins, anything else gets index.html. Matching production here matters,
 * because a prerender run against different routing than the live site would
 * validate nothing.
 */
function serveDist() {
    return new Promise((resolvePromise) => {
        const server = createServer(async (req, res) => {
            const url = new URL(req.url, `http://localhost:${PORT}`)
            let filePath = join(DIST, decodeURIComponent(url.pathname))

            if (!existsSync(filePath) || (await isDirectory(filePath))) {
                const withIndex = join(filePath, 'index.html')
                filePath = existsSync(withIndex) ? withIndex : join(DIST, 'index.html')
            }

            try {
                const body = await readFile(filePath)
                res.writeHead(200, {
                    'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
                })
                res.end(body)
            } catch {
                res.writeHead(404)
                res.end('Not found')
            }
        })
        server.listen(PORT, () => resolvePromise(server))
    })
}

async function isDirectory(path) {
    try {
        const { stat } = await import('node:fs/promises')
        return (await stat(path)).isDirectory()
    } catch {
        return false
    }
}

/**
 * Block the snapshot until the page has genuinely rendered.
 *
 * Three conditions, all required. The Suspense fallback must be gone, because
 * that is hazard 1. An <h1> must exist, because every real page on this site
 * has one and its presence is the cheapest proof that a route chunk resolved
 * rather than merely that the spinner stopped. And <Head> must have run, which
 * is detected through the `data-head-managed` canonical it writes — that is the
 * signal that the metadata this whole exercise exists to bake in is actually
 * present in the DOM about to be serialised.
 */
async function waitForRender(page) {
    await page.waitForFunction(
        () => {
            const status = document.querySelector('[role="status"]')
            const stillLoading = status?.textContent?.includes('Loading')
            const hasHeading = document.querySelector('h1') !== null
            const hasCanonical =
                document.querySelector('link[rel="canonical"][data-head-managed]') !== null
            return !stillLoading && hasHeading && hasCanonical
        },
        { timeout: 20000, polling: 200 },
    )

    /**
     * One extra frame after the conditions pass. Framer-motion sets initial
     * opacity 0 on entrance animations and the snapshot should not capture a
     * tree mid-transition with inline `opacity: 0` on half of it — that is
     * invisible to a crawler reading text, but it is visible to anything that
     * screenshots the page, and it costs one frame to avoid.
     */
    await new Promise((r) => setTimeout(r, 250))
}

/**
 * Harvest the FAQ from the rendered accordion and rewrite the JSON-LD graph to
 * include a FAQPage node.
 *
 * Done here rather than in src/data/structuredData.ts because Google requires
 * the marked-up answer to match the visible answer, and the answers in FAQ.tsx
 * are JSX with inline links. Any plain-text copy kept alongside them would
 * drift on the first edit and the drift would be silent. Reading the DOM the
 * visitor sees cannot drift by construction.
 */
async function injectFaqSchema(page) {
    await page.evaluate(() => {
        const script = document.getElementById('ifn-structured-data')
        if (!script) return

        const entries = []
        document.querySelectorAll('h3, dt, [data-faq-question]').forEach((node) => {
            const question = node.textContent?.trim()
            if (!question || !question.endsWith('?')) return

            /**
             * The answer is whichever container follows the question heading.
             * The accordion keeps collapsed answers in the DOM (they are hidden
             * with CSS, not unmounted), so this works without clicking through
             * nine panels — and it must, because an answer that is only in the
             * DOM after a click is not "visible content" for schema purposes
             * anyway.
             */
            const region =
                node.closest('[data-faq-item]')?.querySelector('[data-faq-answer]') ??
                node.parentElement?.querySelector('[id$="-panel"], [role="region"]') ??
                node.nextElementSibling
            const answer = region?.textContent?.trim()
            if (!answer || answer.length < 20) return

            entries.push({ question, answer: answer.replace(/\s+/g, ' ') })
        })

        if (entries.length === 0) return

        const graph = JSON.parse(script.textContent)
        graph['@graph'].push({
            '@type': 'FAQPage',
            '@id': 'https://ifn.community/#faq',
            mainEntity: entries.map((e) => ({
                '@type': 'Question',
                name: e.question,
                acceptedAnswer: { '@type': 'Answer', text: e.answer },
            })),
        })
        script.textContent = JSON.stringify(graph, null, 2)
        return entries.length
    })
}

/**
 * Remove the things that must not be frozen into a static file.
 *
 * The consent banner is the important one: it renders only for a visitor who
 * has not yet answered, decided in an effect against localStorage. Baking it
 * into the HTML would show it to everyone on first paint including people who
 * already declined, and it would appear before hydration could remove it.
 */
async function stripRuntimeOnly(page) {
    await page.evaluate(() => {
        document
            .querySelectorAll('[aria-label="Analytics consent"]')
            .forEach((node) => node.remove())
    })
}

async function main() {
    if (!existsSync(DIST)) {
        console.error('dist/ not found. Run `vite build` before prerendering.')
        process.exit(1)
    }

    const routesFile = join(DIST, 'prerender-routes.json')
    if (!existsSync(routesFile)) {
        console.error('dist/prerender-routes.json not found — the seoAssets vite plugin did not run.')
        process.exit(1)
    }
    const routes = JSON.parse(await readFile(routesFile, 'utf8'))

    /** The events feed the deployed function falls back to. See hazard 2. */
    const eventsFixture = await readFile(join(ROOT, 'src/data/events.json'), 'utf8')

    const server = await serveDist()
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
    })

    let failures = 0

    try {
        for (const route of routes) {
            const page = await browser.newPage()
            await page.setViewport({ width: 1280, height: 900 })

            await page.setRequestInterception(true)
            page.on('request', (request) => {
                const url = request.url()
                if (url.includes('/api/events')) {
                    request.respond({
                        status: 200,
                        contentType: 'application/json',
                        body: eventsFixture,
                    })
                    return
                }
                /**
                 * Any other /api/* call during prerender is a POST from a form
                 * that nothing submitted, or a call this script does not know
                 * about. Aborting is safer than letting it hang the render.
                 */
                if (url.includes('/api/')) {
                    request.abort()
                    return
                }
                request.continue()
            })

            try {
                await page.goto(`http://localhost:${PORT}${route}`, {
                    waitUntil: 'networkidle0',
                    timeout: 30000,
                })
                await waitForRender(page)

                if (route === '/') await injectFaqSchema(page)
                await stripRuntimeOnly(page)

                const html = await page.evaluate(
                    () => `<!doctype html>\n${document.documentElement.outerHTML}`,
                )

                /**
                 * FLAT FILES, NOT DIRECTORY INDEXES, and this is load-bearing.
                 *
                 * Writing dist/membership/index.html looks equivalent and is
                 * not: Netlify serves a directory index at its slashed URL and
                 * 301s the unslashed form to it, so /membership answered
                 * `301 -> /membership/`. The content was correct at the end of
                 * that hop, but src/data/seo.ts emits the UNSLASHED form as the
                 * canonical and the sitemap advertises the unslashed form too,
                 * so every indexable URL on the site pointed a canonical at a
                 * URL that redirected somewhere else, and every crawl spent two
                 * requests where one would do.
                 *
                 * dist/membership.html is served directly at /membership with a
                 * 200 by Netlify's pretty-URL handling, which is exactly the
                 * form the canonical and the sitemap already claim.
                 */
                const outPath =
                    route === '/'
                        ? join(DIST, 'index.html')
                        : join(DIST, `${route.replace(/^\//, '')}.html`)
                await mkdir(dirname(outPath), { recursive: true })
                await writeFile(outPath, html, 'utf8')

                const kb = (Buffer.byteLength(html) / 1024).toFixed(0)
                console.log(`  prerendered ${route.padEnd(24)} ${kb} kB`)
            } catch (error) {
                failures += 1
                console.error(`  FAILED ${route}: ${error.message}`)
            } finally {
                await page.close()
            }
        }
    } finally {
        await browser.close()
        server.close()
    }

    if (failures > 0) {
        /**
         * A failed route means that URL falls back to the empty shell, which is
         * exactly the state this script exists to eliminate — and it would do
         * so silently. Failing the build is the only way that gets noticed.
         */
        console.error(`\n${failures} route(s) failed to prerender. Failing the build.`)
        process.exit(1)
    }

    console.log(`\nPrerendered ${routes.length} routes.`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
