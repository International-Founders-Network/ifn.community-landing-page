import { useParams } from 'react-router-dom';
import { Container } from '../components/Container';
import { BlogArticle, BlogBreadcrumb, BlogContinue } from '../components/blog/BlogArticle';
import { getPostBySlug } from '../data/blog.generated';
import { NotFound } from './NotFound';

/**
 * /blog/:slug. Body HTML comes from the build-time Markdown compile. The
 * article itself is BlogArticle, shared with the Admin review page.
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
                <BlogBreadcrumb to="/blog" label="Blog" date={post.date} />
                <BlogArticle
                    title={post.title}
                    description={post.description}
                    html={post.html}
                    image={{ hero: post.image.hero, hero800: post.image.hero800, alt: post.image.alt }}
                />
                <BlogContinue />
            </Container>
        </div>
    );
}
