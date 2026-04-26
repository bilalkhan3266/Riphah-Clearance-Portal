#!/usr/bin/env pwsh
# Faculty Clearance System - Docker Local Deployment
# Starts the complete system with Docker Compose

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Faculty Clearance System - Docker Local Deployment            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "[1/5] Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed!" -ForegroundColor Red
    Write-Host "   Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is installed
Write-Host ""
Write-Host "[2/5] Checking Docker Compose installation..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed!" -ForegroundColor Red
    Write-Host "   It's included with Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
Write-Host ""
Write-Host "[3/5] Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.docker") {
    Write-Host "✅ .env.docker file found" -ForegroundColor Green
    $useEnv = Read-Host "Use existing .env.docker? (yes/no)"
    if ($useEnv -eq "no") {
        Copy-Item ".env.docker" ".env"
        Write-Host "✅ Created .env from .env.docker" -ForegroundColor Green
    } else {
        Copy-Item ".env.docker" ".env"
    }
} else {
    Write-Host "⚠️  .env.docker not found, using defaults" -ForegroundColor Yellow
}

# Pull latest images
Write-Host ""
Write-Host "[4/5] Pulling Docker images..." -ForegroundColor Yellow
docker pull mongo:6.0-alpine | Out-Null
docker pull node:18-alpine | Out-Null
docker pull nginx:alpine | Out-Null
Write-Host "✅ Images pulled" -ForegroundColor Green

# Start services
Write-Host ""
Write-Host "[5/5] Starting services with Docker Compose..." -ForegroundColor Yellow
Write-Host "   This will start:" -ForegroundColor Cyan
Write-Host "   • MongoDB database (port 27017)" -ForegroundColor Cyan
Write-Host "   • Backend API server (port 5001)" -ForegroundColor Cyan
Write-Host "   • Frontend React app (port 3000)" -ForegroundColor Cyan
Write-Host ""

docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Cyan
    docker compose ps
    
    Write-Host ""
    Write-Host "🌐 Access Your Application:" -ForegroundColor Green
    Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor Yellow
    Write-Host "   Backend:   http://localhost:5001" -ForegroundColor Yellow
    Write-Host "   MongoDB:   mongodb://localhost:27017" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
    Write-Host "   View logs:       docker compose logs -f" -ForegroundColor White
    Write-Host "   Stop services:   docker compose stop" -ForegroundColor White
    Write-Host "   Restart:         docker compose restart" -ForegroundColor White
    Write-Host "   Remove all:      docker compose down" -ForegroundColor White
    Write-Host "   Remove volumes:  docker compose down -v" -ForegroundColor White
    Write-Host ""
    
    Write-Host "⏱️  Waiting for services to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "🎉 Deployment complete!" -ForegroundColor Green
    Write-Host "   Your application is running at http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "   Check Docker daemon is running" -ForegroundColor Yellow
    Write-Host "   Check available disk space" -ForegroundColor Yellow
    Write-Host "   View logs: docker compose logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "💡 Tip: To view live logs, run: docker compose logs -f" -ForegroundColor Cyan
