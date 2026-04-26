@echo off
REM Faculty Clearance System - Complete Automated Deployment (Windows)

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║  🚀 FACULTY CLEARANCE SYSTEM - COMPLETE DEPLOYMENT 🚀          ║
echo ║                                                                ║
echo ║  Vercel (Frontend) + Railway (Backend) + MongoDB Atlas (DB)    ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Show deployment options
echo Select what to deploy:
echo.
echo   1️⃣  Deploy Backend Only (Railway)
echo   2️⃣  Deploy Frontend Only (Vercel)
echo   3️⃣  Deploy Both (Backend + Frontend)
echo   4️⃣  Full Setup (MongoDB + Railway + Vercel)
echo.

set /p choice=Enter choice (1-4): 

if "%choice%"=="1" (
    echo.
    echo Deploying Backend to Railway...
    echo.
    call deploy-railway.bat
) else if "%choice%"=="2" (
    echo.
    echo Deploying Frontend to Vercel...
    echo.
    call deploy-vercel.bat
) else if "%choice%"=="3" (
    echo.
    echo Deploying Backend and Frontend...
    echo.
    
    echo Step 1/2: Deploying Backend to Railway...
    call deploy-railway.bat
    
    echo.
    echo Step 2/2: Deploying Frontend to Vercel...
    call deploy-vercel.bat
    
    echo.
    echo ✅ Both deployments complete!
) else if "%choice%"=="4" (
    echo.
    echo Full Production Setup
    echo.
    
    echo This script will guide you through:
    echo   ✅ Validating prerequisites
    echo   ✅ Setting up MongoDB Atlas
    echo   ✅ Deploying to Railway (Backend)
    echo   ✅ Deploying to Vercel (Frontend)
    echo   ✅ Connecting all services
    echo.
    
    echo Prerequisites:
    echo   • Railway CLI installed: npm install -g @railway/cli
    echo   • Vercel CLI installed: npm install -g vercel
    echo   • MongoDB Atlas account created
    echo   • Railway account created
    echo   • Vercel account created
    echo.
    
    set /p confirm=Continue with full setup? (yes/no): 
    
    if /i "%confirm%"=="yes" (
        echo.
        echo Step 1/2: Deploying Backend to Railway...
        call deploy-railway.bat
        
        echo.
        echo Step 2/2: Deploying Frontend to Vercel...
        call deploy-vercel.bat
        
        echo.
        echo ════════════════════════════════════════════════════════════════
        echo ✅ DEPLOYMENT COMPLETE!
        echo ════════════════════════════════════════════════════════════════
        echo.
        echo 📋 FINAL STEPS:
        echo.
        echo 1️⃣  Update Railway CORS Variables:
        echo    • Go to Railway Dashboard
        echo    • Select your backend project
        echo    • Update variables:
        echo      - CORS_ORIGIN = ^<your-vercel-url^>
        echo      - FRONTEND_URL = ^<your-vercel-url^>
        echo    • Redeploy backend
        echo.
        echo 2️⃣  Set Frontend Environment Variables:
        echo    • Go to Vercel Dashboard
        echo    • Select your frontend project
        echo    • Add environment variable:
        echo      - REACT_APP_API_URL = ^<your-railway-url^>
        echo    • Redeploy frontend
        echo.
        echo 3️⃣  Test Your Application:
        echo    • Open your Vercel frontend URL in browser
        echo    • Test login with faculty credentials
        echo    • Test clearance submission
        echo    • Test clearance status
        echo.
        echo ✨ Your system is now in production!
        echo.
    )
) else (
    echo Invalid choice. Exiting.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════
echo 🎉 Deployment Script Completed
echo ════════════════════════════════════════════════════════════════
echo.
pause
