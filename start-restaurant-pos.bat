@echo off
title Tamarmyay POS System - Production
echo ========================================
echo    TAMARMYAY POS SYSTEM - PRODUCTION
echo ========================================
echo.
echo Starting Print Server...
cd /d "%~dp0print-server"
start "Print Server" cmd /k "node server.js"

echo Waiting for Print Server to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Starting React App...
cd /d "%~dp0"
start "React App" cmd /k "npm start"

echo.
echo ========================================
echo        PRODUCTION SYSTEM READY
echo ========================================
echo.
echo React App: http://localhost:3000
echo Print Server: http://localhost:3001
echo.
echo IMPORTANT FOR RESTAURANT USE:
echo 1. Connect your POS printer via USB
echo 2. Configure printer in print-server/server.js
echo 3. Test printing before first customer
echo.
echo Press any key to open system status...
pause >nul

echo Opening system status...
start http://localhost:3001/printer/status
start http://localhost:3000

echo.
echo System is running. Close this window to stop both servers.
echo ========================================
pause
