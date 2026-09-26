/**
 * Sentence appended to an Admin notice for the `build` field that admin-blog
 * and admin-links return after a write. Lives outside the component files so
 * both panels can share it without breaking React Fast Refresh.
 */
export function buildNote(build: unknown): string {
    switch (build) {
        case 'triggered':
            return ' Rebuild requested.';
        case 'not-configured':
            return ' No build hook configured, so the site will not rebuild on its own.';
        case 'failed':
            return ' The rebuild request failed; trigger a deploy manually.';
        default:
            return '';
    }
}
