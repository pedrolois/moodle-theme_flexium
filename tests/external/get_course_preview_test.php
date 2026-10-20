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
use PHPUnit\Framework\Attributes\DataProvider;
use theme_flexium\local\catalog\course_info;
use theme_flexium\local\catalog\quickview;

/**
 * Tests for the catalogue quick view web service and the public course information.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(get_course_preview::class)]
#[CoversClass(course_info::class)]
final class get_course_preview_test extends \advanced_testcase {
    /** @var int Visibility of course custom fields: everyone. */
    private const EVERYONE = 2;

    /** @var string A 1x1 PNG image, base64 encoded. */
    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    /**
     * Call the web service as a client would, with its return values cleaned.
     *
     * @param int $courseid
     * @return array
     */
    private function preview(int $courseid): array {
        $result = get_course_preview::execute($courseid);
        return external_api::clean_returnvalue(get_course_preview::execute_returns(), $result);
    }

    /**
     * Create a course custom field.
     *
     * @param int $categoryid custom field category
     * @param string $type
     * @param string $shortname
     * @param string $name
     * @param array $configdata
     * @return \core_customfield\field_controller
     */
    private function create_field(
        int $categoryid,
        string $type,
        string $shortname,
        string $name,
        array $configdata = []
    ): \core_customfield\field_controller {
        return $this->getDataGenerator()->get_plugin_generator('core_customfield')->create_field([
            'categoryid' => $categoryid, 'type' => $type, 'shortname' => $shortname, 'name' => $name,
            'configdata' => $configdata + ['visibility' => self::EVERYONE],
        ]);
    }

    /**
     * Set the quick view choice of a course.
     *
     * @param int $courseid
     * @param int $choice quickview::AUTOMATIC, SHOW or HIDE
     */
    private function set_choice(int $courseid, int $choice): void {
        global $DB;
        $fieldid = $DB->get_field('customfield_field', 'id', ['shortname' => quickview::FIELD], MUST_EXIST);
        $field = \core_customfield\field_controller::create($fieldid);
        $this->getDataGenerator()->get_plugin_generator('core_customfield')->add_instance_data($field, $courseid, $choice);
    }

    /**
     * Name, summary, dates, teachers, custom field facts and text area sections of a course.
     */
    public function test_export(): void {
        $this->resetAfterTest();
        $generator = $this->getDataGenerator();
        $fieldgenerator = $generator->get_plugin_generator('core_customfield');
        $category = $generator->create_category(['name' => 'Data science']);
        $start = make_timestamp(2026, 11, 2);
        $end = make_timestamp(2027, 3, 1);
        $course = $generator->create_course(['fullname' => 'Data analysis', 'category' => $category->id,
            'summary' => '<p>Learn the basics.</p>', 'summaryformat' => FORMAT_HTML, 'startdate' => $start, 'enddate' => $end]);

        $fieldcategory = $fieldgenerator->create_category(['name' => 'Course details'])->get('id');
        $fields = [
            'language' => $this->create_field(
                $fieldcategory,
                'select',
                'language',
                'Language',
                ['options' => "English\nFrench"]
            ),
            'venue' => $this->create_field($fieldcategory, 'text', 'venue', 'Venue'),
            'certificate' => $this->create_field($fieldcategory, 'checkbox', 'certificate', 'Certificate'),
            'mentoring' => $this->create_field($fieldcategory, 'checkbox', 'mentoring', 'Mentoring'),
            'objectives' => $this->create_field($fieldcategory, 'textarea', 'objectives', 'Learning outcomes'),
            'internal' => $this->create_field($fieldcategory, 'text', 'internal', 'Internal note', ['visibility' => 1]),
            'empty' => $this->create_field($fieldcategory, 'text', 'emptyfield', 'Nothing'),
            'banner' => $this->create_field($fieldcategory, 'picture', 'banner', 'Banner'),
        ];
        $fieldgenerator->add_instance_data($fields['language'], $course->id, 2);
        $fieldgenerator->add_instance_data($fields['venue'], $course->id, 'Geneva');
        $fieldgenerator->add_instance_data($fields['certificate'], $course->id, 1);
        $fieldgenerator->add_instance_data($fields['mentoring'], $course->id, 0);
        $fieldgenerator->add_instance_data(
            $fields['objectives'],
            $course->id,
            ['text' => '<p>Read and present data.</p>', 'format' => FORMAT_HTML]
        );
        $fieldgenerator->add_instance_data($fields['internal'], $course->id, 'Teachers only');

        // A picture with a file (e.g. a second image) is not information.
        $this->setAdminUser();
        $draftitemid = file_get_unused_draft_itemid();
        get_file_storage()->create_file_from_string(['contextid' => \core\context\user::instance(get_admin()->id)->id,
            'component' => 'user', 'filearea' => 'draft', 'itemid' => $draftitemid, 'filepath' => '/',
            'filename' => 'banner.png'], base64_decode(self::PNG));
        $fieldgenerator->add_instance_data($fields['banner'], $course->id, $draftitemid);

        $teacher = $generator->create_user(['firstname' => 'Ada', 'lastname' => 'Lovelace']);
        $generator->enrol_user($teacher->id, $course->id, 'editingteacher');
        $student = $generator->create_user();
        $generator->enrol_user($student->id, $course->id, 'student');
        $this->setUser($student);

        $result = $this->preview($course->id);
        $this->assertSame((int) $course->id, $result['id']);
        $this->assertSame('Data analysis', $result['fullname']);
        $this->assertSame('Data science', $result['categoryname']);
        $this->assertStringContainsString('Learn the basics.', $result['summary']);
        $this->assertNotSame('', $result['image']);
        $this->assertTrue($result['enrolled']);
        $this->assertStringContainsString('/course/view.php?id=' . $course->id, $result['url']);

        $dateformat = get_string('strftimedate', 'langconfig');
        $this->assertSame(userdate($start, $dateformat), $result['startdate']);
        $this->assertSame(userdate($end, $dateformat), $result['enddate']);
        $this->assertSame([['name' => 'Ada Lovelace', 'role' => 'Teacher']], $result['contacts']);

        $facts = array_column($result['facts'], null, 'key');
        $this->assertSame(
            ['when', 'teachers', 'customfield:language', 'customfield:venue', 'customfield:certificate'],
            array_keys($facts)
        );
        $this->assertSame(s(userdate($start, $dateformat) . ' – ' . userdate($end, $dateformat)), $facts['when']['value']);
        $this->assertSame('fa-regular fa-calendar-days', $facts['when']['icon']);
        $this->assertSame('Ada Lovelace', $facts['teachers']['value']);
        $this->assertSame('French', $facts['customfield:language']['value']);
        $this->assertSame('fa-solid fa-globe', $facts['customfield:language']['icon']);
        $this->assertSame('Language', $facts['customfield:language']['label']);
        $this->assertSame('Geneva', $facts['customfield:venue']['value']);
        $this->assertSame('fa-solid fa-location-dot', $facts['customfield:venue']['icon']);
        $this->assertSame('fa-solid fa-award', $facts['customfield:certificate']['icon']);

        // Text areas are sections, not facts; hidden, empty, unticked and picture fields are left out.
        $this->assertCount(1, $result['sections']);
        $this->assertSame('customfield:objectives', $result['sections'][0]['key']);
        $this->assertSame('Learning outcomes', $result['sections'][0]['label']);
        $this->assertStringContainsString('Read and present data.', $result['sections'][0]['value']);
        $this->assertSame(
            ['Language', 'Venue', 'Certificate', 'Learning outcomes'],
            array_column($result['customfields'], 'name')
        );
    }

    /**
     * A course without dates nor teachers has no such facts, and users not enrolled are told so.
     */
    public function test_export_minimal(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course(['startdate' => 0, 'enddate' => 0, 'summary' => '']);
        $this->set_choice($course->id, quickview::SHOW);
        $this->setUser($this->getDataGenerator()->create_user());

        $result = $this->preview($course->id);
        $this->assertSame('', $result['startdate']);
        $this->assertSame('', $result['enddate']);
        $this->assertSame([], $result['contacts']);
        $this->assertSame([], $result['facts']);
        $this->assertSame([], $result['sections']);
        $this->assertFalse($result['enrolled']);
    }

    /**
     * Icons of custom fields, guessed from their short name and name.
     *
     * @return array[]
     */
    public static function field_icon_provider(): array {
        return [
            'registration deadline' => ['regdeadline Registration deadline', 'fa-regular fa-pen-to-square'],
            'location' => ['city City', 'fa-solid fa-location-dot'],
            'language, any case' => ['IDIOMA Idioma', 'fa-solid fa-globe'],
            'duration' => ['hours Duration', 'fa-regular fa-clock'],
            'level' => ['level Difficulty', 'fa-solid fa-signal'],
            'price' => ['fee Price', 'fa-solid fa-tag'],
            'audience' => ['audience Target audience', 'fa-solid fa-users'],
            'unknown' => ['code Code', 'fa-solid fa-circle-info'],
        ];
    }

    /**
     * Custom field icons by words of the field name.
     *
     * @param string $text
     * @param string $expected
     */
    #[DataProvider('field_icon_provider')]
    public function test_field_icon(string $text, string $expected): void {
        $this->assertSame($expected, course_info::field_icon($text));
    }

    /**
     * Courses whose quick view is hidden are refused, even to enrolled users.
     */
    public function test_quickview_hidden(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $user = $this->getDataGenerator()->create_user();
        $this->getDataGenerator()->enrol_user($user->id, $course->id, 'student');
        $this->set_choice($course->id, quickview::HIDE);
        $this->setUser($user);

        $this->expectException(\required_capability_exception::class);
        get_course_preview::execute($course->id);
    }

    /**
     * Automatic courses without any way in are refused to users not enrolled.
     */
    public function test_not_offered(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $this->setUser($this->getDataGenerator()->create_user());

        $this->expectException(\required_capability_exception::class);
        get_course_preview::execute($course->id);
    }

    /**
     * Hidden courses are refused to students, even enrolled and with the quick view shown.
     */
    public function test_hidden_course_student(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course(['visible' => 0]);
        $user = $this->getDataGenerator()->create_user();
        $this->getDataGenerator()->enrol_user($user->id, $course->id, 'student');
        $this->set_choice($course->id, quickview::SHOW);
        $this->setUser($user);

        $this->expectException(\required_capability_exception::class);
        get_course_preview::execute($course->id);
    }

    /**
     * Administrators may preview hidden courses.
     */
    public function test_hidden_course_admin(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course(['visible' => 0, 'fullname' => 'Secret']);
        $this->set_choice($course->id, quickview::SHOW);
        $this->setAdminUser();

        $this->assertSame('Secret', $this->preview($course->id)['fullname']);
    }

    /**
     * The site course is never previewed.
     */
    public function test_site_course(): void {
        $this->resetAfterTest();
        $this->setAdminUser();

        $this->expectException(\required_capability_exception::class);
        get_course_preview::execute(SITEID);
    }

    /**
     * Visitors may preview courses open to them, unless the site forces login or course pages are unreachable.
     */
    public function test_visitors(): void {
        global $CFG;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course(['fullname' => 'Open course']);
        enrol_get_plugin('self')->add_instance($course, ['status' => ENROL_INSTANCE_ENABLED, 'customint6' => 1]);

        $CFG->forcelogin = 0;
        set_config('guestloginbutton', 1);
        $this->setUser(null);
        $result = $this->preview($course->id);
        $this->assertSame('Open course', $result['fullname']);
        $this->assertFalse($result['enrolled']);

        // Visitors who cannot reach course pages never get it.
        set_config('guestloginbutton', 0);
        set_config('autologinguests', 0);
        try {
            get_course_preview::execute($course->id);
            $this->fail('Exception expected');
        } catch (\required_capability_exception $e) {
            $this->assertSame('nopermissions', $e->errorcode);
        }

        $CFG->forcelogin = 1;
        $this->expectException(\require_login_exception::class);
        get_course_preview::execute($course->id);
    }
}
