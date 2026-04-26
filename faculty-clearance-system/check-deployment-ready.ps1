# Faculty Clearance System - Deployment Helper Script for PowerShell

Write-Host ""
Write-Host "============================================"
Write-Host " Faculty Clearance System - Deployment Check"
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/5] Checking Node.js installation..."
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is NOT installed" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
Write-Host ""
Write-Host "[2/5] Checking npm installation..."
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is NOT installed" -ForegroundColor Red
    exit 1
}

# Check Git
Write-Host ""
Write-Host "[3/5] Checking Git installation..."
try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is NOT installed" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

# Check Backend structure
Write-Host ""
Write-Host "[4/5] Checking Backend structure..."
if (Test-Path "backend/package.json") {
    Write-Host "✅ Backend package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend package.json NOT found" -ForegroundColor Red
}

if (Test-Path "backend/.env") {
    Write-Host "✅ Backend .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend .env file NOT found" -ForegroundColor Yellow
}

if (Test-Path "backend/server.js") {
    Write-Host "✅ Backend server.js found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server.js NOT found" -ForegroundColor Red
}

# Check Frontend structure
Write-Host ""
Write-Host "[5/5] Checking Frontend structure..."
if (Test-Path "frontend/package.json") {
    Write-Host "✅ Frontend package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend package.json NOT found" -ForegroundColor Red
}

if (Test-Path "frontend/public") {
    Write-Host "✅ Frontend public folder found" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend public folder NOT found" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================"
Write-Host " Deployment Check Complete"
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Ensure all checks passed ✅"
Write-Host "2. Read DEPLOYMENT_QUICK_START.md"
Write-Host "3. Follow the deployment guide"
Write-Host "4. Set up MongoDB Atlas"
Write-Host "5. Connect GitHub repository"
Write-Host "6. Deploy to Railway (Backend)"
Write-Host "7. Deploy to Vercel (Frontend)"
Write-Host ""
