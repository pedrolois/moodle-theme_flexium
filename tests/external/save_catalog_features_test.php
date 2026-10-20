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
use theme_flexium\local\catalog\features;

/**
 * Tests for the web services saving the catalogue settings (features and options).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(save_catalog_features::class)]
#[CoversClass(save_catalog_options::class)]
final class save_catalog_features_test extends \advanced_testcase {
    /**
     * Only site administrators can save the features.
     */
    public function test_features_require_site_config(): void {
        $this->resetAfterTest();
        $this->setUser($this->getDataGenerator()->create_user());

        $this->expectException(\required_capability_exception::class);
        save_catalog_features::execute([['name' => 'navlink', 'value' => '0']]);
    }

    /**
     * An administrator saves features: cleaned values stored, every feature returned.
     */
    public function test_features_save(): void {
        $this->resetAfterTest();
        $this->setAdminUser();

        $result = save_catalog_features::execute([
            ['name' => 'navlink', 'value' => '0'],
            ['name' => 'navlinktext', 'value' => '<i>Catalogue</i>'],
            ['name' => 'blockiconposition', 'value' => 'nowhere'],
            ['name' => 'bc_separator', 'value' => 'slash'],
        ]);
        $result = external_api::clean_returnvalue(save_catalog_features::execute_returns(), $result);
        $values = array_column($result, 'value', 'name');

        $this->assertSame('0', $values['navlink']);
        $this->assertSame('Catalogue', $values['navlinktext']);
        $this->assertSame('top', $values['blockiconposition']);
        $this->assertSame('slash', $values['bc_separator']);
        $this->assertCount(count(features::definitions()), array_intersect_key($values, features::definitions()));

        $this->assertFalse(features::get('navlink'));
        $this->assertSame('Catalogue', features::get('navlinktext'));
        $this->assertSame('slash', get_config('theme_flexium', 'bc_separator'));
    }

    /**
     * Only site administrators can save the catalogue options.
     */
    public function test_options_require_site_config(): void {
        $this->resetAfterTest();
        $this->setUser($this->getDataGenerator()->create_user());

        $this->expectException(\required_capability_exception::class);
        save_catalog_options::execute(24, true, true);
    }

    /**
     * An administrator saves the catalogue options; an unknown page size becomes the first choice.
     */
    public function test_options_save(): void {
        $this->resetAfterTest();
        $this->setAdminUser();

        $result = external_api::clean_returnvalue(
            save_catalog_options::execute_returns(),
            save_catalog_options::execute(36, true, false)
        );
        $this->assertSame(['perpage' => 36, 'userperpage' => true, 'filtersdraweropen' => false], $result);
        $this->assertSame('36', get_config('theme_flexium', 'perpage'));
        $this->assertSame('1', get_config('theme_flexium', 'userperpage'));
        $this->assertSame('0', get_config('theme_flexium', 'filtersdraweropen'));

        $result = save_catalog_options::execute(13, false, true);
        $this->assertSame(12, $result['perpage']);
        $this->assertSame('12', get_config('theme_flexium', 'perpage'));
    }
}
