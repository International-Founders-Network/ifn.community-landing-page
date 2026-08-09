import { ComingSoon } from '../components/ComingSoon';

export function Chapters() {
    return (
        <ComingSoon
            eyebrow="One city"
            titleBefore="IFN meets in"
            titleAccent="Austin"
            titleAfter="only"
            documentTitle="Where IFN Meets — International Founders Network"
            lead="IFN has one in-person community, and it is in Austin, Texas: a monthly meetup hosted at Station Austin, where founders are paired into structured one-to-one conversations using Reuneo. There are no IFN groups in other cities, and none have been announced."
            detail="Membership and the resource library are open to founders wherever they are based, so you do not have to live in Austin to join. The in-person part of IFN happens here, and we would rather say that plainly than let a map suggest otherwise."
            actions={[
                { label: 'See the Austin meetups', to: '/events' },
                { label: 'What membership includes', to: '/membership' },
            ]}
        />
    );
}
