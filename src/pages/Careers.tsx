import { ComingSoon } from '../components/ComingSoon';

export function Careers() {
    return (
        <ComingSoon
            eyebrow="No open roles"
            titleBefore="IFN is not"
            titleAccent="hiring"
            titleAfter="right now"
            documentTitle="Careers — International Founders Network"
            lead="IFN is run by a small founding team. There are no paid roles open today, and we are not collecting applications for roles that do not exist."
            detail="If that changes, the role will be described here first — what it involves, what it pays, and who to talk to. Until then, the most direct way to get to know the people behind IFN is to come to a meetup in Austin or write to us."
            actions={[
                { label: 'Meet us at a meetup', to: '/events' },
                { label: 'Contact the team', to: '/contact' },
            ]}
        />
    );
}
