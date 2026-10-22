import { describe, it, expect, vi } from 'vitest';
import { applyAction, BLOG_STATUSES } from '../../../netlify/functions/_lib/blogEditorial';
import {
    adminImageUrl,
    availableActions,
    imageMissing,
    MARK_LIVE_CONFIRM,
    noActionsReason,
    prepareAction,
    siteState,
    type BlogAction,
} from './blogQueue';

const AT = '2026-10-01T09:00:00-05:00';
const DUE = Date.parse(AT);
const ALL_ACTIONS: BlogAction[] = ['approve', 'schedule', 'mark_live', 'hold'];

describe('availableActions', () => {
    it('offers exactly the actions the server accepts from each status', () => {
        for (const status of BLOG_STATUSES) {
            const offered = availableActions(status);
            for (const action of ALL_ACTIONS) {
                const accepted = applyAction({ status, publishAt: null }, action, AT).ok;
                expect({ status, action, offered: offered.includes(action) }).toEqual({ status, action, offered: accepted });
            }
        }
    });

    it('offers approve only for in review, and nothing for draft or live', () => {
        expect(availableActions('in_review')).toEqual(['approve']);
        expect(availableActions('approved')).toEqual(['schedule', 'mark_live', 'hold']);
        expect(availableActions('scheduled')).toEqual(['schedule', 'mark_live', 'hold']);
        expect(availableActions('draft')).toEqual([]);
        expect(availableActions('live')).toEqual([]);
    });

    it('explains why draft and live have no actions', () => {
        expect(noActionsReason('live')).toMatch(/Live/);
        expect(noActionsReason('draft')).toMatch(/Draft/);
        expect(noActionsReason('approved')).toBeNull();
    });
});

describe('siteState', () => {
    it('says on site when the build and the editorial state agree it is public', () => {
        expect(siteState({ status: 'live', publishAt: null, publicInBuild: true })).toEqual({
            kind: 'on-site',
            label: 'On site in current build',
        });
    });

    it('says publishing, not "not on site", for a live post the build has not caught up with', () => {
        expect(siteState({ status: 'live', publishAt: null, publicInBuild: false }).label).toBe(
            'Publishing (rebuild in progress)'
        );
        expect(siteState({ status: 'scheduled', publishAt: AT, publicInBuild: false }, DUE + 1).kind).toBe('publishing');
    });

    it('says not on site for a future schedule and pre-approval states', () => {
        expect(siteState({ status: 'scheduled', publishAt: AT, publicInBuild: false }, DUE - 1).label).toBe('Not on site');
        expect(siteState({ status: 'in_review', publishAt: null, publicInBuild: false }).kind).toBe('off-site');
    });

    it('says the post is still on site after a hold until the rebuild lands', () => {
        expect(siteState({ status: 'in_review', publishAt: null, publicInBuild: true }).kind).toBe('removing');
    });
});

describe('adminImageUrl', () => {
    const images = {
        hero: '/blog/a-hero.webp',
        hero800: '/blog/a-hero-800.webp',
        thumb: '/blog/a-thumb.webp',
        og: '/blog/a-og.png',
    };

    it('uses the public path for a post public in this build', () => {
        expect(adminImageUrl({ slug: 'a', publicInBuild: true, images }, 'thumb')).toBe('/blog/a-thumb.webp');
    });

    it('uses the authed function for a post whose files are pruned from dist', () => {
        expect(adminImageUrl({ slug: 'a', publicInBuild: false, images }, 'hero800')).toBe(
            '/api/admin-blog-image?slug=a&variant=hero800'
        );
    });

    it('reads missing variants from the image gate', () => {
        expect(imageMissing({ images, imagesMissing: ['public/blog/a-thumb.webp'] }, 'thumb')).toBe(true);
        expect(imageMissing({ images, imagesMissing: ['public/blog/a-thumb.webp'] }, 'hero')).toBe(false);
    });
});

describe('prepareAction', () => {
    const post = { title: 'T' };

    it('confirms mark live with the accurate publish copy', () => {
        const confirm = vi.fn().mockReturnValue(true);
        expect(prepareAction(post, 'mark_live', '', confirm)).toEqual({ kind: 'send' });
        expect(confirm.mock.calls[0][0]).toContain(MARK_LIVE_CONFIRM);
        expect(MARK_LIVE_CONFIRM).toBe('Publish now? The site rebuilds and the post is live in a few minutes.');
        expect(prepareAction(post, 'mark_live', '', () => false)).toEqual({ kind: 'cancelled' });
    });

    it('sends approve and hold without asking', () => {
        const confirm = vi.fn();
        expect(prepareAction(post, 'approve', '', confirm)).toEqual({ kind: 'send' });
        expect(prepareAction(post, 'hold', '', confirm)).toEqual({ kind: 'send' });
        expect(confirm).not.toHaveBeenCalled();
    });

    it('converts a Chicago wall time for schedule', () => {
        expect(prepareAction(post, 'schedule', '2026-10-01T09:00', () => true, DUE - 1000)).toEqual({
            kind: 'send',
            publishAt: '2026-10-01T09:00:00-05:00',
        });
    });

    it('errors without a time and asks before scheduling in the past', () => {
        expect(prepareAction(post, 'schedule', '', () => true).kind).toBe('error');
        expect(prepareAction(post, 'schedule', '2026-10-01T09:00', () => false, DUE + 1000)).toEqual({ kind: 'cancelled' });
    });
});
