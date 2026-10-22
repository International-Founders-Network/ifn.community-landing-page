import { describe, it, expect } from 'vitest';
import { blogActionNotice, buildNeedsAttention, buildNote } from './buildNote';

const post = { title: 'Post', status: 'live' as const, publishAt: null };

describe('buildNote', () => {
    it('says the rebuild already started when the hook fired', () => {
        expect(buildNote('triggered')).toBe(' Site rebuild started, live in a few minutes.');
    });

    it('warns that the site will not update when there is no hook or it failed', () => {
        expect(buildNote('not-configured')).toMatch(/Warning: .*will not update until a deploy is triggered/);
        expect(buildNote('failed')).toMatch(/Warning: .*will not update until a deploy is triggered/);
        expect(buildNeedsAttention('failed')).toBe(true);
        expect(buildNeedsAttention('triggered')).toBe(false);
    });

    it('says nothing for skipped or unknown', () => {
        expect(buildNote('skipped')).toBe('');
        expect(buildNote(undefined)).toBe('');
    });
});

describe('blogActionNotice', () => {
    it('mark live with a triggered hook reads as publishing, not as a manual step', () => {
        const notice = blogActionNotice(post, 'mark_live', 'triggered');
        expect(notice).toEqual({ tone: 'info', text: 'Publishing "Post": site rebuild started, live in a few minutes.' });
        expect(notice.text).not.toMatch(/next build|Rebuild requested|Not on site/);
    });

    it('mark live without a rebuild is a warning', () => {
        for (const build of ['not-configured', 'failed']) {
            const notice = blogActionNotice(post, 'mark_live', build);
            expect(notice.tone).toBe('warning');
            expect(notice.text).toMatch(/will not update until a deploy is triggered/);
        }
    });

    it('approve says nothing public changes', () => {
        expect(blogActionNotice({ ...post, status: 'approved' }, 'approve', 'skipped').text).toMatch(/Nothing changes on the site/);
    });

    it('schedule names the Chicago time', () => {
        const text = blogActionNotice(
            { title: 'Post', status: 'scheduled', publishAt: '2026-10-01T14:00:00.000Z' },
            'schedule',
            'triggered'
        ).text;
        expect(text).toContain('Oct 1, 2026');
        expect(text).toContain('CDT');
    });

    it('hold says where the post went', () => {
        expect(blogActionNotice({ ...post, status: 'in_review' }, 'hold', 'triggered').text).toMatch(/back to in review/);
    });

    it('never uses an em dash', () => {
        for (const action of ['approve', 'schedule', 'mark_live', 'hold'] as const) {
            for (const build of ['triggered', 'not-configured', 'failed', 'skipped']) {
                expect(blogActionNotice(post, action, build).text).not.toContain('—');
            }
        }
    });
});
