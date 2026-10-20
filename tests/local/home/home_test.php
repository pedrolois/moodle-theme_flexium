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

namespace theme_flexium\local\home;

use PHPUnit\Framework\Attributes\CoversClass;

/**
 * Tests for the home page builder and its templates.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(home::class)]
#[CoversClass(templates::class)]
final class home_test extends \advanced_testcase {
    /**
     * The builder replaces the site home unless switched off.
     */
    public function test_enabled(): void {
        $this->resetAfterTest();

        $this->assertTrue(home::enabled());
        set_config('enablehome', 0, 'theme_flexium');
        $this->assertFalse(home::enabled());
        set_config('enablehome', 1, 'theme_flexium');
        $this->assertTrue(home::enabled());
    }

    /**
     * Every template has its texts and only known sections with unique ids, and survives clean() unchanged.
     */
    public function test_templates_are_valid(): void {
        $all = templates::get_all();
        $this->assertSame(templates::KEYS, array_column($all, 'key'));
        foreach ($all as $template) {
            $key = $template['key'];
            $this->assertNotSame('', $template['name'], $key);
            $this->assertStringNotContainsString('[[', $template['name'], $key);
            $this->assertStringNotContainsString('[[', $template['description'], $key);
            $this->assertNotEmpty($template['sections'], $key);
            $ids = array_column($template['sections'], 'id');
            $this->assertSame(count($ids), count(array_unique($ids)), $key);
            foreach ($template['sections'] as $section) {
                $this->assertContains($section['type'], home::TYPES, $key);
            }
            $this->assertStringNotContainsString('[[', json_encode($template['sections']), $key);

            $clean = home::clean(['template' => $key, 'sections' => $template['sections']]);
            $this->assertSame($key, $clean['template']);
            $this->assertSame(array_column($template['sections'], 'type'), array_column($clean['sections'], 'type'), $key);
            $this->assertSame($ids, array_column($clean['sections'], 'id'), $key);
        }
    }

    /**
     * Nothing saved: the page is the first template.
     */
    public function test_get_page_default(): void {
        $this->resetAfterTest();

        $first = templates::get_all()[0];
        $page = home::get_page();
        $this->assertSame($first['key'], $page['template']);
        $this->assertSame(array_column($first['sections'], 'type'), array_column($page['sections'], 'type'));
    }

    /**
     * clean(): unknown sections dropped, texts, rich texts and URLs cleaned, numbers and booleans kept, nested lists.
     */
    public function test_clean(): void {
        $page = home::clean([
            'template' => 'my template!',
            'sections' => [
                ['id' => 'a', 'type' => 'faq', 'settings' => [
                    'title' => '<b>Questions</b>',
                    'count' => 4,
                    'show' => false,
                    'items' => [['question' => 'Why?', 'answer' => '<p>Because <script>x()</script></p>']],
                ]],
                ['id' => 'b', 'type' => 'cta', 'settings' => ['buttonurl' => 'https://example.com/a?b=c']],
                ['type' => 'nope'],
                'garbage',
            ],
        ]);

        $this->assertSame('mytemplate', $page['template']);
        $this->assertCount(2, $page['sections']);
        $faq = $page['sections'][0]['settings'];
        $this->assertSame('Questions', $faq['title']);
        $this->assertSame(4, $faq['count']);
        $this->assertFalse($faq['show']);
        $this->assertSame('Why?', $faq['items'][0]['question']);
        $this->assertStringContainsString('<p>Because', $faq['items'][0]['answer']);
        $this->assertStringNotContainsString('<script>', $faq['items'][0]['answer']);
        $this->assertSame('https://example.com/a?b=c', $page['sections'][1]['settings']['buttonurl']);

        // At most MAX_SECTIONS sections.
        $many = home::clean(['sections' => array_fill(0, home::MAX_SECTIONS + 5, ['type' => 'spacer'])]);
        $this->assertCount(home::MAX_SECTIONS, $many['sections']);
    }

    /**
     * Data of the dynamic sections: top categories with their course counts and visible-course figures.
     */
    public function test_get_data(): void {
        $this->resetAfterTest();
        $generator = $this->getDataGenerator();
        $category = $generator->create_category(['name' => 'Languages']);
        $sub = $generator->create_category(['name' => 'French', 'parent' => $category->id]);
        $generator->create_course(['category' => $sub->id]);
        $generator->create_course(['category' => $category->id]);
        $generator->create_course(['category' => $category->id, 'visible' => 0]);

        $this->setAdminUser();
        $data = home::get_data();
        $categories = array_column($data['categories'], null, 'name');
        $this->assertArrayHasKey('Languages', $categories);
        $this->assertArrayNotHasKey('French', $categories);
        $this->assertSame(3, $categories['Languages']['coursecount']);
        $this->assertSame(2, $data['stats']['courses']);
    }
}
