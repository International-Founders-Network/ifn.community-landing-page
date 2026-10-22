/**
 * BRANDED BLOG IMAGE SETS.
 *
 * One entry per post in scripts/blog-og-manifest.json produces that post's
 * whole set (see scripts/lib/blogImages.mjs for names and sizes):
 *   hero 1600x900 WebP + 800x450 WebP, thumbnail 640x360 WebP, OG 1200x630 PNG.
 *
 * SYSTEM. Every scene is a diagram drawn from the three parts of the Pack A
 * period mark (public/favicon.svg): a disc, an ink ring, one crimson period.
 * Scenes sit on --band with a --paper disc, ink 1px-equivalent strokes, labels
 * in Archivo, radius 0, no shadows, no gradients, no photographs, no people.
 *
 * ACCENT BUDGET (DESIGN.md: at most two marks per view, period included).
 *   hero   one crimson element; the nav wordmark period is the second mark.
 *   og     the wordmark period plus the scene's one crimson element.
 *   thumb  no crimson at all: the /blog index shows several at once, and the
 *          nav period already spends one of the two marks.
 *
 * The wordmark is the real asset (assets/brand/ifn-wordmark-light.svg, copied
 * byte for byte from the ifn-brand repo), inlined, never retyped or redrawn.
 * Never public/logo.png.
 *
 * Run all:  node scripts/build-blog-og-images.mjs
 * Run one:  node scripts/build-blog-og-images.mjs <slug> [<slug> ...]
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import sharp from 'sharp'
import { IMAGE_SIZES, imageSetPaths } from './lib/blogImages.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const PAPER = '#FBFBFA'
const BAND = '#F0F0EC'
const INK = '#131311'
const MUTED = '#5B5B55'
const RULE = '#7C7C74'
const ACCENT = '#A81B36'

const W = 1600
const H = 900

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Drawing kit. ctx.labels=false drops all text (thumbnail), ctx.accent is the
 * crimson or, for the thumbnail, ink. ctx.k scales strokes so lines stay
 * visible after downscaling.
 */
function kit(ctx) {
    const sw = 3 * ctx.k
    const hair = 2 * ctx.k
    return {
        disc: (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${PAPER}"/>`,
        ring: (cx, cy, r, fill = 'none') =>
            `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`,
        dot: (cx, cy, r, accent = false) =>
            `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${accent ? ctx.accent : INK}"/>`,
        line: (x1, y1, x2, y2, { accent = false, hairline = false, width } = {}) =>
            `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${accent ? ctx.accent : hairline ? RULE : INK}" stroke-width="${width ?? (hairline ? hair : sw)}" stroke-linecap="square"/>`,
        path: (d, { accent = false } = {}) =>
            `<path d="${d}" fill="none" stroke="${accent ? ctx.accent : INK}" stroke-width="${accent ? sw * 2 : sw}" stroke-linejoin="miter" stroke-linecap="square"/>`,
        rect: (x, y, w, h, { fill = PAPER, stroke = INK, accent = false } = {}) =>
            `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${accent ? ctx.accent : stroke}" stroke-width="${accent ? sw * 2 : sw}"/>`,
        /** Ruled lines inside a sheet: the "notes" texture, hairline grey. */
        lines: (x, y, w, n, gap = 34) =>
            Array.from({ length: n }, (_, i) =>
                `<line x1="${x}" y1="${y + i * gap}" x2="${x + (i === n - 1 ? w * 0.6 : w)}" y2="${y + i * gap}" stroke="${RULE}" stroke-width="${hair}"/>`,
            ).join(''),
        text: (x, y, s, { size = 40, weight = 500, fill = INK, anchor = 'start' } = {}) =>
            ctx.labels
                ? `<text x="${x}" y="${y}" font-family="Archivo" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${size >= 30 ? '-0.01em' : '0'}">${esc(s)}</text>`
                : '',
        accentRule: (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="${6 * Math.max(1, ctx.k * 0.75)}" fill="${ctx.accent}"/>`,
    }
}

/** Arrowhead pointing right at (x, y). */
function arrowRight(d, x, y, accent = false) {
    return d.path(`M${x - 18} ${y - 14} L${x} ${y} L${x - 18} ${y + 14}`, { accent })
}

/* ------------------------------------------------------------------ scenes */

const SCENES = {
    /** Five topics as field-note sheets leading to the monthly room. */
    'field-notes'(d) {
        const topics = ['Entity', 'Visas', 'Banking', 'Housing', 'Funding']
        const sheets = topics
            .map((t, i) => {
                const x = 150 + i * 180
                const y = 300 + (i % 2) * 60
                return `${d.rect(x, y, 150, 200)}${d.lines(x + 24, y + 60, 102, 4)}${d.text(x, y + 250, t, { size: 32 })}`
            })
            .join('')
        return `
${d.disc(560, 450, 360)}
${sheets}
${d.line(1060, 450, 1170, 450)}
${d.ring(1320, 450, 150)}
${d.dot(1460, 585, 30, true)}
${d.text(1320, 690, 'The monthly meetup', { anchor: 'middle' })}`
    },

    /** Three separate tracks that each stop at the counsel line. */
    tracks(d) {
        const tracks = ['Company paper', 'Personal status', 'Money rails']
        return `
${d.disc(470, 450, 380)}
${tracks
    .map((t, i) => {
        const y = 270 + i * 180
        return `${d.text(180, y - 30, t)}${d.line(180, y, 1120, y)}${[420, 680, 940].map((x) => d.dot(x, y, 12)).join('')}`
    })
    .join('')}
${d.line(1200, 180, 1200, 720, { hairline: true })}
${d.dot(1330, 450, 30, true)}
${d.text(1330, 530, 'Call counsel', { anchor: 'middle' })}
${d.text(1200, 770, 'Where the room stops', { size: 28, fill: MUTED, anchor: 'middle' })}`
    },

    /** Four paths the room names, then the stop line and counsel. */
    paths(d) {
        const visas = ['O-1', 'E-2', 'H-1B', 'L-1']
        return `
${d.disc(640, 470, 330)}
${d.line(140, 470, 1080, 470)}
${visas
    .map((v, i) => {
        const x = 260 + i * 240
        return `${d.ring(x, 470, 92, PAPER)}${d.text(x, 486, v, { size: 46, weight: 600, anchor: 'middle' })}`
    })
    .join('')}
${d.text(140, 260, 'Paths founders name at meetups', { size: 32, fill: MUTED })}
${d.line(1180, 300, 1180, 640)}
${d.dot(1340, 470, 30, true)}
${d.text(1340, 550, 'Immigration', { anchor: 'middle' })}
${d.text(1340, 594, 'counsel', { anchor: 'middle' })}`
    },

    /** Six documents gathered before the bank; the address sheet sits out of line. */
    'document-grid'(d) {
        const tiles = ['Formation', 'EIN', 'Ownership', 'ID', 'Address', 'Description']
        return `
${d.disc(1300, 470, 290)}
${tiles
    .map((t, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const off = t === 'Address' ? [22, -18] : [0, 0]
        const x = 170 + col * 330 + off[0]
        const y = 220 + row * 250 + off[1]
        return `${d.rect(x, y, 290, 200)}${d.text(x + 26, y + 58, t)}${t === 'Address' ? d.accentRule(x + 26, y + 80, 120) : ''}${d.lines(x + 26, y + 120, 238, 2)}`
    })
    .join('')}
${d.line(1150, 470, 1210, 470)}
${arrowRight(d, 1210, 470)}
${d.ring(1330, 470, 100)}
${d.text(1330, 630, 'Bank review', { anchor: 'middle' })}`
    },

    /** Day 1 to day 90 with three overlapping workstreams. */
    timeline(d) {
        const days = [
            ['Day 1', 200],
            ['Day 30', 600],
            ['Day 60', 1000],
            ['Day 90', 1400],
        ]
        const bars = [
            ['Housing', 200, 1000, 260],
            ['Documents', 200, 640, 400],
            ['Local ops', 460, 1400, 540],
        ]
        return `
${d.disc(1180, 300, 240)}
${bars.map(([t, x1, x2, y]) => `${d.rect(x1, y, x2 - x1, 84)}${d.text(x1 + 28, y + 55, t)}`).join('')}
${d.line(200, 720, 1400, 720)}
${days.map(([t, x]) => `${d.line(x, 700, x, 740)}${d.text(x, 800, t, { size: 30, fill: MUTED, anchor: 'middle' })}`).join('')}
${d.dot(200, 720, 24, true)}`
    },

    /** One downtown building holding the rooms, warm intros leaving it. */
    building(d) {
        const rooms = [
            ['Coworking', 410, 330],
            ['Meetups', 710, 450],
            ['Speed networking', 410, 610],
        ]
        const intros = [300, 450, 600]
        return `
${d.disc(560, 460, 390)}
${d.text(240, 150, 'One building downtown', { size: 32, fill: MUTED })}
${d.rect(240, 180, 640, 560, { fill: 'none' })}
${rooms
    .map(([t, x, y], i) => `${d.ring(x, y, 62, PAPER)}${i === 1 ? d.dot(x, y, 20, true) : ''}${d.text(x + (i === 1 ? 0 : 84), y + (i === 1 ? 108 : 12), t, { size: 32, anchor: i === 1 ? 'middle' : 'start' })}`)
    .join('')}
${intros.map((y) => `${d.line(880, 460, 1180, y)}${d.dot(1190, y, 14)}`).join('')}
${d.text(1230, 312, 'Warm intro', { size: 32 })}
${d.text(1230, 462, 'Follow up once', { size: 32 })}
${d.text(1230, 612, 'Offer one back', { size: 32 })}`
    },

    /** Three questions converge on the diligence file. */
    diligence(d) {
        const qs = [
            ['Status', 240],
            ['Team location', 450],
            ['Market narrative', 660],
        ]
        return `
${d.disc(1200, 450, 320)}
${qs
    .map(([t, y], i) => `${d.ring(260, y, 66, PAPER)}${i === 0 ? d.dot(260, y, 22, true) : ''}${d.text(360, y - 86 < 0 ? y : y - 20, t)}${d.line(360, y + 6, 640, y + 6, { hairline: true })}${d.path(`M640 ${y + 6} L940 450`)}`)
    .join('')}
${d.line(940, 450, 1000, 450)}
${d.rect(1000, 230, 380, 440)}
${d.text(1040, 300, 'US diligence')}
${d.lines(1040, 360, 300, 7)}`
    },

    /** Advisors seated around one table; two of them talking. */
    table(d) {
        const seats = [
            ['Immigration', 640, 230, 'middle', 0, -90],
            ['Corporate', 960, 230, 'middle', 0, -90],
            ['Employment', 1190, 450, 'start', 80, 12],
            ['CPA', 800, 670, 'middle', 0, 120],
            ['Home country', 410, 450, 'end', -80, 12],
        ]
        return `
${d.disc(800, 450, 340)}
${d.rect(560, 340, 480, 220, { fill: BAND })}
${d.line(960, 230, 1190, 450, { hairline: true, width: 3 })}
${d.line(1190, 450, 800, 670, { hairline: true, width: 3 })}
${seats.map(([t, x, y, a, dx, dy], i) => `${d.ring(x, y, 52, PAPER)}${i === 0 ? d.dot(x, y, 18, true) : ''}${d.text(x + dx, y + dy, t, { anchor: a })}`).join('')}`
    },

    /** Calls from abroad, three real signals, only then the trip. */
    signals(d) {
        const checks = [700, 800, 900]
        return `
${d.disc(800, 470, 250)}
${d.text(170, 190, 'Calls from abroad')}
${d.rect(170, 220, 380, 460)}
${d.lines(210, 290, 300, 9, 44)}
${d.text(1050, 190, 'Austin trip')}
${d.rect(1050, 220, 380, 460)}
${d.ring(1240, 430, 64)}
${d.dot(1240, 430, 16)}
${d.line(1240, 494, 1240, 560)}
${d.line(550, 450, 640, 450, { hairline: true })}
${checks.map((x) => `${d.ring(x, 450, 34, PAPER)}${d.path(`M${x - 14} ${450} L${x - 4} ${462} L${x + 16} ${438}`)}`).join('')}
${d.text(800, 360, 'Real signals', { anchor: 'middle' })}
${d.accentRule(680, 384, 240)}
${d.line(934, 450, 1030, 450)}
${arrowRight(d, 1040, 450)}`
    },

    /** Formation papers and the EIN letter, matched on the name line. */
    letters(d) {
        const docs = [
            ['Formation papers', 230],
            ['EIN letter', 930],
        ]
        return `
${d.disc(450, 640, 280)}
${docs
    .map(([t, x]) => `${d.text(x, 170, t)}${d.rect(x, 200, 440, 580)}${d.rect(x + 40, 300, 300, 64, { fill: BAND })}${d.text(x + 64, 343, 'Company name', { size: 30, fill: MUTED })}${d.lines(x + 40, 450, 360, 7, 40)}`)
    .join('')}
${d.line(570, 332, 970, 332, { accent: true, width: 6 })}`
    },

    /** A field of strangers, one small connected cluster near Austin. */
    cluster(d) {
        const pts = []
        for (let r = 0; r < 6; r++) for (let c = 0; c < 11; c++) pts.push([180 + c * 115, 190 + r * 105])
        const near = [
            [985, 400],
            [1100, 400],
            [1100, 505],
            [985, 610],
            [1215, 505],
            [1215, 610],
        ]
        const pin = [1100, 610]
        return `
${d.disc(1100, 505, 250)}
${pts.filter(([x, y]) => Math.hypot(x - 1100, y - 610) > 60 && Math.hypot(x - 1100, y - 770) > 70).map(([x, y]) => d.dot(x, y, 7)).join('')}
${near.map(([x, y]) => d.line(pin[0], pin[1], x, y)).join('')}
${d.line(985, 400, 1100, 400)}
${d.line(1215, 505, 1215, 610, { accent: true, width: 6 })}
${d.ring(pin[0], pin[1], 40, PAPER)}
${d.dot(pin[0], pin[1], 12)}
${d.text(pin[0], 790, 'Austin', { anchor: 'middle' })}`
    },

    /** Home and US, three questions crossing between them. */
    crossing(d) {
        const qs = [
            ['Credit', 330],
            ['Transfers', 460],
            ['Records', 590],
        ]
        return `
${d.disc(1230, 460, 300)}
${d.rect(200, 200, 340, 520)}
${d.text(370, 160, 'Home', { anchor: 'middle' })}
${d.rect(1060, 200, 340, 520)}
${d.text(1230, 160, 'US', { anchor: 'middle' })}
${qs.map(([t, y]) => `${d.line(540, y, 1060, y)}${d.text(800, y - 30, t, { anchor: 'middle' })}`).join('')}
${d.dot(800, 330, 12, true)}
${d.lines(240, 280, 260, 10, 42)}
${d.lines(1100, 280, 260, 4, 42)}`
    },

    /** A product built elsewhere, one path, three things that change. */
    branch(d) {
        const outs = [
            ['Pricing', 250],
            ['Trust', 450],
            ['Channels', 650],
        ]
        return `
${d.disc(1120, 450, 320)}
${d.rect(200, 300, 300, 300)}
${d.line(200, 360, 500, 360)}
${d.line(350, 300, 350, 360)}
${d.text(350, 660, 'Built elsewhere', { anchor: 'middle' })}
${d.line(500, 450, 820, 450)}
${outs.map(([t, y], i) => `${d.path(`M820 450 L1000 ${y}`, { accent: i === 1 })}${d.ring(1040, y, 40, PAPER)}${d.text(1110, y + 12, t)}`).join('')}`
    },
}

/* ------------------------------------------------------------- rendering */

function sceneSvg(entry, ctx, extra = '') {
    const draw = SCENES[entry.scene]
    if (!draw) throw new Error(`${entry.slug}: unknown scene "${entry.scene}"`)
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" overflow="visible" ${extra}>${draw(kit(ctx))}</svg>`
}

function fontCss(fonts) {
    return `
  @font-face { font-family:'Archivo'; font-weight:100 900; src:url('${fonts.archivo}') format('woff2'); }
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { -webkit-font-smoothing:antialiased; font-family:'Archivo', sans-serif; }`
}

function heroHtml(entry, fonts, ctx) {
    return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss(fonts)}
  body { width:${W}px; height:${H}px; background:${BAND}; overflow:hidden; }
  svg { display:block; }
</style></head><body>${sceneSvg(entry, ctx)}</body></html>`
}

function ogHtml(entry, fonts, wordmark) {
    const ctx = { labels: true, accent: ACCENT, k: 1.25 }
    return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss(fonts)}
  body { width:1200px; height:630px; background:${PAPER}; color:${INK}; display:flex; overflow:hidden; }
  .copy { width:480px; padding:60px 48px 52px 64px; display:flex; flex-direction:column; }
  .wordmark svg { height:52px; width:auto; display:block; }
  .title { margin-top:auto; font-size:58px; font-weight:500; line-height:1; letter-spacing:-0.025em; }
  .foot { margin-top:40px; padding-top:20px; border-top:1px solid ${RULE}; font-size:22px; font-weight:500; color:${MUTED}; }
  .panel { position:relative; flex:1; background:${BAND}; overflow:hidden; }
  .panel svg { position:absolute; left:50%; top:50%; width:${W}px; height:${H}px;
               transform:translate(-50%, -50%) scale(0.45); transform-origin:50% 50%; }
</style></head><body>
  <div class="copy">
    <div class="wordmark">${wordmark}</div>
    <div class="title">${entry.titleFragment.split(' ').map((w) => `<span style="white-space:nowrap">${esc(w)}</span>`).join(' ')}</div>
    <div class="foot">Peer notes from the IFN Austin room</div>
  </div>
  <div class="panel">${sceneSvg(entry, ctx)}</div>
</body></html>`
}

async function shoot(browser, html, width, height) {
    const page = await browser.newPage()
    await page.setViewport({ width, height, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    const buf = await page.screenshot({ type: 'png' })
    await page.close()
    return buf
}

function postSlugs() {
    return readdirSync(resolve(ROOT, 'content/blog'))
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, '').toLowerCase())
}

async function main() {
    const manifest = JSON.parse(await readFile(resolve(ROOT, 'scripts/blog-og-manifest.json'), 'utf8'))
    const only = process.argv.slice(2)
    for (const slug of only) {
        if (!manifest.some((e) => e.slug === slug)) {
            throw new Error(`No manifest entry for "${slug}". Add one to scripts/blog-og-manifest.json (slug, scene, titleFragment).`)
        }
    }
    const missing = postSlugs().filter((s) => !manifest.some((e) => e.slug === s))
    if (missing.length) console.warn(`No manifest entry (no images will be built) for: ${missing.join(', ')}`)

    const fonts = {
        archivo: `data:font/woff2;base64,${(await readFile(resolve(ROOT, 'public/fonts/archivo-variable-latin.woff2'))).toString('base64')}`,
    }
    const wordmark = (await readFile(resolve(ROOT, 'assets/brand/ifn-wordmark-light.svg'), 'utf8'))
        .replace(/<\?xml[^>]*\?>\s*/, '')
        .replace('<svg ', '<svg aria-hidden="true" ')

    await mkdir(resolve(ROOT, 'public/blog'), { recursive: true })
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    try {
        for (const entry of manifest) {
            if (only.length && !only.includes(entry.slug)) continue
            const paths = imageSetPaths(entry.slug)
            const out = (p) => resolve(ROOT, `public${p}`)

            const hero = await shoot(browser, heroHtml(entry, fonts, { labels: true, accent: ACCENT, k: 1 }), W, H)
            await sharp(hero).webp({ quality: 90 }).toFile(out(paths.hero))
            await sharp(hero)
                .resize(IMAGE_SIZES.hero800.width, IMAGE_SIZES.hero800.height)
                .webp({ quality: 88 })
                .toFile(out(paths.hero800))

            const thumb = await shoot(browser, heroHtml(entry, fonts, { labels: false, accent: INK, k: 2 }), W, H)
            await sharp(thumb)
                .resize(IMAGE_SIZES.thumb.width, IMAGE_SIZES.thumb.height)
                .webp({ quality: 88 })
                .toFile(out(paths.thumb))

            const og = await shoot(browser, ogHtml(entry, fonts, wordmark), 1200, 630)
            await writeFile(out(paths.og), await sharp(og).png({ compressionLevel: 9 }).toBuffer())

            console.log(`Wrote ${entry.slug}: hero 1600x900, hero 800x450, thumb 640x360, og 1200x630`)
        }
    } finally {
        await browser.close()
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
