-- Event venue correction: Capital Factory rows become Station Austin
-- Created: 2026-08-10
--
-- This is a DATA migration, not a schema change. The `events` table is filled
-- from the Luma and Meetup feeds, so rows written before the venue moved still
-- carry the old address. The bundled snapshot in src/data/events.json was
-- corrected by hand, which left the live Postgres rows contradicting the site
-- copy: page copy said Station Austin while /api/events said Capital Factory.
--
-- HOW TO RUN: scripts/fix-event-venue.mjs (see db/README.md). That runner reads
-- THIS file and sends its text verbatim, so the two can never drift apart.
--
-- IDEMPOTENT: it matches two exact historical strings and writes a third value
-- that equals neither, so a second run updates zero rows.
--
-- Deliberately NOT a `LIKE 'Capital Factory%'` blanket. Only the two variants
-- that actually appear in this repo's history are rewritten. Any other variant
-- is left alone and reported by the runner, so an unrecorded value gets a human
-- decision instead of a silent overwrite.

UPDATE events
   SET location_name = 'Station Austin, 701 Brazos St, Austin, TX 78701, USA'
 WHERE location_name IN (
         'Capital Factory, 701 Brazos St, Austin, TX 78701, USA',
         'Capital Factory, Austin, TX'
       );
