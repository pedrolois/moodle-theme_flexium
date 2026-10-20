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
use theme_flexium\local\catalog\card_config;
use theme_flexium\local\catalog\filter_config;

/**
 * Web service saving what the catalogue course cards show, edited by site administrators from the catalogue.
 *
 * Stores the same settings as the theme settings page (Course cards tab).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class save_card_layout extends external_api {
    /**
     * Webservice parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'showcategory' => new external_value(PARAM_BOOL, 'Show the course category'),
            'showsummary' => new external_value(PARAM_BOOL, 'Show the course summary'),
            'badges' => new external_multiple_structure(
                new external_value(PARAM_RAW_TRIMMED, 'Custom field or tag source key'),
                'Badges, in order'
            ),
            'footer' => new external_multiple_structure(
                new external_value(PARAM_RAW_TRIMMED, 'Footer item key'),
                'Card footer items, in order'
            ),
            'badgecolours' => new external_multiple_structure(
                self::colour_structure(),
                'Colour of the badges of each source',
                VALUE_DEFAULT,
                []
            ),
            'badgerows' => new external_value(PARAM_BOOL, 'One line of badges per source', VALUE_DEFAULT, false),
        ]);
    }

    /**
     * Colour of the badges of one source.
     *
     * @return external_single_structure
     */
    private static function colour_structure(): external_single_structure {
        return new external_single_structure([
            'source' => new external_value(PARAM_RAW_TRIMMED, 'Badge source key'),
            'colour' => new external_value(PARAM_ALPHA, 'Colour: ' . implode(', ', card_config::BADGE_COLOURS)),
        ]);
    }

    /**
     * Save the card settings.
     *
     * @param bool $showcategory
     * @param bool $showsummary
     * @param array $badges
     * @param array $footer
     * @param array $badgecolours
     * @param bool $badgerows
     * @return array the saved settings (unknown keys removed)
     */
    public static function execute(
        bool $showcategory,
        bool $showsummary,
        array $badges,
        array $footer,
        array $badgecolours = [],
        bool $badgerows = false
    ): array {
        $params = self::validate_parameters(
            self::execute_parameters(),
            compact('showcategory', 'showsummary', 'badges', 'footer', 'badgecolours', 'badgerows')
        );

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $values = [
            'cardshowcategory' => $params['showcategory'] ? '1' : '0',
            'cardshowsummary' => $params['showsummary'] ? '1' : '0',
            'cardbadges' => implode(',', card_config::clean_list($params['badges'], card_config::get_badge_choices())),
            'cardfooter' => implode(',', card_config::clean_list($params['footer'], card_config::get_footer_choices())),
            'cardbadgecolours' => card_config::encode_badge_colours($params['badgecolours']),
            'cardbadgerows' => $params['badgerows'] ? '1' : '0',
        ];
        foreach ($values as $name => $value) {
            $old = get_config('theme_flexium', $name);
            if ($old !== $value) {
                set_config($name, $value, 'theme_flexium');
                add_to_config_log($name, $old === false ? null : $old, $value, 'theme_flexium');
            }
        }

        return card_config::get_settings(filter_config::get_layout());
    }

    /**
     * Webservice returns.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'showcategory' => new external_value(PARAM_BOOL, 'Show the course category'),
            'showsummary' => new external_value(PARAM_BOOL, 'Show the course summary'),
            'badges' => new external_multiple_structure(new external_value(PARAM_RAW, 'Source key'), 'Badges'),
            'footer' => new external_multiple_structure(new external_value(PARAM_RAW, 'Footer item key'), 'Footer items'),
            'badgecolours' => new external_multiple_structure(self::colour_structure(), 'Colour of the badges of each source'),
            'badgerows' => new external_value(PARAM_BOOL, 'One line of badges per source'),
        ]);
    }
}
