/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Written by scripts/compile-blog.mjs from content/blog/*.md.
 * Regenerate with: node scripts/compile-blog.mjs
 *
 * Draft posts are excluded. Filename stem is the default slug.
 */

export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    excerpt: string;
    /** Publish date YYYY-MM-DD (America/Chicago intent; store as ISO date). */
    date: string;
    updated: string | null;
    tags: string[];
    ogImage: string | null;
    /** Sanitized HTML from Markdown body. */
    html: string;
}

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: "us-business-banking-document-pack",
        title: "US business banking for international founders: what peers gather first",
        description: "What international founders at IFN tend to gather before they walk into a US business banking conversation, at overview level.",
        excerpt: "What international founders at IFN tend to gather before they walk into a US business banking conversation, at overview level.",
        date: "2026-10-03",
        updated: null,
        tags: ["banking","finance","operations","peer-notes"],
        ogImage: "/blog/us-business-banking-document-pack-og.png",
        html: "<p>After formation and EIN talk, banking is the next wall at IFN Austin meetups. Founders often say they assumed the hard part was \"being foreign.\" What they describe afterward sounds more like incomplete company paper: mismatched names, a registered-agent address used as the operating address, missing EIN confirmation, or ownership docs that do not match passport spellings.</p>\n<p>This is peer orientation on what people tend to gather before they walk into a bank or remote onboarding flow. It is not a downloadable checklist, not a promise any bank will approve you, and not product endorsement. The fuller pack language belongs with membership and <a href=\"/resources\">Resources</a>.</p>\n<h2>Disclaimer</h2>\n<p><strong>This is not banking, legal, tax, or immigration advice.</strong> Bank and fintech policies change. Underwriting is individual. Verify requirements with the institution you apply to. IFN shares patterns from founder conversations, not guarantees.</p>\n<h2>The wrong wall, in meetup language</h2>\n<p>A common story in the room: form a US LLC or C-corp from abroad, upload a passport and Articles PDF to a remote business account, get stalled or declined, then conclude \"US banks do not want internationals.\"</p>\n<p>Peers who cleared remote onboarding usually rewrite that story: the underwriter could not reconcile an incomplete company file. Nationality still matters for some products. Incomplete paper fails more often than founders expect.</p>\n<p>Startup banks many founders try, and formation-service banking guides, publish remote-opening writeups. Useful as category orientation. Your bank's checklist still wins.</p>\n<h2>What peers tend to gather (overview, not a pack)</h2>\n<p>Every institution differs. At a high level, founders who later cleared onboarding usually had these categories ready before they applied:</p>\n<ul>\n<li><strong>Formation evidence</strong> with the exact legal name, state, and filing date. Entity choice and sequencing are a separate peer conversation; keep company paper frozen before you apply.</li>\n<li><strong>EIN confirmation</strong> that matches that legal name. IRS <a href=\"https://www.irs.gov/businesses/employer-identification-number\">EIN overview</a> and <a href=\"https://www.irs.gov/instructions/iss4\">Form SS-4 instructions</a>.</li>\n<li><strong>Ownership and signing authority</strong> clear enough that beneficial owners and control persons are not a mid-review surprise.</li>\n<li><strong>Government IDs</strong> for owners and control persons, with names that match formation docs.</li>\n<li><strong>A real business mailing or principal place of business address</strong>, separate from the registered agent used only for service of process. Many remote underwriters reject registered-agent-only or PO box-only addresses. Check yours.</li>\n<li><strong>A boring, true business description.</strong> Vague activity language creates manual review. Inventing a safer-sounding industry creates a worse problem later.</li>\n</ul>\n<p>That is orientation, not a fillable inventory. The item-by-item pack and member-channel walkthroughs live deeper in <a href=\"/resources\">Resources</a> and with <a href=\"/membership\">membership</a>.</p>\n<h2>Remote path vs traditional path</h2>\n<p><strong>Remote path:</strong> browser upload plus review. Peers report stalls when the address is the registered agent, the EIN name mismatches, beneficial ownership is incomplete, or the activity is unsupported.</p>\n<p><strong>Traditional path:</strong> denser KYC, longer timelines, sometimes an in-person step. Branch visits with Articles alone often burn the trip.</p>\n<p>Product names come and go. Re-read current eligibility pages, including any prohibited-residence list, before you build plans on a forum thread.</p>\n<h2>SSN, ITIN, and a separate visa track</h2>\n<p>In many remote stories, the company is the customer and controlling persons provide passport KYC. An SSN is not always required for the company account. An ITIN is personal; it is not a substitute for the company's EIN. Some banks still want a US person with signing authority.</p>\n<p>Visa status is a separate track. Owning a US company is not permission to work in the United States. Keep personal status questions for immigration counsel, not for the banking underwriter.</p>\n<h2>When we stop talking</h2>\n<p>Call a professional or the bank's support channel when:</p>\n<ul>\n<li>You need a product recommendation for your facts</li>\n<li>Your industry or residence may be unsupported</li>\n<li>Names or addresses already conflict across docs</li>\n<li>Someone suggests misstating activity to pass review</li>\n<li>Tax residency or payroll setup enters the chat</li>\n<li>A decline letter needs interpretation against your KYC file</li>\n</ul>\n<p>Meetup peers can share what they assembled. They cannot underwrite you.</p>\n<h2>Soft next steps</h2>\n<p>Bring your banking-prep questions (not your passport data) to the next IFN meetup. Guests are welcome; register on Luma or check <a href=\"/\">ifn.community</a>. For the private member channel, members-only call, and the fuller banking pack / teaser PDF language as it ships, <a href=\"/membership\">Become a member</a> or browse <a href=\"/resources\">Resources</a>.</p>\n<h2>Sources</h2>\n<ul>\n<li>IRS, <a href=\"https://www.irs.gov/businesses/employer-identification-number\">Employer identification number</a></li>\n<li>IRS, <a href=\"https://www.irs.gov/instructions/iss4\">Instructions for Form SS-4</a></li>\n</ul>",
    },
    {
        slug: "welcome-to-the-ifn-blog",
        title: "Welcome to the IFN blog",
        description: "Peer notes for international and immigrant founders building in Austin: what comes up at the monthly meetup, written down so you can read it before you walk into the room.",
        excerpt: "Peer notes for international and immigrant founders building in Austin: what comes up at the monthly meetup, written down so you can read it before you walk into the room.",
        date: "2026-09-26",
        updated: null,
        tags: ["austin","landing","community"],
        ogImage: null,
        html: "<p>IFN runs a free monthly meetup in Austin for international and immigrant founders. The same questions show up every month: how people register a company in the United States, how they stay inside visa limits while they build, how they open a bank account, and how local funding conversations differ from the ones they had at home.</p>\n<p>This blog is where we write those conversations down. Not legal advice. Not a course. Peer experience from founders who are doing the work in Austin, so you can arrive at the next meetup with sharper questions.</p>\n<h2>What you will find here</h2>\n<ul>\n<li>Field notes from the room: what surprised people who just landed, and what they wish they had asked earlier.</li>\n<li>Orientation on visas, entity setup, banking, housing, hiring, and fundraising as an international founder, always as peer framing. When a topic needs counsel, we say so.</li>\n<li>Soft pointers to the next meetup, the optional membership (private member channel and members-only call), and the Resources hub when a catalog title is useful.</li>\n</ul>\n<h2>What this is not</h2>\n<p>This is not the paid Resources library. Guides that belong behind membership stay there. The blog stays free to read.</p>\n<p>It is also not a newsletter signup page. When we publish, the post lives at <code>/blog</code>. Come to a meetup if you want the live version of the same conversation.</p>\n<h2>Start here</h2>\n<p>If you are new to Austin as an international founder, come to the next meetup first. Register on Luma. Bring one concrete question. The blog will keep adding the written version of what the room keeps teaching.</p>",
    }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find((post) => post.slug === slug);
}
