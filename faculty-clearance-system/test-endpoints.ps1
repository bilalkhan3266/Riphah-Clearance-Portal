$loginBody = @{email='testlabstaff@university.edu'; password='testpass123'} | ConvertTo-Json
$loginResponse = Invoke-WebRequest 'http://localhost:5001/api/login' -Method POST -ContentType 'application/json' -Body $loginBody
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token
$faculty_id = $loginData.user.employee_id

Write-Host "Logged in as: $($loginData.user.full_name)"
Write-Host "Faculty ID: $faculty_id"
Write-Host ""

$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Testing multiple endpoints:"
Write-Host ""

# Test 1: GET /api/clearance/:facultyId
Write-Host "Test 1: GET /api/clearance/$faculty_id"
try {
    $r1 = Invoke-WebRequest "http://localhost:5001/api/clearance/$faculty_id" -Method GET -Headers $authHeaders
    Write-Host "✅ Status $($r1.StatusCode)"
} catch {
    Write-Host "❌ Error $($_.Exception.Response.StatusCode)"
}

# Test 2: POST /api/clearance/submit
Write-Host "Test 2: POST /api/clearance/submit"
$body = @{ facultyId = $faculty_id } | ConvertTo-Json
try {
    $r2 = Invoke-WebRequest "http://localhost:5001/api/clearance/submit" -Method POST -Headers $authHeaders -Body $body
    Write-Host "✅ Status $($r2.StatusCode)"
} catch {
    Write-Host "❌ Error $($_.Exception.Response.StatusCode)"
}

# Test 3: GET /api/health
Write-Host "Test 3: GET /api/health"
try {
    $r3 = Invoke-WebRequest "http://localhost:5001/api/health" -Method GET
    Write-Host "✅ Status $($r3.StatusCode)"
} catch {
    Write-Host "❌ Error $($_.Exception.Response.StatusCode)"
}

# Test 4: POST /api/clearance-requests (clearanceRoutes endpoint)
Write-Host "Test 4: POST /api/clearance-requests (should exist)"
$body2 = @{ departmentName = "Lab" } | ConvertTo-Json
try {
    $r4 = Invoke-WebRequest "http://localhost:5001/api/clearance-requests" -Method POST -Headers $authHeaders -Body $body2
    Write-Host "✅ Status $($r4.StatusCode)"
} catch {
    Write-Host "❌ Error $($_.Exception.Response.StatusCode)"
}
