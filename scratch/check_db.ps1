$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token

$endpoints = @("employees", "customers", "orders", "enquiries", "designs", "inventory", "payments")
foreach ($ep in $endpoints) {
    $res = curl.exe -s "http://localhost:8080/api/v1/$ep" -H "Authorization: Bearer $token" | ConvertFrom-Json
    Write-Host "$ep count: $($res.totalElements)"
}
