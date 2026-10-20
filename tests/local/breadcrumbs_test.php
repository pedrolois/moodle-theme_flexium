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

namespace theme_flexium\local;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * Tests for the breadcrumbs settings and rendering data.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(breadcrumbs::class)]
final class breadcrumbs_test extends \advanced_testcase {
    /**
     * Defaults are valid and typed; every setting and choice has its strings.
     */
    public function test_defaults_and_strings(): void {
        $this->resetAfterTest();

        $config = breadcrumbs::get_config();
        $this->assertTrue($config['enabled']);
        $this->assertSame(['catalogue', 'course', 'activity', 'admin', 'user', 'other'], $config['pages']);
        $this->assertSame('chevron', $config['separator']);
        $this->assertSame('0', $config['maxitems']);

        foreach (breadcrumbs::export_definitions() as $item) {
            $this->assertStringNotContainsString('[[', $item['label'], $item['key']);
            $this->assertStringNotContainsString('[[', $item['help'], $item['key']);
            foreach ($item['choices'] as $choice) {
                $this->assertStringNotContainsString('[[', $choice['label'], $item['key'] . ': ' . $choice['key']);
            }
        }
    }

    /**
     * save() keeps only "bc_" settings, cleans them and get_config() reads them back.
     */
    public function test_save(): void {
        $this->resetAfterTest();

        breadcrumbs::save([
            'bc_enabled' => '0',
            'bc_pages' => 'course,unknown,admin',
            'bc_separator' => 'nonsense',
            'bc_style' => 'boxed',
            'bc_unknown' => 'x',
            'style' => 'pills',
        ]);
        $this->assertSame('0', get_config('theme_flexium', 'bc_enabled'));
        $this->assertSame('course,admin', get_config('theme_flexium', 'bc_pages'));
        $this->assertSame('chevron', get_config('theme_flexium', 'bc_separator'));
        $this->assertFalse(get_config('theme_flexium', 'bc_unknown'));

        $config = breadcrumbs::get_config();
        $this->assertFalse($config['enabled']);
        $this->assertSame(['course', 'admin'], $config['pages']);
        $this->assertSame('boxed', $config['style']);

        $raw = breadcrumbs::get_raw();
        $this->assertSame('0', $raw['bc_enabled']);
        $this->assertSame('course,admin', $raw['bc_pages']);
    }

    /**
     * Page layouts and types and their kind of page.
     *
     * @return array
     */
    public static function page_kind_provider(): array {
        return [
            'site home' => ['frontpage', 'site-index', 'frontpage'],
            'dashboard' => ['mydashboard', 'my-index', 'dashboard'],
            'my courses' => ['mycourses', 'my-courses', 'dashboard'],
            'catalogue' => ['coursecategory', 'course-index-category', 'catalogue'],
            'admin' => ['admin', 'admin-setting', 'admin'],
            'user' => ['standard', 'user-profile', 'user'],
            'other' => ['standard', 'mod-forum-search', 'other'],
        ];
    }

    /**
     * page_kind() of system pages.
     *
     * @param string $layout
     * @param string $pagetype
     * @param string $expected
     */
    #[DataProvider('page_kind_provider')]
    public function test_page_kind(string $layout, string $pagetype, string $expected): void {
        $page = new \moodle_page();
        $page->set_context(\core\context\system::instance());
        $page->set_pagelayout($layout);
        $page->set_pagetype($pagetype);
        $this->assertSame($expected, breadcrumbs::page_kind($page));
    }

    /**
     * A course page: Home first, the course last; nothing where switched off.
     */
    public function test_export_course_page(): void {
        $this->resetAfterTest();
        $this->setAdminUser();
        $course = $this->getDataGenerator()->create_course(['fullname' => 'Astronomy', 'shortname' => 'ASTRO']);

        $page = $this->course_page($course);
        $this->assertSame('course', breadcrumbs::page_kind($page));
        $export = breadcrumbs::export($page);
        $this->assertNotNull($export);
        $this->assertSame('›', $export['separator']);
        $this->assertSame('plain', $export['style']);
        $this->assertTrue($export['items'][0]['ishome']);
        $this->assertSame((new \core\url('/'))->out(false), $export['items'][0]['url']);
        $last = end($export['items']);
        $this->assertTrue($last['islast']);
        $this->assertCount(1, array_filter(array_column($export['items'], 'islast')));

        // Items of the page's navbar, hidden ones marked (navigation_node::is_hidden()).
        set_config('bc_source', 'full', 'theme_flexium');
        $page = $this->course_page($course);
        $page->navbar->add('Visible part', new \core\url('/course/view.php', ['id' => $course->id, 'part' => 1]));
        $page->navbar->add('Hidden part', new \core\url('/course/view.php', ['id' => $course->id, 'part' => 2]));
        foreach ($page->navbar->get_items() as $node) {
            $node->hidden = $node->text === 'Hidden part';
        }
        $items = array_column(breadcrumbs::export($page)['items'], null, 'title');
        $this->assertFalse($items['Visible part']['hidden']);
        $this->assertTrue($items['Hidden part']['hidden']);
        set_config('bc_source', 'smart', 'theme_flexium');

        // No home item.
        set_config('bc_home', 'none', 'theme_flexium');
        $export = breadcrumbs::export($this->course_page($course));
        $this->assertArrayNotHasKey('ishome', $export['items'][0] ?? []);

        // Course pages switched off, then the breadcrumbs altogether.
        set_config('bc_pages', 'admin', 'theme_flexium');
        $this->assertNull(breadcrumbs::export($this->course_page($course)));
        set_config('bc_pages', 'course', 'theme_flexium');
        set_config('bc_enabled', '0', 'theme_flexium');
        $this->assertNull(breadcrumbs::export($this->course_page($course)));
    }

    /**
     * A course page.
     *
     * @param \stdClass $course
     * @return \moodle_page
     */
    private function course_page(\stdClass $course): \moodle_page {
        global $PAGE;
        $PAGE = new \moodle_page();
        $PAGE->set_url('/course/view.php', ['id' => $course->id]);
        $PAGE->set_course($course);
        $PAGE->set_pagelayout('course');
        $PAGE->set_pagetype('course-view-topics');
        return $PAGE;
    }
}
