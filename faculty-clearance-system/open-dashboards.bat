@echo off
REM Open Railway and Vercel dashboards
REM This script will open both dashboards in your default browser

echo [INFO] Opening Railway and Vercel dashboards...
echo.

REM Open Railway Dashboard
echo [1/2] Opening Railway Dashboard...
start https://railway.app/dashboard

REM Wait a moment
timeout /t 2 /nobreak

REM Open Vercel Dashboard
echo [2/2] Opening Vercel Dashboard...
start https://vercel.com/dashboard

echo.
echo [OK] Dashboards opened in your browser
echo.
echo Next steps:
echo 1. In Railway: Click "New Project" and select your GitHub repo
echo 2. In Vercel: Click "Add New" and import your GitHub repo
echo.
pause
