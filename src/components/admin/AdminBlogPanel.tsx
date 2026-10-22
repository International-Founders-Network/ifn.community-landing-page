import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../Button';
import { ButtonLink } from '../ButtonLink';
import { chicagoDateKey, defaultPublishWallTime, formatChicago } from '../../lib/chicagoTime';
import { fetchQueue, UnauthorizedError } from './adminBlogApi';
import { siteState, STATUS_LABEL, type EditorialPost } from './blogQueue';
import { ActionFeedback, PostActions, PostThumb } from './BlogAdminParts';
import { useBlogActions } from './useBlogActions';

/**
 * Admin → Blog: the editorial queue (openspec/changes/blog-editorial-publish).
 *
 * Everything here comes from GET /api/admin-blog, which reads metadata only.
 * This file must never import src/data/blog.generated.ts: that module is the
 * PUBLIC post list, and draft titles/HTML must not be reachable from a client
 * bundle by way of it.
 *
 * Each row links to the full-page review, /admin/blog/<slug>
 * (src/pages/AdminBlogReview.tsx), which renders the post as the public page
 * would, behind the same session. Thumbnails of posts that are not public come
 * from the authed admin-blog-image function (adminImageUrl).
 */

const TH = 'py-2 pr-4 font-semibold';

function monthKey(dayKey: string) {
    return dayKey.slice(0, 7);
}

function shiftMonth(key: string, delta: number) {
    const [y, m] = key.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
    const [y, m] = key.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

function dayLabel(dayKey: string) {
    const [y, m, d] = dayKey.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

/**
 * Calendar day for a post: the Chicago day of publishAt when set, otherwise the
 * frontmatter display date (an approved post with no time yet sits on its
 * intended day so it is visible as unscheduled).
 */
function calendarDay(post: EditorialPost) {
    return post.publishAt ? chicagoDateKey(post.publishAt) : post.date;
}

export function AdminBlogPanel({
    refreshKey,
    onUnauthorized,
}: {
    refreshKey: number;
    onUnauthorized: () => void;
}) {
    const [posts, setPosts] = useState<EditorialPost[] | null>(null);
    const [overlayAvailable, setOverlayAvailable] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [times, setTimes] = useState<Record<string, string>>({});
    const [month, setMonth] = useState(() => monthKey(chicagoDateKey(new Date().toISOString())));
    const [selected, setSelected] = useState<string | null>(null);
    const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

    const load = async () => {
        setLoadError(null);
        try {
            const queue = await fetchQueue();
            setPosts(queue.posts);
            setOverlayAvailable(queue.overlayAvailable);
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                onUnauthorized();
                return;
            }
            setLoadError(err instanceof Error ? err.message : 'Failed to load the blog queue');
        }
    };

    const actions = useBlogActions({
        onUnauthorized,
        onUpdated: (updated) => setPosts((prev) => prev?.map((p) => (p.slug === updated.slug ? updated : p)) ?? prev),
        // The finished deploy ships a new queue with publicInBuild updated.
        onBuildLive: () => load(),
    });

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    /** The picker's value: what was typed, else publishAt, else 09:00 Chicago on the post date. */
    const wallTimeFor = (post: EditorialPost) =>
        times[post.slug] ?? defaultPublishWallTime(post.publishAt, post.date);

    const calendar = useMemo(() => {
        const days = new Map<string, EditorialPost[]>();
        for (const post of posts ?? []) {
            const onCalendar =
                post.status === 'scheduled' ||
                post.status === 'approved' ||
                (post.status === 'live' && post.publishAt);
            if (!onCalendar) continue;
            const day = calendarDay(post);
            if (monthKey(day) !== month) continue;
            days.set(day, [...(days.get(day) ?? []), post]);
        }
        return [...days.entries()].sort(([a], [b]) => a.localeCompare(b));
    }, [posts, month]);

    const select = (slug: string) => {
        setSelected(slug);
        rowRefs.current[slug]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-rule bg-band px-4 py-3 text-sm text-muted">
                <p>
                    Before approving, open Review and read the whole post: soft CTA only (no $149 in blog
                    copy), the blog is not Resources, and outbound links come from the allowlist. A link to a
                    sponsor or potential stays plain text until that row is approved in Links. All times are
                    America/Chicago; the picker starts at 09:00 on the post date.
                </p>
                {!overlayAvailable && (
                    <p className="mt-2 text-ink">
                        Editorial store unavailable (NETLIFY_DATABASE_URL is not configured). Showing
                        frontmatter only; actions are disabled.
                    </p>
                )}
            </div>

            {loadError && (
                <p role="alert" className="border-l-[3px] border-l-ink py-1 pl-4 text-sm text-ink">
                    {loadError}
                </p>
            )}
            {!posts && !loadError && <p className="text-sm text-muted">Loading the blog queue…</p>}
            <ActionFeedback notice={actions.notice} error={actions.error} buildPhase={actions.buildPhase} />

            <section aria-labelledby="blog-queue-heading">
                <h3 id="blog-queue-heading" className="mb-2 text-sm font-bold text-ink">
                    Queue
                </h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-rule text-left text-muted">
                            <th scope="col" className={TH}>
                                <span className="sr-only">Thumbnail</span>
                            </th>
                            <th scope="col" className={TH}>Title</th>
                            <th scope="col" className={TH}>Status</th>
                            <th scope="col" className={TH}>Publish at (America/Chicago)</th>
                            <th scope="col" className={TH}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts && posts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-muted">
                                    No posts in content/blog yet.
                                </td>
                            </tr>
                        )}
                        {posts?.map((post) => {
                            const disabled = actions.busySlug === post.slug || !overlayAvailable;
                            const reviewPath = `/admin/blog/${post.slug}`;
                            const site = siteState(post);
                            return (
                                <tr
                                    key={post.slug}
                                    ref={(el) => {
                                        rowRefs.current[post.slug] = el;
                                    }}
                                    className={`border-b border-rule align-top ${selected === post.slug ? 'bg-band' : ''}`}
                                >
                                    <td className="w-36 py-3 pr-4">
                                        {/* Same destination as the title link; one tab stop per row. */}
                                        <Link to={reviewPath} tabIndex={-1} aria-hidden="true">
                                            <PostThumb post={post} className="w-32" />
                                        </Link>
                                    </td>
                                    <td className="min-w-[16rem] py-3 pr-4">
                                        <Link
                                            to={reviewPath}
                                            className="font-medium text-ink underline decoration-rule underline-offset-4 hover:decoration-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                                        >
                                            {post.title}
                                        </Link>
                                        <div className="mt-1 text-xs text-muted">{post.slug}</div>
                                        <div className="text-xs text-muted">
                                            Post date <time dateTime={post.date}>{post.date}</time>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap py-3 pr-4">
                                        <div className="font-semibold text-ink">{STATUS_LABEL[post.status]}</div>
                                        <div className={`text-xs ${site.kind === 'on-site' ? 'text-ink' : 'text-muted'}`}>
                                            {site.label}
                                        </div>
                                        <div
                                            className="text-xs text-muted"
                                            title={post.imagesReady ? undefined : `Missing: ${post.imagesMissing.join(', ')}`}
                                        >
                                            {post.imagesReady ? 'Images ready' : 'Images missing. Going live fails the build'}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap py-3 pr-4 text-muted">
                                        {post.publishAt ? (
                                            <time dateTime={post.publishAt}>{formatChicago(post.publishAt)}</time>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="min-w-[27rem] py-3 pr-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <ButtonLink to={reviewPath} size="sm" variant="outline">
                                                Review<span className="sr-only"> {post.title}</span>
                                            </ButtonLink>
                                            <PostActions
                                                post={post}
                                                inputId={`publish-at-${post.slug}`}
                                                wallTime={wallTimeFor(post)}
                                                disabled={disabled}
                                                onWallTimeChange={(value) =>
                                                    setTimes((prev) => ({ ...prev, [post.slug]: value }))
                                                }
                                                onAct={(action) => actions.act(post, action, wallTimeFor(post))}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>

            <section aria-labelledby="blog-calendar-heading">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 id="blog-calendar-heading" className="text-sm font-bold text-ink">
                        Calendar: {monthLabel(month)}
                    </h3>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setMonth((m) => shiftMonth(m, -1))}>
                            Previous month
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setMonth((m) => shiftMonth(m, 1))}>
                            Next month
                        </Button>
                    </div>
                </div>
                {calendar.length === 0 ? (
                    <p className="py-4 text-sm text-muted">Nothing approved or scheduled this month.</p>
                ) : (
                    <ul className="divide-y divide-rule rounded-lg border border-rule">
                        {calendar.map(([day, dayPosts]) => (
                            <li key={day} className="flex flex-wrap gap-4 px-4 py-3">
                                <span className="w-28 shrink-0 text-sm font-semibold text-ink">{dayLabel(day)}</span>
                                <ul className="space-y-1 text-sm">
                                    {dayPosts.map((post) => (
                                        <li key={post.slug}>
                                            <button
                                                type="button"
                                                onClick={() => select(post.slug)}
                                                className="text-left text-ink underline decoration-rule underline-offset-2 hover:decoration-ink"
                                            >
                                                {post.title}
                                            </button>{' '}
                                            <span className="text-muted">
                                                {STATUS_LABEL[post.status]}
                                                {post.publishAt
                                                    ? `, ${formatChicago(post.publishAt)}`
                                                    : ', no time set (display date)'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

        </div>
    );
}
