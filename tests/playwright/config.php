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
 * Read or restore Flexium settings exactly, so browser tests that save settings can put them back.
 *
 * Usage: php config.php get name1 name2 ...   prints a JSON object (null = not set)
 *        php config.php set '{"name": "value", "other": null}'   null unsets
 *        php config.php snapshot file.json   saves every theme setting
 *        php config.php restore file.json    puts every theme setting back exactly as saved
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('CLI_SCRIPT', true);
require(__DIR__ . '/../../../../config.php');

$command = $argv[1] ?? '';
if ($command === 'get') {
    $values = [];
    foreach (array_slice($argv, 2) as $name) {
        $value = get_config('theme_flexium', clean_param($name, PARAM_ALPHANUMEXT));
        $values[$name] = $value === false ? null : $value;
    }
    echo json_encode($values) . "\n";
} else if ($command === 'set') {
    foreach ((array) json_decode($argv[2] ?? '{}', true) as $name => $value) {
        $name = clean_param($name, PARAM_ALPHANUMEXT);
        if ($value === null) {
            unset_config($name, 'theme_flexium');
        } else {
            set_config($name, (string) $value, 'theme_flexium');
        }
    }
    // No theme cache reset on purpose: the tests only touch runtime settings (read with get_config()), and a reset
    // would make the next page rebuild the theme styles for minutes.
    echo "ok\n";
} else if ($command === 'snapshot' || $command === 'restore') {
    // Every theme setting at once: saved to a JSON file before tests that save settings, put back exactly after.
    $file = $argv[2] ?? '';
    if ($file === '') {
        cli_error('A file is required.');
    }
    $current = (array) get_config('theme_flexium');
    unset($current['version']);
    if ($command === 'snapshot') {
        file_put_contents($file, json_encode($current));
        echo count($current) . " settings saved\n";
    } else {
        $saved = (array) json_decode((string) file_get_contents($file), true);
        $changed = 0;
        foreach (array_diff_key($current, $saved) as $name => $value) {
            unset_config($name, 'theme_flexium');
            $changed++;
        }
        foreach ($saved as $name => $value) {
            if (!array_key_exists($name, $current) || (string) $current[$name] !== (string) $value) {
                set_config($name, (string) $value, 'theme_flexium');
                $changed++;
            }
        }
        // The catalogue keeps data built from the settings (filters) in its cache.
        \cache_helper::purge_by_definition('theme_flexium', 'catalogdata');
        echo "$changed settings restored\n";
    }
} else {
    cli_error('Usage: php config.php get name ... | set \'{"name": "value"}\' | snapshot file | restore file');
}
