# Faculty Clearance System - Git Initialization Script for PowerShell

Write-Host ""
Write-Host "============================================"
Write-Host " Initializing Git Repository"
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

# Initialize git
Write-Host "[1/4] Initializing git repository..."
git init
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to initialize git" -ForegroundColor Red
    exit 1
}

# Add all files
Write-Host ""
Write-Host "[2/4] Adding all files..."
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All files added" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add files" -ForegroundColor Red
    exit 1
}

# Create initial commit
Write-Host ""
Write-Host "[3/4] Creating initial commit..."
git commit -m "Initial commit: Faculty Clearance System - Production Ready"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Initial commit created" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create commit" -ForegroundColor Red
    exit 1
}

# Branch to main
Write-Host ""
Write-Host "[4/4] Setting main branch..."
git branch -M main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Main branch set" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set main branch" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================"
Write-Host " Git Initialization Complete!"
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Create a new repository on GitHub:"
Write-Host "   → Go to https://github.com/new"
Write-Host "   → Name: Riphah-Clearance-Portal"
Write-Host "   → Make it PUBLIC"
Write-Host "   → Don't initialize with anything"
Write-Host "   → Click 'Create repository'"
Write-Host ""
Write-Host "2. Add remote origin (copy from GitHub):"
Write-Host "   → git remote add origin https://github.com/YOUR_USERNAME/Riphah-Clearance-Portal.git"
Write-Host ""
Write-Host "3. Push to GitHub:"
Write-Host "   → git push -u origin main"
Write-Host ""
Write-Host "4. Then follow the deployment guide:"
Write-Host "   → Open: DEPLOYMENT_QUICK_START.md"
Write-Host ""
