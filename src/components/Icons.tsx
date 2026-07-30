
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

export const StationAustinLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
    <img
        src="https://www.google.com/s2/favicons?domain=stationaustin.org&sz=128"
        alt="Station Austin Logo"
        className={`${className} object-contain`}
        loading="lazy"
    />
);

export const ReuneoLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
    <img
        src="https://www.google.com/s2/favicons?domain=reuneo.app&sz=128"
        alt="Reuneo Logo"
        className={`${className} object-contain`}
        loading="lazy"
    />
);
