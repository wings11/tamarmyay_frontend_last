@echo off
title Stop Restaurant POS System
color 0C

echo.
echo ========================================
echo   STOPPING RESTAURANT POS SYSTEM
echo ========================================
echo.

REM Kill all node processes (this stops both print server and React app)
echo Stopping Print Server and POS Website...
taskkill /F /IM node.exe >nul 2>&1

REM Also kill any remaining npm processes
taskkill /F /IM npm.cmd >nul 2>&1

echo.
echo ========================================
echo        SYSTEM STOPPED
echo ========================================
echo.
echo All POS services have been stopped.
echo You can now close this window.
echo.
echo Press any key to exit...
pause >nul
