import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'http://localhost:8888/';

    try {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        const ctaTexts = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, a'));
            return buttons.map(b => b.textContent.trim());
        });

        const primaryCTA = "Your First Warm Intro";
        const secondaryCTA = "Browse the Playbook";

        const hasPrimary = ctaTexts.some(text => text.includes(primaryCTA));
        const hasSecondary = ctaTexts.some(text => text.includes(secondaryCTA));

        console.log('\n--- CTA VERIFICATION ---');
        console.log(`Primary CTA ("${primaryCTA}"): ${hasPrimary ? '✅ FOUND' : '❌ NOT FOUND'}`);
        console.log(`Secondary CTA ("${secondaryCTA}"): ${hasSecondary ? '✅ FOUND' : '❌ NOT FOUND'}`);

        if (hasPrimary && hasSecondary) {
            console.log('\nSUCCESS: All CTAs verified.');
            process.exit(0);
        } else {
            console.error('\nFAILURE: One or more CTAs missing.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
