# Health check script for M Dijital
# Usage: .\scripts\health-check.ps1

$response = Invoke-WebRequest -Uri http://localhost:3000/api/health -UseBasicParsing
$content = $response.Content | ConvertFrom-Json

Write-Host "=== M Dijital Health Check ===" -ForegroundColor Cyan
Write-Host "Status: $($content.status)" -ForegroundColor $(if ($content.status -eq 'healthy') { 'Green' } else { 'Red' })
Write-Host ""
Write-Host "Checks:" -ForegroundColor Yellow
foreach ($check in $content.checks.PSObject.Properties) {
    $color = if ($check.Value -eq 'healthy') { 'Green' } else { 'Red' }
    Write-Host "  - $($check.Name): $($check.Value)" -ForegroundColor $color
}
Write-Host ""
Write-Host "Timestamp: $($content.timestamp)" -ForegroundColor Gray

