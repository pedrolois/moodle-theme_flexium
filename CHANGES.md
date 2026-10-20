# Changelog

## 1.0.0 (2026-10-20)

First stable release. Flexium: a flexible Moodle theme. Design more. Code less.

- Course catalogue on the course index page:
  - search, and filters from categories, tags and course custom fields, with faceted counts;
  - quick filters, start-date range and sorting;
  - grid and list views, pagination and a course quick view (per course: automatic, shown or hidden).
- In-place editing with magic wands (edit mode, site administrators only), with live preview, discard and save:
  - the page heading and breadcrumbs;
  - the filters and blocks drawer buttons;
  - the catalogue header, the results toolbar and the views;
  - the course cards (image, texts, badges and footer);
  - the filters panel and the quick filters.
- Home page builder: ten templates and fourteen section types, added, moved, duplicated and deleted in place.
- Footer builder: columns of blocks (text, links, contact details, social networks, logo, legal links, copyright,
  site support, login information, user tour), moved by drag and drop.
- Page margins for the whole site, the home page and the catalogue, adjusted in place.
- "Catalogue" link in the top menu, unless the custom menu items already link to the catalogue.
- Appearance settings: colours with a contrast check, fonts, corner radius, shadows, background and login images,
  breadcrumbs, and raw SCSS.
- Favicon, used when the site has not uploaded its own.
- Privacy API: the catalogue user preferences, and Google Fonts declared as an external location (only used when an
  administrator chooses a Google font).
- Uninstalling removes the "Quick view" course custom field that the installation adds.
- Documentation: README, INSTALL and CUSTOMISING guides.
- Tests: PHPUnit suite, Playwright browser tests (every magic wand, the home page and footer builders), and a
  moodle-plugin-ci workflow.
