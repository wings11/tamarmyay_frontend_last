@echo off
echo ================================================
echo  TAMARMYAY RESTAURANT - PRINT SERVER LAUNCHER
echo ================================================
echo.

cd /d "%~dp0\print-server"

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Checking for dependencies...
if not exist "node_modules" (
    echo Installing dependencies (including printer drivers)...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        echo Make sure you have build tools installed for native modules
        echo You may need: npm install -g windows-build-tools
        pause
        exit /b 1
    )
) else (
    echo Dependencies found, checking for printer modules...
    if not exist "node_modules\escpos-usb" (
        echo Installing missing printer modules...
        npm install
    )
)

echo.
echo ================================================
echo  STARTING PRINT SERVER FOR XPRINTER XP-58IIH
echo ================================================
echo.
echo Instructions:
echo 1. Make sure your Xprinter XP-58IIH is connected via USB
echo 2. Make sure printer is powered ON
echo 3. iPad should be on the same WiFi network
echo 4. Keep this window open while using the restaurant system
echo.
echo Print Server will be available at:
echo   - Local: http://localhost:3001
echo   - Network: http://[192.168.1.145]:3001
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

set PRINTER_TYPE=USB
set NODE_ENV=production
set HOST=0.0.0.0

echo Starting server...
npm start

echo.
echo Print server stopped.
pause