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
use theme_flexium\local\margins;

/**
 * Web service saving the page margins (margins wand, edit mode, site administrators).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class save_page_margins extends external_api {
    /**
     * Webservice parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'margins' => new external_multiple_structure(self::item_structure(), 'Margins of each scope'),
        ]);
    }

    /**
     * Save the margins.
     *
     * @param array $margins
     * @return array the saved margins
     */
    public static function execute(array $margins): array {
        $params = self::validate_parameters(self::execute_parameters(), ['margins' => $margins]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $byscope = [];
        foreach ($params['margins'] as $item) {
            $byscope[$item['scope']] = [
                'left' => $item['left'],
                'right' => $item['right'],
                'footer' => $item['footer'],
                'navbar' => $item['navbar'],
            ];
        }
        $clean = margins::clean($byscope);
        $value = json_encode($clean);
        $old = get_config('theme_flexium', 'pagemargins');
        if ($old !== $value) {
            set_config('pagemargins', $value, 'theme_flexium');
            add_to_config_log('pagemargins', $old === false ? null : $old, $value, 'theme_flexium');
        }

        return self::export($clean);
    }

    /**
     * Margins as a list for the web service.
     *
     * @param array $margins scope => ['left' => int|null, 'right' => int|null]
     * @return array list of ['scope', 'left', 'right', 'footer', 'navbar'], -1 for the default
     */
    public static function export(array $margins): array {
        $list = [];
        foreach ($margins as $scope => $sides) {
            $list[] = [
                'scope' => $scope,
                'left' => $sides['left'] ?? -1,
                'right' => $sides['right'] ?? -1,
                'footer' => !empty($sides['footer']),
                'navbar' => !empty($sides['navbar']),
            ];
        }
        return $list;
    }

    /**
     * Webservice returns.
     *
     * @return external_multiple_structure
     */
    public static function execute_returns(): external_multiple_structure {
        return new external_multiple_structure(self::item_structure(), 'The saved margins');
    }

    /**
     * Structure of one scope.
     *
     * @return external_single_structure
     */
    private static function item_structure(): external_single_structure {
        return new external_single_structure([
            'scope' => new external_value(PARAM_ALPHA, 'site, home or catalog'),
            'left' => new external_value(PARAM_INT, 'Left margin in pixels, -1 for the default'),
            'right' => new external_value(PARAM_INT, 'Right margin in pixels, -1 for the default'),
            'footer' => new external_value(PARAM_BOOL, 'Whether the site footer takes the margins too', VALUE_DEFAULT, false),
            'navbar' => new external_value(
                PARAM_BOOL,
                'Whether the top navigation bar takes the margins too',
                VALUE_DEFAULT,
                false
            ),
        ]);
    }
}
