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
        /* TODO(founder): no vendored artwork yet. Add the file to
           public/partners/ and a `logo` key here, per the header above. */
    },
    {
        id: 'reuneo',
        name: 'Reuneo',
        category: 'Speed-Networking Partner',
        description: 'Powers the speed-networking format at IFN meetups, pairing founders into quality 1-1 connections in place of standing-around small talk.',
        website: 'https://reuneo.app',
        /* TODO(founder): no vendored artwork yet. Add the file to
           public/partners/ and a `logo` key here, per the header above. */
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
