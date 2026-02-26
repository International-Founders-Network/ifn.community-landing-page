import { Container } from './Container';

interface HowItWorksProps {
    onJoinClick?: () => void;
}

export function HowItWorks({ onJoinClick }: HowItWorksProps = {}) {
    const steps = [
        {
            number: '01',
            title: 'Join',
            description: 'Create your founder profile in minutes to help us understand your goals.',
        },
        {
            number: '02',
            title: 'Connect',
            description: 'Get matched with relevant founders, mentors, and opportunities.',
        },
        {
            number: '03',
            title: 'Grow',
            description: 'Access events, resources, and connections that accelerate your journey.',
        },
    ];

    return (
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-light/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <Container className="relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    <div className="lg:w-1/3">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Journey Starts Here</h2>
                        <p className="text-slate-400 text-lg mb-8">
                            We've simplified the path to finding your tribe. No complex hoops, just meaningful connections.
                        </p>
                        <button
                            className="text-accent font-semibold flex items-center gap-2 hover:gap-3 transition-all"
                            onClick={onJoinClick}
                        >
                            Join the Community →
                        </button>
                    </div>

                    <div className="lg:w-2/3 grid md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="text-6xl font-bold text-white/5 absolute top-2 right-4 pointer-events-none">
                                    {step.number}
                                </div>
                                <div className="text-accent font-bold text-xl mb-3">{step.title}</div>
                                <p className="text-slate-300 relative z-10">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
