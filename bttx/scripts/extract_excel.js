const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(__dirname, '../data/Data KLTN.xlsx');
const jsonPath = path.join(__dirname, '../data/data_utf8.json');

const workbook = xlsx.readFile(excelPath);
const result = {};
workbook.SheetNames.forEach(sheetName => {
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    result[sheetName] = data;
});
fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
console.log('Done!');
