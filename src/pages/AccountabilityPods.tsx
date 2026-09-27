import { ComingSoon } from '../components/ComingSoon';

export function AccountabilityPods() {
    return (
        <ComingSoon
            eyebrow="Not open yet"
            titleBefore="IFN accountability"
            titleAccent="pods"
            titleAfter="are coming"
            documentTitle="Accountability Pods | International Founders Network"
            lead="An accountability pod is a small group of founders who check in with each other on their goals on a regular schedule. We have not started any pods yet, and we are not taking sign-ups. When we do, this page will say how pods are formed and what they ask of each founder before anyone joins one."
            detail="What already happens: at each monthly Austin meetup, founders are paired into structured one-to-one conversations. That is the best place to meet the founders you might one day share a pod with."
            actions={[
                { label: 'See the next meetup', to: '/events' },
                { label: 'What membership includes', to: '/membership' },
            ]}
        />
    );
}
