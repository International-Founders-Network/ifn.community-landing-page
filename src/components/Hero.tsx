import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe, Users, Trophy } from 'lucide-react';
import { Button } from './Button';
import { Container } from './Container';
import { HeroVisual } from './HeroVisual';

interface HeroProps {
    onJoinClick: () => void;
}

export function Hero({ onJoinClick }: HeroProps) {
    const [index, setIndex] = useState(0);
    const words = [
        { text: "Global", color: "text-primary" },
        { text: "International", color: "text-accent" },
        { text: "Immigrant", color: "text-primary" }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
            {/* Rich Background Elements */}
            <div className="absolute inset-0 bg-slate-50 -z-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary-light),transparent_50%)] opacity-30 -z-40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--color-accent-light),transparent_50%)] opacity-20 -z-40" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-30" />

            {/* Animated Mesh Gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, -30, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-20"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -50, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] -z-20"
            />

            <Container>
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-1 text-center lg:text-left z-10"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-xs mb-8 border border-slate-200 shadow-sm text-slate-800 uppercase tracking-widest"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                            World's First Immigrant Founder Network
                        </motion.div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight">
                            Build Your Legacy <br />
                            <span className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4">
                                <span>with</span>
                                <span className="relative inline-block h-[1.2em] min-w-[200px] text-left">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={index}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            transition={{ duration: 0.5, ease: "circOut" }}
                                            className={`absolute inset-0 ${words[index].color} italic`}
                                        >
                                            {words[index].text}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                            </span>
                            Connects.
                        </h1>

                        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            The International Founders Network (IFN) bridges the gap for immigrant entrepreneurs by providing the capital, community, and coaching needed to scale globally.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                            <Button size="lg" className="h-16 px-10 text-lg group shadow-2xl shadow-primary/30" onClick={onJoinClick}>
                                Apply for Membership
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-16 px-10 text-lg bg-white/50 backdrop-blur-sm"
                                onClick={() => document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Explore Your Journey
                            </Button>
                        </div>

                        <div className="mt-16 pt-8 border-t border-slate-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-x-10 gap-y-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <span className="text-slate-600 font-bold">25+ Nations</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="text-slate-600 font-bold">500+ Members</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <span className="text-slate-600 font-bold">$10M+ Raised</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Visual / Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 relative w-full perspective-1000"
                    >
                        <HeroVisual />

                        {/* Interactive UI Overlays */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-6 lg:-right-12 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 z-30 hidden sm:block"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">New Member</div>
                                    <div className="text-xs text-slate-500">Just joined from Berlin</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
