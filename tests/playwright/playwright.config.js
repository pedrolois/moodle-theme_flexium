// Playwright config for the Flexium end-to-end tests.
// URL and PHP binary come from tests/playwright/.env (git-ignored), see README.md.
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
