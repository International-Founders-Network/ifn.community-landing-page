import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { Emphasis } from '../components/Emphasis';

const SECTION_HEADING = 'mb-4 text-2xl font-bold text-ink';
const BODY = 'leading-relaxed text-muted';
const LIST = 'mt-4 list-disc space-y-2 pl-6 text-muted marker:text-muted';
const INLINE_LINK =
    'rounded-sm font-semibold text-ink underline decoration-rule underline-offset-4 hover:decoration-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export function TermsAndConditions() {
    return (
        <Container size="md" className="py-24">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-ink md:text-5xl">
                    Terms and <Emphasis>Conditions</Emphasis>
                </h1>
                <p className="mb-4 text-lg leading-relaxed text-muted">
                    These terms cover the ifn.community website, IFN events, and IFN membership. They are
                    written plainly because most of the people reading them are reading in a second language.
                </p>
                <p className="mb-16 text-sm text-muted">Last updated: August 8, 2026</p>

                <div className="space-y-12">
                    <section>
                        <h2 className={SECTION_HEADING}>1. Agreement</h2>
                        <p className={BODY}>
                            By using this website, attending an IFN event, or buying an IFN membership, you
                            agree to these terms. They are an agreement between you, whether for yourself or
                            on behalf of a company, and the International Founders Network ("IFN", "we",
                            "us"). If you do not agree with them, please do not use the site.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>2. What IFN provides</h2>
                        <p className={BODY}>
                            IFN runs a monthly in-person meetup in Austin, Texas, publishes a resource library,
                            and sells an annual membership. We introduce founders to each other and to service
                            providers we know. We do not take equity, we do not guarantee introductions, and we
                            do not promise any business outcome.
                        </p>
                        <p className={`mt-4 ${BODY}`}>
                            Event listings and registration are handled on third-party platforms such as Luma
                            and Meetup, and events are held at partner venues. Those platforms and venues have
                            their own terms, which apply alongside ours.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>3. Membership and payment</h2>
                        <p className={BODY}>
                            Membership is sold as an annual subscription at the price shown at checkout.
                            Payments are processed by Stripe; IFN never receives or stores your card details.
                            Membership gives you access to the private member channel, the resource library, and
                            the monthly members-only office-hours call for the period you paid for.
                        </p>
                        <p className={`mt-4 ${BODY}`}>
                            If a payment goes wrong, or if you believe you were charged in error, write to{' '}
                            <a href="mailto:hello@ifn.community" className={INLINE_LINK}>
                                hello@ifn.community
                            </a>{' '}
                            and a person will look at it.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>4. How you agree to behave</h2>
                        <p className={BODY}>
                            Everything IFN runs (the site, the events, and the member channel) is governed by
                            our{' '}
                            <Link to="/code-of-conduct" className={INLINE_LINK}>
                                Code of Conduct
                            </Link>
                            . In addition, when using this site you agree that:
                        </p>
                        <ul className={LIST}>
                            <li>You are old enough to enter a contract where you live.</li>
                            <li>You will not use the site for anything illegal.</li>
                            <li>
                                You will not collect other people&apos;s details from IFN spaces to sell,
                                market, or recruit without their permission.
                            </li>
                            <li>
                                You will not use bots, scrapers, or automated tools against the site, and will
                                not try to break or overload it.
                            </li>
                        </ul>
                        <p className={`mt-4 ${BODY}`}>
                            We may remove anyone from IFN spaces for breaking these terms or the Code of
                            Conduct.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>5. We do not give professional advice</h2>
                        <p className={BODY}>
                            This matters more at IFN than at most communities. Nothing on this site, said at an
                            IFN event, or shared in the member channel is legal, immigration, tax, accounting,
                            or investment advice. That includes anything about visas, company registration,
                            banking, or fundraising. Members and partners share their own experience, which is
                            useful and is not a substitute for a licensed professional who has looked at your
                            situation. Any partner or service provider we introduce you to is an independent
                            company, and any agreement you make with them is between you and them.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>6. Content on this site</h2>
                        <p className={BODY}>
                            The design, text, code, and logos on this site belong to IFN or are used with
                            permission, and partner names and logos belong to those partners. You may read,
                            quote, and link to this site. You may not copy it wholesale or present it as your
                            own.
                        </p>
                        <p className={`mt-4 ${BODY}`}>
                            Anything you send us (a message, an application, a resource suggestion) stays
                            yours. By sending it you allow us to read it and act on it for the purpose you sent
                            it for. How we handle it is described in our{' '}
                            <Link to="/privacy-policy" className={INLINE_LINK}>
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>7. Limits on our liability</h2>
                        <p className={BODY}>
                            The site and the community are provided as they are. To the fullest extent the law
                            allows, IFN and the people who run it are not liable for indirect or consequential
                            losses (including lost profit, lost revenue, or lost data) arising from your use
                            of the site, from attending an event, or from acting on something you heard in the
                            community. Nothing here limits liability that cannot be limited by law.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>8. Governing law</h2>
                        <p className={BODY}>
                            These terms, and your use of the site, are governed by the laws of the State of
                            Texas, United States, without regard to its conflict-of-law rules.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>9. Changes to these terms</h2>
                        <p className={BODY}>
                            We may update these terms. When we do, we will change the date at the top of this
                            page. Continuing to use the site after that means you accept the updated terms.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>10. Contact</h2>
                        <p className={BODY}>
                            For anything about these terms, or a complaint about the site, write to{' '}
                            <a href="mailto:hello@ifn.community" className={INLINE_LINK}>
                                hello@ifn.community
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </Container>
    );
}
