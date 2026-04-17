# Create test user and run workflow

$BaseURL = "http://localhost:5001/api"

Write-Host "=== FACULTY CLEARANCE SYSTEM - WORKFLOW TEST ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Skip signup and go directly to login with existing test user
Write-Host "Step 1: Logging in with test credentials..." -ForegroundColor Yellow
$loginBody = @{
    email = "testlabstaff@university.edu"
    password = "testpass123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest "$BaseURL/login" `
      -Method POST `
      -ContentType 'application/json' `
      -Body $loginBody

    if ($loginResponse.StatusCode -eq 200) {
        $loginData = $loginResponse.Content | ConvertFrom-Json
        $token = $loginData.token
        Write-Host "✅ Login successful" -ForegroundColor Green
        Write-Host "   User: $($loginData.user.full_name)" -ForegroundColor Cyan
        Write-Host "   Role: $($loginData.user.role)" -ForegroundColor Cyan
        
        $authHeaders = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        # Use faculty_id or employee_id if available, else use email as identifier
        $facultyId = if ($loginData.user.faculty_id) { $loginData.user.faculty_id } elseif ($loginData.user.employee_id) { $loginData.user.employee_id } else { "TESTFAC_$(Get-Random)" }
        Write-Host "   Faculty ID: $facultyId" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Now test the workflow with authenticated headers
Write-Host ""
Write-Host "Step 2: Submitting clearance request..." -ForegroundColor Yellow

$clearanceBody = @{
    facultyId = $facultyId
} | ConvertTo-Json

try {
    $clearanceResponse = Invoke-WebRequest "$BaseURL/clearance/submit" `
      -Method POST `
      -Headers $authHeaders `
      -Body $clearanceBody

    if ($clearanceResponse.StatusCode -eq 200) {
        $clearanceData = $clearanceResponse.Content | ConvertFrom-Json
        Write-Host "✅ Clearance Status: $($clearanceData.data.overallStatus)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 3: Creating a test issue..." -ForegroundColor Yellow

$issueBody = @{
    facultyId = $facultyId
    facultyName = "Test Faculty"
    facultyEmail = "test@university.edu"
    itemType = "Equipment"
    description = "Test equipment not returned"
    quantity = 1
    dueDate = "2026-04-15"
    notes = "Test issue"
} | ConvertTo-Json

try {
    $issueResponse = Invoke-WebRequest "$BaseURL/departments/Lab/issue" `
      -Method POST `
      -Headers $authHeaders `
      -Body $issueBody

    if ($issueResponse.StatusCode -eq 200 -or $issueResponse.StatusCode -eq 201) {
        $issueData = $issueResponse.Content | ConvertFrom-Json
        $issueId = $issueData.data._id
        Write-Host "✅ Issue created: $issueId" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "   Details: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 4: Recording a return..." -ForegroundColor Yellow

$returnBody = @{
    facultyId = $facultyId
    facultyName = "Test Faculty"
    facultyEmail = "test@university.edu"
    referenceIssueId = $issueId
    quantityReturned = 1
    condition = "Good"
    notes = "Test return"
} | ConvertTo-Json

try {
    $returnResponse = Invoke-WebRequest "$BaseURL/departments/Lab/return" `
      -Method POST `
      -Headers $authHeaders `
      -Body $returnBody

    if ($returnResponse.StatusCode -eq 200 -or $returnResponse.StatusCode -eq 201) {
        $returnData = $returnResponse.Content | ConvertFrom-Json
        Write-Host "✅ Return recorded: Status = $($returnData.data.status)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "   Details: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 5: Checking final clearance status..." -ForegroundColor Yellow

try {
    $statusResponse = Invoke-WebRequest "$BaseURL/clearance/$facultyId" `
      -Method GET `
      -Headers $authHeaders

    if ($statusResponse.StatusCode -eq 200) {
        $statusData = $statusResponse.Content | ConvertFrom-Json
        Write-Host "✅ Final Status: $($statusData.data.overallStatus)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== TEST COMPLETE ===" -ForegroundColor Cyan
