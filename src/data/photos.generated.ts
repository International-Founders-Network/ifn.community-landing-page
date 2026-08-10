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

export type PhotoSlot = "hero-band" | "how-it-works-middle"

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
}
