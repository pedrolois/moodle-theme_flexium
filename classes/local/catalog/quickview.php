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

use core_course\customfield\course_handler;

/**
 * Which courses offer the catalogue quick view (the eye on the course cards).
 *
 * Each course decides with its custom field "Quick view in the catalogue" (created by the theme, visible to teachers
 * only): Automatic (default), Show or Hide. Automatic shows it when the course page is useful to the visitor: an
 * enrolment method is open to them (self enrolment, guest access, payment) or they are enrolled already.
 * In any case, visitors who cannot reach course pages at all never get it (features::course_page_reachable()).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class quickview {
    /** @var string Short name of the course custom field. */
    public const FIELD = 'flexium_quickview';

    /** @var int Field values (position of the option; 0 or empty = not set = automatic). */
    public const AUTOMATIC = 1;
    /** @var int Always show. */
    public const SHOW = 2;
    /** @var int Never show. */
    public const HIDE = 3;

    /** @var string[] Enrolment methods that make the course page useful as soon as they are enabled. */
    private const OPEN_WHEN_ENABLED = ['guest', 'fee', 'paypal'];

    /**
     * Create the course custom field (category "Flexium") if it does not exist yet. Called on install and upgrade.
     */
    public static function ensure_field(): void {
        global $DB;

        if ($DB->record_exists('customfield_field', ['shortname' => self::FIELD])) {
            return;
        }
        $handler = course_handler::create();
        $categoryname = get_string('pluginname', 'theme_flexium');
        $categoryid = $DB->get_field('customfield_category', 'id', ['component' => 'core_course', 'area' => 'course',
            'itemid' => 0, 'name' => $categoryname], IGNORE_MULTIPLE) ?: $handler->create_category($categoryname);

        $category = \core_customfield\category_controller::create($categoryid);
        $field = \core_customfield\field_controller::create(0, (object) ['type' => 'select'], $category);
        $options = implode("\n", [
            get_string('quickviewfield_automatic', 'theme_flexium'),
            get_string('quickviewfield_show', 'theme_flexium'),
            get_string('quickviewfield_hide', 'theme_flexium'),
        ]);
        $handler->save_field_configuration($field, (object) [
            'name' => get_string('quickviewfield', 'theme_flexium'),
            'shortname' => self::FIELD,
            'type' => 'select',
            'description' => get_string('quickviewfield_desc', 'theme_flexium'),
            'descriptionformat' => FORMAT_HTML,
            'configdata' => [
                'required' => 0,
                'uniquevalues' => 0,
                'options' => $options,
                'defaultvalue' => get_string('quickviewfield_automatic', 'theme_flexium'),
                'locked' => 0,
                'visibility' => course_handler::VISIBLETOTEACHERS,
            ],
        ]);
    }

    /**
     * Whether the quick view is offered for each course, for the current user.
     *
     * @param int[] $courseids
     * @return bool[] course id => offered
     */
    public static function offered(array $courseids): array {
        global $DB;

        $result = array_fill_keys($courseids, false);
        if (!$courseids || !features::course_page_reachable()) {
            return $result;
        }

        // Course choice (the custom field), when set.
        $choices = [];
        $fieldid = $DB->get_field('customfield_field', 'id', ['shortname' => self::FIELD]);
        if ($fieldid) {
            [$insql, $params] = $DB->get_in_or_equal($courseids, SQL_PARAMS_NAMED);
            $params['fieldid'] = $fieldid;
            $choices = $DB->get_records_select_menu(
                'customfield_data',
                "fieldid = :fieldid AND instanceid $insql",
                $params,
                '',
                'instanceid, intvalue'
            );
        }

        $automatic = [];
        foreach ($courseids as $courseid) {
            $choice = (int) ($choices[$courseid] ?? 0);
            if ($choice === self::SHOW || $choice === self::HIDE) {
                $result[$courseid] = $choice === self::SHOW;
            } else {
                $automatic[] = $courseid;
            }
        }
        foreach ($automatic as $courseid) {
            $result[$courseid] = self::course_page_useful($courseid);
        }
        return $result;
    }

    /**
     * Automatic rule: the user is enrolled, or an enrolment method of the course is open to them.
     *
     * @param int $courseid
     * @return bool
     */
    public static function course_page_useful(int $courseid): bool {
        $context = \core\context\course::instance($courseid);
        if (isloggedin() && !isguestuser() && is_enrolled($context, null, '', true)) {
            return true;
        }
        $realuser = isloggedin() && !isguestuser();
        $plugins = enrol_get_plugins(true);
        foreach (enrol_get_instances($courseid, true) as $instance) {
            if (!isset($plugins[$instance->enrol])) {
                continue;
            }
            if (in_array($instance->enrol, self::OPEN_WHEN_ENABLED, true)) {
                return true;
            }
            // Visitors and guests cannot self enrol yet (they log in first): look at the instance itself.
            if ($instance->enrol === 'self' && !$realuser) {
                if (self::self_enrolment_open($instance)) {
                    return true;
                }
            } else if ($plugins[$instance->enrol]->show_enrolme_link($instance)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Whether a self enrolment instance accepts new enrolments now (dates, "Allow new enrolments").
     *
     * @param \stdClass $instance
     * @return bool
     */
    private static function self_enrolment_open(\stdClass $instance): bool {
        $now = time();
        return !empty($instance->customint6)
            && (empty($instance->enrolstartdate) || $instance->enrolstartdate <= $now)
            && (empty($instance->enrolenddate) || $instance->enrolenddate > $now);
    }
}
