import { useOutletContext } from 'react-router-dom';
import { Container } from './Container';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { Emphasis } from './Emphasis';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

/**
 * /resources — honest being-written page (Venkat Q11).
 * No fake audience×stage taxonomy / "28 being written" theater until real guides publish.
 */
const QUEUED_TOPICS = [
    'Incorporating as a non-resident',
    'U.S. banking',
    'Visa pathways founders actually used',
    'First U.S. hire',
    'Fundraising without a local network',
    'Austin ecosystem map',
] as const;

export function Resources() {
    const { openJoinModal } = useOutletContext<{ openJoinModal: () => void }>();

    return (
        <section className="bg-band pb-24 pt-12" id="resources">
            <Container>
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        Being written
                    </p>
                    <h1 className="mt-4 text-4xl font-bold leading-[1.15] tracking-tight text-ink md:text-5xl">
                        Guides in <Emphasis>progress</Emphasis>
                    </h1>
                    <p className="mt-6 text-lg leading-relaxed text-muted">
                        We write from questions founders bring to Austin meetups. This page does not
                        pretend a finished library exists. Members get first access when each guide
                        publishes.
                    </p>
                </div>

                <div className="mx-auto mb-16 max-w-2xl rounded-2xl border border-rule bg-paper p-8">
                    <h2 className="text-xl font-bold text-ink">What&apos;s live today (not guides)</h2>
                    <ul className="mt-4 space-y-3 text-muted leading-relaxed">
                        <li>
                            <span className="font-semibold text-ink">Free monthly meetup</span> → Register
                            on Luma
                        </li>
                        <li>
                            <span className="font-semibold text-ink">Optional membership ($149/yr)</span> →
                            private member channel + monthly members-only call + first access to guides
                        </li>
                    </ul>
                </div>

                <div className="mx-auto mb-16 max-w-2xl">
                    <h2 className="text-xl font-bold text-ink">Topics being written</h2>
                    <p className="mt-2 text-sm text-muted">
                        Plain queue — no empty stage cards, no invented count.
                    </p>
                    <ul className="mt-6 space-y-3 border-t border-rule pt-6">
                        {QUEUED_TOPICS.map((topic) => (
                            <li
                                key={topic}
                                className="border-b border-rule pb-3 text-lg text-ink last:border-b-0"
                            >
                                {topic}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
                    <ButtonLink to="/membership" variant="primary" size="lg" className="shadow-lg">
                        Become a member
                    </ButtonLink>
                    <ButtonLink href={LUMA_CALENDAR_URL} external variant="outline" size="lg">
                        Register on Luma
                    </ButtonLink>
                    <Button variant="ghost" size="lg" onClick={openJoinModal}>
                        Leave your details
                    </Button>
                    <p className="mt-2 max-w-md text-sm text-muted">
                        Suggest a topic gap:{' '}
                        <a
                            href="mailto:hello@ifn.community"
                            className="font-semibold text-ink underline underline-offset-4"
                        >
                            hello@ifn.community
                        </a>
                    </p>
                </div>
            </Container>
        </section>
    );
}
