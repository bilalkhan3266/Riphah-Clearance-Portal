@echo off
REM Faculty Clearance System - Docker Local Deployment (Windows)

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  Faculty Clearance System - Docker Local Deployment            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is installed
echo [1/5] Checking Docker installation...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed!
    echo    Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('docker --version') do set dockerVersion=%%i
echo ✅ Docker found: !dockerVersion!

REM Check if Docker Compose is installed
echo.
echo [2/5] Checking Docker Compose installation...
docker compose version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not installed!
    echo    It's included with Docker Desktop
    pause
    exit /b 1
)
echo ✅ Docker Compose found

REM Check if .env file exists
echo.
echo [3/5] Checking environment configuration...
if exist ".env.docker" (
    echo ✅ .env.docker file found
    set /p useEnv=Use existing .env.docker? (yes/no):
    if /i "!useEnv!"=="no" (
        copy .env.docker .env >nul
        echo ✅ Created .env from .env.docker
    ) else (
        copy .env.docker .env >nul
    )
) else (
    echo ⚠️  .env.docker not found, using defaults
)

REM Pull latest images
echo.
echo [4/5] Pulling Docker images...
docker pull mongo:6.0-alpine >nul 2>&1
docker pull node:18-alpine >nul 2>&1
docker pull nginx:alpine >nul 2>&1
echo ✅ Images pulled

REM Start services
echo.
echo [5/5] Starting services with Docker Compose...
echo    This will start:
echo    • MongoDB database (port 27017)
echo    • Backend API server (port 5001)
echo    • Frontend React app (port 3000)
echo.

docker compose up -d

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ All services started successfully!
    echo.
    echo 📊 Service Status:
    docker compose ps
    
    echo.
    echo 🌐 Access Your Application:
    echo    Frontend:  http://localhost:3000
    echo    Backend:   http://localhost:5001
    echo    MongoDB:   mongodb://localhost:27017
    echo.
    
    echo 📝 Useful Commands:
    echo    View logs:       docker compose logs -f
    echo    Stop services:   docker compose stop
    echo    Restart:         docker compose restart
    echo    Remove all:      docker compose down
    echo    Remove volumes:  docker compose down -v
    echo.
    
    echo ⏱️  Waiting for services to be healthy...
    timeout /t 5 >nul
    
    echo.
    echo 🎉 Deployment complete!
    echo    Your application is running at http://localhost:3000
    echo.
    
) else (
    echo ❌ Deployment failed!
    echo    Check Docker daemon is running
    echo    Check available disk space
    echo    View logs: docker compose logs
    pause
    exit /b 1
)

echo.
echo 💡 Tip: To view live logs, run: docker compose logs -f
pause
