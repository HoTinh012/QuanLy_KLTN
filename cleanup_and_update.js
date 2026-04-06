const fs = require('fs');
const path = require('path');

const bttxHtmlPath = path.join('bttx', 'QuanLy_KLTN.html');

if (fs.existsSync(bttxHtmlPath)) {
    let content = fs.readFileSync(bttxHtmlPath, 'utf-8');
    // We already moved assets inside bttx, so now "../assets/" should become "assets/"
    let newContent = content.replace(/\.\.\/assets\//g, 'assets/');
    fs.writeFileSync(bttxHtmlPath, newContent);
    console.log('Updated bttx/QuanLy_KLTN.html paths to relative local assets/');
}

// Optional: remove the old crud.js and app.js inside bttx as they are not used and may confuse the user
try { if (fs.existsSync('bttx/crud.js')) fs.unlinkSync('bttx/crud.js'); } catch(e){}
try { if (fs.existsSync('bttx/app.js')) fs.unlinkSync('bttx/app.js'); } catch(e){}

console.log('Completed JS cleanup processing.');
