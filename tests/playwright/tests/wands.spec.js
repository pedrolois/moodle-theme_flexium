// Every magic wand of the catalogue (Moodle edit mode): each change shows at once (live preview), discarding puts the
// page back, and saved changes reach everybody (checked as a visitor). Settings saved here are put back exactly after
// each test (config.php snapshot / restore).
const { test, expect } = require('@playwright/test');
const {
    setEditMode, waitForResults, wand, control, openWand, closePanel, discard, save, visitorPage, snapshotSettings,
    restoreSettings, closeDrawers, getSettings,
} = require('./helpers');

/** Open the filters drawer if it is closed (quick filters, filter widgets). */
async function openDrawer(page) {
    if (!await page.locator('#theme_boost-drawers-courseindex').evaluate(element => element.classList.contains('show'))) {
        await page.locator('.drawer-left-toggle button').first().click();
    }
    await expect(page.locator('#theme_boost-drawers-courseindex')).toHaveClass(/\bshow\b/);
}

test.describe('Magic wands: live preview and discard', () => {
    test.afterAll(async ({ browser }) => {
        const page = await browser.newPage();
        await setEditMode(page, false, 'course/index.php');
        await page.close();
    });

    test.beforeEach(async ({ page }) => {
        page.on('dialog', dialog => dialog.accept());
        await setEditMode(page, true, 'course/index.php');
        await waitForResults(page);
        await closeDrawers(page);
    });

    test('every part of the catalogue has its wand', async ({ page }) => {
        for (const zone of ['heading', 'breadcrumbs', 'filtertoggle', 'blocktoggle', 'banner', 'toolbar', 'views', 'image',
            'text', 'badges', 'footer']) {
            await expect(wand(page, zone), zone).toHaveCount(1);
        }
        await openDrawer(page);
        await expect(wand(page, 'quickfilters')).toBeVisible();
        await expect(wand(page, 'filters')).toBeVisible();
    });

    test('page heading: hide it and change its text', async ({ page }) => {
        const header = page.locator('#page-header .page-context-header');
        const heading = header.locator('h1');
        const original = (await heading.innerText()).trim();
        await openWand(page, 'heading');
        await control(page, 'pageheadingtext').locator('input').fill('E2E heading text');
        await expect(heading).toHaveText('E2E heading text');
        await control(page, 'pageheading').locator('input[type="checkbox"]').uncheck();
        await expect(header).toHaveClass(/flexium-heading--off/);
        await closePanel(page);
        await discard(page);
        await expect(heading).toHaveText(original);
        await expect(header).not.toHaveClass(/flexium-heading--off/);
    });

    test('filters button: icon, colour, size and position', async ({ page }) => {
        const holder = page.locator('.drawer-left-toggle');
        const button = holder.locator('.flexium-filtertoggle');
        await openWand(page, 'filtertoggle');
        await control(page, 'filtericon').locator('select').selectOption('compass');
        await control(page, 'filtericoncolour').locator('select').selectOption('danger');
        await control(page, 'filtericonsize').locator('select').selectOption('lg');
        // A position other than the saved one, so discarding has something to put back.
        const position = control(page, 'filtericonposition').locator('select');
        const savedposition = await position.inputValue();
        const newposition = savedposition === 'middle' ? 'lower' : 'middle';
        await position.selectOption(newposition);
        await expect(button.locator('i')).toHaveClass(/fa-compass/);
        expect(await button.getAttribute('style')).toContain('--bs-danger');
        await expect(button).toHaveClass(/flexium-filtertoggle--lg/);
        const posclass = name => new RegExp(`flexium-togglepos--${name}(\\s|$)`);
        await expect(holder).toHaveClass(posclass(newposition));
        await closePanel(page);
        await discard(page);
        await expect(button.locator('i')).not.toHaveClass(/fa-compass/);
        await expect(holder).toHaveClass(posclass(savedposition));
        await expect(holder).not.toHaveClass(posclass(newposition));
    });

    test('blocks button: icon, colour, size and position', async ({ page }) => {
        const holder = page.locator('.drawer-right-toggle');
        const button = holder.locator('.flexium-blocktoggle');
        await openWand(page, 'blocktoggle');
        await control(page, 'blockicon').locator('select').selectOption('cubes');
        await control(page, 'blockiconcolour').locator('select').selectOption('success');
        await control(page, 'blockiconsize').locator('select').selectOption('lg');
        await control(page, 'blockiconposition').locator('select').selectOption('lower');
        await expect(button).toHaveClass(/flexium-blocktoggle--custom/);
        await expect(button).not.toHaveClass(/flexium-blocktoggle--plain/);
        await expect(button).toHaveClass(/flexium-filtertoggle--lg/);
        await expect(button.locator('.flexium-blocktoggle__icon')).toHaveClass(/fa-cubes/);
        await expect(holder).toHaveClass(/flexium-togglepos--lower/);
        await closePanel(page);
        await discard(page);
        await expect(button).not.toHaveClass(/flexium-blocktoggle--custom/);
        await expect(holder).not.toHaveClass(/flexium-togglepos--lower/);
    });

    test('banner: switch it on with its own title and text', async ({ page }) => {
        await openWand(page, 'banner');
        await control(page, 'banner').locator('input[type="checkbox"]').check();
        await control(page, 'bannertitle').locator('input').fill('E2E banner title');
        await control(page, 'bannertext').locator('input').fill('E2E banner text');
        await expect(page.locator('.flexium-banner__title')).toHaveText('E2E banner title');
        await expect(page.locator('.flexium-banner__text')).toHaveText('E2E banner text');
        await closePanel(page);
        await discard(page);
        await expect(page.getByText('E2E banner title')).toHaveCount(0);
    });

    test('toolbar: hide the share link', async ({ page }) => {
        const share = page.locator('.flexium-catalog__share');
        test.skip(await share.count() === 0, 'Share link already off');
        await openWand(page, 'toolbar');
        await control(page, 'sharelink').locator('input[type="checkbox"]').uncheck();
        await expect(share).toHaveCount(0);
        await closePanel(page);
        await discard(page);
        await expect(share).toHaveCount(1);
    });

    test('views: columns of the grid and the view switch', async ({ page }) => {
        const views = page.locator('.flexium-catalog__views');
        // The columns apply to the grid view (the first button).
        await views.locator('button').first().click();
        await expect(views.locator('button').first()).toHaveAttribute('aria-pressed', 'true');
        await waitForResults(page);
        await openWand(page, 'views');
        await control(page, 'gridcolumns').locator('select').selectOption('2');
        await expect(page.locator('.flexium-catalog__grid--cols-2')).toHaveCount(1);
        await control(page, 'viewswitch').locator('input[type="checkbox"]').uncheck();
        await expect(views.locator('button')).toHaveCount(0);
        await closePanel(page);
        await discard(page);
        await expect(page.locator('.flexium-catalog__grid--cols-2')).toHaveCount(0);
        await expect(views.locator('button')).toHaveCount(2);
    });

    test('card image: favourites and quick view buttons', async ({ page }) => {
        const favourites = page.locator('.flexium-card [data-action="favourite"]');
        await expect(favourites.first()).toBeVisible();
        await openWand(page, 'image');
        await control(page, 'favourites').locator('input[type="checkbox"]').uncheck();
        await control(page, 'quickview').locator('input[type="checkbox"]').uncheck();
        await waitForResults(page);
        await expect(favourites).toHaveCount(0);
        await expect(page.locator('.flexium-card [data-action="quickview"]')).toHaveCount(0);
        await closePanel(page);
        await discard(page);
        await waitForResults(page);
        await expect(favourites.first()).toBeVisible();
    });

    test('card text: category and summary', async ({ page }) => {
        const summaries = page.locator('.flexium-card .flexium-card__summary');
        const categories = page.locator('.flexium-card .flexium-card__category');
        test.skip(await summaries.count() === 0 || await categories.count() === 0, 'Summaries or categories already off');
        await openWand(page, 'text');
        await control(page, 'card-showsummary').locator('input[type="checkbox"]').uncheck();
        await control(page, 'card-showcategory').locator('input[type="checkbox"]').uncheck();
        await waitForResults(page);
        await expect(summaries).toHaveCount(0);
        await expect(categories).toHaveCount(0);
        await closePanel(page);
        await discard(page);
        await waitForResults(page);
        await expect(summaries.first()).toBeVisible();
    });

    test('card badges: remove a kind of badge', async ({ page }) => {
        await openWand(page, 'badges');
        const items = control(page, 'card-badges').locator('.flexium-widget__btn--remove');
        const before = await items.count();
        test.skip(before === 0, 'No badges chosen on this site');
        const badges = page.locator('.flexium-card .flexium-card__badges');
        const shown = await badges.count();
        await items.first().click();
        await expect(items).toHaveCount(before - 1);
        await waitForResults(page);
        if (before === 1) {
            await expect(badges).toHaveCount(0);
        } else {
            await expect.poll(() => badges.count()).toBeLessThanOrEqual(shown);
        }
        await closePanel(page);
        await discard(page);
        await waitForResults(page);
        await expect(badges).toHaveCount(shown);
    });

    test('card footer: remove an item', async ({ page }) => {
        await openWand(page, 'footer');
        const items = control(page, 'card-footer').locator('.flexium-widget__btn--remove');
        const before = await items.count();
        test.skip(before === 0, 'No footer items chosen on this site');
        const meta = page.locator('.flexium-card .flexium-card__meta');
        const shown = await meta.count();
        await items.first().click();
        await expect(items).toHaveCount(before - 1);
        await waitForResults(page);
        await expect.poll(() => meta.count()).toBeLessThan(shown);
        await closePanel(page);
        await discard(page);
        await waitForResults(page);
        await expect(meta).toHaveCount(shown);
    });

    test('quick filters: hide one and rename another', async ({ page }) => {
        await openDrawer(page);
        const chips = page.locator('.flexium-quickfilters .flexium-quickfilter');
        const before = await chips.count();
        test.skip(before < 2, 'Fewer than two quick filters shown on this site');
        await openWand(page, 'quickfilters');
        const labels = control(page, 'quicklabels').locator('input[data-quick]');
        await labels.last().fill('E2E renamed');
        await expect(chips.last()).toContainText('E2E renamed');
        await control(page, 'quickfilters').locator('.flexium-widget__btn--remove').first().click();
        await expect(chips).toHaveCount(before - 1);
        await closePanel(page);
        await discard(page);
        await expect(chips).toHaveCount(before);
        await expect(chips.last()).not.toContainText('E2E renamed');
    });

    test('"All settings" lists the options of every part', async ({ page }) => {
        await page.locator('.flexium-editor [data-action="allsettings"]').click();
        const panel = page.locator('.flexium-editpanel');
        await expect(panel).toBeVisible();
        // Each part is a section of the accordion: open it and find one of its settings.
        const settings = {
            heading: 'pageheading', filtertoggle: 'filtericon', blocktoggle: 'blockicon', banner: 'banner',
            toolbar: 'sharelink', views: 'viewswitch', image: 'favourites', text: 'card-showsummary',
            footer: 'card-footer', filters: 'expandall', quickfilters: 'quicklabels', breadcrumbs: 'bc_style',
            coursepage: 'coursepage',
        };
        for (const [zone, key] of Object.entries(settings)) {
            const section = panel.locator(`.flexium-editpanel__section[data-zone="${zone}"]`);
            await section.locator('.flexium-editpanel__sectiontoggle').click();
            await expect(section.locator(`[data-feature="${key}"]`).first(), zone).toBeVisible();
        }
        await closePanel(page);
    });
});

test.describe('Magic wands: saved for everybody', () => {
    let visitor;

    test.beforeEach(async ({ page, browser }, testInfo) => {
        snapshotSettings(`wands-${testInfo.testId}`);
        page.on('dialog', dialog => dialog.accept());
        await setEditMode(page, true, 'course/index.php');
        await waitForResults(page);
        await closeDrawers(page);
        visitor = await visitorPage(browser);
    });

    test.afterEach(async ({ page }, testInfo) => {
        restoreSettings(`wands-${testInfo.testId}`);
        await visitor.context().close();
        await setEditMode(page, false, 'course/index.php');
    });

    test('heading text, filters button and card text', async ({ page }) => {
        await openWand(page, 'heading');
        await control(page, 'pageheadingtext').locator('input').fill('E2E saved heading');
        await closePanel(page);
        await openWand(page, 'filtertoggle');
        await control(page, 'filtericoncolour').locator('select').selectOption('danger');
        await control(page, 'filtericon').locator('select').selectOption('compass');
        await closePanel(page);
        await openWand(page, 'text');
        await control(page, 'card-showsummary').locator('input[type="checkbox"]').uncheck();
        await closePanel(page);
        await save(page);
        expect(getSettings(['feature_pageheadingtext', 'feature_filtericoncolour'])).toEqual({
            feature_pageheadingtext: 'E2E saved heading', feature_filtericoncolour: 'danger',
        });

        await visitor.goto('course/index.php', { timeout: 120000 });
        await waitForResults(visitor);
        await expect(visitor.locator('#page-header h1')).toHaveText('E2E saved heading');
        const button = visitor.locator('.drawer-left-toggle .flexium-filtertoggle');
        expect(await button.getAttribute('style')).toContain('--bs-danger');
        await expect(button.locator('i')).toHaveClass(/fa-compass/);
        await expect(visitor.locator('.flexium-card').first()).toBeVisible();
        await expect(visitor.locator('.flexium-card .flexium-card__summary')).toHaveCount(0);
    });

    test('filters panel options: open drawer, no "expand all", no counts', async ({ page }) => {
        await openDrawer(page);
        await openWand(page, 'filters');
        await control(page, 'option-filtersdraweropen').locator('input[type="checkbox"]').check();
        await control(page, 'expandall').locator('input[type="checkbox"]').uncheck();
        await control(page, 'optioncounts').locator('input[type="checkbox"]').uncheck();
        await closePanel(page);
        await save(page);
        expect(getSettings(['filtersdraweropen', 'feature_expandall', 'feature_optioncounts'])).toEqual({
            filtersdraweropen: '1', feature_expandall: '0', feature_optioncounts: '0',
        });

        await visitor.goto('course/index.php', { timeout: 120000 });
        await waitForResults(visitor);
        await expect(visitor.locator('.flexium-search__input').first()).toBeVisible();
        await expect(visitor.locator('.flexium-catalog__expandall')).toHaveCount(0);
        await expect(visitor.locator('.flexium-quickfilter__count')).toHaveCount(0);
    });

    test('views: list view by default without the switch', async ({ page }) => {
        await openWand(page, 'views');
        await control(page, 'defaultview').locator('select').selectOption('list');
        await control(page, 'viewswitch').locator('input[type="checkbox"]').uncheck();
        await closePanel(page);
        await save(page);
        expect(getSettings(['feature_defaultview', 'feature_viewswitch'])).toEqual({
            feature_defaultview: 'list', feature_viewswitch: '0',
        });

        await visitor.goto('course/index.php', { timeout: 120000 });
        await waitForResults(visitor);
        await expect(visitor.locator('.flexium-catalog__grid--list')).toHaveCount(1);
        await expect(visitor.locator('.flexium-catalog__views button')).toHaveCount(0);
    });

    test('quick filters: a renamed quick filter', async ({ page }) => {
        await openDrawer(page);
        const chips = page.locator('.flexium-quickfilters .flexium-quickfilter');
        test.skip(await chips.count() === 0, 'No quick filters shown on this site');
        await openWand(page, 'quickfilters');
        const labels = control(page, 'quicklabels').locator('input[data-quick]');
        // Visitors only see the quick filters that do not need an account (not "My courses").
        await labels.last().fill('E2E visitor chip');
        await closePanel(page);
        await save(page);
        expect(getSettings(['feature_quicklabels']).feature_quicklabels).toContain('E2E visitor chip');

        await visitor.goto('course/index.php', { timeout: 120000 });
        await waitForResults(visitor);
        if (!await visitor.locator('.flexium-quickfilters').isVisible()) {
            await visitor.locator('.drawer-left-toggle button').first().click();
        }
        await expect(visitor.locator('.flexium-quickfilters')).toContainText('E2E visitor chip');
    });

    test('breadcrumbs: style and separator', async ({ page }) => {
        await openWand(page, 'breadcrumbs');
        await control(page, 'bc_style').locator('select').selectOption('pills');
        await control(page, 'bc_separator').locator('select').selectOption('slash');
        await closePanel(page);
        await save(page);
        expect(getSettings(['bc_style', 'bc_separator'])).toEqual({ bc_style: 'pills', bc_separator: 'slash' });

        await visitor.goto('course/index.php', { timeout: 120000 });
        const breadcrumbs = visitor.locator('.flexium-breadcrumbs');
        test.skip(await breadcrumbs.count() === 0, 'Breadcrumbs not shown on the catalogue on this site');
        await expect(breadcrumbs).toHaveClass(/flexium-breadcrumbs--pills/);
    });

    test('breadcrumbs: switched off', async ({ page }) => {
        await openWand(page, 'breadcrumbs');
        await control(page, 'bc_enabled').locator('input[type="checkbox"]').uncheck();
        await closePanel(page);
        await save(page);
        expect(getSettings(['bc_enabled'])).toEqual({ bc_enabled: '0' });

        await visitor.goto('course/index.php', { timeout: 120000 });
        await waitForResults(visitor);
        await expect(visitor.locator('.flexium-breadcrumbs:not(.flexium-breadcrumbs--off)')).toHaveCount(0);
    });

    test('blocks button: saved colour', async ({ page }) => {
        await openWand(page, 'blocktoggle');
        await control(page, 'blockiconcolour').locator('select').selectOption('danger');
        await closePanel(page);
        await save(page);
        // Moodle shows this button outside edit mode only when there are blocks: check a fresh page in edit mode.
        await page.reload();
        await waitForResults(page);
        const button = page.locator('.drawer-right-toggle .flexium-blocktoggle');
        await expect(button).not.toHaveClass(/flexium-blocktoggle--plain/);
        expect(await button.getAttribute('style')).toContain('--bs-danger');
    });
});
