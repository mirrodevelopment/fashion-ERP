$login = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d '{\"username\":\"admin\",\"password\":\"Admin@123\"}'
$token = ($login | ConvertFrom-Json).token
$resp = curl.exe -s "http://localhost:8080/api/v1/trials" -H "Authorization: Bearer $token" | ConvertFrom-Json
Write-Host "Total trials: $($resp.totalElements)"
foreach ($x in $resp.content) {
    Write-Host "$($x.trialCode) | $($x.orderCode) | $($x.customerName) | $($x.stage) | $($x.status)"
}
