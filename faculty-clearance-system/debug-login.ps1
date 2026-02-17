$body = @{email='faculty1@test.edu'; password='Test@123'} | ConvertTo-Json
try {
  $r = Invoke-WebRequest 'http://localhost:5001/api/login' -Method POST -ContentType 'application/json' -Body $body
  Write-Host "Status: $($r.StatusCode)"
  Write-Host "Response: $($r.Content)"
} catch {
  Write-Host "Status: $($_.Exception.Response.StatusCode)"
  Write-Host "Message: $($_.Exception.Message)"
  if ($_.Exception.Response -ne $null) {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    Write-Host "Error Response: $content"
  }
}
