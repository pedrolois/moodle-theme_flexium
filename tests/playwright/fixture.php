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

/**
 * Test data of the Flexium browser tests: created before a run, removed after it.
 *
 * Usage: php fixture.php create   prints a JSON object {username, password, courses: {key: id}}
 *        php fixture.php delete   removes the account and the courses
 *
 * The account is a temporary site administrator with a random password, so no real person's account and no stored
 * password are needed. The courses carry a word no real course uses ("Zephyrine"), so searches are site-independent.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('CLI_SCRIPT', true);
require(__DIR__ . '/../../../../config.php');
require_once($CFG->dirroot . '/user/lib.php');
require_once($CFG->dirroot . '/course/lib.php');

/** Username of the temporary administrator. */
const FLEXIUM_E2E_USER = 'flexium_e2e';
/** Short name prefix of the test courses. */
const FLEXIUM_E2E_PREFIX = 'flexium_e2e_';

/**
 * The test courses: key => [full name, summary, visible, self enrolment open].
 */
const FLEXIUM_E2E_COURSES = [
    'open' => ['Zephyrine Analytics Fundamentals', 'Learn Zephyrine data skills at your own pace.', 1, true],
    'closed' => ['Zephyrine Leadership Lab', 'A Zephyrine course for team leaders.', 1, false],
    'hidden' => ['Zephyrine Hidden Draft', 'Not published yet.', 0, false],
];

/**
 * Remove the account (from the site administrators first) and the courses of a previous run.
 */
function flexium_e2e_delete(): void {
    global $DB;

    if ($user = $DB->get_record('user', ['username' => FLEXIUM_E2E_USER, 'deleted' => 0])) {
        $admins = array_filter(explode(',', get_config('core', 'siteadmins')), fn($id) => (int) $id !== (int) $user->id);
        set_config('siteadmins', implode(',', $admins));
        delete_user($user);
    }
    $courses = $DB->get_records_select(
        'course',
        $DB->sql_like('shortname', ':prefix'),
        ['prefix' => $DB->sql_like_escape(FLEXIUM_E2E_PREFIX) . '%']
    );
    foreach ($courses as $course) {
        delete_course($course, false);
    }
}

$command = $argv[1] ?? '';
if ($command === 'delete') {
    flexium_e2e_delete();
    echo "deleted\n";
    exit(0);
}
if ($command !== 'create') {
    cli_error('Usage: php fixture.php create|delete');
}

// A clean start, whatever a failed run left behind.
flexium_e2e_delete();

$password = 'Ce2e!' . random_string(16);
$userid = \core\user::create_user((object) [
    'username' => FLEXIUM_E2E_USER,
    'password' => $password,
    'firstname' => 'Flexium',
    'lastname' => 'Browser tests',
    'email' => 'flexium_e2e@example.invalid',
    'auth' => 'manual',
    'confirmed' => 1,
    'mnethostid' => $CFG->mnet_localhost_id,
    'lang' => 'en',
]);
set_config('siteadmins', get_config('core', 'siteadmins') . ',' . $userid);

$category = \core_course_category::get_default();
$self = enrol_get_plugin('self');
$ids = [];
foreach (FLEXIUM_E2E_COURSES as $key => [$fullname, $summary, $visible, $selfenrol]) {
    $course = create_course((object) [
        'fullname' => $fullname,
        'shortname' => FLEXIUM_E2E_PREFIX . $key,
        'category' => $category->id,
        'summary' => $summary,
        'summaryformat' => FORMAT_HTML,
        'visible' => $visible,
        'startdate' => time() - DAYSECS,
    ]);
    if ($selfenrol && $self) {
        $self->add_instance($course, ['status' => ENROL_INSTANCE_ENABLED, 'customint6' => 1]);
    } else {
        // No way in for people not enrolled: guest access off too (new courses get it as the site default says).
        foreach (enrol_get_instances($course->id, true) as $instance) {
            if ($instance->enrol !== 'manual' && ($plugin = enrol_get_plugin($instance->enrol))) {
                $plugin->update_status($instance, ENROL_INSTANCE_DISABLED);
            }
        }
    }
    $ids[$key] = (int) $course->id;
}

echo json_encode(['username' => FLEXIUM_E2E_USER, 'password' => $password, 'courses' => $ids]) . "\n";
