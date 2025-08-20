@echo off
title Tamarmyay POS - Tablet Mode
echo ========================================
echo    TAMARMYAY POS - TABLET MODE
echo ========================================
echo.
echo This mode runs everything on one tablet
echo Other tablets can connect via WiFi
echo.
echo Starting React App...
start "React App" cmd /k "npm start"

echo.
echo Optional: Start Print Server for thermal printing
echo (Skip if using browser printing only)
choice /C YN /M "Start print server for thermal printer"
if errorlevel 2 goto :skip_print
cd print-server
start "Print Server" cmd /k "node server.js"

:skip_print
echo.
echo ========================================
echo           TABLET MODE READY
echo ========================================
echo.
echo Main tablet: http://localhost:3000
echo Other tablets: http://[this-tablet-ip]:3000
echo.
echo To find this tablet's IP:
echo 1. Open Command Prompt
echo 2. Type: ipconfig
echo 3. Look for "IPv4 Address"
echo.
pause
