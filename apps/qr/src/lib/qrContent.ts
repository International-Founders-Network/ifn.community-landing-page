export type QRContentType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard';

export interface UrlFields {
    url: string;
}

export interface TextFields {
    text: string;
}

export interface EmailFields {
    to: string;
    subject: string;
    body: string;
}

export interface PhoneFields {
    phone: string;
}

export interface SmsFields {
    phone: string;
    message: string;
}

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiFields {
    ssid: string;
    password: string;
    encryption: WifiEncryption;
    hidden: boolean;
}

export interface VCardFields {
    firstName: string;
    lastName: string;
    org: string;
    title: string;
    phone: string;
    email: string;
    website: string;
}

export interface QRFieldsByType {
    url: UrlFields;
    text: TextFields;
    email: EmailFields;
    phone: PhoneFields;
    sms: SmsFields;
    wifi: WifiFields;
    vcard: VCardFields;
}

export const emptyFields: QRFieldsByType = {
    url: { url: '' },
    text: { text: '' },
    email: { to: '', subject: '', body: '' },
    phone: { phone: '' },
    sms: { phone: '', message: '' },
    wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
    vcard: { firstName: '', lastName: '', org: '', title: '', phone: '', email: '', website: '' },
};

export const contentTypeLabels: Record<QRContentType, string> = {
    url: 'Website URL',
    text: 'Plain Text',
    email: 'Email',
    phone: 'Phone',
    sms: 'SMS',
    wifi: 'WiFi',
    vcard: 'Contact Card',
};

// WiFi spec (ZXing) escaping: backslash-escape \ ; , : "
function escapeWifi(value: string): string {
    return value.replace(/([\\;,:"])/g, '\\$1');
}

// vCard escaping: backslash-escape \ ; , and newlines
function escapeVCard(value: string): string {
    return value.replace(/([\\;,])/g, '\\$1').replace(/\r?\n/g, '\\n');
}

export function buildQrData<T extends QRContentType>(type: T, fields: QRFieldsByType[T]): string {
    switch (type) {
        case 'url':
            return (fields as UrlFields).url.trim();
        case 'text':
            return (fields as TextFields).text;
        case 'email': {
            const f = fields as EmailFields;
            const params = new URLSearchParams();
            if (f.subject) params.set('subject', f.subject);
            if (f.body) params.set('body', f.body);
            const qs = params.toString();
            return `mailto:${f.to}${qs ? `?${qs}` : ''}`;
        }
        case 'phone':
            return `tel:${(fields as PhoneFields).phone}`;
        case 'sms': {
            const f = fields as SmsFields;
            return `SMSTO:${f.phone}:${f.message}`;
        }
        case 'wifi': {
            const f = fields as WifiFields;
            const parts = [`T:${f.encryption}`, `S:${escapeWifi(f.ssid)}`];
            if (f.encryption !== 'nopass') parts.push(`P:${escapeWifi(f.password)}`);
            if (f.hidden) parts.push('H:true');
            return `WIFI:${parts.join(';')};;`;
        }
        case 'vcard': {
            const f = fields as VCardFields;
            const fullName = `${f.firstName} ${f.lastName}`.trim();
            return [
                'BEGIN:VCARD',
                'VERSION:3.0',
                `N:${escapeVCard(f.lastName)};${escapeVCard(f.firstName)}`,
                fullName && `FN:${escapeVCard(fullName)}`,
                f.org && `ORG:${escapeVCard(f.org)}`,
                f.title && `TITLE:${escapeVCard(f.title)}`,
                f.phone && `TEL:${f.phone}`,
                f.email && `EMAIL:${f.email}`,
                f.website && `URL:${f.website}`,
                'END:VCARD',
            ]
                .filter(Boolean)
                .join('\n');
        }
        default:
            return '';
    }
}

export function isFieldsEmpty(type: QRContentType, fields: QRFieldsByType[QRContentType]): boolean {
    switch (type) {
        case 'url':
            return !(fields as UrlFields).url.trim();
        case 'text':
            return !(fields as TextFields).text.trim();
        case 'email':
            return !(fields as EmailFields).to.trim();
        case 'phone':
            return !(fields as PhoneFields).phone.trim();
        case 'sms':
            return !(fields as SmsFields).phone.trim();
        case 'wifi':
            return !(fields as WifiFields).ssid.trim();
        case 'vcard': {
            const f = fields as VCardFields;
            return !f.firstName.trim() && !f.lastName.trim();
        }
        default:
            return true;
    }
}
