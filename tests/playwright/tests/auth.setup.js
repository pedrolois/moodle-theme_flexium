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
 * Logs in once with the temporary admin of this run (fixture.php) and saves the session, so every spec reuses it.
 * Success is checked by URL (locale-independent), never by visible text.
 *
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
const { test: setup } = require('@playwright/test');
const path = require('path');
const { fixture } = require('./helpers');

const authFile = path.join(__dirname, '..', '.auth', 'admin.json');

setup('authenticate', async ({ page }) => {
    setup.setTimeout(300000); // The first request after a cache purge can be very slow.
    const { username, password } = fixture();

    for (let attempt = 1; attempt <= 3; attempt++) {
        // showcore=1: sites that hide the login form (SSO) show it with this parameter; others ignore it.
        await page.goto('login/index.php?showcore=1', { timeout: 120000 });
        await page.locator('#username').fill(username);
        await page.locator('#password').fill(password);
        await page.locator('#loginbtn').click();
        await page.waitForLoadState('domcontentloaded');

        await page.goto('my/', { timeout: 120000 });
        if (!page.url().includes('/login/')) {
            await page.context().storageState({ path: authFile });
            return;
        }
        await page.waitForTimeout(3000);
    }
    throw new Error('Login of the temporary admin did not complete (see fixture.php).');
});
