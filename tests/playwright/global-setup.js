// Before the run: create the temporary site admin and the test courses (fixture.php), saved for the tests in
// .auth/fixture.json (git-ignored). The first page after a cache purge can be slow: warm the site up once.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = async () => {
    const output = execFileSync(process.env.PHP_BINARY || 'php', [path.join(__dirname, 'fixture.php'), 'create'],
        { encoding: 'utf8' });
    const fixture = JSON.parse(output.trim().split('\n').pop());
    fs.mkdirSync(path.join(__dirname, '.auth'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '.auth', 'fixture.json'), JSON.stringify(fixture));
    // Every theme setting, put back exactly by global-teardown.js whatever the tests save.
    execFileSync(process.env.PHP_BINARY || 'php', [path.join(__dirname, 'config.php'), 'snapshot',
        path.join(__dirname, '.auth', 'settings.json')], { encoding: 'utf8' });

    const url = (process.env.MOODLE_URL || 'http://localhost/moodle').replace(/\/+$/, '');
    for (const page of ['/', '/course/index.php']) {
        await fetch(url + page, { signal: AbortSignal.timeout(240000) }).catch(() => null);
    }
};
