## Context

`Blog.tsx` renders a title and "Coming soon..." with no data or async logic — identical to the other seven stub routes already in `placeholder-pages`.

## Goals / Non-Goals

**Goals:**
- Bring the spec in line with what actually exists in `src/pages/`.

**Non-Goals:**
- Not building out Blog content in this change.

## Decisions

- Folded into the existing `placeholder-pages` capability rather than a new one, consistent with how the other seven stubs are grouped.

## Risks / Trade-offs

- None. This is a correction of an omission found while writing `BACKLOG.md`'s spec-index rewrite, not a new finding about the code itself.
