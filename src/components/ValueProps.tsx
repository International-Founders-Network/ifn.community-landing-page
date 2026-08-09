import { motion } from 'framer-motion';
import { CalendarDays, Users, Handshake, BookOpen } from 'lucide-react';
import { Container } from './Container';
import { Emphasis } from './Emphasis';

export function ValueProps() {
    // Every claim below is checked against PRODUCT.md "Evidence on Hand":
    // one monthly in-person meetup in Austin (six-plus months of it), Station
    // Austin as venue, Reuneo running the speed-networking format, a member
    // channel, a resource library, and one members-only call a month.
    const features = [
        {
            icon: Users,
            title: 'Founders who solved it before you',
            description:
                'You will meet founders who have opened a U.S. bank account, worked through a visa, or made a first hire here. The answer comes from someone who has done it, not from a search result.',
        },
        {
            icon: CalendarDays,
            title: 'A meetup you can put in your calendar',
            description:
                'One a month, in person, at Station Austin — not a conference circuit, and not a network of chapters in other cities. Every date is published openly on Luma and Meetup, so you can see the history before you commit to anything.',
        },
        {
            icon: Handshake,
            title: 'Introductions that come from meeting people',
            description:
                'There is no matching system here. Introductions happen the ordinary way: you meet someone at a meetup, they know the person you need, and they say so.',
        },
        {
            icon: BookOpen,
            title: 'Notes and templates you can use the same week',
            description:
                'The resource library covers immigration paperwork, U.S. banking, and first hires — written from the questions founders actually bring to the meetups. Membership adds a private member channel and a members-only call each month.',
        },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <section className="py-24 bg-white" id="mentorship">
            <Container>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-600 mb-6">
                        Austin, Texas
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-5">
                        Built for founders starting from <Emphasis>zero</Emphasis> in a new country
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        IFN meets in person in Austin every month, and has done so for more than six months. Whether you
                        moved here last year or are still planning the move, the same problems come up: visas, U.S.
                        banking, funding rules nobody explained to you, and a professional network that does not exist
                        yet.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid md:grid-cols-2 gap-8"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={item}
                            className="group flex gap-6 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 transition-[background-color,border-color,box-shadow] duration-300 hover:border-slate-300 hover:shadow-lg"
                        >
                            <div
                                className="shrink-0 w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary group-hover:border-primary"
                                aria-hidden="true"
                            >
                                <feature.icon
                                    className="w-6 h-6 text-primary transition-colors duration-300 group-hover:text-white"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </Container>
        </section>
    );
}
