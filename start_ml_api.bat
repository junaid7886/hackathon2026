@echo off
REM Start the ML API Server on Windows
REM This script starts the Disease Prediction Chatbot API

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Change to the script directory
cd /d "%SCRIPT_DIR%"

echo.
echo ================================================
echo Starting Disease Prediction ML API...
echo ================================================
echo.
echo The API will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Run the Python API
python ml\start_api.py

pause
