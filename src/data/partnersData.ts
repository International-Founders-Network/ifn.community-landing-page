/**
 * PARTNER ARTWORK IS DATA, NOT A SWITCH STATEMENT.
 *
 * Before this file carried a `logo` field, both partner surfaces decided which
 * mark to draw by testing `partner.id` against a hardcoded string. Adding real
 * artwork meant editing two components. Now it means dropping a file into
 * `public/partners/` and adding one `logo` key here, and both surfaces pick it
 * up with zero component edits.
 *
 * WHAT THE FOUNDER SUPPLIES, per partner:
 *
 *   1. The file, into `public/partners/`. Single-colour SVG on a transparent
 *      background is the preferred form: one file then works in both light and
 *      dark mode because it can be tinted by the page. If the brand requires
 *      full colour, supply artwork that carries its own ground (the Yani
 *      Partners emblem below is that case) or two files, one per mode.
 *   2. One `logo` key on this partner's entry, holding four values:
 *        src    the public path, e.g. '/partners/reuneo-logo.svg'
 *        width  the artwork's intrinsic pixel width
 *        height the artwork's intrinsic pixel height
 *        form   'lockup' for a horizontal wordmark, 'emblem' for a square or
 *               round mark
 *
 * `width` and `height` are the artwork's real intrinsic dimensions, not the
 * rendered size. They exist only to fix the aspect ratio so the image reserves
 * its box before it loads (REDESIGN-PLAN section 11 commits to explicit width
 * and height on every image for CLS). The rendered size comes from CSS in each
 * surface, so the same file reads correctly at the 64px baseline on the home
 * page and inside the 56px well on /partners.
 *
 * TARGET RENDERED DIMENSIONS, so artwork can be drawn to fit rather than
 * discovered to fit:
 *   'lockup'  reads at 56px optical height inside a 192 x 56 CSS px box on the
 *             home page, and inside a 56px square well on /partners.
 *   'emblem'  reads at 64px square on the home page, 40px square on /partners.
 *             A round mark reads optically smaller than a horizontal lockup at
 *             the same pixel height, which is why the emblem number is larger.
 *
 * WHY `form` IS SET BY HAND RATHER THAN DERIVED FROM THE RATIO. A wordmark
 * exported with a square viewBox and the lockup centred inside it is common,
 * and any rule that infers shape from width over height would size that file
 * as an emblem and ship it microscopic. The artwork below already shows the
 * same decoupling from the other side: the file is 2000 x 2000 but the opaque
 * artwork occupies a centred 1420 x 1420 box, so 29% of the file is padding and
 * the file's dimensions are not the mark's optical size.
 *
 * A partner with no `logo` key is not an error and is not a gap to paper over.
 * Both surfaces render a labelled reserved slot at the correct dimensions.
 * Do NOT fill the gap by hotlinking a favicon (that sends every visitor's IP to
 * a third party, which is the defect this field was added to remove) and do NOT
 * fill it with a drawn monogram: a generated mark is permitted only for
 * invented brands, and these are real companies that own real artwork.
 */
export interface PartnerArtwork {
    /** Path under `public/`, e.g. '/partners/reuneo-logo.svg'. */
    src: string;
    /** The artwork's intrinsic pixel width. Fixes the aspect ratio, not the rendered size. */
    width: number;
    /** The artwork's intrinsic pixel height. */
    height: number;
    /** 'lockup' for a horizontal wordmark, 'emblem' for a square or round mark. */
    form: 'lockup' | 'emblem';
}

export interface Partner {
    id: string;
    name: string;
    category: string;
    description: string;
    website?: string;
    /** Vendored artwork. Absent means both surfaces show a labelled reserved slot. */
    logo?: PartnerArtwork;
}

export const PARTNERS: Partner[] = [
    {
        id: 'station-austin',
        name: 'Station Austin',
        category: 'Venue Partner',
        description: 'The center of gravity for entrepreneurs in Texas, hosting IFN meetups and connecting our community with Austin\'s broader startup ecosystem.',
        website: 'https://stationaustin.org',
        /* The official lockup, copied byte-for-byte from STATION Austin's own
           logo kit (`SVG/STATIONAustinTM Logo Orange.svg`), not redrawn.
           Single-colour #ED512F on a transparent ground, so one file serves both
           modes: 3.164 on `--band` in light and 4.686 in dark.

           WHY ORANGE AND NOT THE YELLOW THE KIT ALSO SHIPS. The yellow variant
           (#FFBB00) measures 1.487 against the light `--band` #F0F0EC, which is
           not "low contrast", it is invisible. It reads well in dark mode only,
           and this field carries one `src`, so a per-mode choice would mean
           changing the interface and both surfaces. Orange is the only variant
           in the kit that survives both grounds unchanged, at the identical
           geometry. Do not swap it back to yellow without also adding a
           per-mode `src`.

           866.66 x 397.98 intrinsic (the kit's viewBox), rounded to whole pixels
           here because these values only fix the 2.18:1 aspect ratio. */
        logo: {
            src: '/partners/station-austin-logo.svg',
            width: 867,
            height: 398,
            form: 'lockup',
        },
    },
    {
        id: 'reuneo',
        name: 'Reuneo',
        category: 'Speed-Networking Partner',
        description: 'Powers the speed-networking format at IFN meetups, pairing founders into quality 1-1 connections in place of standing-around small talk.',
        website: 'https://reuneo.app',
        /* Reuneo publishes no logo kit, so this is their own brand mark taken
           once from the site icon at https://reuneo.com/assets/web_svg_3.svg and
           VENDORED HERE. Vendored is the whole point: the ban in the header is
           on hotlinking a favicon at request time, which sends every visitor's
           IP to a third party. Copying the file once, by hand, and serving it
           from `public/` sends nobody anywhere.

           It is a PNG rather than an SVG because the source only looks like
           vector art: that 537 KB `.svg` is a 3840 x 1427 base64 RASTER plus a
           second raster serving as its alpha mask via `feColorMatrix`, wrapped
           in `<svg>`. Shipping it would cost 537 KB to draw a 64px mark and
           would still be a bitmap. Recombining colour and mask into one RGBA
           image, cropping to the icon and trimming the transparent margin gives
           376 x 512 at 47 KB.

           TRANSPARENCY IS THE WHOLE JOB HERE and it is easy to get wrong. The
           first attempt rasterised the wrapper with `qlmanage`, which composites
           onto opaque white; every pixel came back alpha 255 and the mark shipped
           as a white tile on the cream `--band` well, which would have been
           glaring in dark mode. If this file is ever regenerated, sample a corner
           pixel and confirm alpha is 0 before believing it.

           THE SOURCE SPRITE ALSO CONTAINS THE WORDMARK, deliberately not used.
           The 3840px raster is the full lockup; the site's own `clipPath` keeps
           only the left 1110px, which is the icon, and that clip is honoured
           here. Two reasons to keep it that way: the wordmark is near-black and
           would disappear on the dark ground, and it reads "reunio" rather than
           the "Reuneo" this file prints beside it, so shipping it would put a
           visible contradiction on the page.

           Two-tone blue on a transparent ground with a near-black outline, so it
           holds its own on both page grounds without a per-mode variant: the
           outline carries it in light, the blue fill in dark.

           If Reuneo ever publishes a real logo kit, replace the file and leave
           this entry's shape alone. */
        logo: {
            src: '/partners/reuneo-logo.png',
            width: 376,
            height: 512,
            form: 'emblem',
        },
    },
    {
        id: 'yani-partners',
        name: 'Yani Partners',
        category: 'Business & Technology Partner',
        description: 'Fractional CTO and technology consulting for founders and growing teams. Founded by the same team behind IFN.',
        /* The one vendored file. Full-colour circular emblem carrying its own
           cream ground, so it reads on both page grounds from a single file.
           2000 x 2000 intrinsic, artwork bounding box 1420 x 1420 centred. */
        logo: {
            src: '/partners/yani-partners-logo.png',
            width: 2000,
            height: 2000,
            form: 'emblem',
        },
    },
];
