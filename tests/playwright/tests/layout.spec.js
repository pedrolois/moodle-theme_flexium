// Page layout as a site administrator: the blocks drawer next to the wide site home, and the page margins wand.
const { test, expect } = require('@playwright/test');
const { getSettings, setEditMode, visitorPage, snapshotSettings, restoreSettings } = require('./helpers');

test.describe('Layout', () => {
    test.afterAll(async ({ browser }) => {
        const page = await browser.newPage();
        await setEditMode(page, false, '?redirect=0');
        await page.close();
    });

    test('the blocks drawer never covers the site home sections', async ({ page }) => {
        await setEditMode(page, true, '?redirect=0');
        test.skip(await page.locator('.flexium-home').count() === 0, 'Home page builder switched off');
        const drawer = page.locator('#theme_boost-drawers-blocks');
        if (!await drawer.evaluate(element => element.classList.contains('show'))) {
            await page.locator('.drawer-right-toggle button').first().click();
        }
        await expect(drawer).toHaveClass(/\bshow\b/);
        await expect(page.locator('body')).not.toHaveClass(/\blimitedwidth\b/);

        // Let the drawer transition end before measuring.
        await expect.poll(async () => {
            const home = await page.locator('.flexium-home').boundingBox();
            const panel = await drawer.boundingBox();
            return Math.round(panel.x - (home.x + home.width));
        }).toBeGreaterThanOrEqual(0);
    });

    test('page margins wand: the preview changes the margins at once and nothing is saved until Save', async ({ page }) => {
        const before = getSettings(['pagemargins']);
        await setEditMode(page, true, 'course/index.php');
        const inner = page.locator('#page .main-inner');
        const padding = () => inner.evaluate(element => parseFloat(getComputedStyle(element).paddingLeft));

        await page.locator('.flexium-marginswand').click();
        const panel = page.locator('.flexium-marginspanel');
        await expect(panel).toBeVisible();
        // Scope "Course catalogue" (the options depend on the page: whole site, and this kind of page).
        await panel.locator('.flexium-marginspanel__scopes input[id$="-scope-catalog"]').check();

        const start = await padding();
        const range = panel.locator('input[type="range"]').first();
        const target = Math.min(Number(await range.getAttribute('max')), Math.round(start) + 96);
        await range.fill(String(target - (target % 8)));
        await expect(page.locator('style#flexium-margins-preview')).toHaveCount(1);
        await expect.poll(padding).toBeGreaterThan(start);

        await panel.locator('.btn-close').click();
        expect(getSettings(['pagemargins'])).toEqual(before);
    });

    test('page margins wand: saved margins reach visitors', async ({ page, browser }) => {
        snapshotSettings('margins-save');
        try {
            await setEditMode(page, true, 'course/index.php');
            await page.locator('.flexium-marginswand').click();
            const panel = page.locator('.flexium-marginspanel');
            await panel.locator('.flexium-marginspanel__scopes input[id$="-scope-catalog"]').check();
            // Both sides linked: 160px each (under the 12vw cap of a 1600px window).
            await panel.locator('input[type="range"]').first().fill('160');
            await panel.locator('.btn-primary').click();
            await expect.poll(() => JSON.parse(getSettings(['pagemargins']).pagemargins || '{}').catalog?.left)
                .toBe(160);

            const visitor = await visitorPage(browser);
            await visitor.goto('course/index.php', { timeout: 120000 });
            const padding = await visitor.locator('#page .main-inner')
                .evaluate(element => parseFloat(getComputedStyle(element).paddingLeft));
            expect(padding).toBe(160);
            await visitor.context().close();
        } finally {
            restoreSettings('margins-save');
        }
    });
});
