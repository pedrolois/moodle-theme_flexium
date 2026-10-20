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

namespace theme_flexium\external;

use core_external\external_api;
use PHPUnit\Framework\Attributes\CoversClass;
use theme_flexium\local\catalog\catalog;
use theme_flexium\local\catalog\filter_config;
use theme_flexium\local\catalog\quickview;

/**
 * Tests for the catalogue web service and query engine.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(get_catalog::class)]
#[CoversClass(catalog::class)]
final class get_catalog_test extends \advanced_testcase {
    /**
     * Reset the catalogue caches after changing course data.
     */
    private function purge(): void {
        \cache_helper::purge_by_definition('theme_flexium', 'catalogdata');
        filter_config::reset_caches();
    }

    /**
     * Call the web service as a client would, with its return values cleaned.
     *
     * @param array $args named arguments of get_catalog::execute()
     * @return array
     */
    private function query(array $args = []): array {
        $result = get_catalog::execute(...$args);
        return external_api::clean_returnvalue(get_catalog::execute_returns(), $result);
    }

    /**
     * Sample courses.
     *
     * @return \stdClass[] key => course
     */
    private function create_courses(): array {
        $generator = $this->getDataGenerator();
        $courses = [
            'zoology' => $generator->create_course(['fullname' => 'Zoology basics', 'summary' => 'Animals and habitats']),
            'astronomy' => $generator->create_course(['fullname' => 'Astronomy', 'summary' => '<p>Stars and <b>planets</b></p>']),
            'botany' => $generator->create_course(['fullname' => 'Botany', 'summary' => 'Plants of the world']),
            'hidden' => $generator->create_course(['fullname' => 'Secret astronomy club', 'visible' => 0]),
        ];
        $this->purge();
        return $courses;
    }

    /**
     * Full names of the courses of a result.
     *
     * @param array $result
     * @return string[]
     */
    private function names(array $result): array {
        return array_column($result['courses'], 'fullname');
    }

    /**
     * Search by name and by summary, words in any order, accents and case ignored.
     */
    public function test_search(): void {
        $this->resetAfterTest();
        $this->create_courses();
        $this->setUser($this->getDataGenerator()->create_user());

        $this->assertSame(['Astronomy'], $this->names($this->query(['search' => 'astronomy'])));
        $this->assertSame(['Astronomy'], $this->names($this->query(['search' => 'PLANETS stars'])));
        $this->assertSame(['Botany'], $this->names($this->query(['search' => 'plánts'])));
        $result = $this->query(['search' => 'nothing like this']);
        $this->assertSame(0, $result['total']);
        $this->assertSame([], $result['courses']);
    }

    /**
     * Summaries are plain text, and courses sorted by name by default.
     */
    public function test_sort_and_summary(): void {
        $this->resetAfterTest();
        $courses = $this->create_courses();
        $this->setUser($this->getDataGenerator()->create_user());

        $result = $this->query();
        $this->assertSame(['Astronomy', 'Botany', 'Zoology basics'], $this->names($result));
        $this->assertSame(3, $result['total']);
        $this->assertSame('Stars and planets', $result['courses'][0]['summary']);
        $this->assertStringContainsString('/course/view.php?id=' . $courses['astronomy']->id, $result['courses'][0]['url']);
        $this->assertNotSame('', $result['courses'][0]['image']);

        // An unknown sort falls back to the name.
        $this->assertSame(['Astronomy', 'Botany', 'Zoology basics'], $this->names($this->query(['sort' => 'bogus'])));
    }

    /**
     * Sort by latest: newest courses first.
     */
    public function test_sort_latest(): void {
        global $DB;
        $this->resetAfterTest();
        $courses = $this->create_courses();
        $DB->set_field('course', 'timecreated', time() - 3 * DAYSECS, ['id' => $courses['astronomy']->id]);
        $DB->set_field('course', 'timecreated', time() - 2 * DAYSECS, ['id' => $courses['botany']->id]);
        $DB->set_field('course', 'timecreated', time() - DAYSECS, ['id' => $courses['zoology']->id]);
        $this->purge();
        $this->setUser($this->getDataGenerator()->create_user());

        $this->assertSame(['Zoology basics', 'Botany', 'Astronomy'], $this->names($this->query(['sort' => 'latest'])));
    }

    /**
     * Hidden courses are listed for administrators only.
     */
    public function test_hidden_courses(): void {
        $this->resetAfterTest();
        $this->create_courses();

        $this->setUser($this->getDataGenerator()->create_user());
        $this->assertNotContains('Secret astronomy club', $this->names($this->query()));

        $this->setAdminUser();
        $result = $this->query(['search' => 'astronomy']);
        $this->assertSame(['Astronomy', 'Secret astronomy club'], $this->names($result));
        $this->assertFalse($result['courses'][1]['visible']);
        $this->assertTrue($result['courses'][0]['visible']);
    }

    /**
     * Pagination: page size, total, and pages past the end clamped to the last one.
     */
    public function test_pagination(): void {
        $this->resetAfterTest();
        $generator = $this->getDataGenerator();
        for ($i = 1; $i <= 5; $i++) {
            $generator->create_course(['fullname' => "Course {$i}"]);
        }
        $this->purge();
        $this->setUser($generator->create_user());

        $result = $this->query(['perpage' => 2]);
        $this->assertSame(5, $result['total']);
        $this->assertSame(2, $result['perpage']);
        $this->assertSame(['Course 1', 'Course 2'], $this->names($result));

        $result = $this->query(['perpage' => 2, 'page' => 1]);
        $this->assertSame(1, $result['page']);
        $this->assertSame(['Course 3', 'Course 4'], $this->names($result));

        $result = $this->query(['perpage' => 2, 'page' => 99]);
        $this->assertSame(2, $result['page']);
        $this->assertSame(['Course 5'], $this->names($result));

        $result = $this->query(['perpage' => 1000]);
        $this->assertSame(catalog::MAX_PERPAGE, $result['perpage']);
        $this->assertCount(5, $result['courses']);
    }

    /**
     * The quick view flag of each course follows the course choice and the open enrolment methods.
     */
    public function test_quickview_flag(): void {
        global $CFG, $DB;
        $this->resetAfterTest();
        $courses = $this->create_courses();

        enrol_get_plugin('self')->add_instance($courses['botany'], ['status' => ENROL_INSTANCE_ENABLED, 'customint6' => 1]);
        $fieldid = $DB->get_field('customfield_field', 'id', ['shortname' => quickview::FIELD], MUST_EXIST);
        $field = \core_customfield\field_controller::create($fieldid);
        $this->getDataGenerator()->get_plugin_generator('core_customfield')
            ->add_instance_data($field, $courses['zoology']->id, quickview::SHOW);
        $this->purge();

        $CFG->forcelogin = 0;
        set_config('guestloginbutton', 1);
        $this->setUser(null);
        $flags = array_column($this->query()['courses'], 'quickview', 'fullname');
        $this->assertSame(['Astronomy' => false, 'Botany' => true, 'Zoology basics' => true], $flags);

        // Visitors who cannot reach course pages never get it.
        set_config('guestloginbutton', 0);
        set_config('autologinguests', 0);
        $flags = array_column($this->query()['courses'], 'quickview', 'fullname');
        $this->assertSame(['Astronomy' => false, 'Botany' => false, 'Zoology basics' => false], $flags);
    }

    /**
     * Visitors can browse the catalogue unless the site forces login.
     */
    public function test_visitors_and_forcelogin(): void {
        global $CFG;
        $this->resetAfterTest();
        $this->create_courses();

        $this->setUser(null);
        $CFG->forcelogin = 0;
        $result = $this->query();
        $this->assertSame(3, $result['total']);
        $this->assertFalse($result['courses'][0]['enrolled']);
        $this->assertSame(-1, $result['courses'][0]['progress']);

        $CFG->forcelogin = 1;
        $this->expectException(\require_login_exception::class);
        get_catalog::execute();
    }

    /**
     * Enrolment, the "My courses" quick filter and its count.
     */
    public function test_enrolled_and_quick_filter(): void {
        $this->resetAfterTest();
        $courses = $this->create_courses();
        $user = $this->getDataGenerator()->create_user();
        $this->getDataGenerator()->enrol_user($user->id, $courses['botany']->id, 'student');
        $this->setUser($user);

        $result = $this->query(['quick' => ['mycourses']]);
        $this->assertSame(['Botany'], $this->names($result));
        $this->assertTrue($result['courses'][0]['enrolled']);
        $quick = array_column($result['quick'], null, 'key');
        $this->assertSame(1, $quick['mycourses']['count']);
        $this->assertTrue($quick['mycourses']['selected']);
        // Counts combine with the other selected quick filters: new courses among mine.
        $this->assertSame(1, $quick['new']['count']);
        $result = $this->query();
        $quick = array_column($result['quick'], null, 'key');
        $this->assertSame(3, $quick['new']['count']);
        $this->assertFalse($quick['mycourses']['selected']);
    }

    /**
     * Category filter: courses of the category and its subcategories, with faceted counts.
     */
    public function test_category_filter(): void {
        $this->resetAfterTest();
        $generator = $this->getDataGenerator();
        $sciences = $generator->create_category(['name' => 'Sciences']);
        $biology = $generator->create_category(['name' => 'Biology', 'parent' => $sciences->id]);
        $generator->create_course(['fullname' => 'Cells', 'category' => $biology->id]);
        $generator->create_course(['fullname' => 'Physics', 'category' => $sciences->id]);
        $generator->create_course(['fullname' => 'Poetry']);
        $this->purge();
        $this->setUser($generator->create_user());

        $result = $this->query(['filters' => [['source' => 'category', 'values' => [(string) $sciences->id]]]]);
        $this->assertSame(['Cells', 'Physics'], $this->names($result));
        $this->assertSame(
            [['source' => 'category', 'value' => (string) $sciences->id, 'label' => 'Sciences']],
            $result['selected']
        );

        $groups = array_column($result['groups'], null, 'source');
        $options = array_column($groups['category']['options'], null, 'value');
        // Counts ignore the group's own selection: every category keeps its full count.
        $this->assertSame(2, $options[(string) $sciences->id]['count']);
        $this->assertSame(1, $options[(string) $biology->id]['count']);
        $this->assertSame((string) $sciences->id, $options[(string) $biology->id]['parent']);
        $this->assertTrue($options[(string) $sciences->id]['selected']);

        // Unknown values are dropped from the selection.
        $result = $this->query(['filters' => [['source' => 'category', 'values' => ['999999']]]]);
        $this->assertSame([], $result['selected']);
        $this->assertSame(3, $result['total']);
    }
}
