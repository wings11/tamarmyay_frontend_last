@echo off
title Create Desktop Shortcut

echo ========================================
echo   Creating Desktop Shortcut
echo ========================================
echo.

REM Get the path to this batch file
set SCRIPT_PATH=%~dp0START-RESTAURANT-POS.bat

REM Get the Desktop path (OneDrive Desktop)
set DESKTOP=%USERPROFILE%\OneDrive\Desktop

REM Create a VBS script to create the shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > %TEMP%\CreateShortcut.vbs
echo sLinkFile = "%DESKTOP%\Start Restaurant POS.lnk" >> %TEMP%\CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %TEMP%\CreateShortcut.vbs
echo oLink.TargetPath = "%SCRIPT_PATH%" >> %TEMP%\CreateShortcut.vbs
echo oLink.WorkingDirectory = "%~dp0" >> %TEMP%\CreateShortcut.vbs
echo oLink.Description = "Start Tamarmyay Restaurant POS System" >> %TEMP%\CreateShortcut.vbs
echo oLink.IconLocation = "shell32.dll,138" >> %TEMP%\CreateShortcut.vbs
echo oLink.Save >> %TEMP%\CreateShortcut.vbs

REM Execute the VBS script
cscript //nologo %TEMP%\CreateShortcut.vbs

REM Clean up
del %TEMP%\CreateShortcut.vbs

echo.
echo SUCCESS!
echo.
echo A shortcut has been created on your Desktop:
echo "Start Restaurant POS"
echo.
echo Double-click it anytime to start the system!
echo.
echo Press any key to close...
pause >nul
