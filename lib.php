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
 * Flexium theme callbacks.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/** File areas of the theme settings, served by theme_flexium_pluginfile(). */
const THEME_FLEXIUM_FILEAREAS = ['loginbackgroundimage', 'backgroundimage', 'defaultcourseimage'];

/**
 * Returns the main SCSS: the Boost default preset followed by the Flexium styles.
 *
 * @param theme_config $theme The theme config object.
 * @return string
 */
function theme_flexium_get_main_scss_content($theme): string {
    global $CFG;

    $scss = file_get_contents($CFG->dirroot . '/theme/boost/scss/preset/default.scss');
    $scss .= "\n" . file_get_contents($CFG->dirroot . '/theme/flexium/scss/flexium.scss');

    return $scss;
}

/**
 * SCSS prepended to the theme SCSS: the theme colours (see \theme_flexium\local\appearance).
 *
 * @param theme_config $theme The theme config object.
 * @return string
 */
function theme_flexium_get_pre_scss($theme): string {
    return \theme_flexium\local\appearance::get_pre_scss($theme);
}

/**
 * Serve the files of the theme settings (login and site background images, default course header).
 *
 * @param stdClass $course
 * @param stdClass $cm
 * @param context $context
 * @param string $filearea
 * @param array $args
 * @param bool $forcedownload
 * @param array $options
 * @return bool
 */
function theme_flexium_pluginfile($course, $cm, $context, $filearea, $args, $forcedownload, array $options = []) {
    if ($context->contextlevel == CONTEXT_SYSTEM && in_array($filearea, THEME_FLEXIUM_FILEAREAS, true)) {
        $theme = theme_config::load('flexium');
        if (!array_key_exists('cacheability', $options)) {
            $options['cacheability'] = 'public';
        }
        return $theme->setting_file_serve($filearea, $args, $forcedownload, $options);
    }
    send_file_not_found();
}

/**
 * Preferences of the catalogue, set with core_user_set_user_preferences: the open filter groups and the results view.
 *
 * @uses core_user::is_current_user
 * @return array[]
 */
function theme_flexium_user_preferences(): array {
    return [
        'theme_flexium_catalog_groups' => [
            'type' => PARAM_RAW,
            'null' => NULL_NOT_ALLOWED,
            'default' => '',
            'permissioncallback' => [core_user::class, 'is_current_user'],
        ],
        'theme_flexium_catalog_view' => [
            'type' => PARAM_ALPHA,
            'null' => NULL_NOT_ALLOWED,
            'default' => '',
            'choices' => ['', 'grid', 'list'],
            'permissioncallback' => [core_user::class, 'is_current_user'],
        ],
    ];
}
