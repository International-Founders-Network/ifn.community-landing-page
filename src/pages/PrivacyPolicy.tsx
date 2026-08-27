import { Container } from '../components/Container';
import { Emphasis } from '../components/Emphasis';

const SECTION_HEADING = 'mb-4 text-2xl font-bold text-ink';
const BODY = 'leading-relaxed text-muted';
const LIST = 'mt-4 list-disc space-y-2 pl-6 text-muted marker:text-muted';
const MAIL_LINK =
    'rounded-sm font-semibold text-ink underline decoration-rule underline-offset-4 hover:decoration-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export function PrivacyPolicy() {
    return (
        <Container size="md" className="py-24">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-ink md:text-5xl">
                    Privacy <Emphasis>Policy</Emphasis>
                </h1>
                <p className="mb-4 text-lg leading-relaxed text-muted">
                    This page explains what the International Founders Network (IFN) does with the information
                    you give us on ifn.community. It is written in plain language on purpose.
                </p>
                <p className="mb-16 text-sm text-muted">Last updated: August 8, 2026</p>

                <div className="space-y-12">
                    <section>
                        <h2 className={SECTION_HEADING}>1. Who we are</h2>
                        <p className={BODY}>
                            IFN is a founder-run community for international and immigrant founders, based in
                            Austin, Texas. If you have a question about anything on this page, write to{' '}
                            <a href="mailto:hello@ifn.community" className={MAIL_LINK}>
                                hello@ifn.community
                            </a>
                            .
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>2. What we collect</h2>
                        <p className={BODY}>
                            We only collect what you type into a form on this site. There is no account to
                            create and no login for visitors.
                        </p>
                        <ul className={LIST}>
                            <li>
                                <strong className="text-ink">If you apply to join:</strong> your name,
                                email address, and (if you choose to add them) your LinkedIn address and the
                                stage your company is at.
                            </li>
                            <li>
                                <strong className="text-ink">If you use the contact form:</strong> your
                                name, email address, your message, and optionally your phone number and company
                                name.
                            </li>
                            <li>
                                <strong className="text-ink">If you ask to be told about events:</strong>{' '}
                                your email address.
                            </li>
                            <li>
                                <strong className="text-ink">Technical information:</strong> our hosting
                                provider records ordinary web-server data such as your internet protocol (IP)
                                address and which browser you used. This is not linked to your name.
                            </li>
                        </ul>
                        <p className={`mt-4 ${BODY}`}>
                            We do not use advertising trackers, and we do not sell or rent your information to
                            anyone.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>3. What we use it for</h2>
                        <ul className={LIST}>
                            <li>To reply to you and to answer the question you asked.</li>
                            <li>To contact you about IFN when you have asked us to.</li>
                            <li>To run the paid membership for people who have bought one.</li>
                            <li>To understand roughly how many people are interested in IFN.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>4. Who else sees it</h2>
                        <p className={BODY}>
                            IFN is a small team, and the people who run IFN are the only people who read your
                            submissions. A few companies handle the technical parts of running this site and
                            therefore process some of your data on our behalf:
                        </p>
                        <ul className={LIST}>
                            <li>
                                <strong className="text-ink">Netlify</strong> hosts the website and its
                                server functions.
                            </li>
                            <li>
                                <strong className="text-ink">Neon</strong> hosts the database where form
                                submissions are stored.
                            </li>
                            <li>
                                <strong className="text-ink">Stripe</strong> takes membership payments.
                                Your card details go to Stripe, never to us. IFN never sees or stores a card
                                number.
                            </li>
                            <li>
                                <strong className="text-ink">Luma</strong> and{' '}
                                <strong className="text-ink">Meetup</strong> host our event listings. If
                                you register for a meetup there, that registration is covered by their privacy
                                policies, not this one.
                            </li>
                            <li>
                                <strong className="text-ink">Google Analytics</strong> counts visits to
                                this site. It is switched off until you allow it: nothing is stored on your
                                device and no cookie is set unless you choose &ldquo;Allow analytics&rdquo;.
                                Even then, we never send it your name, your email address, or anything you
                                typed into a form. If you choose &ldquo;No thanks&rdquo;, we still receive an
                                anonymous count of the page being viewed, with nothing stored on your device
                                and nothing that could identify you.
                            </li>
                        </ul>
                        <p className={`mt-4 ${BODY}`}>
                            Beyond that, we share information only when the law requires it.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>5. How long we keep it</h2>
                        <p className={BODY}>
                            We keep form submissions for as long as IFN is running the community they relate
                            to, unless you ask us to delete them. Ask, and we will delete your record.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>6. Cookies and analytics</h2>
                        <p className={BODY}>
                            This site sets no cookies of its own. The only cookies that can ever be set here
                            belong to Google Analytics, and they are set only after you choose
                            &ldquo;Allow analytics&rdquo; in the banner at the bottom of the page. Until you
                            do, Google Analytics runs in a mode that stores nothing on your device.
                        </p>
                        <p className={`mt-4 ${BODY}`}>
                            We use it to answer one question: which pages people find useful. We do not use
                            it to build a profile of you, and advertising and personalisation signals are
                            switched off permanently rather than being offered as a choice, because this site
                            carries no advertising.
                        </p>
                        <p className={`mt-4 ${BODY}`}>
                            You can change your mind at any time by clearing this site&rsquo;s data in your
                            browser, which makes the banner appear again. Your browser&rsquo;s
                            &ldquo;Do Not Track&rdquo; or tracking-protection settings are also respected by
                            the ad blockers most people already use, and nothing on this site tries to work
                            around them.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>7. Your choices</h2>
                        <p className={BODY}>
                            You can ask us what we hold about you, ask us to correct it, or ask us to delete
                            it. Write to{' '}
                            <a href="mailto:hello@ifn.community" className={MAIL_LINK}>
                                hello@ifn.community
                            </a>{' '}
                            and say what you want done. You do not need to give a reason.
                        </p>
                    </section>

                    <section>
                        <h2 className={SECTION_HEADING}>8. Changes to this page</h2>
                        <p className={BODY}>
                            If we change how we handle your information, we will update this page and change the
                            date at the top.
                        </p>
                    </section>
                </div>
            </div>
        </Container>
    );
}
