# Add Vercel Secrets to GitHub Repository
# This script adds your Vercel tokens as GitHub secrets

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Add Vercel Secrets to GitHub" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is installed
Write-Host "[STEP 1] Checking GitHub CLI..." -ForegroundColor Yellow
$ghInstalled = gh --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "GitHub CLI found: $($ghInstalled -join ' ')" -ForegroundColor Green
    $useGhCli = $true
} else {
    Write-Host "GitHub CLI not found" -ForegroundColor Yellow
    Write-Host "Will provide manual instructions instead" -ForegroundColor Yellow
    $useGhCli = $false
}

Write-Host ""

if ($useGhCli) {
    # Using GitHub CLI
    Write-Host "[STEP 2] Collecting Vercel secrets..." -ForegroundColor Yellow
    Write-Host ""
    
    $vercelToken = Read-Host "Enter VERCEL_TOKEN"
    $vercelOrgId = Read-Host "Enter VERCEL_ORG_ID"
    $vercelProjectId = Read-Host "Enter VERCEL_PROJECT_ID"
    
    Write-Host ""
    Write-Host "[STEP 3] Adding secrets to GitHub..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        Write-Host "Adding VERCEL_TOKEN..." -ForegroundColor Cyan
        echo $vercelToken | gh secret set VERCEL_TOKEN --repo bilalkhan3266/Riphah-Clearance-Portal
        
        Write-Host "Adding VERCEL_ORG_ID..." -ForegroundColor Cyan
        echo $vercelOrgId | gh secret set VERCEL_ORG_ID --repo bilalkhan3266/Riphah-Clearance-Portal
        
        Write-Host "Adding VERCEL_PROJECT_ID..." -ForegroundColor Cyan
        echo $vercelProjectId | gh secret set VERCEL_PROJECT_ID --repo bilalkhan3266/Riphah-Clearance-Portal
        
        Write-Host ""
        Write-Host "[OK] All secrets added successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your frontend is now set up for automatic deployment!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next: Push code to trigger deployment" -ForegroundColor Yellow
        Write-Host "  git add ." -ForegroundColor Cyan
        Write-Host "  git commit -m 'Trigger Vercel deployment'" -ForegroundColor Cyan
        Write-Host "  git push origin master" -ForegroundColor Cyan
        
    } catch {
        Write-Host "[ERROR] Failed to add secrets: $_" -ForegroundColor Red
        Write-Host "Please add secrets manually via GitHub web interface" -ForegroundColor Yellow
    }
    
} else {
    # Manual instructions
    Write-Host "[INFO] Manual Secret Setup" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Since GitHub CLI is not installed, please add secrets manually:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Go to: https://github.com/bilalkhan3266/Riphah-Clearance-Portal" -ForegroundColor Cyan
    Write-Host "2. Click 'Settings' (top menu)" -ForegroundColor Cyan
    Write-Host "3. Click 'Secrets and variables' > 'Actions' (left sidebar)" -ForegroundColor Cyan
    Write-Host "4. Click 'New repository secret'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Add these 3 secrets:" -ForegroundColor White
    Write-Host "  Name: VERCEL_TOKEN" -ForegroundColor Yellow
    Write-Host "  Value: (your token from Vercel)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Name: VERCEL_ORG_ID" -ForegroundColor Yellow
    Write-Host "  Value: (your Team ID from Vercel)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Name: VERCEL_PROJECT_ID" -ForegroundColor Yellow
    Write-Host "  Value: (your Project ID from Vercel)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then push code to trigger automatic deployment." -ForegroundColor White
    
    Write-Host ""
    Write-Host "Open GitHub Settings?" -ForegroundColor Yellow
    $response = Read-Host "(yes/no)"
    if ($response -eq 'yes' -or $response -eq 'y') {
        Start-Process "https://github.com/bilalkhan3266/Riphah-Clearance-Portal/settings/secrets/actions"
    }
}

Write-Host ""
pause
