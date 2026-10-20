// Shared helpers of the Flexium browser tests. Selectors are classes, ids and data-* attributes only: never
// visible text from Moodle's UI (the site language may differ).
const { expect } = require('@playwright/test');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

/** The test data made by fixture.php for this run: {username, password, courses: {open, closed, hidden}}. */
const fixture = () => JSON.parse(fs.readFileSync(path.join(root, '.auth', 'fixture.json'), 'utf8'));

/** The word every test course has (and no real course). */
const KEYWORD = 'Zephyrine';

/**
 * Run config.php: read or restore theme settings exactly.
 *
 * @param {string[]} args
 * @returns {string}
 */
const php = args => execFileSync(process.env.PHP_BINARY || 'php', [path.join(root, 'config.php'), ...args],
    { encoding: 'utf8' }).trim();
const getSettings = names => JSON.parse(php(['get', ...names]).split('\n').pop());
const setSettings = values => php(['set', JSON.stringify(values)]);

/** Wait until the catalogue shows the results of the last request. */
async function waitForResults(page) {
    await expect(page.locator('.flexium-catalog')).toBeVisible({ timeout: 120000 });
    await expect(page.locator('.flexium-catalog__results--loading')).toHaveCount(0);
    await expect(page.locator('.flexium-card--skeleton')).toHaveCount(0);
}

/** Open the catalogue and make sure the filters drawer (with the search box) is open. */
async function openCatalogue(page) {
    await page.goto('course/index.php', { timeout: 120000 });
    await waitForResults(page);
    const search = page.locator('.flexium-search__input').first();
    // Decide by the drawer's state, not the search box (hidden while the drawer is still opening), and retry: a click
    // while Moodle is still setting the drawer up can be lost.
    await expect(async () => {
        if (await page.locator('#theme_boost-drawers-courseindex.show').count() === 0) {
            await page.locator('.drawer-left-toggle button').first().click();
        }
        await expect(search).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30000 });
    return search;
}

/** Search the catalogue as someone typing. */
async function search(page, text, { delay = 0 } = {}) {
    const box = page.locator('.flexium-search__input').first();
    await box.fill('');
    if (delay) {
        await box.pressSequentially(text, { delay });
    } else {
        await box.fill(text);
    }
    await expect(page.locator('.flexium-catalog__toolbar')).toBeVisible();
    // The search is debounced: wait for the request it makes, then for its results.
    await page.waitForTimeout(800);
    await waitForResults(page);
}

/** Titles of the course cards shown. */
const cardTitles = page => page.locator('.flexium-card .flexium-card__title').allTextContents()
    .then(titles => titles.map(title => title.trim()));

/**
 * Links of the top menu. Moodle renders the menu, then replaces it with its React version (5.3): `aria-current`
 * marks the active link in both ("true", then "page").
 */
const menuLink = (page, href) => page.locator(`.primary-navigation a[href$="${href}"]`);
const activeMenuLinks = page => page.locator('.primary-navigation a[aria-current]');

/** The catalogue error message (red alert). */
const catalogueError = page => page.locator('.flexium-catalog .alert-danger');

/**
 * Switch Moodle's edit mode on or off, then open a page.
 *
 * @param {import('@playwright/test').Page} page
 * @param {boolean} on
 * @param {string} url page to open afterwards, relative to the site
 */
async function setEditMode(page, on, url) {
    if (!page.url().startsWith('http')) {
        await page.goto('my/', { timeout: 120000 });
    }
    const sesskey = await page.evaluate(() => M.cfg.sesskey);
    const site = (process.env.MOODLE_URL || 'http://localhost/moodle').replace(/\/+$/, '') + '/';
    const params = new URLSearchParams({ setmode: on ? '1' : '0', context: '1', sesskey, pageurl: new URL(url, site).href });
    await page.goto(`editmode.php?${params}`, { timeout: 120000 });
}

/** Save every theme setting to a file of .auth (see restoreSettings). */
const snapshotSettings = name => php(['snapshot', path.join(root, '.auth', `${name}.json`)]);
/** Put every theme setting back exactly as snapshotSettings saved it. */
const restoreSettings = name => {
    const file = path.join(root, '.auth', `${name}.json`);
    php(['restore', file]);
    fs.rmSync(file, { force: true });
};

/** Magic wand of a part of the page (card parts: the first card's). */
const wand = (page, zone) => page.locator(`.flexium-editzone__wand[data-zone="${zone}"]:visible`).first();

/** A setting in the open side panel (features, card settings "card-<name>", "quicklabels", "option-<name>"). */
const control = (page, key) => page.locator(`.flexium-editpanel [data-feature="${key}"]`);

/** Open the side panel of a wand. */
async function openWand(page, zone) {
    // click() scrolls to the wand itself; the parts re-render while the page settles, so no separate scroll.
    await wand(page, zone).click();
    await expect(page.locator('.flexium-editpanel')).toBeVisible();
}

/** Close the side panel (changes stay in the draft): Escape, or its close button (footer panel). */
async function closePanel(page) {
    const panel = page.locator('.flexium-editpanel');
    await page.keyboard.press('Escape');
    if (await panel.count() > 0) {
        await panel.locator('.btn-close').first().click();
    }
    await expect(panel).toHaveCount(0);
}

/** Editor bar of the page (catalogue, home page) or of the site footer. */
const editorBar = (page, scope = '.flexium-editor') => page.locator(scope).first();

/** Discard the draft. */
async function discard(page, scope) {
    await editorBar(page, scope).locator('[data-action="discard"]').click();
    await expect(editorBar(page, scope).locator('[data-action="save"]')).toBeDisabled();
}

/** Save the draft for everybody and wait until it is saved. */
async function save(page, scope) {
    const button = editorBar(page, scope).locator('[data-action="save"]');
    await expect(button).toBeEnabled();
    // The button is disabled while saving too: wait for the answer of the save web service itself.
    const saved = page.waitForResponse(response => response.url().includes('/lib/ajax/service')
        && (response.request().postData() || '').includes('theme_flexium_save'), { timeout: 60000 });
    await button.click();
    const response = await saved;
    expect(await response.text()).not.toContain('"error":true');
    await expect(button).toBeDisabled({ timeout: 30000 });
}

/**
 * Close the filters and blocks drawers. Moodle remembers them open per user, and an open drawer hides its button
 * (and the button's magic wand).
 */
async function closeDrawers(page) {
    for (const target of ['theme_boost-drawers-courseindex', 'theme_boost-drawers-blocks']) {
        const close = page.locator(`#${target} [data-action="closedrawer"]`);
        if (await page.locator(`#${target}.show`).count() > 0 && await close.isVisible()) {
            await close.click();
            await expect(page.locator(`#${target}.show`)).toHaveCount(0);
        }
    }
}

/**
 * Screen sizes of the responsive tests (Chromium with the device's size, touch and pixel ratio).
 * Moodle's breakpoints: md 768px (navigation becomes the top bar), lg 992px, xl 1200px.
 */
const VIEWPORTS = {
    'small phone': { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    'phone': { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
    'tablet portrait': { viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    'tablet landscape': { viewport: { width: 1024, height: 768 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    'small laptop': { viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
};

/**
 * The page does not scroll sideways. On failure, lists the visible elements that stick out of the window.
 *
 * @param {import('@playwright/test').Page} page
 */
async function expectNoHorizontalScroll(page) {
    const result = await page.evaluate(() => {
        const width = window.innerWidth;
        const offenders = [];
        if (document.documentElement.scrollWidth > width + 1) {
            for (const element of document.body.querySelectorAll('*')) {
                const rect = element.getBoundingClientRect();
                const style = getComputedStyle(element);
                if (rect.width > 0 && rect.right > width + 1 && style.visibility !== 'hidden' && style.position !== 'fixed'
                        && !element.closest('.drawer:not(.show)')) {
                    offenders.push(`${element.tagName.toLowerCase()}.${[...element.classList].slice(0, 3).join('.')}`
                        + ` (right ${Math.round(rect.right)}px)`);
                }
            }
        }
        return { width, scrollwidth: document.documentElement.scrollWidth, offenders: offenders.slice(0, 8) };
    });
    expect(result.scrollwidth, `Wider than the ${result.width}px window: ${result.offenders.join(', ')}`)
        .toBeLessThanOrEqual(result.width + 1);
}

/**
 * An element fits inside the window horizontally.
 *
 * @param {import('@playwright/test').Locator} locator
 */
async function expectInsideWindow(locator) {
    const box = () => locator.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { left: Math.round(rect.left), right: Math.round(rect.right), width: window.innerWidth };
    });
    // Drawers and dialogs slide in: measure once the element stops moving.
    let previous = null;
    await expect.poll(async () => {
        const current = JSON.stringify(await box());
        const settled = current === previous;
        previous = current;
        return settled;
    }, { intervals: [150, 250, 400, 600] }).toBe(true);
    const { left, right, width } = await box();
    expect(left, 'left edge inside the window').toBeGreaterThanOrEqual(-1);
    expect(right, `right edge inside the ${width}px window`).toBeLessThanOrEqual(width + 1);
}

/** Number of columns of a list of elements laid out in a grid (distinct left positions). */
const columnCount = locator => locator.evaluateAll(elements => new Set(elements
    .filter(element => element.getBoundingClientRect().width > 0)
    .map(element => Math.round(element.getBoundingClientRect().left))).size);

/** A page of a new browser context without session: what a visitor sees. */
async function visitorPage(browser) {
    // The test runner gives new contexts the project's options, session included: start without any.
    const context = await browser.newContext({
        viewport: { width: 1600, height: 1000 }, locale: 'en-GB', storageState: { cookies: [], origins: [] },
    });
    return context.newPage();
}

module.exports = {
    fixture, KEYWORD, getSettings, setSettings, waitForResults, openCatalogue, search, cardTitles, catalogueError,
    setEditMode, menuLink, activeMenuLinks, snapshotSettings, restoreSettings, wand, control, openWand, closePanel,
    discard, save, visitorPage, closeDrawers, VIEWPORTS, expectNoHorizontalScroll, expectInsideWindow, columnCount,
};
