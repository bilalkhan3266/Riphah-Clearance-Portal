# Faculty Clearance System - Complete Workflow Test with Authentication
# Tests: Login -> Clearance Submission -> Issue Creation -> Return Processing -> Auto-Approval

$BaseURL = "http://localhost:5001/api"

# Test credentials (adjust based on your test users)
$LoginEmail = "test.faculty@university.edu"
$LoginPassword = "password123"
$FacultyId = "E12345"
$DeptName = "Lab"
$FacultyName = "Test Faculty Member"
$FacultyEmail = "test@university.edu"

Write-Host "=== FACULTY CLEARANCE SYSTEM - COMPLETE WORKFLOW TEST ===" -ForegroundColor Cyan
Write-Host ""

# Step 0: Try to login to get token
Write-Host "Step 0: Attempting to login..." -ForegroundColor Yellow
$loginRequest = @{
    email = $LoginEmail
    password = $LoginPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$BaseURL/auth/login" `
      -Method POST `
      -Headers @{"Content-Type"="application/json"} `
      -Body $loginRequest
    
    if ($loginResponse.StatusCode -eq 200) {
        $loginData = $loginResponse.Content | ConvertFrom-Json
        $token = $loginData.token
        Write-Host "✅ Login successful, token obtained" -ForegroundColor Green
        $authHeaders = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
    } else {
        Write-Host "❌ Login failed with status: $($loginResponse.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "⚠️  Login failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Proceeding without authentication (testing public endpoints only)" -ForegroundColor Yellow
    $authHeaders = @{"Content-Type"="application/json"}
}
Write-Host ""

# Step 1: Try to submit clearance
Write-Host "Step 1: Submit clearance request (no issues yet)" -ForegroundColor Yellow
$clearanceRequest1 = @{
    facultyId = $FacultyId
} | ConvertTo-Json

try {
    $response1 = Invoke-WebRequest -Uri "$BaseURL/clearance/submit" `
      -Method POST `
      -Headers $authHeaders `
      -Body $clearanceRequest1 `
      -ErrorAction SilentlyContinue
    
    if ($response1.StatusCode -eq 200) {
        $result1 = $response1.Content | ConvertFrom-Json
        Write-Host "✅ Clearance Response Status: $($result1.data.overallStatus)" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: $($response1.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($response1.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Exception: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Step 2: Create an issue in Lab department
Write-Host "Step 2: Create issue in Lab department" -ForegroundColor Yellow
$issueRequest = @{
    facultyId = $FacultyId
    facultyName = $FacultyName
    facultyEmail = $FacultyEmail
    itemType = "Equipment"
    description = "Advanced spectroscopy equipment not returned"
    quantity = 1
    dueDate = "2026-04-15"
    notes = "Test issue for workflow verification"
} | ConvertTo-Json

try {
    $response2 = Invoke-WebRequest -Uri "$BaseURL/departments/$DeptName/issue" `
      -Method POST `
      -Headers $authHeaders `
      -Body $issueRequest `
      -ErrorAction SilentlyContinue
    
    if ($response2.StatusCode -eq 200 -or $response2.StatusCode -eq 201) {
        $issueData = $response2.Content | ConvertFrom-Json
        $issueId = $issueData.data._id
        Write-Host "✅ Issue created with ID: $issueId" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: $($response2.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($response2.Content)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Exception: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Submit clearance again 
Write-Host "Step 3: Submit clearance again (with pending issue)" -ForegroundColor Yellow
try {
    $response3 = Invoke-WebRequest -Uri "$BaseURL/clearance/submit" `
      -Method POST `
      -Headers $authHeaders `
      -Body $clearanceRequest1 `
      -ErrorAction SilentlyContinue
    
    if ($response3.StatusCode -eq 200) {
        $result3 = $response3.Content | ConvertFrom-Json
        Write-Host "✅ Clearance Response Status: $($result3.data.overallStatus)" -ForegroundColor Green
        Write-Host "   Expected: In Progress or Rejected (due to pending issue)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: $($response3.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Exception: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Step 4: Record return for the issue
Write-Host "Step 4: Record return of issued item" -ForegroundColor Yellow
$returnRequest = @{
    facultyId = $FacultyId
    facultyName = $FacultyName
    facultyEmail = $FacultyEmail
    referenceIssueId = $issueId
    quantityReturned = 1
    condition = "Good"
    notes = "Equipment returned in good working condition"
} | ConvertTo-Json

Write-Host "   Sending return request with issueId: $issueId" -ForegroundColor Cyan

try {
    $response4 = Invoke-WebRequest -Uri "$BaseURL/departments/$DeptName/return" `
      -Method POST `
      -Headers $authHeaders `
      -Body $returnRequest `
      -ErrorAction SilentlyContinue
    
    if ($response4.StatusCode -eq 200 -or $response4.StatusCode -eq 201) {
        $returnData = $response4.Content | ConvertFrom-Json
        Write-Host "✅ Return processed successfully" -ForegroundColor Green
        Write-Host "   Return status: $($returnData.data.status)" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: $($response4.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($response4.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Exception: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Step 5: Check clearance status
Write-Host "Step 5: Check final clearance status" -ForegroundColor Yellow
try {
    $response5 = Invoke-WebRequest -Uri "$BaseURL/clearance/$FacultyId" `
      -Method GET `
      -Headers $authHeaders `
      -ErrorAction SilentlyContinue
    
    if ($response5.StatusCode -eq 200) {
        $statusData = $response5.Content | ConvertFrom-Json
        Write-Host "✅ Final Status: $($statusData.data.overallStatus)" -ForegroundColor Green
        if ($statusData.data.overallStatus -eq "Cleared") {
            Write-Host "✅ AUTO-CLEARANCE WORKING CORRECTLY!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Status check - Department statuses:" -ForegroundColor Yellow
            if ($statusData.data.departments -and $statusData.data.departments.Lab) {
                Write-Host "   Lab Status: $($statusData.data.departments.Lab.status)" -ForegroundColor Cyan
            }
        }
    } else {
        Write-Host "❌ Error: $($response5.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Exception: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== TEST COMPLETE ===" -ForegroundColor Cyan
