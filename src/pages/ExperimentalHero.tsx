import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import Spline from '@splinetool/react-spline';

export const ExperimentalHero: React.FC = () => {
     
    const { openJoinModal } = useOutletContext<{ openJoinModal: () => void }>();

    return (
        <div className="flex flex-col min-h-[85vh] bg-white pt-24 md:pt-32">
            {/* Hero Content */}
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center flex-grow">
                {/* LEFT SIDE */}
                <div className="w-full md:w-[45%] flex flex-col items-start space-y-8 z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200 shadow-sm animate-fade-in">
                        <div className="w-2 h-2 rounded-full bg-slate-800" />
                        <span className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                            THE UNFAIR ADVANTAGE YOU WERE MISSING.
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold leading-tight text-[#1B2A4A] tracking-tight">
                        Where <span className="text-[#F97316] italic">Immigrant</span><br />
                        Founders Connect,<br />
                        <span className="text-[#F97316]">Grow</span>, and Succeed
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg text-[#6B7280] max-w-lg leading-relaxed font-medium">
                        Warm intros. Founder labs. People who've lived your exact story:
                        visa stress, cultural context-switching, no local playbook - all of it.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <button
                            onClick={openJoinModal}
                            className="group flex items-center justify-center space-x-2 px-8 py-4 bg-[#F97316] text-white font-bold rounded-lg transition-all hover:bg-[#EA580C] hover:shadow-lg hover:translate-y-[-2px] w-full sm:w-auto"
                        >
                            <span>Get Your First Warm Intro</span>
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </button>
                        <button
                            className="flex items-center justify-center px-8 py-4 border-2 border-[#1B2A4A] text-[#1B2A4A] font-bold rounded-lg transition-all hover:bg-[#1B2A4A]/5 w-full sm:w-auto"
                        >
                            Browse the Founder Playbook
                        </button>
                    </div>

                    {/* Muted Text */}
                    <p className="text-sm text-slate-400 font-medium">
                        No pitch deck required · Just show up · Free to explore
                    </p>
                </div>

                <div className="w-full md:w-[55%] h-[500px] md:h-[700px] mt-12 md:mt-0 relative flex items-center justify-center">
                    <Spline
                        scene="https://prod.spline.design/oQk95ER14E144dli/scene.splinecode" 
                    />
                </div>
            </div>

            {/* Social Proof Bar */}
            <div className="w-full py-12 bg-slate-50/50 border-t border-slate-100 mt-auto">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-4 opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-2xl font-bold text-[#1B2A4A]">1,200+</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Founders</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-2xl font-bold text-[#1B2A4A]">85+</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Labs</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-2xl font-bold text-[#1B2A4A]">45</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Countries</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-2xl font-bold text-[#1B2A4A]">2.5x</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Faster Connections</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
