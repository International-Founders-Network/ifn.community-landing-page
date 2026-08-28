/**
 * SEED STRIPE WITH THE OFFER COPY, so Stripe can own it from then on.
 *
 * The site reads its marketing label and benefit copy from the Stripe product
 * (see scripts/sync-pricing.mjs). This pushes the repo's current copy UP, which
 * you need exactly twice: once for test mode and once for live, so the two say
 * the same thing without retyping. After that, edit in Stripe.
 *
 *   STRIPE_SECRET_KEY=sk_... node scripts/push-offer-to-stripe.mjs [--apply]
 *
 * Preview is the default and writes nothing, matching scripts/fix-event-venue.mjs.
 *
 * WHY METADATA AND NOT ONLY marketing_features. Stripe caps a feature name at
 * 80 characters. Every bullet fits — two at 78 and 79, so not by much — but the
 * three card descriptions are 120 to 194 characters and cannot. Metadata allows
 * 500 per value, so the structured copy goes there and marketing_features keeps
 * a short human summary for Stripe's own UI. Splitting it this way is not
 * elegant; it is what the field limits allow.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import Stripe from 'stripe';

const here = dirname(fileURLToPath(import.meta.url));
const plans = JSON.parse(readFileSync(resolve(here, '../src/data/plans.json'), 'utf8'));
const { benefits } = JSON.parse(readFileSync(resolve(here, '../src/data/benefits.json'), 'utf8'));

const apply = process.argv.includes('--apply');
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
    console.error('STRIPE_SECRET_KEY is required.');
    process.exit(2);
}
const stripe = new Stripe(key);
const mode = key.startsWith('sk_live_') ? 'LIVE' : 'test';

/** Bullets are joined with a pipe: a character none of the copy contains. */
const SEPARATOR = '|';

function metadataFor(plan) {
    const meta = { site_label: plan.label };
    benefits.forEach((b, i) => {
        const n = i + 1;
        meta[`benefit_${n}_id`] = b.id;
        meta[`benefit_${n}_title`] = b.title;
        meta[`benefit_${n}_desc`] = b.description;
        meta[`benefit_${n}_bullets`] = b.included.join(SEPARATOR);
    });
    return meta;
}

function checkLimits(meta) {
    const bad = [];
    for (const [k, v] of Object.entries(meta)) {
        if (k.length > 40) bad.push(`metadata key "${k}" is ${k.length} chars (max 40)`);
        if (v.length > 500) bad.push(`metadata "${k}" is ${v.length} chars (max 500)`);
    }
    if (Object.keys(meta).length > 50) bad.push(`${Object.keys(meta).length} metadata keys (max 50)`);
    for (const b of benefits) {
        for (const line of b.included) {
            if (line.length > 80) bad.push(`feature "${line.slice(0, 40)}…" is ${line.length} chars (max 80)`);
        }
        if (b.included.some((l) => l.includes(SEPARATOR))) {
            bad.push(`a bullet in "${b.id}" contains "${SEPARATOR}", which is the separator`);
        }
    }
    return bad;
}

for (const [slug, plan] of Object.entries(plans.plans)) {
    const { data } = await stripe.prices.list({ lookup_keys: [plan.lookupKey], active: true, limit: 1 });
    const price = data[0];
    if (!price) {
        console.error(`✗ ${slug}: no active price with lookup key "${plan.lookupKey}" in ${mode} mode.`);
        process.exit(1);
    }
    const productId = typeof price.product === 'string' ? price.product : price.product.id;
    const metadata = metadataFor(plan);

    const problems = checkLimits(metadata);
    if (problems.length) {
        console.error(`✗ ${slug}: copy does not fit Stripe's limits:`);
        for (const p of problems) console.error(`    • ${p}`);
        process.exit(1);
    }

    console.log(`${apply ? 'Writing' : 'Would write'} to ${productId} (${slug}, ${mode} mode):`);
    for (const [k, v] of Object.entries(metadata)) {
        console.log(`  ${k} = ${v.length > 60 ? v.slice(0, 57) + '…' : v}`);
    }
    console.log(`  marketing_features = ${benefits.map((b) => b.title).join(', ')}`);

    if (apply) {
        await stripe.products.update(productId, {
            metadata,
            marketing_features: benefits.map((b) => ({ name: b.title })),
        });
        console.log(`  ✓ written\n`);
    } else {
        console.log(`\n  Preview only. Re-run with --apply to write.\n`);
    }
}
