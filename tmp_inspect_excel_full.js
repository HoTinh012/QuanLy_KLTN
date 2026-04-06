const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = XLSX.readFile('c:/Users/hosyt/OneDrive/Desktop/New folder/Data KLTN.xlsx');
const sheetData = {};

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    sheetData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
});

// Save to a JSON file for easier reading
fs.writeFileSync('excel_data_dump.json', JSON.stringify(sheetData, null, 2));

console.log('Sheet Summary:');
Object.keys(sheetData).forEach(sheetName => {
    console.log(`- ${sheetName}: ${sheetData[sheetName].length} rows`);
    if (sheetData[sheetName].length > 0) {
        console.log(`  Keys: ${Object.keys(sheetData[sheetName][0]).join(', ')}`);
    }
});
