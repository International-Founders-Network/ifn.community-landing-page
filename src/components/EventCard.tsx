import { Calendar, MapPin, ArrowRight, Users } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';
import { GlobeIcon } from './GlobeIcon';

export interface Event {
    id: string;
    title: string;
    description?: string;
    start_at: string;
    location_name?: string;
    cover_url?: string;
    url: string;
    platform: 'luma' | 'meetup';
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
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        {event.platform === 'luma' ? (
                            <div className="bg-primary/10 text-primary p-1.5 rounded-md">
                                <GlobeIcon className="w-3.5 h-3.5" />
                            </div>
                        ) : (
                            <div className="bg-red-50 text-red-600 p-1.5 rounded-md">
                                <Users size={14} />
                            </div>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {event.platform}
                        </span>
                    </div>
                </div>

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

                <Button
                    variant="outline"
                    fullWidth
                    className="mt-auto group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all"
                    onClick={() => window.open(event.url, '_blank')}
                >
                    Register Now
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Button>
            </div>
        </motion.div>
    );
}
