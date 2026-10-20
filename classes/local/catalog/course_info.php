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

use core\context\course as context_course;
use core\url;
use core_course\customfield\course_handler;
use core_course\external\course_summary_exporter;

/**
 * Public information of a course: the catalogue quick view and the course page of users not enrolled.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class course_info {
    /**
     * Export the information of a course the current user may see (the caller checks it).
     *
     * @param \stdClass $course course record
     * @return array see \theme_flexium\external\get_course_preview::execute_returns()
     */
    public static function export(\stdClass $course): array {
        $context = context_course::instance($course->id);
        $element = new \core_course_list_element($course);
        $image = course_summary_exporter::get_course_image($element) ?: features::default_course_image((int) $course->id);

        $contacts = [];
        foreach ($element->get_course_contacts() as $contact) {
            $contacts[] = ['name' => $contact['username'], 'role' => $contact['rolename']];
        }

        $fields = [];
        $fieldfacts = [];
        $sections = [];
        foreach (course_handler::create()->get_instance_data($course->id) as $data) {
            $field = $data->get_field();
            $type = $field->get('type');
            $visibility = $field->get_configdata_property('visibility') ?? course_handler::VISIBLETOALL;
            // Pictures (e.g. a second image) are not information; unticked checkboxes say nothing.
            if ($type === 'picture' || ($type === 'checkbox' && !$data->get_value())) {
                continue;
            }
            $value = (string) $data->export_value();
            if ((int) $visibility !== course_handler::VISIBLETOALL || trim(strip_tags($value)) === '') {
                continue;
            }
            $fields[] = ['name' => $field->get_formatted_name(), 'value' => $value];
            if ($type === 'textarea') {
                // Long texts (objectives, audience...) are sections under the summary, not facts.
                $sections[] = ['key' => 'customfield:' . $field->get('shortname'), 'label' => $field->get_formatted_name(),
                    'value' => $value];
                continue;
            }
            $fieldfacts[] = [
                'key' => 'customfield:' . $field->get('shortname'),
                'icon' => self::field_icon($field->get('shortname') . ' ' . $field->get('name')),
                'label' => $field->get_formatted_name(),
                'value' => $value,
            ];
        }

        $category = \core_course_category::get($course->category, IGNORE_MISSING, true);
        $dateformat = get_string('strftimedate', 'langconfig');

        // Facts shown as rows with an icon (as on UN e-learning portals): dates, teachers, then the custom fields.
        $facts = [];
        if ($course->startdate || $course->enddate) {
            $dates = array_filter([$course->startdate ? userdate($course->startdate, $dateformat) : '',
                $course->enddate ? userdate($course->enddate, $dateformat) : '']);
            $facts[] = ['key' => 'when', 'icon' => 'fa-regular fa-calendar-days',
                'label' => get_string('courseinfo_when', 'theme_flexium'), 'value' => s(implode(' – ', $dates))];
        }
        if ($contacts) {
            $facts[] = ['key' => 'teachers', 'icon' => 'fa-solid fa-chalkboard-user',
                'label' => get_string('catalog_teachers', 'theme_flexium'),
                'value' => s(implode(', ', array_column($contacts, 'name')))];
        }
        $facts = array_merge($facts, $fieldfacts);
        [$summary, $summaryformat] = \core_external\util::format_text(
            (string) $course->summary,
            (int) $course->summaryformat,
            $context,
            'course',
            'summary',
            null
        );

        return [
            'id' => (int) $course->id,
            'fullname' => format_string($course->fullname, true, ['context' => $context]),
            'categoryname' => $category ? $category->get_formatted_name() : '',
            'image' => (string) $image,
            'summary' => (string) $summary,
            'summaryformat' => (int) $summaryformat,
            'startdate' => $course->startdate ? userdate($course->startdate, $dateformat) : '',
            'enddate' => $course->enddate ? userdate($course->enddate, $dateformat) : '',
            'contacts' => $contacts,
            'customfields' => $fields,
            'facts' => $facts,
            'sections' => $sections,
            'enrolled' => isloggedin() && !isguestuser() && is_enrolled($context, null, '', true),
            'url' => (new url('/course/view.php', ['id' => $course->id]))->out(false),
        ];
    }

    /** @var string[] Icon of a custom field, by a word of its short name or name (first match wins). */
    private const FIELD_ICONS = [
        'deadline|closing|registration' => 'fa-regular fa-pen-to-square',
        'where|location|place|venue|city|country' => 'fa-solid fa-location-dot',
        'language|lang|idioma' => 'fa-solid fa-globe',
        'duration|hours|length|effort|time' => 'fa-regular fa-clock',
        'contact|email|phone|mail' => 'fa-solid fa-phone-volume',
        'type|format|modality|mode|delivery' => 'fa-regular fa-file',
        'level|difficulty' => 'fa-solid fa-signal',
        'certificate|badge|credential' => 'fa-solid fa-award',
        'platform|provider|partner|organi' => 'fa-solid fa-building-columns',
        'date|start|end|when|session' => 'fa-regular fa-calendar-days',
        'cost|price|fee' => 'fa-solid fa-tag',
        'categor|topic|subject|theme|keyword|skill' => 'fa-solid fa-layer-group',
        'audience|target|who' => 'fa-solid fa-users',
    ];

    /**
     * Font Awesome icon for a custom field, guessed from its short name and name.
     *
     * @param string $text short name and name
     * @return string
     */
    public static function field_icon(string $text): string {
        $text = \core_text::strtolower($text);
        foreach (self::FIELD_ICONS as $words => $icon) {
            if (preg_match('/' . $words . '/', $text)) {
                return $icon;
            }
        }
        return 'fa-solid fa-circle-info';
    }
}
