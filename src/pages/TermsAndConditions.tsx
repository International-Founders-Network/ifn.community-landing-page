import { Container } from '../components/Container';

export function TermsAndConditions() {
    return (
        <Container className="py-24">
            <div className="max-w-4xl mx-auto prose prose-slate">
                <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms and Conditions</h1>
                <p className="text-slate-600 mb-6">
                    Last updated: February 24, 2026
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Agreement to Terms</h2>
                    <p className="text-slate-600 mb-4">
                        These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and IFN ("we," "us" or "our"), concerning your access to and use of the IFN.community website.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. INTELLECTUAL PROPERTY RIGHTS</h2>
                    <p className="text-slate-600 mb-4">
                        Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. USER REPRESENTATIONS</h2>
                    <p className="text-slate-600 mb-4">
                        By using the Site, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Terms and Conditions; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the Site through automated or non-human means, whether through a bot, script, or otherwise; (4) you will not use the Site for any illegal or unauthorized purpose; and (5) your use of the Site will not violate any applicable law or regulation.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. PROHIBITED ACTIVITIES</h2>
                    <p className="text-slate-600 mb-4">
                        You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. LIMITATION OF LIABILITY</h2>
                    <p className="text-slate-600 mb-4">
                        In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. GOVERNING LAW</h2>
                    <p className="text-slate-600 mb-4">
                        These Terms and Conditions and your use of the Site are governed by and construed in accordance with the laws of the State of Texas applicable to agreements made and to be entirely performed within the State of Texas, without regard to its conflict of law principles.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">7. CONTACT US</h2>
                    <p className="text-slate-600">
                        In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at hello@ifn.community.
                    </p>
                </section>
            </div>
        </Container>
    );
}
