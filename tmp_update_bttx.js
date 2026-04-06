const fs = require('fs');
const path = require('path');

const indexContent = fs.readFileSync('index.html', 'utf-8');

// Replace asset paths with ../assets/
let newContent = indexContent.replace(/"assets\//g, '"../assets/');

// Replace script tags at the bottom
newContent = newContent.replace(
  '<script src="../assets/js/bundle.js"></script>',
  '<script src="crud.js"></script>\n  <script src="app.js"></script>'
);

fs.writeFileSync(path.join('bttx', 'QuanLy_KLTN.html'), newContent);
console.log('Successfully updated bttx/QuanLy_KLTN.html');
