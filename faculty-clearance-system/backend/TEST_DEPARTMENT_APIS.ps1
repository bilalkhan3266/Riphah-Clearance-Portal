# PowerShell script to test all department APIs

Write-Host "`n🧪 DEPARTMENT APIs COMPREHENSIVE TEST" -ForegroundColor Cyan
Write-Host "═════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Get Login Token" -ForegroundColor Yellow
Write-Host "─────────────────────────" -ForegroundColor Yellow
Write-Host ""
Write-Host "Copy and run this command in PowerShell:" -ForegroundColor Green
Write-Host ""
$loginCmd = @"
`$response = Invoke-RestMethod -Uri http://localhost:5001/api/login `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body (ConvertTo-Json @{email='lab@test.edu'; password='Test@123'})

Write-Host "Token: `$(`$response.token)"
"@
Write-Host $loginCmd -ForegroundColor Cyan
Write-Host ""

Write-Host "Then copy the token value and use in next commands" -ForegroundColor Green
Write-Host ""

Write-Host ""
Write-Host "STEP 2: Test Each Department" -ForegroundColor Yellow
Write-Host "─────────────────────────────" -ForegroundColor Yellow
Write-Host ""

$departments = @("Lab", "Library", "Pharmacy", "Finance", "HR", "Records", "IT", "ORIC", "Admin", "Warden", "HOD", "Dean")
$token = "PASTE_YOUR_TOKEN_HERE"

Write-Host "Command template (replace PASTE_YOUR_TOKEN_HERE):" -ForegroundColor Green
Write-Host ""

foreach ($dept in $departments) {
    Write-Host "# Test $dept Department" -ForegroundColor Magenta
    Write-Host "`$response = Invoke-RestMethod -Uri http://localhost:5001/api/departments/$dept/issues ``"
    Write-Host "  -Method GET ``"
    Write-Host "  -Headers @{'Authorization'='Bearer $token'}"
    Write-Host ""
    Write-Host "Write-Host `"$dept : `$(`$response.count) issues`"" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host ""
Write-Host "STEP 3: Automated Test (After Getting Token)" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────" -ForegroundColor Yellow
Write-Host ""

$testScript = @"
# Login first
`$loginResp = Invoke-RestMethod -Uri http://localhost:5001/api/login `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body (ConvertTo-Json @{email='lab@test.edu'; password='Test@123'})

`$token = `$loginResp.token
Write-Host "✅ Logged in successfully" -ForegroundColor Green
Write-Host ""

# Test all departments
`$departments = @('Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean')
`$headers = @{'Authorization'="Bearer `$token"}

Write-Host "📊 DEPARTMENT ISSUES COUNT:" -ForegroundColor Cyan
Write-Host ""

foreach (`$dept in `$departments) {
    try {
        `$response = Invoke-RestMethod -Uri http://localhost:5001/api/departments/`$dept/issues `
          -Method GET `
          -Headers `$headers
        
        Write-Host "`$dept : `$(`$response.count) issues" -ForegroundColor Green
    } catch {
        Write-Host "`$dept : ERROR - `$(`$_.Exception.Message)" -ForegroundColor Red
    }
}
"@

Write-Host $testScript -ForegroundColor Cyan
Write-Host ""

Write-Host ""
Write-Host "EXPECTED RESULTS:" -ForegroundColor Yellow
Write-Host "─────────────────" -ForegroundColor Yellow
Write-Host ""
Write-Host "Lab      : 78 issues" -ForegroundColor Green
Write-Host "Library  : 86 issues" -ForegroundColor Green
Write-Host "Pharmacy : 85 issues" -ForegroundColor Green
Write-Host "Finance  : 74 issues" -ForegroundColor Green
Write-Host "HR       : 79 issues" -ForegroundColor Green
Write-Host "Records  : 86 issues" -ForegroundColor Green
Write-Host "IT       : 89 issues" -ForegroundColor Green
Write-Host "ORIC     : 86 issues" -ForegroundColor Green
Write-Host "Admin    : 80 issues" -ForegroundColor Green
Write-Host "Warden   : 81 issues" -ForegroundColor Green
Write-Host "HOD      : 75 issues" -ForegroundColor Green
Write-Host "Dean     : 82 issues" -ForegroundColor Green
Write-Host ""
Write-Host "Total    : 981 issues" -ForegroundColor Cyan
Write-Host ""

Write-Host ""
Write-Host "TROUBLESHOOTING:" -ForegroundColor Yellow
Write-Host "────────────────" -ForegroundColor Yellow
Write-Host ""
Write-Host "If API returns less than expected:" -ForegroundColor Red
Write-Host "  1. Check backend is running: npm run dev" -ForegroundColor Cyan
Write-Host "  2. Verify token is valid" -ForegroundColor Cyan
Write-Host "  3. Check browser console (F12) for errors" -ForegroundColor Cyan
Write-Host "  4. Check Network tab to see actual API response" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see only '1 pending':" -ForegroundColor Red
Write-Host "  1. The frontend might be showing filtered results" -ForegroundColor Cyan
Write-Host "  2. Might be showing only your user's assigned issues" -ForegroundColor Cyan
Write-Host "  3. Check if there's a status filter applied" -ForegroundColor Cyan
Write-Host ""
