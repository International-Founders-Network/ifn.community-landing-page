import { Container } from './Container';

export function FounderStory() {
    return (
        <section className="py-24 bg-white border-t border-slate-100">
            <Container size="md">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        Built by Immigrant Founders Who’ve Scaled in the US
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                        IFN was created by founders who understand the unique challenges of building companies across borders — from immigration complexity to rebuilding networks from scratch. We built IFN to make that journey faster, smarter, and less lonely.
                    </p>
                </div>
            </Container>
        </section>
    );
}
