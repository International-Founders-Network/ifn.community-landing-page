/**
 * GENERATE THE OPEN GRAPH SHARE IMAGE.
 *
 * WHY THIS EXISTS. `public/logo.png` was the site's og:image and twitter:image.
 * It was not a logo. It was a 1024x364 SCREENSHOT of the retired site's call to
 * action, and it was the picture attached to every link to ifn.community ever
 * pasted into Slack, LinkedIn, WhatsApp or iMessage. It contained, visibly:
 *
 *   - a broken-image placeholder icon, rendered as a grey thumbnail glyph
 *   - "Join thousands of founders", which IFN cannot support
 *   - "Free to join" and "No credit card required", contradicting the $149
 *     annual membership the current site advertises
 *   - "Applications reviewed weekly. Next cohort opens Monday", describing an
 *     accelerator intake, which the FAQ explicitly says IFN is not
 *   - a selected-text highlight artefact, left over from the screenshot
 *   - an orange accent that is not the current brand's `--accent` (#A81B36)
 *
 * And `og:image:alt` described it as "The International Founders Network
 * wordmark: IFN.", which it never was. So the single most-shared asset on the
 * domain was a stale screenshot making four claims the site does not make.
 *
 * WHAT THIS GENERATES INSTEAD. A 1200x630 card — the size every unfurler
 * expects, and the reason the old 1024x364 was letterboxed or cropped — built
 * from the palette in src/index.css and the wordmark face already self-hosted
 * in public/fonts/. Nothing is invented: the colours are the shipped tokens and
 * the words are the site's own.
 *
 * This is a stopgap that is honest rather than a brand asset. The real
 * wordmark lives in the sibling ifn-brand repo, which this repo does not
 * reference; when a designed card exists there, replace public/og-image.png
 * with it and delete this script.
 *
 * Run: node scripts/build-og-image.mjs
 */

import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

/** The shipped light-mode tokens, quoted from src/index.css lines 114-125. */
const PAPER = '#FBFBFA'
const INK = '#131311'
const MUTED = '#5B5B55'
const ACCENT = '#A81B36'

/**
 * The fonts are embedded as base64 data URIs rather than referenced by path,
 * and the card is rasterised by CHROME rather than by sharp's SVG renderer.
 *
 * Both details are load-bearing and were arrived at by failing first. librosvg,
 * which backs sharp's SVG rasteriser, ignored the embedded @font-face entirely
 * and silently substituted a system grotesque for MuseoModerno — the wordmark
 * came out in the wrong typeface with no error, which is precisely the class of
 * failure that put a stale screenshot in this slot to begin with. Chrome honours
 * @font-face and `document.fonts.ready` gives a definite signal that the faces
 * have loaded before the screenshot is taken, so the output either has the real
 * wordmark or the script does not finish.
 */
async function fontDataUri(file) {
    const buffer = await readFile(resolve(ROOT, 'public/fonts', file))
    return `data:font/woff2;base64,${buffer.toString('base64')}`
}

async function main() {
    const museo = await fontDataUri('museomoderno-900-latin.woff2')
    const archivo = await fontDataUri('archivo-variable-latin.woff2')

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family:'MuseoModerno'; font-weight:900; src:url('${museo}') format('woff2'); }
  @font-face { font-family:'Archivo'; font-weight:400 700; src:url('${archivo}') format('woff2'); }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1200px; height:630px; background:${PAPER}; display:flex; flex-direction:column;
         justify-content:center; padding:0 88px; -webkit-font-smoothing:antialiased; }
  /* The accent appears exactly once, as a rule. That is the only role
     src/index.css licenses it for at this size: as type it measures 2.547
     against surrounding body copy, below the 3.0 contrast floor. */
  .rule     { width:132px; height:10px; background:${ACCENT}; margin-bottom:26px; }
  .wordmark { font-family:'MuseoModerno'; font-weight:900; color:${INK};
              font-size:132px; line-height:1; letter-spacing:-0.02em; }
  .headline { font-family:'Archivo'; font-weight:600; color:${INK}; font-size:56px;
              line-height:1.16; letter-spacing:-0.025em; margin-top:44px; }
  .sub      { font-family:'Archivo'; font-weight:400; color:${MUTED}; font-size:30px;
              line-height:1.45; margin-top:34px; }
</style></head>
<body>
  <div class="rule"></div>
  <div class="wordmark">IFN.</div>
  <div class="headline">Founders who came<br/>from somewhere else.</div>
  <div class="sub">Monthly meetups in Austin, Texas<br/>ifn.community</div>
</body></html>`

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    try {
        const page = await browser.newPage()
        /**
         * deviceScaleFactor 1 at exactly 1200x630. Unfurlers do not benefit
         * from a 2x card and several cap the file size, so a retina render is
         * bytes spent where nobody looks.
         */
        await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
        await page.setContent(html, { waitUntil: 'load' })

        /** The definite signal that both faces are decoded. See the note above. */
        await page.evaluate(() => document.fonts.ready)

        const out = resolve(ROOT, 'public/og-image.png')
        await page.screenshot({ path: out, type: 'png' })
        console.log('Wrote public/og-image.png (1200x630)')
    } finally {
        await browser.close()
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
