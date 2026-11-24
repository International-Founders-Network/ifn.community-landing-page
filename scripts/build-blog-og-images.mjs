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
        ring: (cx, cy, r, fill = 'none', { accent = false } = {}) =>
            `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${accent ? ctx.accent : INK}" stroke-width="${sw}"/>`,
        dot: (cx, cy, r, accent = false) =>
            `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${accent ? ctx.accent : INK}"/>`,
        line: (x1, y1, x2, y2, { accent = false, hairline = false, width } = {}) =>
            `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${accent ? ctx.accent : hairline ? RULE : INK}" stroke-width="${width ?? (hairline ? hair : sw)}" stroke-linecap="square"/>`,
        path: (d, { accent = false, fill = 'none' } = {}) =>
            `<path d="${d}" fill="${fill}" stroke="${accent ? ctx.accent : INK}" stroke-width="${accent ? sw * 2 : sw}" stroke-linejoin="miter" stroke-linecap="square"/>`,
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
        /** Solid accent rectangle; used for a narrow band, not a stroke. */
        bar: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ctx.accent}"/>`,
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

    /** A crowded field of dots, one set just outside a dense ring. */
    'full-room'(d) {
        const pts = []
        for (let r = 0; r < 7; r++) for (let c = 0; c < 12; c++) pts.push([140 + c * 120, 150 + r * 100])
        const cx = 1120
        const cy = 480
        const ringR = 160
        const ringDots = []
        for (let i = 0; i < 16; i++) {
            const a = (i * Math.PI * 2) / 16
            ringDots.push([cx + ringR * Math.cos(a), cy + ringR * Math.sin(a)])
        }
        for (let i = 0; i < 10; i++) {
            const a = (i * Math.PI * 2) / 10 + 0.2
            ringDots.push([cx + (ringR - 55) * Math.cos(a), cy + (ringR - 55) * Math.sin(a)])
        }
        const gap = 0.18
        const isoR = ringR + 52
        const iso = [cx + isoR * Math.cos(gap), cy + isoR * Math.sin(gap)]
        const grid = pts.filter(([x, y]) => Math.hypot(x - cx, y - cy) > ringR + 80)
        const inner = [cx + (ringR + 12) * Math.cos(gap), cy + (ringR + 12) * Math.sin(gap)]
        const outer = [cx + (isoR - 20) * Math.cos(gap), cy + (isoR - 20) * Math.sin(gap)]
        return `
${d.disc(cx, cy, 280)}
${grid.map(([x, y]) => d.dot(x, y, 7)).join('')}
${ringDots.map(([x, y]) => d.dot(x, y, 10)).join('')}
${d.line(inner[0], inner[1], outer[0], outer[1], { accent: true, width: 6 })}
${d.dot(iso[0], iso[1], 12)}`
    },

    /** Two documents, a short bridge of proof: Work, Results, Reference. */
    'trust-bridge'(d) {
        const lx = 160
        const rx = 1100
        const cardW = 340
        const cardY = 200
        const cardH = 540
        const midY = 450
        const sx = lx + cardW / 2
        const sy = 390
        const steps = [
            ['Work', 560],
            ['Results', 730],
            ['Reference', 900],
        ]
        const check = (x, accent) => d.path(`M${x - 16} ${midY} L${x - 4} ${midY + 14} L${x + 18} ${midY - 16}`, { accent })
        return `
${d.disc(800, 470, 280)}
${d.rect(lx, cardY, cardW, cardH)}
${d.ring(sx, sy, 58, PAPER)}
${d.path(`M${sx} ${sy - 38} L${sx + 34} ${sy} L${sx} ${sy + 38} L${sx - 34} ${sy} Z`)}
${d.lines(lx + 36, 520, 268, 5, 40)}
${d.rect(rx, cardY, cardW, cardH)}
${d.lines(rx + 36, 300, 268, 7, 40)}
${d.text(rx + cardW / 2, cardY + cardH + 64, 'US buyer', { anchor: 'middle' })}
${d.line(lx + cardW, midY, 524, midY, { hairline: true })}
${d.line(936, midY, rx, midY, { hairline: true })}
${steps.map(([t, x], i) => `${d.ring(x, midY, 36, PAPER)}${check(x, i === 1)}${d.text(x, midY + 86, t, { size: 32, fill: MUTED, anchor: 'middle' })}`).join('')}`
    },

    /** A dimmed shopfront, and a path that splits into Close and Step back. */
    'step-back'(d) {
        const fx = 560
        const fy = 130
        const fw = 480
        const fh = 400
        const doorW = 110
        const doorH = 170
        const doorX = fx + fw / 2 - doorW / 2
        const doorY = fy + fh - doorH
        const winW = 300
        const winH = 150
        const winX = fx + (fw - winW) / 2
        const winY = fy + 50
        const splitX = fx + fw / 2
        const splitY = 680
        return `
${d.disc(800, 400, 340)}
${d.rect(fx, fy, fw, fh)}
${d.rect(winX, winY, winW, winH, { fill: MUTED })}
${d.rect(doorX, doorY, doorW, doorH)}
${d.line(splitX, fy + fh, splitX, splitY)}
${d.path(`M${splitX} ${splitY} L${splitX - 200} ${splitY + 110}`)}
${d.path(`M${splitX} ${splitY} L${splitX + 200} ${splitY + 110}`, { accent: true })}
${d.text(splitX - 200, splitY + 164, 'Close', { anchor: 'middle' })}
${d.text(splitX + 200, splitY + 164, 'Step back', { anchor: 'middle' })}`
    },

    /** Routine work slides into a chat window; one Judgment card stays. */
    'ai-clients'(d) {
        const personX = 230
        const personY = 450
        const cardW = 200
        const cardH = 140
        const jx = 360
        const jy = 380
        const trail = [
            [640, 360],
            [820, 320],
            [1000, 280],
            [1160, 250],
        ]
        const cx = 1200
        const cy = 180
        const cw = 320
        const ch = 500
        return `
${d.disc(1080, 450, 320)}
${d.ring(personX, personY, 70, PAPER)}
${d.rect(jx, jy, cardW, cardH, { accent: true })}
${d.lines(jx + 24, jy + 44, 152, 3, 28)}
${d.text(jx + cardW / 2, jy + cardH + 56, 'Judgment', { anchor: 'middle' })}
${trail.map(([x, y]) => `${d.rect(x, y, cardW, cardH)}${d.lines(x + 24, y + 44, 152, 3, 28)}`).join('')}
${d.rect(cx, cy, cw, ch)}
${d.rect(cx, cy, cw, 64, { fill: BAND })}
${d.line(cx, cy + 64, cx + cw, cy + 64)}
${d.lines(cx + 28, cy + 130, 264, 6, 48)}`
    },

    /** A cap table with one name, and an unlabeled card carrying the same weight. */
    'no-title'(d) {
        const w = 420
        const h = 520
        const y = 180
        const left = 280
        const right = 900
        const nameY = 340
        const weightY = 540
        return `
${d.disc(800, 450, 340)}
${d.rect(left, y, w, h)}
${d.rect(left + 40, nameY, 260, 48, { fill: BAND })}
${d.lines(left + 40, nameY + 100, 340, 4, 42)}
${d.line(left + 40, weightY, left + w - 40, weightY, { width: 6 })}
${d.line(left + w, 450, right, 450, { hairline: true })}
${d.rect(right, y, w, h, { accent: true })}
${d.line(right + 40, weightY, right + w - 40, weightY, { width: 6 })}`
    },

    /** A client line that steps up once; most stay, two drift, one returns. */
    'price-step'(d) {
        const y1 = 560
        const y2 = 340
        const xStart = 180
        const xStep = 700
        const xEnd = 1440
        const lower = [220, 340, 460, 580]
        const upper = [840, 1000, 1160, 1420]
        const drift = [
            [860, 460],
            [1020, 680],
        ]
        const ret = [1280, 480]
        return `
${d.disc(800, 450, 340)}
${d.line(xStart, y1, xStep, y1)}
${d.line(xStep, y1, xStep, y2, { accent: true, width: 6 })}
${d.line(xStep, y2, xEnd, y2)}
${lower.map((x) => d.dot(x, y1, 14)).join('')}
${upper.map((x) => d.dot(x, y2, 14)).join('')}
${d.path(`M760 ${y2} L${drift[0][0]} ${drift[0][1]} L${drift[1][0]} ${drift[1][1]}`)}
${drift.map(([x, y]) => d.dot(x, y, 14)).join('')}
${d.path(`M${ret[0] - 80} 640 L${ret[0]} ${ret[1]} L1420 ${y2}`)}
${d.dot(ret[0], ret[1], 14)}`
    },

    /** A signed deal, then Vendor setup, PO and Invoice, then a payment mark. */
    'getting-paid'(d) {
        const cardX = 120
        const cardY = 200
        const cardW = 340
        const cardH = 500
        const midY = 450
        const r = 40
        const steps = [
            ['Vendor setup', 620],
            ['PO', 880],
            ['Invoice', 1120],
        ]
        const payX = 1400
        const payR = 70
        const sigX = cardX + 48
        const sigY = cardY + 400
        const xs = steps.map(([, x]) => x)
        const connectors = [
            [cardX + cardW, xs[0] - r],
            [xs[0] + r, xs[1] - r],
            [xs[1] + r, xs[2] - r],
            [xs[2] + r, payX - payR],
        ]
        return `
${d.disc(900, 450, 300)}
${d.rect(cardX, cardY, cardW, cardH)}
${d.lines(cardX + 36, cardY + 80, 268, 6, 40)}
${d.path(`M${sigX} ${sigY} C${sigX + 40} ${sigY - 40}, ${sigX + 70} ${sigY + 36}, ${sigX + 120} ${sigY - 8} S${sigX + 180} ${sigY + 24}, ${sigX + 220} ${sigY}`)}
${connectors.map(([x1, x2]) => d.line(x1, midY, x2, midY)).join('')}
${steps
    .map(([t, x], i) => `${d.ring(x, midY, r, PAPER)}${i === 1 ? d.dot(x, midY, 14, true) : ''}${d.text(x, midY + 90, t, { size: 32, fill: MUTED, anchor: 'middle' })}`)
    .join('')}
${d.ring(payX, midY, payR, PAPER)}
${d.path(`M${payX - 22} ${midY} L${payX - 6} ${midY + 20} L${payX + 26} ${midY - 22}`)}`
    },

    /** Company and Family timelines meet at a house in Austin. */
    'family-year'(d) {
        const yC = 400
        const yF = 580
        const x0 = 180
        const x1 = 1100
        const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => x0 + t * (x1 - x0))
        const hx = 1220
        const hy = 280
        const hw = 200
        const hh = 300
        const roof = 70
        const family = [
            [x0, yF + 16],
            [x0 + 170, yF - 48],
            [x0 + 360, yF + 56],
            [x0 + 560, yF - 28],
            [x0 + 760, yF + 44],
            [x1, yF],
            [hx, hy + hh],
        ]
        const familyPath = family.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ')
        return `
${d.disc(1200, 450, 300)}
${d.text(x0, yC - 50, 'Company')}
${d.line(x0, yC, hx, yC)}
${ticks.map((x) => d.line(x, yC - 16, x, yC + 16)).join('')}
${d.text(x0, yF - 70, 'Family')}
${d.path(familyPath)}
${d.rect(hx, hy, hw, hh, { fill: PAPER, accent: true })}
${d.path(`M${hx} ${hy} L${hx + hw / 2} ${hy - roof} L${hx + hw} ${hy} Z`, { fill: PAPER, accent: true })}
${d.rect(hx + hw / 2 - 28, hy + hh - 80, 56, 80, { fill: PAPER, accent: true })}
${d.text(hx + hw / 2, hy + hh + 70, 'Austin', { anchor: 'middle' })}`
    },

    /** A sun arc over Austin and a moon arc over Home, briefly sharing Family call. */
    'day-night'(d) {
        const sun = { x0: 200, y0: 640, cx: 500, cy: 270, x1: 720, y1: 400 }
        const moon = { x0: 880, y0: 400, cx: 1160, cy: 270, x1: 1440, y1: 640 }
        const sunCtrl = [2 * sun.cx - 0.5 * sun.x0 - 0.5 * sun.x1, 2 * sun.cy - 0.5 * sun.y0 - 0.5 * sun.y1]
        const moonCtrl = [2 * moon.cx - 0.5 * moon.x0 - 0.5 * moon.x1, 2 * moon.cy - 0.5 * moon.y0 - 0.5 * moon.y1]
        const bandX = sun.x1
        const bandW = moon.x0 - sun.x1
        const bandY = 386
        return `
${d.disc(800, 450, 340)}
${d.path(`M${sun.x0} ${sun.y0} Q${sunCtrl[0]} ${sunCtrl[1]} ${sun.x1} ${sun.y1}`)}
${d.dot(sun.cx, sun.cy, 28)}
${d.text(sun.cx, sun.cy - 64, 'Austin', { anchor: 'middle' })}
${d.path(`M${moon.x0} ${moon.y0} Q${moonCtrl[0]} ${moonCtrl[1]} ${moon.x1} ${moon.y1}`)}
${d.ring(moon.cx, moon.cy, 28, PAPER)}
${d.text(moon.cx, moon.cy - 64, 'Home', { anchor: 'middle' })}
${d.bar(bandX, bandY, bandW, 28)}
${d.text(bandX + bandW / 2, bandY + 80, 'Family call', { size: 32, fill: MUTED, anchor: 'middle' })}`
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
