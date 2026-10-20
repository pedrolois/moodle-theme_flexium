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

use core_course\customfield\course_handler;
use PHPUnit\Framework\Attributes\CoversClass;

/**
 * Tests for the catalogue quick view rules.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(quickview::class)]
final class quickview_test extends \advanced_testcase {
    /**
     * Set the quick view choice of a course.
     *
     * @param int $courseid
     * @param int $choice quickview::AUTOMATIC, SHOW or HIDE
     */
    private function set_choice(int $courseid, int $choice): void {
        global $DB;
        quickview::ensure_field();
        $fieldid = $DB->get_field('customfield_field', 'id', ['shortname' => quickview::FIELD], MUST_EXIST);
        $field = \core_customfield\field_controller::create($fieldid);
        $this->getDataGenerator()->get_plugin_generator('core_customfield')->add_instance_data($field, $courseid, $choice);
    }

    /**
     * Enable an open self enrolment method in a course.
     *
     * @param \stdClass $course
     * @param array $fields extra instance fields
     */
    private function add_self_enrolment(\stdClass $course, array $fields = []): void {
        enrol_get_plugin('self')->add_instance(
            $course,
            $fields + ['status' => ENROL_INSTANCE_ENABLED, 'customint6' => 1]
        );
    }

    /**
     * ensure_field() creates the hidden-to-students select field once, in a "Flexium" category.
     */
    public function test_ensure_field(): void {
        global $DB;
        $this->resetAfterTest();

        // The field is created on install; start from scratch to check the creation itself.
        $DB->delete_records('customfield_field', ['shortname' => quickview::FIELD]);
        quickview::ensure_field();
        quickview::ensure_field();

        $records = $DB->get_records('customfield_field', ['shortname' => quickview::FIELD]);
        $this->assertCount(1, $records);
        $field = \core_customfield\field_controller::create(reset($records)->id);
        $this->assertSame('select', $field->get('type'));
        $this->assertEquals(course_handler::VISIBLETOTEACHERS, $field->get_configdata_property('visibility'));
        // Automatic, Show and Hide, after the empty choice.
        $this->assertCount(3, array_filter($field->get_options()));
        $category = $DB->get_record('customfield_category', ['id' => $field->get('categoryid')]);
        $this->assertSame('core_course', $category->component);
        $this->assertSame(get_string('pluginname', 'theme_flexium'), $category->name);

        // Running it again (upgrade) with the field deleted reuses the existing category.
        $DB->delete_records('customfield_field', ['shortname' => quickview::FIELD]);
        quickview::ensure_field();
        $this->assertSame(1, $DB->count_records('customfield_category', ['component' => 'core_course', 'area' => 'course',
            'name' => get_string('pluginname', 'theme_flexium')]));
    }

    /**
     * Show and Hide win over the automatic rule.
     */
    public function test_offered_course_choice(): void {
        $this->resetAfterTest();

        $generator = $this->getDataGenerator();
        $shown = $generator->create_course();
        $hidden = $generator->create_course();
        $automatic = $generator->create_course();
        $this->add_self_enrolment($hidden);
        $this->set_choice($shown->id, quickview::SHOW);
        $this->set_choice($hidden->id, quickview::HIDE);
        $this->set_choice($automatic->id, quickview::AUTOMATIC);

        $this->setUser($generator->create_user());
        $this->assertSame(
            [$shown->id => true, $hidden->id => false, $automatic->id => false],
            quickview::offered([$shown->id, $hidden->id, $automatic->id])
        );
    }

    /**
     * Automatic: enrolled users get it, other users only when an enrolment method is open to them.
     */
    public function test_offered_automatic_logged_in(): void {
        $this->resetAfterTest();

        $generator = $this->getDataGenerator();
        $enrolled = $generator->create_course();
        $selfenrol = $generator->create_course();
        $closed = $generator->create_course();
        $this->add_self_enrolment($selfenrol);
        $user = $generator->create_user();
        $generator->enrol_user($user->id, $enrolled->id, 'student');

        $this->setUser($user);
        $this->assertSame(
            [$enrolled->id => true, $selfenrol->id => true, $closed->id => false],
            quickview::offered([$enrolled->id, $selfenrol->id, $closed->id])
        );
    }

    /**
     * Automatic for visitors: open self enrolment (by its dates and "allow new enrolments") or guest access.
     */
    public function test_offered_automatic_visitor(): void {
        $this->resetAfterTest();

        set_config('guestloginbutton', 1);
        $generator = $this->getDataGenerator();
        $open = $generator->create_course();
        $nonew = $generator->create_course();
        $ended = $generator->create_course();
        $future = $generator->create_course();
        $guest = $generator->create_course();
        $closed = $generator->create_course();
        $this->add_self_enrolment($open);
        $this->add_self_enrolment($nonew, ['customint6' => 0]);
        $this->add_self_enrolment($ended, ['enrolenddate' => time() - DAYSECS]);
        $this->add_self_enrolment($future, ['enrolstartdate' => time() + DAYSECS]);
        $guestplugin = enrol_get_plugin('guest');
        $instance = enrol_get_instances($guest->id, false);
        $instance = array_values(array_filter($instance, fn($item) => $item->enrol === 'guest'))[0] ?? null;
        if ($instance) {
            $guestplugin->update_status($instance, ENROL_INSTANCE_ENABLED);
        } else {
            $guestplugin->add_instance($guest, ['status' => ENROL_INSTANCE_ENABLED]);
        }

        $this->setUser(null);
        $ids = [$open->id, $nonew->id, $ended->id, $future->id, $guest->id, $closed->id];
        $this->assertSame([$open->id => true, $nonew->id => false, $ended->id => false, $future->id => false,
            $guest->id => true, $closed->id => false], quickview::offered($ids));
    }

    /**
     * Visitors who cannot reach course pages never get it, whatever the course says.
     */
    public function test_offered_unreachable(): void {
        $this->resetAfterTest();

        set_config('guestloginbutton', 0);
        set_config('autologinguests', 0);
        $course = $this->getDataGenerator()->create_course();
        $this->add_self_enrolment($course);
        $this->set_choice($course->id, quickview::SHOW);

        $this->setUser(null);
        $this->assertSame([$course->id => false], quickview::offered([$course->id]));
        $this->assertSame([], quickview::offered([]));
    }

    /**
     * A disabled enrolment plugin does not count, even with an enabled instance.
     */
    public function test_offered_disabled_plugin(): void {
        $this->resetAfterTest();

        $course = $this->getDataGenerator()->create_course();
        $this->add_self_enrolment($course);
        set_config('enrol_plugins_enabled', 'manual');
        \core_plugin_manager::reset_caches();

        $this->setUser($this->getDataGenerator()->create_user());
        $this->assertFalse(quickview::course_page_useful($course->id));
    }
}
