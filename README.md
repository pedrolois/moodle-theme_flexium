# Flexium

**A flexible Moodle theme. Design more. Code less.**

A dynamic, configurable Moodle theme that puts you in control.

Flexium is a theme based on Boost. It replaces the course index with a searchable, filterable course
catalogue and lets site administrators edit the catalogue, the site home page, the footer and the page margins
in place, with a live preview, from the pages themselves.

- [INSTALL.md](INSTALL.md): installing, upgrading and uninstalling.
- [CUSTOMISING.md](CUSTOMISING.md): everything you can change from the site, without a web developer.

## Requirements

- Moodle 5.3 or later (the theme uses the Moodle 5.3 React/ESM front-end APIs).
- The Boost theme (shipped with Moodle).

## Installation

1. Copy this folder to `theme/flexium` in your Moodle code (`public/theme/flexium` on Moodle 5.1+ layouts).
2. Visit *Site administration > Notifications* to complete the installation.
3. Select the theme in *Site administration > Appearance > Themes*.

On installation the theme adds one course custom field, *Quick view* (shortname `flexium_quickview`, in a
"Flexium" field category), so teachers can choose per course whether the catalogue quick view is shown.
Uninstalling the theme deletes the field with its values, and the "Flexium" category unless other fields were
added to it.

## Configuration overview

Settings are in *Site administration > Appearance > Themes > Flexium*:

- **Branding, typography, shape**: brand and interface colours, fonts (from Google Fonts, see Privacy below),
  corner radius and shadows.
- **Login page**: background image.
- **Course catalogue**: filters built from course categories, tags and course custom fields, with faceted counts,
  search, sorting, date ranges, quick filters, grid and list views, courses per page and a quick view of each
  course. The filter layout is edited by drag and drop.
- **Course cards**: which badges, summary and footer items the cards show, and the default course image.
- **Home page**: a home page builder with ready-made templates and sections (hero, courses, categories, statistics,
  news, testimonials, FAQ, call to action, free HTML and the standard site content).
- **Footer**: a footer builder with columns of blocks (text, links, contact, social networks, logo, legal links,
  login information, user tours).
- **Catalogue features**: switch each optional catalogue feature on or off.
- **Breadcrumbs**: style, separator, home item and the pages where they appear.
- **Advanced**: raw initial and final SCSS.

### In-place editing

With editing mode on, site administrators see "magic wand" buttons on the catalogue, the home page and the footer.
They open an editor panel with a live preview; changes are applied only when saved and can be discarded. The page
margins (site, home page and catalogue) are adjusted the same way. Only users with `moodle/site:config` can save.

## Privacy

- The theme stores two user preferences: the catalogue filter groups a user opened or closed, and the chosen results
  view (grid or list). Both are declared in the Privacy API and included in data exports. Visitors who are not logged
  in keep the same choices in their browser's local storage.
- Course favourites use Moodle's own favourites.
- When a Google font is selected in the typography settings, browsers load it from `fonts.googleapis.com` and
  `fonts.gstatic.com`. Keep the default fonts if no third-party requests are wanted.
- Images uploaded in the theme settings are site files, not personal data.

## Tests

PHPUnit, from the Moodle root after initialising the PHPUnit environment:

```bash
vendor/bin/phpunit --testsuite theme_flexium_testsuite
```

End-to-end browser tests (Playwright) are in `tests/playwright`; see `tests/playwright/README.md` for setup and use.

## License

GNU GPL v3 or later. See <http://www.gnu.org/copyleft/gpl.html>.

## Author

Pedro Luis Garcia Leiva
