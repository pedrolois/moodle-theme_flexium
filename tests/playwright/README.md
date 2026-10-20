# Flexium end-to-end tests (Playwright)

Browser tests of the Flexium theme:

- `visitor.spec.js`, `catalog.spec.js`: the catalogue (search, hidden courses, sorting, views, quick view), the top
  menu, the site home layout and the footer, as a visitor and as an administrator.
- `wands.spec.js`: every magic wand of the catalogue (heading, breadcrumbs, filters and blocks buttons, banner, toolbar,
  views, card image / text / badges / footer, filters, quick filters, "All settings"). Each change must show at once,
  "Discard changes" must put the page back, and saved changes must reach a visitor.
- `home.spec.js`: the home page builder (section wands, add / move / duplicate / delete, discard, save).
- `footer.spec.js`: the footer builder (style and block wands, blocks and columns, discard, save).
- `layout.spec.js`: the blocks drawer next to the site home, and the page margins wand (preview and save).

## Setup (once)

```bash
cd theme/flexium/tests/playwright
npm install
npx playwright install chromium   # only if no Chromium build for Playwright 1.49 is cached yet
```

Create `tests/playwright/.env` (git-ignored):

```
MOODLE_URL=http://localhost/moodle
PHP_BINARY=/usr/bin/php
```

`PHP_BINARY` is the PHP of the Moodle site (the `php` on the PATH is used when it is not set).

## Test data

No account or password is stored. Before every run `fixture.php create` makes:

- a temporary site administrator, `flexium_e2e`, with a random password;
- three courses whose names contain "Zephyrine", a word no real course uses: one with self enrolment open, one
  without any open enrolment method and one hidden.

After the run `fixture.php delete` removes them (it also cleans what a failed run left behind). Run it by hand if a run
was killed: `php fixture.php delete`.

Theme settings are never left changed: the run saves every theme setting first and puts them back exactly at the end
(`php config.php snapshot|restore <file>`), and each test that saves settings does the same around itself.

## Run

```bash
npx playwright test              # all tests (logs in once, then reuses the session)
npx playwright test --project=visitor
npx playwright test --headed     # watch it in a browser
npx playwright show-report       # HTML report of the last run
```

The first page after a Moodle cache purge rebuilds the theme styles (a minute or more): build them first with
`php admin/cli/build_theme_css.php --themes=flexium`.

## Conventions

- Locale-independent selectors only: ids, `name`, CSS classes and the theme's `data-*` attributes (`data-zone` on
  the magic wands, `data-feature` on the settings of the edit panels, `data-action` on card and editor buttons).
  Never visible text from Moodle's UI. Matching the test courses' own names is fine.
- Wait for real states (results loaded, classes changed), never `networkidle`.
- Edit mode is switched off again after the specs that use it.
