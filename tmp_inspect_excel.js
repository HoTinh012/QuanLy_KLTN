const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/hosyt/OneDrive/Desktop/New folder/Data KLTN.xlsx');
const sheetNames = workbook.SheetNames;

console.log('Sheet Names:', sheetNames);

sheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`\nSheet: ${sheetName}`);
    console.log(`Number of rows: ${data.length}`);
    if (data.length > 0) {
        console.log('First row keys:', Object.keys(data[0]));
        console.log('Sample data (first row):', JSON.stringify(data[0], null, 2));
    }
});
