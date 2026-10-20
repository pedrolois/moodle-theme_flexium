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

namespace theme_flexium\local\footer;

use PHPUnit\Framework\Attributes\CoversClass;

/**
 * Tests for the footer builder.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(footer::class)]
final class footer_test extends \advanced_testcase {
    /**
     * The blocks of a layout, keyed by type (the first of each type).
     *
     * @param array $layout
     * @return array type => block
     */
    private function blocks_by_type(array $layout): array {
        $blocks = [];
        foreach (array_merge(array_merge(...array_column($layout['columns'], 'blocks')), $layout['bottom']) as $block) {
            $blocks[$block['type']] ??= $block;
        }
        return $blocks;
    }

    /**
     * The default footer of a new site is never empty: every block filled from the site itself.
     */
    public function test_default_layout_is_filled(): void {
        global $CFG;
        $this->resetAfterTest();

        $CFG->supportemail = 'help@example.com';
        $layout = footer::default_layout();

        $this->assertCount(4, $layout['columns']);
        foreach ($layout['columns'] as $column) {
            $this->assertNotEmpty($column['blocks']);
        }
        $this->assertNotEmpty($layout['bottom']);
        $this->assertTrue($layout['style']['bottombar']);
        $this->assertTrue($layout['style']['moodlebutton']);

        $blocks = $this->blocks_by_type($layout);
        foreach (['logo', 'text', 'links', 'contact', 'support', 'social', 'copyright', 'legal', 'usertour'] as $type) {
            $this->assertArrayHasKey($type, $blocks, $type);
            $this->assertContains($type, footer::TYPES);
        }
        $this->assertNotSame('', trim($blocks['text']['settings']['text']));
        $this->assertSame('help@example.com', $blocks['contact']['settings']['email']);
        $this->assertSame((new \core\url('/'))->out(false), $blocks['contact']['settings']['website']);
        $this->assertNotEmpty($blocks['contact']['settings']['title']);

        $links = $blocks['links']['settings']['items'];
        $this->assertCount(4, $links);
        foreach ($links as $link) {
            $this->assertNotSame('', $link['name']);
            $this->assertStringStartsWith($CFG->wwwroot, $link['url']);
        }
        $this->assertContains((new \core\url('/course/index.php'))->out(false), array_column($links, 'url'));

        // No social settings: sample networks to replace.
        $this->assertSame(array_keys(footer::DEFAULT_SOCIAL), array_column($blocks['social']['settings']['items'], 'network'));
        $this->assertSame(footer::LEGAL, $blocks['legal']['settings']['items']);
    }

    /**
     * The default text: the old footer content, else the site summary, else a default text.
     */
    public function test_default_layout_text_sources(): void {
        global $DB, $SITE;
        $this->resetAfterTest();

        $DB->set_field('course', 'summary', '', ['id' => SITEID]);
        $SITE->summary = '';
        $text = $this->blocks_by_type(footer::default_layout())['text']['settings']['text'];
        $this->assertSame(get_string('footer_defaulttext', 'theme_flexium'), $text);

        // The site is cached in $SITE (get_site()): update both.
        $DB->set_field('course', 'summary', '<p>Learning for everyone</p>', ['id' => SITEID]);
        $SITE->summary = '<p>Learning for everyone</p>';
        $text = $this->blocks_by_type(footer::default_layout())['text']['settings']['text'];
        $this->assertSame('Learning for everyone', $text);

        set_config('footercontent', '<p>Our own footer</p>', 'theme_flexium');
        $text = $this->blocks_by_type(footer::default_layout())['text']['settings']['text'];
        $this->assertSame('Our own footer', $text);
    }

    /**
     * The older footer settings (contact, social links) win over the site values.
     */
    public function test_default_layout_older_settings(): void {
        global $CFG;
        $this->resetAfterTest();

        $CFG->supportemail = 'help@example.com';
        set_config('contactemail', 'office@example.org', 'theme_flexium');
        set_config('contactwebsite', 'https://example.org/', 'theme_flexium');
        set_config('contactphone', '+34 600 000 000', 'theme_flexium');
        set_config('social_github', 'https://github.com/example', 'theme_flexium');

        $blocks = $this->blocks_by_type(footer::default_layout());
        $this->assertSame('office@example.org', $blocks['contact']['settings']['email']);
        $this->assertSame('https://example.org/', $blocks['contact']['settings']['website']);
        $this->assertSame('+34 600 000 000', $blocks['contact']['settings']['phone']);
        $this->assertSame(
            [['network' => 'github', 'url' => 'https://github.com/example']],
            $blocks['social']['settings']['items']
        );
    }

    /**
     * get_layout() returns the default footer until one is saved, and the saved one after.
     */
    public function test_get_layout_and_save(): void {
        global $DB;
        $this->resetAfterTest();

        $default = footer::get_layout();
        $this->assertCount(4, $default['columns']);

        $saved = footer::save(['columns' => [['id' => 'one', 'blocks' => [['id' => 'b1', 'type' => 'copyright',
            'settings' => ['text' => 'Hi']]]]], 'bottom' => []]);
        $this->assertSame($saved, footer::get_layout());
        $this->assertCount(1, footer::get_layout()['columns']);
        $this->assertTrue($DB->record_exists('config_log', ['plugin' => 'theme_flexium', 'name' => 'footerlayout']));
    }

    /**
     * clean(): unknown blocks dropped, ids made safe, settings cleaned, switches explicit booleans.
     */
    public function test_clean(): void {
        $clean = footer::clean([
            'style' => ['background' => 'light', 'bottombar' => false],
            'columns' => [
                ['id' => 'col 1!', 'blocks' => [
                    ['id' => 'x', 'type' => 'text', 'settings' => ['text' => '<script>alert(1)</script>Hello']],
                    ['id' => 'y', 'type' => 'unknown'],
                    'not a block',
                ]],
            ],
            'bottom' => [['type' => 'copyright']],
        ]);

        $this->assertSame('light', $clean['style']['background']);
        $this->assertFalse($clean['style']['bottombar']);
        $this->assertTrue($clean['style']['moodlebutton']);
        $this->assertSame('col1', $clean['columns'][0]['id']);
        $this->assertCount(1, $clean['columns'][0]['blocks']);
        $this->assertStringNotContainsString('<script>', $clean['columns'][0]['blocks'][0]['settings']['text']);
        $this->assertStringContainsString('Hello', $clean['columns'][0]['blocks'][0]['settings']['text']);
        // Missing ids get a random one.
        $this->assertNotSame('', $clean['bottom'][0]['id']);
        $this->assertSame([], $clean['bottom'][0]['settings']);

        // At most six columns.
        $many = footer::clean(['columns' => array_fill(0, 9, ['blocks' => []])]);
        $this->assertCount(6, $many['columns']);
    }

    /**
     * A footer bigger than the limit is refused.
     */
    public function test_save_too_large(): void {
        $this->resetAfterTest();

        $columns = [];
        for ($i = 0; $i < 6; $i++) {
            $blocks = [];
            for ($j = 0; $j < 30; $j++) {
                $blocks[] = ['type' => 'text', 'settings' => ['text' => str_repeat('x', 1000)]];
            }
            $columns[] = ['blocks' => $blocks];
        }
        $this->expectException(\moodle_exception::class);
        footer::save(['columns' => $columns]);
    }
}
