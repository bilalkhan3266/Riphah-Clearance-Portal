#!/usr/bin/env pwsh
# Faculty Clearance System - Docker Production Deployment
# Builds and pushes Docker images to registry

param(
    [string]$Registry = "docker.io",
    [string]$Username = "",
    [string]$Action = "build" # build, push, or both
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Faculty Clearance System - Docker Production Build & Push      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "[1/5] Checking Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found" -ForegroundColor Red
    exit 1
}

# Get registry info
Write-Host ""
Write-Host "[2/5] Configuring Docker registry..." -ForegroundColor Yellow
if ([string]::IsNullOrEmpty($Username)) {
    $Username = Read-Host "Docker Hub username"
}
$ImageNameBackend = "$Username/faculty-clearance-backend"
$ImageNameFrontend = "$Username/faculty-clearance-frontend"
$ImageTag = "latest"

Write-Host "✅ Backend image: $ImageNameBackend`:$ImageTag" -ForegroundColor Green
Write-Host "✅ Frontend image: $ImageNameFrontend`:$ImageTag" -ForegroundColor Green

# Build images
if ($Action -eq "build" -or $Action -eq "both") {
    Write-Host ""
    Write-Host "[3/5] Building Docker images..." -ForegroundColor Yellow
    
    Write-Host "   Building backend image..." -ForegroundColor Cyan
    docker build -t "$ImageNameBackend`:$ImageTag" -f backend/Dockerfile ./backend
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Backend image built" -ForegroundColor Green
    
    Write-Host "   Building frontend image..." -ForegroundColor Cyan
    docker build -t "$ImageNameFrontend`:$ImageTag" -f frontend/Dockerfile ./frontend
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Frontend image built" -ForegroundColor Green
}

# Push images
if ($Action -eq "push" -or $Action -eq "both") {
    Write-Host ""
    Write-Host "[4/5] Logging in to Docker Hub..." -ForegroundColor Yellow
    docker login -u $Username
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker login failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Logged in to Docker Hub" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "[5/5] Pushing images to registry..." -ForegroundColor Yellow
    
    Write-Host "   Pushing backend image..." -ForegroundColor Cyan
    docker push "$ImageNameBackend`:$ImageTag"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend push failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Backend image pushed" -ForegroundColor Green
    
    Write-Host "   Pushing frontend image..." -ForegroundColor Cyan
    docker push "$ImageNameFrontend`:$ImageTag"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend push failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Frontend image pushed" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Docker build and push complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 Images ready to deploy:" -ForegroundColor Yellow
Write-Host "   Backend:  docker run $ImageNameBackend`:$ImageTag" -ForegroundColor White
Write-Host "   Frontend: docker run $ImageNameFrontend`:$ImageTag" -ForegroundColor White
Write-Host ""

Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Deploy to Docker Swarm, Kubernetes, or cloud platform" -ForegroundColor White
Write-Host "   2. Configure environment variables" -ForegroundColor White
Write-Host "   3. Set up persistent volumes for MongoDB" -ForegroundColor White
Write-Host "   4. Configure networking and reverse proxy" -ForegroundColor White
Write-Host ""
