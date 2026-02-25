import { Container } from '../components/Container';

export function PrivacyPolicy() {
    return (
        <Container className="py-24">
            <div className="max-w-4xl mx-auto prose prose-slate">
                <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
                <p className="text-slate-600 mb-6">
                    Last updated: February 24, 2026
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Introduction</h2>
                    <p className="text-slate-600 mb-4">
                        Welcome to IFN.community. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at hello@ifn.community.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. Information We Collect</h2>
                    <p className="text-slate-600 mb-4">
                        We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products and services, or otherwise contacting us.
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 space-y-2">
                        <li><strong>Personal Information:</strong> Name, email address, phone number, and company name.</li>
                        <li><strong>Log Data:</strong> We automatically collect certain information when you visit, use or navigate the Website. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. How We Use Your Information</h2>
                    <p className="text-slate-600 mb-4">
                        We use personal information collected via our Website for a variety of business purposes described below:
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 space-y-2">
                        <li>To facilitate account creation and logon process.</li>
                        <li>To send administrative information to you.</li>
                        <li>To fulfill and manage your orders.</li>
                        <li>To deliver services to the user.</li>
                        <li>To respond to user inquiries/offer support to users.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Will Your Information Be Shared With Anyone?</h2>
                    <p className="text-slate-600 mb-4">
                        We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. How Long Do We Keep Your Information?</h2>
                    <p className="text-slate-600 mb-4">
                        We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. Contact Us</h2>
                    <p className="text-slate-600">
                        If you have questions or comments about this policy, you may email us at hello@ifn.community.
                    </p>
                </section>
            </div>
        </Container>
    );
}
