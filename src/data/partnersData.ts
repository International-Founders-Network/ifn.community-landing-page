export interface Partner {
    id: string;
    name: string;
    category: string;
    description: string;
    website?: string;
}

export const PARTNERS: Partner[] = [
    {
        id: 'station-austin',
        name: 'Station Austin',
        category: 'Venue Partner',
        description: 'The center of gravity for entrepreneurs in Texas — hosting IFN meetups and connecting our community with Austin\'s broader startup ecosystem.',
        website: 'https://stationaustin.org',
    },
    {
        id: 'reuneo',
        name: 'Reuneo',
        category: 'Speed-Networking Partner',
        description: 'Powers the speed-networking format at IFN meetups, pairing founders into quality 1-1 connections in place of standing-around small talk.',
        website: 'https://reuneo.app',
    },
    {
        id: 'yani-partners',
        name: 'Yani Partners',
        category: 'Business & Technology Partner',
        description: 'Fractional CTO and technology consulting for founders and growing teams. Founded by the same team behind IFN.',
    },
];
