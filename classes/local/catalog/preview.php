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

/**
 * Live preview of the catalogue editor: for one request, unsaved settings (draft) take the place of the saved ones,
 * so the catalogue is computed as it will look once saved. Nothing is stored.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class preview {
    /** @var array|null Plugin config names => draft values, null when not previewing. */
    private static ?array $config = null;

    /**
     * A plugin setting: the draft value while previewing, else the saved one.
     *
     * @param string $name
     * @return mixed false when unset, like get_config()
     */
    public static function get(string $name) {
        if (self::$config !== null && array_key_exists($name, self::$config)) {
            return self::$config[$name];
        }
        return get_config('theme_flexium', $name);
    }

    /**
     * Every plugin setting, with the draft values on top while previewing.
     *
     * @return array name => value
     */
    public static function get_all(): array {
        return (self::$config ?? []) + (array) get_config('theme_flexium');
    }

    /**
     * Start previewing a draft of the catalogue editor (site administrators only, checked by the caller).
     *
     * @param array $draft ['features' => key => raw value, 'card' => card settings, 'layout' => filter layout]
     */
    public static function start(array $draft): void {
        $config = [];
        foreach ((array) ($draft['features'] ?? []) as $key => $value) {
            $key = (string) $key;
            if (isset(features::definitions()[$key]) && is_scalar($value)) {
                $config[features::PREFIX . $key] = features::clean($key, (string) $value);
            }
        }
        if (isset($draft['card']) && is_array($draft['card'])) {
            $card = $draft['card'];
            $config['cardshowcategory'] = empty($card['showcategory']) ? '0' : '1';
            $config['cardshowsummary'] = empty($card['showsummary']) ? '0' : '1';
            $config['cardbadges'] = implode(',', card_config::clean_list(
                (array) ($card['badges'] ?? []),
                card_config::get_badge_choices()
            ));
            $config['cardfooter'] = implode(',', card_config::clean_list(
                (array) ($card['footer'] ?? []),
                card_config::get_footer_choices()
            ));
            $config['cardbadgecolours'] = card_config::encode_badge_colours(array_filter(
                (array) ($card['badgecolours'] ?? []),
                fn($item) => is_array($item) && isset($item['source'], $item['colour'])
            ));
            $config['cardbadgerows'] = empty($card['badgerows']) ? '0' : '1';
        }
        if (isset($draft['layout']) && is_array($draft['layout'])) {
            $config['catalogfilters'] = json_encode(filter_config::clean_layout($draft['layout']));
        }
        self::$config = $config;
    }

    /**
     * Stop previewing.
     */
    public static function stop(): void {
        self::$config = null;
    }
}
