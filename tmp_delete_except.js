const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const safeList = ['bttx', 'node_modules', 'package.json', 'package-lock.json', '.gemini']; // Let's keep node_modules and Gemini artifacts just in case

const items = fs.readdirSync(rootDir);

items.forEach(item => {
    if (safeList.includes(item)) return;
    
    if (item.startsWith('tmp_')) return; // keep tmp scripts for debugging before exiting
    if (item === 'cleanup_and_update.js') return;
    if (item === 'testing_guide.md') return; // maybe they need the guide

    const itemPath = path.join(rootDir, item);
    try {
        const stat = fs.lstatSync(itemPath);
        if (stat.isDirectory()) {
            fs.rmSync(itemPath, { recursive: true, force: true });
        } else {
            // unlinkSync might fail if locked
            fs.unlinkSync(itemPath);
        }
        console.log('Deleted:', item);
    } catch (e) {
        console.error('Failed to delete:', item, e.message);
    }
});

console.log('Cleanup completed.');
