import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';
import { LumaLogo, MeetupLogo } from './Icons';

export interface Event {
    id: string;
    title: string;
    description?: string;
    start_at: string;
    location_name?: string;
    cover_url?: string;
    registrations: { platform: 'luma' | 'meetup'; url: string }[];
}

interface EventCardProps {
    event: Event;
    index: number;
}

export function EventCard({ event, index }: EventCardProps) {
    const date = new Date(event.start_at);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-slate-300 h-full"
        >
            {/* Cover Image Area */}
            <div className="h-48 bg-slate-100 relative overflow-hidden">
                {event.cover_url ? (
                    <img
                        src={event.cover_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                        <Calendar className="w-12 h-12" />
                    </div>
                )}

                {/* Date Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm text-center min-w-[60px]">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-xl font-bold text-slate-900 leading-none">{date.getDate()}</div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                </h3>

                <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center text-slate-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        <span>{dateStr} • {timeStr}</span>
                    </div>
                    {event.location_name && (
                        <div className="flex items-center text-slate-600 text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                            <span className="line-clamp-1">{event.location_name}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-100">
                    <div className="flex flex-col gap-2">
                        {event.registrations.map(reg => (
                            <Button
                                key={reg.platform}
                                variant={reg.platform === 'luma' ? 'primary' : 'outline'}
                                fullWidth
                                className="group relative overflow-hidden"
                                onClick={() => window.open(reg.url, '_blank')}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {reg.platform === 'luma' ?
                                        <LumaLogo className="w-4 h-4" /> :
                                        <MeetupLogo className="w-4 h-4" />
                                    }
                                    <span>Register on {reg.platform === 'luma' ? 'Luma' : 'Meetup'}</span>
                                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0 transition-transform" />
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
