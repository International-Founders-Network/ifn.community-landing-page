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
//
// THIS RECORD IS FOR THE LANDING PAGE SLOTS. Three of the entries below are
// landing slots and the rest are gallery frames, which appear here only because
// every built slot does. Render gallery frames from `galleryFrames` at the bottom
// of this file, NOT from here: a gallery entry's `sizes` is an approximation of
// its cell width that nothing reads, and its `avif`/`webp` srcsets carry the
// 1280 enlarged view tier, so using them in the grid makes a 2x display fetch the
// enlarged view for every cell. That is the exact failure the split shape exists
// to prevent.

export type PhotoSlot = "hero-band" | "how-it-works-middle" | "founder-story" | "gallery-apr-room" | "gallery-jul-hall" | "gallery-apr-gesture" | "gallery-apr-listening" | "gallery-feb-sign" | "gallery-jul-screen" | "gallery-feb-hall" | "gallery-jul-standing" | "gallery-apr-seated" | "gallery-feb-slide" | "gallery-apr-profile" | "gallery-apr-floor" | "gallery-apr-circle" | "gallery-feb-room" | "gallery-apr-group" | "gallery-aug-group" | "gallery-aug-audience" | "gallery-aug-room" | "gallery-aug-rows" | "gallery-aug-speaker" | "gallery-aug-listening" | "gallery-aug-standing" | "gallery-aug-address" | "gallery-aug-window-seat" | "gallery-aug-networking" | "gallery-aug-lounge" | "gallery-aug-posters" | "gallery-aug-wall" | "gallery-aug-gesture" | "gallery-aug-midroom" | "gallery-aug-lights" | "gallery-aug-pose" | "gallery-aug-skyline" | "gallery-aug-counter" | "gallery-aug-dusk" | "gallery-aug-night"

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
    alt: "A wide circle of people seated in conversation across a daylit floor, several of them turned toward the camera and one standing at the back mid gesture, with IFN meetup slides on two screens and downtown Austin through a full height glass wall.",
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
    bytesTotal: 585401,
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
    bytesTotal: 403914,
  },
  "founder-story": {
    slot: "founder-story",
    alt: "Three people standing together in an open room, the one in the middle speaking with a raised hand, two of them holding drinks, with an IFN meetup slide on the screen behind them.",
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
    bytesTotal: 394718,
  },
  "gallery-apr-room": {
    slot: "gallery-apr-room",
    alt: "A circle of people talking across a wide open floor, photographed from behind the back row, with IFN meetup slides on two screens and downtown Austin through the windows.",
    sizes: "(max-width: 639px) 100vw, 75vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-apr-room-960w.jpg",
    width: 960,
    height: 540,
    aspectRatio: "16:9",
    avif: "/photos/gallery-apr-room-960w.avif 960w, /photos/gallery-apr-room-1280w.avif 1280w",
    webp: "/photos/gallery-apr-room-960w.webp 960w, /photos/gallery-apr-room-1280w.webp 1280w",
    derivatives: [
      { width: 960, height: 540, avif: "/photos/gallery-apr-room-960w.avif", webp: "/photos/gallery-apr-room-960w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-apr-room-1280w.avif", webp: "/photos/gallery-apr-room-1280w.webp" },
    ],
    bytesTotal: 310854,
  },
  "gallery-jul-hall": {
    slot: "gallery-jul-hall",
    alt: "An empty event hall of high tables and stools before the evening starts, with national and military service flags standing either side of a large illuminated wall emblem and a projection screen at each end of the room.",
    sizes: "(max-width: 639px) 100vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-jul-hall-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-jul-hall-640w.avif 640w, /photos/gallery-jul-hall-1280w.avif 1280w",
    webp: "/photos/gallery-jul-hall-640w.webp 640w, /photos/gallery-jul-hall-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-jul-hall-640w.avif", webp: "/photos/gallery-jul-hall-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-jul-hall-1280w.avif", webp: "/photos/gallery-jul-hall-1280w.webp" },
    ],
    bytesTotal: 230844,
  },
  "gallery-apr-gesture": {
    slot: "gallery-apr-gesture",
    alt: "One person mid gesture speaking to a small seated circle, the others turned toward them, with an IFN meetup slide on the screen behind and the city through the glass.",
    sizes: "(max-width: 639px) 100vw, 58vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-apr-gesture-704w.jpg",
    width: 704,
    height: 396,
    aspectRatio: "16:9",
    avif: "/photos/gallery-apr-gesture-704w.avif 704w, /photos/gallery-apr-gesture-1280w.avif 1280w",
    webp: "/photos/gallery-apr-gesture-704w.webp 704w, /photos/gallery-apr-gesture-1280w.webp 1280w",
    derivatives: [
      { width: 704, height: 396, avif: "/photos/gallery-apr-gesture-704w.avif", webp: "/photos/gallery-apr-gesture-704w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-apr-gesture-1280w.avif", webp: "/photos/gallery-apr-gesture-1280w.webp" },
    ],
    bytesTotal: 199559,
  },
  "gallery-apr-listening": {
    slot: "gallery-apr-listening",
    alt: "A seated circle of people listening, several of them in the foreground with their backs to the camera, with the room's windows and IFN screens behind.",
    sizes: "(max-width: 639px) 100vw, 50vw",
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
    bytesTotal: 256144,
  },
  "gallery-feb-sign": {
    slot: "gallery-feb-sign",
    alt: "An IFN meetup slide lit on a wall mounted screen at night under a pendant lamp, with a second screen to the left and the slide reflected twice in the window glass over the city.",
    sizes: "(max-width: 639px) 100vw, 42vw",
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
    bytesTotal: 89301,
  },
  "gallery-jul-screen": {
    slot: "gallery-jul-screen",
    alt: "An IFN meetup slide projected on a pull down screen in a quiet corner of the room, two potted plants beside it and the ceiling lights reflected in the polished floor.",
    sizes: "(max-width: 639px) 100vw, 33vw",
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
    bytesTotal: 182760,
  },
  "gallery-feb-hall": {
    slot: "gallery-feb-hall",
    alt: "Two small groups of people talking across a large open room with rows of empty chairs around them, under a steel and ductwork ceiling, with lit IFN meetup slides on the screens and the city lights at the windows.",
    sizes: "(max-width: 639px) 100vw, 42vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-feb-hall-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-feb-hall-640w.avif 640w, /photos/gallery-feb-hall-1280w.avif 1280w",
    webp: "/photos/gallery-feb-hall-640w.webp 640w, /photos/gallery-feb-hall-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-feb-hall-640w.avif", webp: "/photos/gallery-feb-hall-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-feb-hall-1280w.avif", webp: "/photos/gallery-feb-hall-1280w.webp" },
    ],
    bytesTotal: 203332,
  },
  "gallery-jul-standing": {
    slot: "gallery-jul-standing",
    alt: "Three people standing and talking in an open room, two of them holding drinks, an IFN meetup slide on the screen behind them and another person standing further back beside the wall.",
    sizes: "(max-width: 639px) 100vw, 58vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-jul-standing-704w.jpg",
    width: 704,
    height: 396,
    aspectRatio: "16:9",
    avif: "/photos/gallery-jul-standing-704w.avif 704w, /photos/gallery-jul-standing-1280w.avif 1280w",
    webp: "/photos/gallery-jul-standing-704w.webp 704w, /photos/gallery-jul-standing-1280w.webp 1280w",
    derivatives: [
      { width: 704, height: 396, avif: "/photos/gallery-jul-standing-704w.avif", webp: "/photos/gallery-jul-standing-704w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-jul-standing-1280w.avif", webp: "/photos/gallery-jul-standing-1280w.webp" },
    ],
    bytesTotal: 176322,
  },
  "gallery-apr-seated": {
    slot: "gallery-apr-seated",
    alt: "A full circle of about fifteen people seated in conversation on an open floor, several of them turned toward the camera, with IFN meetup slides on two screens and downtown Austin through a full height glass wall.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-apr-seated-832w.jpg",
    width: 832,
    height: 468,
    aspectRatio: "16:9",
    avif: "/photos/gallery-apr-seated-832w.avif 832w, /photos/gallery-apr-seated-1280w.avif 1280w",
    webp: "/photos/gallery-apr-seated-832w.webp 832w, /photos/gallery-apr-seated-1280w.webp 1280w",
    derivatives: [
      { width: 832, height: 468, avif: "/photos/gallery-apr-seated-832w.avif", webp: "/photos/gallery-apr-seated-832w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-apr-seated-1280w.avif", webp: "/photos/gallery-apr-seated-1280w.webp" },
    ],
    bytesTotal: 305420,
  },
  "gallery-feb-slide": {
    slot: "gallery-feb-slide",
    alt: "An IFN meetup slide lit on a wall mounted screen at night, a pendant lamp above it, a red exit sign to the right and the edge of a large wall emblem at the frame's edge.",
    sizes: "(max-width: 639px) 100vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-feb-slide-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-feb-slide-640w.avif 640w, /photos/gallery-feb-slide-1280w.avif 1280w",
    webp: "/photos/gallery-feb-slide-640w.webp 640w, /photos/gallery-feb-slide-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-feb-slide-640w.avif", webp: "/photos/gallery-feb-slide-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-feb-slide-1280w.avif", webp: "/photos/gallery-feb-slide-1280w.webp" },
    ],
    bytesTotal: 89818,
  },
  "gallery-apr-profile": {
    slot: "gallery-apr-profile",
    alt: "A man in glasses seen in profile at the edge of the seated group, the back of another person's head beside him and a third person at the edge of the frame, with a large wall emblem on a dark curtain behind and an IFN meetup slide lit on a screen across the room.",
    sizes: "(max-width: 639px) 100vw, 42vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-apr-profile-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-apr-profile-640w.avif 640w, /photos/gallery-apr-profile-1280w.avif 1280w",
    webp: "/photos/gallery-apr-profile-640w.webp 640w, /photos/gallery-apr-profile-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-apr-profile-640w.avif", webp: "/photos/gallery-apr-profile-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-apr-profile-1280w.avif", webp: "/photos/gallery-apr-profile-1280w.webp" },
    ],
    bytesTotal: 156665,
  },
  "gallery-apr-floor": {
    slot: "gallery-apr-floor",
    alt: "The meetup seen from behind a laptop on a stand at the front of the room, the group seated in a circle in the distance across a wide polished concrete floor.",
    sizes: "(max-width: 639px) 100vw, 50vw",
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
    bytesTotal: 206210,
  },
  "gallery-apr-circle": {
    slot: "gallery-apr-circle",
    alt: "About a dozen people seated in a wide circle in conversation, with daylight coming through a full height glass wall behind them and an IFN meetup slide on a screen at the left.",
    sizes: "(max-width: 639px) 100vw, 50vw",
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
    bytesTotal: 214888,
  },
  "gallery-feb-room": {
    slot: "gallery-feb-room",
    alt: "Two leather armchairs set in front of a large illuminated wall emblem at night, an IFN meetup slide on a screen to each side, empty chairs across the polished floor and one person seated at the edge of the frame.",
    sizes: "(max-width: 639px) 100vw, 33vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-feb-room-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-feb-room-640w.avif 640w, /photos/gallery-feb-room-1280w.avif 1280w",
    webp: "/photos/gallery-feb-room-640w.webp 640w, /photos/gallery-feb-room-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-feb-room-640w.avif", webp: "/photos/gallery-feb-room-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-feb-room-1280w.avif", webp: "/photos/gallery-feb-room-1280w.webp" },
    ],
    bytesTotal: 143611,
  },
  "gallery-apr-group": {
    slot: "gallery-apr-group",
    alt: "A line of people standing shoulder to shoulder facing the camera in front of an IFN meetup screen at the end of the evening.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-apr-group-832w.jpg",
    width: 832,
    height: 468,
    aspectRatio: "16:9",
    avif: "/photos/gallery-apr-group-832w.avif 832w, /photos/gallery-apr-group-1280w.avif 1280w",
    webp: "/photos/gallery-apr-group-832w.webp 832w, /photos/gallery-apr-group-1280w.webp 1280w",
    derivatives: [
      { width: 832, height: 468, avif: "/photos/gallery-apr-group-832w.avif", webp: "/photos/gallery-apr-group-832w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-apr-group-1280w.avif", webp: "/photos/gallery-apr-group-1280w.webp" },
    ],
    bytesTotal: 258403,
  },
  "gallery-aug-group": {
    slot: "gallery-aug-group",
    alt: "A large group of people standing together facing the camera in an open event hall, with a thank-you slide on a screen behind them and a wall emblem on a dark curtain.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-group-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-group-640w.avif 640w, /photos/gallery-aug-group-1280w.avif 1280w",
    webp: "/photos/gallery-aug-group-640w.webp 640w, /photos/gallery-aug-group-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-group-640w.avif", webp: "/photos/gallery-aug-group-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-group-1280w.avif", webp: "/photos/gallery-aug-group-1280w.webp" },
    ],
    bytesTotal: 208096,
  },
  "gallery-aug-audience": {
    slot: "gallery-aug-audience",
    alt: "People seated in rows listening, some with laptops open on their laps, others standing along the back wall of a daylit room with framed posters.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-audience-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-audience-640w.avif 640w, /photos/gallery-aug-audience-1280w.avif 1280w",
    webp: "/photos/gallery-aug-audience-640w.webp 640w, /photos/gallery-aug-audience-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-audience-640w.avif", webp: "/photos/gallery-aug-audience-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-audience-1280w.avif", webp: "/photos/gallery-aug-audience-1280w.webp" },
    ],
    bytesTotal: 173341,
  },
  "gallery-aug-room": {
    slot: "gallery-aug-room",
    alt: "A speaker with a microphone facing a seated audience across an open floor, photographed from the back of the room, with a meetup slide on a screen and a wall emblem behind.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-room-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-room-640w.avif 640w, /photos/gallery-aug-room-1280w.avif 1280w",
    webp: "/photos/gallery-aug-room-640w.webp 640w, /photos/gallery-aug-room-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-room-640w.avif", webp: "/photos/gallery-aug-room-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-room-1280w.avif", webp: "/photos/gallery-aug-room-1280w.webp" },
    ],
    bytesTotal: 190234,
  },
  "gallery-aug-rows": {
    slot: "gallery-aug-rows",
    alt: "Rows of people seated and listening in an industrial room under hanging pendant lamps, with a few people standing along the back wall of framed posters.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-rows-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-rows-640w.avif 640w, /photos/gallery-aug-rows-1280w.avif 1280w",
    webp: "/photos/gallery-aug-rows-640w.webp 640w, /photos/gallery-aug-rows-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-rows-640w.avif", webp: "/photos/gallery-aug-rows-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-rows-1280w.avif", webp: "/photos/gallery-aug-rows-1280w.webp" },
    ],
    bytesTotal: 218915,
  },
  "gallery-aug-speaker": {
    slot: "gallery-aug-speaker",
    alt: "A person standing with a microphone mid gesture in front of a meetup agenda slide on a large screen.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-speaker-640w.jpg",
    width: 640,
    height: 1138,
    aspectRatio: "9:16",
    avif: "/photos/gallery-aug-speaker-640w.avif 640w, /photos/gallery-aug-speaker-1125w.avif 1125w",
    webp: "/photos/gallery-aug-speaker-640w.webp 640w, /photos/gallery-aug-speaker-1125w.webp 1125w",
    derivatives: [
      { width: 640, height: 1138, avif: "/photos/gallery-aug-speaker-640w.avif", webp: "/photos/gallery-aug-speaker-640w.webp" },
      { width: 1125, height: 2000, avif: "/photos/gallery-aug-speaker-1125w.avif", webp: "/photos/gallery-aug-speaker-1125w.webp" },
    ],
    bytesTotal: 247823,
  },
  "gallery-aug-listening": {
    slot: "gallery-aug-listening",
    alt: "A seated audience turned toward a speaker out of frame, one person smiling in the foreground, with others standing along the back wall beside a tall plant.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-listening-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-listening-640w.avif 640w, /photos/gallery-aug-listening-1280w.avif 1280w",
    webp: "/photos/gallery-aug-listening-640w.webp 640w, /photos/gallery-aug-listening-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-listening-640w.avif", webp: "/photos/gallery-aug-listening-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-listening-1280w.avif", webp: "/photos/gallery-aug-listening-1280w.webp" },
    ],
    bytesTotal: 231592,
  },
  "gallery-aug-standing": {
    slot: "gallery-aug-standing",
    alt: "Several people standing and seated near glass doors listening, one holding a water bottle, with framed posters on the wall beside them.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-standing-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-standing-640w.avif 640w, /photos/gallery-aug-standing-1280w.avif 1280w",
    webp: "/photos/gallery-aug-standing-640w.webp 640w, /photos/gallery-aug-standing-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-standing-640w.avif", webp: "/photos/gallery-aug-standing-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-standing-1280w.avif", webp: "/photos/gallery-aug-standing-1280w.webp" },
    ],
    bytesTotal: 144486,
  },
  "gallery-aug-address": {
    slot: "gallery-aug-address",
    alt: "A speaker seen from behind addressing a mixed seated and standing crowd across a wide open floor under industrial pendant lights.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-address-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-address-640w.avif 640w, /photos/gallery-aug-address-1280w.avif 1280w",
    webp: "/photos/gallery-aug-address-640w.webp 640w, /photos/gallery-aug-address-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-address-640w.avif", webp: "/photos/gallery-aug-address-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-address-1280w.avif", webp: "/photos/gallery-aug-address-1280w.webp" },
    ],
    bytesTotal: 205332,
  },
  "gallery-aug-window-seat": {
    slot: "gallery-aug-window-seat",
    alt: "Two people seated in chairs listening beside tall windows that look out onto a neighbouring building.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-window-seat-640w.jpg",
    width: 640,
    height: 1138,
    aspectRatio: "9:16",
    avif: "/photos/gallery-aug-window-seat-640w.avif 640w, /photos/gallery-aug-window-seat-1080w.avif 1080w",
    webp: "/photos/gallery-aug-window-seat-640w.webp 640w, /photos/gallery-aug-window-seat-1080w.webp 1080w",
    derivatives: [
      { width: 640, height: 1138, avif: "/photos/gallery-aug-window-seat-640w.avif", webp: "/photos/gallery-aug-window-seat-640w.webp" },
      { width: 1080, height: 1920, avif: "/photos/gallery-aug-window-seat-1080w.avif", webp: "/photos/gallery-aug-window-seat-1080w.webp" },
    ],
    bytesTotal: 271509,
  },
  "gallery-aug-networking": {
    slot: "gallery-aug-networking",
    alt: "Small groups of people talking across an open floor, with a QR code lit on a pillar screen and the city through the windows behind them.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-networking-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-networking-640w.avif 640w, /photos/gallery-aug-networking-1280w.avif 1280w",
    webp: "/photos/gallery-aug-networking-640w.webp 640w, /photos/gallery-aug-networking-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-networking-640w.avif", webp: "/photos/gallery-aug-networking-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-networking-1280w.avif", webp: "/photos/gallery-aug-networking-1280w.webp" },
    ],
    bytesTotal: 209251,
  },
  "gallery-aug-lounge": {
    slot: "gallery-aug-lounge",
    alt: "People standing in conversation near leather chairs and tall windows, with grey stackable chairs scattered across the polished floor.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-lounge-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-lounge-640w.avif 640w, /photos/gallery-aug-lounge-1280w.avif 1280w",
    webp: "/photos/gallery-aug-lounge-640w.webp 640w, /photos/gallery-aug-lounge-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-lounge-640w.avif", webp: "/photos/gallery-aug-lounge-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-lounge-1280w.avif", webp: "/photos/gallery-aug-lounge-1280w.webp" },
    ],
    bytesTotal: 246347,
  },
  "gallery-aug-posters": {
    slot: "gallery-aug-posters",
    alt: "Two people standing and talking in front of a wall of framed posters, one of them holding a drink.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-posters-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-posters-640w.avif 640w, /photos/gallery-aug-posters-1280w.avif 1280w",
    webp: "/photos/gallery-aug-posters-640w.webp 640w, /photos/gallery-aug-posters-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-posters-640w.avif", webp: "/photos/gallery-aug-posters-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-posters-1280w.avif", webp: "/photos/gallery-aug-posters-1280w.webp" },
    ],
    bytesTotal: 170008,
  },
  "gallery-aug-wall": {
    slot: "gallery-aug-wall",
    alt: "Two people standing with arms crossed in conversation in front of framed posters on a grey wall.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-wall-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-wall-640w.avif 640w, /photos/gallery-aug-wall-1280w.avif 1280w",
    webp: "/photos/gallery-aug-wall-640w.webp 640w, /photos/gallery-aug-wall-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-wall-640w.avif", webp: "/photos/gallery-aug-wall-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-wall-1280w.avif", webp: "/photos/gallery-aug-wall-1280w.webp" },
    ],
    bytesTotal: 118788,
  },
  "gallery-aug-gesture": {
    slot: "gallery-aug-gesture",
    alt: "Two people mid conversation in a room of hanging pendant lights, one gesturing with both hands, with other groups talking behind them.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-gesture-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-gesture-640w.avif 640w, /photos/gallery-aug-gesture-1280w.avif 1280w",
    webp: "/photos/gallery-aug-gesture-640w.webp 640w, /photos/gallery-aug-gesture-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-gesture-640w.avif", webp: "/photos/gallery-aug-gesture-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-gesture-1280w.avif", webp: "/photos/gallery-aug-gesture-1280w.webp" },
    ],
    bytesTotal: 115416,
  },
  "gallery-aug-midroom": {
    slot: "gallery-aug-midroom",
    alt: "People standing and talking under industrial pendant lights, with a tall plant and glass partitions behind them.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-midroom-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-midroom-640w.avif 640w, /photos/gallery-aug-midroom-1280w.avif 1280w",
    webp: "/photos/gallery-aug-midroom-640w.webp 640w, /photos/gallery-aug-midroom-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-midroom-640w.avif", webp: "/photos/gallery-aug-midroom-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-midroom-1280w.avif", webp: "/photos/gallery-aug-midroom-1280w.webp" },
    ],
    bytesTotal: 165559,
  },
  "gallery-aug-lights": {
    slot: "gallery-aug-lights",
    alt: "A small cluster of people talking under warm circular ceiling lights, with other attendees soft in the background.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-lights-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-lights-640w.avif 640w, /photos/gallery-aug-lights-1280w.avif 1280w",
    webp: "/photos/gallery-aug-lights-640w.webp 640w, /photos/gallery-aug-lights-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-lights-640w.avif", webp: "/photos/gallery-aug-lights-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-lights-1280w.avif", webp: "/photos/gallery-aug-lights-1280w.webp" },
    ],
    bytesTotal: 130778,
  },
  "gallery-aug-pose": {
    slot: "gallery-aug-pose",
    alt: "Two people facing the camera mid celebration in a meetup room, one seated with a laptop, others talking further back near framed posters.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-pose-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-pose-640w.avif 640w, /photos/gallery-aug-pose-1280w.avif 1280w",
    webp: "/photos/gallery-aug-pose-640w.webp 640w, /photos/gallery-aug-pose-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-pose-640w.avif", webp: "/photos/gallery-aug-pose-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-pose-1280w.avif", webp: "/photos/gallery-aug-pose-1280w.webp" },
    ],
    bytesTotal: 124445,
  },
  "gallery-aug-skyline": {
    slot: "gallery-aug-skyline",
    alt: "Small groups of people networking beside tall windows looking out onto a city skyline at dusk under hanging pendant lights.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-skyline-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-skyline-640w.avif 640w, /photos/gallery-aug-skyline-1280w.avif 1280w",
    webp: "/photos/gallery-aug-skyline-640w.webp 640w, /photos/gallery-aug-skyline-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-skyline-640w.avif", webp: "/photos/gallery-aug-skyline-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-skyline-1280w.avif", webp: "/photos/gallery-aug-skyline-1280w.webp" },
    ],
    bytesTotal: 203953,
  },
  "gallery-aug-counter": {
    slot: "gallery-aug-counter",
    alt: "Two people talking across a counter in front of framed posters, with a leafy plant beside them.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-counter-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-counter-640w.avif 640w, /photos/gallery-aug-counter-1280w.avif 1280w",
    webp: "/photos/gallery-aug-counter-640w.webp 640w, /photos/gallery-aug-counter-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-counter-640w.avif", webp: "/photos/gallery-aug-counter-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-counter-1280w.avif", webp: "/photos/gallery-aug-counter-1280w.webp" },
    ],
    bytesTotal: 161323,
  },
  "gallery-aug-dusk": {
    slot: "gallery-aug-dusk",
    alt: "A small group talking and smiling beside tall windows with a city skyline at dusk behind them.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-dusk-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-dusk-640w.avif 640w, /photos/gallery-aug-dusk-1280w.avif 1280w",
    webp: "/photos/gallery-aug-dusk-640w.webp 640w, /photos/gallery-aug-dusk-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-dusk-640w.avif", webp: "/photos/gallery-aug-dusk-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-dusk-1280w.avif", webp: "/photos/gallery-aug-dusk-1280w.webp" },
    ],
    bytesTotal: 152485,
  },
  "gallery-aug-night": {
    slot: "gallery-aug-night",
    alt: "A few people standing in conversation in a nightlit room, one wearing a name tag, with city lights visible through the windows behind them.",
    sizes: "(max-width: 639px) 100vw, 67vw",
    loading: "lazy",
    fetchPriority: "auto",
    src: "/photos/gallery-aug-night-640w.jpg",
    width: 640,
    height: 360,
    aspectRatio: "16:9",
    avif: "/photos/gallery-aug-night-640w.avif 640w, /photos/gallery-aug-night-1280w.avif 1280w",
    webp: "/photos/gallery-aug-night-640w.webp 640w, /photos/gallery-aug-night-1280w.webp 1280w",
    derivatives: [
      { width: 640, height: 360, avif: "/photos/gallery-aug-night-640w.avif", webp: "/photos/gallery-aug-night-640w.webp" },
      { width: 1280, height: 720, avif: "/photos/gallery-aug-night-1280w.avif", webp: "/photos/gallery-aug-night-1280w.webp" },
    ],
    bytesTotal: 116290,
  },
}

/**
 * THE GALLERY. ONE ORDERED LIST OF FIFTEEN FRAMES. NO DATES, NO GROUPS.
 *
 * BREAKING CHANGE, 2026-08-10. This module used to export `galleryNights:
 * GalleryNight[]`, three dated groups with a `date` and a `label` each. Both the
 * export and the `GalleryNight` type are GONE and there is deliberately no
 * compatibility shim, because a shim that wrapped these frames in a single
 * unnamed "night" would smuggle back the structure the founder removed. The
 * ruling is that grouping by evening and printing dates reads as a claim that
 * those evenings are all there have been, which is false.
 *
 * What replaces it is `galleryFrames`, in the order the composition hangs them.
 * Render them in array order. Nothing in this file carries a date, an evening
 * label or a per photo description, and nothing should be reconstructed from the
 * slot names: they are internal keys and the file names on disk, not copy.
 *
 * ALT TEXT IS NOT A CAPTION AND IT STAYS
 * --------------------------------------
 * The founder removed every visible caption and per photo description. `alt` is
 * a different object: it is never rendered to a sighted reader, and it is the
 * only route by which a screen reader user perceives that a photograph exists or
 * what is in it. Dropping it would leave fifteen images announcing nothing, which
 * is the accessibility regression REDESIGN-PLAN.md section 8 forbids. Every frame
 * below carries hand written alt. Do NOT render `alt` as visible text to
 * reintroduce captions by the back door, and do NOT set `alt=""`: these
 * photographs are the content of the route, not decoration.
 *
 * CELL SIZES VARY, SO `tile.width` VARIES
 * ---------------------------------------
 * The composition is an authored hang, not a uniform grid: cells run 389 to 906
 * CSS px. Each frame carries the tier its own cell needs, on the rule
 * tileWidth = max(cell tier, 640). Read `tile.width` and `tile.height` per
 * frame. Do not assume 640, and do not hardcode a single width anywhere.
 *
 * The 640 floor comes from the sub-640px band, where every frame renders at the
 * full 328px container measure and wants 656px at a device pixel ratio of 2.
 * 640 is 97.6 percent of that and the 16px shortfall is accepted, not cleared.
 *
 * LOADING POLICY, WHICH THIS SHAPE ENFORCES RATHER THAN SUGGESTS
 * -------------------------------------------------------------
 * `tile` and `view` are separate, and each carries exactly ONE url per format
 * rather than a srcset of every tier. A grid whose srcset offers the large tier
 * will fetch the large tier on any device with a pixel ratio of 2, which is the
 * entire gallery at several times the weight it needs. So:
 *
 *   - The grid renders `tile` ONLY. No srcset, no sizes, nothing to negotiate.
 *   - `view` is for the enlarged view and is fetched on interaction. Never put
 *     a `view` url in the grid.
 *   - Do NOT reach into `photos[frame.slot]` for a grid tile, and in particular
 *     do not use `photos[frame.slot].sizes` or `photos[frame.slot].avif`. The
 *     `sizes` string on a gallery slot is an approximation of its cell width and
 *     nothing renders from it; the srcsets there carry the 1280 view tier, so
 *     using them in the grid is exactly the failure this shape exists to stop.
 *     Everything the grid needs is on this object.
 *   - EVERY TILE BELOW THE FOLD MUST TAKE `loading="lazy"`. This is a
 *     requirement, not a suggestion, and it is the precondition on the arrival
 *     cost the build reports: all fifteen avif tiles sum to a figure the runner
 *     prints, and a visitor pays it across a full scroll of a page measured at
 *     4,294px tall. Without lazy loading they pay all of it at once.
 *
 * Intended shape at the call site:
 *
 *   <picture>
 *     <source type="image/avif" srcSet={frame.tile.avif} />
 *     <source type="image/webp" srcSet={frame.tile.webp} />
 *     <img src={frame.tile.src} width={frame.tile.width} height={frame.tile.height}
 *          alt={frame.alt} loading="lazy" decoding="async" />
 *   </picture>
 *
 * SLOT TO SOURCE, so a human can trace any frame back to its original. This is a
 * COMMENT on purpose: the filenames carry timestamps, and nothing date derived is
 * emitted as data a component could render.
 *
 *    1. gallery-apr-room         meetups/20260423_184515.jpg  (tile 960w)
 *    2. gallery-jul-hall         venue/20260723_175654.jpg  (tile 640w)
 *    3. gallery-apr-gesture      meetups/20260423_184540.jpg  (tile 704w)
 *    4. gallery-apr-listening    meetups/20260423_184527.jpg  (tile 640w)
 *    5. gallery-feb-sign         venue/20260226_184628.jpg  (tile 640w)
 *    6. gallery-jul-screen       venue/20260723_190952.jpg  (tile 640w)
 *    7. gallery-feb-hall         meetups/20260226_184622.jpg  (tile 640w)
 *    8. gallery-jul-standing     meetups/20260723_190939.jpg  (tile 704w)
 *    9. gallery-apr-seated       meetups/20260423_184523.jpg  (tile 832w)
 *   10. gallery-feb-slide        venue/20260226_184639.jpg  (tile 640w)
 *   11. gallery-apr-profile      meetups/20260423_184536.jpg  (tile 640w)
 *   12. gallery-apr-floor        meetups/20260423_184620.jpg  (tile 640w)
 *   13. gallery-apr-circle       meetups/20260423_184509.jpg  (tile 640w)
 *   14. gallery-feb-room         venue/20260226_184645.jpg  (tile 640w)
 *   15. gallery-apr-group        meetups/20260423_201820.jpg  (tile 832w)
 *   16. gallery-aug-group        meetups/20260827_202740.jpg  (tile 640w)
 *   17. gallery-aug-audience     meetups/20260827_190404.jpg  (tile 640w)
 *   18. gallery-aug-room         meetups/20260827_190429.jpg  (tile 640w)
 *   19. gallery-aug-rows         meetups/20260827_190459.jpg  (tile 640w)
 *   20. gallery-aug-speaker      meetups/20260827_190507.jpg  (tile 640w)
 *   21. gallery-aug-listening    meetups/20260827_190613.jpg  (tile 640w)
 *   22. gallery-aug-standing     meetups/20260827_190620.jpg  (tile 640w)
 *   23. gallery-aug-address      meetups/20260827_190703.jpg  (tile 640w)
 *   24. gallery-aug-window-seat  meetups/20260827_191000.jpg  (tile 640w)
 *   25. gallery-aug-networking   meetups/20260827_191238.jpg  (tile 640w)
 *   26. gallery-aug-lounge       meetups/20260827_191242.jpg  (tile 640w)
 *   27. gallery-aug-posters      meetups/20260827_191301.jpg  (tile 640w)
 *   28. gallery-aug-wall         meetups/20260827_191304.jpg  (tile 640w)
 *   29. gallery-aug-gesture      meetups/20260827_201545.jpg  (tile 640w)
 *   30. gallery-aug-midroom      meetups/20260827_201643.jpg  (tile 640w)
 *   31. gallery-aug-lights       meetups/20260827_201646.jpg  (tile 640w)
 *   32. gallery-aug-pose         meetups/20260827_201654.jpg  (tile 640w)
 *   33. gallery-aug-skyline      meetups/20260827_201705.jpg  (tile 640w)
 *   34. gallery-aug-counter      meetups/20260827_201717.jpg  (tile 640w)
 *   35. gallery-aug-dusk         meetups/20260827_201725.jpg  (tile 640w)
 *   36. gallery-aug-night        meetups/20260827_201728.jpg  (tile 640w)
 */

export type GalleryImage = {
  width: number
  height: number
  avif: string
  webp: string
}

export type GalleryFrame = {
  slot: PhotoSlot
  /** Hand written, describes the room, names no individual, no venue and no date. */
  alt: string
  /** Grid cell. ONE tier, sized to this frame's cell. Carries the jpeg fallback. */
  tile: GalleryImage & { src: string }
  /** Enlarged view. Fetched on interaction, never in the grid. */
  view: GalleryImage
}

/** Fifteen frames in composition order. Render in array order. */
export const galleryFrames: GalleryFrame[] = [
  {
    slot: "gallery-apr-room",
    alt: "A circle of people talking across a wide open floor, photographed from behind the back row, with IFN meetup slides on two screens and downtown Austin through the windows.",
    tile: { width: 960, height: 540,
      src: "/photos/gallery-apr-room-960w.jpg",
      avif: "/photos/gallery-apr-room-960w.avif",
      webp: "/photos/gallery-apr-room-960w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-apr-room-1280w.avif",
      webp: "/photos/gallery-apr-room-1280w.webp" },
  },
  {
    slot: "gallery-jul-hall",
    alt: "An empty event hall of high tables and stools before the evening starts, with national and military service flags standing either side of a large illuminated wall emblem and a projection screen at each end of the room.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-jul-hall-640w.jpg",
      avif: "/photos/gallery-jul-hall-640w.avif",
      webp: "/photos/gallery-jul-hall-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-jul-hall-1280w.avif",
      webp: "/photos/gallery-jul-hall-1280w.webp" },
  },
  {
    slot: "gallery-apr-gesture",
    alt: "One person mid gesture speaking to a small seated circle, the others turned toward them, with an IFN meetup slide on the screen behind and the city through the glass.",
    tile: { width: 704, height: 396,
      src: "/photos/gallery-apr-gesture-704w.jpg",
      avif: "/photos/gallery-apr-gesture-704w.avif",
      webp: "/photos/gallery-apr-gesture-704w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-apr-gesture-1280w.avif",
      webp: "/photos/gallery-apr-gesture-1280w.webp" },
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
  {
    slot: "gallery-feb-hall",
    alt: "Two small groups of people talking across a large open room with rows of empty chairs around them, under a steel and ductwork ceiling, with lit IFN meetup slides on the screens and the city lights at the windows.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-feb-hall-640w.jpg",
      avif: "/photos/gallery-feb-hall-640w.avif",
      webp: "/photos/gallery-feb-hall-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-feb-hall-1280w.avif",
      webp: "/photos/gallery-feb-hall-1280w.webp" },
  },
  {
    slot: "gallery-jul-standing",
    alt: "Three people standing and talking in an open room, two of them holding drinks, an IFN meetup slide on the screen behind them and another person standing further back beside the wall.",
    tile: { width: 704, height: 396,
      src: "/photos/gallery-jul-standing-704w.jpg",
      avif: "/photos/gallery-jul-standing-704w.avif",
      webp: "/photos/gallery-jul-standing-704w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-jul-standing-1280w.avif",
      webp: "/photos/gallery-jul-standing-1280w.webp" },
  },
  {
    slot: "gallery-apr-seated",
    alt: "A full circle of about fifteen people seated in conversation on an open floor, several of them turned toward the camera, with IFN meetup slides on two screens and downtown Austin through a full height glass wall.",
    tile: { width: 832, height: 468,
      src: "/photos/gallery-apr-seated-832w.jpg",
      avif: "/photos/gallery-apr-seated-832w.avif",
      webp: "/photos/gallery-apr-seated-832w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-apr-seated-1280w.avif",
      webp: "/photos/gallery-apr-seated-1280w.webp" },
  },
  {
    slot: "gallery-feb-slide",
    alt: "An IFN meetup slide lit on a wall mounted screen at night, a pendant lamp above it, a red exit sign to the right and the edge of a large wall emblem at the frame's edge.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-feb-slide-640w.jpg",
      avif: "/photos/gallery-feb-slide-640w.avif",
      webp: "/photos/gallery-feb-slide-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-feb-slide-1280w.avif",
      webp: "/photos/gallery-feb-slide-1280w.webp" },
  },
  {
    slot: "gallery-apr-profile",
    alt: "A man in glasses seen in profile at the edge of the seated group, the back of another person's head beside him and a third person at the edge of the frame, with a large wall emblem on a dark curtain behind and an IFN meetup slide lit on a screen across the room.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-apr-profile-640w.jpg",
      avif: "/photos/gallery-apr-profile-640w.avif",
      webp: "/photos/gallery-apr-profile-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-apr-profile-1280w.avif",
      webp: "/photos/gallery-apr-profile-1280w.webp" },
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
    slot: "gallery-feb-room",
    alt: "Two leather armchairs set in front of a large illuminated wall emblem at night, an IFN meetup slide on a screen to each side, empty chairs across the polished floor and one person seated at the edge of the frame.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-feb-room-640w.jpg",
      avif: "/photos/gallery-feb-room-640w.avif",
      webp: "/photos/gallery-feb-room-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-feb-room-1280w.avif",
      webp: "/photos/gallery-feb-room-1280w.webp" },
  },
  {
    slot: "gallery-apr-group",
    alt: "A line of people standing shoulder to shoulder facing the camera in front of an IFN meetup screen at the end of the evening.",
    tile: { width: 832, height: 468,
      src: "/photos/gallery-apr-group-832w.jpg",
      avif: "/photos/gallery-apr-group-832w.avif",
      webp: "/photos/gallery-apr-group-832w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-apr-group-1280w.avif",
      webp: "/photos/gallery-apr-group-1280w.webp" },
  },
  {
    slot: "gallery-aug-group",
    alt: "A large group of people standing together facing the camera in an open event hall, with a thank-you slide on a screen behind them and a wall emblem on a dark curtain.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-group-640w.jpg",
      avif: "/photos/gallery-aug-group-640w.avif",
      webp: "/photos/gallery-aug-group-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-group-1280w.avif",
      webp: "/photos/gallery-aug-group-1280w.webp" },
  },
  {
    slot: "gallery-aug-audience",
    alt: "People seated in rows listening, some with laptops open on their laps, others standing along the back wall of a daylit room with framed posters.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-audience-640w.jpg",
      avif: "/photos/gallery-aug-audience-640w.avif",
      webp: "/photos/gallery-aug-audience-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-audience-1280w.avif",
      webp: "/photos/gallery-aug-audience-1280w.webp" },
  },
  {
    slot: "gallery-aug-room",
    alt: "A speaker with a microphone facing a seated audience across an open floor, photographed from the back of the room, with a meetup slide on a screen and a wall emblem behind.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-room-640w.jpg",
      avif: "/photos/gallery-aug-room-640w.avif",
      webp: "/photos/gallery-aug-room-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-room-1280w.avif",
      webp: "/photos/gallery-aug-room-1280w.webp" },
  },
  {
    slot: "gallery-aug-rows",
    alt: "Rows of people seated and listening in an industrial room under hanging pendant lamps, with a few people standing along the back wall of framed posters.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-rows-640w.jpg",
      avif: "/photos/gallery-aug-rows-640w.avif",
      webp: "/photos/gallery-aug-rows-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-rows-1280w.avif",
      webp: "/photos/gallery-aug-rows-1280w.webp" },
  },
  {
    slot: "gallery-aug-speaker",
    alt: "A person standing with a microphone mid gesture in front of a meetup agenda slide on a large screen.",
    tile: { width: 640, height: 1138,
      src: "/photos/gallery-aug-speaker-640w.jpg",
      avif: "/photos/gallery-aug-speaker-640w.avif",
      webp: "/photos/gallery-aug-speaker-640w.webp" },
    view: { width: 1125, height: 2000,
      avif: "/photos/gallery-aug-speaker-1125w.avif",
      webp: "/photos/gallery-aug-speaker-1125w.webp" },
  },
  {
    slot: "gallery-aug-listening",
    alt: "A seated audience turned toward a speaker out of frame, one person smiling in the foreground, with others standing along the back wall beside a tall plant.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-listening-640w.jpg",
      avif: "/photos/gallery-aug-listening-640w.avif",
      webp: "/photos/gallery-aug-listening-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-listening-1280w.avif",
      webp: "/photos/gallery-aug-listening-1280w.webp" },
  },
  {
    slot: "gallery-aug-standing",
    alt: "Several people standing and seated near glass doors listening, one holding a water bottle, with framed posters on the wall beside them.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-standing-640w.jpg",
      avif: "/photos/gallery-aug-standing-640w.avif",
      webp: "/photos/gallery-aug-standing-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-standing-1280w.avif",
      webp: "/photos/gallery-aug-standing-1280w.webp" },
  },
  {
    slot: "gallery-aug-address",
    alt: "A speaker seen from behind addressing a mixed seated and standing crowd across a wide open floor under industrial pendant lights.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-address-640w.jpg",
      avif: "/photos/gallery-aug-address-640w.avif",
      webp: "/photos/gallery-aug-address-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-address-1280w.avif",
      webp: "/photos/gallery-aug-address-1280w.webp" },
  },
  {
    slot: "gallery-aug-window-seat",
    alt: "Two people seated in chairs listening beside tall windows that look out onto a neighbouring building.",
    tile: { width: 640, height: 1138,
      src: "/photos/gallery-aug-window-seat-640w.jpg",
      avif: "/photos/gallery-aug-window-seat-640w.avif",
      webp: "/photos/gallery-aug-window-seat-640w.webp" },
    view: { width: 1080, height: 1920,
      avif: "/photos/gallery-aug-window-seat-1080w.avif",
      webp: "/photos/gallery-aug-window-seat-1080w.webp" },
  },
  {
    slot: "gallery-aug-networking",
    alt: "Small groups of people talking across an open floor, with a QR code lit on a pillar screen and the city through the windows behind them.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-networking-640w.jpg",
      avif: "/photos/gallery-aug-networking-640w.avif",
      webp: "/photos/gallery-aug-networking-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-networking-1280w.avif",
      webp: "/photos/gallery-aug-networking-1280w.webp" },
  },
  {
    slot: "gallery-aug-lounge",
    alt: "People standing in conversation near leather chairs and tall windows, with grey stackable chairs scattered across the polished floor.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-lounge-640w.jpg",
      avif: "/photos/gallery-aug-lounge-640w.avif",
      webp: "/photos/gallery-aug-lounge-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-lounge-1280w.avif",
      webp: "/photos/gallery-aug-lounge-1280w.webp" },
  },
  {
    slot: "gallery-aug-posters",
    alt: "Two people standing and talking in front of a wall of framed posters, one of them holding a drink.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-posters-640w.jpg",
      avif: "/photos/gallery-aug-posters-640w.avif",
      webp: "/photos/gallery-aug-posters-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-posters-1280w.avif",
      webp: "/photos/gallery-aug-posters-1280w.webp" },
  },
  {
    slot: "gallery-aug-wall",
    alt: "Two people standing with arms crossed in conversation in front of framed posters on a grey wall.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-wall-640w.jpg",
      avif: "/photos/gallery-aug-wall-640w.avif",
      webp: "/photos/gallery-aug-wall-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-wall-1280w.avif",
      webp: "/photos/gallery-aug-wall-1280w.webp" },
  },
  {
    slot: "gallery-aug-gesture",
    alt: "Two people mid conversation in a room of hanging pendant lights, one gesturing with both hands, with other groups talking behind them.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-gesture-640w.jpg",
      avif: "/photos/gallery-aug-gesture-640w.avif",
      webp: "/photos/gallery-aug-gesture-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-gesture-1280w.avif",
      webp: "/photos/gallery-aug-gesture-1280w.webp" },
  },
  {
    slot: "gallery-aug-midroom",
    alt: "People standing and talking under industrial pendant lights, with a tall plant and glass partitions behind them.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-midroom-640w.jpg",
      avif: "/photos/gallery-aug-midroom-640w.avif",
      webp: "/photos/gallery-aug-midroom-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-midroom-1280w.avif",
      webp: "/photos/gallery-aug-midroom-1280w.webp" },
  },
  {
    slot: "gallery-aug-lights",
    alt: "A small cluster of people talking under warm circular ceiling lights, with other attendees soft in the background.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-lights-640w.jpg",
      avif: "/photos/gallery-aug-lights-640w.avif",
      webp: "/photos/gallery-aug-lights-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-lights-1280w.avif",
      webp: "/photos/gallery-aug-lights-1280w.webp" },
  },
  {
    slot: "gallery-aug-pose",
    alt: "Two people facing the camera mid celebration in a meetup room, one seated with a laptop, others talking further back near framed posters.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-pose-640w.jpg",
      avif: "/photos/gallery-aug-pose-640w.avif",
      webp: "/photos/gallery-aug-pose-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-pose-1280w.avif",
      webp: "/photos/gallery-aug-pose-1280w.webp" },
  },
  {
    slot: "gallery-aug-skyline",
    alt: "Small groups of people networking beside tall windows looking out onto a city skyline at dusk under hanging pendant lights.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-skyline-640w.jpg",
      avif: "/photos/gallery-aug-skyline-640w.avif",
      webp: "/photos/gallery-aug-skyline-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-skyline-1280w.avif",
      webp: "/photos/gallery-aug-skyline-1280w.webp" },
  },
  {
    slot: "gallery-aug-counter",
    alt: "Two people talking across a counter in front of framed posters, with a leafy plant beside them.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-counter-640w.jpg",
      avif: "/photos/gallery-aug-counter-640w.avif",
      webp: "/photos/gallery-aug-counter-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-counter-1280w.avif",
      webp: "/photos/gallery-aug-counter-1280w.webp" },
  },
  {
    slot: "gallery-aug-dusk",
    alt: "A small group talking and smiling beside tall windows with a city skyline at dusk behind them.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-dusk-640w.jpg",
      avif: "/photos/gallery-aug-dusk-640w.avif",
      webp: "/photos/gallery-aug-dusk-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-dusk-1280w.avif",
      webp: "/photos/gallery-aug-dusk-1280w.webp" },
  },
  {
    slot: "gallery-aug-night",
    alt: "A few people standing in conversation in a nightlit room, one wearing a name tag, with city lights visible through the windows behind them.",
    tile: { width: 640, height: 360,
      src: "/photos/gallery-aug-night-640w.jpg",
      avif: "/photos/gallery-aug-night-640w.avif",
      webp: "/photos/gallery-aug-night-640w.webp" },
    view: { width: 1280, height: 720,
      avif: "/photos/gallery-aug-night-1280w.avif",
      webp: "/photos/gallery-aug-night-1280w.webp" },
  },
]

/** Every avif tile summed, measured at build. A full scroll costs this much. */
export const galleryTileBytesAvif = 591830
