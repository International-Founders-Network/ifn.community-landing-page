/**
 * SYNC PRICING FROM STRIPE, AT BUILD TIME.
 *
 * WHY BUILD TIME AND NOT THE BROWSER. The published price is printed in five
 * places, and one of them is the JSON-LD `Offer` in `src/data/structuredData.ts`.
 * That block exists to be read by crawlers and answer engines, and
 * `scripts/prerender.mjs` exists because GPTBot, ClaudeBot, PerplexityBot and
 * CCBot do not run JavaScript. A price fetched in the browser would therefore be
 * absent from exactly the surfaces this repo went to the most trouble to fill.
 * So the number is resolved here and baked into the HTML.
 *
 * WHAT IT WRITES. `src/data/pricing.generated.ts`, re-exported by
 * `membershipData.ts`, so every existing consumer keeps working untouched.
 *
 * THE GENERATED FILE IS COMMITTED, ON PURPOSE. A contributor without Stripe
 * credentials must still be able to build, and a Stripe outage must not block a
 * deploy. Missing credentials or an unreachable API fall back to the committed
 * snapshot with a loud warning. What does NOT fall back is a *reachable* Stripe
 * that disagrees: a missing lookup key or a non-recurring price fails the build,
 * because those are the misconfigurations that otherwise surface at a customer's
 * checkout. One of them — a price with no lookup key — really did ship to test
 * mode and was found by hand.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const PLANS_PATH = resolve(here, '../src/data/plans.json');
const OUT_PATH = resolve(here, '../src/data/pricing.generated.ts');

const config = JSON.parse(readFileSync(PLANS_PATH, 'utf8'));
const plans = Object.entries(config.plans);

/** "$149", or "$149.50" when the amount is not whole. Never "$149.00". */
function formatAmount(minorUnits, currency) {
    const major = minorUnits / 100;
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: Number.isInteger(major) ? 0 : 2,
    }).format(major);
    return formatted;
}

function render(entries, source) {
    const body = entries
        .map(
            ([slug, p]) => `    '${slug}': {
        lookupKey: '${p.lookupKey}',
        label: ${JSON.stringify(p.label)},
        /** Display string, e.g. "$149". Formatted from Stripe's minor units. */
        display: ${JSON.stringify(p.display)},
        /** Minor units exactly as Stripe holds them, for anything that must compute. */
        amountMinor: ${p.amountMinor},
        currency: '${p.currency}',
        interval: '${p.interval}',
        intervalCount: ${p.intervalCount},
    },`,
        )
        .join('\n');

    return `/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Written by \`scripts/sync-pricing.mjs\`, which runs before every build.
 * Stripe is the source of truth for what membership costs; edit the price
 * there, not here. Editing this file is overwritten on the next build.
 *
 * Source of this snapshot: ${source}
 *
 * It is committed so that a build without Stripe credentials, or during a
 * Stripe outage, still produces a site with a real price rather than a blank.
 */

export interface GeneratedPlan {
    lookupKey: string;
    label: string;
    display: string;
    amountMinor: number;
    currency: string;
    interval: string;
    intervalCount: number;
}

export const GENERATED_PLANS: Record<string, GeneratedPlan> = {
${body}
};

export const GENERATED_DEFAULT_PLAN = '${config.defaultPlan}';
`;
}

function keepSnapshot(reason) {
    console.warn(`\n  ⚠ sync-pricing: ${reason}`);
    console.warn('    Falling back to the committed src/data/pricing.generated.ts.');
    console.warn('    The site will build with the price from the last successful sync.\n');
    try {
        readFileSync(OUT_PATH, 'utf8');
    } catch {
        console.error('    No committed snapshot exists either. Cannot determine the price.');
        process.exit(1);
    }
}

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
    keepSnapshot('STRIPE_SECRET_KEY is not set.');
    process.exit(0);
}

const { default: Stripe } = await import('stripe');
const stripe = new Stripe(secretKey);
const mode = secretKey.startsWith('sk_live_') ? 'live' : 'test';

const resolved = [];
const failures = [];

for (const [slug, plan] of plans) {
    let price;
    try {
        const list = await stripe.prices.list({
            lookup_keys: [plan.lookupKey],
            active: true,
            limit: 1,
        });
        price = list.data[0];
    } catch (error) {
        keepSnapshot(`Stripe was unreachable (${error.message}).`);
        process.exit(0);
    }

    // A reachable Stripe that disagrees is a real misconfiguration, not an
    // outage. Do not paper over it with the snapshot.
    if (!price) {
        failures.push(
            `  • "${slug}": no ACTIVE price in ${mode} mode carries lookup key "${plan.lookupKey}".\n` +
                `    Set that lookup key on the price in Stripe (${mode} mode). It must be the\n` +
                `    same string in test and live, which is why no price id lives in this repo.`,
        );
        continue;
    }
    if (price.type !== 'recurring' || !price.recurring) {
        failures.push(
            `  • "${slug}": price ${price.id} ("${plan.lookupKey}") is ${price.type}, not recurring.\n` +
                `    Checkout runs in subscription mode, so this price cannot be bought.`,
        );
        continue;
    }

    resolved.push([
        slug,
        {
            lookupKey: plan.lookupKey,
            label: plan.label,
            display: formatAmount(price.unit_amount, price.currency),
            amountMinor: price.unit_amount,
            currency: price.currency,
            interval: price.recurring.interval,
            intervalCount: price.recurring.interval_count,
        },
    ]);
}

if (failures.length) {
    console.error('\n✗ sync-pricing: Stripe does not match the published-price allowlist.\n');
    console.error(failures.join('\n\n'));
    console.error('\n  Nothing was written. Fix Stripe, or edit src/data/plans.json.\n');
    process.exit(1);
}

writeFileSync(OUT_PATH, render(resolved, `Stripe ${mode} mode`));
for (const [slug, p] of resolved) {
    console.log(
        `  ✓ ${slug}: ${p.display} / ${p.intervalCount > 1 ? p.intervalCount + ' ' : ''}${p.interval} (${mode} mode, ${p.lookupKey})`,
    );
}
