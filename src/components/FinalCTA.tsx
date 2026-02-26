import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from './Button';
import { Container } from './Container';


interface FinalCTAProps {
    onJoinClick: () => void;
}

export function FinalCTA({ onJoinClick }: FinalCTAProps) {
    return (
        <section className="py-24 bg-primary relative overflow-hidden text-white">
            {/* Background patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.05),transparent_25%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(249,115,22,0.1),transparent_25%)]"></div>

            <Container size="lg" className="relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

                    <div className="flex-1 text-center lg:text-left">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                            Ready to Connect with Founders Who Get It?
                        </h2>
                        <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
                            Join a growing network of founders who are building, learning, and winning together. Stop building alone.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button size="lg" variant="primary" className="bg-accent hover:bg-accent-hover text-white ring-offset-primary" onClick={onJoinClick}>
                                Join International Founders Network
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>

                        <p className="mt-6 text-sm text-slate-400 flex items-center justify-center lg:justify-start gap-6">
                            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Free to join</span>
                            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> No credit card required</span>
                        </p>
                        <p className="mt-4 text-xs font-medium text-accent/90 text-center lg:text-left animate-pulse">
                            Applications reviewed weekly.
                        </p>
                    </div>

                    <div className="relative hidden lg:block w-96 h-96">
                        {/* Center Glow */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                className="w-64 h-64 bg-accent/10 rounded-full blur-3xl"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>

                        {/* Orbiting System Container */}
                        <div className="absolute inset-0 flex items-center justify-center">

                            {/* Central Hub */}
                            <motion.div
                                className="relative z-20 w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center shadow-2xl overflow-hidden"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 opacity-50" />
                                <div className="relative z-10 w-16 h-16 flex items-center justify-center">
                                    <img src="/logo.png" alt="IFN Logo" className="w-14 h-14 object-contain" loading="lazy" />
                                </div>
                            </motion.div>

                            {/* Orbit 1 */}
                            <motion.div
                                className="absolute border border-white/10 rounded-full w-48 h-48"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
                                <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white/50 rounded-full" />
                            </motion.div>

                            {/* Orbit 2 */}
                            <motion.div
                                className="absolute border border-white/5 rounded-full w-72 h-72"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            >
                                <motion.div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-primary-light rounded-full shadow-[0_0_20px_rgba(56,189,248,0.5)] border border-white/20" />
                                <motion.div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/30 rounded-full" />
                                <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/20 rounded-full" />
                            </motion.div>

                            {/* Connecting Lines (Decorative) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 animate-pulse-slow">
                                <circle cx="50%" cy="50%" r="60" stroke="currentColor" strokeDasharray="4 4" fill="none" className="text-white" />
                                <circle cx="50%" cy="50%" r="100" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-white" />
                            </svg>

                        </div>
                    </div>

                </div>
            </Container>
        </section>
    );
}
