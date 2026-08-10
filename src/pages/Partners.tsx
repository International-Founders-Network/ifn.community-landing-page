import { motion } from 'framer-motion';
import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { Emphasis } from '../components/Emphasis';
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
        default: {
            // A partner added without artwork still gets a filled logo well
            // rather than an empty square. The name is already in the <h3>
            // beside it, so the initials are decorative.
            const initials = partner.name
                .split(' ')
                .map((word) => word.charAt(0))
                .join('')
                .slice(0, 2)
                .toUpperCase();
            return (
                <span aria-hidden="true" className="text-base font-bold tracking-tight text-muted">
                    {initials}
                </span>
            );
        }
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
        <div className="pt-24 pb-20">
            <section className="bg-band py-20 mb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--muted),transparent_70%)] opacity-10" />
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-bold text-ink mb-6 tracking-tight">
                            Our <Emphasis>Partners</Emphasis>
                        </h1>
                        <p className="text-xl text-muted leading-relaxed">
                            The venues, tools, and companies that help IFN run its monthly meetups for
                            international founders in Austin.
                        </p>
                    </div>
                </Container>
            </section>

            <Container className="mb-24">
                {/* The partner names below are <h3>. Without this <h2> the page
                    jumped h1 -> h3, which reads as a missing level in a screen
                    reader's heading list. */}
                <h2 className="text-2xl font-bold text-ink mb-8 tracking-tight">
                    Who we work with
                </h2>
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
                            className="p-8 rounded-2xl border border-rule bg-paper hover:shadow-xl hover:border-edge transition-all flex flex-col gap-4"
                        >
                            <div className="w-14 h-14 rounded-xl bg-band border border-rule flex items-center justify-center overflow-hidden">
                                <PartnerLogo partner={partner} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-ink">{partner.name}</h3>
                                <span className="inline-block mt-1 text-xs font-bold uppercase tracking-wider text-ink bg-ink/10 px-2.5 py-1 rounded-full">
                                    {partner.category}
                                </span>
                            </div>
                            <p className="text-muted leading-relaxed flex-grow">{partner.description}</p>
                            {partner.website && (
                                <a
                                    href={partner.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center min-h-11 text-sm font-bold text-ink hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-lg"
                                >
                                    Visit website
                                    <span className="sr-only"> for {partner.name} (opens in a new tab)</span>
                                    <span aria-hidden="true">&nbsp;&rarr;</span>
                                </a>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                <p className="mt-10 max-w-2xl text-sm text-muted leading-relaxed">
                    <span className="font-bold text-muted">Disclosure:</span> Yani Partners was founded
                    by the same people who run IFN. It is not an outside company recommending us, and we
                    would rather tell you that here than have you find it out later.
                </p>
            </Container>

            <Container className="text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-ink mb-4">Interested in partnering with IFN?</h2>
                    <p className="text-muted mb-8">
                        We're always looking for venues, tools, and service providers who want to support international founders in Austin.
                    </p>
                    {/* shadow-* is DESIGN.md's Action Glow, the one persistent elevation
                        in the system. buttonClasses() does not carry it, so it is passed
                        per call site rather than baked into every primary button. */}
                    <ButtonLink to="/contact" variant="primary" size="lg" className="shadow-lg">
                        Get in Touch
                    </ButtonLink>
                </div>
            </Container>
        </div>
    );
}
