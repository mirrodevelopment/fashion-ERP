$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token

Write-Host "Checking all endpoints:"
$endpoints = @(
    "customers",
    "orders",
    "employees",
    "appointments",
    "enquiries",
    "designs",
    "inventory",
    "payments",
    "trials",
    "suppliers",
    "production/stage-definitions"
)

foreach ($ep in $endpoints) {
    try {
        $raw = curl.exe -s "http://localhost:8080/api/v1/$ep" -H "Authorization: Bearer $token"
        $json = $raw | ConvertFrom-Json
        $count = if ($null -ne $json.totalElements) { $json.totalElements } elseif ($json -is [Array]) { $json.Count } else { "N/A" }
        Write-Host "${ep} -> count = ${count}"
    } catch {
        Write-Host "${ep} -> ERROR"
    }
}
