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

namespace theme_flexium\external;

use core\context\system as context_system;
use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_multiple_structure;
use core_external\external_single_structure;
use core_external\external_value;
use theme_flexium\local\home\home;

/**
 * Web service returning the data of the dynamic home page sections: categories, site figures and news.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class get_home_data extends external_api {
    /**
     * Webservice parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([]);
    }

    /**
     * Data of the home page sections, for the current user or visitor.
     *
     * @return array
     */
    public static function execute(): array {
        global $CFG, $PAGE;

        // Same access as the site home: visitors may see it unless the site forces login.
        if (isloggedin()) {
            self::validate_context(context_system::instance());
        } else if (!empty($CFG->forcelogin)) {
            throw new \require_login_exception('forcelogin');
        } else {
            $PAGE->set_context(context_system::instance());
        }
        return home::get_data();
    }

    /**
     * Webservice returns.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'categories' => new external_multiple_structure(new external_single_structure([
                'id' => new external_value(PARAM_INT, 'Category id'),
                'name' => new external_value(PARAM_RAW, 'Formatted name'),
                'coursecount' => new external_value(PARAM_INT, 'Courses, subcategories included'),
                'url' => new external_value(PARAM_URL, 'Catalogue filtered by this category'),
            ]), 'Top level categories'),
            'stats' => new external_single_structure([
                'courses' => new external_value(PARAM_INT, 'Visible courses'),
                'users' => new external_value(PARAM_INT, 'Active users'),
                'categories' => new external_value(PARAM_INT, 'Visible categories'),
                'completions' => new external_value(PARAM_INT, 'Course completions'),
            ]),
            'news' => new external_multiple_structure(new external_single_structure([
                'title' => new external_value(PARAM_RAW, 'Formatted subject'),
                'url' => new external_value(PARAM_URL, 'Discussion URL'),
                'date' => new external_value(PARAM_RAW, 'Formatted date'),
            ]), 'Latest site announcements'),
        ]);
    }
}
