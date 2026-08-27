import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { INDEXABLE_PATHS, ROUTE_SEO, SITE_NAME, SITE_URL } from './src/data/seo'

/**
 * Emit the crawler-facing files that must exist as REAL FILES rather than as
 * routes the SPA fallback happens to answer.
 *
 * This is the fix for a specific live defect: public/robots.txt advertised
 * `Sitemap: https://ifn.community/sitemap.xml`, no such file existed anywhere
 * in the repo or the build, and the `/*` catch-all in netlify.toml answered the
 * URL with the HTML shell and HTTP 200. Search Console does not report that as
 * a missing sitemap; it reports it as a parse error on a sitemap that "exists",
 * which is a harder failure to notice and a worse signal to send.
 *
 * Generated from ROUTE_SEO rather than hand-written, so a route added to the
 * app appears in the sitemap automatically and a route marked `indexable:
 * false` cannot be advertised by accident.
 */
function seoAssets(): Plugin {
    return {
        name: 'ifn-seo-assets',
        apply: 'build',
        closeBundle() {
            const outDir = resolve(__dirname, 'dist')

            /**
             * `lastmod` is the build date. It is honest: this site's pages
             * change when the site is rebuilt and deployed, and there is no
             * per-page modification timestamp to draw on. Google treats
             * lastmod as a hint and ignores it outright when it looks
             * uniformly faked, so a single accurate build date is worth more
             * than eleven invented per-page dates.
             */
            const lastmod = new Date().toISOString().split('T')[0]

            const urls = INDEXABLE_PATHS.map((path) => {
                const seo = ROUTE_SEO[path]
                const loc = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
                return [
                    '  <url>',
                    `    <loc>${loc}</loc>`,
                    `    <lastmod>${lastmod}</lastmod>`,
                    seo.changefreq ? `    <changefreq>${seo.changefreq}</changefreq>` : null,
                    seo.priority !== undefined ? `    <priority>${seo.priority.toFixed(1)}</priority>` : null,
                    '  </url>',
                ]
                    .filter(Boolean)
                    .join('\n')
            }).join('\n')

            writeFileSync(
                resolve(outDir, 'sitemap.xml'),
                `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
                'utf8',
            )

            /**
             * llms.txt — the emerging convention for telling a language model
             * what a site is and which pages carry its substance, in one
             * fetch, in prose rather than markup.
             *
             * It is not a standard and no engine is obliged to read it. It is
             * cheap, it costs one file, and for a site whose entire AEO problem
             * is that non-rendering crawlers see an empty shell, a plain-text
             * summary at a predictable path is the highest-leverage single file
             * on the domain. Written by hand here rather than derived from the
             * meta descriptions, because its audience is a reader that wants
             * facts, not marketing sentences.
             */
            const llms = [
                `# ${SITE_NAME}`,
                '',
                `> A community of international and immigrant founders based in Austin, Texas. IFN runs a free in-person meetup every month, publishes a resource library for founders building in the United States from somewhere else, and offers one paid annual membership tier.`,
                '',
                '## What IFN is',
                '',
                '- Founded and based in Austin, Texas.',
                '- The monthly meetup is in person and open to attend; registration is through Luma.',
                '- The audience is specifically international and immigrant founders: people incorporating in the US as non-residents, navigating founder visas, opening US banking, and raising from US investors without a US network.',
                '- There is one published membership tier. There is no free/paid tier ladder.',
                '- IFN is a community, not an accelerator, a fund, or an immigration service. It does not take equity and does not provide legal or immigration advice.',
                '',
                '## Primary pages',
                '',
                ...INDEXABLE_PATHS.map((path) => {
                    const seo = ROUTE_SEO[path]
                    const loc = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
                    const label = seo.title.split('|')[0].trim()
                    return `- [${label}](${loc}): ${seo.description}`
                }),
                '',
                '## Contact',
                '',
                '- Email: hello@ifn.community',
                `- Events calendar: https://lu.ma/IFN_ATX`,
                '',
            ].join('\n')

            writeFileSync(resolve(outDir, 'llms.txt'), llms, 'utf8')

            /**
             * The route list the prerender step consumes. Written here rather
             * than duplicated into scripts/prerender.mjs so that the set of
             * prerendered pages and the set of sitemapped pages are the same
             * set by construction, not by two lists agreeing.
             */
            writeFileSync(
                resolve(outDir, 'prerender-routes.json'),
                JSON.stringify(INDEXABLE_PATHS, null, 2),
                'utf8',
            )
        },
    }
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), seoAssets()],
    build: {
        rollupOptions: {
            output: {
                /**
                 * Split the two largest third-party dependencies out of the
                 * entry chunk.
                 *
                 * The entry chunk was one monolithic ~398 kB file with no
                 * vendor split, of which framer-motion is roughly a third. Every
                 * route pays for it on first load, and — more expensively —
                 * every deploy invalidates the whole thing, because the app code
                 * and the library code share one content hash. Splitting them
                 * means a copy edit no longer forces returning visitors to
                 * re-download React and framer-motion.
                 *
                 * Deliberately coarse. Fine-grained manual chunking on a site
                 * this size trades one round trip for several and usually loses.
                 */
                manualChunks: {
                    react: ['react', 'react-dom', 'react-router-dom'],
                    motion: ['framer-motion'],
                },
            },
        },
    },
})
