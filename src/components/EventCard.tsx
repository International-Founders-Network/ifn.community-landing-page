import { useState, type ReactNode } from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { LumaLogo, MeetupLogo } from './Icons';
import { ButtonLink } from './ButtonLink';
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

/** IFN's own calendar. Used when an event carries no registration link of its own. */

const AUSTIN_TIME_ZONE = 'America/Chicago';

function isSupportedTimeZone(timeZone: string): boolean {
    try {
        new Intl.DateTimeFormat('en-US', { timeZone });
        return true;
    } catch {
        return false;
    }
}

/**
 * The zone the event actually happens in — never the reader's.
 *
 * An Austin meetup starting 2026-08-27T23:30Z is 6:30 PM CDT. Rendered in the reader's
 * zone with no label, a founder in Berlin was being told 1:30 AM the following day.
 * Returns null when the zone genuinely cannot be established, so the caller can say so
 * rather than guess.
 */
function resolveEventTimeZone(event: Pick<Event, 'timezone' | 'location_name'>): string | null {
    const declared = event.timezone?.trim();
    if (declared && isSupportedTimeZone(declared)) return declared;

    const place = event.location_name?.toLowerCase() ?? '';
    if (/austin|texas|\btx\b/.test(place)) return AUSTIN_TIME_ZONE;

    return null;
}

function viewerTimeZone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

interface FormattedMoment {
    /** Short month, for the cover badge. */
    month: string;
    /** Day of month, for the cover badge. */
    day: string;
    /** e.g. "Thu, Aug 27, 2026" */
    date: string;
    /** e.g. "6:30 PM" */
    time: string;
    /** e.g. "CDT" */
    zone: string;
}

function formatMoment(date: Date, timeZone: string): FormattedMoment {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    }).formatToParts(date);

    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';

    return {
        month: part('month'),
        day: part('day'),
        date: `${part('weekday')}, ${part('month')} ${part('day')}, ${part('year')}`,
        time: `${part('hour')}:${part('minute')} ${part('dayPeriod')}`,
        zone: part('timeZoneName'),
    };
}

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
 * The styling is `ButtonLink`'s, not its own — this only adds the three things a bare
 * button link has no opinion about: the platform logo, the arrow that slides in on
 * hover, and the event title appended to the accessible name so six identical
 * "Register on Luma" links stay tellable apart. `ButtonLink` supplies the new-tab
 * handling and the "(opens in a new tab)" hint, so neither is written here.
 *
 * Card actions are Deep Harbor rather than Welcome Amber: a three-across grid of amber
 * buttons would put amber on adjacent elements and blow past the three-per-viewport
 * ceiling. Amber on this page is spent on the headline word and the notify button.
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
 * Wrapped in an aria-hidden span: the logo components ship `alt="Luma Logo"`, which would
 * otherwise be read out as part of the link's name.
 */
function platformIcon(platform: RegistrationPlatform) {
    if (platform === 'luma') {
        return (
            <span aria-hidden="true" className="inline-flex">
                <LumaLogo className="w-4 h-4" />
            </span>
        );
    }
    if (platform === 'meetup') {
        return (
            <span aria-hidden="true" className="inline-flex">
                <MeetupLogo className="w-4 h-4" />
            </span>
        );
    }
    return null;
}

export function EventCard({ event, index }: EventCardProps) {
    const date = new Date(event.start_at);
    const eventZone = resolveEventTimeZone(event);
    const readerZone = viewerTimeZone();

    // When the event's own zone is unknown we fall back to the reader's zone and label it
    // as theirs, rather than printing an Austin abbreviation we cannot stand behind.
    const shown = formatMoment(date, eventZone ?? readerZone);
    const inReaderZone = formatMoment(date, readerZone);
    const showReaderLine =
        eventZone !== null && (inReaderZone.date !== shown.date || inReaderZone.time !== shown.time);

    // Read once at mount: the past/upcoming split must not flip mid-session on a re-render.
    const [renderedAt] = useState(() => Date.now());
    const isPast = date.getTime() < renderedAt;
    const links = (event.registrations ?? []).filter((reg) => reg.url);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.08 }}
            viewport={{ once: true }}
            className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-slate-300 h-full"
        >
            {/* Cover */}
            <div className="h-48 bg-slate-100 relative overflow-hidden">
                {event.cover_url ? (
                    <img
                        src={event.cover_url}
                        // Decorative: the poster repeats the title, which is the heading below.
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                        <Calendar className="w-12 h-12" aria-hidden="true" />
                    </div>
                )}

                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-center min-w-[60px]">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{shown.month}</div>
                    <div className="text-xl font-bold text-slate-900 leading-none">{shown.day}</div>
                </div>

                {isPast && (
                    <span className="absolute top-4 right-4 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                        Past meetup
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{event.title}</h3>

                <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-start text-slate-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                        <div>
                            <time dateTime={event.start_at} className="block font-medium text-slate-700">
                                {shown.date} · {shown.time} {shown.zone}
                            </time>
                            {showReaderLine ? (
                                <span className="block text-slate-500">
                                    In your time zone: {inReaderZone.time} {inReaderZone.zone}, {inReaderZone.date}
                                </span>
                            ) : eventZone === null ? (
                                <span className="block text-slate-500">Shown in your time zone.</span>
                            ) : null}
                        </div>
                    </div>

                    {event.location_name && (
                        <div className="flex items-center text-slate-600 text-sm">
                            <MapPin className="w-4 h-4 mr-2 shrink-0 text-slate-400" aria-hidden="true" />
                            <span className="line-clamp-1">{event.location_name}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-slate-100">
                    {links.length > 0 ? (
                        links.map((reg) => (
                            <ExternalActionLink
                                key={reg.url}
                                href={reg.url}
                                variant={isPast || reg.platform !== 'luma' ? 'outline' : 'solid'}
                                icon={platformIcon(reg.platform)}
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
                            icon={platformIcon('luma')}
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
