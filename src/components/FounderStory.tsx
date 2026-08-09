import { motion } from 'framer-motion';
import { Container } from './Container';
import { Emphasis } from './Emphasis';

export function FounderStory() {
    // Only claims PRODUCT.md lists as citable appear here: six-plus months of
    // monthly Austin meetups, Station Austin as venue, Reuneo running the
    // speed-networking format, and Yani Partners — with the shared-founders
    // disclosure attached, which is a condition of naming them at all.
    const record = [
        {
            title: 'Every month, in person',
            detail: 'More than six months of monthly meetups in Austin, with every date published on Luma and Meetup.',
        },
        {
            title: 'Hosted at Station Austin',
            detail: 'Our venue partner gives the meetup a fixed home in the middle of the Austin startup community.',
        },
        {
            title: 'Structured by Reuneo',
            detail: 'Their format pairs founders into short one-to-one conversations, so nobody spends the meetup standing alone.',
        },
    ];

    return (
        <section className="py-24 lg:py-32 bg-slate-50">
            <Container size="md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 mb-5">
                            Who is behind this
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6">
                            The meetups came <Emphasis>first</Emphasis>
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                        <p className="text-lg text-slate-600 leading-relaxed">
                            IFN began as a room full of international founders in Austin, and it has met every month for
                            more than six months. The membership, the resource library and this website came afterwards,
                            built out of what people kept asking for in that room — how to handle a visa while running a
                            company, how to open a U.S. bank account, how to rebuild a professional network from nothing.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            We are a small, founder-run organization, so we would rather show you what already exists
                            than describe a plan. Station Austin hosts the meetups. Reuneo runs the speed-networking
                            format. Yani Partners, our fractional Chief Technology Officer partner, was founded by the
                            same team behind IFN — we say that plainly, because you should be able to tell an outside
                            endorsement from our own work.
                        </p>
                    </div>

                    <dl className="mt-14 grid sm:grid-cols-3 gap-6 border-t border-slate-200 pt-10">
                        {record.map((fact) => (
                            <div key={fact.title}>
                                <dt className="text-base font-bold text-slate-900 mb-2">{fact.title}</dt>
                                <dd className="text-slate-600 leading-relaxed">{fact.detail}</dd>
                            </div>
                        ))}
                    </dl>
                </motion.div>
            </Container>
        </section>
    );
}
