-- Blog editorial overlay (openspec/changes/blog-editorial-publish).
--
-- Admin → Blog writes status / publish_at here; scripts/compile-blog.mjs reads
-- it at build time and it wins over Markdown frontmatter for those two fields
-- only. netlify/functions/_lib/blogEditorial.ts runs the same CREATE TABLE IF
-- NOT EXISTS at request time; keep the two in step.
CREATE TABLE IF NOT EXISTS blog_editorial (
  slug TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('draft','in_review','approved','scheduled','live')),
  publish_at TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT NULL
);
