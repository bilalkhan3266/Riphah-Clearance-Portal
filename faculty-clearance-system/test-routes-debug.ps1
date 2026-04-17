$loginBody = @{email='testlabstaff@university.edu'; password='testpass123'} | ConvertTo-Json
$loginResponse = Invoke-WebRequest 'http://localhost:5001/api/login' -Method POST -ContentType 'application/json' -Body $loginBody
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token

$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{ facultyId = "LAB001" } | ConvertTo-Json

# Test different POST paths
@(
    "/api/clearance/submit",
    "/api/clearance/submit/test",
    "/api/clearance",
    "/clearance/submit"
) | ForEach-Object {
    Write-Host "Testing POST $_"
    try {
        $r = Invoke-WebRequest "http://localhost:5001$_" -Method POST -Headers $authHeaders -Body $body
        Write-Host "  ✅ $($r.StatusCode)"
    } catch {
        Write-Host "  ❌ $($_.Exception.Response.StatusCode)"
    }
}
