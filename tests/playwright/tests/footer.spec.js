// Site footer builder (any page, Moodle edit mode): style wand, block wands with live preview, add / delete blocks
// and columns, discard, and saved changes seen by a visitor. Settings are put back exactly after each test.
const { test, expect } = require('@playwright/test');
const { setEditMode, closePanel, discard, save, visitorPage, snapshotSettings, restoreSettings } = require('./helpers');

const BAR = '.flexium-footer__editbar';
const footer = page => page.locator('.flexium-footer').first();
const blocks = page => page.locator('.flexium-footerblock');
const field = (page, key) => page.locator(`.flexium-editpanel [data-field="${key}"]`);

test.describe('Footer builder', () => {
    test.beforeEach(async ({ page }, testInfo) => {
        snapshotSettings(`footer-${testInfo.testId}`);
        page.on('dialog', dialog => dialog.accept());
        await setEditMode(page, true, 'course/index.php');
        await expect(page.locator(BAR)).toBeVisible({ timeout: 120000 });
        await page.locator(BAR).scrollIntoViewIfNeeded();
    });

    test.afterEach(async ({ page }, testInfo) => {
        restoreSettings(`footer-${testInfo.testId}`);
        await setEditMode(page, false, 'course/index.php');
    });

    test('style wand: alignment and background change at once, discard puts them back', async ({ page }) => {
        await page.locator(`${BAR} [data-action="style"]`).click();
        await expect(page.locator('.flexium-editpanel')).toBeVisible();
        const align = field(page, 'align').locator('select');
        const before = await align.inputValue();
        const other = before === 'center' ? 'left' : 'center';
        await align.selectOption(other);
        await expect(footer(page)).toHaveClass(new RegExp(`flexium-footer--${other}\\b`));
        await field(page, 'background').locator('select').selectOption('light');
        await expect(footer(page)).toHaveClass(/flexium-footer--light/);
        await closePanel(page);
        await discard(page, BAR);
        await expect(footer(page)).toHaveClass(new RegExp(`flexium-footer--${before}\\b`));
    });

    test('block wand: a text block shows its new title at once', async ({ page }) => {
        // Add a text block to the first column, then edit it.
        const count = await blocks(page).count();
        await page.locator('.flexium-footer__column [data-action="addblock"]').first().click();
        await page.locator('.flexium-editpanel .flexium-homepicker__item[data-type="text"]').click();
        await expect(blocks(page)).toHaveCount(count + 1);

        // A new block opens its settings at once.
        const block = page.locator('.flexium-footerblock.flexium-editzone--active');
        await expect(block).toHaveAttribute('data-block', 'text');
        await field(page, 'title').locator('input').fill('E2E footer title');
        await field(page, 'text').locator('textarea').fill('E2E footer text');
        await expect(block.locator('.flexium-footer__title')).toHaveText('E2E footer title');
        await expect(block.locator('.flexium-footer__text')).toHaveText('E2E footer text');
        await closePanel(page);

        await blocks(page).filter({ hasText: 'E2E footer title' }).locator('[data-action="delete"]').click();
        await expect(blocks(page)).toHaveCount(count);
        if (await page.locator(`${BAR} [data-action="discard"]`).isEnabled()) {
            await discard(page, BAR);
        }
    });

    test('columns can be added and removed', async ({ page }) => {
        const columns = page.locator('.flexium-footer__column');
        const count = await columns.count();
        const add = page.locator(`${BAR} [data-action="addcolumn"]`);
        test.skip(await add.isDisabled(), 'Already the maximum of columns');
        await add.click();
        await expect(columns).toHaveCount(count + 1);
        await discard(page, BAR);
        await expect(columns).toHaveCount(count);
    });

    test('a saved footer reaches visitors', async ({ page, browser }) => {
        await page.locator('.flexium-footer__column [data-action="addblock"]').first().click();
        await page.locator('.flexium-editpanel .flexium-homepicker__item[data-type="text"]').click();
        await expect(page.locator('.flexium-footerblock.flexium-editzone--active')).toHaveAttribute('data-block', 'text');
        await field(page, 'title').locator('input').fill('E2E saved footer');
        await field(page, 'text').locator('textarea').fill('Saved by the browser tests.');
        await closePanel(page);
        await save(page, BAR);

        const visitor = await visitorPage(browser);
        await visitor.goto('course/index.php', { timeout: 120000 });
        await expect(visitor.locator('.flexium-footer')).toContainText('E2E saved footer');
        await expect(visitor.locator('.flexium-footer__editbar')).toHaveCount(0);
        await visitor.context().close();
    });
});
