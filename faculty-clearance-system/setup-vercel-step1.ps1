# Vercel Deployment Automation Setup
# This script will help you deploy to Vercel automatically

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Vercel Frontend Deployment Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if we're ready
Write-Host "[STEP 1] Checking prerequisites..." -ForegroundColor Yellow
Write-Host "- Frontend directory: $((Test-Path 'frontend/') ? 'OK' : 'MISSING')"
Write-Host "- GitHub Actions workflow: $((Test-Path '.github/workflows/vercel-deploy.yml') ? 'OK' : 'MISSING')"
Write-Host ""

# Step 2: Explain what needs to happen
Write-Host "[STEP 2] What happens next..." -ForegroundColor Yellow
Write-Host ""
Write-Host "You need to get 3 tokens from Vercel and add them to GitHub:" -ForegroundColor White
Write-Host "  1. VERCEL_TOKEN - Your personal access token" -ForegroundColor White
Write-Host "  2. VERCEL_ORG_ID - Your organization/team ID" -ForegroundColor White
Write-Host "  3. VERCEL_PROJECT_ID - Your Riphah-Clearance-Portal project ID" -ForegroundColor White
Write-Host ""

# Step 3: Open Vercel in browser
Write-Host "[STEP 3] Opening Vercel dashboard..." -ForegroundColor Yellow
Write-Host "  - Opening https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "Do you want me to open the Vercel setup page? (yes/no)"

if ($response -eq 'yes' -or $response -eq 'y') {
    # Open Vercel dashboard
    Start-Process "https://vercel.com/dashboard"
    Start-Sleep -Seconds 2
    
    # Open token creation page
    Start-Process "https://vercel.com/account/tokens"
    Start-Sleep -Seconds 2
    
    Write-Host ""
    Write-Host "[OK] Vercel pages opened in your browser" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next actions in browser:" -ForegroundColor Yellow
    Write-Host "1. Create a NEW TOKEN:" -ForegroundColor White
    Write-Host "   - Go to https://vercel.com/account/tokens" -ForegroundColor Cyan
    Write-Host "   - Click 'Create New Token'" -ForegroundColor Cyan
    Write-Host "   - Name: 'GitHub Actions'" -ForegroundColor Cyan
    Write-Host "   - Expiration: Never" -ForegroundColor Cyan
    Write-Host "   - Copy the token (you'll only see it once!)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Get your Team ID:" -ForegroundColor White
    Write-Host "   - Go to https://vercel.com/account/general" -ForegroundColor Cyan
    Write-Host "   - Find 'Team ID' and copy it" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Create Vercel project (if not exists):" -ForegroundColor White
    Write-Host "   - Go to https://vercel.com/dashboard" -ForegroundColor Cyan
    Write-Host "   - Click 'Add New' > 'Project'" -ForegroundColor Cyan
    Write-Host "   - Import Git Repository > Select Riphah-Clearance-Portal" -ForegroundColor Cyan
    Write-Host "   - Root Directory: frontend/" -ForegroundColor Cyan
    Write-Host "   - Click Deploy" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "4. Get your Project ID:" -ForegroundColor White
    Write-Host "   - After deployment, go to project Settings > General" -ForegroundColor Cyan
    Write-Host "   - Find 'Project ID' and copy it" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Come back here and have these 3 values ready:" -ForegroundColor White
Write-Host "   - VERCEL_TOKEN" -ForegroundColor Cyan
Write-Host "   - VERCEL_ORG_ID" -ForegroundColor Cyan
Write-Host "   - VERCEL_PROJECT_ID" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Run: ./add-vercel-secrets.ps1" -ForegroundColor White
Write-Host ""
Write-Host "That script will add these secrets to GitHub automatically." -ForegroundColor White
Write-Host ""

$pause = Read-Host "Press Enter when you have your tokens ready and created Vercel project..."
