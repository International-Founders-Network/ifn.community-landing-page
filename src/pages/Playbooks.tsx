import { ComingSoon } from '../components/ComingSoon';

export function Playbooks() {
    return (
        <ComingSoon
            eyebrow="Being written"
            titleBefore="The founder"
            titleAccent="playbooks"
            titleAfter="are not ready"
            documentTitle="Founder Playbooks | International Founders Network"
            lead="None of these are finished, so there is nothing to download. When they exist they will be short, practical guides to what international founders in Austin ask about most: registering a company in the United States, what a visa does and does not allow while you run a business, opening a bank account, and how investors here expect to be approached."
            detail="Until then, our resources page collects the tools and links we already hand to founders, and the monthly meetup is where most of these questions actually get answered by someone who has been through it."
            actions={[
                { label: 'Browse founder resources', to: '/resources' },
                { label: 'Come to the next meetup', to: '/events' },
            ]}
        />
    );
}
