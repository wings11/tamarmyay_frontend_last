@echo off
title TAMARMYAY Restaurant POS - Starting...
color 0A

echo.
echo ========================================
echo    TAMARMYAY RESTAURANT POS SYSTEM
echo ========================================
echo.
echo [Step 1/2] Starting Print Server...
cd /d "%~dp0print-server"
start "Print Server - Port 3001" cmd /k "npm start"

echo.
echo Waiting for Print Server to initialize...
timeout /t 4 /nobreak >nul

echo [Step 2/2] Starting POS Website...
cd /d "%~dp0"
start "POS Website - Port 3000" cmd /k "npm start"

echo.
echo ========================================
echo          SYSTEM STARTED!
echo ========================================
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo Print Server running at:
echo   - Laptop: http://localhost:3001
echo   - iPad:   http://%IP%:3001
echo.
echo POS Website running at:
echo   - Laptop: http://localhost:3000
echo   - iPad:   http://%IP%:3000
echo.
echo ========================================
echo   INSTRUCTIONS FOR CASHIER (iPad):
echo ========================================
echo 1. Open Safari on iPad
echo 2. Go to: http://%IP%:3000
echo 3. Navigate to any order and print!
echo.
echo The printer should be ON and connected via USB.
echo.
echo ========================================
echo.
echo Press any key to exit this window
echo (Print Server and POS will keep running)
pause >nul
