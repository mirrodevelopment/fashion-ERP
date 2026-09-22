$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token

$trialsJson = curl.exe -s "http://localhost:8080/api/v1/trials" -H "Authorization: Bearer $token"
$trials = ($trialsJson | ConvertFrom-Json).content
Write-Host ($trials[0] | ConvertTo-Json -Depth 5)
