// The catalogue as a site administrator: hidden courses, sorting, views, quick view and the top menu.
const { test, expect } = require('@playwright/test');
const {
    KEYWORD, fixture, openCatalogue, search, cardTitles, catalogueError, waitForResults, menuLink, activeMenuLinks,
} = require('./helpers');

const card = (page, title) => page.locator('.flexium-card').filter({
    has: page.locator('.flexium-card__title', { hasText: title }),
});

test.describe('Catalogue (administrator)', () => {
    test.beforeEach(async ({ page }) => {
        await openCatalogue(page);
        await search(page, KEYWORD);
    });

    test('administrators also see hidden courses, marked as hidden', async ({ page }) => {
        const titles = await cardTitles(page);
        expect(titles).toEqual(expect.arrayContaining([
            'Zephyrine Analytics Fundamentals', 'Zephyrine Leadership Lab', 'Zephyrine Hidden Draft',
        ]));
        await expect(card(page, 'Zephyrine Hidden Draft')).toHaveClass(/flexium-card--hidden/);
        await expect(card(page, 'Zephyrine Leadership Lab')).not.toHaveClass(/flexium-card--hidden/);
    });

    test('sorting by name and by latest changes the order', async ({ page }) => {
        const sort = page.locator('.flexium-catalog__sort select');
        await sort.selectOption('name');
        await waitForResults(page);
        await expect.poll(async () => {
            const titles = await cardTitles(page);
            return titles.join('|') === [...titles].sort((a, b) => a.localeCompare(b)).join('|');
        }).toBe(true);

        // The hidden draft is the newest test course (created last by fixture.php).
        await sort.selectOption('latest');
        await expect.poll(async () => (await cardTitles(page))[0]).toBe('Zephyrine Hidden Draft');
        await expect(catalogueError(page)).toHaveCount(0);
    });

    test('the grid and list views can be switched', async ({ page }) => {
        const views = page.locator('.flexium-catalog__views button');
        test.skip(await views.count() < 2, 'View switch switched off');
        const pressed = await views.evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-pressed')));
        const other = views.nth(pressed.indexOf('false'));
        await other.click();
        await expect(other).toHaveAttribute('aria-pressed', 'true');
        await expect(views.nth(pressed.indexOf('true'))).toHaveAttribute('aria-pressed', 'false');
        // The chosen view is remembered for the user: put the previous one back for the next tests.
        await views.nth(pressed.indexOf('true')).click();
        await expect(views.nth(pressed.indexOf('true'))).toHaveAttribute('aria-pressed', 'true');
        await waitForResults(page);
        await expect(page.locator('.flexium-card').first()).toBeVisible();
    });

    test('the quick view eye shows only where the course page is useful, and opens the course info', async ({ page }) => {
        // Automatic rule: self enrolment open -> offered; no open enrolment method -> not offered.
        const open = card(page, 'Zephyrine Analytics Fundamentals');
        await expect(open.locator('[data-action="quickview"]')).toHaveCount(1);
        await expect(card(page, 'Zephyrine Leadership Lab').locator('[data-action="quickview"]')).toHaveCount(0);

        await open.locator('[data-action="quickview"]').click();
        const dialog = page.locator('dialog.flexium-quickview[open]');
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('.flexium-quickview__title')).toHaveText('Zephyrine Analytics Fundamentals');
        await expect(dialog.locator('.flexium-quickview__body')).toContainText('Zephyrine data skills');
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
    });

    test('the course card links to the course page', async ({ page }) => {
        const { courses } = fixture();
        const link = card(page, 'Zephyrine Leadership Lab').locator('.flexium-card__link');
        await expect(link).toHaveAttribute('href', new RegExp(`/course/view\\.php\\?id=${courses.closed}\\b`));
    });

    test('only the catalogue link of the top menu is active', async ({ page }) => {
        await expect(menuLink(page, '/course/index.php')).toHaveAttribute('aria-current', /^(true|page)$/);
        await expect(activeMenuLinks(page)).toHaveCount(1);
    });
});
