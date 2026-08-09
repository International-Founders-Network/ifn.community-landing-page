import React from 'react';

export function GlobeIcon({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            /* Decorative by default. A caller that needs it announced can pass
               aria-hidden={false} plus a role and label, since props win here. */
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            {/* Tilted globe aesthetic for a more dynamic, premium look */}
            <circle cx="12" cy="12" r="10" />

            {/* Curved meridians for 3D effect */}
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
            <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />

            {/* Unconventional "Orbit" or "Network" lines cutting across */}
            <path d="M2.05 13a15 15 0 0 0 19.9 0" />
            <path d="M2.05 11a15 15 0 0 1 19.9 0" />

            {/* A single connection node to emphasize "Network" */}
            <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
    );
}
