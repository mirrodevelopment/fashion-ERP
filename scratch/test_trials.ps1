$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token
Write-Host "Token obtained: $($token.Substring(0, 20))..."

Write-Host "`n--- GET /api/v1/trials ---"
$trials = curl.exe -s "http://localhost:8080/api/v1/trials" -H "Authorization: Bearer $token"
Write-Host $trials

Write-Host "`n--- GET /api/v1/trials/kpis ---"
$kpis = curl.exe -s "http://localhost:8080/api/v1/trials/kpis" -H "Authorization: Bearer $token"
Write-Host $kpis
