@echo off
echo Starting UniThesis Sync System...
echo ---------------------------------
echo Local server running at http://localhost:3000
echo This enables direct sync with Data KLTN.xlsx
echo ---------------------------------
npm install express cors body-parser --no-save
node server.js
pause
