import { Suspense } from 'react';
import { Resources } from '../components/Resources';

export function ResourcesHub() {
    // No <main> here — App.tsx already renders <main id="main-content">.
    return (
        <div className="pt-24">
            <Suspense
                fallback={
                    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
                        <span className="text-slate-600">Loading resources&hellip;</span>
                    </div>
                }
            >
                <Resources />
            </Suspense>
        </div>
    );
}
