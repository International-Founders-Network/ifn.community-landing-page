# Database Documentation

This project uses **Neon (Postgres)** as the primary database, integrated via Netlify Functions.

## 🚀 Schema Management

### Automatic Creation

The Netlify Functions in `netlify/functions/` use `CREATE TABLE IF NOT EXISTS` logic. This ensures that the required tables are created automatically when the functions are first called.

### Manual Migrations

All schema changes should be documented in `db/migrations/`.

- `00_initial_schema.sql`: Contains the current production-ready schema.

## ⚡ Tables

1. **`join_applications`**: Stores community joining requests.
2. **`contact_messages`**: Stores inquiries from the Contact page.
3. **`event_signups`**: Stores email signups from the Events page.
4. **`events`**: Stores event information (synchronized from Luma/Meetup).

## 🌍 Environment Separation

- **Production**: Uses the `Main` branch in Neon. The connection string is set in the Netlify Dashboard.
- **Local Dev**: Use a separate **Neon Branch** (e.g., `local-dev`) and set its URL in your local `.env`.

## 🛠️ Performance

The functions use the `@neondatabase/serverless` driver for optimal performance in serverless environments.
