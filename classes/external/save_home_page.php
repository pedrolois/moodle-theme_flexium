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
use core_external\external_value;
use theme_flexium\local\home\home;

/**
 * Web service saving the home page built in edit mode (site administrators).
 *
 * The page is sent as JSON: its sections have free-form settings (texts, lists of items) that are validated and
 * cleaned by \theme_flexium\local\home\home::clean().
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class save_home_page extends external_api {
    /**
     * Webservice parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'page' => new external_value(PARAM_RAW, 'The page as JSON: {template, sections: [{id, type, settings}]}'),
        ]);
    }

    /**
     * Save the home page.
     *
     * @param string $page JSON
     * @return string the saved page, cleaned, as JSON
     */
    public static function execute(string $page): string {
        $params = self::validate_parameters(self::execute_parameters(), ['page' => $page]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $decoded = json_decode($params['page'], true);
        if (!is_array($decoded)) {
            throw new \invalid_parameter_exception('The page is not valid JSON');
        }
        return json_encode(home::save($decoded));
    }

    /**
     * Webservice returns.
     *
     * @return external_value
     */
    public static function execute_returns(): external_value {
        return new external_value(PARAM_RAW, 'The saved page, cleaned, as JSON');
    }
}
