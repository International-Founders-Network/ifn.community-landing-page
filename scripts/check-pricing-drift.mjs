/**
 * CHECK THAT SANDBOX AND PRODUCTION OFFER THE SAME THING.
 *
 * Test and live are separate Stripe environments with separate price objects.
 * Nothing in Stripe keeps them equal, and nothing in a deploy would tell you
 * they had diverged: the site builds from whichever mode's key it was given, so
 * a live price of $199 against a test price of $149 produces two perfectly
 * healthy-looking builds that disagree about what membership costs.
 *
 * This compares the two for every lookup key on the published allowlist.
 *
 * Run it with BOTH keys present:
 *   STRIPE_TEST_KEY=sk_test_... STRIPE_LIVE_KEY=sk_live_... node scripts/check-pricing-drift.mjs
 *
 * It is deliberately NOT part of `npm run build`, because a normal build has
 * only one key and should not need the other. Run it before going live, and
 * whenever a price changes.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import Stripe from 'stripe';

const here = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(resolve(here, '../src/data/plans.json'), 'utf8'));

const testKey = process.env.STRIPE_TEST_KEY;
const liveKey = process.env.STRIPE_LIVE_KEY;

if (!testKey || !liveKey) {
    console.error('Both STRIPE_TEST_KEY and STRIPE_LIVE_KEY are required.');
    console.error('This check exists to compare the two modes; one key cannot do it.');
    process.exit(2);
}

async function describe(key, lookupKey) {
    const stripe = new Stripe(key);
    const { data } = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
    const price = data[0];
    if (!price) return null;
    return {
        id: price.id,
        amountMinor: price.unit_amount,
        currency: price.currency,
        type: price.type,
        interval: price.recurring?.interval ?? null,
        intervalCount: price.recurring?.interval_count ?? null,
    };
}

const problems = [];

for (const [slug, plan] of Object.entries(config.plans)) {
    const [test, live] = await Promise.all([
        describe(testKey, plan.lookupKey),
        describe(liveKey, plan.lookupKey),
    ]);

    if (!test) problems.push(`"${slug}": no active price with lookup key "${plan.lookupKey}" in TEST mode.`);
    if (!live) problems.push(`"${slug}": no active price with lookup key "${plan.lookupKey}" in LIVE mode.`);
    if (!test || !live) continue;

    // Price ids ALWAYS differ between modes — that is expected and is the whole
    // reason this repo addresses prices by lookup key. Only the terms must match.
    for (const field of ['amountMinor', 'currency', 'type', 'interval', 'intervalCount']) {
        if (test[field] !== live[field]) {
            problems.push(
                `"${slug}" differs on ${field}: test=${test[field]} live=${live[field]}\n` +
                    `    (test ${test.id} vs live ${live.id})`,
            );
        }
    }

    if (test.amountMinor === live.amountMinor && test.currency === live.currency) {
        const major = (live.amountMinor / 100).toFixed(2);
        console.log(`  ✓ ${slug}: ${major} ${live.currency.toUpperCase()} / ${live.interval} — test and live agree`);
    }
}

if (problems.length) {
    console.error('\n✗ Sandbox and production do not offer the same thing:\n');
    for (const p of problems) console.error(`  • ${p}`);
    console.error('\n  Fix the price in whichever mode is wrong before selling.\n');
    process.exit(1);
}
console.log('\nSandbox and production agree on every published price.\n');
