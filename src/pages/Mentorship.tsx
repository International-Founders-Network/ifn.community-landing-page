import { ComingSoon } from '../components/ComingSoon';

export function Mentorship() {
    return (
        <ComingSoon
            eyebrow="Not designed yet"
            titleBefore="There is no IFN"
            titleAccent="mentor"
            titleAfter="program"
            documentTitle="Mentorship — International Founders Network"
            lead="We have not built one. Nobody is being matched with a mentor, and we are not taking sign-ups from people who would like to mentor. If we ever design this, the page will explain exactly what it asks of a mentor before anyone is invited to volunteer."
            detail="What already happens: at each monthly Austin meetup, founders are paired into structured one-to-one conversations, and members can bring a question to the monthly members-only office-hours call. In practice most of the useful advice at IFN comes from another founder who solved the same problem a year earlier."
            actions={[
                { label: 'See the next meetup', to: '/events' },
                { label: 'What membership includes', to: '/membership' },
            ]}
        />
    );
}
