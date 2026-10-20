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
use theme_flexium\local\margins;

/**
 * Tests for the web service saving the page margins.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(save_page_margins::class)]
final class save_page_margins_test extends \advanced_testcase {
    /**
     * Only site administrators can save the margins.
     */
    public function test_requires_site_config(): void {
        $this->resetAfterTest();
        $this->setUser($this->getDataGenerator()->create_user());

        $this->expectException(\required_capability_exception::class);
        save_page_margins::execute([['scope' => 'site', 'left' => 10, 'right' => 10]]);
    }

    /**
     * An administrator saves the margins: cleaned, stored, logged and returned with -1 for the defaults.
     */
    public function test_save(): void {
        global $DB;
        $this->resetAfterTest();
        $this->setAdminUser();

        $result = save_page_margins::execute([
            ['scope' => 'site', 'left' => 24, 'right' => -1],
            ['scope' => 'catalog', 'left' => 9000, 'right' => 40, 'footer' => true, 'navbar' => true],
            ['scope' => 'bogus', 'left' => 10, 'right' => 10],
        ]);
        $result = external_api::clean_returnvalue(save_page_margins::execute_returns(), $result);

        $byscope = array_column($result, null, 'scope');
        $this->assertSame(array_keys(margins::SCOPES), array_keys($byscope));
        $this->assertSame(
            ['scope' => 'site', 'left' => 24, 'right' => -1, 'footer' => false, 'navbar' => false],
            $byscope['site']
        );
        $this->assertSame(
            ['scope' => 'home', 'left' => -1, 'right' => -1, 'footer' => false, 'navbar' => false],
            $byscope['home']
        );
        $this->assertSame(
            ['scope' => 'catalog', 'left' => margins::MAX, 'right' => 40, 'footer' => true, 'navbar' => true],
            $byscope['catalog']
        );

        $stored = margins::get();
        $this->assertSame(24, $stored['site']['left']);
        $this->assertNull($stored['site']['right']);
        $this->assertSame(margins::MAX, $stored['catalog']['left']);
        $this->assertTrue($DB->record_exists('config_log', ['plugin' => 'theme_flexium', 'name' => 'pagemargins']));
    }
}
