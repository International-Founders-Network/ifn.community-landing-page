import { ComingSoon } from '../components/ComingSoon';

export function Chapters() {
    return (
        <ComingSoon
            eyebrow="One city"
            titleBefore="IFN meets in"
            titleAccent="Austin"
            titleAfter="only"
            documentTitle="Where IFN Meets | International Founders Network"
            /*
             * Both partners are described rather than named: the founder's rule
             * keeps those names on the three partner surfaces only (the home
             * PartnersStrip, /partners, partnersData.ts). No place name is added
             * alongside "our venue partner" because this same sentence already
             * opens "it is in Austin, Texas" and the headline above it already
             * sets "Austin" as its one marked word.
             */
            lead="IFN has one in-person community, and it is in Austin, Texas: a monthly meetup hosted by our venue partner, where founders are paired into structured one-to-one conversations. There are no IFN groups in other cities, and none have been announced."
            detail="Membership and the resource library are open to founders wherever they are based, so you do not have to live in Austin to join. The in-person part of IFN happens here, and we would rather say that plainly than let a map suggest otherwise."
            actions={[
                { label: 'See the Austin meetups', to: '/events' },
                { label: 'What membership includes', to: '/membership' },
            ]}
        />
    );
}
