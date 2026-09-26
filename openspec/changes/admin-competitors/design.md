# Design: admin Competitors tab

## Context

`/admin` already gates Contact / Join / Events / Roadmap behind Google Identity Services → `/api/auth-google` → `ADMIN_ALLOWED_EMAILS` → httpOnly session. Roadmap is static local data with no fetch. Competitors follows that pattern.

## Decisions

1. **Static TS module** (`competitorsData.ts`) matching planned `Competitor` shape from the 2026-09-26 plan §3. Research JSON fields map in:
   - `audience` → `summary`
   - `venue` → `venueNote`
   - `geography` → `geography`
   - `url` → `url`; Meetup/Luma/Station event listing → `eventsUrl` when distinct
   - `sources[].url` → `sources`
   - cadence / pricing / strengths / gaps / notes → `notes` (qualitative only)
   - Research `status` (active/dormant/unknown) → `activityStatus` (avoids colliding with hygiene `status`)
   - hygiene `status` = `'draft'` for all seed rows (Research not admin-verified)
2. **UI**: Competitors tab + searchable table (Name, Kind, Overlap, Geography, Compare-on chips, Activity, Status, Last reviewed, Site/Events links).
3. **No API / Neon** for v1.
4. **Isolation**: only `Admin.tsx` imports the module.

## Non-goals

- Public `/competitors` page
- Invented member counts or scored rankings
- Clerk migration / Neon CRM
