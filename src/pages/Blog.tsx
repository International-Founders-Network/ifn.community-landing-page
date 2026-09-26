import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { Emphasis } from '../components/Emphasis';
import { ButtonLink } from '../components/ButtonLink';
import { BLOG_POSTS } from '../data/blog.generated';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

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
 * /blog index. Free editorial list from content/blog/*.md (compiled at build).
 * Newsletter stays dark: no signup CTA here.
 */
export function Blog() {
    return (
        <div className="pt-24 pb-20">
            <section className="relative mb-16 overflow-hidden bg-band py-20">
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                            Blog
                        </p>
                        <h1 className="mt-4 text-5xl font-bold tracking-tight text-ink md:text-6xl">
                            Notes from the <Emphasis>Austin</Emphasis> room
                        </h1>
                        <p className="mt-6 text-xl leading-relaxed text-muted">
                            Peer writing for international and immigrant founders building in
                            Austin. The questions that come up at every meetup, written down so
                            you can read them before you walk into the room.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-muted">
                            Not legal advice. Not the paid Resources library. Free to read.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <ButtonLink
                                href={LUMA_CALENDAR_URL}
                                external
                                variant="primary"
                                size="lg"
                            >
                                Come to the next meetup
                            </ButtonLink>
                            <ButtonLink to="/membership" variant="outline" size="lg">
                                Become a member
                            </ButtonLink>
                        </div>
                    </div>
                </Container>
            </section>

            <Container>
                {BLOG_POSTS.length === 0 ? (
                    <p className="max-w-2xl text-lg leading-relaxed text-muted">
                        No posts published yet. When we publish, they will appear here.
                    </p>
                ) : (
                    <ul className="mx-auto max-w-3xl divide-y divide-rule">
                        {BLOG_POSTS.map((post) => (
                            <li key={post.slug} className="py-10 first:pt-0">
                                <article>
                                    <p className="text-sm text-muted">
                                        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
                                        <Link
                                            to={`/blog/${post.slug}`}
                                            className="underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                                        >
                                            {post.title}
                                        </Link>
                                    </h2>
                                    <p className="mt-3 text-lg leading-relaxed text-muted">
                                        {post.excerpt}
                                    </p>
                                    <p className="mt-4">
                                        <Link
                                            to={`/blog/${post.slug}`}
                                            className="text-sm font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                                        >
                                            Read post
                                        </Link>
                                    </p>
                                </article>
                            </li>
                        ))}
                    </ul>
                )}
            </Container>
        </div>
    );
}
