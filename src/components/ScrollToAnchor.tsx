import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToAnchor() {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Find element by ID (remove '#' from hash)
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                // Use timeout to allow content to render/layout
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [hash]);

    return null;
}
