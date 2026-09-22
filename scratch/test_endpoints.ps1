$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token

$endpoints = @(
    "/api/v1/customers",
    "/api/v1/orders",
    "/api/v1/employees",
    "/api/v1/inventory",
    "/api/v1/payments",
    "/api/v1/appointments",
    "/api/v1/enquiries",
    "/api/v1/designs",
    "/api/v1/purchases",
    "/api/v1/suppliers",
    "/api/v1/production/stage-definitions"
)

foreach ($ep in $endpoints) {
    $res = curl.exe -s "http://localhost:8080$ep" -H "Authorization: Bearer $token"
    Write-Host "`n=== $ep ==="
    if ($res.Length -gt 250) {
        Write-Host ($res.Substring(0, 250) + "...")
    } else {
        Write-Host $res
    }
}
