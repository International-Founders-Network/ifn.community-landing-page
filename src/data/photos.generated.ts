// GENERATED FILE. Do not edit by hand.
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

export type PhotoSlot = "hero-band" | "how-it-works-middle" | "founder-story" | "gallery-feb-sign" | "gallery-apr-circle" | "gallery-apr-room" | "gallery-apr-listening" | "gallery-apr-gesture" | "gallery-apr-floor" | "gallery-apr-group" | "gallery-jul-standing" | "gallery-jul-screen"

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
  "hero-band": {
    slot: "hero-band",
    alt: "A dozen founders seated in a circle in conversation, photographed from behind the back row, with an IFN meetup slide on two screens and downtown Austin through a full height glass wall.",
    sizes: "100vw",
    loading: "eager",
    fetchPriority: "auto",
    src: "/photos/hero-band-1080w.jpg",
    width: 1080,
    height: 450,
    aspectRatio: "2.4:1",
    avif: "/photos/hero-band-720w.avif 720w, /photos/hero-band-1080w.avif 1080w, /photos/hero-band-1440w.avif 1440w, /photos/hero-band-1920w.avif 1920w",
    webp: "/photos/hero-band-720w.webp 720w, /photos/hero-band-1080w.webp 1080w, /photos/hero-band-1440w.webp 1440w, /photos/hero-band-1920w.webp 1920w",
    derivatives: [
      { width: 720, height: 300, avif: "/photos/hero-band-720w.avif", webp: "/photos/hero-band-720w.webp" },
      { width: 1080, height: 450, avif: "/photos/hero-band-1080w.avif", webp: "/photos/hero-band-1080w.webp" },
      { width: 1440, height: 600, avif: "/photos/hero-band-1440w.avif", webp: "/photos/hero-band-1440w.webp" },
      { width: 1920, height: 800, avif: "/photos/hero-band-1920w.avif", webp: "/photos/hero-band-1920w.webp" },
    ],
    bytesTotal: 509526,
  },
  "how-it-works-middle": {
    slot: "how-it-works-middle",
    alt: "One founder mid gesture in a small seated circle with the others listening, an IFN meetup slide on the screen behind them and the city through the window.",
    sizes: "(max-width: 767px) 100vw, (max-width: 1279px) 45vw, 600px",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/how-it-works-middle-1024w.jpg",
    width: 1024,
    height: 819,
    aspectRatio: "1093:874",
    avif: "/photos/how-it-works-middle-640w.avif 640w, /photos/how-it-works-middle-1024w.avif 1024w, /photos/how-it-works-middle-1440w.avif 1440w",
    webp: "/photos/how-it-works-middle-640w.webp 640w, /photos/how-it-works-middle-1024w.webp 1024w, /photos/how-it-works-middle-1440w.webp 1440w",
    derivatives: [
      { width: 640, height: 512, avif: "/photos/how-it-works-middle-640w.avif", webp: "/photos/how-it-works-middle-640w.webp" },
      { width: 1024, height: 819, avif: "/photos/how-it-works-middle-1024w.avif", webp: "/photos/how-it-works-middle-1024w.webp" },
      { width: 1440, height: 1151, avif: "/photos/how-it-works-middle-1440w.avif", webp: "/photos/how-it-works-middle-1440w.webp" },
    ],
    bytesTotal: 406317,
  },
  "founder-story": {
    slot: "founder-story",
    alt: "Two small groups of people talking across a large open room with rows of empty chairs around them, under a steel and ductwork ceiling, with lit IFN meetup slides on two screens.",
    sizes: "(max-width: 1023px) 100vw, 904px",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/founder-story-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/founder-story-640w.avif 640w, /photos/founder-story-960w.avif 960w, /photos/founder-story-1280w.avif 1280w, /photos/founder-story-1920w.avif 1920w",
    webp: "/photos/founder-story-640w.webp 640w, /photos/founder-story-960w.webp 960w, /photos/founder-story-1280w.webp 1280w, /photos/founder-story-1920w.webp 1920w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/founder-story-640w.avif", webp: "/photos/founder-story-640w.webp" },
      { width: 960, height: 540, avif: "/photos/founder-story-960w.avif", webp: "/photos/founder-story-960w.webp" },
      { width: 1280, height: 720, avif: "/photos/founder-story-1280w.avif", webp: "/photos/founder-story-1280w.webp" },
      { width: 1920, height: 1080, avif: "/photos/founder-story-1920w.avif", webp: "/photos/founder-story-1920w.webp" },
    ],
    bytesTotal: 534230,
  },
  "gallery-feb-sign": {
    slot: "gallery-feb-sign",
    alt: "An IFN meetup slide lit on a wall mounted screen at night under a pendant lamp, with a second screen to the left and the slide reflected twice in the window glass over the city.",
    sizes: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-feb-sign-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-feb-sign-640w.avif 640w, /photos/gallery-feb-sign-1280w.avif 1280w",
    webp: "/photos/gallery-feb-sign-640w.webp 640w, /photos/gallery-feb-sign-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-feb-sign-640w.avif", webp: "/photos/gallery-feb-sign-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-feb-sign-1280w.avif", webp: "/photos/gallery-feb-sign-1280w.webp" },
    ],
    bytesTotal: 90482,
  },
  "gallery-apr-circle": {
    slot: "gallery-apr-circle",
    alt: "About a dozen people seated in a wide circle in conversation, with daylight coming through a full height glass wall behind them and an IFN meetup slide on a screen at the left.",
    sizes: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-apr-circle-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-apr-circle-640w.avif 640w, /photos/gallery-apr-circle-1280w.avif 1280w",
    webp: "/photos/gallery-apr-circle-640w.webp 640w, /photos/gallery-apr-circle-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-apr-circle-640w.avif", webp: "/photos/gallery-apr-circle-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-apr-circle-1280w.avif", webp: "/photos/gallery-apr-circle-1280w.webp" },
    ],
    bytesTotal: 216163,
  },
  "gallery-apr-room": {
    slot: "gallery-apr-room",
    alt: "A circle of people talking across a wide open floor, photographed from behind the back row, with an IFN meetup slide on two screens and downtown Austin through the windows.",
    sizes: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-apr-room-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-apr-room-640w.avif 640w, /photos/gallery-apr-room-1280w.avif 1280w",
    webp: "/photos/gallery-apr-room-640w.webp 640w, /photos/gallery-apr-room-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-apr-room-640w.avif", webp: "/photos/gallery-apr-room-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-apr-room-1280w.avif", webp: "/photos/gallery-apr-room-1280w.webp" },
    ],
    bytesTotal: 231230,
  },
  "gallery-apr-listening": {
    slot: "gallery-apr-listening",
    alt: "A seated circle of people listening, several of them in the foreground with their backs to the camera, with the room's windows and IFN screens behind.",
    sizes: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-apr-listening-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-apr-listening-640w.avif 640w, /photos/gallery-apr-listening-1280w.avif 1280w",
    webp: "/photos/gallery-apr-listening-640w.webp 640w, /photos/gallery-apr-listening-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-apr-listening-640w.avif", webp: "/photos/gallery-apr-listening-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-apr-listening-1280w.avif", webp: "/photos/gallery-apr-listening-1280w.webp" },
    ],
    bytesTotal: 257250,
  },
  "gallery-apr-gesture": {
    slot: "gallery-apr-gesture",
    alt: "One person mid gesture speaking to a small seated circle, the others turned toward them, with an IFN meetup slide on the screen behind and the city through the glass.",
    sizes: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-apr-gesture-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-apr-gesture-640w.avif 640w, /photos/gallery-apr-gesture-1280w.avif 1280w",
    webp: "/photos/gallery-apr-gesture-640w.webp 640w, /photos/gallery-apr-gesture-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-apr-gesture-640w.avif", webp: "/photos/gallery-apr-gesture-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-apr-gesture-1280w.avif", webp: "/photos/gallery-apr-gesture-1280w.webp" },
    ],
    bytesTotal: 188141,
  },
  "gallery-apr-floor": {
    slot: "gallery-apr-floor",
    alt: "The meetup seen from behind a laptop on a stand at the front of the room, the group seated in a circle in the distance across a wide polished concrete floor.",
    sizes: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-apr-floor-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-apr-floor-640w.avif 640w, /photos/gallery-apr-floor-1280w.avif 1280w",
    webp: "/photos/gallery-apr-floor-640w.webp 640w, /photos/gallery-apr-floor-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-apr-floor-640w.avif", webp: "/photos/gallery-apr-floor-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-apr-floor-1280w.avif", webp: "/photos/gallery-apr-floor-1280w.webp" },
    ],
    bytesTotal: 207676,
  },
  "gallery-apr-group": {
    slot: "gallery-apr-group",
    alt: "A line of people standing shoulder to shoulder facing the camera in front of an IFN meetup screen at the end of the evening.",
    sizes: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-apr-group-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-apr-group-640w.avif 640w, /photos/gallery-apr-group-1280w.avif 1280w",
    webp: "/photos/gallery-apr-group-640w.webp 640w, /photos/gallery-apr-group-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-apr-group-640w.avif", webp: "/photos/gallery-apr-group-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-apr-group-1280w.avif", webp: "/photos/gallery-apr-group-1280w.webp" },
    ],
    bytesTotal: 216983,
  },
  "gallery-jul-standing": {
    slot: "gallery-jul-standing",
    alt: "Three people standing and talking with drinks in hand in a bright open lobby, an IFN meetup slide on the screen behind them.",
    sizes: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-jul-standing-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-jul-standing-640w.avif 640w, /photos/gallery-jul-standing-1280w.avif 1280w",
    webp: "/photos/gallery-jul-standing-640w.webp 640w, /photos/gallery-jul-standing-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-jul-standing-640w.avif", webp: "/photos/gallery-jul-standing-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-jul-standing-1280w.avif", webp: "/photos/gallery-jul-standing-1280w.webp" },
    ],
    bytesTotal: 166924,
  },
  "gallery-jul-screen": {
    slot: "gallery-jul-screen",
    alt: "An IFN meetup slide projected on a pull down screen in a quiet corner of the room, two potted plants beside it and the ceiling lights reflected in the polished floor.",
    sizes: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-jul-screen-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-jul-screen-640w.avif 640w, /photos/gallery-jul-screen-1280w.avif 1280w",
    webp: "/photos/gallery-jul-screen-640w.webp 640w, /photos/gallery-jul-screen-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-jul-screen-640w.avif", webp: "/photos/gallery-jul-screen-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-jul-screen-1280w.avif", webp: "/photos/gallery-jul-screen-1280w.webp" },
    ],
    bytesTotal: 183986,
  },
}

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
 * `tile` and `view` are separate, and each carries exactly ONE url per format
 * rather than a srcset of every tier. A grid of a dozen thumbnails whose srcset
 * offers the large tier will fetch the large tier on any device with a pixel
 * ratio of 2, which is the entire gallery at roughly four times the weight it
 * needs. So:
 *
 *   - The grid renders `tile` ONLY. No srcset, no sizes, nothing to negotiate.
 *   - `view` is for the enlarged view and is fetched on interaction. Never put
 *     a `view` url in the grid.
 *   - Do NOT reach into `photos[frame.slot]` for a grid tile, and in particular
 *     do not use `photos[frame.slot].sizes`. That string describes the slot's
 *     placement on the LANDING PAGE, not its size in this grid, and the two
 *     differ: `founder-story` appears in both, and its `sizes` of
 *     "(max-width: 1023px) 100vw, 576px" against the full srcset in `photos`
 *     makes a 2x display fetch the 1280 tier for a 380px thumbnail. Everything
 *     the grid needs is on this object.
 *   - Every tile except those in the first night takes `loading="lazy"`.
 *     Give the first night's tiles `loading="lazy"` too if the gallery route
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
  {
    date: "2026-02-26",
    label: "26 February 2026",
    tileBytesAvif: 25491,
    frames: [
      {
        slot: "founder-story",
        alt: "Two small groups of people talking across a large open room with rows of empty chairs around them, under a steel and ductwork ceiling, with lit IFN meetup slides on two screens.",
        tile: { width: 640, height: 360,
          src: "/photos/founder-story-640w.jpg",
          avif: "/photos/founder-story-640w.avif",
          webp: "/photos/founder-story-640w.webp" },
        view: { width: 1280, height: 720,
          avif: "/photos/founder-story-1280w.avif",
          webp: "/photos/founder-story-1280w.webp" },
      },
      {
        slot: "gallery-feb-sign",
        alt: "An IFN meetup slide lit on a wall mounted screen at night under a pendant lamp, with a second screen to the left and the slide reflected twice in the window glass over the city.",
        tile: { width: 640, height: 360,
          src: "/photos/gallery-feb-sign-640w.jpg",
          avif: "/photos/gallery-feb-sign-640w.avif",
          webp: "/photos/gallery-feb-sign-640w.webp" },
        view: { width: 1280, height: 720,
          avif: "/photos/gallery-feb-sign-1280w.avif",
          webp: "/photos/gallery-feb-sign-1280w.webp" },
      },
    ],
  },
  {
    date: "2026-04-23",
    label: "23 April 2026",
    tileBytesAvif: 105136,
    frames: [
      {
        slot: "gallery-apr-circle",
        alt: "About a dozen people seated in a wide circle in conversation, with daylight coming through a full height glass wall behind them and an IFN meetup slide on a screen at the left.",
        tile: { width: 640, height: 360,
          src: "/photos/gallery-apr-circle-640w.jpg",
          avif: "/photos/gallery-apr-circle-640w.avif",
          webp: "/photos/gallery-apr-circle-640w.webp" },
        view: { width: 1280, height: 720,
          avif: "/photos/gallery-apr-circle-1280w.avif",
          webp: "/photos/gallery-apr-circle-1280w.webp" },
      },
      {
        slot: "gallery-apr-room",
        alt: "A circle of people talking across a wide open floor, photographed from behind the back row, with an IFN meetup slide on two screens and downtown Austin through the windows.",
        tile: { width: 640, height: 360,
          src: "/photos/gallery-apr-room-640w.jpg",
          avif: "/photos/gallery-apr-room-640w.avif",
          webp: "/photos/gallery-apr-room-640w.webp" },
        view: { width: 1280, height: 720,
          avif: "/photos/gallery-apr-room-1280w.avif",
          webp: "/photos/gallery-apr-room-1280w.webp" },
      },
      {
        slot: "gallery-apr-listening",
        alt: "A seated circle of people listening, several of them in the foreground with their backs to the camera, with the room's windows and IFN screens behind.",
        tile: { width: 640, height: 360,
          src: "/photos/gallery-apr-listening-640w.jpg",
          avif: "/photos/gallery-apr-listening-640w.avif",
          webp: "/photos/gallery-apr-listening-640w.webp" },
        view: { width: 1280, height: 720,
          avif: "/photos/gallery-apr-listening-1280w.avif",
          webp: "/photos/gallery-apr-listening-1280w.webp" },
      },
      {
        slot: "gallery-apr-gesture",
        alt: "One person mid gesture speaking to a small seated circle, the others turned toward them, with an IFN meetup slide on the screen behind and the city through the glass.",
        tile: { width: 640, height: 360,
          src: "/photos/gallery-apr-gesture-640w.jpg",
          avif: "/photos/gallery-apr-gesture-640w.avif",
          webp: "/photos/gallery-apr-gesture-640w.webp" },
        view: { width: 1280, height: 720,
          avif: "/photos/gallery-apr-gesture-1280w.avif",
          webp: "/photos/gallery-apr-gesture-1280w.webp" },
      },
      {
        slot: "gallery-apr-floor",
        alt: "The meetup seen from behind a laptop on a stand at the front of the room, the group seated in a circle in the distance across a wide polished concrete floor.",
        tile: { width: 640, height: 360,
          src: "/photos/gallery-apr-floor-640w.jpg",
          avif: "/photos/gallery-apr-floor-640w.avif",
          webp: "/photos/gallery-apr-floor-640w.webp" },
        view: { width: 1280, height: 720,
          avif: "/photos/gallery-apr-floor-1280w.avif",
          webp: "/photos/gallery-apr-floor-1280w.webp" },
      },
      {
        slot: "gallery-apr-group",
        alt: "A line of people standing shoulder to shoulder facing the camera in front of an IFN meetup screen at the end of the evening.",
        tile: { width: 640, height: 360,
          src: "/photos/gallery-apr-group-640w.jpg",
          avif: "/photos/gallery-apr-group-640w.avif",
          webp: "/photos/gallery-apr-group-640w.webp" },
        view: { width: 1280, height: 720,
          avif: "/photos/gallery-apr-group-1280w.avif",
          webp: "/photos/gallery-apr-group-1280w.webp" },
      },
    ],
  },
  {
    date: "2026-07-23",
    label: "23 July 2026",
    tileBytesAvif: 28154,
    frames: [
      {
        slot: "gallery-jul-standing",
        alt: "Three people standing and talking with drinks in hand in a bright open lobby, an IFN meetup slide on the screen behind them.",
        tile: { width: 640, height: 360,
          src: "/photos/gallery-jul-standing-640w.jpg",
          avif: "/photos/gallery-jul-standing-640w.avif",
          webp: "/photos/gallery-jul-standing-640w.webp" },
        view: { width: 1280, height: 720,
          avif: "/photos/gallery-jul-standing-1280w.avif",
          webp: "/photos/gallery-jul-standing-1280w.webp" },
      },
      {
        slot: "gallery-jul-screen",
        alt: "An IFN meetup slide projected on a pull down screen in a quiet corner of the room, two potted plants beside it and the ceiling lights reflected in the polished floor.",
        tile: { width: 640, height: 360,
          src: "/photos/gallery-jul-screen-640w.jpg",
          avif: "/photos/gallery-jul-screen-640w.avif",
          webp: "/photos/gallery-jul-screen-640w.webp" },
        view: { width: 1280, height: 720,
          avif: "/photos/gallery-jul-screen-1280w.avif",
          webp: "/photos/gallery-jul-screen-1280w.webp" },
      },
    ],
  },
]
