import { useState, type ReactNode } from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ButtonLink } from './ButtonLink';
import { describeMoment } from '../lib/eventTime';
import { LUMA_CALENDAR_URL } from '../data/socialLinks';

export type RegistrationPlatform = 'luma' | 'meetup' | 'other';

export interface EventRegistration {
    platform: RegistrationPlatform;
    url: string;
}

export interface Event {
    id: string;
    title: string;
    description?: string;
    /** ISO 8601 instant. */
    start_at: string;
    location_name?: string;
    /** IANA zone (e.g. `America/Chicago`) when the source supplies one. */
    timezone?: string;
    cover_url?: string;
    registrations?: EventRegistration[];
}

interface EventCardProps {
    event: Event;
    index: number;
}

/**
 * The card used by the /events listing, where a grid of equal objects is the
 * right shape because past and upcoming meetups are being browsed rather than
 * acted on. The home page does NOT use this component: REDESIGN-PLAN.md
 * section 5 gives `EventsPreview` a featured object plus a ruled index instead,
 * so that the next date is set at display scale rather than as one tile of
 * three.
 *
 * ALL ZONE LOGIC NOW LIVES IN `src/lib/eventTime.ts` and is imported by both
 * surfaces. It moved rather than changed: formatting in the event's own zone,
 * the DST-correct CDT and CST label, and the "In your time zone" second line
 * are the same rules, in one place, so the two surfaces cannot drift.
 *
 * MATERIAL. Restyled onto the plan's flat rule (section 4.4): radius 0 on every
 * non-interactive surface, zero shadows, separation carried by a full-opacity
 * 1px `--rule` hairline (4.063 light, 4.005 dark on `--paper`) promoting to
 * `--edge` on hover (4.960 and 4.804). The pill radius stays where it belongs,
 * on the discrete controls, which arrive through `buttonClasses`.
 */

interface ExternalActionLinkProps {
    href: string;
    /** Visible label. */
    label: string;
    /** Appended to the accessible name so repeated labels stay distinguishable. */
    context?: string;
    variant?: 'solid' | 'outline';
    icon?: ReactNode;
    fullWidth?: boolean;
    className?: string;
}

/**
 * An off-site card action: a real link that looks like a button.
 *
 * The styling is `ButtonLink`'s, not its own. This only adds the three things a bare
 * button link has no opinion about: the platform logo, the arrow that slides in on
 * hover, and the event title appended to the accessible name so six identical
 * "Register on Luma" links stay tellable apart. `ButtonLink` supplies the new-tab
 * handling and the "(opens in a new tab)" hint, so neither is written here.
 *
 * Card actions take the `secondary` and `outline` button variants, never the accent
 * fill: a three-across grid of accent buttons would put the accent on adjacent
 * elements and blow past the two-marks-per-viewport ceiling REDESIGN-PLAN.md
 * section 2 sets. The same reasoning governs the home page's featured object,
 * where the accent is already spent on the date itself.
 */
export function ExternalActionLink({
    href,
    label,
    context,
    variant = 'solid',
    icon,
    fullWidth = false,
    className = '',
}: ExternalActionLinkProps) {
    return (
        <ButtonLink
            href={href}
            variant={variant === 'solid' ? 'secondary' : 'outline'}
            fullWidth={fullWidth}
            className={`group/action gap-2 ${className}`}
        >
            {icon}
            <span>{label}</span>
            {context && <span className="sr-only">, {context}</span>}
            <ArrowRight
                aria-hidden="true"
                strokeWidth={1.5}
                className="w-4 h-4 -translate-x-1 opacity-0 transition duration-200 group-hover/action:translate-x-0 group-hover/action:opacity-100 group-focus-visible/action:translate-x-0 group-focus-visible/action:opacity-100"
            />
        </ButtonLink>
    );
}

function registrationLabel(platform: RegistrationPlatform, isPast: boolean): string {
    const verb = isPast ? 'View on' : 'Register on';
    if (platform === 'luma') return `${verb} Luma`;
    if (platform === 'meetup') return `${verb} Meetup`;
    return isPast ? 'View this meetup' : 'Register for this meetup';
}

/**
 * Registration-platform marks were removed on 2026-08-10 along with
 * `src/components/Icons.tsx`.
 *
 * Both were `<img>` tags hotlinking a favicon from `luma.com` and
 * `secure.meetupstatic.com`, so /events fired two uninvited third-party
 * requests carrying the reader's IP before they clicked anything. That is the
 * same class of request already removed from the hero and from /partners, and
 * the weaker "it goes to the destination the reader is being sent to" argument
 * does not survive the fact that it fires whether or not they ever click.
 *
 * Nothing is lost by removing them. Both were wrapped in `aria-hidden`, so they
 * were decorative by construction, and the adjacent link already names the
 * platform in its own text ("Register on Luma"). `ExternalActionLink`'s `icon`
 * prop is optional and `EventsPreview` already renders these links without one,
 * so /events now matches the home page rather than diverging from it.
 *
 * Do not reintroduce a hotlinked mark. If a platform mark is genuinely wanted,
 * vendor the artwork into `public/` with permission and pass it as `icon`.
 */

export function EventCard({ event, index }: EventCardProps) {
    const { date, eventZone, shown, inReaderZone, showReaderLine } = describeMoment(event);
    const reduce = useReducedMotion() ?? false;

    // Read once at mount: the past/upcoming split must not flip mid-session on a re-render.
    const [renderedAt] = useState(() => Date.now());
    const isPast = date.getTime() < renderedAt;
    const links = (event.registrations ?? []).filter((reg) => reg.url);

    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="group flex h-full flex-col overflow-hidden border border-rule bg-paper transition-colors duration-200 hover:border-edge"
        >
            {/* Cover */}
            <div className="relative h-48 overflow-hidden bg-band">
                {event.cover_url ? (
                    <img
                        src={event.cover_url}
                        // Decorative: the poster repeats the title, which is the heading below.
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-band text-muted">
                        <Calendar className="w-12 h-12" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                )}

                <div className="absolute top-4 left-4 min-w-[60px] bg-paper px-3 py-2 text-center">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted">{shown.month}</div>
                    <div className="text-xl font-bold leading-none text-ink tabular-nums">{shown.day}</div>
                </div>

                {isPast && (
                    <span className="absolute top-4 right-4 bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wider text-paper">
                        Past meetup
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-grow flex-col p-6">
                <h3 className="mb-3 text-xl font-semibold tracking-[-0.02em] text-ink line-clamp-2">{event.title}</h3>

                <div className="mb-6 flex-grow space-y-3">
                    <div className="flex items-start text-sm text-muted">
                        <Calendar className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden="true" />
                        <div>
                            {/* Two lines rather than one date-dot-time string: the
                                middle dot is rationed to one per line and it was
                                doing no work between two facts that already sit on
                                separate rows of the same block. */}
                            <time dateTime={event.start_at} className="block font-medium text-ink tabular-nums">
                                {shown.date}
                            </time>
                            <span className="block font-medium text-ink tabular-nums">
                                {shown.time} {shown.zone}
                            </span>
                            {showReaderLine ? (
                                <span className="block text-muted tabular-nums">
                                    In your time zone: {inReaderZone.time} {inReaderZone.zone}, {inReaderZone.date}
                                </span>
                            ) : eventZone === null ? (
                                <span className="block text-muted">Shown in your time zone.</span>
                            ) : null}
                        </div>
                    </div>

                    {event.location_name && (
                        <div className="flex items-center text-sm text-muted">
                            <MapPin className="mr-2 h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden="true" />
                            <span className="line-clamp-1">{event.location_name}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-2 border-t border-rule pt-6">
                    {links.length > 0 ? (
                        links.map((reg) => (
                            <ExternalActionLink
                                key={reg.url}
                                href={reg.url}
                                variant={isPast || reg.platform !== 'luma' ? 'outline' : 'solid'}
                                label={registrationLabel(reg.platform, isPast)}
                                context={event.title}
                                fullWidth
                            />
                        ))
                    ) : (
                        // No per-event link exists in the data, so this goes to IFN's calendar.
                        // Calling that "Register" would promise something the click does not do.
                        <ExternalActionLink
                            href={LUMA_CALENDAR_URL}
                            variant="outline"
                            label="Find this meetup on Luma"
                            context={event.title}
                            fullWidth
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
