$auth = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body '{"username":"admin","password":"Admin@123"}'
$headers = @{ Authorization = "Bearer $($auth.token)" }

$order = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/orders/ORD-2026-0060" -Headers $headers

# Transition back to ORDER_TAKEN
$t = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/production/transition?orderId=$($order.id)&targetStage=ORDER_TAKEN" -Method Post -Headers $headers
$t | ConvertTo-Json -Depth 3

# Re-fetch the order to see updated state
$orderUpdated = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/orders/ORD-2026-0060" -Headers $headers
Write-Host "Updated Order currentStage: $($orderUpdated.currentStage), status: $($orderUpdated.status)"
