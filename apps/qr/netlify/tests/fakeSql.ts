/**
 * In-memory stand-in for the Neon tagged-template `sql` used by the QR
 * functions. It recognises exactly the statements those functions issue and
 * nothing else, so a new query fails loudly here instead of passing silently.
 * Tests only; never talks to a database.
 */
export interface FakeLink {
    id: number;
    code: string;
    edit_token: string;
    target_url: string;
    label: string | null;
    created_at: string;
    updated_at: string;
}

export interface FakeDb {
    links: FakeLink[];
    scans: { qr_link_id: number; user_agent: string | null; referrer: string | null; scanned_at: string }[];
    queries: string[];
}

export function createFakeDb(): FakeDb {
    return { links: [], scans: [], queries: [] };
}

export function createFakeSql(db: FakeDb) {
    return async (strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown[]> => {
        const text = strings.join('?').replace(/\s+/g, ' ').trim();
        db.queries.push(text);
        const now = new Date().toISOString();

        if (text.startsWith('CREATE TABLE')) return [];
        if (text.startsWith('INSERT INTO qr_links')) {
            const [code, editToken, targetUrl, label] = values as [string, string, string, string | null];
            if (db.links.some((l) => l.code === code)) throw new Error('duplicate key value violates unique constraint');
            db.links.push({ id: db.links.length + 1, code, edit_token: editToken, target_url: targetUrl, label, created_at: now, updated_at: now });
            return [];
        }
        if (text.startsWith('SELECT id, target_url FROM qr_links WHERE code')) {
            return db.links.filter((l) => l.code === values[0]).map((l) => ({ id: l.id, target_url: l.target_url }));
        }
        if (text.startsWith('INSERT INTO qr_scans')) {
            const [id, ua, ref] = values as [number, string | null, string | null];
            db.scans.push({ qr_link_id: id, user_agent: ua, referrer: ref, scanned_at: now });
            return [];
        }
        if (text.startsWith('SELECT code, target_url, label')) {
            return db.links.filter((l) => l.edit_token === values[0]);
        }
        if (text.startsWith('SELECT COUNT(*)')) {
            const link = db.links.find((l) => l.edit_token === values[0]);
            return [{ count: link ? db.scans.filter((s) => s.qr_link_id === link.id).length : 0 }];
        }
        if (text.startsWith('SELECT scanned_at')) {
            const link = db.links.find((l) => l.edit_token === values[0]);
            return link ? db.scans.filter((s) => s.qr_link_id === link.id) : [];
        }
        if (text.startsWith('UPDATE qr_links SET target_url')) {
            const [targetUrl, token] = values as [string, string];
            const link = db.links.find((l) => l.edit_token === token);
            if (!link) return [];
            link.target_url = targetUrl;
            link.updated_at = now;
            return [{ id: link.id }];
        }
        throw new Error(`fakeSql: unrecognised query: ${text}`);
    };
}
