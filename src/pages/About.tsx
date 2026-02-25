import { Container } from '../components/Container';
import { Globe, Users, Target, Rocket, Heart, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function About() {
    const values = [
        {
            icon: <Heart className="w-6 h-6" />,
            title: "Founder First",
            description: "Everything we do is designed to support the person behind the business. We understand the unique challenges of the founder's journey."
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: "Global Perspective",
            description: "Innovation has no borders. We bridge the gap between global ecosystems, bringing diverse perspectives to the table."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Collaborative Growth",
            description: "We believe in the power of 'paying it forward'. When one founder succeeds, we all succeed through shared knowledge and support."
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Trusted Community",
            description: "A safe, high-trust environment where founders can be vulnerable, share real challenges, and get authentic feedback."
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: "Impact Driven",
            description: "We're not just about building businesses; we're about building solutions that matter and have a positive global impact."
        },
        {
            icon: <Rocket className="w-6 h-6" />,
            title: "Bias for Action",
            description: "We value speed, experimentation, and results. We help founders move faster by removing friction and providing the right resources."
        }
    ];

    return (
        <main className="pt-24 pb-20">
            {/* Hero Section */}
            <section className="bg-slate-50 py-24 mb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary-light),transparent_70%)] opacity-10" />
                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight"
                        >
                            Empowering the World's <span className="text-primary italic">Next-Gen Founders</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 leading-relaxed mb-8"
                        >
                            The International Founders Network (IFN) is a global community of high-impact entrepreneurs dedicated to building the future through collaboration, mentorship, and shared resources.
                        </motion.p>
                    </div>
                </Container>
            </section>

            {/* Our Story / Mission */}
            <Container className="mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
                        <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                            IFN started with a simple observation: the most successful founders don't build in isolation. They are part of a rich tapestry of mentors, peers, and advisors who provide the support system necessary to navigate the highs and lows of entrepreneurship.
                        </p>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            Our mission is to democratize access to the high-level networks and knowledge that have traditionally been confined to a few global tech hubs. By connecting founders from Austin to Bangalore, and beyond, we're creating a truly global ecosystem where talent meets opportunity.
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-6">
                            <div>
                                <div className="text-4xl font-bold text-primary mb-1">500+</div>
                                <div className="text-slate-500 font-medium">Global Founders</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-primary mb-1">20+</div>
                                <div className="text-slate-500 font-medium">Cities Represented</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070"
                                alt="Founders collaborating"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-xl max-w-xs hidden md:block border border-slate-100">
                            <p className="text-slate-600 italic mb-4">"IFN has been the single most valuable resource for my startup's growth. The connections are real and the support is consistent."</p>
                            <div className="font-bold text-slate-900">— Sarah Chen, Founder of EcoSync</div>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Core Values */}
            <section className="bg-slate-900 py-32 rounded-[3rem] mx-4 sm:mx-8 mb-32 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-10 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent opacity-10 rounded-full blur-[100px] -ml-48 -mb-48" />

                <Container>
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-white mb-6">Our DNA</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            The principles that guide our community and define how we operate every single day.
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
                                className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all group"
                            >
                                <div className="bg-primary/20 text-primary p-3 rounded-lg inline-block mb-6 group-hover:scale-110 transition-transform">
                                    {v.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{v.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{v.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Global Reach */}
            <Container className="text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Built for the Global Founder</h2>
                    <p className="text-lg text-slate-600 mb-12">
                        Whether you're in the early stages of ideation or scaling a series B startup, IFN provides the ecosystem you need to thrive in a global marketplace. Join the network that understands where you're going and has the people to help you get there.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {/* We can use the openJoinModal from context if we pass it, 
                             or just redirect to home for now as it's a subpage.
                             Actually, simple Link to / is fine or just a join button.
                         */}
                        <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                            Apply to Join IFN
                        </button>
                    </div>
                </div>
            </Container>
        </main>
    );
}
