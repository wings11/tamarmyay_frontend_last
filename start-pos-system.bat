@echo off
echo Starting Tamarmyay POS System...
echo.

REM Start Print Server
echo [1/2] Starting Print Server...
start "Print Server" cmd /k "cd print-server && node server.js"

REM Wait a moment for print server to start
timeout /t 3 /nobreak > nul

REM Start React App
echo [2/2] Starting React App...
npm start

echo.
echo Both servers are now running:
echo - Print Server: http://localhost:3001
echo - React App: http://localhost:3000
echo.
pause
