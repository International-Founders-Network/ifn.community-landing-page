## Context

`qr-redirect.ts` resolves `/r/<code>` by looking up `qr_links`, logs a scan (user agent, referrer) to `qr_scans` best-effort (failure to log doesn't block the redirect), and 302s to the stored `target_url`; unknown codes get a styled 404 page. `qr-manage.ts` is reachable at `/manage/<editToken>` (a secret bearer token generated at creation, not a login) and supports viewing the destination, scan count, and 20 most recent scans (`GET`), and updating the destination (`PUT`, revalidated as an HTTP(S) URL). There is no authentication beyond possessing the token — anyone with the link can manage it, by design (matches how link-shortener "edit link" tokens commonly work, no user accounts on this app).

## Goals / Non-Goals

**Goals:**
- Document the redirect, scan-logging, and token-gated management contract precisely, including that the token is bearer-style, not a login.

**Non-Goals:**
- Not adding real authentication/ownership to management links in this change — the token-based model is a deliberate simplicity trade-off for a no-account tool, not an oversight.

## Decisions

- Scan logging failures never block the redirect itself — availability of the redirect takes priority over completeness of analytics.

## Risks / Trade-offs

- Anyone who obtains an edit token (e.g. via a leaked URL) can retarget or view the analytics for that link. This is an accepted trade-off of the no-account design, not a bug — but worth remembering before ever making the resulting short links look "trusted" in messaging.
