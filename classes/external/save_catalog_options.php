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
use core_external\external_single_structure;
use core_external\external_value;
use theme_flexium\local\catalog\catalog;

/**
 * Web service saving the catalogue page options (courses per page), edited by site administrators from the catalogue.
 *
 * Stores the same settings as the theme settings page (Course catalogue tab).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class save_catalog_options extends external_api {
    /**
     * Webservice parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'perpage' => new external_value(PARAM_INT, 'Default courses per page: ' . implode(', ', catalog::PERPAGE_OPTIONS)),
            'userperpage' => new external_value(PARAM_BOOL, 'Whether visitors can change the courses per page'),
            'filtersdraweropen' => new external_value(PARAM_BOOL, 'Whether the filters drawer starts open'),
        ]);
    }

    /**
     * Save the options.
     *
     * @param int $perpage
     * @param bool $userperpage
     * @param bool $filtersdraweropen
     * @return array the saved options
     */
    public static function execute(int $perpage, bool $userperpage, bool $filtersdraweropen): array {
        $params = self::validate_parameters(
            self::execute_parameters(),
            compact('perpage', 'userperpage', 'filtersdraweropen')
        );

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $values = [
            'perpage' => (string) (in_array($params['perpage'], catalog::PERPAGE_OPTIONS, true)
                ? $params['perpage'] : catalog::PERPAGE_OPTIONS[0]),
            'userperpage' => $params['userperpage'] ? '1' : '0',
            'filtersdraweropen' => $params['filtersdraweropen'] ? '1' : '0',
        ];
        foreach ($values as $name => $value) {
            $old = get_config('theme_flexium', $name);
            if ($old !== $value) {
                set_config($name, $value, 'theme_flexium');
                add_to_config_log($name, $old === false ? null : $old, $value, 'theme_flexium');
            }
        }

        return [
            'perpage' => (int) $values['perpage'],
            'userperpage' => (bool) $values['userperpage'],
            'filtersdraweropen' => (bool) $values['filtersdraweropen'],
        ];
    }

    /**
     * Webservice returns.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'perpage' => new external_value(PARAM_INT, 'Default courses per page'),
            'userperpage' => new external_value(PARAM_BOOL, 'Whether visitors can change the courses per page'),
            'filtersdraweropen' => new external_value(PARAM_BOOL, 'Whether the filters drawer starts open'),
        ]);
    }
}
