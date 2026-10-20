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

namespace theme_flexium;

use PHPUnit\Framework\Attributes\CoversFunction;

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/theme/flexium/lib.php');
require_once($CFG->dirroot . '/user/externallib.php');

/**
 * Tests for the theme callbacks of lib.php: setting files and catalogue user preferences.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversFunction('theme_flexium_pluginfile')]
#[CoversFunction('theme_flexium_user_preferences')]
#[CoversFunction('theme_flexium_get_main_scss_content')]
final class lib_test extends \advanced_testcase {
    /**
     * Save catalogue preferences as the catalogue does (core_user_set_user_preferences).
     *
     * @param array $preferences list of ['name', 'value', 'userid']
     * @return array saved and warnings
     */
    private function set_preferences(array $preferences): array {
        $result = \core_user_external::set_user_preferences($preferences);
        return \core_external\external_api::clean_returnvalue(\core_user_external::set_user_preferences_returns(), $result);
    }

    /**
     * Files of other areas or contexts are not served.
     */
    public function test_pluginfile_refused(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $system = \core\context\system::instance();

        // Sending the 404 header warns on the command line, where the output has already started.
        set_error_handler(fn(int $errno, string $message) => str_contains($message, 'Cannot modify header'), E_WARNING);
        try {
            foreach (
                [
                [$system, 'logo'],
                [\core\context\course::instance($course->id), 'defaultcourseimage'],
                ] as [$context, $filearea]
            ) {
                try {
                    theme_flexium_pluginfile(null, null, $context, $filearea, ['1', 'image.png'], false);
                    $this->fail('Exception expected');
                } catch (\moodle_exception $e) {
                    $this->assertSame('filenotfound', $e->errorcode);
                }
            }
        } finally {
            restore_error_handler();
        }
    }

    /**
     * The main SCSS is the Boost preset followed by the Flexium styles.
     */
    public function test_main_scss(): void {
        $scss = theme_flexium_get_main_scss_content(\theme_config::load('flexium'));
        $this->assertStringContainsString('flexium', $scss);
        $this->assertGreaterThan(strlen(file_get_contents(__DIR__ . '/../../boost/scss/preset/default.scss')), strlen($scss));
    }

    /**
     * Both catalogue preferences are defined, and users save their own values.
     */
    public function test_user_preferences(): void {
        $this->resetAfterTest();
        $definitions = theme_flexium_user_preferences();
        $this->assertSame(['theme_flexium_catalog_groups', 'theme_flexium_catalog_view'], array_keys($definitions));

        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);
        $result = $this->set_preferences([
            ['name' => 'theme_flexium_catalog_groups', 'value' => '{"category":true}', 'userid' => 0],
            ['name' => 'theme_flexium_catalog_view', 'value' => 'list', 'userid' => 0],
        ]);
        $this->assertSame([], $result['warnings']);
        $this->assertCount(2, $result['saved']);
        $this->assertSame('{"category":true}', get_user_preferences('theme_flexium_catalog_groups', null, $user));
        $this->assertSame('list', get_user_preferences('theme_flexium_catalog_view', null, $user));
    }

    /**
     * Unknown views fall back to the default (no choice).
     */
    public function test_user_preferences_invalid_view(): void {
        $this->resetAfterTest();
        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);

        $this->assertSame('grid', \core_user::clean_preference('grid', 'theme_flexium_catalog_view'));
        $this->assertSame('', \core_user::clean_preference('table', 'theme_flexium_catalog_view'));
        $this->assertSame('', \core_user::clean_preference('<b>list</b>', 'theme_flexium_catalog_view'));

        $this->set_preferences([['name' => 'theme_flexium_catalog_view', 'value' => 'table', 'userid' => 0]]);
        $this->assertSame('', get_user_preferences('theme_flexium_catalog_view', null, $user));
    }

    /**
     * Users can only change their own catalogue preferences, even administrators.
     */
    public function test_user_preferences_other_user(): void {
        $this->resetAfterTest();
        $other = $this->getDataGenerator()->create_user();
        $this->setAdminUser();

        $result = $this->set_preferences([
            ['name' => 'theme_flexium_catalog_view', 'value' => 'list', 'userid' => $other->id],
        ]);
        $this->assertSame([], $result['saved']);
        $this->assertSame('nopermission', $result['warnings'][0]['warningcode']);
        $this->assertNull(get_user_preferences('theme_flexium_catalog_view', null, $other));

        // Guests cannot save preferences.
        $this->setGuestUser();
        $this->assertFalse(\core_user::can_edit_preference('theme_flexium_catalog_view', \core_user::get_user($other->id)));
    }
}
