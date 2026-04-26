@echo off
REM Faculty Clearance System - Automated Vercel Deployment
REM This script deploys the frontend to Vercel using the Vercel CLI

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  Faculty Clearance System - Vercel Frontend Deployment         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Vercel CLI is installed
echo [1/4] Checking Vercel CLI installation...
vercel --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI not found!
    echo    Install with: npm install -g vercel
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('vercel --version') do set vercelVersion=%%i
echo ✅ Vercel CLI found: !vercelVersion!

REM Login to Vercel
echo.
echo [2/4] Authenticating with Vercel...
echo    📝 Your browser will open for authentication
vercel login
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel authentication failed
    pause
    exit /b 1
)
echo ✅ Authenticated with Vercel

REM Navigate to frontend
echo.
echo [3/4] Preparing frontend for deployment...
cd frontend

REM Build frontend
echo    Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Frontend built successfully

REM Deploy to Vercel
echo.
echo [4/4] Deploying frontend to Vercel...
echo    This may take 3-5 minutes...
echo.
echo    ⚠️  When prompted, provide:
echo       - Project name: faculty-clearance-frontend
echo       - Framework: React
echo       - Root directory: ./
echo.

vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Frontend deployed successfully!
    echo.
    echo 🔗 Your frontend URL:
    echo    Check Vercel dashboard for your deployment URL
    echo.
    echo 📝 Next Steps:
    echo    1. Copy your Vercel frontend URL
    echo    2. Go to Railway dashboard
    echo    3. Update CORS_ORIGIN and FRONTEND_URL with Vercel URL
    echo    4. Redeploy backend on Railway
    echo    5. Test your application at your Vercel URL
    echo.
) else (
    echo ❌ Deployment failed
    pause
    exit /b 1
)

echo.
echo 🎉 Frontend deployment complete!
pause
