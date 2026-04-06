const fs = require('fs');
const path = require('path');

const processedDataStr = fs.readFileSync('processed_defaultData.js', 'utf-8');
const jsonPart = processedDataStr.replace('export const defaultData = ', '').trim();
// Extract just the object part, avoiding any trailing semicolons or extra code
const jsonObjMatch = jsonPart.match(/^({[\s\S]*?});?$/);

if (jsonObjMatch && jsonObjMatch[1]) {
    const rawJson = jsonObjMatch[1];
    
    // Now read bttx/app.js
    const appJsPath = path.join('bttx', 'app.js');
    let appJsContent = fs.readFileSync(appJsPath, 'utf-8');
    
    // Replace the const defaultData = {...};
    // We can use a regex to match from const defaultData = { to the next };
    // But since it might contain multiple functions, we look for the first match up to // Cập nhật Schema
    const regex = /const defaultData = \{[\s\S]*?\};\n*(?=\/\/ Cập nhật Schema)/m;
    
    if (regex.test(appJsContent)) {
        const newAppJsContent = appJsContent.replace(regex, `const defaultData = ${rawJson};\n\n`);
        fs.writeFileSync(appJsPath, newAppJsContent);
        console.log('Successfully updated bttx/app.js with data from processed_defaultData.js');
    } else {
        console.error('Could not find defaultData block in bttx/app.js to replace.');
    }
} else {
    console.error('Could not parse JSON from processed_defaultData.js');
}
