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
use theme_flexium\local\catalog\features;

/**
 * Web service saving the optional catalogue features, switched on and off by site administrators from the catalogue.
 *
 * Stores the same settings as the theme settings page (Catalogue features tab).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class save_catalog_features extends external_api {
    /**
     * Webservice parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'features' => new external_multiple_structure(self::feature_structure(), 'Features to save'),
        ]);
    }

    /**
     * Save the features.
     *
     * @param array $features list of ['name' => key, 'value' => raw value]
     * @return array every feature with its saved value
     */
    public static function execute(array $features): array {
        $params = self::validate_parameters(self::execute_parameters(), ['features' => $features]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $saved = features::save(array_column($params['features'], 'value', 'name'));
        return array_map(fn($name, $value) => ['name' => $name, 'value' => $value], array_keys($saved), $saved);
    }

    /**
     * Webservice returns.
     *
     * @return external_multiple_structure
     */
    public static function execute_returns(): external_multiple_structure {
        return new external_multiple_structure(self::feature_structure(), 'Every feature with its saved value');
    }

    /**
     * One feature value.
     *
     * @return external_single_structure
     */
    private static function feature_structure(): external_single_structure {
        return new external_single_structure([
            'name' => new external_value(PARAM_ALPHANUMEXT, 'Feature key'),
            'value' => new external_value(PARAM_RAW, "Value: '1' or '0' for switches, a choice key for selects, "
                . 'a comma separated list for lists, text for texts'),
        ]);
    }
}
