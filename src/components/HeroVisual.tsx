import { motion } from 'framer-motion';
import { GlobeIcon } from './GlobeIcon';
import { Zap, TrendingUp } from 'lucide-react';

export function HeroVisual() {
    return (
        <div className="relative w-full aspect-square max-w-lg mx-auto lg:max-w-none">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-accent/5 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>

            {/* Main Glass Sphere Container */}
            <div className="relative w-full h-full bg-white/5 backdrop-blur-3xl rounded-full border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center group">

                {/* Dynamic Content Layers */}
                <div className="absolute inset-0 opacity-20">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="w-[180%] h-[180%] border border-dashed border-primary/40 rounded-full absolute top-[-40%] left-[-40%]"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
                        className="w-[140%] h-[140%] border border-white/20 rounded-full absolute top-[-20%] left-[-20%]"
                    />
                </div>

                {/* Inner Glow and Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]" />

                {/* Core Icon */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        rotateY: [0, 10, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 p-10 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl"
                >
                    <GlobeIcon className="w-28 h-28 text-primary drop-shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]" />
                </motion.div>

                {/* Orbiting Tech Avatars */}
                {[
                    { img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2", delay: 0, size: "w-16 h-16", pos: "top-10 left-10" },
                    { img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", delay: 2, size: "w-14 h-14", pos: "bottom-12 right-12" },
                    { img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", delay: 4, size: "w-12 h-12", pos: "top-1/2 -left-4" }
                ].map((avatar, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -15, 0],
                            rotate: [0, 5, 0]
                        }}
                        transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: avatar.delay }}
                        className={`absolute ${avatar.pos} ${avatar.size} bg-white rounded-full p-1 shadow-2xl border-2 border-white/50 overflow-hidden z-20`}
                    >
                        <img
                            src={`${avatar.img}?auto=format&fit=crop&w=100&h=100`}
                            className="w-full h-full object-cover rounded-full"
                            alt=""
                            loading="lazy"
                        />
                    </motion.div>
                ))}
            </div>

            {/* Floating Metric Cards */}
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute top-1/4 -left-16 z-30 hidden xl:block"
            >
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Community</div>
                        <div className="text-xl font-bold text-slate-900">85+ Founders in Austin</div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute bottom-1/4 -right-16 z-30 hidden xl:block"
            >
                <div className="bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 text-white">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                        <Zap size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Events</div>
                        <div className="text-xl font-bold text-white">Monthly Founder Sessions</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
