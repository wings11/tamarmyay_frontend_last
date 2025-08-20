@echo off
echo Installing Print Server Dependencies...
cd print-server
npm install
echo.
echo Print Server installed successfully!
echo.
echo To start the print server:
echo   cd print-server
echo   npm start
echo.
echo The server will run on http://localhost:3001
pause
