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

namespace theme_flexium\output\core;

use core\output\html_writer;
use theme_flexium\local\catalog\card_config;
use theme_flexium\local\catalog\catalog;
use theme_flexium\local\catalog\course_info;
use theme_flexium\local\catalog\features;
use theme_flexium\local\catalog\filter_config;
use theme_flexium\local\home\fields;
use theme_flexium\local\home\home;
use theme_flexium\local\home\templates;

/**
 * Course renderer: replaces the course index (/course/index.php) with the React course catalogue.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class course_renderer extends \core_course_renderer {
    /**
     * Render the course catalogue instead of the category listing.
     *
     * Opening a category (/course/index.php?categoryid=X) opens the catalogue filtered by that category.
     *
     * @param int|\stdClass|\core_course_category $category
     * @return string
     */
    public function course_category($category) {
        if (!get_config('theme_flexium', 'enablecatalog')) {
            return parent::course_category($category);
        }

        $categoryid = is_object($category) ? (int) $category->id : (int) $category;
        $hascategoryfilter = in_array(
            filter_config::SOURCE_CATEGORY,
            array_column(filter_config::get_layout(), 'source'),
            true
        );

        $perpage = (int) get_config('theme_flexium', 'perpage');
        $props = [
            'perpage' => in_array($perpage, catalog::PERPAGE_OPTIONS, true) ? $perpage : catalog::PERPAGE_OPTIONS[0],
            'userperpage' => (bool) get_config('theme_flexium', 'userperpage'),
            'perpageoptions' => catalog::PERPAGE_OPTIONS,
            'initialcategory' => ($categoryid && $hascategoryfilter) ? (string) $categoryid : '',
            'sorts' => array_map(fn($sort) => [
                'value' => $sort,
                'label' => get_string('sort_' . $sort, 'theme_flexium'),
            ], catalog::SORTS),
            'strings' => self::catalog_strings(),
            'editor' => self::editor_props(),
            'features' => features::get_all(),
            'loggedin' => isloggedin() && !isguestuser(),
            // Remembered by the catalogue (user preferences; visitors use the browser storage).
            'savedgroups' => (string) get_user_preferences('theme_flexium_catalog_groups', ''),
            'savedview' => (string) get_user_preferences('theme_flexium_catalog_view', ''),
            'palette' => features::palette_images(),
            'quickicons' => features::QUICK_FILTERS,
            'toggleicons' => features::TOGGLE_ICONS,
            'blockicons' => features::BLOCK_TOGGLE_ICONS,
            'badgestyle' => [
                'colours' => (object) card_config::get_badge_colours(),
                'rows' => (bool) get_config('theme_flexium', 'cardbadgerows'),
            ],
            'canedit' => !$this->page->user_is_editing()
                && has_capability('moodle/site:config', \core\context\system::instance()),
        ];

        return html_writer::react_component('@moodle/lms/theme_flexium/catalog/Catalog', $props);
    }

    /**
     * Site home: Moodle's site summary section, kept in the page (Moodle's course editor needs it) but hidden: the
     * "Moodle content" section of the home page shows it in its place.
     *
     * @return string
     */
    public function frontpage_section1() {
        $section = parent::frontpage_section1();
        if (!home::enabled() || $section === '') {
            return $section;
        }
        return html_writer::div($section, 'flexium-sitesection', ['hidden' => 'hidden']);
    }

    /**
     * Site home: the page built with the home page builder (React), instead of Moodle's list of parts.
     *
     * @return string
     */
    public function frontpage() {
        if (!home::enabled()) {
            return parent::frontpage();
        }
        global $SITE;

        $editing = $this->page->user_is_editing() && has_capability('moodle/site:config', \core\context\system::instance());
        $props = [
            'page' => home::get_page(),
            // Moodle's own site home content, for the "Moodle content" section.
            'sitecontent' => parent::frontpage(),
            'sitename' => format_string($SITE->fullname),
            'palette' => features::palette_images(),
            'catalogurl' => (new \core\url('/course/index.php'))->out(false),
            'loggedin' => isloggedin() && !isguestuser(),
            'strings' => self::home_strings(),
            'editor' => $editing ? [
                'templates' => templates::get_all(),
                'schema' => fields::export(),
                'icons' => fields::ICONS,
                'types' => home::TYPES,
                'strings' => self::home_editor_strings(),
            ] : null,
            'canedit' => !$editing && has_capability('moodle/site:config', \core\context\system::instance()),
        ];
        return html_writer::react_component('@moodle/lms/theme_flexium/home/HomePage', $props);
    }

    /**
     * Strings of the home page (visitors), resolved on the server.
     *
     * @return array identifier => string
     */
    private static function home_strings(): array {
        $strings = [];
        $keys = [
            'home_search', 'home_searchplaceholder', 'home_viewall', 'home_previous', 'home_next', 'home_nocourses',
            'home_stat_courses', 'home_stat_users', 'home_stat_categories', 'home_stat_completions', 'home_coursecount',
            'home_nonews', 'catalog_loading', 'catalog_error', 'home_edithint', 'home_edithint_title',
        ];
        foreach ($keys as $key) {
            $strings[$key] = get_string($key, 'theme_flexium', '{$a}');
        }
        return $strings;
    }

    /**
     * Strings of the home page builder (edit mode), resolved on the server.
     *
     * @return array identifier => string
     */
    private static function home_editor_strings(): array {
        $keys = ['home_editor_title', 'home_editor_help', 'home_templates', 'home_templates_help', 'home_usetemplate',
            'home_usetemplate_confirm', 'home_addsection', 'home_addsection_help', 'home_moveup', 'home_movedown',
            'home_duplicate', 'home_delete', 'home_delete_confirm', 'home_settings', 'home_additem', 'home_removeitem',
            'home_empty', 'editor_save', 'editor_saving', 'editor_saved', 'editor_error', 'editor_reset', 'editor_unsaved',
            'editor_closepanel', 'editor_wand', 'home_current', 'editor_leaveunsaved'];
        foreach (\theme_flexium\local\home\home::TYPES as $type) {
            $keys[] = 'home_type_' . $type;
            $keys[] = 'home_type_' . $type . '_desc';
        }
        $strings = [];
        foreach ($keys as $key) {
            $strings[$key] = get_string($key, 'theme_flexium', '{$a}');
        }
        return $strings;
    }

    /**
     * Course information box (enrolment page and course/info.php): a header with the course image, dates,
     * teachers, summary and custom fields when the "Course page" feature is on.
     *
     * @param \stdClass $course
     * @return string
     */
    public function course_info_box(\stdClass $course) {
        if (!features::get('coursepage')) {
            return parent::course_info_box($course);
        }
        $info = course_info::export($course);
        $info['hassummary'] = trim(strip_tags($info['summary'], '<img>')) !== '' || !empty($info['sections']);
        $info['hasfacts'] = !empty($info['facts']);
        return $this->render_from_template('theme_flexium/courseinfo', $info);
    }

    /**
     * What the editor needs to upload an image to the user's draft area with Moodle's file picker upload
     * (repository_ajax.php), null when the "Upload a file" repository is disabled.
     *
     * @return array|null
     */
    private static function image_upload_props(): ?array {
        global $CFG;
        require_once($CFG->dirroot . '/repository/lib.php');

        $context = \core\context\system::instance();
        $instances = \repository::get_instances(['type' => 'upload', 'currentcontext' => $context, 'onlyvisible' => true]);
        $instance = reset($instances);
        if (!$instance) {
            return null;
        }
        return [
            'url' => (new \core\url('/repository/repository_ajax.php', ['action' => 'upload']))->out(false),
            'repoid' => (int) $instance->id,
            'contextid' => $context->id,
            'draftitemid' => file_get_unused_draft_itemid(),
            'maxbytes' => (int) get_max_upload_file_size($CFG->maxbytes),
        ];
    }

    /**
     * Data of the in-page catalogue editor, shown to site administrators while edit mode is on; null otherwise.
     *
     * @return array|null
     */
    private function editor_props(): ?array {
        if (!$this->page->user_is_editing() || !has_capability('moodle/site:config', \core\context\system::instance())) {
            return null;
        }

        $layout = filter_config::get_layout();
        $sources = [];
        foreach (filter_config::get_available_sources() as $source) {
            $sources[] = [
                'key' => $source['source'],
                'label' => $source['label'],
                'kind' => $source['fieldtype'] === null
                    ? get_string('source_' . $source['source'], 'theme_flexium')
                    : get_string('source_customfield', 'theme_flexium', $source['fieldtype']),
            ];
        }
        $choices = fn(array $list) => array_map(
            fn($key, $label) => ['key' => (string) $key, 'label' => $label],
            array_keys($list),
            $list
        );

        $strings = [];
        $keys = [
            'editor_title', 'editor_help', 'editor_save', 'editor_saving', 'editor_saved', 'editor_error',
            'editor_reset', 'editor_filterstitle', 'editor_add', 'editor_nothingtoadd',
            'editor_empty', 'cardshowcategory', 'cardshowsummary', 'cardbadges', 'cardfooter', 'filtereditor_expanded',
            'filtereditor_moveup', 'filtereditor_movedown', 'filtereditor_remove', 'filtereditor_drag',
            'filtereditor_moved', 'editor_unsaved', 'editor_perpage', 'editor_userperpage',
            'editor_filtersdraweropen', 'image_upload', 'image_uploading', 'image_uploaded', 'image_uploaderror',
            'image_noupload',
            'editor_aftersave', 'editor_wand', 'editor_closepanel', 'editzone_image',
            'editzone_text', 'editzone_badges', 'editzone_footer', 'editzone_toolbar', 'editzone_filters',
            'editzone_quickfilters',
            'editzone_banner', 'editzone_coursepage', 'editzone_all', 'editzone_nothing', 'cardbadgerows',
            'cardbadgerows_desc', 'cardbadgecolour', 'editzone_heading', 'editzone_breadcrumbs', 'editzone_filtertoggle',
            'editzone_blocktoggle',
            'editor_leaveunsaved', 'feature_quicklabels', 'feature_quicklabels_desc',
            'filtereditor_name', 'editzone_views',
        ];
        foreach ($keys as $key) {
            $strings[$key] = get_string($key, 'theme_flexium', '{$a}');
        }
        foreach (array_keys(features::QUICK_FILTERS) as $key) {
            $strings['quick_' . $key] = get_string('quick_' . $key, 'theme_flexium');
        }

        return [
            'layout' => $layout,
            'sources' => $sources,
            'card' => card_config::get_settings($layout),
            'options' => [
                'perpage' => in_array((int) get_config('theme_flexium', 'perpage'), catalog::PERPAGE_OPTIONS, true)
                    ? (int) get_config('theme_flexium', 'perpage') : catalog::PERPAGE_OPTIONS[0],
                'userperpage' => (bool) get_config('theme_flexium', 'userperpage'),
                // Unset means open (default of the setting, read by layout/catalog.php).
                'filtersdraweropen' => get_config('theme_flexium', 'filtersdraweropen') !== '0',
            ],
            // Breadcrumb settings are edited from the catalogue too ("bc_<setting>").
            'features' => features::get_raw() + \theme_flexium\local\breadcrumbs::get_raw(),
            'featuredefs' => array_merge(
                features::export_definitions(),
                \theme_flexium\local\breadcrumbs::export_definitions()
            ),
            'badgechoices' => $choices(card_config::get_badge_choices()),
            'badgecolours' => card_config::BADGE_COLOURS,
            'imageupload' => self::image_upload_props(),
            'footerchoices' => $choices(card_config::get_footer_choices()),
            'strings' => $strings,
        ];
    }

    /**
     * Strings the catalogue needs, resolved on the server so the page renders without extra requests.
     *
     * Strings with placeholders keep a literal "{$a}" for the client to replace.
     *
     * @return array identifier => string
     */
    public static function catalog_strings(): array {
        $keys = [
            'catalog_search', 'catalog_searchplaceholder', 'catalog_filters', 'catalog_activefilters',
            'catalog_clearall', 'catalog_sortby', 'catalog_results', 'catalog_result', 'catalog_noresults',
            'catalog_noresults_help', 'catalog_participants', 'catalog_starts', 'catalog_ends', 'catalog_previous',
            'catalog_next', 'catalog_page', 'catalog_removefilter', 'catalog_showmore', 'catalog_showless',
            'catalog_hidden', 'catalog_searchmatched', 'catalog_loading', 'catalog_error', 'catalog_togglefilters',
            'catalog_expand', 'catalog_collapse', 'catalog_searchfor', 'catalog_nooptions', 'catalog_closefilters',
            'catalog_perpage', 'catalog_clearoptions', 'catalog_filteroptions', 'catalog_quickfilters',
            'catalog_startfrom', 'catalog_startto', 'catalog_daterange', 'catalog_view', 'catalog_viewgrid',
            'catalog_viewlist', 'catalog_sharelink', 'catalog_linkcopied', 'catalog_favourite', 'catalog_unfavourite',
            'catalog_quickview', 'catalog_progress', 'catalog_gotocourse', 'catalog_viewcourse', 'catalog_teachers',
            'catalog_dates', 'catalog_close', 'catalog_resultsupdated', 'catalog_bannertitle', 'catalog_edithint_title',
            'catalog_edithint', 'catalog_firstpage', 'catalog_lastpage', 'catalog_noquickfilters',
        ];
        $strings = [];
        foreach ($keys as $key) {
            $strings[$key] = get_string($key, 'theme_flexium', '{$a}');
        }
        // Core strings, already translated everywhere.
        $strings['catalog_expandall'] = get_string('expandall');
        $strings['catalog_collapseall'] = get_string('collapseall');
        foreach (array_keys(features::QUICK_FILTERS) as $key) {
            $strings['quick_' . $key] = get_string('quick_' . $key, 'theme_flexium');
        }
        foreach (features::STATUS_BADGES as $key) {
            $strings['status_' . $key] = get_string('status_' . $key, 'theme_flexium');
        }
        // Several placeholders: the client replaces {from}, {to} and {total}.
        $strings['catalog_showing'] = get_string(
            'catalog_showing',
            'theme_flexium',
            (object) ['from' => '{from}', 'to' => '{to}', 'total' => '{total}']
        );
        return $strings;
    }
}
