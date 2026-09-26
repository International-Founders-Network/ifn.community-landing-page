import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_MEMBERS_APP_ORIGIN,
  MEMBERS_APP_ORIGIN,
  assetById,
  fetchMembersLibraryCatalog,
  isTeaserPublic,
  parseCatalog,
  resolveMembersAppOrigin,
  type PublicLibraryCatalog,
} from './membersLibraryCatalog';

const VISA = {
  id: 'visa-pathways',
  title: 'Visa pathways',
  memberDownloadable: false,
  teaserPublic: false,
  fullObjectKey: 'pack-a/visa-pathways.pdf',
  teaserObjectKey: 'pack-a/teasers/visa-pathways.pdf',
};
const BANKING = {
  ...VISA,
  id: 'banking',
  title: 'Banking',
  memberDownloadable: true,
  teaserPublic: true,
};

describe('members app origin', () => {
  it('defaults to production members origin', () => {
    expect(DEFAULT_MEMBERS_APP_ORIGIN).toBe('https://members.ifn.community');
    expect(resolveMembersAppOrigin(undefined)).toBe(DEFAULT_MEMBERS_APP_ORIGIN);
    expect(resolveMembersAppOrigin('  ')).toBe(DEFAULT_MEMBERS_APP_ORIGIN);
    expect(MEMBERS_APP_ORIGIN).toBe(DEFAULT_MEMBERS_APP_ORIGIN);
  });

  it('honours an override and strips trailing slashes', () => {
    expect(resolveMembersAppOrigin('http://localhost:8889/')).toBe('http://localhost:8889');
  });
});

describe('parseCatalog', () => {
  it('keeps well-formed assets and drops malformed ones', () => {
    const parsed = parseCatalog({
      assets: [VISA, { id: 'x', teaserPublic: 'yes' }, null],
    });
    expect(parsed).toEqual({ assets: [VISA] });
  });

  it('rejects a body without an assets array', () => {
    expect(parseCatalog(null)).toBeNull();
    expect(parseCatalog({ assets: 'nope' })).toBeNull();
  });
});

describe('teaser gate', () => {
  const catalog: PublicLibraryCatalog = { assets: [VISA, BANKING] };

  it('opens only when teaserPublic is true', () => {
    expect(isTeaserPublic(catalog, 'banking')).toBe(true);
    expect(isTeaserPublic(catalog, 'visa-pathways')).toBe(false);
  });

  it('stays closed for unknown ids and missing catalogs', () => {
    expect(isTeaserPublic(catalog, 'missing')).toBe(false);
    expect(isTeaserPublic(null, 'banking')).toBe(false);
    expect(isTeaserPublic(undefined, 'banking')).toBe(false);
  });

  it('assetById finds by id', () => {
    expect(assetById(catalog, 'visa-pathways')).toEqual(VISA);
    expect(assetById(catalog, 'missing')).toBeUndefined();
  });
});

describe('fetchMembersLibraryCatalog', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('GETs the public library endpoint and returns ok data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ assets: [VISA] }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchMembersLibraryCatalog();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://members.ifn.community/api/public/library',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toEqual({ ok: true, data: { assets: [VISA] } });
  });

  it('soft-fails on non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    expect(await fetchMembersLibraryCatalog()).toEqual({ ok: false, error: 'HTTP 503' });
  });

  it('soft-fails on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    expect(await fetchMembersLibraryCatalog()).toEqual({ ok: false, error: 'Failed to fetch' });
  });
});
