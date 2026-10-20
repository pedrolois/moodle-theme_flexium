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
use theme_flexium\local\footer\footer;
use theme_flexium\local\home\home;

/**
 * Tests for the web services saving the footer and the home page.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(save_footer::class)]
#[CoversClass(save_home_page::class)]
final class save_footer_test extends \advanced_testcase {
    /**
     * Only site administrators can save the footer.
     */
    public function test_footer_requires_site_config(): void {
        $this->resetAfterTest();
        $this->setUser($this->getDataGenerator()->create_user());

        $this->expectException(\required_capability_exception::class);
        save_footer::execute(json_encode(['columns' => []]));
    }

    /**
     * Invalid JSON is refused.
     */
    public function test_footer_invalid_json(): void {
        $this->resetAfterTest();
        $this->setAdminUser();

        $this->expectException(\invalid_parameter_exception::class);
        save_footer::execute('{not json');
    }

    /**
     * An administrator saves the footer: cleaned and stored.
     */
    public function test_footer_save(): void {
        $this->resetAfterTest();
        $this->setAdminUser();

        $json = save_footer::execute(json_encode([
            'style' => ['moodlebutton' => false],
            'columns' => [['id' => 'c1', 'blocks' => [['id' => 'b1', 'type' => 'copyright', 'settings' => ['text' => 'X']],
                ['id' => 'b2', 'type' => 'evil']]]],
        ]));
        $saved = json_decode(external_api::clean_returnvalue(save_footer::execute_returns(), $json), true);

        $this->assertFalse($saved['style']['moodlebutton']);
        $this->assertTrue($saved['style']['bottombar']);
        $this->assertCount(1, $saved['columns'][0]['blocks']);
        $this->assertSame($saved, footer::get_layout());
    }

    /**
     * Only site administrators can save the home page.
     */
    public function test_home_requires_site_config(): void {
        $this->resetAfterTest();
        $this->setUser($this->getDataGenerator()->create_user());

        $this->expectException(\required_capability_exception::class);
        save_home_page::execute(json_encode(['sections' => []]));
    }

    /**
     * An administrator saves the home page: unknown sections dropped, stored.
     */
    public function test_home_save(): void {
        $this->resetAfterTest();
        $this->setAdminUser();

        $json = save_home_page::execute(json_encode([
            'template' => 'academy',
            'sections' => [
                ['id' => 's1', 'type' => 'hero', 'settings' => ['title' => 'Welcome', 'buttonurl' => 'javascript:alert(1)']],
                ['id' => 's2', 'type' => 'malware'],
            ],
        ]));
        $saved = json_decode($json, true);

        $this->assertSame('academy', $saved['template']);
        $this->assertCount(1, $saved['sections']);
        $this->assertSame('Welcome', $saved['sections'][0]['settings']['title']);
        $this->assertSame('', $saved['sections'][0]['settings']['buttonurl']);
        $this->assertSame($saved, home::get_page());
    }
}
