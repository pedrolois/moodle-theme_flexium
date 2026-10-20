// Home page builder (site home, Moodle edit mode): section wands with live preview, add / move / duplicate / delete,
// discard, and saved changes seen by a visitor. Settings are put back exactly after each test.
const { test, expect } = require('@playwright/test');
const { setEditMode, openWand, closePanel, discard, save, visitorPage, snapshotSettings, restoreSettings } =
    require('./helpers');

const BAR = '.flexium-homeeditor';
const sections = page => page.locator('.flexium-homeframe');
const sectionTypes = page => sections(page).evaluateAll(frames => frames.map(frame => frame.dataset.section));
const field = (page, key) => page.locator(`.flexium-editpanel [data-field="${key}"]`);

/** Open the settings (magic wand) of the first section of a type. */
async function openSection(page, type) {
    const frame = page.locator(`.flexium-homeframe[data-section="${type}"]`).first();
    await frame.scrollIntoViewIfNeeded();
    await frame.locator('[data-action="settings"]').click();
    await expect(page.locator('.flexium-editpanel')).toBeVisible();
    return frame;
}

test.describe('Home page builder', () => {
    test.beforeEach(async ({ page }, testInfo) => {
        snapshotSettings(`home-${testInfo.testId}`);
        page.on('dialog', dialog => dialog.accept());
        await setEditMode(page, true, '?redirect=0');
        test.skip(await page.locator('.flexium-home').count() === 0, 'Home page builder switched off');
        await expect(sections(page).first()).toBeVisible();
    });

    test.afterEach(async ({ page }, testInfo) => {
        restoreSettings(`home-${testInfo.testId}`);
        await setEditMode(page, false, '?redirect=0');
    });

    test('hero wand: title and text change at once, discard puts them back', async ({ page }) => {
        test.skip(await page.locator('.flexium-homeframe[data-section="hero"]').count() === 0, 'No hero section');
        const title = page.locator('.flexium-hero__title').first();
        const original = (await title.innerText()).trim();
        await openSection(page, 'hero');
        await field(page, 'title').locator('input').fill('E2E hero title');
        await field(page, 'text').locator('textarea').fill('E2E hero text');
        await expect(title).toHaveText('E2E hero title');
        await expect(page.locator('.flexium-hero__text').first()).toHaveText('E2E hero text');
        await field(page, 'align').locator('select').selectOption('center');
        await expect(page.locator('.flexium-hero').first()).toHaveClass(/flexium-hero--center/);
        await closePanel(page);
        await discard(page, BAR);
        await expect(title).toHaveText(original);
    });

    test('sections can be added, moved, duplicated and deleted', async ({ page }) => {
        const start = await sectionTypes(page);

        // Add a section at the top ("+" before the first section), of the first type offered.
        await page.locator('.flexium-homeinserter [data-action="add"]').first().click();
        const picker = page.locator('.flexium-editpanel .flexium-homepicker__item');
        const type = await picker.first().getAttribute('data-type');
        await picker.first().click();
        await expect(sections(page)).toHaveCount(start.length + 1);
        expect((await sectionTypes(page))[0]).toBe(type);

        // Move it down one place.
        await sections(page).first().locator('[data-action="movedown"]').click();
        expect((await sectionTypes(page))[1]).toBe(type);
        expect((await sectionTypes(page))[0]).toBe(start[0]);

        // Duplicate, then delete the copy.
        await sections(page).nth(1).locator('[data-action="duplicate"]').click();
        await expect(sections(page)).toHaveCount(start.length + 2);
        await sections(page).nth(1).locator('[data-action="delete"]').click();
        await expect(sections(page)).toHaveCount(start.length + 1);

        await discard(page, BAR);
        expect(await sectionTypes(page)).toEqual(start);
    });

    test('a saved change reaches visitors', async ({ page, browser }) => {
        test.skip(await page.locator('.flexium-homeframe[data-section="hero"]').count() === 0, 'No hero section');
        await openSection(page, 'hero');
        await field(page, 'title').locator('input').fill('E2E saved hero');
        await closePanel(page);
        await save(page, BAR);

        const visitor = await visitorPage(browser);
        await visitor.goto('?redirect=0', { timeout: 120000 });
        await expect(visitor.locator('.flexium-hero__title').first()).toHaveText('E2E saved hero');
        await expect(visitor.locator('.flexium-homeframe')).toHaveCount(0);
        await visitor.context().close();
    });
});
