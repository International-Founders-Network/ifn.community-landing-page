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

function generateTypeScript(built, manifest) {
  const publicPath = manifest.publicPath.replace(/\/$/, '')
  const slotNames = built.map(({ slot }) => slot.name)

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
  const middle = find('how-it-works-middle', 640, 'avif')

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
  if (hero && middle) {
    const total = hero.bytes + middle.bytes
    const cap = manifest.budget.totalAt1440ViewportBytes
    const verdict = total <= cap ? 'PASS' : 'MISS'
    console.log(
      `    page total at 1440 viewport 1x  ${formatBytes(total).padStart(9)}  against ${formatBytes(cap)}   ${verdict}`,
    )
    console.log('      (hero band 1440w avif plus the middle stop 640w avif, the tiers a 1440 viewport selects)')
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
