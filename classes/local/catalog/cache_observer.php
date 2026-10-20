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
 * Purges the catalogue cache when course data it holds changes.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class cache_observer {
    /**
     * Purge the whole catalogue cache; it is rebuilt on the next catalogue request.
     *
     * Tag events also fire for tags of other areas (users, questions...); only course tags matter.
     *
     * @param \core\event\base $event
     */
    public static function purge(\core\event\base $event): void {
        if ($event instanceof \core\event\tag_added || $event instanceof \core\event\tag_removed) {
            if (($event->other['itemtype'] ?? '') !== 'course') {
                return;
            }
        }
        \cache::make('theme_flexium', 'catalogdata')->purge();
    }
}
