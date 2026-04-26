#!/usr/bin/env pwsh
# Faculty Clearance System - Automated Railway Deployment
# This script deploys the backend to Railway using the Railway CLI

param(
    [string]$ProjectName = "faculty-clearance-backend",
    [string]$Environment = "production"
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Faculty Clearance System - Railway Backend Deployment         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "[1/5] Checking Railway CLI installation..." -ForegroundColor Yellow
try {
    $railwayVersion = railway --version
    Write-Host "✅ Railway CLI found: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found!" -ForegroundColor Red
    Write-Host "   Install with: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Login to Railway
Write-Host ""
Write-Host "[2/5] Authenticating with Railway..." -ForegroundColor Yellow
Write-Host "   📝 Your browser will open for authentication" -ForegroundColor Cyan
railway login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Railway authentication failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Authenticated with Railway" -ForegroundColor Green

# Link to project
Write-Host ""
Write-Host "[3/5] Linking to Railway project..." -ForegroundColor Yellow
try {
    railway link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Project link failed" -ForegroundColor Red
        Write-Host "   You may need to create a project first in Railway dashboard" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Project linked" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Project already linked" -ForegroundColor Yellow
}

# Set environment variables
Write-Host ""
Write-Host "[4/5] Configuring environment variables..." -ForegroundColor Yellow

$envVars = @{
    "PORT" = "5001"
    "NODE_ENV" = "production"
}

foreach ($key in $envVars.Keys) {
    Write-Host "   Setting $key..." -ForegroundColor Cyan
    railway variables set $key=$($envVars[$key])
}

Write-Host "   ⚠️  IMPORTANT: Set these additional variables in Railway dashboard:" -ForegroundColor Yellow
Write-Host "      - MONGO_URI (MongoDB Atlas connection string)" -ForegroundColor Cyan
Write-Host "      - JWT_SECRET (random 32+ character string)" -ForegroundColor Cyan
Write-Host "      - CORS_ORIGIN (your Vercel frontend URL)" -ForegroundColor Cyan
Write-Host "      - FRONTEND_URL (your Vercel frontend URL)" -ForegroundColor Cyan
Write-Host "      - EMAIL_USER (Gmail address)" -ForegroundColor Cyan
Write-Host "      - EMAIL_PASSWORD (Gmail app password)" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Do this now, then press Enter to continue..."
Read-Host

# Deploy backend
Write-Host ""
Write-Host "[5/5] Deploying backend to Railway..." -ForegroundColor Yellow
Write-Host "   This may take 5-10 minutes..." -ForegroundColor Cyan
cd backend
railway up --detach

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Deployment Details:" -ForegroundColor Cyan
    railway status
    Write-Host ""
    Write-Host "🔗 Get your backend URL:" -ForegroundColor Cyan
    railway domain
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Copy your Railway domain URL" -ForegroundColor Cyan
    Write-Host "   2. Update CORS_ORIGIN in Railway variables" -ForegroundColor Cyan
    Write-Host "   3. Deploy frontend to Vercel" -ForegroundColor Cyan
    Write-Host "   4. Update REACT_APP_API_URL in Vercel" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "   Check logs: railway logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Backend deployment complete!" -ForegroundColor Green
