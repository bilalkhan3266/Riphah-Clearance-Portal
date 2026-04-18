#!/usr/bin/env pwsh

$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YjFhYjU4YzA1ODdjMzk1YzhmZjEwYyIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTcwOTkxODk0MCwiZXhwIjoxNzA5OTQwNTQwfQ.M9LRW3d5tKQS1XVrMhP6Z6S4P9nKL8vQ3cJ2wR5zF8M'
}

$body = @{
    department = 'Library'
    message = 'Test message after index fix'
} | ConvertTo-Json

Write-Host "[POST /admin/messages/send-to-department]"
Write-Host "Department: Library"
Write-Host "Message: Test message after index fix"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/admin/messages/send-to-department' -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "[SUCCESS] E11000 Error Fixed!"
    Write-Host ""
    $response | ConvertTo-Json
} catch {
    Write-Host "[ERROR] Error occurred:"
    Write-Host "Exception: $($_.Exception.GetType().Name)"
    Write-Host "Message: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorResponse = $reader.ReadToEnd()
            Write-Host "Response Body:"
            Write-Host $errorResponse
        } catch {
            Write-Host "Could not read response: $($_.Exception.Message)"
        }
    }
}
