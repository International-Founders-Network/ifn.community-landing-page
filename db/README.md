# Database Documentation

This project uses **Neon (Postgres)** as the primary database, integrated via Netlify Functions.

## 🚀 Schema Management

### Automatic Creation

The Netlify Functions in `netlify/functions/` use `CREATE TABLE IF NOT EXISTS` logic. This ensures that the required tables are created automatically when the functions are first called.

### Manual Migrations

All schema changes should be documented in `db/migrations/`.

- `00_initial_schema.sql`: Contains the current production-ready schema.
- `03_memberships.sql`: Membership subscriptions (2026-08-27).
- `01_qr_links.sql`: Schema for the QR code generator in `apps/qr`.
- `02_event_venue_station_austin.sql`: **Data** migration, not schema. Rewrites
  the two historical `Capital Factory` values in `events.location_name` to
  `Station Austin, 701 Brazos St, Austin, TX 78701, USA`, which is byte for byte
  what `src/data/events.json` carries. Reported unapplied by the founder on
  2026-08-10, not verified from this repo. Confirm with the `curl` check in
  `AGENTS.md` rather than trusting that date.

Nothing applies migrations automatically. Run `02_*` deliberately, against a
database you name on the command line:

```sh
DATABASE_URL='<connection string>' node scripts/fix-event-venue.mjs          # preview, writes nothing
DATABASE_URL='<connection string>' node scripts/fix-event-venue.mjs --apply  # writes
```

The runner reads the `.sql` file and sends its text verbatim, so the migration
and the thing you actually execute cannot drift apart. It is safe to run twice:
the update matches two exact old strings and writes a value that equals neither,
so the second run touches zero rows. Any other string containing "Capital
Factory" is left alone and reported, so an unrecorded variant gets a human
decision instead of a blanket overwrite. No connection string is stored in this
repo; the deployed functions use `NETLIFY_DATABASE_URL` and the runner accepts
either variable name.

Why this matters at deploy time, how to spot the symptom on the live site, and
why a re-sync from Luma can undo it are written up in `AGENTS.md` under
**Deployment**, in "The live `events` rows can contradict the deployed copy".

## ⚡ Tables

1. **`join_applications`**: Stores community joining requests.
2. **`contact_messages`**: Stores inquiries from the Contact page.
3. **`event_signups`**: Stores email signups from the Events page.
4. **`events`**: Stores event information (synchronized from Luma/Meetup).
5. **`memberships`**: Paid membership subscriptions, written only by
   `netlify/functions/stripe-webhook.ts`. Stripe stays the system of record for
   money; this answers "is this person a member, and when do they lapse?"
   `stripe_subscription_id` is UNIQUE because it is the `ON CONFLICT` target that
   makes the webhook idempotent, and `last_event_at` guards the update so a
   stale, out-of-order event cannot revive a cancelled member.

## 🌍 Environment Separation

- **Production**: Uses the `Main` branch in Neon. The connection string is set in the Netlify Dashboard.
- **Local Dev**: Use a separate **Neon Branch** (e.g., `local-dev`) and set its URL in your local `.env`.

## 🛠️ Performance

The functions use the `@neondatabase/serverless` driver for optimal performance in serverless environments.
