#!/usr/bin/env pwsh
# Faculty Clearance System - Automated Vercel Deployment
# This script deploys the frontend to Vercel using the Vercel CLI

param(
    [string]$ProjectName = "faculty-clearance-frontend"
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Faculty Clearance System - Vercel Frontend Deployment         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "[1/4] Checking Vercel CLI installation..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host "   Install with: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Login to Vercel
Write-Host ""
Write-Host "[2/4] Authenticating with Vercel..." -ForegroundColor Yellow
Write-Host "   📝 Your browser will open for authentication" -ForegroundColor Cyan
vercel login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel authentication failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Authenticated with Vercel" -ForegroundColor Green

# Navigate to frontend
Write-Host ""
Write-Host "[3/4] Preparing frontend for deployment..." -ForegroundColor Yellow
cd frontend

# Build frontend
Write-Host "   Building frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# Deploy to Vercel
Write-Host ""
Write-Host "[4/4] Deploying frontend to Vercel..." -ForegroundColor Yellow
Write-Host "   This may take 3-5 minutes..." -ForegroundColor Cyan

Write-Host ""
Write-Host "   ⚠️  When prompted, provide:" -ForegroundColor Yellow
Write-Host "      - Project name: $ProjectName" -ForegroundColor Cyan
Write-Host "      - Framework: React" -ForegroundColor Cyan
Write-Host "      - Root directory: ./" -ForegroundColor Cyan
Write-Host ""

vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Your frontend URL:" -ForegroundColor Cyan
    Write-Host "   Check Vercel dashboard for your deployment URL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Copy your Vercel frontend URL" -ForegroundColor Cyan
    Write-Host "   2. Go to Railway dashboard" -ForegroundColor Cyan
    Write-Host "   3. Update CORS_ORIGIN and FRONTEND_URL with Vercel URL" -ForegroundColor Cyan
    Write-Host "   4. Redeploy backend on Railway" -ForegroundColor Cyan
    Write-Host "   5. Test your application at your Vercel URL" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Frontend deployment complete!" -ForegroundColor Green
