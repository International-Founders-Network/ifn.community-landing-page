import { Container } from './Container';

export function Testimonials() {
    const testimonials = [
        {
            quote: "Met my first angel investor and three mentors through IFN.",
            author: "Amara Okeke",
            role: "HealthTech Founder",
            location: "Lagos, Nigeria",
            image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200&h=200"
        },
        {
            quote: "Scaled my B2B SaaS to 10 countries with IFN peer guidance.",
            author: "David Chen",
            role: "Founder, CloudScale",
            location: "Toronto, Canada",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200"
        },
        {
            quote: "Found my technical co-founder in 3 weeks through IFN.",
            author: "Elena Rodriguez",
            role: "CEO, EcoSolutions",
            location: "Berlin, Germany",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200"
        },
    ];

    return (
        <section className="py-24 bg-slate-50 border-y border-slate-100">
            <Container>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Trusted by Founders Worldwide</h2>
                    <p className="text-lg text-slate-600">
                        Join a growing network of founders who are building, learning, and winning together.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                            <div className="flex-1 mb-6">
                                <div className="text-accent text-4xl mb-4">"</div>
                                <p className="text-slate-700 leading-relaxed italic relative z-10">
                                    {testimonial.quote}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 mt-auto">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.author}
                                    className="w-12 h-12 rounded-full object-cover"
                                    loading="lazy"
                                />
                                <div>
                                    <div className="font-bold text-slate-900">{testimonial.author}</div>
                                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                                    <div className="text-xs text-primary font-medium">{testimonial.location}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
