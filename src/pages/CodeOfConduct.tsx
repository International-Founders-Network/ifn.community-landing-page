import { Container } from '../components/Container';
import { ShieldAlert, Heart, Users, ShieldCheck, Flag } from 'lucide-react';

export function CodeOfConduct() {
    return (
        <Container className="py-24">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Code of Conduct</h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        The International Founders Network (IFN) is dedicated to providing a harassment-free experience for everyone, regardless of gender, orientation, disability, physical appearance, body size, race, or religion.
                    </p>
                </div>

                <div className="prose prose-slate max-w-none space-y-12">
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 m-0">Our Standards</h2>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Examples of behavior that contributes to a positive environment for our community include:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                            {[
                                "Demonstrating empathy and kindness toward other founders",
                                "Being respectful of differing opinions, viewpoints, and experiences",
                                "Giving and gracefully accepting constructive feedback",
                                "Accepting responsibility and apologizing to those affected by our mistakes",
                                "Focusing on what is best not just for us as individuals, but for the community",
                                "Maintaining confidentiality of shared founder challenges"
                            ].map((item, i) => (
                                <li key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3 m-0">
                                    <Heart className="w-5 h-5 text-primary shrink-0 mt-1" />
                                    <span className="text-slate-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="bg-red-50/50 p-8 rounded-3xl border border-red-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-red-100 p-2 rounded-lg text-red-600">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 m-0">Unacceptable Behavior</h2>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed mb-6">
                            The following behaviors are considered harassment and are unacceptable within our community:
                        </p>
                        <ul className="space-y-3 text-slate-700">
                            <li>• The use of sexualized language or imagery, and unwelcome sexual attention or advances</li>
                            <li>• Trolling, insulting or derogatory comments, and personal or political attacks</li>
                            <li>• Public or private harassment</li>
                            <li>• Publishing others' private information without explicit permission</li>
                            <li>• Other conduct which could reasonably be considered inappropriate in a professional setting</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <Flag className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 m-0">Reporting and Enforcement</h2>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            If you are being harassed, notice that someone else is being harassed, or have any other concerns, please contact the IFN team immediately at <a href="mailto:conduct@ifn.community" className="text-primary font-semibold hover:underline">conduct@ifn.community</a>.
                        </p>
                        <p className="text-slate-600 text-lg leading-relaxed mt-4">
                            All reports will be handled with discretion. Community leaders will follow these Community Impact Guidelines in determining the consequences for any action they deem in violation of this Code of Conduct:
                        </p>
                        <div className="mt-8 space-y-6">
                            <div className="border-l-4 border-primary pl-6 py-2">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">1. Correction</h3>
                                <p className="text-slate-600">A private, written warning, providing clarity around the nature of the violation and an explanation of why the behavior was inappropriate.</p>
                            </div>
                            <div className="border-l-4 border-primary pl-6 py-2">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">2. Warning</h3>
                                <p className="text-slate-600">A warning with consequences for continued behavior. Interaction with the people involved is restricted for a specified period of time.</p>
                            </div>
                            <div className="border-l-4 border-primary pl-6 py-2">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">3. Expulsion</h3>
                                <p className="text-slate-600">A permanent ban from any sort of interaction with the community, and removal from all IFN platforms and events.</p>
                            </div>
                        </div>
                    </section>

                    <div className="bg-slate-900 text-white p-10 rounded-3xl mt-16 text-center">
                        <Users className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" />
                        <h2 className="text-2xl font-bold mb-4">Questions?</h2>
                        <p className="text-slate-400 mb-0">
                            We encourage our members to ask questions regarding these guidelines. Our goal is to foster a safe, collaborative environment for all.
                        </p>
                    </div>
                </div>
            </div>
        </Container>
    );
}
