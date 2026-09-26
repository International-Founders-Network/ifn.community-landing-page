/**
 * BRANDED BLOG OPEN GRAPH IMAGES.
 *
 * Extends the same puppeteer + MuseoModerno / Archivo approach as
 * scripts/build-og-image.mjs. Reads scripts/blog-og-manifest.json and writes
 * 1200x630 PNGs under public/blog/<slug>-og.png.
 *
 * Never use public/logo.png. Tokens: paper/ink/muted/accent from src/index.css.
 *
 * Run: node scripts/build-blog-og-images.mjs
 */

import { readFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const PAPER = '#FBFBFA'
const INK = '#131311'
const MUTED = '#5B5B55'
const ACCENT = '#A81B36'
const RULE = '#D8D8D2'

async function fontDataUri(file) {
    const buffer = await readFile(resolve(ROOT, 'public/fonts', file))
    return `data:font/woff2;base64,${buffer.toString('base64')}`
}

function wordmarkHtml() {
    return `<div class="wordmark">IFN<span class="dot">.</span></div>`
}

function formingBody(entry) {
    const tracks = ['Company paper', 'Personal status', 'Money rails']
    return `
  <div class="top">
    ${wordmarkHtml()}
    <div class="eyebrow">${entry.eyebrow || 'Peer notes'}</div>
  </div>
  <div class="title">${entry.titleFragment}</div>
  <div class="rule"></div>
  <div class="tracks">
    ${tracks
        .map(
            (t) => `
      <div class="track">
        <div class="track-rule"></div>
        <div class="track-label">${t}</div>
      </div>`,
        )
        .join('')}
  </div>`
}

function visaBody(entry) {
    const chips = ['O-1', 'E-2', 'H-1B', 'L-1']
    return `
  <div class="top">
    ${wordmarkHtml()}
    <div class="eyebrow">${entry.eyebrow || 'Peer notes'}</div>
  </div>
  <div class="title">${entry.titleFragment}</div>
  <div class="rule"></div>
  <div class="chips">
    ${chips.map((c) => `<div class="chip">${c}</div>`).join('')}
    <div class="stop">
      <span class="stop-mark"></span>
      <span class="stop-label">When we stop</span>
    </div>
  </div>`
}

function bankingBody(entry) {
    const tiles = [
        { label: 'Formation', mismatch: false },
        { label: 'EIN', mismatch: false },
        { label: 'Ownership', mismatch: false },
        { label: 'ID', mismatch: false },
        { label: 'Address', mismatch: true },
        { label: 'Description', mismatch: false },
    ]
    return `
  <div class="top">
    ${wordmarkHtml()}
    <div class="eyebrow">${entry.eyebrow || 'Peer notes'}</div>
  </div>
  <div class="title">${entry.titleFragment}</div>
  <div class="rule"></div>
  <div class="tiles">
    ${tiles
        .map(
            (t) => `
      <div class="tile${t.mismatch ? ' mismatch' : ''}">
        <div class="tile-label">${t.label}</div>
      </div>`,
        )
        .join('')}
  </div>`
}

function layoutCss(layout) {
    const shared = `
  @font-face { font-family:'MuseoModerno'; font-weight:900; src:url('__MUSEO__') format('woff2'); }
  @font-face { font-family:'Archivo'; font-weight:400 700; src:url('__ARCHIVO__') format('woff2'); }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1200px; height:630px; background:${PAPER}; display:flex; flex-direction:column;
         justify-content:flex-start; padding:64px 80px 56px; -webkit-font-smoothing:antialiased;
         color:${INK}; font-family:'Archivo', sans-serif; }
  .top { display:flex; align-items:baseline; justify-content:space-between; }
  .wordmark { font-family:'MuseoModerno'; font-weight:900; color:${INK};
              font-size:56px; line-height:1; letter-spacing:-0.02em; }
  .wordmark .dot { color:${ACCENT}; }
  .eyebrow { font-family:'Archivo'; font-weight:500; color:${MUTED}; font-size:22px;
             letter-spacing:0.04em; text-transform:uppercase; }
  .title { font-family:'Archivo'; font-weight:600; color:${INK}; font-size:64px;
           line-height:1.1; letter-spacing:-0.025em; margin-top:36px; max-width:920px; }
  .rule { width:96px; height:6px; background:${ACCENT}; margin-top:28px; margin-bottom:40px; }
`
    if (layout === 'forming') {
        return (
            shared +
            `
  .tracks { display:flex; gap:36px; margin-top:8px; flex:1; align-items:stretch; }
  .track { flex:1; display:flex; flex-direction:column; border-left:2px solid ${RULE};
           padding-left:28px; min-height:220px; }
  .track-rule { width:28px; height:3px; background:${INK}; margin-bottom:18px; opacity:0.35; }
  .track-label { font-family:'Archivo'; font-weight:500; color:${INK}; font-size:28px;
                 line-height:1.25; letter-spacing:-0.01em; }
`
        )
    }
    if (layout === 'visa') {
        return (
            shared +
            `
  .chips { display:flex; flex-wrap:wrap; gap:18px; align-items:center; margin-top:8px; }
  .chip { font-family:'Archivo'; font-weight:500; color:${INK}; font-size:28px;
          letter-spacing:-0.01em; padding:16px 28px; border:1.5px solid ${RULE};
          border-radius:999px; background:${PAPER}; }
  .stop { display:flex; align-items:center; gap:14px; margin-left:12px;
          padding:16px 24px; }
  .stop-mark { width:14px; height:14px; border-radius:50%; background:${ACCENT};
               display:inline-block; flex-shrink:0; }
  .stop-label { font-family:'Archivo'; font-weight:600; color:${ACCENT}; font-size:26px;
                letter-spacing:-0.01em; }
`
        )
    }
    // banking
    return (
        shared +
        `
  .tiles { display:grid; grid-template-columns:repeat(3, 1fr); gap:22px; margin-top:4px;
           max-width:1000px; }
  .tile { background:#FFFFFF; border:1.5px solid ${RULE}; border-radius:10px;
          min-height:110px; padding:22px 24px; display:flex; align-items:flex-end;
          box-shadow:0 1px 0 rgba(19,19,17,0.04); }
  .tile.mismatch { transform:translate(10px, -8px) rotate(-1.5deg);
                   border-color:${ACCENT}; border-width:2px;
                   box-shadow:0 0 0 1px rgba(168,27,54,0.12); }
  .tile-label { font-family:'Archivo'; font-weight:500; color:${INK}; font-size:24px;
                letter-spacing:-0.01em; }
`
    )
}

function bodyFor(entry) {
    if (entry.layout === 'forming') return formingBody(entry)
    if (entry.layout === 'visa') return visaBody(entry)
    if (entry.layout === 'banking') return bankingBody(entry)
    throw new Error(`Unknown layout: ${entry.layout}`)
}

function htmlFor(entry, museo, archivo) {
    const css = layoutCss(entry.layout)
        .replace('__MUSEO__', museo)
        .replace('__ARCHIVO__', archivo)
    return `<!doctype html>
<html><head><meta charset="utf-8"><style>${css}</style></head>
<body>
${bodyFor(entry)}
</body></html>`
}

async function main() {
    const manifestPath = resolve(ROOT, 'scripts/blog-og-manifest.json')
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    const museo = await fontDataUri('museomoderno-900-latin.woff2')
    const archivo = await fontDataUri('archivo-variable-latin.woff2')

    await mkdir(resolve(ROOT, 'public/blog'), { recursive: true })

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    try {
        for (const entry of manifest) {
            const page = await browser.newPage()
            await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
            await page.setContent(htmlFor(entry, museo, archivo), { waitUntil: 'load' })
            await page.evaluate(() => document.fonts.ready)
            const out = resolve(ROOT, entry.out)
            await page.screenshot({ path: out, type: 'png' })
            await page.close()
            console.log(`Wrote ${entry.out} (1200x630)`)
        }
    } finally {
        await browser.close()
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
