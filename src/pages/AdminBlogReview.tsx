import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { AdminGate } from '../components/admin/AdminShell';
import { BlogArticle, BlogBreadcrumb, BlogContinue } from '../components/blog/BlogArticle';
import { fetchPost, NotFoundError, UnauthorizedError } from '../components/admin/adminBlogApi';
import { ActionFeedback, PostActions } from '../components/admin/BlogAdminParts';
import {
    adminImageUrl,
    imageMissing,
    siteState,
    STATUS_LABEL,
    type EditorialPost,
    type PostBody,
} from '../components/admin/blogQueue';
import { useBlogActions } from '../components/admin/useBlogActions';
import { defaultPublishWallTime, formatChicago } from '../lib/chicagoTime';

/**
 * /admin/blog/:slug. One post, full page, rendered with the same BlogArticle
 * the public /blog/:slug page uses, so what is reviewed is what publishes.
 * Behind AdminGate like /admin: the body comes from GET /api/admin-blog?slug=,
 * which needs an allowlisted session, and images of a post that is not public
 * come from the authed admin-blog-image function.
 *
 * Routed outside <Layout> (no nav, footer or consent banner), not in ROUTE_SEO,
 * so never prerendered or listed in the sitemap.
 */

const QUEUE_PATH = '/admin?tab=blog';

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-baseline gap-2">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="text-sm font-semibold text-ink">{children}</dd>
        </div>
    );
}

/** The sticky bar: where the post stands, and what can be done with it. */
function ReviewBar({
    post,
    body,
    overlayAvailable,
    busy,
    wallTime,
    onWallTimeChange,
    actions,
}: {
    post: EditorialPost;
    body: PostBody;
    overlayAvailable: boolean;
    busy: boolean;
    wallTime: string;
    onWallTimeChange: (value: string) => void;
    actions: ReturnType<typeof useBlogActions>;
}) {
    const held = body.heldLinks.length;
    return (
        <div className="sticky top-0 z-40 border-b border-ink bg-paper">
            <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-3">
                <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                    <Fact label="Status">{STATUS_LABEL[post.status]}</Fact>
                    <Fact label="Site">{siteState(post).label}</Fact>
                    <Fact label="Images">
                        {post.imagesReady ? (
                            'Ready'
                        ) : (
                            <span title={post.imagesMissing.join(', ')}>
                                {post.imagesMissing.length} missing, going live fails the build
                            </span>
                        )}
                    </Fact>
                    <Fact label="Links">
                        {held === 0 ? (
                            'None held'
                        ) : (
                            <a
                                href="#held-links"
                                className="underline decoration-rule underline-offset-4 hover:decoration-ink"
                            >
                                {held === 1 ? '1 held as plain text' : `${held} held as plain text`}
                            </a>
                        )}
                    </Fact>
                    {post.publishAt && (
                        <Fact label="Publish at">
                            <time dateTime={post.publishAt}>{formatChicago(post.publishAt)}</time>
                        </Fact>
                    )}
                </dl>
                <div className="flex flex-wrap items-center gap-2">
                    <PostActions
                        post={post}
                        inputId={`review-publish-at-${post.slug}`}
                        wallTime={wallTime}
                        disabled={busy || !overlayAvailable}
                        onWallTimeChange={onWallTimeChange}
                        onAct={(action) => actions.act(post, action, wallTime)}
                        showReason
                    />
                </div>
            </Container>
            {(actions.notice || actions.error || actions.buildPhase || !overlayAvailable) && (
                <Container className="space-y-2 border-t border-rule py-2">
                    {!overlayAvailable && (
                        <p className="text-sm text-ink">
                            Editorial store unavailable (NETLIFY_DATABASE_URL is not configured). Actions are
                            disabled.
                        </p>
                    )}
                    <ActionFeedback notice={actions.notice} error={actions.error} buildPhase={actions.buildPhase} />
                </Container>
            )}
        </div>
    );
}

function HeldLinks({ links }: { links: PostBody['heldLinks'] }) {
    if (links.length === 0) return null;
    return (
        <section
            id="held-links"
            aria-labelledby="held-links-heading"
            className="mx-auto mt-16 max-w-3xl scroll-mt-40 border-l-[3px] border-l-ink bg-band px-5 py-4 text-sm"
        >
            <h2 id="held-links-heading" className="font-semibold text-ink">
                {links.length === 1
                    ? '1 outbound link is held as plain text'
                    : `${links.length} outbound links are held as plain text`}
            </h2>
            <p className="mt-1 text-muted">
                Their hosts are not approved in Links. Approve a host there and the rebuild it starts turns these
                back into links, here and on any published post. Not shown to readers.
            </p>
            <ul className="mt-3 space-y-1">
                {links.map((link, i) => (
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
    );
}

function MissingHero({ slug }: { slug: string }) {
    return (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 border border-dashed border-edge bg-band px-6 text-center">
            <p className="text-base font-semibold text-ink">Hero image missing</p>
            <p className="text-sm text-muted">
                Generate it with <code>node scripts/build-blog-og-images.mjs {slug}</code> before this post goes live.
            </p>
        </div>
    );
}

/**
 * Links inside the post open in a new tab, so checking a source never leaves
 * the review. Capture phase, so a router Link in the Continue block sees the
 * prevented default and does not navigate either.
 */
function openLinksInNewTab(e: React.MouseEvent<HTMLDivElement>) {
    const anchor = (e.target as Element).closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;
    e.preventDefault();
    window.open(anchor.href, '_blank', 'noopener,noreferrer');
}

function Review({ slug, onUnauthorized }: { slug: string; onUnauthorized: () => void }) {
    const [post, setPost] = useState<EditorialPost | null>(null);
    const [body, setBody] = useState<PostBody | null>(null);
    const [overlayAvailable, setOverlayAvailable] = useState(true);
    const [loadError, setLoadError] = useState<{ notFound: boolean; message: string } | null>(null);
    const [wallTime, setWallTime] = useState<string | null>(null);

    const load = async () => {
        try {
            const result = await fetchPost(slug);
            setLoadError(null);
            setPost(result.post);
            setBody(result.body);
            setOverlayAvailable(result.overlayAvailable);
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                onUnauthorized();
                return;
            }
            setLoadError({
                notFound: err instanceof NotFoundError,
                message: err instanceof Error ? err.message : 'Failed to load the post',
            });
        }
    };

    const actions = useBlogActions({
        onUnauthorized,
        onUpdated: setPost,
        // The finished deploy ships a new queue and recompiled body.
        onBuildLive: () => load(),
    });

    useEffect(() => {
        load();
        // Keyed by slug (AdminBlogReview), so this runs once per post.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loadError) {
        return (
            <Container className="py-16">
                <div className="mx-auto max-w-3xl">
                    <p role="alert" className="border-l-[3px] border-l-ink py-1 pl-4 text-base text-ink">
                        {loadError.notFound
                            ? `No post with the slug "${slug}" is in the current build.`
                            : loadError.message}
                    </p>
                    <div className="mt-6">
                        <ButtonLink to={QUEUE_PATH} variant="outline" size="sm">
                            Back to blog queue
                        </ButtonLink>
                    </div>
                </div>
            </Container>
        );
    }

    if (!post || !body) {
        return (
            <Container className="py-24">
                <p role="status" className="text-center text-sm text-muted">
                    Loading the post…
                </p>
            </Container>
        );
    }

    const image = imageMissing(post, 'hero')
        ? null
        : { hero: adminImageUrl(post, 'hero'), hero800: adminImageUrl(post, 'hero800'), alt: post.imageAlt };

    return (
        <>
            <ReviewBar
                post={post}
                body={body}
                overlayAvailable={overlayAvailable}
                busy={actions.busySlug === post.slug}
                wallTime={wallTime ?? defaultPublishWallTime(post.publishAt, post.date)}
                onWallTimeChange={setWallTime}
                actions={actions}
            />
            {/* The public post sits on --paper; so does its review. */}
            <div className="bg-paper pt-12 pb-20">
                <Container>
                    <BlogBreadcrumb to={QUEUE_PATH} label="Back to blog queue" date={post.date} />
                    <div onClickCapture={openLinksInNewTab}>
                        <BlogArticle
                            title={post.title}
                            description={body.description}
                            html={body.html}
                            image={image}
                            imageFallback={<MissingHero slug={post.slug} />}
                        />
                        <BlogContinue />
                    </div>
                    <HeldLinks links={body.heldLinks} />
                </Container>
            </div>
        </>
    );
}

export function AdminBlogReview() {
    const { slug = '' } = useParams<{ slug: string }>();
    return <AdminGate>{(_email, signOut) => <Review key={slug} slug={slug} onUnauthorized={signOut} />}</AdminGate>;
}
