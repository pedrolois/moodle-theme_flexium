// What a visitor (not logged in) sees: the catalogue, its search, the top menu and the site home.
const { test, expect } = require('@playwright/test');
const { KEYWORD, openCatalogue, search, cardTitles, catalogueError, menuLink, activeMenuLinks } = require('./helpers');

test.describe('Visitor', () => {
    test('the catalogue lists the published test courses, never the hidden one', async ({ page }) => {
        await openCatalogue(page);
        await search(page, KEYWORD);
        const titles = await cardTitles(page);
        expect(titles).toEqual(expect.arrayContaining(['Zephyrine Analytics Fundamentals', 'Zephyrine Leadership Lab']));
        expect(titles).not.toContain('Zephyrine Hidden Draft');
        expect(titles.every(title => title.includes(KEYWORD))).toBe(true);
    });

    test('typing a search letter by letter never shows the error message', async ({ page }) => {
        await openCatalogue(page);
        for (const text of [KEYWORD.toLowerCase(), 'zephyrine analytics', 'zzqqxx', 'c++ & "quotes"', 'é']) {
            await search(page, text, { delay: 40 });
            await expect(catalogueError(page)).toHaveCount(0);
        }
        await search(page, 'zzqqxx');
        await expect(page.locator('.flexium-card')).toHaveCount(0);
        await expect(page.locator('.flexium-catalog__empty')).toBeVisible();
    });

    test('the top menu links to the catalogue and only that link is active there', async ({ page }) => {
        await openCatalogue(page);
        const catalogue = menuLink(page, '/course/index.php');
        await expect(catalogue).toHaveCount(1);
        await expect(catalogue).toHaveAttribute('aria-current', /^(true|page)$/);
        await expect(activeMenuLinks(page)).toHaveCount(1);
    });

    test('the site home built with the home page builder is not narrowed by Moodle', async ({ page }) => {
        await page.goto('?redirect=0', { timeout: 120000 });
        test.skip(await page.locator('.flexium-home').count() === 0, 'Home page builder switched off');
        await expect(page.locator('body')).not.toHaveClass(/\blimitedwidth\b/);
        await expect(activeMenuLinks(page)).toHaveCount(1);
        await expect(menuLink(page, '/course/index.php')).not.toHaveAttribute('aria-current');
    });

    test('the site footer is filled in by default', async ({ page }) => {
        await page.goto('course/index.php', { timeout: 120000 });
        const footer = page.locator('.flexium-footer');
        await expect(footer).toBeVisible();
        expect((await footer.innerText()).trim().length).toBeGreaterThan(20);
    });
});
