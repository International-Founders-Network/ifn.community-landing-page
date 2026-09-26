import { Link, useParams } from 'react-router-dom';
import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { getPostBySlug } from '../data/blog.generated';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';
import { NotFound } from './NotFound';

function formatPostDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

/**
 * /blog/:slug. Body HTML comes from the build-time Markdown compile.
 * Soft CTAs: meetup + membership + Resources. No newsletter wiring.
 */
export function BlogPost() {
    const { slug } = useParams<{ slug: string }>();
    const post = slug ? getPostBySlug(slug) : undefined;

    if (!post) {
        return <NotFound />;
    }

    return (
        <div className="pt-24 pb-20">
            <Container>
                <p className="text-sm text-muted">
                    <Link
                        to="/blog"
                        className="underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                    >
                        Blog
                    </Link>
                    <span aria-hidden="true"> / </span>
                    <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                </p>
                <article className="mx-auto mt-6 max-w-3xl">
                    <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">
                        {post.title}
                    </h1>
                    <p className="mt-6 text-xl leading-relaxed text-muted">{post.description}</p>
                    <div
                        className="blog-prose mt-12"
                        dangerouslySetInnerHTML={{ __html: post.html }}
                    />
                </article>

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
            </Container>
        </div>
    );
}
