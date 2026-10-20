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

use PHPUnit\Framework\Attributes\CoversFunction;
use theme_flexium\local\catalog\quickview;

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/theme/flexium/db/uninstall.php');

/**
 * Tests for the uninstall steps: the quick view course custom field is removed.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversFunction('xmldb_theme_flexium_uninstall')]
final class uninstall_test extends \advanced_testcase {
    /**
     * The quick view field record, made by ensure_field().
     *
     * @return \stdClass
     */
    private function quickview_field(): \stdClass {
        global $DB;
        quickview::ensure_field();
        return $DB->get_record('customfield_field', ['shortname' => quickview::FIELD], '*', MUST_EXIST);
    }

    /**
     * The field, its values and its category are removed.
     */
    public function test_removes_field_and_category(): void {
        global $DB;
        $this->resetAfterTest();
        $field = $this->quickview_field();
        $course = $this->getDataGenerator()->create_course();
        $this->getDataGenerator()->get_plugin_generator('core_customfield')
            ->add_instance_data(\core_customfield\field_controller::create($field->id), $course->id, quickview::SHOW);
        $this->assertTrue($DB->record_exists('customfield_data', ['fieldid' => $field->id]));

        $this->assertTrue(xmldb_theme_flexium_uninstall());
        $this->assertFalse($DB->record_exists('customfield_field', ['shortname' => quickview::FIELD]));
        $this->assertFalse($DB->record_exists('customfield_data', ['fieldid' => $field->id]));
        $this->assertFalse($DB->record_exists('customfield_category', ['id' => $field->categoryid]));
    }

    /**
     * A category holding other fields (added by the administrator) is kept.
     */
    public function test_keeps_category_with_other_fields(): void {
        global $DB;
        $this->resetAfterTest();
        $field = $this->quickview_field();
        $this->getDataGenerator()->get_plugin_generator('core_customfield')->create_field([
            'categoryid' => $field->categoryid, 'type' => 'text', 'shortname' => 'venue', 'name' => 'Venue']);

        $this->assertTrue(xmldb_theme_flexium_uninstall());
        $this->assertFalse($DB->record_exists('customfield_field', ['shortname' => quickview::FIELD]));
        $this->assertTrue($DB->record_exists('customfield_category', ['id' => $field->categoryid]));
        $this->assertTrue($DB->record_exists('customfield_field', ['shortname' => 'venue']));
    }

    /**
     * Nothing to do when the field is missing, or when a field of that name belongs to another area.
     */
    public function test_nothing_to_remove(): void {
        global $DB;
        $this->resetAfterTest();
        $field = $this->quickview_field();
        $DB->delete_records('customfield_field', ['id' => $field->id]);
        $categories = $DB->count_records('customfield_category');

        $this->assertTrue(xmldb_theme_flexium_uninstall());
        $this->assertSame($categories, $DB->count_records('customfield_category'));

        // A field with the same short name in another area is not ours.
        $category = $this->getDataGenerator()->get_plugin_generator('core_customfield')->create_category([
            'component' => 'core_cohort', 'area' => 'cohort']);
        $this->getDataGenerator()->get_plugin_generator('core_customfield')->create_field([
            'categoryid' => $category->get('id'), 'type' => 'text', 'shortname' => quickview::FIELD]);
        $this->assertTrue(xmldb_theme_flexium_uninstall());
        $this->assertTrue($DB->record_exists('customfield_field', ['shortname' => quickview::FIELD]));
        $this->assertTrue($DB->record_exists('customfield_category', ['id' => $category->get('id')]));
    }
}
