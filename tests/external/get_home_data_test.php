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
use theme_flexium\local\home\home;

/**
 * Tests for the web service returning the data of the dynamic home page sections.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(get_home_data::class)]
#[CoversClass(home::class)]
final class get_home_data_test extends \advanced_testcase {
    /**
     * Call the web service as a client would, with its return values cleaned.
     *
     * @return array
     */
    private function query(): array {
        return external_api::clean_returnvalue(get_home_data::execute_returns(), get_home_data::execute());
    }

    /**
     * Post announcements in the site news forum.
     *
     * @param string[] $subjects oldest first
     */
    private function post_news(array $subjects): void {
        global $CFG, $DB, $SITE;
        require_once($CFG->dirroot . '/mod/forum/lib.php');

        $DB->set_field('course', 'newsitems', 3, ['id' => SITEID]);
        $SITE->newsitems = 3;
        $forum = forum_get_course_forum(SITEID, 'news');
        $author = get_admin();
        $time = time() - DAYSECS;
        foreach ($subjects as $subject) {
            $this->getDataGenerator()->get_plugin_generator('mod_forum')->create_discussion(['course' => SITEID,
                'forum' => $forum->id, 'userid' => $author->id, 'name' => $subject, 'timemodified' => $time++]);
        }
    }

    /**
     * Logged in users get categories, figures and the latest announcements first.
     */
    public function test_data(): void {
        global $DB;
        $this->resetAfterTest();
        $generator = $this->getDataGenerator();
        $visiblecategories = $DB->count_records('course_categories', ['visible' => 1]);
        $category = $generator->create_category(['name' => 'Languages']);
        $generator->create_category(['name' => 'Archive', 'visible' => 0]);
        $generator->create_course(['category' => $category->id]);
        $generator->create_course(['category' => $category->id, 'visible' => 0]);
        $user = $generator->create_user();
        $suspended = $generator->create_user(['suspended' => 1]);
        $this->post_news(['Welcome', 'New courses']);

        $this->setUser($user);
        $result = $this->query();

        $categories = array_column($result['categories'], null, 'name');
        // Hidden courses are not counted for students.
        $this->assertSame(1, $categories['Languages']['coursecount']);
        $this->assertStringContainsString('/course/index.php?categoryid=' . $category->id, $categories['Languages']['url']);
        $this->assertSame(1, $result['stats']['courses']);
        // Hidden categories are not counted.
        $this->assertSame($visiblecategories + 1, $result['stats']['categories']);
        $this->assertSame(0, $result['stats']['completions']);
        // Active users, without guest, admin nor suspended users.
        $this->assertSame(1, $result['stats']['users']);

        $this->assertSame(['New courses', 'Welcome'], array_column($result['news'], 'title'));
        $this->assertStringContainsString('/mod/forum/discuss.php?d=', $result['news'][0]['url']);
        $this->assertNotSame('', $result['news'][0]['date']);
    }

    /**
     * No announcements when the site home shows no news.
     */
    public function test_no_news(): void {
        global $DB, $SITE;
        $this->resetAfterTest();
        $this->post_news(['Welcome']);
        $DB->set_field('course', 'newsitems', 0, ['id' => SITEID]);
        $SITE->newsitems = 0;

        $this->setUser($this->getDataGenerator()->create_user());
        $this->assertSame([], $this->query()['news']);
    }

    /**
     * Visitors get the data unless the site forces login.
     */
    public function test_visitors_and_forcelogin(): void {
        global $CFG;
        $this->resetAfterTest();
        $this->getDataGenerator()->create_course();
        $this->post_news(['Welcome']);

        $CFG->forcelogin = 0;
        $this->setUser(null);
        $result = $this->query();
        $this->assertSame(1, $result['stats']['courses']);
        $this->assertSame(['Welcome'], array_column($result['news'], 'title'));

        $CFG->forcelogin = 1;
        $this->expectException(\require_login_exception::class);
        get_home_data::execute();
    }
}
