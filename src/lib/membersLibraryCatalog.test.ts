import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_MEMBERS_APP_ORIGIN,
  MEMBERS_APP_ORIGIN,
  assetById,
  fetchMembersLibraryCatalog,
  fullDownloadUrl,
  isLandingFull,
  isTeaserPublic,
  parseCatalog,
  resolveMembersAppOrigin,
  teaserDownloadUrl,
  type PublicLibraryCatalog,
} from './membersLibraryCatalog';

const VISA = {
  id: 'visa-pathways',
  title: 'Visa pathways',
  memberDownloadable: false,
  teaserPublic: false,
  landingFull: false,
  fullObjectKey: 'pack-a/visa-pathways.pdf',
  teaserObjectKey: 'pack-a/teasers/visa-pathways.pdf',
};
const BANKING = {
  ...VISA,
  id: 'banking',
  title: 'Banking',
  description: 'Opening a US account from abroad.',
  memberDownloadable: true,
  teaserPublic: true,
};
const DISCOVERED = {
  ...VISA,
  id: 'hiring-abroad',
  title: 'Hiring abroad',
  landingFull: true,
  fullObjectKey: 'library/hiring-abroad.pdf',
  teaserObjectKey: 'library/teasers/hiring-abroad.pdf',
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

  it('requires landingFull and a string-or-absent description', () => {
    const { landingFull: _omit, ...noLandingFull } = VISA;
    void _omit;
    const parsed = parseCatalog({
      assets: [
        noLandingFull,
        { ...VISA, landingFull: 'true' },
        { ...VISA, description: 42 },
        { ...VISA, id: '' },
        BANKING,
        DISCOVERED,
      ],
    });
    expect(parsed).toEqual({ assets: [BANKING, DISCOVERED] });
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

describe('landing full gate', () => {
  const catalog: PublicLibraryCatalog = { assets: [VISA, BANKING, DISCOVERED] };

  it('opens only when landingFull is true', () => {
    expect(isLandingFull(catalog, 'hiring-abroad')).toBe(true);
    expect(isLandingFull(catalog, 'visa-pathways')).toBe(false);
  });

  it('never treats memberDownloadable as a landing full grant', () => {
    expect(BANKING.memberDownloadable).toBe(true);
    expect(isLandingFull(catalog, 'banking')).toBe(false);
  });

  it('stays closed for unknown ids and missing catalogs', () => {
    expect(isLandingFull(catalog, 'missing')).toBe(false);
    expect(isLandingFull(null, 'hiring-abroad')).toBe(false);
    expect(isLandingFull(undefined, 'hiring-abroad')).toBe(false);
  });
});

describe('download urls', () => {
  it('points at the members public teaser and full routes', () => {
    expect(teaserDownloadUrl(DEFAULT_MEMBERS_APP_ORIGIN, 'visa-pathways')).toBe(
      'https://members.ifn.community/api/public/library/visa-pathways/teaser',
    );
    expect(fullDownloadUrl('http://localhost:8889', 'visa-pathways')).toBe(
      'http://localhost:8889/api/public/library/visa-pathways/full',
    );
  });

  it('encodes the id as one path segment', () => {
    expect(fullDownloadUrl(DEFAULT_MEMBERS_APP_ORIGIN, 'a/b c')).toBe(
      'https://members.ifn.community/api/public/library/a%2Fb%20c/full',
    );
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
