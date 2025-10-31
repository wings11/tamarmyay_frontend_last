@echo off
title Tamarmyay POS - Print Server
color 0A

echo ========================================
echo   TAMARMYAY RESTAURANT POS
echo   Print Server for iPad
echo ========================================
echo.
echo Starting print server...
echo.
echo Make sure:
echo  [x] XPrinter XP-58IIH is connected via USB
echo  [x] Printer is turned ON
echo  [x] Laptop is connected to WiFi
echo.
echo ========================================
echo.

cd /d "%~dp0print-server"

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo.
    echo Installing dependencies first...
    echo This may take a few minutes...
    call npm install
    echo.
)

echo.
echo Starting print server on port 3001...
echo.
echo iPad should connect to: http://YOUR-LAPTOP-IP:3001
echo.
echo To find your IP: Open another terminal and run "ipconfig"
echo.
echo ========================================
echo   SERVER IS RUNNING - DO NOT CLOSE!
echo ========================================
echo.

node server.js

pause
