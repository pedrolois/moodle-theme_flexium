// Responsive design, as a visitor, on phones, tablets and a small laptop: nothing sticks out of the window, the
// catalogue adapts its columns, filters and search work, the menu reaches the catalogue, the home page and the
// footer fit.
const { test, expect } = require('@playwright/test');
const {
    KEYWORD, VIEWPORTS, openCatalogue, search, cardTitles, waitForResults, expectNoHorizontalScroll,
    expectInsideWindow, columnCount,
} = require('./helpers');

for (const [device, options] of Object.entries(VIEWPORTS)) {
    test.describe(`Responsive: ${device} (${options.viewport.width}x${options.viewport.height})`, () => {
        test.use(options);
        const width = options.viewport.width;

        test('catalogue: no sideways scroll, cards fit and use the right number of columns', async ({ page }) => {
            await page.goto('course/index.php', { timeout: 120000 });
            await waitForResults(page);
            const cards = page.locator('.flexium-card');
            await expect(cards.first()).toBeVisible();
            await expectNoHorizontalScroll(page);
            await expectInsideWindow(cards.first());

            const columns = await columnCount(cards);
            if (width < 576) {
                expect(columns, 'one column on phones').toBe(1);
            } else if (width < 992) {
                expect(columns, 'one or two columns on tablets in portrait').toBeLessThanOrEqual(2);
            } else {
                expect(columns, 'at least two columns from tablets in landscape').toBeGreaterThanOrEqual(2);
            }
        });

        test('catalogue: the filters open and the search finds the test courses', async ({ page }) => {
            await openCatalogue(page);
            const drawer = page.locator('#theme_boost-drawers-courseindex');
            await expectInsideWindow(drawer);
            await search(page, KEYWORD);
            if (width < 992) {
                // Small screens: the drawer covers the results; close it to see them.
                await page.locator('#theme_boost-drawers-courseindex [data-action="closedrawer"]').click();
            }
            const titles = await cardTitles(page);
            expect(titles).toEqual(expect.arrayContaining(['Zephyrine Analytics Fundamentals', 'Zephyrine Leadership Lab']));
            await expectNoHorizontalScroll(page);
        });

        test('top menu: the catalogue link can be reached', async ({ page }) => {
            await page.goto('course/index.php', { timeout: 120000 });
            if (width < 768) {
                // Phones: Moodle moves the menu into the primary drawer, opened by the "hamburger" button.
                // A tap before Moodle has set the drawer up is lost: tap again until it opens.
                const link = page.locator('#theme_boost-drawers-primary a[href$="/course/index.php"]');
                await expect(async () => {
                    if (await page.locator('#theme_boost-drawers-primary.show').count() === 0) {
                        await page.locator('.navbar [data-target="theme_boost-drawers-primary"]').first().click();
                    }
                    await expect(link).toBeVisible({ timeout: 3000 });
                }).toPass({ timeout: 30000 });
                await expectInsideWindow(page.locator('#theme_boost-drawers-primary'));
            } else {
                await expect(page.locator('.primary-navigation a[href$="/course/index.php"]').first()).toBeVisible();
            }
        });

        test('site home: no sideways scroll, the hero fits', async ({ page }) => {
            await page.goto('?redirect=0', { timeout: 120000 });
            test.skip(await page.locator('.flexium-home').count() === 0, 'Home page builder switched off');
            await expect(page.locator('.flexium-home').first()).toBeVisible();
            await expectNoHorizontalScroll(page);
            const hero = page.locator('.flexium-hero').first();
            if (await hero.count()) {
                await expectInsideWindow(hero);
                await expectInsideWindow(page.locator('.flexium-hero__title').first());
            }
        });

        test('footer: fits, and its columns stack on phones', async ({ page }) => {
            await page.goto('course/index.php', { timeout: 120000 });
            const footer = page.locator('.flexium-footer').first();
            await footer.scrollIntoViewIfNeeded();
            await expect(footer).toBeVisible();
            await expectInsideWindow(footer);
            await expectNoHorizontalScroll(page);
            const columns = footer.locator('.flexium-footer__column');
            if (width < 576 && await columns.count() > 1) {
                expect(await columnCount(columns), 'one footer column per row on phones').toBe(1);
            }
        });
    });
}
