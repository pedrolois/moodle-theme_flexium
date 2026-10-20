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

use core\context\course as context_course;
use core\context\system as context_system;
use core_external\external_api;
use core_external\external_format_value;
use core_external\external_function_parameters;
use core_external\external_multiple_structure;
use core_external\external_single_structure;
use core_external\external_value;
use theme_flexium\local\catalog\course_info;

/**
 * Web service returning what the catalogue quick view shows about a course: full summary, teachers, custom fields.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class get_course_preview extends external_api {
    /**
     * Webservice parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'Course id'),
        ]);
    }

    /**
     * Preview of a course the current user (or visitor) may see in the catalogue.
     *
     * @param int $courseid
     * @return array
     */
    public static function execute(int $courseid): array {
        global $CFG, $DB, $PAGE;

        $params = self::validate_parameters(self::execute_parameters(), ['courseid' => $courseid]);

        // Same access as the catalogue: visitors may browse unless the site forces login.
        if (isloggedin()) {
            self::validate_context(context_system::instance());
        } else if (!empty($CFG->forcelogin)) {
            throw new \require_login_exception('forcelogin');
        } else {
            $PAGE->set_context(context_system::instance());
        }

        $course = $DB->get_record('course', ['id' => $params['courseid']], '*', MUST_EXIST);
        if (
            $course->id == SITEID || !\core_course_category::can_view_course_info($course)
                || !\theme_flexium\local\catalog\quickview::offered([(int) $course->id])[(int) $course->id]
        ) {
            throw new \required_capability_exception(
                context_course::instance($course->id),
                'moodle/course:view',
                'nopermissions',
                ''
            );
        }

        return course_info::export($course);
    }

    /**
     * Webservice returns.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Course id'),
            'fullname' => new external_value(PARAM_RAW, 'Formatted course name'),
            'categoryname' => new external_value(PARAM_RAW, 'Formatted category name'),
            'image' => new external_value(PARAM_RAW, 'Course image URL or data URI'),
            'summary' => new external_value(PARAM_RAW, 'Formatted summary'),
            'summaryformat' => new external_format_value('summary'),
            'startdate' => new external_value(PARAM_RAW, 'Formatted start date, empty for none'),
            'enddate' => new external_value(PARAM_RAW, 'Formatted end date, empty for none'),
            'contacts' => new external_multiple_structure(new external_single_structure([
                'name' => new external_value(PARAM_RAW, 'Full name'),
                'role' => new external_value(PARAM_RAW, 'Role name'),
            ]), 'Course contacts (e.g. teachers)'),
            'customfields' => new external_multiple_structure(new external_single_structure([
                'name' => new external_value(PARAM_RAW, 'Field name'),
                'value' => new external_value(PARAM_RAW, 'Formatted value'),
            ]), 'Custom fields visible to everyone'),
            'facts' => new external_multiple_structure(new external_single_structure([
                'key' => new external_value(PARAM_RAW, 'when, teachers or customfield:<shortname>'),
                'icon' => new external_value(PARAM_RAW, 'Font Awesome classes'),
                'label' => new external_value(PARAM_RAW, 'Formatted label'),
                'value' => new external_value(PARAM_RAW, 'Formatted value (HTML)'),
            ]), 'Facts shown with an icon: dates, teachers and custom fields'),
            'sections' => new external_multiple_structure(new external_single_structure([
                'key' => new external_value(PARAM_RAW, 'customfield:<shortname>'),
                'label' => new external_value(PARAM_RAW, 'Formatted label'),
                'value' => new external_value(PARAM_RAW, 'Formatted text (HTML)'),
            ]), 'Long custom fields (text areas) shown as sections under the summary'),
            'enrolled' => new external_value(PARAM_BOOL, 'Whether the current user is enrolled (active)'),
            'url' => new external_value(PARAM_URL, 'Course URL (the enrolment page when not enrolled)'),
        ]);
    }
}
