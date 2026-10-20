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

namespace theme_flexium;

use core\hook\navigation\primary_extend;
use core\hook\output\before_standard_head_html_generation;
use core\navigation\navigation_node;
use theme_flexium\local\appearance;
use theme_flexium\local\catalog\features;

/**
 * Hook callbacks of the theme.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class hook_callbacks {
    /**
     * Add the font links and the runtime appearance CSS to the page head, on pages using this theme.
     *
     * @param before_standard_head_html_generation $hook
     */
    public static function before_standard_head_html_generation(before_standard_head_html_generation $hook): void {
        global $PAGE;

        if (during_initial_install() || $PAGE->theme->name !== 'flexium') {
            return;
        }
        $hook->add_html(appearance::get_head_html());
    }

    /**
     * Add the course catalogue to the top navigation bar, on pages using this theme.
     *
     * Not added when switched off (Catalogue features, Header) or when the custom menu items already link to it.
     *
     * @param primary_extend $hook
     */
    public static function primary_extend(primary_extend $hook): void {
        global $PAGE;

        if (
            during_initial_install() || $PAGE->theme->name !== 'flexium' || !features::get('navlink')
                || self::custom_menu_has_catalogue()
        ) {
            return;
        }
        $text = trim(format_string(
            (string) features::get('navlinktext'),
            true,
            ['context' => \core\context\system::instance()]
        ));
        $primary = $hook->get_primaryview();
        $node = navigation_node::create(
            $text !== '' ? $text : get_string('navcatalogue', 'theme_flexium'),
            new \moodle_url('/course/index.php'),
            navigation_node::TYPE_ROOTNODE,
            null,
            'flexiumcatalogue'
        );
        // After Moodle's own links, before Site administration.
        $primary->add_node($node, $primary->get('siteadminnode') ? 'siteadminnode' : null);
        // Moodle's course/index.php highlights "Home": on the catalogue pages, highlight the catalogue instead.
        if ($PAGE->has_set_url() && $PAGE->url->compare(new \moodle_url('/course/index.php'), URL_MATCH_BASE)) {
            $PAGE->set_primary_active_tab('flexiumcatalogue');
        }
    }

    /**
     * Whether a custom menu item (Advanced theme settings) already links to the course catalogue.
     *
     * @return bool
     */
    private static function custom_menu_has_catalogue(): bool {
        global $CFG;

        $site = preg_quote(preg_replace('#^https?://#', '', $CFG->wwwroot), '#');
        foreach (explode("\n", (string) ($CFG->custommenuitems ?? '')) as $line) {
            $url = trim(explode('|', $line)[1] ?? '');
            $url = preg_replace("#^(https?://)?{$site}#", '', $url);
            if (preg_match('#^/course/(index\.php)?([?\#].*)?$#', $url)) {
                return true;
            }
        }
        return false;
    }
}
