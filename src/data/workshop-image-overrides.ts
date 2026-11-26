/**
 * Poster overrides for the synced Claude workshops on /workshops.
 *
 * By default each card shows the cover image Luma serves for that event
 * (`cover_url` in src/data/workshops.json). To show a picked poster instead:
 *
 *  1. Put the image under `public/workshops/posters/`, for example
 *     `public/workshops/posters/2026-12-03.jpg`.
 *  2. Add an entry here keyed by the Luma event id (`evt-...`) or the Luma
 *     slug (the part after lu.ma/), pointing at the public path:
 *
 *         'evt-cgHLpg8sSDms4cH': '/workshops/posters/2026-12-03.jpg',
 *         // or, the same event by slug:
 *         awlxti59: '/workshops/posters/2026-12-03.jpg',
 *
 * Applied at render time, so no re-sync is needed and the next Luma sync
 * cannot undo it. An event id entry wins over a slug entry for the same event.
 * Entries for events that are no longer in workshops.json do nothing.
 *
 * Empty on purpose: the Luma covers show until someone picks a poster.
 */
export const WORKSHOP_IMAGE_OVERRIDES: Record<string, string> = {};
