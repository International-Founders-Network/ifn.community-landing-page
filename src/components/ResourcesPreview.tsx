import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from './Container';
import { ButtonLink } from './ButtonLink';

/**
 * Home resources strip — single honest link (copy pack Q11).
 * Replaces the empty stage carousel / "28 being written" theater.
 */
export function ResourcesPreview() {
    return (
        <section className="bg-paper py-20 md:py-28" id="resources">
            <Container>
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        Being written
                    </p>
                    <h2 className="mt-4 text-[clamp(1.875rem,4vw,2.75rem)] font-medium leading-[1.02] tracking-[-0.025em] text-ink">
                        Guides in progress
                    </h2>
                    <p className="mt-5 text-lg leading-relaxed text-muted">
                        We write from questions founders bring to Austin meetups. No finished library
                        claim. Members get first access when each guide publishes.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <ButtonLink to="/resources" variant="outline" size="lg">
                            Guides in progress
                            <ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                        </ButtonLink>
                        <Link
                            to="/membership"
                            className="text-sm font-semibold text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
                        >
                            Become a member for first access
                        </Link>
                    </div>
                </div>
            </Container>
        </section>
    );
}
