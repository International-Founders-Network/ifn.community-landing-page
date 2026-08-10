import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, Ticket, Users } from 'lucide-react';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { Container } from './Container';
import { Emphasis } from './Emphasis';
import { MEMBERSHIP_PRICE_ATTENDEE, MEMBERSHIP_PRICE_STANDARD } from '../data/membershipData';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';


/**
 * The panel that replaced the decorative orbital system. Every line is a fact
 * IFN can point at (see PRODUCT.md, "Evidence on Hand"), which is worth more to
 * this audience than an animation, and it now renders at every screen width
 * instead of being hidden below `lg`.
 */
const PROOF = [
    {
        icon: CalendarDays,
        title: 'Every month, in person',
        detail: 'More than six months of monthly meetups, all of them in Austin.',
    },
    {
        icon: MapPin,
        title: 'Hosted at Station Austin',
        detail: 'Our venue partner. The address is on every event listing.',
    },
    {
        icon: Users,
        title: 'Structured one-to-one networking',
        detail: 'Run with Reuneo: you are paired for short conversations, one person at a time.',
    },
    {
        icon: Ticket,
        title: 'Free to attend',
        detail: `Register on Luma or Meetup. Membership is a separate, optional layer at ${MEMBERSHIP_PRICE_STANDARD} a year.`,
    },
];

interface FinalCTAProps {
    onJoinClick: () => void;
}

export function FinalCTA({ onJoinClick }: FinalCTAProps) {
    return (
        <section className="py-24 bg-primary relative overflow-hidden text-white">
            {/* Static atmosphere: two soft washes bleeding in from opposing corners. */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.05),transparent_25%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(249,115,22,0.1),transparent_25%)]" />

            <Container size="lg" className="relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

                    <motion.div
                        className="flex-1 text-center lg:text-left"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                            Come to one meetup in <Emphasis onDark>Austin</Emphasis>.
                        </h2>
                        <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Once a month, founders who moved here to build meet in the same room: people
                            working through the same visa questions, the same bank paperwork, the same
                            first hire in another country. Come once and decide from there.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button size="lg" variant="primary" onDark onClick={onJoinClick}>
                                Join the community
                                <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                            </Button>

                            <ButtonLink href={LUMA_CALENDAR_URL} variant="outline" size="lg" onDark>
                                See the next meetup
                                <span className="sr-only"> on Luma</span>
                            </ButtonLink>
                        </div>

                        <p className="mt-6 text-sm text-slate-400 max-w-xl mx-auto lg:mx-0">
                            The meetups cost nothing and you do not need an account to come. Membership
                            (the private member channel, the resource library and monthly office hours) is
                            the paid layer: {MEMBERSHIP_PRICE_STANDARD} a year, or{' '}
                            {MEMBERSHIP_PRICE_ATTENDEE} if you already come to the meetups.
                        </p>
                    </motion.div>

                    <motion.div
                        className="w-full lg:w-auto lg:max-w-sm shrink-0 rounded-2xl border border-white/15 bg-white/5 p-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400 mb-6">
                            What you are signing up for
                        </h3>
                        <ul className="space-y-6">
                            {PROOF.map(({ icon: Icon, title, detail }) => (
                                <li key={title} className="flex gap-4">
                                    <span className="shrink-0 mt-0.5 text-slate-300">
                                        <Icon className="w-5 h-5" aria-hidden="true" />
                                    </span>
                                    <span>
                                        <span className="block font-semibold text-white">{title}</span>
                                        <span className="block text-sm text-slate-400 leading-relaxed">
                                            {detail}
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                </div>
            </Container>
        </section>
    );
}
