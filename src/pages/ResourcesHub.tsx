import { Suspense } from 'react';
import { Resources } from '../components/Resources';

export function ResourcesHub() {
    return (
        <main className="pt-24">
            <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading resources...</div>}>
                <Resources />
            </Suspense>
        </main>
    );
}
