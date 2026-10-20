// After the run: put every theme setting back as it was before the run, remove the temporary site admin and the test
// courses, and forget its password.
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
