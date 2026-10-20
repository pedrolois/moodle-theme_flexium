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
use theme_flexium\local\catalog\catalog;
use theme_flexium\local\catalog\features;
use theme_flexium\local\catalog\preview;

/**
 * Web service returning one page of the course catalogue, with faceted filter groups.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class get_catalog extends external_api {
    /**
     * Webservice parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'search' => new external_value(PARAM_TEXT, 'Free text search', VALUE_DEFAULT, ''),
            'filters' => new external_multiple_structure(
                new external_single_structure([
                    'source' => new external_value(PARAM_RAW_TRIMMED, 'Filter source key'),
                    'values' => new external_multiple_structure(
                        new external_value(PARAM_TEXT, 'Selected option value'),
                    ),
                ]),
                'Selected filter options',
                VALUE_DEFAULT,
                [],
            ),
            'sort' => new external_value(
                PARAM_ALPHA,
                'Sort key: ' . implode(', ', catalog::SORTS),
                VALUE_DEFAULT,
                'name'
            ),
            'page' => new external_value(PARAM_INT, 'Zero based page number', VALUE_DEFAULT, 0),
            'perpage' => new external_value(PARAM_INT, 'Courses per page', VALUE_DEFAULT, 12),
            'quick' => new external_multiple_structure(
                new external_value(PARAM_ALPHA, 'Quick filter: ' . implode(', ', array_keys(features::QUICK_FILTERS))),
                'Selected quick filters (all must match)',
                VALUE_DEFAULT,
                [],
            ),
            'startfrom' => new external_value(
                PARAM_INT,
                'Courses starting on or after this timestamp, 0 for any',
                VALUE_DEFAULT,
                0
            ),
            'startto' => new external_value(PARAM_INT, 'Courses starting before this timestamp, 0 for any', VALUE_DEFAULT, 0),
            'preview' => new external_value(PARAM_RAW, 'Site administrators, catalogue editor: unsaved settings as JSON '
                . '{features, card, layout}, used for this request only', VALUE_DEFAULT, ''),
        ]);
    }

    /**
     * Query the catalogue.
     *
     * @param string $search
     * @param array $filters
     * @param string $sort
     * @param int $page
     * @param int $perpage
     * @param string[] $quick
     * @param int $startfrom
     * @param int $startto
     * @param string $preview
     * @return array
     */
    public static function execute(
        string $search = '',
        array $filters = [],
        string $sort = 'name',
        int $page = 0,
        int $perpage = 12,
        array $quick = [],
        int $startfrom = 0,
        int $startto = 0,
        string $preview = ''
    ): array {
        global $CFG, $PAGE;

        $params = self::validate_parameters(
            self::execute_parameters(),
            compact('search', 'filters', 'sort', 'page', 'perpage', 'quick', 'startfrom', 'startto', 'preview')
        );

        // The function is available without login so visitors can browse the catalogue,
        // unless the site forces login. validate_context() would call require_login(), so visitors
        // only get the page context set (what is shown is limited by the visibility checks).
        if (isloggedin()) {
            self::validate_context(context_system::instance());
        } else if (!empty($CFG->forcelogin)) {
            throw new \require_login_exception('forcelogin');
        } else {
            $PAGE->set_context(context_system::instance());
        }

        $selected = [];
        foreach ($params['filters'] as $filter) {
            $selected[$filter['source']] = array_merge($selected[$filter['source']] ?? [], $filter['values']);
        }
        $sort = in_array($params['sort'], catalog::SORTS, true) ? $params['sort'] : 'name';

        // Live preview of the catalogue editor: unsaved settings, for site administrators only.
        $draft = $params['preview'] !== '' ? json_decode($params['preview'], true) : null;
        if (is_array($draft) && isloggedin() && has_capability('moodle/site:config', context_system::instance())) {
            preview::start($draft);
        }
        try {
            return (new catalog())->query(
                $params['search'],
                $selected,
                $sort,
                $params['page'],
                $params['perpage'],
                $params['quick'],
                max(0, $params['startfrom']),
                max(0, $params['startto'])
            );
        } finally {
            preview::stop();
        }
    }

    /**
     * Webservice returns.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        $selection = new external_single_structure([
            'source' => new external_value(PARAM_RAW, 'Filter source key'),
            'value' => new external_value(PARAM_RAW, 'Option value'),
            'label' => new external_value(PARAM_RAW, 'Option label'),
        ]);

        return new external_single_structure([
            'search' => new external_value(PARAM_RAW, 'Effective search text (empty when it became a filter)'),
            'total' => new external_value(PARAM_INT, 'Number of matching courses'),
            'page' => new external_value(PARAM_INT, 'Effective zero based page'),
            'perpage' => new external_value(PARAM_INT, 'Effective page size'),
            'autoselected' => new external_multiple_structure($selection, 'Options ticked because the search matched them'),
            'selected' => new external_multiple_structure($selection, 'Effective selection'),
            'courses' => new external_multiple_structure(new external_single_structure([
                'id' => new external_value(PARAM_INT, 'Course id'),
                'fullname' => new external_value(PARAM_RAW, 'Formatted course name'),
                'url' => new external_value(PARAM_URL, 'Course URL'),
                'summary' => new external_value(PARAM_RAW, 'Plain text summary, shortened'),
                'image' => new external_value(PARAM_RAW, 'Course image URL or data URI'),
                'categoryname' => new external_value(PARAM_RAW, 'Formatted category name, empty when hidden'),
                'visible' => new external_value(PARAM_BOOL, 'Whether the course is visible to students'),
                'badges' => new external_multiple_structure(new external_single_structure([
                    'source' => new external_value(PARAM_RAW, 'Custom field or tag source key'),
                    'label' => new external_value(PARAM_RAW, 'Custom field or tag value'),
                    'origin' => new external_value(PARAM_RAW, 'Where it comes from: "Tag" or "Custom field: name"'),
                ])),
                'meta' => new external_multiple_structure(new external_single_structure([
                    'key' => new external_value(PARAM_RAW, 'Footer item: startdate, enddate, participants, shortname or a '
                        . 'custom field source key'),
                    'icon' => new external_value(PARAM_RAW, 'Font Awesome classes'),
                    'label' => new external_value(PARAM_RAW, 'Item name, for assistive technology'),
                    'text' => new external_value(PARAM_RAW, 'Formatted text'),
                    'people' => new external_multiple_structure(new external_single_structure([
                        'name' => new external_value(PARAM_RAW, 'Full name'),
                        'image' => new external_value(PARAM_URL, 'Picture URL'),
                    ]), 'Teacher items: the course contacts'),
                ]), 'Card footer items, as configured in the theme settings'),
                'quickview' => new external_value(
                    PARAM_BOOL,
                    'Whether the course offers the quick view (course choice, else an enrolment method open to the user)'
                ),
                'enrolled' => new external_value(PARAM_BOOL, 'Whether the current user is enrolled (active)'),
                'completed' => new external_value(PARAM_BOOL, 'Whether the current user completed the course'),
                'favourite' => new external_value(PARAM_BOOL, 'Whether the course is a favourite of the current user'),
                'isnew' => new external_value(PARAM_BOOL, 'Whether the course was created recently'),
                'startingsoon' => new external_value(PARAM_BOOL, 'Whether the course starts soon'),
                'progress' => new external_value(PARAM_INT, 'Completion progress of the current user, -1 for none'),
            ])),
            'groups' => new external_multiple_structure(new external_single_structure([
                'source' => new external_value(PARAM_RAW, 'Filter source key'),
                'type' => new external_value(PARAM_ALPHA, 'tree or list'),
                'label' => new external_value(PARAM_RAW, 'Group label'),
                'expanded' => new external_value(PARAM_BOOL, 'Whether the group starts expanded'),
                'options' => new external_multiple_structure(new external_single_structure([
                    'value' => new external_value(PARAM_RAW, 'Option value'),
                    'label' => new external_value(PARAM_RAW, 'Option label'),
                    'count' => new external_value(PARAM_INT, 'Courses for this option given the other filters'),
                    'selected' => new external_value(PARAM_BOOL, 'Whether the option is selected'),
                    'parent' => new external_value(PARAM_RAW, 'Parent option value (category tree), empty at the top'),
                ])),
            ])),
            'quick' => new external_multiple_structure(new external_single_structure([
                'key' => new external_value(PARAM_ALPHA, 'Quick filter key'),
                'count' => new external_value(PARAM_INT, 'Courses for this quick filter given the other filters'),
                'selected' => new external_value(PARAM_BOOL, 'Whether the quick filter is selected'),
            ]), 'Quick filters'),
        ]);
    }
}
