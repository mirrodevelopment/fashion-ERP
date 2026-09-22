$login = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d '{\"username\":\"admin\",\"password\":\"Admin@123\"}'
$token = ($login | ConvertFrom-Json).token
$orders = curl.exe -s "http://localhost:8080/api/v1/orders?size=100" -H "Authorization: Bearer $token" | ConvertFrom-Json
Write-Host "Total orders: $($orders.totalElements)"
foreach ($o in $orders.content) {
    Write-Host "$($o.orderCode) | status: $($o.status) | currentStage: $($o.currentStage) | stage: $($o.stage)"
}
