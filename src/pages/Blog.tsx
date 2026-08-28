import { ComingSoon } from '../components/ComingSoon';

export function Blog() {
    return (
        <ComingSoon
            eyebrow="Nothing published yet"
            titleBefore="We have not started"
            titleAccent="writing"
            titleAfter="yet"
            documentTitle="Blog | International Founders Network"
            lead="There are no posts here. When we do start writing, it will be about the questions that come up at every Austin meetup: registering a company in the United States, staying inside the limits of a visa while running a business, opening a bank account, and how local funding expectations differ from the ones founders arrive with."
            detail="We would rather tell you the page is empty than fill it with articles nobody at IFN wrote."
            actions={[
                { label: 'Come to the next meetup', to: '/events' },
                { label: 'Browse founder resources', to: '/resources' },
            ]}
        />
    );
}
