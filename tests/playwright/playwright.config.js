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
 * Playwright config for the Flexium end-to-end tests.
 * URL and PHP binary come from tests/playwright/.env (git-ignored), see README.md.
 *
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const baseURL = (process.env.MOODLE_URL || 'http://localhost/moodle').replace(/\/+$/, '') + '/';
const desktop = { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 1000 }, locale: 'en-GB' };

module.exports = defineConfig({
    testDir: './tests',
    // Creates the temporary admin and test courses (fixture.php), removed again after the run.
    globalSetup: require.resolve('./global-setup.js'),
    globalTeardown: require.resolve('./global-teardown.js'),
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    // One worker: the tests share one Moodle session, edit mode and the theme settings.
    workers: 1,
    reporter: [['list'], ['html', { open: 'never' }]],
    timeout: 90000,
    expect: { timeout: 15000 },
    use: {
        baseURL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'setup',
            testMatch: /auth\.setup\.js/,
            use: desktop,
        },
        {
            name: 'visitor',
            testMatch: /(visitor|responsive)\.spec\.js/,
            use: desktop,
        },
        {
            name: 'admin',
            testMatch: /.*\.spec\.js/,
            testIgnore: /(visitor|responsive)\.spec\.js/,
            dependencies: ['setup'],
            use: { ...desktop, storageState: path.join(__dirname, '.auth', 'admin.json') },
        },
    ],
});
