import { motion } from 'framer-motion';
import { Container } from './Container';
import { Emphasis } from './Emphasis';
import { ButtonLink } from './ButtonLink';
import { StationAustinLogo, ReuneoLogo } from './Icons';
import { PARTNERS, type Partner } from '../data/partnersData';

/**
 * The three named partners, surfaced on the home page.
 *
 * `/partners` existed but was reachable only from a footer link, so the single
 * strongest credibility asset IFN has — three companies a sceptical visitor can
 * look up — never appeared on the page where the question "is this real?" is
 * actually asked. This is the compact answer: names, roles, and one honest
 * disclosure. The full cards stay on `/partners`; this strip does not repeat them.
 *
 * Ground is Harbor Mist, so it sits between the two Paper bands around it and
 * separates them by tone rather than by a rule. Amber appears exactly once here,
 * in the headline's italic word.
 */

/**
 * Real artwork only — the same sources `/partners` uses. Anything without a logo
 * gets a filled well with initials rather than an empty square; the name is
 * already in the <h3> beside it, so the initials are decorative.
 */
function PartnerLogo({ partner }: { partner: Partner }) {
    switch (partner.id) {
        case 'station-austin':
            return <StationAustinLogo className="w-8 h-8" />;
        case 'reuneo':
            return <ReuneoLogo className="w-8 h-8" />;
        case 'yani-partners':
            return (
                <img
                    src="/partners/yani-partners-logo.png"
                    alt="Yani Partners Logo"
                    className="w-8 h-8 object-contain rounded-full"
                    loading="lazy"
                />
            );
        default: {
            const initials = partner.name
                .split(' ')
                .map((word) => word.charAt(0))
                .join('')
                .slice(0, 2)
                .toUpperCase();
            return (
                <span aria-hidden="true" className="text-sm font-bold tracking-tight text-slate-500">
                    {initials}
                </span>
            );
        }
    }
}

export function PartnersStrip() {
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <section className="py-24 bg-slate-50" id="partners">
            <Container>
                <div className="max-w-3xl mb-12">
                    <p className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase mb-4">
                        Who we work with
                    </p>
                    {/* Headline scale, matching every sibling section on Home.
                        Ground is Harbor Mist — light — so Emphasis stays on its
                        light-ground colour and must not take onDark. */}
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                        Three named <Emphasis>partners</Emphasis>, and what each one does
                    </h2>
                    {/* Three distinct jobs, kept distinct. Station Austin and Reuneo
                        are what make a meetup happen; Yani Partners is not, and a
                        sentence that flattened all three into "they run the meetups"
                        would be exactly the overclaiming this section exists to
                        answer. */}
                    <p className="text-lg text-slate-600 leading-relaxed">
                        A partner here is a company with one specific job: the venue the meetups
                        are held in, the speed-networking format that pairs founders into
                        one-to-one conversations, and fractional technology help for founders and
                        small teams.
                    </p>
                </div>

                <motion.ul
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {/* Name and role only. The full description belongs to /partners;
                        repeating it here would make this a second copy of that page
                        rather than a way into it — and `category` already carries the
                        role, so the strip has no second source of truth to drift from. */}
                    {PARTNERS.map((partner) => (
                        <motion.li
                            key={partner.id}
                            variants={item}
                            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6"
                        >
                            {/* One well size for all three, with object-contain inside
                                it, so a square favicon and a round photograph read at
                                the same optical weight instead of one filling the box. */}
                            <div className="w-12 h-12 flex-none rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                                <PartnerLogo partner={partner} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                    {partner.name}
                                </h3>
                                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                                    {partner.category}
                                </p>
                            </div>
                        </motion.li>
                    ))}
                </motion.ul>

                {/* PRODUCT.md requires this disclosure to travel with the Yani
                    Partners claim wherever the claim appears — not only on
                    /partners. It is the point of the section, not a footnote. */}
                <p className="mt-8 max-w-2xl text-sm text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-600">Disclosure:</span> Yani Partners was
                    founded by the same people who run IFN. It is not an outside company
                    recommending us, and we would rather tell you that here than have you find it
                    out later.
                </p>

                <div className="mt-10">
                    <ButtonLink to="/partners" variant="outline">
                        Read about each partner
                    </ButtonLink>
                </div>
            </Container>
        </section>
    );
}
