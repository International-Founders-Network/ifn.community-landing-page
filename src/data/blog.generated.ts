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
        slug: "visa-paths-founders-talk-about-at-ifn",
        title: "Visa paths founders talk about at IFN (and when we stop talking)",
        description: "A peer map of visa paths founders discuss at IFN meetups, and the moments the room hands the conversation to immigration counsel.",
        excerpt: "A peer map of visa paths founders discuss at IFN meetups, and the moments the room hands the conversation to immigration counsel.",
        date: "2026-10-01",
        updated: null,
        tags: ["visas","immigration","peer-notes","orientation"],
        ogImage: "/blog/visa-paths-founders-talk-about-at-ifn-og.png",
        html: "<p>Visa questions arrive early at IFN Austin meetups. Someone is still on a student timeline. Someone else is abroad and wondering whether to form a company first. Someone on an employer-sponsored status asks what they can do for a side project without putting their status at risk.</p>\n<p>This is a peer orientation map of the paths that come up in the room. IFN does not file petitions. IFN does not tell you which visa you qualify for.</p>\n<h2>Disclaimer</h2>\n<p><strong>This is not immigration, legal, tax, or banking advice.</strong> USCIS, the Department of State, and licensed immigration counsel are the authorities for eligibility, petitions, and status decisions. Rules change. Your facts matter. Use this only as meetup-shaped orientation, then verify with professionals and official pages before you act.</p>\n<h2>How the room talks about visas</h2>\n<p>Founders at IFN tend to talk in paths and constraints:</p>\n<ul>\n<li>What status am I on now?</li>\n<li>What am I allowed to do for a company I own?</li>\n<li>What would a change of status or a consular application require?</li>\n<li>Who petitions: me, my company, an employer, or a family member?</li>\n<li>When do I stop brainstorming and hire counsel?</li>\n</ul>\n<p>Peer stories help you ask better questions. They do not replace a case assessment. Law firm explainers on foreign founders, visas, and corporate structure can be useful public orientation. Read them that way. Your attorney still owns your case.</p>\n<p>The room also compares notes on timing: when to talk to counsel relative to incorporation, fundraising, or a planned trip. That timing talk stays peer pattern. It is never a filing calendar.</p>\n<h2>Paths that come up often (names + official links only)</h2>\n<p>The names below are classifications founders discuss at meetups. Official pages are linked so you can read primary language yourself. IFN does not score eligibility or assemble evidence packages.</p>\n<ul>\n<li><strong>O-1.</strong> Comes up when founders have a dense record of recognition in a defined field. The moment anyone asks \"do I have enough evidence?\" the room stops. <a href=\"https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement\">USCIS O-1</a>.</li>\n<li><strong>E-2.</strong> Comes up for nationals of qualifying treaty countries, usually alongside investment and ownership questions that are fact-specific. Check the treaty list first. <a href=\"https://www.uscis.gov/working-in-the-united-states/temporary-workers/e-2-treaty-investors\">USCIS E-2</a>, <a href=\"https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/treaty.html\">Treaty Countries</a>.</li>\n<li><strong>H-1B.</strong> Comes up around lottery calendars, employer-specific limits, and founder-owned company questions. IFN does not draw that line. <a href=\"https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations\">USCIS H-1B</a>.</li>\n<li><strong>L-1.</strong> Comes up when there is already a real foreign operating company, not only an idea. <a href=\"https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1a-intracompany-transferee-executive-or-manager\">USCIS L-1A</a>, <a href=\"https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1b-intracompany-transferee-specialized-knowledge\">L-1B</a>.</li>\n<li><strong>Student and visitor timelines (F-1, OPT, B-1/B-2).</strong> Ownership and active work are different questions. As soon as the question becomes \"am I allowed to do X on my current status?\" the meetup conversation ends.</li>\n<li><strong>Green card / EB conversations.</strong> Peer orientation only. Counsel early. No eligibility theater.</li>\n</ul>\n<h2>Formation and visas are linked, but not the same project</h2>\n<p>A recurring IFN lesson: people form a US company and then assume the visa problem is solved. It is not.</p>\n<p>Company paper and personal status move on different clocks. Peers who stay calm tend to keep a written list of what their current status allows, form the entity only when it serves a clear ops or fundraising job, gather banking materials after the entity exists, and book immigration counsel before they restructure equity \"for a visa story.\"</p>\n<h2>When we stop talking</h2>\n<p>Call immigration counsel when:</p>\n<ul>\n<li>You want a recommendation among O-1, E-2, H-1B, L-1, or any other path</li>\n<li>You need evidence strategy, petition drafting, or consular prep</li>\n<li>Your nationality, dual citizenship, or prior refusals change the map</li>\n<li>You are on student or visitor status and want a green light for active work</li>\n<li>Equity, board control, or vesting might be rearranged for status reasons</li>\n<li>Someone offers you a \"guaranteed\" petition path in a group chat</li>\n</ul>\n<p>IFN is a peer room. Counsel is a licensed professional with your facts and your file.</p>\n<h2>Soft next steps</h2>\n<p>Bring one status question to the next IFN meetup. Guests stay free via the meetup; register on Luma or see dates on <a href=\"/\">ifn.community</a>. If you want the private member channel and members-only call, <a href=\"/membership\">Become a member</a>. Deeper visa pathway maps and teaser PDFs live with membership and <a href=\"/resources\">Resources</a> as that hub fills in.</p>\n<h2>Sources</h2>\n<ul>\n<li>USCIS, <a href=\"https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement\">O-1</a></li>\n<li>USCIS, <a href=\"https://www.uscis.gov/working-in-the-united-states/temporary-workers/e-2-treaty-investors\">E-2</a></li>\n<li>USCIS, <a href=\"https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations\">H-1B</a></li>\n<li>USCIS, <a href=\"https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1a-intracompany-transferee-executive-or-manager\">L-1A</a></li>\n<li>USCIS, <a href=\"https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1b-intracompany-transferee-specialized-knowledge\">L-1B</a></li>\n<li>US Department of State, <a href=\"https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/treaty.html\">Treaty Countries</a></li>\n</ul>",
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
