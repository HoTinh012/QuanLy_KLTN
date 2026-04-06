const xlsx = require('xlsx');
const fs = require('fs');
const workbook = xlsx.readFile('Data KLTN.xlsx');
const result = {};
workbook.SheetNames.forEach(sheetName => {
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    result[sheetName] = data;
});
fs.writeFileSync('data_utf8.json', JSON.stringify(result, null, 2), 'utf-8');
console.log('Done!');
