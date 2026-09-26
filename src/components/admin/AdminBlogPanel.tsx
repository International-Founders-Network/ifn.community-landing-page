import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../Button';
import {
    chicagoDateKey,
    chicagoWallTimeToIso,
    formatChicago,
    isoToChicagoWallTime,
} from '../../lib/chicagoTime';

/**
 * Admin → Blog: the editorial queue (openspec/changes/blog-editorial-publish).
 *
 * Everything here comes from GET /api/admin-blog, which reads metadata only.
 * This file must never import src/data/blog.generated.ts: that module is the
 * PUBLIC post list, and draft titles/HTML must not be reachable from a client
 * bundle by way of it.
 */

type BlogStatus = 'draft' | 'in_review' | 'approved' | 'scheduled' | 'live';
type BlogAction = 'approve' | 'schedule' | 'mark_live' | 'hold';

interface EditorialPost {
    slug: string;
    title: string;
    date: string;
    status: BlogStatus;
    publishAt: string | null;
    tags: string[];
    draft: boolean;
    publicInBuild: boolean;
    source: 'overlay' | 'frontmatter';
    updatedAt: string | null;
    updatedBy: string | null;
}

const STATUS_LABEL: Record<BlogStatus, string> = {
    draft: 'Draft',
    in_review: 'In review',
    approved: 'Approved',
    scheduled: 'Scheduled',
    live: 'Live',
};

const TH = 'py-2 pr-4 font-semibold';
const INPUT =
    'h-11 rounded-lg border border-edge bg-paper px-3 text-sm text-ink transition-colors focus:border-ink ' +
    'focus:outline-hidden focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper';

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
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [busySlug, setBusySlug] = useState<string | null>(null);
    const [times, setTimes] = useState<Record<string, string>>({});
    const [month, setMonth] = useState(() => monthKey(chicagoDateKey(new Date().toISOString())));
    const [selected, setSelected] = useState<string | null>(null);
    const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

    const load = async () => {
        setError(null);
        try {
            const res = await fetch('/api/admin-blog', { credentials: 'same-origin' });
            if (res.status === 401) {
                onUnauthorized();
                return;
            }
            if (!res.ok) throw new Error('Failed to load the blog queue');
            const body = (await res.json()) as { posts: EditorialPost[]; overlayAvailable: boolean };
            setPosts(body.posts);
            setOverlayAvailable(body.overlayAvailable);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load the blog queue');
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    const act = async (post: EditorialPost, action: BlogAction) => {
        setError(null);
        setNotice(null);
        let publishAt: string | undefined;
        if (action === 'schedule') {
            const wall = times[post.slug] ?? (post.publishAt ? isoToChicagoWallTime(post.publishAt) : '');
            const iso = wall ? chicagoWallTimeToIso(wall) : null;
            if (!iso) {
                setError(`Pick a publish time (America/Chicago) for "${post.title}" first.`);
                return;
            }
            publishAt = iso;
        }
        if (action === 'mark_live' && !window.confirm(`Publish "${post.title}" on the next build?`)) return;

        setBusySlug(post.slug);
        try {
            const res = await fetch('/api/admin-blog', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ slug: post.slug, action, publishAt }),
            });
            if (res.status === 401) {
                onUnauthorized();
                return;
            }
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || 'Update failed');
            const updated = body.post as EditorialPost;
            setPosts((prev) => prev?.map((p) => (p.slug === updated.slug ? updated : p)) ?? prev);
            const buildNote =
                body.build === 'triggered'
                    ? ' Rebuild requested.'
                    : body.build === 'not-configured'
                      ? ' No build hook configured, so the site will not rebuild on its own.'
                      : body.build === 'failed'
                        ? ' The rebuild request failed; trigger a deploy manually.'
                        : '';
            setNotice(`${updated.title}: now ${STATUS_LABEL[updated.status]}.${buildNote}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setBusySlug(null);
        }
    };

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
                    Before approving: soft CTA only (no $149 in blog copy), the blog is not Resources, and
                    outbound links come from the allowlist. All times are America/Chicago.
                </p>
                {!overlayAvailable && (
                    <p className="mt-2 text-ink">
                        Editorial store unavailable (NETLIFY_DATABASE_URL is not configured). Showing
                        frontmatter only; actions are disabled.
                    </p>
                )}
            </div>

            {error && (
                <p role="alert" className="border-l-[3px] border-l-ink py-1 pl-4 text-sm text-ink">
                    {error}
                </p>
            )}
            <p role="status" className="text-sm text-muted">
                {notice ?? (posts ? '' : error ? '' : 'Loading the blog queue…')}
            </p>

            <section aria-labelledby="blog-queue-heading">
                <h3 id="blog-queue-heading" className="mb-2 text-sm font-bold text-ink">
                    Queue
                </h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-rule text-left text-muted">
                            <th scope="col" className={TH}>Title</th>
                            <th scope="col" className={TH}>Status</th>
                            <th scope="col" className={TH}>Publish at (America/Chicago)</th>
                            <th scope="col" className={TH}>Date</th>
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
                            const busy = busySlug === post.slug;
                            const disabled = busy || !overlayAvailable;
                            const canSchedule = post.status === 'approved' || post.status === 'scheduled';
                            const inputId = `publish-at-${post.slug}`;
                            return (
                                <tr
                                    key={post.slug}
                                    ref={(el) => {
                                        rowRefs.current[post.slug] = el;
                                    }}
                                    className={`border-b border-rule align-top ${selected === post.slug ? 'bg-band' : ''}`}
                                >
                                    <td className="py-2 pr-4">
                                        <div className="font-medium text-ink">{post.title}</div>
                                        <div className="text-xs text-muted">{post.slug}</div>
                                    </td>
                                    <td className="whitespace-nowrap py-2 pr-4">
                                        <div>{STATUS_LABEL[post.status]}</div>
                                        <div className="text-xs text-muted">
                                            {post.publicInBuild ? 'On site in current build' : 'Not on site'}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap py-2 pr-4 text-muted">
                                        {post.publishAt ? (
                                            <time dateTime={post.publishAt}>{formatChicago(post.publishAt)}</time>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap py-2 pr-4 text-muted">
                                        <time dateTime={post.date}>{post.date}</time>
                                    </td>
                                    <td className="py-2 pr-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {post.status === 'in_review' && (
                                                <Button size="sm" onClick={() => act(post, 'approve')} disabled={disabled}>
                                                    Approve
                                                </Button>
                                            )}
                                            {canSchedule && (
                                                <>
                                                    <label htmlFor={inputId} className="sr-only">
                                                        Publish time for {post.title}, America/Chicago
                                                    </label>
                                                    <input
                                                        id={inputId}
                                                        type="datetime-local"
                                                        className={INPUT}
                                                        value={
                                                            times[post.slug] ??
                                                            (post.publishAt ? isoToChicagoWallTime(post.publishAt) : '')
                                                        }
                                                        onChange={(e) =>
                                                            setTimes((prev) => ({ ...prev, [post.slug]: e.target.value }))
                                                        }
                                                    />
                                                    <span className="text-xs text-muted">America/Chicago</span>
                                                    <Button size="sm" onClick={() => act(post, 'schedule')} disabled={disabled}>
                                                        {post.status === 'scheduled' ? 'Reschedule' : 'Schedule'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => act(post, 'mark_live')}
                                                        disabled={disabled}
                                                    >
                                                        Mark live
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => act(post, 'hold')}
                                                        disabled={disabled}
                                                    >
                                                        Hold
                                                    </Button>
                                                </>
                                            )}
                                            {(post.status === 'draft' || post.status === 'live') && (
                                                <span className="text-muted">-</span>
                                            )}
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
