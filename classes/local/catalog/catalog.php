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
 * Course catalogue query engine.
 *
 * Works on the set of courses the current user may see. Filters are OR within a group and AND
 * across groups. Every group gets faceted counts: how many courses each option would return
 * combined with the search and the other groups' selections.
 *
 * If the search text matches a filter option (for example a custom field value), that option is
 * ticked instead and the text is cleared, so the search becomes a visible, removable filter.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class catalog {
    /** @var string[] Accepted sort keys. */
    public const SORTS = ['name', 'startdate', 'enddate', 'latest', 'popularity'];

    /** @var int Maximum page size. */
    public const MAX_PERPAGE = 48;

    /** @var int[] Courses per page choices (settings, catalogue editor and visitors' selector). */
    public const PERPAGE_OPTIONS = [12, 24, 36, 48];

    /** @var int Headers for courses without an image (pix/course/default1.svg ... default6.svg). */
    public const DEFAULT_IMAGES = 6;

    /** @var float Minimum similarity (percent) for a search text to tick a filter option. */
    private const OPTION_MATCH_SIMILARITY = 85.0;

    /** @var array Admin layout: list of ['source' => key, 'expanded' => bool]. */
    private array $layout;

    /** @var array Available sources, keyed by source key. */
    private array $sources;

    /** @var \stdClass[] Visible courses keyed by id. */
    private array $courses = [];

    /** @var array courseid => [source => string[] option values]. */
    private array $values = [];

    /** @var array source => [value => label]. */
    private array $labels = [];

    /** @var string[] courseid => normalised text used by the free text search. */
    private array $searchtext = [];

    /** @var \stdClass[] Visible categories keyed by id (id, parent, name, path, sortorder, depth). */
    private array $categories = [];

    /** @var int[] courseid => number of active participants. */
    private array $participants = [];

    /** @var bool[] courseid => whether the quick view is offered (courses of the current page). */
    private array $quickviews = [];

    /** @var array|null Course ids of the current user: ['enrolled' => int[], 'favourite' => int[], 'completed' => int[]]. */
    private ?array $mine = null;

    /** @var int[]|null Ids of the courses with an enabled self or guest enrolment instance. */
    private ?array $openenrol = null;

    /** @var array courseid => list of ['name' => full name, 'image' => picture URL] (course contacts of the page). */
    private array $teachers = [];

    /**
     * Load the catalogue for the current user.
     */
    public function __construct() {
        $this->layout = filter_config::get_layout();
        $this->sources = filter_config::get_available_sources();
        $this->load_categories();
        $this->load_courses(self::get_course_data());
        $this->load_participants();
    }

    /**
     * Run a catalogue query.
     *
     * @param string $search free text
     * @param array $selected source key => list of selected option values
     * @param string $sort one of self::SORTS
     * @param int $page zero based page
     * @param int $perpage page size
     * @param string[] $quick selected quick filters (keys of features::QUICK_FILTERS)
     * @param int $startfrom only courses starting on or after this time, 0 for no limit
     * @param int $startto only courses starting before this time, 0 for no limit
     * @return array see \theme_flexium\external\get_catalog::execute_returns()
     */
    public function query(
        string $search,
        array $selected,
        string $sort,
        int $page,
        int $perpage,
        array $quick = [],
        int $startfrom = 0,
        int $startto = 0
    ): array {
        $quick = array_values(array_intersect(array_keys(features::QUICK_FILTERS), $quick));
        $selected = $this->clean_selection($selected);
        $search = trim($search);

        $autoselected = [];
        if ($search !== '') {
            $autoselected = $this->match_options($search);
            if ($autoselected) {
                foreach ($autoselected as $match) {
                    if (!in_array($match['value'], $selected[$match['source']] ?? [], true)) {
                        $selected[$match['source']][] = $match['value'];
                    }
                }
                $search = '';
            }
        }

        $allids = array_keys($this->courses);
        $textids = $search === '' ? $allids : $this->text_matches($search);
        if ($startfrom || $startto) {
            $textids = array_values(array_filter($textids, function ($id) use ($startfrom, $startto) {
                $start = (int) $this->courses[$id]->startdate;
                return (!$startfrom || $start >= $startfrom) && (!$startto || $start < $startto);
            }));
        }
        // Text, dates and quick filters restrict everything, filter group counts included.
        $basequick = $textids;
        foreach ($quick as $key) {
            $textids = array_values(array_intersect($textids, $this->quick_matches($key)));
        }

        $groupids = [];
        foreach ($selected as $source => $values) {
            $groupids[$source] = $this->group_matches($source, $values);
        }

        $resultids = $textids;
        foreach ($groupids as $ids) {
            $resultids = array_values(array_intersect($resultids, $ids));
        }

        $groups = [];
        foreach ($this->layout as $item) {
            $source = $item['source'];
            $base = $textids;
            foreach ($groupids as $other => $ids) {
                if ($other !== $source) {
                    $base = array_values(array_intersect($base, $ids));
                }
            }
            $groups[] = $this->export_group($item, $base, $selected[$source] ?? []);
        }

        // Quick filter counts: courses each one would leave, combined with everything else.
        $groupbase = $basequick;
        foreach ($groupids as $ids) {
            $groupbase = array_values(array_intersect($groupbase, $ids));
        }
        $quickexport = [];
        foreach (array_keys(features::QUICK_FILTERS) as $key) {
            $base = $groupbase;
            foreach ($quick as $other) {
                if ($other !== $key) {
                    $base = array_intersect($base, $this->quick_matches($other));
                }
            }
            $quickexport[] = [
                'key' => $key,
                'count' => count(array_intersect($base, $this->quick_matches($key))),
                'selected' => in_array($key, $quick, true),
            ];
        }

        $resultids = $this->sort($resultids, $sort);
        $perpage = max(1, min(self::MAX_PERPAGE, $perpage));
        $total = count($resultids);
        $page = max(0, min($page, (int) max(0, ceil($total / $perpage) - 1)));
        $pageids = array_slice($resultids, $page * $perpage, $perpage);
        if (array_intersect(card_config::TEACHER_ITEMS, card_config::get_footer())) {
            $this->load_teachers($pageids);
        }

        // Quick view (the eye) of the courses of this page: course choice, else whether the course page is useful.
        $this->quickviews = quickview::offered($pageids);

        return [
            'search' => $search,
            'total' => $total,
            'page' => $page,
            'perpage' => $perpage,
            'autoselected' => $autoselected,
            'selected' => $this->export_selection($selected),
            'courses' => array_map([$this, 'export_course'], $pageids),
            'groups' => $groups,
            'quick' => $quickexport,
        ];
    }

    /**
     * Load the course contacts (teachers, as set in Site administration > Appearance > Courses) of some courses,
     * with their pictures.
     *
     * @param int[] $ids course ids
     */
    private function load_teachers(array $ids): void {
        global $DB, $PAGE;

        if (!$ids) {
            return;
        }
        $records = [];
        foreach ($ids as $id) {
            $records[$id] = (object) ['id' => $id, 'category' => $this->courses[$id]->category];
        }
        \core_course_category::preload_course_contacts($records);

        $contacts = [];
        foreach ($records as $id => $record) {
            $contacts[$id] = (new \core_course_list_element($record))->get_course_contacts();
        }
        $userids = array_unique(array_merge([], ...array_map('array_keys', array_values($contacts))));
        if (!$userids) {
            return;
        }
        $users = $DB->get_records_list('user', 'id', $userids, '', implode(', ', \core_user\fields::get_picture_fields()));
        foreach ($contacts as $id => $list) {
            foreach ($list as $userid => $contact) {
                if (!isset($users[$userid])) {
                    continue;
                }
                $picture = new \core\output\user_picture($users[$userid]);
                $picture->size = 64;
                $this->teachers[$id][] = [
                    'name' => $contact['username'],
                    'image' => $picture->get_url($PAGE)->out(false),
                ];
            }
        }
    }

    /**
     * Courses of a quick filter.
     *
     * @param string $key one of features::QUICK_FILTERS
     * @return int[]
     */
    private function quick_matches(string $key): array {
        $now = time();
        $recent = features::RECENT_DAYS * DAYSECS;
        $mine = $this->get_mine();
        $ids = match ($key) {
            'mycourses' => $mine['enrolled'],
            'favourites' => $mine['favourite'],
            'openenrol' => $this->get_openenrol(),
            default => array_keys(array_filter(
                $this->courses,
                fn($course) => match ($key) {
                'new' => $course->timecreated >= $now - $recent,
                'startingsoon' => $course->startdate > $now && $course->startdate <= $now + $recent,
                'inprogress' => $course->startdate <= $now && (!$course->enddate || $course->enddate > $now),
                default => false,
                }
            )),
        };
        return array_values(array_intersect(array_keys($this->courses), $ids));
    }

    /**
     * Courses of the current user: enrolled (active), favourites and completed.
     *
     * @return array ['enrolled' => int[], 'favourite' => int[], 'completed' => int[]]
     */
    private function get_mine(): array {
        global $DB, $USER;

        if ($this->mine !== null) {
            return $this->mine;
        }
        $this->mine = ['enrolled' => [], 'favourite' => [], 'completed' => []];
        if (!isloggedin() || isguestuser()) {
            return $this->mine;
        }
        $this->mine['enrolled'] = array_map('intval', array_keys(enrol_get_my_courses('id')));
        $service = \core_favourites\service_factory::get_service_for_user_context(\core\context\user::instance($USER->id));
        $this->mine['favourite'] = array_map(
            fn($favourite) => (int) $favourite->itemid,
            array_values($service->find_favourites_by_type('core_course', 'courses'))
        );
        $this->mine['completed'] = array_map('intval', $DB->get_fieldset_select(
            'course_completions',
            'course',
            'userid = :userid AND timecompleted IS NOT NULL',
            ['userid' => $USER->id]
        ));
        return $this->mine;
    }

    /**
     * Courses anyone can join by themselves: an enabled guest access or self enrolment instance open now.
     *
     * @return int[]
     */
    private function get_openenrol(): array {
        global $DB;

        if ($this->openenrol === null) {
            $now = time();
            $sql = "SELECT DISTINCT courseid
                      FROM {enrol}
                     WHERE status = :enabled
                       AND (enrol = :guest
                            OR (enrol = :self AND customint6 = 1
                                AND (enrolstartdate = 0 OR enrolstartdate <= :now1)
                                AND (enrolenddate = 0 OR enrolenddate > :now2)))";
            $this->openenrol = array_map('intval', $DB->get_fieldset_sql($sql, ['enabled' => ENROL_INSTANCE_ENABLED,
                'guest' => 'guest', 'self' => 'self', 'now1' => $now, 'now2' => $now]));
        }
        return $this->openenrol;
    }

    /**
     * Load the categories the current user can see.
     */
    private function load_categories(): void {
        global $DB;

        $visible = \core_course_category::make_categories_list();
        if (!$visible) {
            return;
        }
        [$insql, $params] = $DB->get_in_or_equal(array_keys($visible), SQL_PARAMS_NAMED);
        $records = $DB->get_records_select(
            'course_categories',
            "id $insql",
            $params,
            'sortorder',
            'id, parent, name, path, sortorder, depth'
        );
        foreach ($records as $record) {
            $context = \core\context\coursecat::instance($record->id);
            // Shown by React, which escapes it: no escaping here (an "&" would show as "&amp;").
            $record->name = format_string($record->name, true, ['context' => $context, 'escape' => false]);
            $this->categories[$record->id] = $record;
        }
    }

    /**
     * Keep the courses the current user can see, with their filter values and search text.
     *
     * @param array $data see self::build_course_data()
     */
    private function load_courses(array $data): void {
        foreach ($data['courses'] as $id => $course) {
            if (!isset($this->categories[$course['category']])) {
                continue;
            }
            if (!$course['visible'] && !has_capability('moodle/course:viewhiddencourses', context_course::instance($id))) {
                continue;
            }
            $this->courses[$id] = (object) (['id' => $id] + $course);
            $this->searchtext[$id] = $data['searchtext'][$id];

            // Only sources that are still available (e.g. tags may have been disabled).
            $this->values[$id] = array_intersect_key($data['values'][$id] ?? [], $this->sources);

            // A course counts for its category and every ancestor, so tree counts add up.
            $path = explode('/', $this->categories[$course['category']]->path);
            $this->values[$id][filter_config::SOURCE_CATEGORY] =
                array_values(array_filter($path, fn($catid) => isset($this->categories[$catid])));
        }

        $this->labels = $data['labels'];
        foreach ($this->categories as $category) {
            $this->labels[filter_config::SOURCE_CATEGORY][(string) $category->id] = $category->name;
        }
    }

    /**
     * Count the active participants of the visible courses (kept out of the cache: enrolments change often).
     */
    private function load_participants(): void {
        global $DB;

        if (!$this->courses) {
            return;
        }
        [$insql, $params] = $DB->get_in_or_equal(array_keys($this->courses), SQL_PARAMS_NAMED);
        $sql = "SELECT e.courseid, COUNT(DISTINCT ue.userid) AS participants
                  FROM {user_enrolments} ue
                  JOIN {enrol} e ON e.id = ue.enrolid
                 WHERE e.courseid $insql AND e.status = :enrolenabled AND ue.status = :ueactive
              GROUP BY e.courseid";
        $params += ['enrolenabled' => ENROL_INSTANCE_ENABLED, 'ueactive' => ENROL_USER_ACTIVE];
        $this->participants = array_map('intval', $DB->get_records_sql_menu($sql, $params));
    }

    /**
     * The formatted data of every course in the current language, from the cache when possible.
     *
     * @return array see self::build_course_data()
     */
    public static function get_course_data(): array {
        $cache = \cache::make('theme_flexium', 'catalogdata');
        $key = current_language();
        $data = $cache->get($key);
        if ($data === false) {
            $data = self::build_course_data();
            $cache->set($key, $data);
        }
        return $data;
    }

    /**
     * Build the user independent data of every course: the expensive part of the catalogue.
     *
     * @return array [
     *     'courses' => [courseid => [category, shortname, displayname, plainsummary, startdate, enddate,
     *                   timecreated, visible]],
     *     'values' => [courseid => [source => string[] option values]] (tags and custom fields),
     *     'labels' => [source => [value => label]],
     *     'searchtext' => [courseid => normalised search text],
     * ]
     */
    public static function build_course_data(): array {
        global $DB;

        $data = ['courses' => [], 'values' => [], 'labels' => [], 'searchtext' => []];
        $records = $DB->get_records_select(
            'course',
            'id <> :siteid',
            ['siteid' => SITEID],
            'sortorder',
            'id, category, fullname, shortname, summary, summaryformat, startdate, enddate, timecreated, visible'
        );
        if (!$records) {
            return $data;
        }

        $text = [];
        foreach ($records as $course) {
            $context = context_course::instance($course->id);
            $displayname = format_string($course->fullname, true, ['context' => $context, 'escape' => false]);
            $plainsummary = self::plain_text((string) $course->summary, (int) $course->summaryformat);
            $data['courses'][$course->id] = [
                'category' => (int) $course->category,
                'shortname' => $course->shortname,
                'displayname' => $displayname,
                'plainsummary' => $plainsummary,
                'startdate' => (int) $course->startdate,
                'enddate' => (int) $course->enddate,
                'timecreated' => (int) $course->timecreated,
                'visible' => (bool) $course->visible,
            ];
            $data['values'][$course->id] = [];
            $text[$course->id] = [$displayname, $course->shortname, $plainsummary];
        }
        $ids = array_keys($data['courses']);

        $addvalue = function (int $courseid, string $source, string $value) use (&$data, &$text): void {
            $data['values'][$courseid][$source][] = $value;
            $data['labels'][$source][$value] = $value;
            $text[$courseid][] = $value;
        };

        foreach (\core_tag_tag::get_items_tags('core', 'course', $ids) as $courseid => $tags) {
            foreach ($tags as $tag) {
                $addvalue($courseid, filter_config::SOURCE_TAG, $tag->get_display_name(false));
            }
        }

        $handler = course_handler::create();
        foreach ($handler->get_instances_data($ids) as $courseid => $fields) {
            foreach ($fields as $fielddata) {
                $field = $fielddata->get_field();
                $visibility = $field->get_configdata_property('visibility') ?? course_handler::VISIBLETOALL;
                if ((int) $visibility !== course_handler::VISIBLETOALL) {
                    continue;
                }
                $options = self::field_option_values($fielddata);
                if ($options) {
                    $source = filter_config::CUSTOMFIELD_PREFIX . $field->get('shortname');
                    foreach ($options as $option) {
                        $addvalue($courseid, $source, $option);
                    }
                } else {
                    // Values that are not filter options are still searchable (e.g. textarea).
                    $text[$courseid][] = self::plain_text((string) $fielddata->export_value(), FORMAT_HTML);
                }
            }
        }

        foreach ($text as $courseid => $parts) {
            $data['searchtext'][$courseid] = self::normalise(implode(' ', $parts));
        }
        return $data;
    }

    /**
     * The option values a custom field data instance contributes.
     *
     * @param \core_customfield\data_controller $data
     * @return string[]
     */
    private static function field_option_values(\core_customfield\data_controller $data): array {
        $type = $data->get_field()->get('type');
        switch ($type) {
            case 'keywords':
                $keywords = json_decode((string) $data->get_value(), true);
                return is_array($keywords) ? array_values(array_filter(array_map('trim', $keywords), 'strlen')) : [];
            case 'checkbox':
                return [$data->get_value() ? get_string('yes') : get_string('no')];
            case 'date':
                $value = (int) $data->get_value();
                return $value ? [userdate($value, '%Y')] : [];
            case 'select':
            case 'text':
                $value = trim(strip_tags((string) $data->export_value()));
                return $value === '' ? [] : [$value];
            default:
                return [];
        }
    }

    /**
     * Keep only selections of sources shown in the layout, with known values.
     *
     * @param array $selected source => values
     * @return array source => string[]
     */
    private function clean_selection(array $selected): array {
        $shown = array_column($this->layout, 'source');
        $clean = [];
        foreach ($selected as $source => $values) {
            $known = in_array($source, $shown, true) || $source === filter_config::SOURCE_CATEGORY;
            if (!$known || !is_array($values)) {
                continue;
            }
            $values = array_values(array_unique(array_map('strval', $values)));
            $values = array_values(array_filter($values, fn($value) => isset($this->labels[$source][$value])));
            if ($values) {
                $clean[$source] = $values;
            }
        }
        return $clean;
    }

    /**
     * Filter options of the shown groups that match the search text closely enough to be ticked.
     *
     * @param string $search
     * @return array list of ['source' => key, 'value' => string, 'label' => string]
     */
    private function match_options(string $search): array {
        $needle = self::normalise($search);
        if (\core_text::strlen($needle) < 3) {
            return [];
        }
        $matches = [];
        foreach ($this->layout as $item) {
            $source = $item['source'];
            foreach ($this->labels[$source] ?? [] as $value => $label) {
                $candidate = self::normalise($label);
                similar_text($needle, $candidate, $percent);
                if ($candidate === $needle || $percent >= self::OPTION_MATCH_SIMILARITY) {
                    $matches[] = ['source' => $source, 'value' => (string) $value, 'label' => $label];
                }
            }
        }
        return $matches;
    }

    /**
     * Courses whose text contains every word of the search.
     *
     * @param string $search
     * @return int[]
     */
    private function text_matches(string $search): array {
        $words = preg_split('/\s+/u', self::normalise($search), -1, PREG_SPLIT_NO_EMPTY);
        $ids = [];
        foreach ($this->searchtext as $id => $text) {
            foreach ($words as $word) {
                if (!str_contains($text, $word)) {
                    continue 2;
                }
            }
            $ids[] = $id;
        }
        return $ids;
    }

    /**
     * Courses having at least one of the given option values.
     *
     * @param string $source
     * @param string[] $values
     * @return int[]
     */
    private function group_matches(string $source, array $values): array {
        $ids = [];
        foreach ($this->values as $id => $sources) {
            if (array_intersect($sources[$source] ?? [], $values)) {
                $ids[] = $id;
            }
        }
        return $ids;
    }

    /**
     * Export one filter group with faceted counts.
     *
     * @param array $item layout item
     * @param int[] $baseids courses matching everything except this group
     * @param string[] $selected selected values of this group
     * @return array
     */
    private function export_group(array $item, array $baseids, array $selected): array {
        $source = $item['source'];
        $counts = [];
        foreach ($baseids as $id) {
            foreach (array_unique($this->values[$id][$source] ?? []) as $value) {
                $counts[$value] = ($counts[$value] ?? 0) + 1;
            }
        }

        $options = [];
        if ($source === filter_config::SOURCE_CATEGORY) {
            foreach ($this->categories as $category) {
                $value = (string) $category->id;
                // Options without courses are kept: the client shows them when the feature asks for it.
                $count = $counts[$value] ?? 0;
                $options[] = [
                    'value' => $value,
                    'label' => $category->name,
                    'count' => $count,
                    'selected' => in_array($value, $selected, true),
                    'parent' => isset($this->categories[$category->parent]) ? (string) $category->parent : '',
                ];
            }
        } else {
            foreach ($this->ordered_values($source) as $value => $label) {
                $count = $counts[$value] ?? 0;
                $options[] = [
                    'value' => (string) $value,
                    'label' => $label,
                    'count' => $count,
                    'selected' => in_array((string) $value, $selected, true),
                    'parent' => '',
                ];
            }
        }

        return [
            'source' => $source,
            'type' => $this->sources[$source]['type'],
            'label' => ($item['label'] ?? '') !== '' ? $item['label'] : $this->sources[$source]['label'],
            'expanded' => $item['expanded'] || !empty($selected),
            'options' => $options,
        ];
    }

    /**
     * The known values of a source in display order: field order for selects, Yes/No, otherwise A-Z.
     *
     * @param string $source
     * @return array value => label
     */
    private function ordered_values(string $source): array {
        $labels = $this->labels[$source] ?? [];
        $field = $this->sources[$source]['field'] ?? null;
        if ($field && $field->get('type') === 'select' && method_exists($field, 'get_options')) {
            $ordered = [];
            foreach ($field->get_options() as $option) {
                $option = trim(strip_tags(format_string($option, true, ['escape' => false])));
                if (isset($labels[$option])) {
                    $ordered[$option] = $labels[$option];
                }
            }
            return $ordered + $labels;
        }
        if ($field && $field->get('type') === 'checkbox') {
            $ordered = [];
            foreach ([get_string('yes'), get_string('no')] as $option) {
                if (isset($labels[$option])) {
                    $ordered[$option] = $labels[$option];
                }
            }
            return $ordered;
        }
        \core_collator::asort($labels, \core_collator::SORT_NATURAL);
        return $labels;
    }

    /**
     * Sort course ids.
     *
     * @param int[] $ids
     * @param string $sort
     * @return int[]
     */
    private function sort(array $ids, string $sort): array {
        $names = [];
        foreach ($ids as $id) {
            $names[$id] = $this->courses[$id]->displayname;
        }
        \core_collator::asort($names, \core_collator::SORT_NATURAL);
        $rank = array_flip(array_keys($names));

        $key = match ($sort) {
            'startdate' => fn($id) => -(int) $this->courses[$id]->startdate,
            'enddate' => fn($id) => -(int) ($this->courses[$id]->enddate ?: 0),
            // Courses created in the same second: the newest (highest id) first.
            'latest' => fn($id) => [-(int) $this->courses[$id]->timecreated, -(int) $id],
            'popularity' => fn($id) => -($this->participants[$id] ?? 0),
            default => fn($id) => 0,
        };
        usort($ids, fn($a, $b) => [$key($a), $rank[$a]] <=> [$key($b), $rank[$b]]);
        return $ids;
    }

    /**
     * Export the effective selection.
     *
     * @param array $selected source => values
     * @return array list of ['source' => key, 'value' => string, 'label' => string]
     */
    private function export_selection(array $selected): array {
        $export = [];
        foreach ($selected as $source => $values) {
            foreach ($values as $value) {
                $export[] = ['source' => $source, 'value' => $value, 'label' => $this->labels[$source][$value] ?? $value];
            }
        }
        return $export;
    }

    /**
     * Export one course card.
     *
     * @param int $id
     * @return array
     */
    private function export_course(int $id): array {
        $course = $this->courses[$id];
        $element = new \core_course_list_element($course);
        $image = course_summary_exporter::get_course_image($element);
        if (!$image) {
            // A course without an image gets a header as the "Header of courses without an image" feature says.
            $image = features::default_course_image((int) $course->id);
        }
        $mine = $this->get_mine();
        $now = time();
        $recent = features::RECENT_DAYS * DAYSECS;

        $badges = [];
        foreach (card_config::get_badges($this->layout) as $source) {
            foreach (array_unique($this->values[$id][$source] ?? []) as $value) {
                $badges[] = ['source' => $source, 'label' => $this->labels[$source][$value] ?? $value,
                    'origin' => $this->badge_origin($source)];
            }
        }

        return [
            'id' => (int) $course->id,
            'fullname' => $course->displayname,
            'url' => (new url('/course/view.php', ['id' => $course->id]))->out(false),
            'summary' => card_config::show('summary') ? shorten_text($course->plainsummary, 220) : '',
            'image' => (string) $image,
            'categoryname' => card_config::show('category') ? ($this->categories[$course->category]->name ?? '') : '',
            'visible' => (bool) $course->visible,
            'badges' => array_slice($badges, 0, 6),
            'meta' => $this->export_meta($id),
            'quickview' => $this->quickviews[$id] ?? false,
            'enrolled' => in_array($id, $mine['enrolled'], true),
            'completed' => in_array($id, $mine['completed'], true),
            'favourite' => in_array($id, $mine['favourite'], true),
            'isnew' => $course->timecreated >= $now - $recent,
            'startingsoon' => $course->startdate > $now && $course->startdate <= $now + $recent,
            'progress' => in_array($id, $mine['enrolled'], true) ? $this->progress($id) : -1,
        ];
    }

    /**
     * Where the badges of a source come from, shown on hover: "Tag" or "Custom field: <name>".
     *
     * @param string $source
     * @return string
     */
    private function badge_origin(string $source): string {
        if ($source === filter_config::SOURCE_TAG) {
            return get_string('badge_tag', 'theme_flexium');
        }
        return get_string('badge_customfield', 'theme_flexium', $this->sources[$source]['label'] ?? $source);
    }

    /**
     * Completion progress of the current user in a course.
     *
     * @param int $id course id
     * @return int percentage, -1 when the course does not track completion
     */
    private function progress(int $id): int {
        $progress = \core_completion\progress::get_course_progress_percentage(get_course($id));
        return $progress === null ? -1 : (int) floor($progress);
    }

    /**
     * The footer items of a course card, as configured in the theme settings.
     *
     * @param int $id course id
     * @return array list of ['key' => item, 'icon' => Font Awesome classes, 'text' => formatted text]
     */
    private function export_meta(int $id): array {
        $course = $this->courses[$id];
        $dateformat = get_string('strftimedate', 'langconfig');
        $meta = [];
        foreach (card_config::get_footer() as $item) {
            $text = match ($item) {
                'startdate' => $course->startdate
                    ? get_string('catalog_starts', 'theme_flexium', userdate($course->startdate, $dateformat)) : '',
                'enddate' => $course->enddate
                    ? get_string('catalog_ends', 'theme_flexium', userdate($course->enddate, $dateformat)) : '',
                'participants' => get_string('catalog_participants', 'theme_flexium',
                    format_float($this->participants[$id] ?? 0, 0)),
                'shortname' => format_string($course->shortname, true, ['context' => context_course::instance($id),
                    'escape' => false]),
                'teachers', 'teachernames', 'teacherphotos' => implode(', ', array_column($this->teachers[$id] ?? [], 'name')),
                default => implode(', ', array_map(
                    fn($value) => $this->labels[$item][$value] ?? $value,
                    $this->values[$id][$item] ?? []
                )),
            };
            if ($text === '') {
                continue;
            }
            $meta[] = [
                'key' => $item,
                'icon' => card_config::FOOTER_ITEMS[$item] ?? card_config::FIELD_ICON,
                'label' => isset(card_config::FOOTER_ITEMS[$item])
                    ? get_string('cardfooter_' . $item, 'theme_flexium')
                    : $this->sources[$item]['label'],
                'text' => $text,
                // Teachers: the people, so the card shows their photos and/or names.
                'people' => in_array($item, card_config::TEACHER_ITEMS, true) ? ($this->teachers[$id] ?? []) : [],
            ];
        }
        return $meta;
    }

    /**
     * Formatted text as a single line of plain text.
     *
     * Filtered in the system context: language filters still apply, but not the course ones such as activity
     * names auto-linking, whose links are lost anyway and which would build the course modules cache of every
     * course of the catalogue (slow, and concurrent requests failed waiting for its lock).
     *
     * @param string $text
     * @param int $format
     * @return string
     */
    private static function plain_text(string $text, int $format): string {
        $text = format_text($text, $format, ['context' => \core\context\system::instance(), 'noclean' => false,
            'para' => false]);
        $text = html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return trim(preg_replace('/\s+/u', ' ', $text));
    }

    /**
     * Lower-case, accent-free text for comparisons.
     *
     * @param string $text
     * @return string
     */
    public static function normalise(string $text): string {
        return \core_text::strtolower(\core_text::specialtoascii($text));
    }
}
