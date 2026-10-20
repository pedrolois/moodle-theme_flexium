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

/**
 * Flexium event observers: keep the catalogue cache in step with course data.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$callback = '\theme_flexium\local\catalog\cache_observer::purge';

$eventnames = [
    // Course data, including its custom field values (saved with the course).
    '\core\event\course_created',
    '\core\event\course_updated',
    '\core\event\course_deleted',
    '\core\event\course_restored',
    // Course tags.
    '\core\event\tag_added',
    '\core\event\tag_removed',
    '\core\event\tag_updated',
    '\core\event\tag_deleted',
    // Custom field definitions (names, select options).
    '\core_customfield\event\field_created',
    '\core_customfield\event\field_updated',
    '\core_customfield\event\field_deleted',
    '\core_customfield\event\category_deleted',
];

$observers = [];
foreach ($eventnames as $eventname) {
    $observers[] = ['eventname' => $eventname, 'callback' => $callback];
}
