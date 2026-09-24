# membership-page Delta

## MODIFIED Requirements

### Requirement: `/membership` describes the current paid membership accurately
The system SHALL render a page describing the paid membership's benefits and its
single published annual price, matching `ifn-strategy/v2/04-revenue-and-unit-economics.md`
for private community access and monthly office hours. The system SHALL NOT claim a
"full founder resource library" (or equivalent) as a currently shipped benefit while
`/resources` has zero published guides. Resource-related copy SHALL state that the
library is in progress and that members get first access when guides are published.

The page SHALL state that membership renews annually until cancelled. It SHALL
NOT state that the price is charged once, because billing is a subscription and
that sentence would be false. The renewal SHALL be disclosed on this page rather
than only on Stripe's, so the reader agrees to a recurring charge before they
reach checkout.

The system SHALL publish exactly one price. A second, lower annual price exists
as a warm-lead price sent by email to a selected list. It SHALL NOT be rendered
on any public surface, SHALL NOT be defined as an exported constant, SHALL NOT
be modelled as a tier, and SHALL NOT be purchasable through the site's checkout.

Offer JSON-LD description SHALL match this honesty.

#### Scenario: Visiting `/membership`
- **WHEN** a visitor navigates to `/membership`
- **THEN** a page renders describing the membership's benefits and exactly one price, stating annual renewal, with no v3/v4-tier claims
- **AND** resource-library wording does not assert a complete published library as current inventory

#### Scenario: Searching the built output for the non-public price
- **WHEN** the built `dist/` output is searched for the warm-lead price figure
- **THEN** it does not appear

#### Scenario: Membership benefit and Offer claims
- **WHEN** a visitor or crawler reads `/membership` copy or Offer structured data
- **THEN** no claim asserts a complete published resource library as current inventory
