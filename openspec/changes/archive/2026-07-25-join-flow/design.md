## Context

`JoinModal` is a controlled form (name, email, LinkedIn, stage) with Escape-key and backdrop dismissal, posting to `/api/join`. `join.ts` parses the body, creates `join_applications` if missing, and inserts the row directly — with no required-field check and no email format validation.

## Goals / Non-Goals

**Goals:**
- Document the flow's current, real contract precisely, including where it currently falls short of its siblings.

**Non-Goals:**
- Not implementing the missing validation in this change — that's a follow-up, tracked below as a risk, not silently fixed here.

## Decisions

- Kept the modal UI and its backend function as one capability, since they're a single indivisible user-facing flow.

## Risks / Trade-offs

- **`netlify/functions/join.ts` has zero input validation** — no required-field check, no email format check — unlike `contact.ts` and `event-signup.ts`, which both validate before inserting. Malformed or empty submissions are currently written to `join_applications` as-is. Recommend a follow-up change bringing `join.ts` in line with its siblings' validation pattern.
