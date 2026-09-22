$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token

Write-Host "Token obtained: $($token.Substring(0, 15))..."

Write-Host "`nTesting GET /production/qc/next-stage:"
$nextStage = curl.exe -s "http://localhost:8080/api/v1/production/qc/next-stage" -H "Authorization: Bearer $token"
Write-Host $nextStage

Write-Host "`nTesting GET /orders (first order qcReworkCount):"
$orders = curl.exe -s "http://localhost:8080/api/v1/orders?page=0&size=2" -H "Authorization: Bearer $token"
Write-Host $orders
