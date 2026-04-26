#!/usr/bin/env pwsh
# Faculty Clearance System - Docker Production Deployment
# Deploys with docker-compose.prod.yml to production

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Faculty Clearance System - Docker Production Deployment       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check .env file
Write-Host "[1/4] Checking production environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Copy .env.docker to .env and configure it" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ .env file found" -ForegroundColor Green

# Validate environment variables
Write-Host "   Validating required variables..." -ForegroundColor Cyan
$envContent = Get-Content ".env"
$required = @("MONGO_PASSWORD", "JWT_SECRET", "CORS_ORIGIN", "EMAIL_USER", "EMAIL_PASSWORD")
$missing = @()

foreach ($var in $required) {
    if (-not ($envContent | Select-String "^${var}=")) {
        $missing += $var
    }
}

if ($missing.Count -gt 0) {
    Write-Host "⚠️  Missing variables: $($missing -join ', ')" -ForegroundColor Yellow
}

# Check Docker
Write-Host ""
Write-Host "[2/4] Checking Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found" -ForegroundColor Red
    exit 1
}

# Check Docker Compose
try {
    docker compose version | Out-Null
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found" -ForegroundColor Red
    exit 1
}

# Pull latest images
Write-Host ""
Write-Host "[3/4] Pulling latest images..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml pull
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Some images failed to pull (this is OK if using local builds)" -ForegroundColor Yellow
}

# Start production services
Write-Host ""
Write-Host "[4/4] Starting production services..." -ForegroundColor Yellow
Write-Host "   This will start:" -ForegroundColor Cyan
Write-Host "   • MongoDB database" -ForegroundColor Cyan
Write-Host "   • Backend API server" -ForegroundColor Cyan
Write-Host "   • Frontend React app" -ForegroundColor Cyan
Write-Host "   • Nginx reverse proxy (port 80/443)" -ForegroundColor Cyan
Write-Host ""

docker compose -f docker-compose.prod.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Production deployment started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Cyan
    docker compose -f docker-compose.prod.yml ps
    
    Write-Host ""
    Write-Host "🌐 Access Your Application:" -ForegroundColor Green
    Write-Host "   Frontend/Backend: http://localhost (http://your-domain.com)" -ForegroundColor Yellow
    Write-Host "   API Direct:       http://localhost:5001" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
    Write-Host "   View logs:       docker compose -f docker-compose.prod.yml logs -f" -ForegroundColor White
    Write-Host "   Stop services:   docker compose -f docker-compose.prod.yml stop" -ForegroundColor White
    Write-Host "   Restart:         docker compose -f docker-compose.prod.yml restart" -ForegroundColor White
    Write-Host "   Remove all:      docker compose -f docker-compose.prod.yml down" -ForegroundColor White
    Write-Host ""
    
    Write-Host "⏱️  Waiting for services to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host ""
    Write-Host "🎉 Production deployment complete!" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "   Check Docker daemon is running" -ForegroundColor Yellow
    Write-Host "   View logs: docker compose -f docker-compose.prod.yml logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Configure SSL certificates in ./ssl directory" -ForegroundColor White
Write-Host "   2. Update DNS to point to this server" -ForegroundColor White
Write-Host "   3. Monitor logs: docker compose -f docker-compose.prod.yml logs -f" -ForegroundColor White
Write-Host "   4. Set up automated backups for MongoDB" -ForegroundColor White
Write-Host ""
