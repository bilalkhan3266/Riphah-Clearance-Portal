@echo off
REM Faculty Clearance System - Deployment Helper Script
REM This script validates your deployment setup

echo.
echo ============================================
echo  Faculty Clearance System - Deployment Check
echo ============================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js is installed: 
    node --version
) else (
    echo ❌ Node.js is NOT installed
    echo    Download from: https://nodejs.org/
    goto end
)

REM Check npm
echo.
echo [2/5] Checking npm installation...
npm --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ npm is installed: 
    npm --version
) else (
    echo ❌ npm is NOT installed
    goto end
)

REM Check Git
echo.
echo [3/5] Checking Git installation...
git --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Git is installed
    git --version
) else (
    echo ❌ Git is NOT installed
    echo    Download from: https://git-scm.com/
    goto end
)

REM Check Backend structure
echo.
echo [4/5] Checking Backend structure...
if exist "backend\package.json" (
    echo ✅ Backend package.json found
) else (
    echo ❌ Backend package.json NOT found
)

if exist "backend\.env" (
    echo ✅ Backend .env file found
) else (
    echo ❌ Backend .env file NOT found
)

if exist "backend\server.js" (
    echo ✅ Backend server.js found
) else (
    echo ❌ Backend server.js NOT found
)

REM Check Frontend structure
echo.
echo [5/5] Checking Frontend structure...
if exist "frontend\package.json" (
    echo ✅ Frontend package.json found
) else (
    echo ❌ Frontend package.json NOT found
)

if exist "frontend\public" (
    echo ✅ Frontend public folder found
) else (
    echo ❌ Frontend public folder NOT found
)

echo.
echo ============================================
echo  Deployment Check Complete
echo ============================================
echo.
echo Next Steps:
echo 1. Ensure all checks passed ✅
echo 2. Read DEPLOYMENT_QUICK_START.md
echo 3. Follow the deployment guide
echo 4. Set up MongoDB Atlas
echo 5. Connect GitHub repository
echo 6. Deploy to Railway (Backend)
echo 7. Deploy to Vercel (Frontend)
echo.

:end
pause
