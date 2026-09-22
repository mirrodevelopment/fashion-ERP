$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token

$custs = (curl.exe -s "http://localhost:8080/api/v1/customers" -H "Authorization: Bearer $token" | ConvertFrom-Json).content
foreach ($c in $custs | Select-Object -First 5) {
    Write-Host "Customer: $($c.name) | Mobile: $($c.mobileNumber)"
    $meas = curl.exe -s "http://localhost:8080/api/v1/customers/$([System.Uri]::EscapeDataString($c.mobileNumber))/body-measurements" -H "Authorization: Bearer $token"
    Write-Host "  Measurements: $meas"
}
