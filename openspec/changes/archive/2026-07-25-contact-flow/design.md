## Context

`Contact.tsx` is a controlled form requiring name, email, and message (phone/company optional), posting to `/api/contact`. The function validates required fields and email format server-side, creates `contact_messages` if missing, and inserts the row. It only stores the message — it does not send an email notification or otherwise forward it anywhere.

## Goals / Non-Goals

**Goals:**
- Document the current, already-validated contract precisely.

**Non-Goals:**
- Not adding outbound notification (e.g. emailing the team when a message arrives) in this change — today "contact" means "stored in Postgres, visible via the admin dashboard," not "delivered to an inbox." `BACKLOG.md`'s "implement a real backend" item is more precisely "no outbound notification exists yet," not "no backend exists" — the backend is real and working.

## Decisions

- Kept form UI and backend function as one capability — same reasoning as `join-flow`.

## Risks / Trade-offs

- None significant — this is the most complete/validated of the three form flows (compare `join-flow`'s known gap).
