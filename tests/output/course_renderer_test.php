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

namespace theme_flexium\output\core;

use PHPUnit\Framework\Attributes\CoversClass;

/**
 * Tests for the course renderer: catalogue, site home and course information box.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(course_renderer::class)]
final class course_renderer_test extends \advanced_testcase {
    /**
     * The course renderer of the theme.
     *
     * @return course_renderer
     */
    private function renderer(): course_renderer {
        $page = new \moodle_page();
        $page->set_url('/');
        $page->set_context(\core\context\system::instance());
        $page->set_pagelayout('frontpage');
        $page->force_theme('flexium');
        $renderer = $page->get_renderer('core', 'course');
        $this->assertInstanceOf(course_renderer::class, $renderer);
        return $renderer;
    }

    /**
     * Props of the React component of some markup.
     *
     * @param string $html
     * @param string $module expected component
     * @return array
     */
    private function props(string $html, string $module): array {
        $this->assertMatchesRegularExpression('/data-react-component="' . preg_quote($module, '/') . '"/', $html);
        $this->assertSame(1, preg_match('/data-react-props="([^"]*)"/', $html, $matches));
        return json_decode(htmlspecialchars_decode($matches[1]), true);
    }

    /**
     * The course information box shows the course image, summary, dates and custom fields.
     */
    public function test_course_info_box(): void {
        $this->resetAfterTest();
        $fieldgenerator = $this->getDataGenerator()->get_plugin_generator('core_customfield');
        $field = $fieldgenerator->create_field(['categoryid' => $fieldgenerator->create_category()->get('id'),
            'type' => 'text', 'shortname' => 'language', 'name' => 'Language', 'configdata' => ['visibility' => 2]]);
        $course = $this->getDataGenerator()->create_course(['fullname' => 'Data analysis',
            'summary' => '<p>Learn the basics.</p>', 'summaryformat' => FORMAT_HTML, 'startdate' => make_timestamp(2026, 11, 2)]);
        $fieldgenerator->add_instance_data($field, $course->id, 'Spanish');
        $this->setUser($this->getDataGenerator()->create_user());

        $html = $this->renderer()->course_info_box($course);
        $this->assertStringContainsString('flexium-courseinfo', $html);
        $this->assertStringContainsString('Data analysis', $html);
        $this->assertStringContainsString('<p>Learn the basics.</p>', $html);
        $this->assertStringContainsString('fa-solid fa-globe', $html);
        $this->assertStringContainsString('Spanish', $html);
        $this->assertStringContainsString(
            userdate(make_timestamp(2026, 11, 2), get_string('strftimedate', 'langconfig')),
            $html
        );
        $this->assertStringNotContainsString('flexium-courseinfo__body--nosummary', $html);

        // Without summary: the facts take the whole width.
        $course->summary = '';
        $this->assertStringContainsString(
            'flexium-courseinfo__body--nosummary',
            $this->renderer()->course_info_box($course)
        );

        // With the "Course page" feature off, Moodle's box.
        set_config('feature_coursepage', '0', 'theme_flexium');
        $html = $this->renderer()->course_info_box($course);
        $this->assertStringNotContainsString('flexium-courseinfo', $html);
        $this->assertStringContainsString('generalbox info', $html);
    }

    /**
     * The site home is the home page builder, with Moodle's site home content inside; Moodle's when disabled.
     */
    public function test_frontpage(): void {
        global $CFG;
        $this->resetAfterTest();
        $this->getDataGenerator()->create_course(['fullname' => 'Visible course']);
        $CFG->frontpage = (string) FRONTPAGEALLCOURSELIST;
        $CFG->frontpageloggedin = (string) FRONTPAGEALLCOURSELIST;
        $this->setUser($this->getDataGenerator()->create_user());

        $props = $this->props($this->renderer()->frontpage(), '@moodle/lms/theme_flexium/home/HomePage');
        $this->assertNotEmpty($props['page']['sections']);
        $this->assertStringContainsString('Visible course', $props['sitecontent']);
        $this->assertTrue($props['loggedin']);
        $this->assertFalse($props['canedit']);
        $this->assertNull($props['editor']);
        $this->assertStringContainsString('/course/index.php', $props['catalogurl']);

        set_config('enablehome', 0, 'theme_flexium');
        $html = $this->renderer()->frontpage();
        $this->assertStringNotContainsString('data-react-component', $html);
        $this->assertStringContainsString('Visible course', $html);
        $this->assertStringContainsString('frontpage-available-course-list', $html);
    }

    /**
     * The site summary section stays in the page, hidden, while the home page builder is on.
     */
    public function test_frontpage_section1(): void {
        global $CFG, $DB, $PAGE, $SITE;
        require_once($CFG->dirroot . '/course/lib.php');
        $this->resetAfterTest();
        // The course format renders the section with the global page.
        $PAGE->set_url('/');
        course_create_sections_if_missing($SITE, 1);
        $DB->set_field('course_sections', 'summary', 'Welcome to our site', ['course' => SITEID, 'section' => 1]);
        rebuild_course_cache(SITEID, true);
        $this->setAdminUser();

        $html = $this->renderer()->frontpage_section1();
        $this->assertStringContainsString('flexium-sitesection', $html);
        $this->assertStringContainsString('hidden', $html);

        set_config('enablehome', 0, 'theme_flexium');
        $this->assertStringNotContainsString('flexium-sitesection', $this->renderer()->frontpage_section1());
    }

    /**
     * The course index is the catalogue, opened on the requested category when the category filter is shown.
     */
    public function test_course_category(): void {
        $this->resetAfterTest();
        $category = $this->getDataGenerator()->create_category(['name' => 'Sciences']);
        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);
        set_user_preference('theme_flexium_catalog_view', 'list');
        set_config('perpage', 9999, 'theme_flexium');

        $props = $this->props(
            $this->renderer()->course_category($category->id),
            '@moodle/lms/theme_flexium/catalog/Catalog'
        );
        $this->assertSame((string) $category->id, $props['initialcategory']);
        $this->assertSame('list', $props['savedview']);
        $this->assertTrue($props['loggedin']);
        $this->assertFalse($props['canedit']);
        $this->assertNull($props['editor']);
        // An unknown page size falls back to the first option.
        $this->assertSame(\theme_flexium\local\catalog\catalog::PERPAGE_OPTIONS[0], $props['perpage']);
        $this->assertArrayHasKey('catalog_search', $props['strings']);

        // Without the category filter, the catalogue opens unfiltered.
        set_config('catalogfilters', json_encode([['source' => 'tag', 'expanded' => true]]), 'theme_flexium');
        $props = $this->props(
            $this->renderer()->course_category($category),
            '@moodle/lms/theme_flexium/catalog/Catalog'
        );
        $this->assertSame('', $props['initialcategory']);

        // Administrators may open the editor.
        $this->setAdminUser();
        $props = $this->props($this->renderer()->course_category(0), '@moodle/lms/theme_flexium/catalog/Catalog');
        $this->assertTrue($props['canedit']);
    }

    /**
     * With the catalogue disabled, Moodle's category listing is kept.
     */
    public function test_course_category_disabled(): void {
        $this->resetAfterTest();
        $category = $this->getDataGenerator()->create_category(['name' => 'Sciences']);
        set_config('enablecatalog', 0, 'theme_flexium');
        $this->setAdminUser();

        $html = $this->renderer()->course_category($category->id);
        $this->assertStringNotContainsString('data-react-component', $html);
        $this->assertStringContainsString('Sciences', $html);
    }

    /**
     * Catalogue strings keep placeholders for the client.
     */
    public function test_catalog_strings(): void {
        $strings = course_renderer::catalog_strings();
        $this->assertSame(get_string('expandall'), $strings['catalog_expandall']);
        $this->assertStringContainsString('{from}', $strings['catalog_showing']);
        $this->assertStringContainsString('{total}', $strings['catalog_showing']);
        foreach ($strings as $key => $string) {
            $this->assertNotSame('', $string, $key);
            $this->assertStringNotContainsString('[[', $string, $key);
        }
    }
}
