import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '../Button';
import {
    chicagoDateKey,
    chicagoWallTimeToIso,
    defaultPublishWallTime,
    formatChicago,
} from '../../lib/chicagoTime';
import { buildNote } from './buildNote';

/**
 * Admin → Blog: the editorial queue (openspec/changes/blog-editorial-publish).
 *
 * Everything here comes from GET /api/admin-blog, which reads metadata only.
 * This file must never import src/data/blog.generated.ts: that module is the
 * PUBLIC post list, and draft titles/HTML must not be reachable from a client
 * bundle by way of it.
 *
 * Review (openspec/changes/admin-ux-blog-links-review) fetches one post's
 * compiled body from GET /api/admin-blog?slug= when asked, behind the same
 * session, and shows it in a drawer beside the same actions. Unpublished HTML
 * reaches a browser only for a signed-in admin who opened it.
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

interface HeldLink {
    text: string;
    href: string;
    host: string;
}

interface PostBody {
    description: string;
    /** Sanitized by rehype-sanitize at compile, then gated: what the last build would publish. */
    html: string;
    /** Anchors the outbound gate turned into plain text in `html`. */
    heldLinks: HeldLink[];
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

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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

/**
 * Approve / schedule / mark live / hold for one post. Rendered in the queue row
 * and again in the review drawer; both copies read and write the same picker
 * value, so a time typed in one shows in the other.
 */
function PostActions({
    post,
    inputId,
    wallTime,
    disabled,
    onWallTimeChange,
    onAct,
}: {
    post: EditorialPost;
    inputId: string;
    wallTime: string;
    disabled: boolean;
    onWallTimeChange: (value: string) => void;
    onAct: (action: BlogAction) => void;
}) {
    const canSchedule = post.status === 'approved' || post.status === 'scheduled';
    return (
        <>
            {post.status === 'in_review' && (
                <Button size="sm" onClick={() => onAct('approve')} disabled={disabled}>
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
                        value={wallTime}
                        onChange={(e) => onWallTimeChange(e.target.value)}
                    />
                    <span className="text-xs text-muted">America/Chicago</span>
                    <Button size="sm" onClick={() => onAct('schedule')} disabled={disabled}>
                        {post.status === 'scheduled' ? 'Reschedule' : 'Schedule'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onAct('mark_live')} disabled={disabled}>
                        Mark live
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onAct('hold')} disabled={disabled}>
                        Hold
                    </Button>
                </>
            )}
        </>
    );
}

/**
 * Side drawer with one post's full compiled body. Dialog contract as in
 * JoinModal: focus moves in on open and back to the Review button on close,
 * Escape closes, Tab stays inside, and the page behind does not scroll. Same
 * scrim and --ink edge as JoinModal, for the same contrast reasons.
 */
function ReviewDrawer({
    post,
    body,
    error,
    notice,
    onClose,
    children,
}: {
    post: EditorialPost;
    body: PostBody | undefined;
    error: string | null;
    notice: string | null;
    onClose: () => void;
    children: React.ReactNode;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const trigger = document.activeElement as HTMLElement | null;
        const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.cancelAnimationFrame(frame);
            document.body.style.overflow = previousOverflow;
            if (trigger && document.contains(trigger)) trigger.focus();
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key !== 'Tab') return;

            const panel = panelRef.current;
            if (!panel) return;

            const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
            if (focusables.length === 0) {
                e.preventDefault();
                panel.focus();
                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;
            const inside = active instanceof Node && panel.contains(active);

            if (e.shiftKey) {
                if (!inside || active === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else if (!inside || active === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [onClose]);

    // Links inside the post open in a new tab, so checking a source never
    // navigates away from the review.
    const openLinksInNewTab = (e: React.MouseEvent<HTMLDivElement>) => {
        const anchor = (e.target as Element).closest('a[href]');
        if (!(anchor instanceof HTMLAnchorElement)) return;
        e.preventDefault();
        window.open(anchor.href, '_blank', 'noopener,noreferrer');
    };

    return createPortal(
        <>
            <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-50 bg-scrim" />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="blog-review-title"
                tabIndex={-1}
                className="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col border-l border-ink bg-paper focus:outline-hidden"
            >
                <div className="flex items-start justify-between gap-4 border-b border-rule px-6 py-4">
                    <div className="min-w-0">
                        <p className="text-xs text-muted">
                            {STATUS_LABEL[post.status]}
                            {' · '}
                            {post.publicInBuild ? 'On site in current build' : 'Not on site'}
                            {' · '}
                            {post.slug}
                        </p>
                        <h2 id="blog-review-title" className="mt-1 text-xl font-bold tracking-tight text-ink">
                            {post.title}
                        </h2>
                        <p className="mt-1 text-xs text-muted">
                            Post date <time dateTime={post.date}>{post.date}</time>
                            {' · '}
                            {post.publishAt ? (
                                <>
                                    Publish at <time dateTime={post.publishAt}>{formatChicago(post.publishAt)}</time>
                                </>
                            ) : (
                                'No publish time set'
                            )}
                        </p>
                    </div>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close review"
                        className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-band hover:text-ink focus-visible:outline-hidden focus-visible:[box-shadow:0_0_0_2px_var(--paper),0_0_0_4px_var(--ink)]"
                    >
                        <X size={20} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-b border-rule px-6 py-3">{children}</div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {error && (
                        <p role="alert" className="mb-4 border-l-[3px] border-l-ink py-1 pl-4 text-sm text-ink">
                            {error}
                        </p>
                    )}
                    <p role="status" className="text-sm text-muted">
                        {notice ?? (body || error ? '' : 'Loading the post…')}
                    </p>

                    {body && (
                        <>
                            {body.heldLinks.length > 0 && (
                                <section
                                    aria-labelledby="blog-review-held"
                                    className="mt-4 rounded-lg border border-rule bg-band px-4 py-3 text-sm"
                                >
                                    <h3 id="blog-review-held" className="font-semibold text-ink">
                                        {body.heldLinks.length === 1
                                            ? '1 outbound link is held as plain text'
                                            : `${body.heldLinks.length} outbound links are held as plain text`}
                                    </h3>
                                    <p className="mt-1 text-muted">
                                        Their hosts are not approved in Links. Approve a host there and the rebuild it
                                        requests turns these back into links, here and on any published post.
                                    </p>
                                    <ul className="mt-2 space-y-1">
                                        {body.heldLinks.map((link, i) => (
                                            <li key={`${link.href}-${i}`}>
                                                <span className="text-ink">{link.text}</span>{' '}
                                                <a
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted underline decoration-rule underline-offset-2 hover:text-ink hover:decoration-ink"
                                                >
                                                    {link.host}
                                                    <span className="sr-only"> (opens in a new tab)</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                            <div onClick={openLinksInNewTab} className="mt-6">
                                <p className="text-lg leading-relaxed text-muted">{body.description}</p>
                                {/* Safe to inject: rehype-sanitize ran at compile, and the
                                    gate after it only removes <a> wrappers. */}
                                <div className="blog-prose mt-8" dangerouslySetInnerHTML={{ __html: body.html }} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
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
    const [reviewSlug, setReviewSlug] = useState<string | null>(null);
    const [bodies, setBodies] = useState<Record<string, PostBody>>({});
    const [reviewError, setReviewError] = useState<string | null>(null);
    const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

    const load = async () => {
        setError(null);
        // A refresh may follow a rebuild, which recompiles every body.
        setBodies({});
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

    /** The picker's value: what was typed, else publishAt, else 09:00 Chicago on the post date. */
    const wallTimeFor = (post: EditorialPost) =>
        times[post.slug] ?? defaultPublishWallTime(post.publishAt, post.date);

    const act = async (post: EditorialPost, action: BlogAction) => {
        setError(null);
        setNotice(null);
        let publishAt: string | undefined;
        if (action === 'schedule') {
            const wall = wallTimeFor(post);
            const iso = wall ? chicagoWallTimeToIso(wall) : null;
            if (!iso) {
                setError(`Pick a publish time (America/Chicago) for "${post.title}" first.`);
                return;
            }
            // The prefill comes from the post date, which can already be behind us.
            if (
                Date.parse(iso) <= Date.now() &&
                !window.confirm(`${formatChicago(iso)} has already passed, so "${post.title}" would publish on the next build. Schedule it anyway?`)
            ) {
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
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Update failed');
            const updated = data.post as EditorialPost;
            setPosts((prev) => prev?.map((p) => (p.slug === updated.slug ? updated : p)) ?? prev);
            setNotice(`${updated.title}: now ${STATUS_LABEL[updated.status]}.${buildNote(data.build)}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setBusySlug(null);
        }
    };

    const openReview = async (slug: string) => {
        setReviewSlug(slug);
        setReviewError(null);
        setError(null);
        setNotice(null);
        if (bodies[slug]) return;
        try {
            const res = await fetch(`/api/admin-blog?slug=${encodeURIComponent(slug)}`, {
                credentials: 'same-origin',
            });
            if (res.status === 401) {
                onUnauthorized();
                return;
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to load the post');
            setBodies((prev) => ({ ...prev, [slug]: data.body as PostBody }));
            const fresh = data.post as EditorialPost;
            setPosts((prev) => prev?.map((p) => (p.slug === fresh.slug ? fresh : p)) ?? prev);
        } catch (err) {
            setReviewError(err instanceof Error ? err.message : 'Failed to load the post');
        }
    };

    const closeReview = useCallback(() => setReviewSlug(null), []);

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

    const reviewPost = reviewSlug ? posts?.find((p) => p.slug === reviewSlug) : undefined;

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
                                            <Button size="sm" variant="outline" onClick={() => openReview(post.slug)}>
                                                Review<span className="sr-only"> {post.title}</span>
                                            </Button>
                                            <PostActions
                                                post={post}
                                                inputId={`publish-at-${post.slug}`}
                                                wallTime={wallTimeFor(post)}
                                                disabled={disabled}
                                                onWallTimeChange={(value) =>
                                                    setTimes((prev) => ({ ...prev, [post.slug]: value }))
                                                }
                                                onAct={(action) => act(post, action)}
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

            {reviewPost && (
                <ReviewDrawer
                    post={reviewPost}
                    body={bodies[reviewPost.slug]}
                    error={reviewError ?? error}
                    notice={notice}
                    onClose={closeReview}
                >
                    <PostActions
                        post={reviewPost}
                        inputId={`review-publish-at-${reviewPost.slug}`}
                        wallTime={wallTimeFor(reviewPost)}
                        disabled={busySlug === reviewPost.slug || !overlayAvailable}
                        onWallTimeChange={(value) => setTimes((prev) => ({ ...prev, [reviewPost.slug]: value }))}
                        onAct={(action) => act(reviewPost, action)}
                    />
                    {(reviewPost.status === 'draft' || reviewPost.status === 'live') && (
                        <span className="text-sm text-muted">
                            {reviewPost.status === 'live'
                                ? 'Live. Nothing to approve.'
                                : 'Draft. Content moves it to in_review before it can be approved.'}
                        </span>
                    )}
                </ReviewDrawer>
            )}
        </div>
    );
}
