const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'bttx')));

const EXCEL_PATH = path.join(__dirname, 'bttx', 'Data KLTN.xlsx');

// Helper: Read Excel and return mapping
function readExcel() {
    if (!fs.existsSync(EXCEL_PATH)) {
        console.error("Excel file not found at", EXCEL_PATH);
        return null;
    }
    const workbook = xlsx.readFile(EXCEL_PATH);
    const data = {};
    workbook.SheetNames.forEach(sheet => {
        data[sheet] = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
    });
    return data;
}

// Helper: Write JSON back to Excel
function writeExcel(data) {
    const workbook = xlsx.utils.book_new();
    Object.keys(data).forEach(sheetName => {
        const ws = xlsx.utils.json_to_sheet(data[sheetName]);
        xlsx.utils.book_append_sheet(workbook, ws, sheetName);
    });
    xlsx.writeFile(workbook, EXCEL_PATH);
    console.log("✅ Excel file updated successfully.");
}

/**
 * GET /api/data
 * Loads data from Excel and returns it to the frontend.
 */
app.get('/api/data', (req, res) => {
    try {
        const data = readExcel();
        if (!data) return res.status(404).json({ error: "Excel not found" });
        
        // Normalize Fields across all sheets
        const normalize = (list) => (list || []).map(item => {
            const newItem = { ...item };
            // Standardize Email
            if (newItem.Email) { newItem.EmailSV = newItem.Email; delete newItem.Email; }
            if (newItem['Email SV']) { newItem.EmailSV = newItem['Email SV']; delete newItem['Email SV']; }
            // Standardize Thesis Title
            if (newItem.Tendetai) { newItem.TenDeTai = newItem.Tendetai; delete newItem.Tendetai; }
            if (newItem['Tên đề tài']) { newItem.TenDeTai = newItem['Tên đề tài']; delete newItem['Tên đề tài']; }
            // Standardize Type/Role for Topics
            if (newItem.Loai) { newItem.FlowType = newItem.Loai; delete newItem.Loai; }
            return newItem;
        });

        // Map Excel sheets to App naming convention
        const mapped = {
            Data: normalize(data.User),
            Quota: normalize(data.Quota),
            Dot: normalize(data.Dot),
            GVInfo: normalize(data.LinkGiangvien),
            Hoso: normalize(data.Linkbainop),
            Major: data.Field ? data.Field.map(f => f.Name || f.Major) : ["QLCN", "ECom", "Logistics", "AI"],
            Trangthaidetai: normalize(data.TrangThaiDeTai),
            TenDetai: normalize(data.TenDeTai),
            Detaigoiy: normalize(data.Detaigoiy),
            Bienban: normalize(data.Bienban)
        };
        
        res.json(mapped);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/data
 * Receives full application state and writes back to Excel sheets.
 */
app.post('/api/data', (req, res) => {
    try {
        const appData = req.body;
        
        // Map App naming back to Excel sheets
        const excelPayload = {
            User: appData.Data,
            Quota: appData.Quota,
            Dot: appData.Dot,
            LinkGiangvien: appData.GVInfo,
            Linkbainop: appData.Hoso,
            TrangThaiDeTai: appData.Trangthaidetai,
            TenDeTai: appData.TenDetai,
            Detaigoiy: appData.Detaigoiy,
            Bienban: appData.Bienban
        };
        
        writeExcel(excelPayload);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📂 Serving BTTX from ${path.join(__dirname, 'bttx')}`);
    console.log(`📊 Syncing with ${EXCEL_PATH}`);
});
