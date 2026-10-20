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
 * Flexium web services.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$functions = [
    'theme_flexium_get_catalog' => [
        'classname' => \theme_flexium\external\get_catalog::class,
        'description' => 'Search and filter the course catalogue, with faceted filter counts.',
        'type' => 'read',
        'ajax' => true,
        'loginrequired' => false,
        'readonlysession' => true,
        'services' => [MOODLE_OFFICIAL_MOBILE_SERVICE],
    ],
    'theme_flexium_save_filter_layout' => [
        'classname' => \theme_flexium\external\save_filter_layout::class,
        'description' => 'Save the catalogue filter layout (site administrators).',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'moodle/site:config',
    ],
    'theme_flexium_save_catalog_options' => [
        'classname' => \theme_flexium\external\save_catalog_options::class,
        'description' => 'Save the catalogue page options, such as the courses per page (site administrators).',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'moodle/site:config',
    ],
    'theme_flexium_get_course_preview' => [
        'classname' => \theme_flexium\external\get_course_preview::class,
        'description' => 'Public information of a course for the catalogue quick view.',
        'type' => 'read',
        'ajax' => true,
        'loginrequired' => false,
        'readonlysession' => true,
    ],
    'theme_flexium_save_catalog_features' => [
        'classname' => \theme_flexium\external\save_catalog_features::class,
        'description' => 'Switch the optional catalogue features on and off (site administrators).',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'moodle/site:config',
    ],
    'theme_flexium_get_home_data' => [
        'classname' => \theme_flexium\external\get_home_data::class,
        'description' => 'Categories, site figures and news for the home page sections.',
        'type' => 'read',
        'ajax' => true,
        'loginrequired' => false,
        'readonlysession' => true,
    ],
    'theme_flexium_save_home_page' => [
        'classname' => \theme_flexium\external\save_home_page::class,
        'description' => 'Save the home page built in edit mode (site administrators).',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'moodle/site:config',
    ],
    'theme_flexium_save_footer' => [
        'classname' => \theme_flexium\external\save_footer::class,
        'description' => 'Save the footer built in edit mode (site administrators).',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'moodle/site:config',
    ],
    'theme_flexium_save_card_layout' => [
        'classname' => \theme_flexium\external\save_card_layout::class,
        'description' => 'Save what the catalogue course cards show (site administrators).',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'moodle/site:config',
    ],
    'theme_flexium_save_page_margins' => [
        'classname' => \theme_flexium\external\save_page_margins::class,
        'description' => 'Save the left and right page margins of the site, home page and catalogue (site administrators).',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'moodle/site:config',
    ],
    'theme_flexium_save_default_image' => [
        'classname' => \theme_flexium\external\save_default_image::class,
        'description' => 'Store the uploaded default header image of course cards (site administrators).',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'moodle/site:config',
    ],
];
