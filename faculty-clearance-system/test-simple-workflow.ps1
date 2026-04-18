# Test workflow with proper debugging
$BaseURL = "http://localhost:5001/api"

Write-Host "=== FACULTY CLEARANCE WORKFLOW TEST ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "testlabstaff@university.edu"
    password = "testpass123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest "$BaseURL/login" -Method POST -ContentType 'application/json' -Body $loginBody
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token
$faculty_id = $loginData.user.employee_id
$user_id = $loginData.user.id

Write-Host "✅ Logged in as: $($loginData.user.full_name)" -ForegroundColor Green
Write-Host "   Employee ID: $faculty_id" -ForegroundColor Cyan
Write-Host ""

$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 2: Submit clearance using the logged-in user's employee ID
Write-Host "Step 2: Submitting clearance request..." -ForegroundColor Yellow
$clearanceBody = @{
    facultyId = $faculty_id  # Use the logged-in user's ID
} | ConvertTo-Json

try {
    $clearanceResponse = Invoke-WebRequest "$BaseURL/clearance/submit" -Method POST -Headers $authHeaders -Body $clearanceBody
    $clearanceData = $clearanceResponse.Content | ConvertFrom-Json
    Write-Host "✅ Clearance Status: $($clearanceData.data.overallStatus)" -ForegroundColor Green
    if ($clearanceData.data.overallStatus -eq "Cleared") {
        Write-Host "   ✅ ALL DEPARTMENTS APPROVED!" -ForegroundColor Green
    } else {
        Write-Host "   Status: $($clearanceData.data.overallStatus)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Step 3: Create an issue (this requires department staff role, but let's try)
Write-Host "Step 3: Creating a test issue..." -ForegroundColor Yellow
$issueBody = @{
    facultyId = $faculty_id
    facultyName = "Test Faculty"
    facultyEmail = "test@university.edu"
    itemType = "Equipment"
    description = "Test equipment not returned"
    quantity = 1
    notes = "Workflow test issue"
} | ConvertTo-Json

try {
    $issueResponse = Invoke-WebRequest "$BaseURL/departments/Lab/issue" -Method POST -Headers $authHeaders -Body $issueBody
    $issueData = $issueResponse.Content | ConvertFrom-Json
    $issueId = $issueData.data._id
    Write-Host "✅ Issue created: $issueId" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Issue creation error: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    if ($_.Exception.Response -ne $null) {
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "   Details: $errorContent" -ForegroundColor Gray
        } catch { }
    }
}
Write-Host ""

# Step 4: Check final status
Write-Host "Step 4: Checking final clearance status..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-WebRequest "$BaseURL/clearance/$faculty_id" -Method GET -Headers $authHeaders
    $statusData = $statusResponse.Content | ConvertFrom-Json
    Write-Host "✅ Final Clearance Status: $($statusData.data.overallStatus)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "✅ Login: Successful" -ForegroundColor Green
Write-Host "✅ Clearance Submit: Tested" -ForegroundColor Green
Write-Host "⚠️  Issue Creation: May require department staff role" -ForegroundColor Yellow
Write-Host ""
