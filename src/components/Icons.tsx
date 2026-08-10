/**
 * REGISTRATION-PLATFORM MARKS ONLY.
 *
 * TWO PARTNER LOGO COMPONENTS used to live here and were deleted on 2026-08-10.
 * They are not named even here, because partner names now live only on the
 * partner surfaces (the home PartnersStrip, /partners and
 * `src/data/partnersData.ts`) and a component name is a name. Both drew their
 * artwork from `https://www.google.com/s2/favicons?domain=...`, which rendered
 * on /partners and therefore sent every visitor to that page an uninvited
 * request to Google carrying their IP, for a 16px favicon standing in for a
 * logo, from an endpoint IFN does not control. That is the same class of
 * third-party request this repo already removed from the hero.
 *
 * They are NOT replaced by a drawn monogram: a generated mark is permitted only
 * for invented brands, and both partners are real companies that own real
 * artwork of their own. Partner artwork is now a data field
 * (`Partner.logo` in `src/data/partnersData.ts`) pointing at a local file under
 * `public/partners/`, with a labelled reserved slot as the fallback. Do not
 * reintroduce a hotlinked mark here for any partner.
 *
 * The two marks below are a different case and are deliberately kept. Each one
 * is drawn from the registration service that the adjacent link registers on
 * ("Register on Luma" next to Luma's own favicon), so the request goes to the
 * destination the reader is being sent to rather than to an unrelated third
 * party. That is a materially weaker privacy claim than the Google endpoint,
 * not a clean one, and it is recorded here rather than left silent: these two
 * still fire third-party requests to `luma.com` and `secure.meetupstatic.com`
 * before the reader clicks anything.
 *
 * The blast radius, checked rather than assumed. The only consumer is
 * `EventCard.tsx`, which passes them to `ExternalActionLink` as its `icon`
 * prop. `EventsPreview` imports `ExternalActionLink` too but calls it with no
 * `icon`, so the home page does NOT fire these requests. /events is the one
 * affected route.
 *
 * The fix, if the founder wants it, is to vendor both favicons into `public/`
 * with permission and repoint the `src` below; it is one line per component and
 * needs no change in any consumer.
 */

export const LumaLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
    <img
        src="https://luma.com/favicon.ico"
        alt="Luma Logo"
        className={`${className} object-contain`}
        loading="lazy"
    />
);

export const MeetupLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
    <img
        src="https://secure.meetupstatic.com/next/images/favicon.ico"
        alt="Meetup Logo"
        className={`${className} object-contain`}
        loading="lazy"
    />
);
