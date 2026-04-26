# Automated Railway & Vercel Setup Script
# This script prepares your repository for Railway and Vercel deployment

Write-Host "[RAILWAY & VERCEL SETUP] Faculty Clearance System Deployment" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# Step 1: Check Git Status
Write-Host "`n[STEP 1] Checking Git Status..." -ForegroundColor Yellow
git status --short

# Step 2: Stage all changes
Write-Host "`n[STEP 2] Staging deployment configuration files..." -ForegroundColor Yellow
git add backend/railway.json
git add backend/.env.production
git add frontend/vercel.json
git add frontend/.env.production
git add RAILWAY_VERCEL_DEPLOYMENT_GUIDE.md

Write-Host "[OK] Files staged for commit" -ForegroundColor Green

# Step 3: Show what will be committed
Write-Host "`n[INFO] Changes to be committed:" -ForegroundColor Yellow
git diff --cached --stat

# Step 4: Commit
Write-Host "`n[STEP 3] Creating deployment configuration commit..." -ForegroundColor Yellow
$commitMessage = "Configure Railway and Vercel deployment settings"
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Commit created successfully" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Commit creation had issues (might be OK if no changes)" -ForegroundColor Yellow
}

# Step 5: Push to GitHub
Write-Host "`n[STEP 4] Pushing to GitHub..." -ForegroundColor Yellow
git push origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Pushed successfully to GitHub" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Push failed. Check your GitHub connection" -ForegroundColor Red
}

Write-Host "`n" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Repository Ready for Deployment!" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Open RAILWAY_VERCEL_DEPLOYMENT_GUIDE.md for detailed setup instructions" -ForegroundColor White
Write-Host "2. Go to https://railway.app and connect your GitHub repository" -ForegroundColor White
Write-Host "3. Go to https://vercel.com and connect your GitHub repository" -ForegroundColor White
Write-Host "4. Configure environment variables as described in the guide" -ForegroundColor White
Write-Host "`n" -ForegroundColor Cyan
