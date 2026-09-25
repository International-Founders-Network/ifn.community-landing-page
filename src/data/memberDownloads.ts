/**
 * The guides that sit behind membership.
 *
 * Shared deliberately: `src/pages/Members.tsx` renders this list and
 * `netlify/functions/member-download.ts` validates `?id=` against it. One table
 * means the page cannot offer a download the function refuses as unknown, and
 * the function cannot quietly serve something the page never lists.
 *
 * The ids match entries in `src/data/resourcesData.ts` on purpose: when the
 * PDFs exist, the public resource card and the member download resolve to the
 * same record rather than to two hand-kept copies of one title. Changing an id
 * here without changing it there breaks that join silently, so change both.
 *
 * This file is plain data with no imports. Netlify bundles it into the function
 * (as it already does with `src/data/plans.json` in `checkout.ts`), so anything
 * pulled in here is pulled into the function bundle too. Keep it that way.
 */
export interface MemberDownload {
    /** Matches the resource id in `src/data/resourcesData.ts`. */
    id: string;
    title: string;
    description: string;
}

export const MEMBER_DOWNLOADS: readonly MemberDownload[] = [
    {
        id: 'visa-pathways',
        title: 'US Visa Pathways for Entrepreneurs',
        description: 'O-1, E-2, L-1, H-1B, EB-5: which visa fits your situation and timeline.',
    },
    {
        id: 'entity-selection',
        title: 'Business Entity Selection Guide',
        description: 'LLC vs. C-Corp vs. S-Corp: which structure is right for your situation.',
    },
    {
        id: 'austin-ecosystem-map',
        title: 'Startup Ecosystem Map: Austin',
        description: 'The people, programs and rooms that actually matter in Austin.',
    },
] as const;

/** Whether `id` names a guide in the member library. Used by the download function. */
export function isMemberDownloadId(id: string): boolean {
    return MEMBER_DOWNLOADS.some((item) => item.id === id);
}
