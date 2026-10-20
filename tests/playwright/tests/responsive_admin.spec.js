// Responsive design for site administrators: the quick view, edit mode, the magic wand panels and the page margins
// panel fit on phones and tablets.
const { test, expect } = require('@playwright/test');
const {
    KEYWORD, VIEWPORTS, openCatalogue, search, waitForResults, setEditMode, openWand, closePanel, closeDrawers,
    expectNoHorizontalScroll, expectInsideWindow,
} = require('./helpers');

for (const device of ['phone', 'tablet portrait', 'tablet landscape']) {
    const options = VIEWPORTS[device];
    test.describe(`Responsive editing: ${device}`, () => {
        test.use(options);
        const width = options.viewport.width;

        test.afterAll(async ({ browser }) => {
            const page = await browser.newPage();
            await setEditMode(page, false, 'course/index.php');
            await page.close();
        });

        test('quick view fits the window', async ({ page }) => {
            await openCatalogue(page);
            await search(page, KEYWORD);
            if (width < 992) {
                await page.locator('#theme_boost-drawers-courseindex [data-action="closedrawer"]').click();
            }
            const eye = page.locator('.flexium-card [data-action="quickview"]').first();
            await eye.scrollIntoViewIfNeeded();
            await eye.click();
            const dialog = page.locator('dialog.flexium-quickview[open]');
            await expect(dialog).toBeVisible();
            await expectInsideWindow(dialog);
            await page.keyboard.press('Escape');
        });

        test('edit mode: no sideways scroll and the wand panel fits', async ({ page }) => {
            await setEditMode(page, true, 'course/index.php');
            await waitForResults(page);
            await closeDrawers(page);
            await expectNoHorizontalScroll(page);
            await openWand(page, 'heading');
            const panel = page.locator('.flexium-editpanel');
            await expectInsideWindow(panel);
            await expect(panel.locator('[data-feature="pageheadingtext"] input')).toBeVisible();
            await closePanel(page);
        });

        test('page margins panel fits', async ({ page }) => {
            await setEditMode(page, true, 'course/index.php');
            await waitForResults(page);
            const button = page.locator('.flexium-marginswand');
            test.skip(!await button.isVisible(), 'The margins button is not offered on this screen size');
            await button.click();
            const panel = page.locator('.flexium-marginspanel');
            await expect(panel).toBeVisible();
            await expectInsideWindow(panel);
            await panel.locator('.btn-close').click();
        });
    });
}
