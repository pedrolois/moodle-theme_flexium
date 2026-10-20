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
use theme_flexium\local\catalog\filter_config;

/**
 * Web service saving the catalogue filter layout, edited by site administrators from the catalogue drawer.
 *
 * Stores the same setting as the theme settings page (theme_flexium/catalogfilters).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class save_filter_layout extends external_api {
    /**
     * Webservice parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'layout' => new external_multiple_structure(self::item_structure(), 'Filter groups, in display order'),
        ]);
    }

    /**
     * Save the layout.
     *
     * @param array $layout
     * @return array the saved layout (unknown or duplicate sources removed)
     */
    public static function execute(array $layout): array {
        $params = self::validate_parameters(self::execute_parameters(), ['layout' => $layout]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $clean = filter_config::clean_layout($params['layout']);
        $value = json_encode($clean);
        $old = get_config('theme_flexium', 'catalogfilters');
        if ($old !== $value) {
            set_config('catalogfilters', $value, 'theme_flexium');
            add_to_config_log('catalogfilters', $old === false ? null : $old, $value, 'theme_flexium');
        }

        return $clean;
    }

    /**
     * Webservice returns.
     *
     * @return external_multiple_structure
     */
    public static function execute_returns(): external_multiple_structure {
        return new external_multiple_structure(self::item_structure(), 'The saved layout');
    }

    /**
     * Structure of one layout item.
     *
     * @return external_single_structure
     */
    private static function item_structure(): external_single_structure {
        return new external_single_structure([
            'source' => new external_value(PARAM_RAW_TRIMMED, 'Filter source key'),
            'expanded' => new external_value(PARAM_BOOL, 'Whether the group starts expanded'),
            'label' => new external_value(PARAM_TEXT, 'Custom name of the group, empty for the default', VALUE_DEFAULT, ''),
        ]);
    }
}
