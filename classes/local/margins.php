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

namespace theme_flexium\local;

/**
 * Left and right page margins (space between the page content and the window edges), per scope: the whole site,
 * the home page or the course catalogue. Home and catalogue values, when set, override the whole site ones.
 *
 * Stored as JSON in theme_flexium/pagemargins, edited with the margins wand (edit mode, site administrators)
 * and applied at runtime by \theme_flexium\local\appearance (no SCSS recompilation).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class margins {
    /** @var string[] Scope => body selector ('' for every page). Specific scopes come after "site". */
    public const SCOPES = [
        'site' => '',
        'home' => '#page-site-index',
        'catalog' => '.flexium-catalogpage',
    ];

    /** @var int Largest margin, in pixels. */
    public const MAX = 480;

    /** @var string[] Parts that can take the margins too: option => selector. */
    public const PARTS = [
        'footer' => '.flexium-footer',
        'navbar' => '.navbar.fixed-top',
    ];

    /**
     * Saved margins.
     *
     * @return array scope => ['left' => int|null, 'right' => int|null (null: Moodle's default),
     *         'footer' => bool, 'navbar' => bool (whether the site footer / top navigation bar take them too)]
     */
    public static function get(): array {
        $raw = json_decode((string) get_config('theme_flexium', 'pagemargins'), true);
        return self::clean(is_array($raw) ? $raw : []);
    }

    /**
     * Normalise margins: every scope, integers between 0 and MAX, or null for the default.
     *
     * @param array $margins scope => ['left' => mixed, 'right' => mixed]
     * @return array
     */
    public static function clean(array $margins): array {
        $clean = [];
        foreach (array_keys(self::SCOPES) as $scope) {
            foreach (['left', 'right'] as $side) {
                $value = $margins[$scope][$side] ?? null;
                $clean[$scope][$side] = ($value === null || $value === '' || (int) $value < 0)
                    ? null : min(self::MAX, (int) $value);
            }
            foreach (array_keys(self::PARTS) as $part) {
                $clean[$scope][$part] = !empty($margins[$scope][$part]);
            }
        }
        return $clean;
    }

    /**
     * CSS applying the margins: from 768px wide, each side capped at 12% of the window width; phones keep Moodle's
     * own small margins.
     *
     * Mirrored by marginsCss() in js/esm/src/margins/MarginsWand.tsx (live preview).
     *
     * @param array $margins see get()
     * @return string
     */
    public static function css(array $margins): string {
        $rules = '';
        foreach (self::SCOPES as $scope => $body) {
            $declarations = '';
            foreach (['left', 'right'] as $side) {
                $value = $margins[$scope][$side] ?? null;
                if ($value !== null) {
                    $declarations .= " padding-{$side}: min({$value}px, 12vw);";
                }
            }
            if ($declarations !== '') {
                $selectors = ["body{$body} #page-wrapper #page .main-inner"];
                foreach (self::PARTS as $part => $selector) {
                    if (!empty($margins[$scope][$part])) {
                        $selectors[] = "body{$body} #page-wrapper {$selector}";
                    }
                }
                $rules .= implode(', ', $selectors) . " {{$declarations} }\n";
            }
        }
        return $rules === '' ? '' : "@media (min-width: 768px) {\n{$rules}}\n";
    }

    /**
     * The specific scope of a page: 'home', 'catalog' or '' (only the whole site applies).
     *
     * @param \moodle_page $page
     * @return string
     */
    public static function page_scope(\moodle_page $page): string {
        if ($page->pagetype === 'site-index') {
            return 'home';
        }
        if (str_starts_with($page->pagetype, 'course-index') && get_config('theme_flexium', 'enablecatalog')) {
            return 'catalog';
        }
        return '';
    }
}
