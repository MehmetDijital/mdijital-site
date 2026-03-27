$email = "mert@pohjalab.fi"
$body = @{
    email = $email
    locale = "tr"
} | ConvertTo-Json

Write-Host "Testing email send API for: $email"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/verify-email/send" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "✅ Success!"
    Write-Host "Message: $($response.message)"
    
    if ($response.verificationCode) {
        Write-Host ""
        Write-Host "🔐 VERIFICATION CODE: $($response.verificationCode)"
    } else {
        Write-Host ""
        Write-Host "📧 Email sent! Check inbox: $email"
        Write-Host "   If not received, check Docker logs: docker logs mdijital-app --tail=50"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorData = $reader.ReadToEnd()
        Write-Host "Error Details: $errorData"
    }
}
