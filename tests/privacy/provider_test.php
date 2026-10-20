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

namespace theme_flexium\privacy;

use core\context\user as context_user;
use core_privacy\local\metadata\collection;
use core_privacy\local\metadata\types\user_preference;
use core_privacy\local\request\writer;
use PHPUnit\Framework\Attributes\CoversClass;

/**
 * Tests for the privacy provider (catalogue user preferences).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(provider::class)]
final class provider_test extends \core_privacy\tests\provider_testcase {
    /**
     * The metadata lists both catalogue preferences and Google Fonts, with existing description strings.
     */
    public function test_get_metadata(): void {
        $collection = provider::get_metadata(new collection('theme_flexium'));

        $items = $collection->get_collection();
        $this->assertCount(3, $items);
        $names = [];
        foreach ($items as $item) {
            $this->assertTrue(get_string_manager()->string_exists($item->get_summary(), 'theme_flexium'));
            $names[] = $item->get_name();
            if ($item instanceof user_preference) {
                continue;
            }
            // Google Fonts: an external location receiving the IP address.
            $this->assertInstanceOf(\core_privacy\local\metadata\types\external_location::class, $item);
            foreach ($item->get_privacy_fields() as $field => $string) {
                $this->assertTrue(get_string_manager()->string_exists($string, 'theme_flexium'), $field);
            }
        }
        $this->assertSame(['theme_flexium_catalog_groups', 'theme_flexium_catalog_view', 'googlefonts'], $names);
    }

    /**
     * Both preferences are exported with their description.
     */
    public function test_export_user_preferences(): void {
        $this->resetAfterTest();
        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);
        set_user_preference('theme_flexium_catalog_groups', '{"category":true,"tag":false}', $user);
        set_user_preference('theme_flexium_catalog_view', 'list', $user);
        // Preferences of other plugins and users are not exported.
        set_user_preference('theme_boost_colour_mode', 'dark', $user);
        set_user_preference('theme_flexium_catalog_view', 'grid', $this->getDataGenerator()->create_user());

        provider::export_user_preferences($user->id);
        $writer = writer::with_context(context_user::instance($user->id));
        $this->assertTrue($writer->has_any_data());
        $preferences = (array) $writer->get_user_preferences('theme_flexium');
        $this->assertCount(2, $preferences);
        $this->assertSame('{"category":true,"tag":false}', $preferences['theme_flexium_catalog_groups']->value);
        $this->assertSame(
            get_string('privacy:metadata:preference:cataloggroups', 'theme_flexium'),
            $preferences['theme_flexium_catalog_groups']->description
        );
        $this->assertSame('list', $preferences['theme_flexium_catalog_view']->value);
        $this->assertSame(
            get_string('privacy:metadata:preference:catalogview', 'theme_flexium'),
            $preferences['theme_flexium_catalog_view']->description
        );
    }

    /**
     * Unset or empty preferences are not exported.
     */
    public function test_export_user_preferences_empty(): void {
        $this->resetAfterTest();
        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);
        set_user_preference('theme_flexium_catalog_view', '', $user);

        provider::export_user_preferences($user->id);
        $writer = writer::with_context(context_user::instance($user->id));
        $this->assertFalse($writer->has_any_data());
        $this->assertSame([], (array) $writer->get_user_preferences('theme_flexium'));
    }
}
