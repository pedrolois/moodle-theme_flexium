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
 * After the run: put every theme setting back as it was before the run, remove the temporary site admin and the test
 * courses, and forget its password.
 *
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = async () => {
    const php = process.env.PHP_BINARY || 'php';
    const settings = path.join(__dirname, '.auth', 'settings.json');
    if (fs.existsSync(settings)) {
        execFileSync(php, [path.join(__dirname, 'config.php'), 'restore', settings], { stdio: 'inherit' });
    }
    execFileSync(php, [path.join(__dirname, 'fixture.php'), 'delete'], { stdio: 'inherit' });
    for (const file of ['fixture.json', 'admin.json', 'settings.json']) {
        fs.rmSync(path.join(__dirname, '.auth', file), { force: true });
    }
};
