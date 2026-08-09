# Photo source - real meetup photos

> **These live outside `public/` on purpose.** Vite copies `public/` into `dist/`
> verbatim, so anything placed there is served publicly at `ifn.community/...`
> even when nothing links to it. These are photographs of identifiable people,
> so the originals stay here, unserved. The redesign build generates optimised,
> consented derivatives into `public/` for only the shots actually used.

Upload straight into these folders. Any format (JPG, PNG, HEIC straight off a
phone). Don't crop, resize, or rename anything - I'll handle conversion, cropping
and responsive sizes. Original resolution is always better.

```
assets/photos-source/
  meetups/     <- the important one. 6-10 photos.
  venue/       <- Station Austin, 1-2 photos.
  portraits/   <- optional, only with consent. 0-6 photos.
```

---

## Before you upload: consent

These are real, identifiable people, and they will be on a public website. The
whole brand rests on being trustworthy, so this one is not a formality.

- Get an OK from anyone whose face is clearly recognisable.
- If someone said no, or you're unsure, put them in `meetups/` anyway and add
  their name to `DO-NOT-USE.txt` in this folder. I'll design around them.
- Photos where people are turned away, mid-gesture, or out of focus still carry
  the "this room is real" signal and carry less consent risk. They are genuinely
  useful, not second-best.

---

## `meetups/` - 6 to 10 photos

This is what makes the redesign work. Priority order:

1. **The room, wide, mid-conversation.** Shot from the back or a corner, taking
   in as much of the room as possible, while people are actually talking.
   Landscape. This is the hero image and it does more work than the other nine
   combined. If you only find one photo, find this one.
2. **Two people talking, close.** The Reuneo one-to-one pairing is IFN's actual
   product. A single pair mid-conversation, shot at their level, is the most
   honest picture of what a member is buying. Two or three of these.
3. **Arriving.** The door, the name tags, the first handshake, coats still on.
   The page's whole argument is about arriving somewhere new.
4. **Someone talking to the room.** Presenting, introducing, answering.
5. **The wide room again, from a different night.** Different clothes, different
   season. Two nights that are visibly different nights is proof of a *recurring*
   meetup, which is the single hardest thing to fake and IFN's strongest claim.

**What works:** candid, unposed, available light, slightly imperfect. Phone
photos are fine and often better than a hired photographer.
**What doesn't:** posed group shots facing the camera, heavy filters, anything
that looks like stock. The point is that this obviously is not stock.

## `venue/` - 1 to 2 photos

Station Austin, empty or being set up. Establishes it as a real, specific place.
Wide, landscape.

## `portraits/` - optional

Only if you already have them and have consent. These are for real member
testimonials later - `PRODUCT.md` says the quotes are collectible from LinkedIn,
and a real face beside a real quote is worth more than either alone.

---

## Once uploaded

Tell me they're in and I'll take it from there: conversion to AVIF/WebP with JPEG
fallbacks, responsive `srcset`, correct `width`/`height` to keep CLS at zero,
art-directed crops per breakpoint, and `alt` text written per photo.

If some slots stay empty I'll ship labelled placeholder slots rather than filling
the page with decorative SVG, and tell you exactly which photos are still missing.
