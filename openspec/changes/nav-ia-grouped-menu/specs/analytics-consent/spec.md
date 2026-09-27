# Spec Delta

## Purpose

The bottom-of-page banner that asks a visitor whether optional analytics may
store data on their device, and records their choice.

## ADDED Requirements

### Requirement: Consent banner copy
The banner SHALL read "Optional analytics help us improve the site. Decline
anytime. Privacy policy." where "Privacy policy" links to `/privacy-policy`.
The decline button SHALL read "No thanks" and the accept button SHALL read
"OK". The banner SHALL NOT name the analytics vendor.

#### Scenario: First visit
- **WHEN** a visitor with no stored choice loads a page and analytics is configured
- **THEN** the banner shows the body text above with a working Privacy policy link and the buttons "No thanks" and "OK"

### Requirement: Equal-weight choices recorded once
The two buttons SHALL have the same size, padding and type scale, differing
only in fill. Choosing "No thanks" SHALL record `denied` and choosing "OK"
SHALL record `granted`; either choice SHALL hide the banner and it SHALL NOT
reappear while a choice is stored.

#### Scenario: Decline
- **WHEN** the visitor chooses "No thanks"
- **THEN** consent is stored as denied, the banner disappears, and it does not return on the next page

#### Scenario: Accept
- **WHEN** the visitor chooses "OK"
- **THEN** consent is stored as granted and the banner disappears

### Requirement: Non-blocking, client-only banner
The banner SHALL be a labelled region, not a dialog, and SHALL NOT trap focus
or block the page. It SHALL render only on the client so prerendered HTML never
contains it and hydration does not mismatch.

#### Scenario: Prerendered HTML
- **WHEN** a crawler fetches a prerendered route
- **THEN** the HTML contains no consent banner markup
