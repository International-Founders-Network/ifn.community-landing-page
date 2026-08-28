import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Container } from './Container';
import { ButtonLink } from './ButtonLink';
import { Emphasis } from './Emphasis';

/**
 * One onward step off an unfinished page. Every unfinished page gets at least
 * one, so none of them is a dead end.
 *
 * Use `to` for a route inside the site and `href` for anything off-site. The
 * external case renders a real anchor with a new-tab hint for screen readers,
 * never a button that calls window.open.
 */
export interface ComingSoonAction {
    label: string;
    /** Internal route, e.g. `/events`. */
    to?: string;
    /** Absolute URL or `mailto:`. Opens in a new tab when it is a URL. */
    href?: string;
}

interface ComingSoonProps {
    /** Short, honest status. Rendered as an eyebrow badge above the headline. */
    eyebrow: string;
    /**
     * The headline is passed in three parts so the one-marked-word rule is
     * structurally enforced: exactly one word, `titleAccent`, is rendered by
     * `Emphasis`, and it must be the word carrying the headline's meaning.
     * `Emphasis` now carries one accent that measures on both grounds in both
     * modes, so this page's ground is no longer its concern.
     */
    titleBefore?: string;
    titleAccent: string;
    titleAfter?: string;
    /** Replaces <title> while this page is mounted. */
    documentTitle: string;
    /** One plain-language paragraph saying what is and is not true today. */
    lead: string;
    /** Optional second paragraph: what a reader can rely on in the meantime. */
    detail?: string;
    /** First action is the primary one. Two is the practical maximum. */
    actions: ComingSoonAction[];
}

/**
 * `ButtonLink` picks the element (`<Link>` for `to`, `<a>` for `href`) and
 * handles the new-tab attributes and screen-reader hint for off-site URLs, so
 * the only decision left here is which arrow the direction of travel calls for.
 */
function Action({ action, primary }: { action: ComingSoonAction; primary: boolean }) {
    const variant = primary ? 'primary' : 'outline';

    if (action.href) {
        return (
            <ButtonLink href={action.href} variant={variant} className="gap-2">
                {action.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
        );
    }

    return (
        <ButtonLink to={action.to ?? '/'} variant={variant} className="gap-2">
            {action.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
    );
}

/**
 * The shared surface for pages IFN has not built yet.
 *
 * These routes are real URLs with nothing behind them, so while one is mounted
 * it sets its own <title> and injects `robots: noindex, follow`. Search
 * engines that run JavaScript will drop the page from the index but still
 * follow its onward links. Both are reverted on unmount.
 *
 * The injected tag is client-side only, so a crawler that does not execute
 * JavaScript never sees it. `netlify.toml` now sends a matching `X-Robots-Tag`
 * on these six paths, which covers that case; the tag below stays because it is
 * what keeps the behaviour true in local dev and in any other host. Change one
 * and change the other.
 */
export function ComingSoon({
    eyebrow,
    titleBefore,
    titleAccent,
    titleAfter,
    lead,
    detail,
    actions,
}: ComingSoonProps) {
    /**
     * The title and the `noindex` this component used to inject itself are now
     * set by <Head> (src/components/Head.tsx) from the ROUTE_SEO entry for each
     * of these six paths. Two independent writers for one tag was a real
     * hazard, not a tidiness question: Head must be able to REMOVE a stale
     * `noindex` when the visitor navigates from a placeholder route to an
     * indexable one, and it can only safely remove tags it owns.
     *
     * `documentTitle` is still accepted as a prop and still passed by all six
     * pages; it is no longer applied here. Removing it from the prop type is a
     * separate change across seven files and is deliberately not bundled in.
     */

    return (
        <Container size="md" className="pt-32 pb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="max-w-3xl"
            >
                <p className="inline-flex rounded-full bg-band px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-muted">
                    {eyebrow}
                </p>

                <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
                    {titleBefore ? `${titleBefore} ` : ''}
                    <Emphasis>{titleAccent}</Emphasis>
                    {titleAfter ? ` ${titleAfter}` : ''}
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p>

                {detail && (
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{detail}</p>
                )}

                <div className="mt-10">
                    <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">
                        In the meantime
                    </h2>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                        {actions.map((action, index) => (
                            <Action key={action.label} action={action} primary={index === 0} />
                        ))}
                    </div>
                </div>
            </motion.div>
        </Container>
    );
}
