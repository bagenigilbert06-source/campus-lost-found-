@echo off
REM Lost & Found Backend Startup Script for Windows

setlocal enabledelayedexpansion

echo.
echo ===== Lost and Found Backend Startup =====
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm found: %NPM_VERSION%
echo.

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found
    echo Creating .env from .env.example...
    copy .env.example .env
    echo Please edit .env file with your configuration
    echo.
    pause
)

REM Install dependencies
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed
echo.

REM Start backend
echo Starting backend server...
echo Server will run on: http://localhost:3001
echo Health check: http://localhost:3001/health
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
