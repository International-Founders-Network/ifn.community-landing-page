import { Link2, Type, Mail, Phone, MessageSquare, Wifi, User } from 'lucide-react';
import clsx from 'clsx';
import { contentTypeLabels, type QRContentType } from '../lib/qrContent';

const icons: Record<QRContentType, React.ComponentType<{ size?: number }>> = {
    url: Link2,
    text: Type,
    email: Mail,
    phone: Phone,
    sms: MessageSquare,
    wifi: Wifi,
    vcard: User,
};

const order: QRContentType[] = ['url', 'text', 'email', 'phone', 'sms', 'wifi', 'vcard'];

export function ContentTypeTabs({ value, onChange }: { value: QRContentType; onChange: (t: QRContentType) => void }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {order.map((type) => {
                const Icon = icons[type];
                const active = type === value;
                return (
                    <button
                        key={type}
                        type="button"
                        onClick={() => onChange(type)}
                        className={clsx(
                            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors',
                            active
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        )}
                    >
                        <Icon size={15} />
                        {contentTypeLabels[type]}
                    </button>
                );
            })}
        </div>
    );
}
