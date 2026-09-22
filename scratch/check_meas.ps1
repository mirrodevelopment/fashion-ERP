$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token

Write-Host "--- Customer Measurements ---"
$meas = curl.exe -s "http://localhost:8080/api/v1/customers/%2B91%2098402%2023456/measurements" -H "Authorization: Bearer $token"
Write-Host $meas

Write-Host "`n--- Customer Body Measurements ---"
$bodyMeas = curl.exe -s "http://localhost:8080/api/v1/customers/%2B91%2098402%2023456/body-measurements" -H "Authorization: Bearer $token"
Write-Host $bodyMeas
