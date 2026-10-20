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

use core\context\system as context_system;
use core\context\user as context_user;
use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;
use theme_flexium\local\catalog\features;

/**
 * Web service storing the uploaded default header image of course cards (site administrators, catalogue edit mode).
 *
 * The image is first uploaded to the user's draft area with Moodle's file picker upload (repository_ajax.php); this
 * moves it into the theme setting "defaultcourseimage", the same one the settings page edits.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class save_default_image extends external_api {
    /**
     * Webservice parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'draftitemid' => new external_value(PARAM_INT, 'Draft area holding the uploaded image'),
            'filename' => new external_value(PARAM_FILE, 'Name of the uploaded image in the draft area'),
        ]);
    }

    /**
     * Store the image.
     *
     * @param int $draftitemid
     * @param string $filename
     * @return array ['url' => URL of the stored image]
     */
    public static function execute(int $draftitemid, string $filename): array {
        global $USER;

        $params = self::validate_parameters(self::execute_parameters(), compact('draftitemid', 'filename'));

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $fs = get_file_storage();
        $usercontext = context_user::instance($USER->id);
        $draft = $fs->get_file($usercontext->id, 'user', 'draft', $params['draftitemid'], '/', $params['filename']);
        if (!$draft || !file_mimetype_in_typegroup($draft->get_mimetype(), 'web_image')) {
            throw new \moodle_exception('invalidfiletype', 'error', '', $params['filename']);
        }

        // One image only: replace whatever was there.
        $fs->delete_area_files($context->id, 'theme_flexium', 'defaultcourseimage', 0);
        $fs->create_file_from_storedfile([
            'contextid' => $context->id,
            'component' => 'theme_flexium',
            'filearea' => 'defaultcourseimage',
            'itemid' => 0,
            'filepath' => '/',
            'filename' => $draft->get_filename(),
            'timemodified' => time(),
        ], $draft);
        $fs->delete_area_files($usercontext->id, 'user', 'draft', $params['draftitemid']);

        $old = get_config('theme_flexium', 'defaultcourseimage');
        $value = '/' . $draft->get_filename();
        set_config('defaultcourseimage', $value, 'theme_flexium');
        add_to_config_log('defaultcourseimage', $old === false ? null : $old, $value, 'theme_flexium');

        return ['url' => (string) features::custom_image_url()];
    }

    /**
     * Webservice returns.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'url' => new external_value(PARAM_URL, 'URL of the stored image'),
        ]);
    }
}
