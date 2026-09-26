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
        slug: "forming-a-us-company-from-abroad",
        title: "Forming a US company from abroad: what peers actually sequence",
        description: "What international founders at IFN Austin tend to sequence when forming a US company from abroad, and when they stop and call counsel.",
        excerpt: "What international founders at IFN Austin tend to sequence when forming a US company from abroad, and when they stop and call counsel.",
        date: "2026-09-29",
        updated: null,
        tags: ["entity","formation","us-market-entry","peer-notes"],
        ogImage: "/blog/forming-a-us-company-from-abroad-og.png",
        html: "<p>At almost every IFN Austin meetup, someone still abroad asks the same cluster: Can I form a United States company before I have work authorization? LLC or C-corp? Which state? When does the EIN happen? How do people avoid confusing formation with permission to work?</p>\n<p>This is peer sequencing from that room. Not a filing checklist. Not a substitute for counsel.</p>\n<h2>Disclaimer</h2>\n<p><strong>This is not legal, tax, immigration, or banking advice.</strong> IFN shares what founders in the room tend to talk through. Entity choice, tax elections, beneficial ownership reporting, and immigration consequences change with your facts. Verify with licensed professionals and official sources (IRS, your state filing office, FinCEN) before you act.</p>\n<h2>Three tracks peers try to keep separate</h2>\n<p>Forming a US company is not the same as being authorized to work in the United States.</p>\n<p>Founders who have been through it often separate three tracks early:</p>\n<ol>\n<li><strong>Company paper</strong> (entity, registered agent, EIN, ownership docs)</li>\n<li><strong>Personal status</strong> (visa, work authorization, travel)</li>\n<li><strong>Money rails</strong> (banking, payments, how customers pay)</li>\n</ol>\n<p>Mixing those tracks is where people get surprised. Formation can happen while you are still abroad. Work authorization is a different conversation. Banking prep is another. Meetup peers talk about all three; counsel owns the hard calls on each.</p>\n<h2>What people tend to sequence (high level)</h2>\n<p>No two founders run the same order. A pattern still shows up often enough that newcomers ask for it:</p>\n<ol>\n<li>\n<p><strong>Decide what job the entity has to do</strong> in the next 12 to 24 months (raise, serve US customers from abroad, support a later visa conversation without inventing eligibility, or keep a simple operating company). Peer pattern talk, not a recommendation. Law firm explainers on foreign founders and corporate structure can be useful orientation; your advisors still own the call.</p>\n</li>\n<li>\n<p><strong>Pick a formation state as an ops decision</strong>, not a brand decision. Delaware shows up because investors and counsel know it. Other states show up for cost or stack. Texas shows up when people already live or plan to live in Austin. Consistency with what you later show banks matters more than the logo on the filing. Delaware's Division of Corporations publishes <a href=\"https://corp.delaware.gov/howtoform/\">how to form a new business entity</a>; your own state's filing office is the source for non-Delaware filings.</p>\n</li>\n<li>\n<p><strong>File, freeze the legal name, then get an EIN.</strong> Banks and the IRS notice character-level name mismatches. Founders abroad often learn online EIN eligibility depends on US presence and a suitable taxpayer ID for the responsible party. Start at the IRS <a href=\"https://www.irs.gov/businesses/employer-identification-number\">EIN overview</a> and <a href=\"https://www.irs.gov/instructions/iss4\">Form SS-4 instructions</a>.</p>\n</li>\n<li>\n<p><strong>Keep ownership clear, and check current FinCEN BOI rules for your facts.</strong> Rules have changed. Start at FinCEN <a href=\"https://www.fincen.gov/boi\">BOI reporting</a> and <a href=\"https://www.fincen.gov/boi-faqs\">FAQs</a>, then ask counsel whether your facts still create a filing duty.</p>\n</li>\n<li>\n<p><strong>Only then move toward banking.</strong> Incomplete company paper is an expensive way to learn. Peers gather formation evidence, EIN confirmation, ownership clarity, and a real operating address before they apply. The item-by-item pack language lives deeper with membership and Resources, not in this orientation post.</p>\n</li>\n</ol>\n<h2>LLC vs C-corp as founders discuss it</h2>\n<p>In meetup language, LLCs get described as lighter early governance. Delaware C-corps get described as the default language for US venture conversations. Tax elections are not peer DIY. Structure and equity can interact with visa strategy, so corporate and immigration counsel often need to coordinate.</p>\n<h2>When we stop talking</h2>\n<p>Call licensed professionals when any of these show up:</p>\n<ul>\n<li>You need a recommendation on LLC versus C-corp for your personal tax residency</li>\n<li>Equity, vesting, or board control might interact with a visa strategy</li>\n<li>You are unsure whether FinCEN BOI still applies to your entity</li>\n<li>A formation service's marketing copy conflicts with IRS or state instructions</li>\n<li>You are treating company formation as proof you can work in the US</li>\n</ul>\n<p>Corporate counsel, immigration counsel, and a CPA who has worked with non-resident founders are different seats.</p>\n<h2>Soft next steps</h2>\n<p>Come to the next IFN meetup with one concrete formation question. Guests are welcome; register on Luma or check dates on <a href=\"/\">ifn.community</a>. If you want the private member channel and members-only call, <a href=\"/membership\">Become a member</a>. Fuller formation checklists and teaser PDFs live with membership and the <a href=\"/resources\">Resources</a> hub as that catalog fills in.</p>\n<h2>Sources</h2>\n<ul>\n<li>IRS, <a href=\"https://www.irs.gov/businesses/employer-identification-number\">Employer identification number</a></li>\n<li>IRS, <a href=\"https://www.irs.gov/instructions/iss4\">Instructions for Form SS-4</a></li>\n<li>Delaware Division of Corporations, <a href=\"https://corp.delaware.gov/howtoform/\">How to form a new business entity</a></li>\n<li>FinCEN, <a href=\"https://www.fincen.gov/boi\">Beneficial Ownership Information Reporting</a></li>\n<li>FinCEN, <a href=\"https://www.fincen.gov/boi-faqs\">BOI FAQs</a></li>\n</ul>",
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
