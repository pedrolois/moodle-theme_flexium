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

use core_external\external_api;
use PHPUnit\Framework\Attributes\CoversClass;
use theme_flexium\external\get_catalog;

/**
 * Tests for the catalogue cache invalidation: the catalogue shows fresh course data without manual purges.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(cache_observer::class)]
final class cache_observer_test extends \advanced_testcase {
    /**
     * Full names of the courses the catalogue returns.
     *
     * @param string $search
     * @return string[]
     */
    private function names(string $search = ''): array {
        $result = external_api::clean_returnvalue(get_catalog::execute_returns(), get_catalog::execute(search: $search));
        return array_column($result['courses'], 'fullname');
    }

    /**
     * Whether the catalogue cache still holds the data of the current language.
     *
     * @return bool
     */
    private function cached(): bool {
        return \cache::make('theme_flexium', 'catalogdata')->get(current_language()) !== false;
    }

    /**
     * Creating, renaming and deleting courses shows in the next catalogue request.
     */
    public function test_course_events(): void {
        global $CFG;
        require_once($CFG->dirroot . '/course/lib.php');
        $this->resetAfterTest();
        $this->setAdminUser();
        $generator = $this->getDataGenerator();
        $first = $generator->create_course(['fullname' => 'Astronomy']);

        $this->assertSame(['Astronomy'], $this->names());
        $this->assertTrue($this->cached());

        $second = $generator->create_course(['fullname' => 'Botany']);
        $this->assertFalse($this->cached());
        $this->assertSame(['Astronomy', 'Botany'], $this->names());

        update_course((object) ['id' => $first->id, 'fullname' => 'Zoology']);
        $this->assertSame(['Botany', 'Zoology'], $this->names());

        delete_course($second, false);
        $this->assertSame(['Zoology'], $this->names());
    }

    /**
     * Custom field values saved with the course, and custom field definitions, refresh the catalogue.
     */
    public function test_custom_field_events(): void {
        global $CFG;
        require_once($CFG->dirroot . '/course/lib.php');
        $this->resetAfterTest();
        $this->setAdminUser();
        $fieldgenerator = $this->getDataGenerator()->get_plugin_generator('core_customfield');
        $categoryid = $fieldgenerator->create_category()->get('id');
        $field = $fieldgenerator->create_field(['categoryid' => $categoryid, 'type' => 'text', 'shortname' => 'venue',
            'name' => 'Venue', 'configdata' => ['visibility' => 2]]);
        $course = $this->getDataGenerator()->create_course(['fullname' => 'Astronomy']);

        $this->assertSame([], $this->names('Geneva'));
        update_course((object) ['id' => $course->id, 'customfield_venue' => 'Geneva']);
        $this->assertSame(['Astronomy'], $this->names('Geneva'));

        // Changing a field definition purges too.
        $this->names();
        $this->assertTrue($this->cached());
        $handler = \core_course\customfield\course_handler::create();
        $handler->save_field_configuration($field, (object) ['name' => 'Location']);
        $this->assertFalse($this->cached());

        $this->names();
        $handler->delete_field_configuration($field);
        $this->assertFalse($this->cached());
        $this->assertSame([], $this->names('Geneva'));
    }

    /**
     * Course tags refresh the catalogue; tags of other areas (e.g. user interests) keep the cache.
     */
    public function test_tag_events(): void {
        $this->resetAfterTest();
        $this->setAdminUser();
        $course = $this->getDataGenerator()->create_course(['fullname' => 'Astronomy']);
        $user = $this->getDataGenerator()->create_user();

        $this->assertSame([], $this->names('Telescopes'));
        \core_tag_tag::set_item_tags(
            'core',
            'course',
            $course->id,
            \core\context\course::instance($course->id),
            ['Telescopes']
        );
        $this->assertSame(['Astronomy'], $this->names('Telescopes'));

        \core_tag_tag::set_item_tags('core', 'user', $user->id, \core\context\user::instance($user->id), ['Hiking']);
        $this->assertTrue($this->cached());

        \core_tag_tag::remove_item_tag('core', 'course', $course->id, 'Telescopes');
        $this->assertSame([], $this->names('Telescopes'));
    }
}
