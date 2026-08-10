#!/usr/bin/env node
/**
 * build-photos.mjs
 *
 * Reads scripts/photos.manifest.json and emits the responsive derivatives the
 * landing page ships, plus a typed manifest the components import.
 *
 * Why this exists at all: assets/photos-source/ holds 15 originals at 4000x2252
 * and 41MB total. It sits OUTSIDE public/ on purpose, because Vite copies public/
 * into dist verbatim. Nothing in this script ever publishes an original.
 *
 * Usage:
 *   node scripts/build-photos.mjs                 build the shipping slots
 *   node scripts/build-photos.mjs --include-reserve   also build reserve slots
 *   node scripts/build-photos.mjs --out-dir /tmp/x    render somewhere else (no TS manifest)
 *   node scripts/build-photos.mjs --check         validate the manifest, encode nothing
 *
 * Deliberately NOT wired into `npm run build`. Netlify builds from git with its
 * own integration; the derivatives are committed, so a deploy needs neither sharp
 * nor a re-encode. `npm run build` copies public/photos into dist unchanged.
 */

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')

// ---------------------------------------------------------------- arguments

function parseArgs(argv) {
  const args = { includeReserve: false, outDir: null, check: false, manifest: 'scripts/photos.manifest.json' }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--include-reserve') args.includeReserve = true
    else if (arg === '--check') args.check = true
    else if (arg === '--out-dir') args.outDir = argv[++i]
    else if (arg === '--manifest') args.manifest = argv[++i]
    else if (arg === '--help' || arg === '-h') { printUsage(); process.exit(0) }
    else fail(`Unknown argument: ${arg}`)
  }
  return args
}

function printUsage() {
  console.log('node scripts/build-photos.mjs [--include-reserve] [--out-dir DIR] [--manifest FILE] [--check]')
}

function fail(message) {
  console.error(`\nbuild-photos: ${message}\n`)
  process.exit(1)
}

// ---------------------------------------------------------------- validation

/**
 * Everything that can be wrong with a slot is wrong before a single pixel is
 * encoded, so it is all checked up front. An encode that runs for two minutes
 * and then reports an out of bounds crop is a worse tool than one that refuses.
 */
async function validateSlot(slot, manifest, sourceRoot) {
  const where = `slot "${slot.name}"`
  const problems = []

  for (const key of ['name', 'status', 'source', 'grade', 'crop', 'outputs', 'fallbackWidth', 'sizes', 'alt']) {
    if (slot[key] === undefined) problems.push(`${where}: missing required key "${key}"`)
  }
  if (problems.length > 0) return { problems, meta: null }

  if (!manifest.grades[slot.grade]) problems.push(`${where}: unknown grade "${slot.grade}"`)

  const sourcePath = path.join(sourceRoot, slot.source)
  let meta
  try {
    meta = await sharp(sourcePath).metadata()
  } catch {
    problems.push(`${where}: cannot read source ${slot.source}`)
    return { problems, meta: null }
  }

  // EXIF orientation other than 1 would make every crop box below mean something
  // different from what it says. Refuse rather than silently auto rotate.
  if (meta.orientation !== undefined && meta.orientation !== 1) {
    problems.push(`${where}: source EXIF orientation is ${meta.orientation}, expected 1. Crop boxes assume no rotation.`)
  }

  const { left, top, width, height } = slot.crop
  if ([left, top, width, height].some((n) => !Number.isInteger(n) || n < 0)) {
    problems.push(`${where}: crop values must be non negative integers`)
  }
  if (left + width > meta.width || top + height > meta.height) {
    problems.push(
      `${where}: crop box ${width}x${height}+${left}+${top} does not fit inside the ${meta.width}x${meta.height} source`,
    )
  }

  const cropRatio = width / height
  for (const out of slot.outputs) {
    if (!Number.isInteger(out.width) || !Number.isInteger(out.height)) {
      problems.push(`${where}: output ${JSON.stringify(out)} must carry integer width and height`)
      continue
    }
    if (out.width > manifest.hardCapLongEdge) {
      problems.push(`${where}: output width ${out.width} exceeds the global hard cap of ${manifest.hardCapLongEdge}`)
    }
    // Never upscale. A tier wider than its own crop is a manifest bug, not a
    // resampling opportunity.
    if (out.width > width || out.height > height) {
      problems.push(`${where}: output ${out.width}x${out.height} is larger than the ${width}x${height} crop`)
    }
    const drift = Math.abs(out.width / out.height - cropRatio) / cropRatio
    if (drift > 0.005) {
      problems.push(
        `${where}: output ${out.width}x${out.height} is ${(drift * 100).toFixed(2)}% off the crop ratio ` +
          `${cropRatio.toFixed(5)}. Tiers that disagree on aspect ratio shift the layout when srcset switches.`,
      )
    }
  }

  const widths = slot.outputs.map((o) => o.width)
  if (new Set(widths).size !== widths.length) problems.push(`${where}: duplicate output widths`)
  if (!widths.includes(slot.fallbackWidth)) {
    problems.push(`${where}: fallbackWidth ${slot.fallbackWidth} is not one of the output widths`)
  }

  // A slot may additionally appear in the gallery. The grouping is DATA, not
  // layout: which night a frame belongs to is a fact about the photograph, so it
  // is declared here and emitted, rather than left for a component to hardcode.
  if (slot.gallery !== undefined) {
    const g = slot.gallery
    const nights = manifest.galleryNights ?? []
    if (!nights.some((night) => night.date === g.night)) {
      problems.push(`${where}: gallery.night "${g.night}" is not declared in the top level galleryNights list`)
    }
    // The two widths are separated on purpose and the separation is the whole
    // loading strategy. tileWidth is the ONLY tier the grid ever names, so a
    // high density phone cannot pull the large view into a grid of twelve
    // thumbnails; viewWidth is fetched on interaction and never before.
    for (const key of ['tileWidth', 'viewWidth']) {
      if (!widths.includes(g[key])) {
        problems.push(`${where}: gallery.${key} ${g[key]} is not one of the output widths`)
      }
    }
    if (g.tileWidth >= g.viewWidth) {
      problems.push(`${where}: gallery.tileWidth ${g.tileWidth} must be smaller than gallery.viewWidth ${g.viewWidth}`)
    }
    if (g.tileWidth !== slot.fallbackWidth) {
      problems.push(
        `${where}: gallery.tileWidth ${g.tileWidth} must equal fallbackWidth ${slot.fallbackWidth}, ` +
          `because the jpeg is written at the fallback tier only and the tile is the element that needs it.`,
      )
    }
  }

  // The tree is at zero em dash and en dash characters and stays there. Alt text
  // is visible to assistive technology, so it is held to the same rule. The two
  // characters are written as escapes on purpose: a literal pair here would make
  // this file the thing the repo wide grep finds.
  const DASH_BAN = /[\u2013\u2014]/
  for (const [key, value] of Object.entries({ alt: slot.alt, name: slot.name })) {
    if (DASH_BAN.test(value)) problems.push(`${where}: ${key} contains an em dash or en dash`)
  }
  if (!/^[a-z0-9-]+$/.test(slot.name)) problems.push(`${where}: name must be lowercase kebab case`)

  return { problems, meta }
}

// ---------------------------------------------------------------- encoding

/**
 * The grade, baked in at build so it costs nothing at runtime.
 *
 * linear(a, b) computes out = a * in + b per channel. Mapping the full input
 * range onto [blackPoint, whitePoint] gives a = white - black and b = black*255,
 * and the per channel white balance multiplier rides on a. At the manifest's
 * 0.04 and 0.92 that is out = 0.88 * in + 10.2, so 0 lands on 10.2 and 255 on
 * 234.6: black lifted 4 percent, white pulled to 92 percent.
 *
 * White balance and the levels move are folded into that ONE call on purpose.
 * The obvious spelling, .linear(wb, 0) followed by .linear(span, black*255), is
 * a trap: sharp stores linear as a single pair of options, so the second call
 * overwrites the first and the white balance vanishes with no warning. Measured
 * on the February reserve frame, the two call form is byte identical to applying
 * no white balance at all. Folding is also the more accurate of the two, because
 * it clamps once instead of twice.
 *
 * Folded, the correction is multiplicative (von Kries), so it acts across the
 * whole range and not only in the highlights: at input 30 the February grade
 * lands on 37.23 red, 36.60 green, 34.33 blue, which is the blue cast coming out
 * of the shadows. Only an input of exactly 0 stays neutral, which is correct.
 */
function applyGrade(pipeline, grade) {
  const span = grade.whitePoint - grade.blackPoint
  const a = grade.whiteBalance.map((multiplier) => multiplier * span)
  const b = [0, 1, 2].map(() => grade.blackPoint * 255)
  return pipeline.modulate({ saturation: grade.saturation }).linear(a, b)
}

function encoder(pipeline, format, encode) {
  if (format === 'avif') return pipeline.avif(encode.avif)
  if (format === 'webp') return pipeline.webp(encode.webp)
  if (format === 'jpeg') return pipeline.jpeg(encode.jpeg)
  throw new Error(`unsupported format ${format}`)
}

const EXTENSION = { avif: 'avif', webp: 'webp', jpeg: 'jpg' }

async function buildSlot(slot, manifest, { sourceRoot, outDir }) {
  const grade = manifest.grades[slot.grade]
  const sourcePath = path.join(sourceRoot, slot.source)
  const files = []

  for (const out of slot.outputs) {
    // avif and webp at every tier. jpeg at exactly one tier: the task asks for a
    // fallback, and REDESIGN-PLAN.md section 7 refuses a third full ladder
    // because it "roughly doubles repository weight for nothing". One file is
    // the fallback; a parallel ladder is the tier the plan bans.
    const formats = out.width === slot.fallbackWidth ? ['avif', 'webp', 'jpeg'] : ['avif', 'webp']

    for (const format of formats) {
      const file = `${slot.name}-${out.width}w.${EXTENSION[format]}`
      const target = path.join(outDir, file)

      // extract at source resolution, then resize. Cropping after the downscale
      // would throw away resolution the crop box was chosen against.
      const pipeline = applyGrade(
        sharp(sourcePath, { failOn: 'error' }).extract(slot.crop),
        grade,
      ).resize(out.width, out.height, { fit: 'fill', kernel: 'lanczos3' })

      await encoder(pipeline, format, manifest.encode).toFile(target)

      const { size } = await stat(target)
      files.push({ slot: slot.name, file, format, width: out.width, height: out.height, bytes: size })
    }
  }

  // Consent to appear in marketing material is not consent to publish GPS
  // coordinates. sharp strips metadata unless asked otherwise; verify rather
  // than trust, because the failure is silent and irreversible once deployed.
  for (const record of files) {
    const meta = await sharp(path.join(outDir, record.file)).metadata()
    if (meta.exif || meta.xmp || meta.iptc) {
      fail(`${record.file} still carries embedded metadata (exif/xmp/iptc). Refusing to ship it.`)
    }
  }

  return files
}

// ---------------------------------------------------------------- TS manifest

function tsString(value) {
  return JSON.stringify(value)
}

/**
 * The gallery, emitted as grouped data.
 *
 * Three dated evenings is the one piece of evidence for recurrence that this
 * page can actually show, and it only reads as evidence if the frames stay
 * grouped by the night they were taken on. Emitting a flat map and asking a
 * component to hardcode the grouping would move a fact about the photographs
 * into a layout file, where the next edit silently breaks it.
 *
 * `tile` and `view` are separate objects carrying ONE url each rather than one
 * srcset carrying every tier. That is deliberate and it is the loading policy:
 * a twelve tile grid whose srcset offers a 1280 tier will fetch 1280 on any
 * phone with a device pixel ratio of 2, which is the whole gallery at four
 * times the necessary weight. The grid can only name `tile`; `view` exists for
 * the enlarged view and is fetched on interaction.
 */
function generateGallery(built, manifest, publicPath) {
  const nights = manifest.galleryNights ?? []
  if (nights.length === 0) return null

  const groups = nights.map((night) => {
    const frames = built
      .filter(({ slot }) => slot.gallery?.night === night.date)
      .map(({ slot, files }) => {
        const tier = (width) => slot.outputs.find((out) => out.width === width)
        const tile = tier(slot.gallery.tileWidth)
        const view = tier(slot.gallery.viewWidth)
        const bytes = (width, format) =>
          files.find((file) => file.width === width && file.format === format)?.bytes ?? 0
        return {
          slot: slot.name,
          alt: slot.alt,
          tile,
          view,
          tileBytesAvif: bytes(tile.width, 'avif'),
          bytesTotal: files.reduce((sum, file) => sum + file.bytes, 0),
        }
      })
    return { ...night, frames }
  })

  const rendered = groups
    .filter((group) => group.frames.length > 0)
    .map((group) => {
      const url = (name, width, ext) => tsString(`${publicPath}/${name}-${width}w.${ext}`)
      const frames = group.frames.map((frame) =>
        [
          `      {`,
          `        slot: ${tsString(frame.slot)},`,
          `        alt: ${tsString(frame.alt)},`,
          `        tile: { width: ${frame.tile.width}, height: ${frame.tile.height},`,
          `          src: ${url(frame.slot, frame.tile.width, 'jpg')},`,
          `          avif: ${url(frame.slot, frame.tile.width, 'avif')},`,
          `          webp: ${url(frame.slot, frame.tile.width, 'webp')} },`,
          `        view: { width: ${frame.view.width}, height: ${frame.view.height},`,
          `          avif: ${url(frame.slot, frame.view.width, 'avif')},`,
          `          webp: ${url(frame.slot, frame.view.width, 'webp')} },`,
          `      },`,
        ].join('\n'),
      )
      return [
        `  {`,
        `    date: ${tsString(group.date)},`,
        `    label: ${tsString(group.label)},`,
        `    tileBytesAvif: ${group.frames.reduce((sum, frame) => sum + frame.tileBytesAvif, 0)},`,
        `    frames: [`,
        ...frames,
        `    ],`,
        `  },`,
      ].join('\n')
    })

  return { groups, source: rendered.join('\n') }
}

function generateTypeScript(built, manifest) {
  const publicPath = manifest.publicPath.replace(/\/$/, '')
  const slotNames = built.map(({ slot }) => slot.name)
  const gallery = generateGallery(built, manifest, publicPath)

  const entries = built.map(({ slot, files }) => {
    const byWidth = slot.outputs.map((out) => ({
      width: out.width,
      height: out.height,
      avif: `${publicPath}/${slot.name}-${out.width}w.avif`,
      webp: `${publicPath}/${slot.name}-${out.width}w.webp`,
    }))
    const fallback = slot.outputs.find((out) => out.width === slot.fallbackWidth)
    const srcset = (format) =>
      byWidth.map((tier) => `${tier[format]} ${tier.width}w`).join(', ')
    const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0)

    return [
      `  ${tsString(slot.name)}: {`,
      `    slot: ${tsString(slot.name)},`,
      `    alt: ${tsString(slot.alt)},`,
      `    sizes: ${tsString(slot.sizes)},`,
      `    loading: ${tsString(slot.loading ?? 'lazy')},`,
      `    fetchPriority: ${tsString(slot.fetchPriority ?? 'auto')},`,
      `    src: ${tsString(`${publicPath}/${slot.name}-${slot.fallbackWidth}w.jpg`)},`,
      `    width: ${fallback.width},`,
      `    height: ${fallback.height},`,
      `    aspectRatio: ${tsString(slot.aspectRatio)},`,
      `    avif: ${tsString(srcset('avif'))},`,
      `    webp: ${tsString(srcset('webp'))},`,
      `    derivatives: [`,
      ...byWidth.map(
        (tier) =>
          `      { width: ${tier.width}, height: ${tier.height}, avif: ${tsString(tier.avif)}, webp: ${tsString(tier.webp)} },`,
      ),
      `    ],`,
      `    bytesTotal: ${totalBytes},`,
      `  },`,
    ].join('\n')
  })

  return `// GENERATED FILE. Do not edit by hand.
// Written by scripts/build-photos.mjs from scripts/photos.manifest.json.
// Regenerate with: npm run photos
//
// Every entry carries explicit width and height so each <img> can reserve its
// box and CLS stays at zero. Intended shape at the call site:
//
//   <picture>
//     <source type="image/avif" srcSet={photo.avif} sizes={photo.sizes} />
//     <source type="image/webp" srcSet={photo.webp} sizes={photo.sizes} />
//     <img src={photo.src} width={photo.width} height={photo.height}
//          alt={photo.alt} loading={photo.loading} decoding="async" />
//   </picture>
//
// width and height are the intrinsic dimensions of the fallback tier. Every tier
// shares one aspect ratio (the build refuses more than 0.5 percent drift), so the
// reserved box is correct whichever tier srcset picks.

export type PhotoSlot = ${slotNames.map(tsString).join(' | ')}

export type PhotoDerivative = {
  width: number
  height: number
  avif: string
  webp: string
}

export type Photo = {
  slot: PhotoSlot
  /** Hand written, describes the room, names no individual and no venue. */
  alt: string
  sizes: string
  loading: 'eager' | 'lazy'
  fetchPriority: 'high' | 'low' | 'auto'
  /** jpeg fallback, one tier only, for the <img> inside <picture>. */
  src: string
  width: number
  height: number
  aspectRatio: string
  /** srcset for the avif <source>. */
  avif: string
  /** srcset for the webp <source>. */
  webp: string
  derivatives: PhotoDerivative[]
  /** Total bytes of every derivative in this slot, measured at build. */
  bytesTotal: number
}

export const photos: Record<PhotoSlot, Photo> = {
${entries.join('\n')}
}
${gallery ? galleryTypeScript(gallery) : ''}`
}

function galleryTypeScript(gallery) {
  return `
/**
 * THE GALLERY, GROUPED BY THE EVENING EACH FRAME WAS TAKEN ON.
 *
 * Nights are in chronological order and frames are in the order the manifest
 * declares them. The grouping is data rather than layout on purpose: three
 * separately dated evenings is the only evidence of recurrence this site owns
 * that is not a sentence of copy, and it only reads as evidence while the
 * frames stay attached to their date.
 *
 * LOADING POLICY, WHICH THIS SHAPE ENFORCES RATHER THAN SUGGESTS
 * -------------------------------------------------------------
 * \`tile\` and \`view\` are separate, and each carries exactly ONE url per format
 * rather than a srcset of every tier. A grid of a dozen thumbnails whose srcset
 * offers the large tier will fetch the large tier on any device with a pixel
 * ratio of 2, which is the entire gallery at roughly four times the weight it
 * needs. So:
 *
 *   - The grid renders \`tile\` ONLY. No srcset, no sizes, nothing to negotiate.
 *   - \`view\` is for the enlarged view and is fetched on interaction. Never put
 *     a \`view\` url in the grid.
 *   - Do NOT reach into \`photos[frame.slot]\` for a grid tile, and in particular
 *     do not use \`photos[frame.slot].sizes\`. That string describes the slot's
 *     placement on the LANDING PAGE, not its size in this grid, and the two
 *     differ: \`founder-story\` appears in both, and its \`sizes\` of
 *     "(max-width: 1023px) 100vw, 576px" against the full srcset in \`photos\`
 *     makes a 2x display fetch the 1280 tier for a 380px thumbnail. Everything
 *     the grid needs is on this object.
 *   - Every tile except those in the first night takes \`loading="lazy"\`.
 *     Give the first night's tiles \`loading="lazy"\` too if the gallery route
 *     opens scrolled to the top of a heading rather than to the grid.
 *
 * Intended shape at the call site:
 *
 *   <picture>
 *     <source type="image/avif" srcSet={frame.tile.avif} />
 *     <source type="image/webp" srcSet={frame.tile.webp} />
 *     <img src={frame.tile.src} width={frame.tile.width} height={frame.tile.height}
 *          alt={frame.alt} loading="lazy" decoding="async" />
 *   </picture>
 */

export type GalleryImage = {
  width: number
  height: number
  avif: string
  webp: string
}

export type GalleryFrame = {
  slot: PhotoSlot
  /** Hand written, describes the room, names no individual and no venue. */
  alt: string
  /** Grid thumbnail. One tier. Carries the jpeg fallback for the <img>. */
  tile: GalleryImage & { src: string }
  /** Enlarged view. Fetched on interaction, never in the grid. */
  view: GalleryImage
}

export type GalleryNight = {
  /** ISO date of the evening these frames were taken on. */
  date: string
  /** Human label for the group heading. */
  label: string
  frames: GalleryFrame[]
  /** Bytes of this night's avif tiles, measured at build. */
  tileBytesAvif: number
}

export const galleryNights: GalleryNight[] = [
${gallery.source}
]
`
}

// ---------------------------------------------------------------- reporting

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

function report(built, manifest, args) {
  console.log('')
  console.log('  slot                          file                                   format   bytes')
  console.log('  ' + '-'.repeat(88))
  let grandTotal = 0
  for (const { slot, files } of built) {
    for (const file of files) {
      grandTotal += file.bytes
      console.log(
        '  ' +
          slot.name.padEnd(30) +
          file.file.padEnd(39) +
          file.format.padEnd(9) +
          formatBytes(file.bytes).padStart(9),
      )
    }
    const slotTotal = files.reduce((sum, file) => sum + file.bytes, 0)
    console.log('  ' + ''.padEnd(30) + `slot total`.padEnd(48) + formatBytes(slotTotal).padStart(9))
  }
  console.log('  ' + '-'.repeat(88))
  console.log('  ' + 'all derivatives on disk'.padEnd(78) + formatBytes(grandTotal).padStart(9))

  if (args.outDir) return

  // The two budget lines from REDESIGN-PLAN.md section 7, measured rather than
  // estimated. A miss is printed as the real number, not as the estimate.
  const find = (slotName, width, format) =>
    built
      .find(({ slot }) => slot.name === slotName)
      ?.files.find((file) => file.width === width && file.format === format)

  const hero = find('hero-band', 1440, 'avif')

  console.log('')
  console.log('  budget, measured')
  if (hero) {
    const cap = manifest.budget.heroAt1440AvifBytes
    const verdict = hero.bytes <= cap ? 'PASS' : 'MISS'
    console.log(
      `    hero band, 1440w avif           ${formatBytes(hero.bytes).padStart(9)}  against ${formatBytes(cap)}   ${verdict}` +
        (hero.bytes > cap ? `  (over by ${formatBytes(hero.bytes - cap)})` : ''),
    )
  }

  // Every photographic slot on the landing route is summed here, and the LIST
  // IS DATA rather than JavaScript. The previous version carried a comment
  // saying exactly this while still naming three slots by hand, and it went
  // stale twice in one round: once when `founder-story` arrived and once when
  // that slot's placement widened from 576 to 904 CSS px and moved the tier a
  // 1440 viewport selects from 640 to 960. A stale list here fails by printing
  // PASS on a short total, so a missing manifest row is reported as MISSING and
  // the whole line is suppressed rather than quietly summed without it.
  const landing = manifest.budget.landingAt1440 ?? []
  const resolved = landing.map((row) => ({ row, file: find(row.slot, row.width, 'avif') }))
  const missing = resolved.filter(({ file }) => !file)
  if (missing.length > 0) {
    console.log(
      `    page total at 1440 viewport 1x  MISSING  (no avif built for ${missing
        .map(({ row }) => `${row.slot} @ ${row.width}w`)
        .join(', ')})`,
    )
  } else if (resolved.length > 0) {
    const total = resolved.reduce((sum, { file }) => sum + file.bytes, 0)
    const cap = manifest.budget.totalAt1440ViewportBytes
    const verdict = total <= cap ? 'PASS' : 'MISS'
    console.log(
      `    page total at 1440 viewport 1x  ${formatBytes(total).padStart(9)}  against ${formatBytes(cap)}   ${verdict}`,
    )
    for (const { row, file } of resolved) {
      console.log(`      ${`${row.slot} ${row.width}w`.padEnd(34)}${formatBytes(file.bytes).padStart(9)}   ${row.why}`)
    }
  }

  // The gallery is a separate route, so it is a separate budget. What a visitor
  // pays on arrival is the avif tiles and nothing else: the enlarged views are
  // fetched on interaction and most visitors never open one.
  const galleryBuilt = built.filter(({ slot }) => slot.gallery !== undefined)
  if (galleryBuilt.length > 0) {
    const nights = manifest.galleryNights ?? []
    console.log('')
    console.log('  gallery route, measured per night')
    let tileTotal = 0
    let diskTotal = 0
    for (const night of nights) {
      const frames = galleryBuilt.filter(({ slot }) => slot.gallery.night === night.date)
      if (frames.length === 0) continue
      const tiles = frames.reduce(
        (sum, { slot, files }) =>
          sum + (files.find((f) => f.width === slot.gallery.tileWidth && f.format === 'avif')?.bytes ?? 0),
        0,
      )
      const disk = frames.reduce((sum, { files }) => sum + files.reduce((s, f) => s + f.bytes, 0), 0)
      tileTotal += tiles
      diskTotal += disk
      console.log(
        `    ${night.date}  ${String(frames.length).padStart(2)} frames   tiles avif ${formatBytes(tiles).padStart(9)}` +
          `   all derivatives on disk ${formatBytes(disk).padStart(9)}`,
      )
    }
    const cap = manifest.budget.galleryTilesAvifBytes
    if (cap !== undefined) {
      const verdict = tileTotal <= cap ? 'PASS' : 'MISS'
      console.log(
        `    gallery grid, first paint       ${formatBytes(tileTotal).padStart(9)}  against ${formatBytes(cap)}   ${verdict}`,
      )
      console.log('      (every avif tile in the grid. Enlarged views are excluded: they load on interaction.)')
    }
    console.log(`    gallery derivatives on disk     ${formatBytes(diskTotal).padStart(9)}`)
  }
  console.log('')
}

// ---------------------------------------------------------------- main

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const manifest = JSON.parse(await readFile(path.join(repoRoot, args.manifest), 'utf8'))

  const sourceRoot = path.join(repoRoot, manifest.sourceRoot)
  const outDir = args.outDir ? path.resolve(repoRoot, args.outDir) : path.join(repoRoot, manifest.outDir)

  const selected = manifest.slots.filter(
    (slot) => slot.status === 'ship' || (args.includeReserve && slot.status === 'reserve'),
  )
  if (selected.length === 0) fail('no slots selected. Every slot is reserve and --include-reserve was not passed.')

  const problems = []
  for (const slot of manifest.slots) {
    const result = await validateSlot(slot, manifest, sourceRoot)
    problems.push(...result.problems)
  }
  if (problems.length > 0) {
    console.error('\nbuild-photos: manifest is invalid.\n')
    for (const problem of problems) console.error(`  - ${problem}`)
    console.error('')
    process.exit(1)
  }

  console.log(`build-photos: manifest valid, ${manifest.slots.length} slots declared, ${selected.length} selected.`)
  if (args.check) {
    console.log('build-photos: --check, nothing encoded.')
    return
  }

  await mkdir(outDir, { recursive: true })

  const built = []
  for (const slot of selected) {
    process.stdout.write(`build-photos: encoding ${slot.name} from ${slot.source} ... `)
    const files = await buildSlot(slot, manifest, { sourceRoot, outDir })
    built.push({ slot, files })
    console.log(`${files.length} files`)
  }

  if (!args.outDir) {
    const target = path.join(repoRoot, manifest.generatedManifest)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, generateTypeScript(built, manifest), 'utf8')
    console.log(`build-photos: wrote ${manifest.generatedManifest}`)
  } else {
    console.log('build-photos: --out-dir given, skipping the generated TypeScript manifest.')
  }

  report(built, manifest, args)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
