import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Compass, Handshake, MapPin, ShieldCheck, Users } from 'lucide-react';
import { Container } from '../components/Container';
import { Button } from '../components/Button';
import { ButtonLink } from '../components/ButtonLink';
import { Emphasis } from '../components/Emphasis';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';


export function About() {
    const { openJoinModal } = useOutletContext<{ openJoinModal: () => void }>();

    // Every fact below is checkable: the venue, the format partner, the cadence,
    // and who runs it. See PRODUCT.md "Evidence on Hand" before adding to this list.
    const facts = [
        {
            label: 'Where',
            value: 'Station Austin',
            detail: 'Our venue partner, in Austin, Texas.',
        },
        {
            label: 'How often',
            value: 'Once a month',
            detail: 'One in-person meetup, every month, for more than six months so far.',
        },
        {
            label: 'What happens',
            value: 'Introductions, not mingling',
            detail: 'We use a structured one-to-one format run with our partner Reuneo, so you leave having actually spoken with a few people.',
        },
        {
            label: 'Who runs it',
            value: 'A small founding team',
            detail: 'The same people who founded Yani Partners, a fractional technology firm. We say so because you should know who is behind this.',
        },
    ];

    const values = [
        {
            icon: <MapPin className="w-6 h-6" aria-hidden="true" />,
            title: 'Austin first',
            description:
                'The meetup is in Austin and so are the people who host it. Founders join us from other cities and other countries, and that is welcome, but we will not describe ourselves as something larger than the room we can fill.',
        },
        {
            icon: <CalendarDays className="w-6 h-6" aria-hidden="true" />,
            title: 'One meetup a month',
            description:
                'A single date, every month, in person. One date a month is something a small team can actually keep to, which is why it has held for more than six months rather than fading out.',
        },
        {
            icon: <Compass className="w-6 h-6" aria-hidden="true" />,
            title: 'Practical answers',
            description:
                'Visa status, opening a United States bank account, setting up a company, hiring someone in another country. These questions get answered by founders who have already been through them.',
        },
        {
            icon: <Users className="w-6 h-6" aria-hidden="true" />,
            title: 'You meet people, not a room',
            description:
                'Our speed-networking format pairs you with a few founders for real conversations. Nobody is left standing at the edge holding a drink, which is the part most newcomers dread.',
        },
        {
            icon: <Handshake className="w-6 h-6" aria-hidden="true" />,
            title: 'No equity, no selection',
            description:
                'You do not give up any part of your company to be here, and you are not screened for admission. Membership is a flat yearly fee, and it is optional.',
        },
        {
            icon: <ShieldCheck className="w-6 h-6" aria-hidden="true" />,
            title: 'We only claim what we can prove',
            description:
                'No borrowed logos, no invented numbers, no quotes from people who do not exist. You are choosing who to trust in an unfamiliar country, and we would rather be small and accurate.',
        },
    ];

    return (
        <div className="pt-24 pb-20">
            {/* Hero */}
            <section className="bg-slate-50 py-24 mb-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary-light),transparent_70%)] opacity-10" />
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                            Built in <Emphasis>Austin</Emphasis>, for founders who came from somewhere else
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            The International Founders Network (IFN) runs a monthly in-person meetup in Austin, Texas
                            for people building a company in a country they did not grow up in. We have run it every
                            month for more than six months.
                        </p>
                    </div>
                </Container>
            </section>

            {/* Why IFN exists + what a meetup actually is */}
            <Container className="mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Why IFN exists</h2>
                        <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                            Most people who start a company after moving to Austin hit the same wall, and it is not the
                            product. It is a legal system you did not grow up in, a visa that limits what you are allowed
                            to do, a bank that asks for documents you have never heard of, and a professional network
                            that has to be rebuilt from nothing.
                        </p>
                        <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                            There are two usual answers and neither one fits. General startup meetups are friendly but
                            never touch any of that. Accelerators do touch it, but they take a share of your company,
                            they decide who is allowed in, and they run on one fixed cycle a year.
                        </p>
                        <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                            IFN sits between the two. One meetup a month, open to anyone who wants to come, plus an
                            optional{' '}
                            <Link
                                to="/membership"
                                className="font-semibold text-primary underline underline-offset-4 decoration-slate-300 hover:decoration-primary transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                                yearly membership
                            </Link>{' '}
                            for the part that happens between meetups.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Around 100 to 300 people are on our meetup and newsletter list — a real number, and a
                            modest one. We would rather print it than round it up.
                        </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sm:p-10">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">What a meetup actually is</h3>
                        <p className="text-slate-600 leading-relaxed mb-8">
                            Four things you can check before you decide whether to come.
                        </p>
                        <dl className="divide-y divide-slate-200">
                            {facts.map((fact) => (
                                <div key={fact.label} className="py-5 first:pt-0 last:pb-0">
                                    <dt className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 mb-2">
                                        {fact.label}
                                    </dt>
                                    <dd>
                                        <span className="block text-lg font-bold text-slate-900 mb-1">{fact.value}</span>
                                        <span className="block text-slate-600 leading-relaxed">{fact.detail}</span>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <a
                            href={LUMA_CALENDAR_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-8 text-base font-bold text-primary underline underline-offset-4 decoration-slate-300 hover:decoration-primary transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            See the next meetup on Luma
                            <span aria-hidden="true" className="ml-1">&rarr;</span>
                            <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                    </div>
                </div>
            </Container>

            {/* How we work — dark inset slab */}
            <section className="bg-slate-900 py-32 rounded-3xl mx-4 sm:mx-8 mb-32 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent opacity-10 rounded-full blur-[100px] -ml-48 -mb-48" />

                <Container>
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">How we work</h2>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            Six things that are true about IFN today. If any of them stops being true, this page changes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((v, i) => (
                            <motion.div
                                key={v.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-colors"
                            >
                                <div className="bg-white/10 text-white p-3 rounded-lg inline-flex mb-6">
                                    {v.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{v.title}</h3>
                                <p className="text-slate-300 leading-relaxed">{v.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Closing */}
            <Container className="text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Come to the next meetup</h2>
                    <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                        The honest way to find out whether IFN is useful to you is to spend one evening in the room and
                        talk to the people there. One city, one venue, once a month. You do not have to be selected to
                        come.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" onClick={openJoinModal}>
                            Join IFN
                        </Button>
                        <ButtonLink to="/events" variant="outline" size="lg">
                            See upcoming meetups
                        </ButtonLink>
                    </div>
                </div>
            </Container>
        </div>
    );
}
