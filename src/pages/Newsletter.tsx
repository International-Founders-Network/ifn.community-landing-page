import { ComingSoon } from '../components/ComingSoon';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

export function Newsletter() {
    return (
        <ComingSoon
            eyebrow="No email list yet"
            titleBefore="IFN does not send a"
            titleAccent="newsletter"
            documentTitle="Newsletter | International Founders Network"
            lead="There is no regular IFN email, so there is nothing to subscribe to on this page. We announce each Austin meetup on Luma and on Meetup, and those platforms send the reminder, not us."
            detail="Following IFN on Luma is the reliable way to hear about the next meetup. If we ever start sending our own email, we will say what it contains and how often it arrives before asking for your address."
            actions={[
                { label: 'Follow IFN events on Luma', href: LUMA_CALENDAR_URL },
                { label: 'See upcoming meetups', to: '/events' },
            ]}
        />
    );
}
