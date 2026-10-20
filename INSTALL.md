# Installing Flexium

## Requirements

- Moodle 5.3 or later. Flexium uses the React and JavaScript module features that arrived in Moodle 5.3, so it does
  not install on earlier versions.
- The Boost theme, which comes with Moodle. Flexium is built on it.
- A site administrator account.

Nothing else is needed: no extra PHP extensions, no build tools and no external services.

## Install from the Moodle site (recommended)

1. Download the Flexium ZIP file.
2. Go to *Site administration > Plugins > Install plugins*.
3. Drop the ZIP file in the box, then click *Install plugin from the ZIP file*.
4. Check the validation report, then click *Continue* and *Upgrade Moodle database now*.
5. Review the default settings on the next page and click *Save changes*. You can change them all later.

If *Install plugins* is not available on your site, an administrator of the server has turned it off. Use the
manual installation below instead.

## Install manually on the server

1. Unzip the file. You get a folder called `flexium`.
2. Copy that folder into the `theme` folder of your Moodle code. On Moodle 5.3 the full path is
   `<moodle>/public/theme/flexium`.
3. Go to *Site administration > Notifications*, or run `php admin/cli/upgrade.php` from the Moodle folder.

## Turn the theme on

1. Go to *Site administration > Appearance > Themes*.
2. Click *Use theme* under Flexium.

The course catalogue replaces the course list at *Courses* (`/course/index.php`) as soon as the theme is in use. A
"Catalogue" link is added to the top menu.

## What the installation adds

- **A course custom field, "Quick view".** It is in a category called "Flexium" and is only visible to teachers.
  Leave it on *Automatic*: the catalogue then shows the quick view of a course only when the course page is useful to
  the person looking, for example when they are enrolled or can enrol themselves. Teachers can force it on or off for
  their course.
- **Theme settings** with ready-to-use defaults: the catalogue, a home page from the "Academy" template, a footer
  with the site's contact details, and course cards.

## First steps after installing

1. Go to *Site administration > Appearance > Themes > Flexium* and set your colours and fonts in *Branding* and
   *Typography*.
2. Open the site home page, turn *Edit mode* on and use the magic wands to adjust the home page and the footer.
   [CUSTOMISING.md](CUSTOMISING.md) lists everything you can change.
3. Open *Courses* with *Edit mode* on and choose the catalogue filters. Filters can come from course categories,
   tags and course custom fields.

### Visitors who are not logged in

Visitors can browse the catalogue unless the site forces login (*Force users to log in* in *Site administration >
Security > Site security settings*). Clicking a course takes them to Moodle's normal course or enrolment page, which
asks them to log in unless guest access is allowed for that course.

### Google Fonts

The default fonts are the ones installed on each device, so the theme makes no requests to other sites. If you
choose a Google font in *Typography*, users' browsers download it from Google Fonts, and Google receives their IP
address. To avoid this, keep the default fonts, or turn off *Load fonts from Google Fonts*.

## Upgrading

Install the new version the same way as the first one: upload the ZIP in *Install plugins*, or replace the
`flexium` folder on the server. Then visit *Site administration > Notifications*. Your settings, home page and
footer are kept.

## Uninstalling

1. Choose another theme in *Site administration > Appearance > Themes*.
2. Go to *Site administration > Plugins > Plugins overview*, find Flexium and click *Uninstall*.

Uninstalling deletes the theme settings, the home page and footer layouts, and the uploaded images. It also
deletes the "Quick view" course field and its values, and the "Flexium" field category if no other fields were added
to it.

## Troubleshooting

- **The first page after installing or purging caches is slow.** Moodle compiles the theme styles once, which can
  take a minute on a small server. To avoid the wait, compile them beforehand from the Moodle folder:
  `php admin/cli/build_theme_css.php --themes=flexium`.
- **Changes to the theme files do not show.** Purge the caches in *Site administration > Development > Purge
  caches*.
- **The catalogue is empty for visitors.** Check that the courses are visible and that their category is visible.
  Hidden courses are only shown to users who can see hidden courses.
