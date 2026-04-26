@echo off
REM Faculty Clearance System - Git Initialization Script for Windows

echo.
echo ============================================
echo  Initializing Git Repository
echo ============================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git is not installed!
    echo    Download from: https://git-scm.com/
    pause
    exit /b 1
)

REM Initialize git
echo [1/4] Initializing git repository...
git init
if %ERRORLEVEL% EQU 0 (
    echo ✅ Git repository initialized
) else (
    echo ❌ Failed to initialize git
    pause
    exit /b 1
)

REM Add all files
echo.
echo [2/4] Adding all files...
git add .
if %ERRORLEVEL% EQU 0 (
    echo ✅ All files added
) else (
    echo ❌ Failed to add files
    pause
    exit /b 1
)

REM Create initial commit
echo.
echo [3/4] Creating initial commit...
git commit -m "Initial commit: Faculty Clearance System - Production Ready"
if %ERRORLEVEL% EQU 0 (
    echo ✅ Initial commit created
) else (
    echo ❌ Failed to create commit
    pause
    exit /b 1
)

REM Branch to main
echo.
echo [4/4] Setting main branch...
git branch -M main
if %ERRORLEVEL% EQU 0 (
    echo ✅ Main branch set
) else (
    echo ❌ Failed to set main branch
    pause
    exit /b 1
)

echo.
echo ============================================
echo  Git Initialization Complete!
echo ============================================
echo.
echo Next Steps:
echo 1. Create a new repository on GitHub:
echo    → Go to https://github.com/new
echo    → Name: Riphah-Clearance-Portal
echo    → Make it PUBLIC
echo    → Don't initialize with anything
echo    → Click "Create repository"
echo.
echo 2. Add remote origin (copy from GitHub):
echo    → git remote add origin https://github.com/YOUR_USERNAME/Riphah-Clearance-Portal.git
echo.
echo 3. Push to GitHub:
echo    → git push -u origin main
echo.
echo 4. Then follow the deployment guide:
echo    → Open: DEPLOYMENT_QUICK_START.md
echo.
pause
