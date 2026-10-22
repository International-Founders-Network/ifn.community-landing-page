import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../ButtonLink';
import { LUMA_CALENDAR_URL } from '../../data/socialLinks';
import { formatPostDate } from '../../lib/blogDate';

/**
 * The post as a reader sees it, shared by the public /blog/:slug page and the
 * Admin review page (/admin/blog/:slug) so a review shows exactly what will be
 * published. Presentational only: no data loading, no <Head>. Change markup
 * here and both change together; the public page's prerendered HTML must stay
 * as it was, so keep classes and element order stable.
 */

const BREADCRUMB_LINK =
    'underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

/** "Blog / October 1, 2026" above the article. The link differs per surface. */
export function BlogBreadcrumb({ to, label, date }: { to: string; label: string; date: string }) {
    return (
        <p className="text-sm text-muted">
            <Link to={to} className={BREADCRUMB_LINK}>
                {label}
            </Link>
            <span aria-hidden="true"> / </span>
            <time dateTime={date}>{formatPostDate(date)}</time>
        </p>
    );
}

export interface BlogArticleImage {
    hero: string;
    hero800: string;
    alt: string;
}

export function BlogArticle({
    title,
    description,
    html,
    image,
    imageFallback,
}: {
    title: string;
    description: string;
    /** Sanitized at compile (rehype-sanitize), safe to inject. */
    html: string;
    /** Null only in Admin, for a post whose hero is not generated yet. */
    image: BlogArticleImage | null;
    /** Shown in the hero's place when image is null. */
    imageFallback?: ReactNode;
}) {
    return (
        <article className="mx-auto mt-6 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">{title}</h1>
            <p className="mt-6 text-xl leading-relaxed text-muted">{description}</p>
            {/*
              The hero is the post's one accent mark (the nav period is
              the other). It runs wider than the text column, centred on
              it, and is the LCP candidate, so it loads eagerly.
            */}
            <figure className="relative left-1/2 mt-12 w-[min(64rem,calc(100vw-2rem))] -translate-x-1/2">
                {image ? (
                    <img
                        src={image.hero}
                        srcSet={`${image.hero800} 800w, ${image.hero} 1600w`}
                        sizes="(min-width: 68rem) 64rem, calc(100vw - 2rem)"
                        alt={image.alt}
                        width={1600}
                        height={900}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="aspect-video h-auto w-full border border-rule bg-band"
                    />
                ) : (
                    imageFallback
                )}
            </figure>
            <div className="blog-prose mt-12" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
    );
}

/** The soft CTAs under every post: meetup, membership, Resources. No newsletter wiring. */
export function BlogContinue() {
    return (
        <aside className="mx-auto mt-16 max-w-3xl border-t border-rule pt-10">
            <h2 className="text-xl font-bold tracking-tight text-ink">Continue</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                Come to the next Austin meetup, join the private member channel, or browse
                the Resources hub. This post is free editorial, not paid library content.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
                <ButtonLink href={LUMA_CALENDAR_URL} external variant="primary" size="lg">
                    Come to the next meetup
                </ButtonLink>
                <ButtonLink to="/membership" variant="outline" size="lg">
                    Become a member
                </ButtonLink>
                <ButtonLink to="/resources" variant="outline" size="lg">
                    Browse Resources
                </ButtonLink>
            </div>
        </aside>
    );
}
