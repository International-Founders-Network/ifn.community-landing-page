/**
 * BUILD-TIME OUTBOUND-LINK GATE (openspec/changes/admin-ux-blog-links-review).
 *
 * Blog Markdown may cite a sponsor or a potential (Cooley, Mercury, OtoCo, ...)
 * before Venkat has approved linking to it. The citation stays in the copy; the
 * link does not. Every `<a href>` whose host belongs to a sponsor or potential
 * row in Admin → Links is unwrapped to its own text unless that row is
 * effectively verified + allowOutboundLink. Relative links, ifn.community and
 * every host not listed in Links (irs.gov, uscis.gov, fincen.gov, ...) pass
 * through untouched, because only listed hosts are gated.
 *
 * This runs when compile-blog renders HTML, so it is decided per build, not per
 * request: approving a row in Admin → Links changes an already-published post
 * only when the next build finishes. There is no runtime rewriter.
 *
 * Hosts are compared by hostname, lowercased, without "www." or a trailing dot.
 * A subdomain of a listed host is gated too (fail closed). A different hostname
 * of the same company is NOT: OtoCo's row is blog.otoco.io, so otoco.io is not
 * gated until it gets a row of its own.
 */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

const WEB_URL = /^(?:https?:)?\/\//i;

/** Hostname of an absolute http(s) or protocol-relative URL, normalised; '' for anything else. */
export function outboundHost(url) {
    if (typeof url !== 'string' || !WEB_URL.test(url.trim())) return '';
    try {
        return new URL(url.trim(), 'https://ifn.community').hostname
            .toLowerCase()
            .replace(/\.$/, '')
            .replace(/^www\./, '');
    } catch {
        return '';
    }
}

/**
 * rows: effective Admin → Links rows (seed merged with the Neon overlay), each
 * { kind, website?, allowOutboundLink }.
 *   gated   = hosts of sponsors and potentials, whatever their status
 *   allowed = hosts of rows whose effective allowOutboundLink is true, which
 *             is partners with a website plus approved sponsors / potentials
 */
export function buildOutboundGate(rows) {
    const gated = new Set();
    const allowed = new Set();
    for (const row of rows) {
        const host = outboundHost(row.website);
        if (!host) continue;
        if (row.kind === 'sponsor' || row.kind === 'potential') gated.add(host);
        if (row.allowOutboundLink) allowed.add(host);
    }
    return { gated, allowed };
}

/** Longest entry in `hosts` that is `host` itself or a parent domain of it; '' when none. */
function closestHost(host, hosts) {
    let best = '';
    for (const candidate of hosts) {
        if ((host === candidate || host.endsWith(`.${candidate}`)) && candidate.length > best.length) {
            best = candidate;
        }
    }
    return best;
}

/**
 * True when href points at a gated host that is not approved. An allowed host
 * clears the link only when it is at least as specific as the host that gates
 * it, so an approved parent domain cannot unlock a sponsor row that sits on a
 * subdomain of it.
 */
export function isHeldHref(href, gate) {
    const host = outboundHost(href);
    if (!host) return false;
    const gatedBy = closestHost(host, gate.gated);
    if (!gatedBy) return false;
    return closestHost(host, gate.allowed).length < gatedBy.length;
}

function textOf(node) {
    if (node.type === 'text') return node.value;
    return (node.children ?? []).map(textOf).join('');
}

function unwrapHeldAnchors(parent, gate, held) {
    if (!parent.children) return;
    const next = [];
    for (const child of parent.children) {
        unwrapHeldAnchors(child, gate, held);
        const href = child.type === 'element' && child.tagName === 'a' ? child.properties?.href : undefined;
        if (typeof href === 'string' && isHeldHref(href, gate)) {
            held.push({ text: textOf(child).trim(), href, host: outboundHost(href) });
            // Keep the words, drop the link: the anchor's children take its place.
            next.push(...child.children);
        } else {
            next.push(child);
        }
    }
    parent.children = next;
}

/** rehype plugin. Runs after rehype-sanitize; it only ever removes <a> wrappers. */
export function rehypeOutboundGate({ gate, held }) {
    return (tree) => unwrapHeldAnchors(tree, gate, held);
}

export const OPEN_GATE = Object.freeze({ gated: new Set(), allowed: new Set() });

/**
 * The one Markdown → HTML pipeline used by compile-blog, gate included, so the
 * tests exercise exactly what the build runs. Returns the sanitized HTML and
 * the anchors that were held back ({ text, href, host }).
 */
export async function markdownToHtml(markdown, gate = OPEN_GATE) {
    const held = [];
    const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeOutboundGate, { gate, held })
        .use(rehypeStringify)
        .process(markdown);
    return { html: String(file), held };
}
