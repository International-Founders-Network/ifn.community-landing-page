import { motion } from 'framer-motion';
import { Calendar, Users, TrendingUp, BookOpen } from 'lucide-react';
import { Container } from './Container';

export function ValueProps() {
    const features = [
        {
            icon: Users,
            title: 'Mentorship & Peer Matching',
            description: 'Connect with founders who\'ve navigated your exact challenges — from visa hurdles to first US customers.',
            color: 'bg-indigo-500',
        },
        {
            icon: TrendingUp,
            title: 'Opportunities & Founder Connections',
            description: 'Tap into a network where warm intros, collaborations, and opportunities happen naturally through trusted relationships.',
            color: 'bg-emerald-500',
        },
        {
            icon: Calendar,
            title: 'Global Events & Local Connections',
            description: 'Two high-signal founder sessions per month. From virtual summits to local chapter meetups.',
            color: 'bg-blue-500',
        },
        {
            icon: BookOpen,
            title: 'Resources & Founder Toolkit',
            description: 'Actionable playbooks and templates. Exclusive vetted library and weekly curated insights.',
            color: 'bg-amber-500',
        },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="py-24 bg-white" id="mentorship">

            <Container>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Built for Founders, By Founders</h2>
                    <p className="text-lg text-slate-600">
                        Whether you're building your first startup in São Paulo or scaling your third in Singapore, you belong here.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 gap-8 lg:gap-12"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={item}
                            className="flex gap-6 p-6 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
                        >
                            <div className={`shrink-0 w-14 h-14 rounded-xl ${feature.color} bg-opacity-10 flex items-center justify-center`}>
                                <feature.icon className={`w-7 h-7 ${feature.color.replace('bg-', 'text-')}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </Container>
        </section>
    );
}
