-- Outbound-link allowlist overlay (openspec/changes/admin-ux-blog-links-review).
--
-- Admin → Links writes one row per sponsor / potential id (the seed id from
-- src/data/linkAllowlistData.ts, e.g. potential-cooley-foreign-founders-visas-corporate-2025)
-- when Approve or Hold is clicked. scripts/compile-blog.mjs reads it at build
-- time: anchors to a sponsor / potential host survive in post HTML only when
-- the effective row is verified AND allow_outbound. A change reaches published
-- pages on the next build, which admin-links requests via the build hook.
-- netlify/functions/_lib/linkAllowlist.ts runs the same CREATE TABLE IF NOT
-- EXISTS at request time; keep the two in step.
CREATE TABLE IF NOT EXISTS link_allowlist (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('draft','verified','blocked')),
  allow_outbound BOOLEAN NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT NULL
);
