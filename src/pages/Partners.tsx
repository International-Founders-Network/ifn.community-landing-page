import { motion } from 'framer-motion';
import { Container } from '../components/Container';
import { ButtonLink } from '../components/ButtonLink';
import { Emphasis } from '../components/Emphasis';
import { PARTNERS, type Partner } from '../data/partnersData';

/**
 * THE LOGO WELL, AND THE HONEST GAP INSIDE IT.
 *
 * This used to switch on `partner.id`. Two of the three branches rendered
 * `StationAustinLogo` and `ReuneoLogo`, which hotlinked
 * `google.com/s2/favicons`, so every visitor to this page sent their IP to
 * Google to fetch a 16px favicon standing in for a logo. Both components are
 * deleted from `Icons.tsx` and this page no longer imports that module at all.
 *
 * The `default` branch is gone with them, and its deletion is deliberate rather
 * than incidental: it rendered generated INITIALS ("SA", "R"). A generated mark
 * is permitted only for invented brands. These are real companies, so a
 * monogram would put artwork on the page that the company did not make and does
 * not use, which misrepresents them more quietly than a favicon did. The same
 * reasoning is already recorded in `PartnersStrip.tsx`, which reserves its slots
 * the same way.
 *
 * Artwork is now a data field. `Partner.logo` points at a local file under
 * `public/partners/` and carries the intrinsic dimensions and the mark's form;
 * a partner without one gets the reserved slot below. Adding real artwork is
 * dropping a file in and adding one `logo` key in `src/data/partnersData.ts`,
 * with no edit to this file or to the home page strip. The full instruction for
 * the founder, including target dimensions per form, is in that file's header.
 *
 * This supersedes the footprint plan's literal snippet for this function, which
 * hardcoded `partner.id === 'yani-partners'` as the artwork test. That is the
 * switch statement this change exists to remove, and the drop-in requirement in
 * the file-ownership brief is the later and narrower instruction.
 *
 * MEASURED, both modes, since this function makes every colour decision on the
 * page that changed:
 *   1px `--rule` well border on the card's `--paper` ground   4.063 / 4.005
 *   1px `--rule` well border against the well's `--band` fill 3.682 / 3.638
 *   `--muted` reserved-slot label on the `--band` fill        5.982 / 6.808
 * All four rule numbers clear the 3.0 non-text floor and both label numbers
 * clear 4.5. The border is not decoration: the `--band` well against the
 * `--paper` card measures 1.103 in light and 1.101 in dark, so ground tone alone
 * cannot carry the well's boundary and the hairline is the mechanism. Dashed
 * rather than solid on the reserved slot so a pending box cannot be mistaken for
 * a filled one; each drawn segment is a full-opacity 1px `--rule`, never an
 * `opacity` or an alpha colour, which is what keeps the measured number the
 * number that ships.
 */
function PartnerLogo({ partner }: { partner: Partner }) {
    const well = 'w-14 h-14 rounded-xl bg-band border flex items-center justify-center overflow-hidden';

    if (partner.logo) {
        /* `max-h`/`max-w` rather than a fixed `w-10 h-10` so one rule sizes both
           forms: a square emblem clamps to 40 x 40 exactly as the previous fixed
           size did, and a horizontal lockup fills the 48px width and takes
           whatever height its ratio gives it instead of being squashed into a
           square box. `object-contain` never crops.

           The retired `rounded-full` is not carried over, and its absence now
           matters more than it did when it was dropped. It was safe then because
           the sole vendored file was a centred disc occupying a 1420px bounding
           box inside a 2000px canvas, so at 40px the artwork had a 14.2px radius
           inside a 20px inscribed clip circle and the clip removed zero opaque
           pixels. It would not be safe now: the Station Austin lockup is 2.18:1,
           and a circular clip would take the ends off the wordmark. Do not
           reinstate it.

           `width`/`height` come from the data and fix the aspect ratio so the
           box is reserved before the file loads. */
        return (
            <div className={`${well} border-rule`}>
                <img
                    src={partner.logo.src}
                    alt={`${partner.name} logo`}
                    width={partner.logo.width}
                    height={partner.logo.height}
                    className="max-h-10 max-w-12 object-contain"
                    loading="lazy"
                    decoding="async"
                />
            </div>
        );
    }

    /* TODO(founder): vendor real artwork for this partner into
       public/partners/ and add its `logo` key in src/data/partnersData.ts.
       Until then this stays a labelled placeholder. Do not restore the
       google.com/s2/favicons hotlink and do not substitute a drawn monogram.

       `aria-hidden` matches the node this replaces, which was also hidden, so
       there is no accessibility delta here. It is the right call independently:
       the 56px well is too small to hold the partner's name, so an announced
       "Logo pending" would arrive ahead of the <h3> with no antecedent to attach
       to. `PartnersStrip` makes the opposite call because its wider slot carries
       the name, so there it announces coherently. */
    return (
        <div className={`${well} border-dashed border-rule`} aria-hidden="true">
            <span className="px-1 text-center text-[0.6875rem] font-semibold leading-[1.3] text-muted">
                Logo
                <span className="block font-normal">pending</span>
            </span>
        </div>
    );
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
                            {/* The well moved into PartnerLogo so the border can
                                be solid for real artwork and dashed for a
                                reserved slot. Dimensions, ground and radius are
                                unchanged from what shipped. */}
                            <PartnerLogo partner={partner} />
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

                {/* The Yani Partners related-party disclosure was removed here on
                    2026-08-10 at the founder's direction. PRODUCT.md was updated
                    in the same commit so the repo does not mandate a sentence the
                    page no longer prints. */}
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
