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
 * Tests for the web service saving the header image of courses without an image.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(save_default_image::class)]
final class save_default_image_test extends \advanced_testcase {
    /**
     * Put a file in a new draft area of the current user.
     *
     * @param string $filename
     * @param string $pathname source file
     * @return int draft item id
     */
    private function create_draft(string $filename, string $pathname): int {
        global $USER;
        $draftitemid = file_get_unused_draft_itemid();
        get_file_storage()->create_file_from_pathname([
            'contextid' => \core\context\user::instance($USER->id)->id,
            'component' => 'user',
            'filearea' => 'draft',
            'itemid' => $draftitemid,
            'filepath' => '/',
            'filename' => $filename,
        ], $pathname);
        return $draftitemid;
    }

    /**
     * Only site administrators can upload the image.
     */
    public function test_requires_site_config(): void {
        global $CFG;
        $this->resetAfterTest();
        $this->setUser($this->getDataGenerator()->create_user());
        $draftitemid = $this->create_draft('logo.png', $CFG->dirroot . '/lib/tests/fixtures/gd-logo.png');

        $this->expectException(\required_capability_exception::class);
        save_default_image::execute($draftitemid, 'logo.png');
    }

    /**
     * An administrator uploads an image: it replaces the previous one and becomes the custom header.
     */
    public function test_save(): void {
        global $CFG;
        $this->resetAfterTest();
        $this->setAdminUser();

        $first = $this->create_draft('first.png', $CFG->dirroot . '/lib/tests/fixtures/gd-logo.png');
        save_default_image::execute($first, 'first.png');
        $second = $this->create_draft('second.png', $CFG->dirroot . '/pix/moodlelogo.png');
        $result = external_api::clean_returnvalue(
            save_default_image::execute_returns(),
            save_default_image::execute($second, 'second.png')
        );

        $this->assertStringEndsWith('/second.png', $result['url']);
        $this->assertSame($result['url'], features::custom_image_url());
        $this->assertSame('/second.png', get_config('theme_flexium', 'defaultcourseimage'));

        $context = \core\context\system::instance();
        $files = get_file_storage()->get_area_files($context->id, 'theme_flexium', 'defaultcourseimage', 0, 'id', false);
        $this->assertSame(['second.png'], array_values(array_map(fn($file) => $file->get_filename(), $files)));
        // The draft area is emptied.
        $usercontext = \core\context\user::instance(get_admin()->id);
        $this->assertTrue(get_file_storage()->is_area_empty($usercontext->id, 'user', 'draft', $second));
    }

    /**
     * Files that are not web images, or missing files, are refused.
     */
    public function test_refuses_non_images(): void {
        global $CFG;
        $this->resetAfterTest();
        $this->setAdminUser();

        $draftitemid = $this->create_draft('notes.txt', $CFG->dirroot . '/theme/flexium/version.php');
        try {
            save_default_image::execute($draftitemid, 'notes.txt');
            $this->fail('A text file was accepted');
        } catch (\moodle_exception $exception) {
            $this->assertSame('invalidfiletype', $exception->errorcode);
        }

        $this->expectException(\moodle_exception::class);
        save_default_image::execute($draftitemid, 'missing.png');
    }
}
