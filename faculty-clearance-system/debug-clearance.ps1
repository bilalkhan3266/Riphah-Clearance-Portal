$loginBody = @{email='testlabstaff@university.edu'; password='testpass123'} | ConvertTo-Json
$loginResponse = Invoke-WebRequest 'http://localhost:5001/api/login' -Method POST -ContentType 'application/json' -Body $loginBody
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token
$faculty_id = $loginData.user.employee_id

Write-Host "Logged in as: $($loginData.user.full_name)"
Write-Host "Faculty ID: $faculty_id"
Write-Host "Token: $($token.Substring(0, 20))..."
Write-Host ""

$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$clearanceBody = @{ facultyId = $faculty_id } | ConvertTo-Json

Write-Host "Testing: POST /api/clearance/submit"
Write-Host "Faculty ID in request: $faculty_id"
Write-Host ""

try {
    $response = Invoke-WebRequest 'http://localhost:5001/api/clearance/submit' `
      -Method POST `
      -Headers $authHeaders `
      -Body $clearanceBody
    
    Write-Host "✅ Success: $($response.StatusCode)"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
    
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object IO.StreamReader($stream)
        $content = $reader.ReadToEnd()
        Write-Host "Response Body: $content"
    } catch { }
}
