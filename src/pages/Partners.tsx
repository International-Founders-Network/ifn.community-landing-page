import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { StationAustinLogo, ReuneoLogo } from '../components/Icons';
import { PARTNERS, type Partner } from '../data/partnersData';

function PartnerLogo({ partner }: { partner: Partner }) {
    switch (partner.id) {
        case 'station-austin':
            return <StationAustinLogo className="w-10 h-10" />;
        case 'reuneo':
            return <ReuneoLogo className="w-10 h-10" />;
        case 'yani-partners':
            return <img src="/partners/yani-partners-logo.png" alt="Yani Partners Logo" className="w-10 h-10 object-contain rounded-full" loading="lazy" />;
        default:
            return null;
    }
}

export function Partners() {
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
                            Our <span className="text-primary italic">Partners</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 leading-relaxed"
                        >
                            The venues, tools, and companies that help IFN run high-signal events for international founders.
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
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {PARTNERS.map((partner) => (
                        <motion.div
                            key={partner.id}
                            variants={item}
                            className="p-8 rounded-2xl border border-slate-100 bg-white hover:shadow-xl hover:border-slate-200 transition-all flex flex-col gap-4"
                        >
                            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                <PartnerLogo partner={partner} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{partner.name}</h3>
                                <span className="inline-block mt-1 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                    {partner.category}
                                </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed flex-grow">{partner.description}</p>
                            {partner.website && (
                                <a
                                    href={partner.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    Visit website &rarr;
                                </a>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </Container>

            <Container className="text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Interested in partnering with IFN?</h2>
                    <p className="text-slate-600 mb-8">
                        We're always looking for venues, tools, and service providers who want to support international founders in Austin.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                    >
                        Get in Touch
                    </Link>
                </div>
            </Container>
        </main>
    );
}
