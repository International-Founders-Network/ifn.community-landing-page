import type {
    EmailFields,
    PhoneFields,
    QRContentType,
    QRFieldsByType,
    SmsFields,
    TextFields,
    UrlFields,
    VCardFields,
    WifiFields,
} from '../lib/qrContent';

const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            {children}
        </label>
    );
}

interface ContentFieldsProps<T extends QRContentType> {
    type: T;
    fields: QRFieldsByType[T];
    onChange: (fields: QRFieldsByType[T]) => void;
}

export function ContentFields<T extends QRContentType>({ type, fields, onChange }: ContentFieldsProps<T>) {
    switch (type) {
        case 'url': {
            const f = fields as UrlFields;
            return (
                <Field label="Destination URL">
                    <input
                        type="url"
                        className={inputClass}
                        placeholder="https://ifn.community"
                        value={f.url}
                        onChange={(e) => onChange({ ...f, url: e.target.value } as QRFieldsByType[T])}
                    />
                </Field>
            );
        }
        case 'text': {
            const f = fields as TextFields;
            return (
                <Field label="Text">
                    <textarea
                        rows={4}
                        className={inputClass + ' resize-none'}
                        placeholder="Anything you want encoded..."
                        value={f.text}
                        onChange={(e) => onChange({ ...f, text: e.target.value } as QRFieldsByType[T])}
                    />
                </Field>
            );
        }
        case 'email': {
            const f = fields as EmailFields;
            return (
                <div className="space-y-4">
                    <Field label="To">
                        <input
                            type="email"
                            className={inputClass}
                            placeholder="hello@ifn.community"
                            value={f.to}
                            onChange={(e) => onChange({ ...f, to: e.target.value } as QRFieldsByType[T])}
                        />
                    </Field>
                    <Field label="Subject (optional)">
                        <input
                            type="text"
                            className={inputClass}
                            value={f.subject}
                            onChange={(e) => onChange({ ...f, subject: e.target.value } as QRFieldsByType[T])}
                        />
                    </Field>
                    <Field label="Body (optional)">
                        <textarea
                            rows={3}
                            className={inputClass + ' resize-none'}
                            value={f.body}
                            onChange={(e) => onChange({ ...f, body: e.target.value } as QRFieldsByType[T])}
                        />
                    </Field>
                </div>
            );
        }
        case 'phone': {
            const f = fields as PhoneFields;
            return (
                <Field label="Phone number">
                    <input
                        type="tel"
                        className={inputClass}
                        placeholder="+1 512 555 0123"
                        value={f.phone}
                        onChange={(e) => onChange({ ...f, phone: e.target.value } as QRFieldsByType[T])}
                    />
                </Field>
            );
        }
        case 'sms': {
            const f = fields as SmsFields;
            return (
                <div className="space-y-4">
                    <Field label="Phone number">
                        <input
                            type="tel"
                            className={inputClass}
                            placeholder="+1 512 555 0123"
                            value={f.phone}
                            onChange={(e) => onChange({ ...f, phone: e.target.value } as QRFieldsByType[T])}
                        />
                    </Field>
                    <Field label="Message (optional)">
                        <textarea
                            rows={3}
                            className={inputClass + ' resize-none'}
                            value={f.message}
                            onChange={(e) => onChange({ ...f, message: e.target.value } as QRFieldsByType[T])}
                        />
                    </Field>
                </div>
            );
        }
        case 'wifi': {
            const f = fields as WifiFields;
            return (
                <div className="space-y-4">
                    <Field label="Network name (SSID)">
                        <input
                            type="text"
                            className={inputClass}
                            value={f.ssid}
                            onChange={(e) => onChange({ ...f, ssid: e.target.value } as QRFieldsByType[T])}
                        />
                    </Field>
                    <Field label="Security">
                        <select
                            className={inputClass}
                            value={f.encryption}
                            onChange={(e) => onChange({ ...f, encryption: e.target.value as WifiFields['encryption'] } as QRFieldsByType[T])}
                        >
                            <option value="WPA">WPA / WPA2 / WPA3</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">None (open network)</option>
                        </select>
                    </Field>
                    {f.encryption !== 'nopass' && (
                        <Field label="Password">
                            <input
                                type="text"
                                className={inputClass}
                                value={f.password}
                                onChange={(e) => onChange({ ...f, password: e.target.value } as QRFieldsByType[T])}
                            />
                        </Field>
                    )}
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={f.hidden}
                            onChange={(e) => onChange({ ...f, hidden: e.target.checked } as QRFieldsByType[T])}
                            className="w-4 h-4 accent-primary"
                        />
                        Hidden network
                    </label>
                </div>
            );
        }
        case 'vcard': {
            const f = fields as VCardFields;
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="First name">
                            <input
                                type="text"
                                className={inputClass}
                                value={f.firstName}
                                onChange={(e) => onChange({ ...f, firstName: e.target.value } as QRFieldsByType[T])}
                            />
                        </Field>
                        <Field label="Last name">
                            <input
                                type="text"
                                className={inputClass}
                                value={f.lastName}
                                onChange={(e) => onChange({ ...f, lastName: e.target.value } as QRFieldsByType[T])}
                            />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Organization">
                            <input
                                type="text"
                                className={inputClass}
                                value={f.org}
                                onChange={(e) => onChange({ ...f, org: e.target.value } as QRFieldsByType[T])}
                            />
                        </Field>
                        <Field label="Title">
                            <input
                                type="text"
                                className={inputClass}
                                value={f.title}
                                onChange={(e) => onChange({ ...f, title: e.target.value } as QRFieldsByType[T])}
                            />
                        </Field>
                    </div>
                    <Field label="Phone">
                        <input
                            type="tel"
                            className={inputClass}
                            value={f.phone}
                            onChange={(e) => onChange({ ...f, phone: e.target.value } as QRFieldsByType[T])}
                        />
                    </Field>
                    <Field label="Email">
                        <input
                            type="email"
                            className={inputClass}
                            value={f.email}
                            onChange={(e) => onChange({ ...f, email: e.target.value } as QRFieldsByType[T])}
                        />
                    </Field>
                    <Field label="Website">
                        <input
                            type="url"
                            className={inputClass}
                            value={f.website}
                            onChange={(e) => onChange({ ...f, website: e.target.value } as QRFieldsByType[T])}
                        />
                    </Field>
                </div>
            );
        }
        default:
            return null;
    }
}
