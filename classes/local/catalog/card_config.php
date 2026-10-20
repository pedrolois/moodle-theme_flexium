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
 * What the catalogue course cards show (theme settings, Course cards tab).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class card_config {
    /** @var string[] Built-in footer items: key => Font Awesome icon. */
    public const FOOTER_ITEMS = [
        'startdate' => 'fa-regular fa-calendar',
        'enddate' => 'fa-solid fa-flag-checkered',
        'participants' => 'fa-solid fa-users',
        'shortname' => 'fa-solid fa-hashtag',
        'teachers' => 'fa-solid fa-chalkboard-user',
        'teachernames' => 'fa-solid fa-chalkboard-user',
        'teacherphotos' => 'fa-solid fa-chalkboard-user',
    ];

    /** @var string[] Footer items listing the course contacts (teachers): photo and name, name only, photo only. */
    public const TEACHER_ITEMS = ['teachers', 'teachernames', 'teacherphotos'];

    /** @var string Default footer items. */
    public const DEFAULT_FOOTER = 'startdate,participants';

    /** @var string[] Badge colours (design system badge variants). */
    public const BADGE_COLOURS = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'dark'];

    /** @var string Icon of custom field values in the footer. */
    public const FIELD_ICON = 'fa-solid fa-circle-info';

    /**
     * Footer item choices for the setting: built-in items, then the course custom fields.
     *
     * @return array key => label
     */
    public static function get_footer_choices(): array {
        $choices = [];
        foreach (array_keys(self::FOOTER_ITEMS) as $key) {
            $choices[$key] = get_string('cardfooter_' . $key, 'theme_flexium');
        }
        foreach (filter_config::get_available_sources() as $key => $source) {
            if ($source['field'] !== null) {
                $choices[$key] = get_string('cardfield', 'theme_flexium', $source['label']);
            }
        }
        return $choices;
    }

    /**
     * Badge choices for the setting: the course custom fields and tags.
     *
     * @return array source key => label
     */
    public static function get_badge_choices(): array {
        $choices = [];
        foreach (filter_config::get_available_sources() as $key => $source) {
            if ($key !== filter_config::SOURCE_CATEGORY) {
                $choices[$key] = $source['label'];
            }
        }
        return $choices;
    }

    /**
     * The configured footer items, in the configured order.
     *
     * @return string[]
     */
    public static function get_footer(): array {
        $raw = preview::get('cardfooter');
        return self::clean_list(
            explode(',', $raw === false ? self::DEFAULT_FOOTER : (string) $raw),
            self::get_footer_choices()
        );
    }

    /**
     * The sources shown as badges, in the configured order. Until the admin chooses, the custom fields shown as filters.
     *
     * @param array $layout the filter layout
     * @return string[]
     */
    public static function get_badges(array $layout): array {
        $raw = preview::get('cardbadges');
        if ($raw === false) {
            return array_values(array_filter(
                array_column($layout, 'source'),
                fn($source) => str_starts_with($source, filter_config::CUSTOMFIELD_PREFIX)
            ));
        }
        return self::clean_list(explode(',', (string) $raw), self::get_badge_choices());
    }

    /**
     * Colour of the badges of each source (config "cardbadgecolours", JSON source => colour); sources without one use
     * 'primary'.
     *
     * @return string[] source => colour
     */
    public static function get_badge_colours(): array {
        $stored = json_decode((string) preview::get('cardbadgecolours'), true);
        $colours = [];
        foreach (is_array($stored) ? $stored : [] as $source => $colour) {
            if (in_array($colour, self::BADGE_COLOURS, true)) {
                $colours[(string) $source] = $colour;
            }
        }
        return $colours;
    }

    /**
     * Badge colours as stored: JSON source => colour, known sources and colours only.
     *
     * @param array $colours list of ['source' => key, 'colour' => colour]
     * @return string
     */
    public static function encode_badge_colours(array $colours): string {
        $sources = self::get_badge_choices();
        $clean = [];
        foreach ($colours as $item) {
            if (in_array($item['colour'], self::BADGE_COLOURS, true) && isset($sources[$item['source']])) {
                $clean[$item['source']] = $item['colour'];
            }
        }
        return $clean ? json_encode($clean) : '';
    }

    /**
     * Keep the known, distinct keys of a list, in their order.
     *
     * @param string[] $keys
     * @param array $choices key => label
     * @return string[]
     */
    public static function clean_list(array $keys, array $choices): array {
        $clean = [];
        foreach ($keys as $key) {
            $key = trim((string) $key);
            if (isset($choices[$key]) && !in_array($key, $clean, true)) {
                $clean[] = $key;
            }
        }
        return $clean;
    }

    /**
     * Current card settings, as edited from the catalogue.
     *
     * @param array $layout the filter layout
     * @return array ['showcategory' => bool, 'showsummary' => bool, 'badges' => string[], 'footer' => string[],
     *     'badgecolours' => list of ['source', 'colour'], 'badgerows' => bool]
     */
    public static function get_settings(array $layout): array {
        $colours = self::get_badge_colours();
        return [
            'showcategory' => self::show('category'),
            'showsummary' => self::show('summary'),
            'badges' => self::get_badges($layout),
            'footer' => self::get_footer(),
            'badgecolours' => array_map(
                fn($source, $colour) => ['source' => (string) $source, 'colour' => $colour],
                array_keys($colours),
                $colours
            ),
            'badgerows' => (bool) preview::get('cardbadgerows'),
        ];
    }

    /**
     * Whether a part of the card is shown.
     *
     * @param string $part 'category' or 'summary'
     * @return bool
     */
    public static function show(string $part): bool {
        $value = preview::get('cardshow' . $part);
        return $value === false || !empty($value);
    }
}
