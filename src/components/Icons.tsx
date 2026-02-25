
export const LumaLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
    <img
        src="https://luma.com/apple-touch-icon.png"
        alt="Luma Logo"
        className={`${className} object-contain`}
    />
);

export const MeetupLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
    <img
        src="https://secure.meetupstatic.com/next/images/general/m_redesign_196x196.png"
        alt="Meetup Logo"
        className={`${className} object-contain`}
    />
);
