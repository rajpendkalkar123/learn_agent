@echo off
echo.
echo ========================================
echo   AI Dev Platform - Quick Start
echo ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules\" (
    echo Installing dependencies...
    echo.
    call npm install
) else (
    echo Dependencies already installed
)

echo.
echo Starting development server...
echo.
call npm run dev
