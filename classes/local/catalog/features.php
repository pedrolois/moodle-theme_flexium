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

namespace theme_flexium\local\catalog;

/**
 * Optional catalogue features: each one can be switched on and off (or configured) from the catalogue edit mode
 * and from the theme settings (Catalogue features tab). Both are generated from self::definitions().
 *
 * Values are stored as plugin config "feature_<key>": '1'/'0' for switches, the chosen key for selects, a comma
 * separated list for lists and plain text for texts. Unset means the default.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class features {
    /** @var string Config name prefix. */
    public const PREFIX = 'feature_';

    /** @var string[] Quick filters: key => Font Awesome icon. */
    public const QUICK_FILTERS = [
        'mycourses' => 'fa-solid fa-user-graduate',
        'favourites' => 'fa-solid fa-star',
        'new' => 'fa-solid fa-wand-magic-sparkles',
        'startingsoon' => 'fa-regular fa-calendar-plus',
        'inprogress' => 'fa-solid fa-person-running',
        'openenrol' => 'fa-solid fa-door-open',
    ];

    /** @var string[] Status badges of the course cards. */
    public const STATUS_BADGES = ['enrolled', 'completed', 'new', 'startingsoon', 'favourite'];

    /** @var string[] Headers of courses without an image: 'auto' (one per course), one of the six, Moodle's or uploaded. */
    public const DEFAULT_IMAGE_STYLES = ['auto', '1', '2', '3', '4', '5', '6', 'core', 'custom'];

    /** @var string[] Icons of the button that opens the filters panel: key => Font Awesome classes. */
    public const TOGGLE_ICONS = [
        'filter' => 'fa-solid fa-filter',
        'sliders' => 'fa-solid fa-sliders',
        'tablelist' => 'fa-solid fa-table-list',
        'form' => 'fa-solid fa-rectangle-list',
        'listcheck' => 'fa-solid fa-list-check',
        'search' => 'fa-solid fa-magnifying-glass',
        'layers' => 'fa-solid fa-layer-group',
        'compass' => 'fa-solid fa-compass',
        'bars' => 'fa-solid fa-bars-staggered',
    ];

    /** @var string[] Colours of the button that opens the filters panel (Bootstrap theme colours). */
    public const TOGGLE_COLOURS = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'dark'];

    /** @var string[] Icons of the button that opens the blocks drawer ('sidebar' keeps Moodle's own icon). */
    public const BLOCK_TOGGLE_ICONS = [
        'sidebar' => '',
        'columns' => 'fa-solid fa-table-columns',
        'cubes' => 'fa-solid fa-cubes',
        'grid' => 'fa-solid fa-table-cells-large',
        'bars' => 'fa-solid fa-bars',
        'ellipsis' => 'fa-solid fa-ellipsis-vertical',
        'info' => 'fa-solid fa-circle-info',
        'gear' => 'fa-solid fa-gear',
    ];

    /** @var int Days a course counts as new, and days ahead a start counts as "starting soon". */
    public const RECENT_DAYS = 30;

    /**
     * Every feature: key => ['group', 'type' (bool, select, list, text), 'default', 'choices' (select and list)].
     *
     * @return array
     */
    public static function definitions(): array {
        return [
            // Filters panel.
            'expandall' => ['group' => 'filters', 'type' => 'bool', 'default' => '1'],
            'optioncounts' => ['group' => 'filters', 'type' => 'bool', 'default' => '1'],
            'showemptyoptions' => ['group' => 'filters', 'type' => 'bool', 'default' => '0'],
            'groupsearch' => ['group' => 'filters', 'type' => 'bool', 'default' => '1'],
            'groupclear' => ['group' => 'filters', 'type' => 'bool', 'default' => '1'],
            'rememberopen' => ['group' => 'filters', 'type' => 'bool', 'default' => '1'],
            'quickfilters' => ['group' => 'filters', 'type' => 'list', 'default' => 'mycourses,new,startingsoon',
                'choices' => array_keys(self::QUICK_FILTERS)],
            'quicklabels' => ['group' => 'filters', 'type' => 'text', 'default' => ''],
            'daterange' => ['group' => 'filters', 'type' => 'bool', 'default' => '0'],
            'filtericon' => ['group' => 'filters', 'type' => 'select', 'default' => 'filter',
                'choices' => array_keys(self::TOGGLE_ICONS)],
            'filtericoncolour' => ['group' => 'filters', 'type' => 'select', 'default' => 'primary',
                'choices' => self::TOGGLE_COLOURS],
            'filtericonsize' => ['group' => 'filters', 'type' => 'select', 'default' => 'md', 'choices' => ['sm', 'md', 'lg']],
            'filtericonposition' => ['group' => 'filters', 'type' => 'select', 'default' => 'top',
                'choices' => ['top', 'upper', 'middle', 'lower', 'bottom']],
            // Results and course cards.
            'defaultsort' => ['group' => 'results', 'type' => 'select', 'default' => 'name', 'choices' => catalog::SORTS],
            'viewswitch' => ['group' => 'results', 'type' => 'bool', 'default' => '1'],
            'defaultview' => ['group' => 'results', 'type' => 'select', 'default' => 'grid', 'choices' => ['grid', 'list']],
            'gridcolumns' => ['group' => 'results', 'type' => 'select', 'default' => 'auto',
                'choices' => ['auto', '2', '3', '4']],
            'viewcards' => ['group' => 'results', 'type' => 'select', 'default' => 'same', 'choices' => ['same', 'separate']],
            'listparts' => ['group' => 'results', 'type' => 'list', 'default' => 'image,category,summary,badges,footer',
                'choices' => ['image', 'category', 'summary', 'badges', 'footer']],
            'listimage' => ['group' => 'results', 'type' => 'select', 'default' => 'md', 'choices' => ['sm', 'md', 'lg']],
            'statusbadges' => ['group' => 'results', 'type' => 'list', 'default' => 'enrolled,completed,new',
                'choices' => self::STATUS_BADGES],
            'progress' => ['group' => 'results', 'type' => 'bool', 'default' => '1'],
            'favourites' => ['group' => 'results', 'type' => 'bool', 'default' => '1'],
            'quickview' => ['group' => 'results', 'type' => 'bool', 'default' => '1'],
            'quickviewstyle' => ['group' => 'results', 'type' => 'select', 'default' => 'modal',
                'choices' => ['modal', 'drawer', 'fullscreen']],
            'skeletons' => ['group' => 'results', 'type' => 'bool', 'default' => '1'],
            'sharelink' => ['group' => 'results', 'type' => 'bool', 'default' => '1'],
            'defaultimage' => ['group' => 'results', 'type' => 'select', 'default' => 'auto',
                'choices' => self::DEFAULT_IMAGE_STYLES],
            // Catalogue header.
            'banner' => ['group' => 'banner', 'type' => 'bool', 'default' => '0'],
            'bannertitle' => ['group' => 'banner', 'type' => 'text', 'default' => ''],
            'bannertext' => ['group' => 'banner', 'type' => 'text', 'default' => ''],
            'bannerstyle' => ['group' => 'banner', 'type' => 'select', 'default' => '1',
                'choices' => ['1', '2', '3', '4', '5', '6']],
            // Page heading of the catalogue.
            'pageheading' => ['group' => 'header', 'type' => 'bool', 'default' => '1'],
            'pageheadingtext' => ['group' => 'header', 'type' => 'text', 'default' => ''],
            // Link to the catalogue in the top navigation bar, with an optional own text.
            'navlink' => ['group' => 'header', 'type' => 'bool', 'default' => '1'],
            'navlinktext' => ['group' => 'header', 'type' => 'text', 'default' => ''],
            // Button opening the blocks drawer (right): by default Moodle's grey button.
            'blockicon' => ['group' => 'header', 'type' => 'select', 'default' => 'sidebar',
                'choices' => array_keys(self::BLOCK_TOGGLE_ICONS)],
            'blockiconcolour' => ['group' => 'header', 'type' => 'select', 'default' => 'default',
                'choices' => array_merge(['default'], self::TOGGLE_COLOURS)],
            'blockiconsize' => ['group' => 'header', 'type' => 'select', 'default' => 'sm', 'choices' => ['sm', 'md', 'lg']],
            'blockiconposition' => ['group' => 'header', 'type' => 'select', 'default' => 'top',
                'choices' => ['top', 'upper', 'middle', 'lower', 'bottom']],
            // Course page of visitors and users not enrolled (enrolment page).
            'coursepage' => ['group' => 'coursepage', 'type' => 'bool', 'default' => '1'],
        ];
    }

    /**
     * The stored value of every feature, as strings (see the class description).
     *
     * @return string[] key => raw value
     */
    public static function get_raw(): array {
        $config = preview::get_all();
        $values = [];
        foreach (self::definitions() as $key => $definition) {
            $value = $config[self::PREFIX . $key] ?? null;
            $values[$key] = $value === null ? $definition['default'] : self::clean($key, (string) $value);
        }
        return $values;
    }

    /**
     * The value of every feature, typed: bool for switches, string[] for lists, string otherwise.
     *
     * @return array key => value
     */
    public static function get_all(): array {
        $values = [];
        foreach (self::get_raw() as $key => $value) {
            $values[$key] = self::decode($key, $value);
        }
        // The quick view leads to the course page: only offered to whoever can get there.
        if (!self::course_page_reachable()) {
            $values['quickview'] = false;
        }
        return $values;
    }

    /**
     * Whether the current visitor can reach a course page (the course, or Moodle's enrolment page when not enrolled):
     * logged in (guests too), or the site lets visitors in as guests (automatic guest login or the guest login button).
     * Anonymous visitors of other sites are sent to the login page instead.
     *
     * @return bool
     */
    public static function course_page_reachable(): bool {
        global $CFG;
        return isloggedin() || !empty($CFG->autologinguests) || !empty($CFG->guestloginbutton);
    }

    /**
     * The typed value of one feature.
     *
     * @param string $key
     * @return bool|string|string[]
     */
    public static function get(string $key) {
        return self::get_all()[$key];
    }

    /**
     * Typed value of a raw value.
     *
     * @param string $key
     * @param string $value
     * @return bool|string|string[]
     */
    private static function decode(string $key, string $value) {
        return match (self::definitions()[$key]['type']) {
            'bool' => $value === '1',
            'list' => $value === '' ? [] : explode(',', $value),
            default => $value,
        };
    }

    /**
     * A valid raw value: unknown choices are dropped (lists) or replaced by the default (selects).
     *
     * @param string $key
     * @param string $value
     * @return string
     */
    public static function clean(string $key, string $value): string {
        $definition = self::definitions()[$key];
        switch ($definition['type']) {
            case 'bool':
                return empty($value) ? '0' : '1';
            case 'select':
                return in_array($value, $definition['choices'], true) ? $value : $definition['default'];
            case 'list':
                return implode(',', card_config::clean_list(
                    explode(',', $value),
                    array_fill_keys($definition['choices'], true)
                ));
            default:
                return \core_text::substr(clean_param($value, PARAM_TEXT), 0, 255);
        }
    }

    /**
     * Save some features, logging the changes like the admin settings do.
     *
     * Breadcrumb settings ("bc_<setting>") are saved too: they are edited from the catalogue as well.
     *
     * @param array $values key => raw value (unknown keys are ignored)
     * @return string[] every feature and breadcrumb setting, key => saved raw value
     */
    public static function save(array $values): array {
        \theme_flexium\local\breadcrumbs::save($values);
        $definitions = self::definitions();
        foreach ($values as $key => $value) {
            if (!isset($definitions[$key])) {
                continue;
            }
            $name = self::PREFIX . $key;
            $value = self::clean($key, (string) $value);
            $old = get_config('theme_flexium', $name);
            if ($old !== $value) {
                set_config($name, $value, 'theme_flexium');
                add_to_config_log($name, $old === false ? null : $old, $value, 'theme_flexium');
            }
        }
        return self::get_raw() + \theme_flexium\local\breadcrumbs::get_raw();
    }

    /**
     * Label of a choice of a select or list feature.
     *
     * @param string $key feature
     * @param string $choice
     * @return string
     */
    public static function choice_label(string $key, string $choice): string {
        return match ($key) {
            'defaultsort' => get_string('sort_' . $choice, 'theme_flexium'),
            'quickfilters' => get_string('quick_' . $choice, 'theme_flexium'),
            'statusbadges' => get_string('status_' . $choice, 'theme_flexium'),
            'filtericoncolour', 'blockiconcolour' => get_string('colour_' . $choice, 'theme_flexium'),
            'blockiconsize' => get_string('filtericonsize_' . $choice, 'theme_flexium'),
            'blockiconposition' => get_string('filtericonposition_' . $choice, 'theme_flexium'),
            'bannerstyle' => get_string('palette', 'theme_flexium', $choice),
            'defaultimage' => is_numeric($choice) ? get_string('palette', 'theme_flexium', $choice)
                : get_string('defaultimage_' . $choice, 'theme_flexium'),
            default => get_string($key . '_' . $choice, 'theme_flexium'),
        };
    }

    /**
     * Definitions for the catalogue editor, with their labels, grouped as in the settings.
     *
     * @return array list of ['key', 'group', 'type', 'label', 'help', 'choices' => [['key', 'label']]]
     */
    public static function export_definitions(): array {
        $export = [];
        foreach (self::definitions() as $key => $definition) {
            $export[] = [
                'key' => $key,
                'group' => $definition['group'],
                'type' => $definition['type'],
                'label' => get_string('feature_' . $key, 'theme_flexium'),
                'help' => get_string('feature_' . $key . '_desc', 'theme_flexium'),
                'choices' => array_map(fn($choice) => ['key' => (string) $choice,
                    'label' => self::choice_label($key, (string) $choice)], $definition['choices'] ?? []),
            ];
        }
        return $export;
    }

    /**
     * Add the settings of every feature to an admin page (Catalogue features tab).
     *
     * @param \admin_settingpage $page
     */
    public static function add_settings(\admin_settingpage $page): void {
        $component = 'theme_flexium';
        $group = '';
        foreach (self::definitions() as $key => $definition) {
            if ($definition['group'] !== $group) {
                $group = $definition['group'];
                $page->add(new \admin_setting_heading(
                    "$component/featuregroup_$group",
                    get_string('featuregroup_' . $group, $component),
                    ''
                ));
            }
            $name = "$component/" . self::PREFIX . $key;
            $label = get_string('feature_' . $key, $component);
            $help = get_string('feature_' . $key . '_desc', $component);
            $choices = [];
            foreach ($definition['choices'] ?? [] as $choice) {
                $choices[$choice] = self::choice_label($key, (string) $choice);
            }
            $page->add(match ($definition['type']) {
                'bool' => new \admin_setting_configcheckbox($name, $label, $help, $definition['default']),
                'select' => new \admin_setting_configselect($name, $label, $help, $definition['default'], $choices),
                'list' => new \admin_setting_configmulticheckbox($name, $label, $help,
                    array_fill_keys(array_filter(explode(',', $definition['default'])), 1), $choices),
                default => new \admin_setting_configtext($name, $label, $help, $definition['default'], PARAM_TEXT),
            });
            if ($key === 'defaultimage') {
                $page->add(new \admin_setting_configstoredfile(
                    "$component/defaultcourseimage",
                    get_string('defaultcourseimage', $component),
                    get_string('defaultcourseimage_desc', $component),
                    'defaultcourseimage',
                    0,
                    ['accepted_types' => ['web_image']]
                ));
            }
        }
    }

    /**
     * Header image of a course without an image, as the "Header of courses without an image" feature says.
     *
     * @param int $courseid
     * @return string URL (or data URI for Moodle's generated pattern)
     */
    public static function default_course_image(int $courseid): string {
        global $OUTPUT;

        $style = self::get('defaultimage');
        if ($style === 'core') {
            return $OUTPUT->get_generated_image_for_id($courseid);
        }
        if ($style === 'custom') {
            $url = self::custom_image_url();
            if ($url !== null) {
                return $url;
            }
            $style = 'auto';
        }
        $number = $style === 'auto' ? $courseid % catalog::DEFAULT_IMAGES + 1 : (int) $style;
        return $OUTPUT->image_url('course/default' . $number, 'theme_flexium')->out(false);
    }

    /**
     * URL of the uploaded default header image (setting defaultcourseimage), null when there is none.
     *
     * The URL revision is the file's modification time, so a new upload is shown at once without resetting the theme
     * caches (setting_file_serve() ignores the revision when looking the file up).
     *
     * @return string|null
     */
    public static function custom_image_url(): ?string {
        $filepath = (string) get_config('theme_flexium', 'defaultcourseimage');
        if ($filepath === '') {
            return null;
        }
        $context = \core\context\system::instance();
        $file = get_file_storage()->get_file(
            $context->id,
            'theme_flexium',
            'defaultcourseimage',
            0,
            '/',
            ltrim($filepath, '/')
        );
        if (!$file) {
            return null;
        }
        return \core\url::make_pluginfile_url(
            $context->id,
            'theme_flexium',
            'defaultcourseimage',
            $file->get_timemodified(),
            '/',
            $file->get_filename()
        )->out(false);
    }

    /**
     * URLs of the six default headers (banner backgrounds and the editor's palette swatches), and of the uploaded
     * header image ("custom") when there is one.
     *
     * @return string[] number or "custom" => URL
     */
    public static function palette_images(): array {
        global $OUTPUT;

        $images = [];
        for ($number = 1; $number <= catalog::DEFAULT_IMAGES; $number++) {
            $images[(string) $number] = $OUTPUT->image_url('course/default' . $number, 'theme_flexium')->out(false);
        }
        $custom = self::custom_image_url();
        if ($custom !== null) {
            $images['custom'] = $custom;
        }
        return $images;
    }
}
