@echo off
REM Faculty Clearance System - Docker Production Build & Push (Windows)

setlocal enabledelayedexpansion

set REGISTRY=%1
set USERNAME=%2
set ACTION=%3

if "!REGISTRY!"=="" set REGISTRY=docker.io
if "!ACTION!"=="" set ACTION=both

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  Faculty Clearance System - Docker Production Build ^ Push      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check Docker
echo [1/5] Checking Docker...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker not found
    pause
    exit /b 1
)
echo ✅ Docker is installed

REM Get registry info
echo.
echo [2/5] Configuring Docker registry...
if "!USERNAME!"=="" (
    set /p USERNAME=Docker Hub username:
)
set IMAGE_NAME_BACKEND=!USERNAME!/faculty-clearance-backend
set IMAGE_NAME_FRONTEND=!USERNAME!/faculty-clearance-frontend
set IMAGE_TAG=latest

echo ✅ Backend image: !IMAGE_NAME_BACKEND!:!IMAGE_TAG!
echo ✅ Frontend image: !IMAGE_NAME_FRONTEND!:!IMAGE_TAG!

REM Build images
if "!ACTION!"=="build" (
    goto :build
) else if "!ACTION!"=="both" (
    goto :build
) else (
    goto :push
)

:build
echo.
echo [3/5] Building Docker images...

echo    Building backend image...
docker build -t !IMAGE_NAME_BACKEND!:!IMAGE_TAG! -f backend/Dockerfile ./backend
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend build failed
    pause
    exit /b 1
)
echo ✅ Backend image built

echo    Building frontend image...
docker build -t !IMAGE_NAME_FRONTEND!:!IMAGE_TAG! -f frontend/Dockerfile ./frontend
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend image built

if "!ACTION!"=="build" goto :end

:push
echo.
echo [4/5] Logging in to Docker Hub...
docker login -u !USERNAME!
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker login failed
    pause
    exit /b 1
)
echo ✅ Logged in to Docker Hub

echo.
echo [5/5] Pushing images to registry...

echo    Pushing backend image...
docker push !IMAGE_NAME_BACKEND!:!IMAGE_TAG!
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend push failed
    pause
    exit /b 1
)
echo ✅ Backend image pushed

echo    Pushing frontend image...
docker push !IMAGE_NAME_FRONTEND!:!IMAGE_TAG!
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend push failed
    pause
    exit /b 1
)
echo ✅ Frontend image pushed

:end
echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ Docker build and push complete!
echo ════════════════════════════════════════════════════════════════
echo.

echo 🎯 Images ready to deploy:
echo    Backend:  docker run !IMAGE_NAME_BACKEND!:!IMAGE_TAG!
echo    Frontend: docker run !IMAGE_NAME_FRONTEND!:!IMAGE_TAG!
echo.

echo 📋 Next steps:
echo    1. Deploy to Docker Swarm, Kubernetes, or cloud platform
echo    2. Configure environment variables
echo    3. Set up persistent volumes for MongoDB
echo    4. Configure networking and reverse proxy
echo.

pause
