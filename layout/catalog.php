<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Course category layout (course index): Boost's drawers layout, with the catalogue filters in the left drawer.
 *
 * The left drawer is the one Boost uses for the course index: same toggle, same remembered open/closed
 * preference. The React catalogue renders its filter sidebar into #flexium-catalog-filters.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/behat/lib.php');
require_once($CFG->dirroot . '/course/lib.php');

$catalog = get_config('theme_flexium', 'enablecatalog') && str_starts_with($PAGE->pagetype, 'course-index');

$addblockbutton = $OUTPUT->addblockbutton();

// Whether the filters drawer starts open, chosen in the catalogue edit mode: it applies to visitors and to users who
// have not opened or closed the drawer themselves (Boost then remembers their choice).
$filtersopen = get_config('theme_flexium', 'filtersdraweropen');
$filtersopen = ($filtersopen === false) ? true : (bool) $filtersopen;

if (isloggedin()) {
    $courseindexopen = (get_user_preferences('drawer-open-index', $filtersopen) == true);
    $blockdraweropen = (get_user_preferences('drawer-open-block') == true);
} else {
    $courseindexopen = $catalog && $filtersopen;
    $blockdraweropen = false;
}

if (defined('BEHAT_SITE_RUNNING') && get_user_preferences('behat_keep_drawer_closed') != 1) {
    $blockdraweropen = true;
}

$extraclasses = ['uses-drawers'];
if ($catalog) {
    $extraclasses[] = 'flexium-catalogpage';
    $features = \theme_flexium\local\catalog\features::get_all();
    if ($features['pageheadingtext'] !== '') {
        $PAGE->set_heading(format_string($features['pageheadingtext']));
    }
    // Hidden heading: still shown in edit mode, so its wand can bring it back.
    if (!$features['pageheading'] && !$PAGE->user_is_editing()) {
        $extraclasses[] = 'flexium-noheading';
    }
}
if ($courseindexopen) {
    $extraclasses[] = 'drawer-open-index';
}

$blockshtml = $OUTPUT->blocks('side-pre');
$hasblocks = (strpos($blockshtml, 'data-block=') !== false || !empty($addblockbutton));
if (!$hasblocks) {
    $blockdraweropen = false;
}

$catalogfilters = $catalog
    ? html_writer::div('', 'flexium-drawerfilters', ['id' => 'flexium-catalog-filters'])
    : '';
if (!$catalogfilters) {
    $courseindexopen = false;
}

$bodyattributes = $OUTPUT->body_attributes($extraclasses);
if ($catalog) {
    // The course index page adds "limitedwidth" (830px content, anchored drawers); the catalogue grid uses the full width.
    $bodyattributes = preg_replace('/(class="[^"]*)\blimitedwidth\b/', '$1', $bodyattributes);
}
$forceblockdraweropen = $OUTPUT->firstview_fakeblocks();

$secondarynavigation = false;
$overflow = '';
if ($PAGE->has_secondary_navigation()) {
    $tablistnav = $PAGE->has_tablist_secondary_navigation();
    $moremenu = new \core\navigation\output\more_menu($PAGE->secondarynav, 'nav-tabs', true, $tablistnav);
    $secondarynavigation = $moremenu->export_for_template($OUTPUT);
    $overflowdata = $PAGE->secondarynav->get_overflow_menu_data();
    if (!is_null($overflowdata)) {
        $selectmenu = new \core\output\select_menu(
            'tertiarynavigation',
            $overflowdata->urls,
            $overflowdata->selected,
        );
        $selectmenu->set_label($overflowdata->label, $overflowdata->labelattributes);
        $overflow = $selectmenu->export_for_template($OUTPUT);
    }
}

$primary = new core\navigation\output\primary($PAGE);
$renderer = $PAGE->get_renderer('core');
$primarymenu = $primary->export_for_template($renderer);
$buildregionmainsettings = !$PAGE->include_region_main_settings_in_header_actions() && !$PAGE->has_secondary_navigation();
// If the settings menu will be included in the header then don't add it here.
$regionmainsettingsmenu = $buildregionmainsettings ? $OUTPUT->region_main_settings_menu() : false;

$header = $PAGE->activityheader;
$headercontent = $header->export_for_template($renderer);

// Button opening the filters drawer: icon, colour and size chosen in the catalogue edit mode.
$features = \theme_flexium\local\catalog\features::get_all();
$filtertoggle = [
    'icon' => \theme_flexium\local\catalog\features::TOGGLE_ICONS[$features['filtericon']],
    'colour' => $features['filtericoncolour'],
    'size' => $features['filtericonsize'],
    'position' => $features['filtericonposition'],
];

// Button opening the blocks drawer: Moodle's grey button unless changed in the catalogue edit mode.
$blocktoggle = [
    'icon' => \theme_flexium\local\catalog\features::BLOCK_TOGGLE_ICONS[$features['blockicon']],
    'colour' => $features['blockiconcolour'],
    'plain' => $features['blockiconcolour'] === 'default',
    'size' => $features['blockiconsize'],
    'position' => $features['blockiconposition'],
];

$templatecontext = [
    'filtertoggle' => $filtertoggle,
    'blocktoggle' => $blocktoggle,
    'sitename' => format_string($SITE->shortname, true, ['context' => context_course::instance(SITEID), "escape" => false]),
    'output' => $OUTPUT,
    'sidepreblocks' => $blockshtml,
    'hasblocks' => $hasblocks,
    'bodyattributes' => $bodyattributes,
    'courseindexopen' => $courseindexopen,
    'blockdraweropen' => $blockdraweropen,
    'catalogfilters' => $catalogfilters,
    'primarymoremenu' => $primarymenu['moremenu'],
    'secondarymoremenu' => $secondarynavigation ?: false,
    'mobileprimarynav' => $primarymenu['mobileprimarynav'],
    'usermenu' => $primarymenu['user'],
    'langmenu' => $primarymenu['lang'],
    'forceblockdraweropen' => $forceblockdraweropen,
    'regionmainsettingsmenu' => $regionmainsettingsmenu,
    'hasregionmainsettingsmenu' => !empty($regionmainsettingsmenu),
    'overflow' => $overflow,
    'headercontent' => $headercontent,
    'addblockbutton' => $addblockbutton,
];

echo $OUTPUT->render_from_template('theme_flexium/catalog', $templatecontext);
