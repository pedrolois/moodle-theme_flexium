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
 * Flexium uninstall steps.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Remove the course custom field "Quick view in the catalogue" made at install, with its values, and its category
 * when nothing else was added to it.
 *
 * @return bool
 */
function xmldb_theme_flexium_uninstall() {
    global $DB;

    $record = $DB->get_record('customfield_field', ['shortname' => \theme_flexium\local\catalog\quickview::FIELD]);
    if (!$record) {
        return true;
    }
    $category = $DB->get_record('customfield_category', ['id' => $record->categoryid]);
    if (!$category || $category->component !== 'core_course' || $category->area !== 'course') {
        return true;
    }
    \core_customfield\api::delete_field_configuration(\core_customfield\field_controller::create($record->id));
    if (!$DB->record_exists('customfield_field', ['categoryid' => $category->id])) {
        \core_customfield\api::delete_category(\core_customfield\category_controller::create($category->id));
    }
    return true;
}
