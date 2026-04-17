
# Direct login test
$loginBody = @{email='it@gmail.com'; password='123456'} | ConvertTo-Json
$response = Invoke-WebRequest http://localhost:5001/api/login -Method POST -ContentType 'application/json' -Body $loginBody -ErrorAction SilentlyContinue
Write-Host "Status: $($response.StatusCode)"
Write-Host "Body: $($response.Content)"
