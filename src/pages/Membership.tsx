import { motion } from 'framer-motion';
import { Container } from '../components/Container';
import { MEMBERSHIP_BENEFITS, MEMBERSHIP_PRICE_RANGE, STRIPE_PAYMENT_LINK } from '../data/membershipData';

export function Membership() {
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <main className="pt-24 pb-20">
            <section className="bg-slate-50 py-20 mb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary-light),transparent_70%)] opacity-10" />
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight"
                        >
                            IFN <span className="text-primary italic">Membership</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 leading-relaxed"
                        >
                            You've been to the meetups. Membership is the next layer — direct access to the community and resources between events, for founders who want more than a monthly meetup.
                        </motion.p>
                    </div>
                </Container>
            </section>

            <Container className="mb-24">
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {MEMBERSHIP_BENEFITS.map((benefit) => (
                        <motion.div
                            key={benefit.id}
                            variants={item}
                            className="p-8 rounded-2xl border border-slate-100 bg-white hover:shadow-xl hover:border-slate-200 transition-all flex flex-col gap-3"
                        >
                            <h3 className="text-xl font-bold text-slate-900">{benefit.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </Container>

            <Container className="text-center">
                <div className="max-w-2xl mx-auto p-10 rounded-2xl border border-slate-100 bg-slate-50">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{MEMBERSHIP_PRICE_RANGE}</h2>
                    <p className="text-slate-600 mb-8">
                        Exact pricing and billing options are shown at checkout. Cancel anytime.
                    </p>
                    <a
                        href={STRIPE_PAYMENT_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                    >
                        Join IFN Membership
                    </a>
                </div>
            </Container>
        </main>
    );
}
