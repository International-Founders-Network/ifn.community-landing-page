
export const LumaLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
    <img
        src="https://luma.com/favicon.ico"
        alt="Luma Logo"
        className={`${className} object-contain`}
        loading="lazy"
    />
);

export const MeetupLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
    <img
        src="https://secure.meetupstatic.com/next/images/favicon.ico"
        alt="Meetup Logo"
        className={`${className} object-contain`}
        loading="lazy"
    />
);
