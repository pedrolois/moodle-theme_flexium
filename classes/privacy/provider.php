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

namespace theme_flexium\privacy;

use core_privacy\local\metadata\collection;
use core_privacy\local\request\writer;

/**
 * Privacy provider: the theme only stores two catalogue preferences per user (open filter groups, results view).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class provider implements
    \core_privacy\local\metadata\provider,
    \core_privacy\local\request\user_preference_provider {
    /** @var string[] Preference name => language string of its description. */
    private const PREFERENCES = [
        'theme_flexium_catalog_groups' => 'privacy:metadata:preference:cataloggroups',
        'theme_flexium_catalog_view' => 'privacy:metadata:preference:catalogview',
    ];

    /**
     * Describe the stored preferences.
     *
     * @param collection $collection
     * @return collection
     */
    public static function get_metadata(collection $collection): collection {
        foreach (self::PREFERENCES as $name => $description) {
            $collection->add_user_preference($name, $description);
        }
        // Only when an administrator chooses a Google font and leaves "Load fonts from Google Fonts" on: browsers then
        // request the fonts from Google, which receives the user's IP address.
        $collection->add_external_location_link(
            'googlefonts',
            ['ipaddress' => 'privacy:metadata:googlefonts:ipaddress'],
            'privacy:metadata:googlefonts'
        );
        return $collection;
    }

    /**
     * Export the preferences of a user.
     *
     * @param int $userid
     */
    public static function export_user_preferences(int $userid) {
        foreach (self::PREFERENCES as $name => $description) {
            $value = get_user_preferences($name, null, $userid);
            if ($value !== null && $value !== '') {
                writer::export_user_preference(
                    'theme_flexium',
                    $name,
                    $value,
                    get_string($description, 'theme_flexium')
                );
            }
        }
    }
}
