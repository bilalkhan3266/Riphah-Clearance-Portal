@echo off
REM Faculty Clearance System - Automated Railway Deployment
REM This script deploys the backend to Railway using the Railway CLI

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  Faculty Clearance System - Railway Backend Deployment         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Railway CLI is installed
echo [1/5] Checking Railway CLI installation...
railway --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Railway CLI not found!
    echo    Install with: npm install -g @railway/cli
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('railway --version') do set railwayVersion=%%i
echo ✅ Railway CLI found: !railwayVersion!

REM Login to Railway
echo.
echo [2/5] Authenticating with Railway...
echo    📝 Your browser will open for authentication
railway login
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Railway authentication failed
    pause
    exit /b 1
)
echo ✅ Authenticated with Railway

REM Link to project
echo.
echo [3/5] Linking to Railway project...
railway link
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Project link failed
    echo    You may need to create a project first in Railway dashboard
    pause
    exit /b 1
)
echo ✅ Project linked

REM Set environment variables
echo.
echo [4/5] Configuring environment variables...
echo    Setting PORT...
railway variables set PORT=5001

echo    Setting NODE_ENV...
railway variables set NODE_ENV=production

echo.
echo    ⚠️  IMPORTANT: Set these additional variables in Railway dashboard:
echo       - MONGO_URI (MongoDB Atlas connection string)
echo       - JWT_SECRET (random 32+ character string)
echo       - CORS_ORIGIN (your Vercel frontend URL)
echo       - FRONTEND_URL (your Vercel frontend URL)
echo       - EMAIL_USER (Gmail address)
echo       - EMAIL_PASSWORD (Gmail app password)
echo.
echo    Do this now, then press any key to continue...
pause

REM Deploy backend
echo.
echo [5/5] Deploying backend to Railway...
echo    This may take 5-10 minutes...
cd backend
railway up --detach

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Backend deployed successfully!
    echo.
    echo 📊 Deployment Details:
    railway status
    echo.
    echo 🔗 Get your backend URL:
    railway domain
    echo.
    echo 📝 Next Steps:
    echo    1. Copy your Railway domain URL
    echo    2. Update CORS_ORIGIN in Railway variables
    echo    3. Deploy frontend to Vercel
    echo    4. Update REACT_APP_API_URL in Vercel
    echo.
) else (
    echo ❌ Deployment failed
    echo    Check logs: railway logs
    pause
    exit /b 1
)

echo.
echo 🎉 Backend deployment complete!
pause
