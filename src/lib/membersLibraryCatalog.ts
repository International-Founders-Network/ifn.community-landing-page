/**
 * Read-only consumer of the members app's Pack A public catalog.
 *
 * `GET {MEMBERS_APP_ORIGIN}/api/public/library` returns per-asset flags. The
 * ONLY place those flags are edited is the members app's `/admin/library`.
 * Landing Admin must never grow a second toggle for them.
 *
 * Rules for anything built on this module:
 *
 * - Teasers are parked. Do not render a teaser download or link until Content
 *   has published the file under `pack-a/teasers/` AND `teaserPublic` is on
 *   for that asset. Gate on `isTeaserPublic()`, which accepts `true` only;
 *   anything else (false, missing, unknown id, failed fetch) means hide it.
 * - `memberDownloadable` is NOT a landing full-PDF grant. Full Pack A PDFs are
 *   served by the members app only; send entitled users to
 *   https://members.ifn.community/library.
 * - The fetch soft-fails with a typed result so a members outage never breaks
 *   a landing page.
 */

export interface PublicLibraryAsset {
  id: string;
  title: string;
  memberDownloadable: boolean;
  teaserPublic: boolean;
  fullObjectKey: string;
  teaserObjectKey: string;
}

export interface PublicLibraryCatalog {
  assets: PublicLibraryAsset[];
}

export type CatalogResult =
  | { ok: true; data: PublicLibraryCatalog }
  | { ok: false; error: string };

export const DEFAULT_MEMBERS_APP_ORIGIN = 'https://members.ifn.community';

/** Env override, trimmed of trailing slashes; falls back to production. */
export function resolveMembersAppOrigin(raw: string | undefined): string {
  const value = raw?.trim().replace(/\/+$/, '');
  return value ? value : DEFAULT_MEMBERS_APP_ORIGIN;
}

export const MEMBERS_APP_ORIGIN = resolveMembersAppOrigin(
  import.meta.env.VITE_MEMBERS_APP_URL as string | undefined,
);

export const MEMBERS_LIBRARY_URL = `${MEMBERS_APP_ORIGIN}/library`;

function isAsset(value: unknown): value is PublicLibraryAsset {
  if (!value || typeof value !== 'object') return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.title === 'string' &&
    typeof a.memberDownloadable === 'boolean' &&
    typeof a.teaserPublic === 'boolean' &&
    typeof a.fullObjectKey === 'string' &&
    typeof a.teaserObjectKey === 'string'
  );
}

/** Validates the response shape; malformed assets are dropped, not trusted. */
export function parseCatalog(body: unknown): PublicLibraryCatalog | null {
  if (!body || typeof body !== 'object') return null;
  const assets = (body as { assets?: unknown }).assets;
  if (!Array.isArray(assets)) return null;
  return { assets: assets.filter(isAsset) };
}

export async function fetchMembersLibraryCatalog(
  init?: RequestInit,
  origin: string = MEMBERS_APP_ORIGIN,
): Promise<CatalogResult> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  try {
    const res = await fetch(`${origin}/api/public/library`, {
      ...init,
      method: 'GET',
      headers,
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = parseCatalog(await res.json());
    if (!data) return { ok: false, error: 'Malformed catalog response' };
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function assetById(
  catalog: PublicLibraryCatalog | null | undefined,
  id: string,
): PublicLibraryAsset | undefined {
  return catalog?.assets.find((a) => a.id === id);
}

/** The teaser gate. `true` only; everything else keeps the teaser hidden. */
export function isTeaserPublic(
  catalog: PublicLibraryCatalog | null | undefined,
  id: string,
): boolean {
  return assetById(catalog, id)?.teaserPublic === true;
}
