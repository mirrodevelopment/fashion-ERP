$auth = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body '{"username":"admin","password":"Admin@123"}'
$headers = @{ Authorization = "Bearer $($auth.token)" }
try {
    $order = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/orders/ORD-2026-0060' -Headers $headers
    if ($order -and $order.id) {
        Invoke-RestMethod -Uri "http://localhost:8080/api/v1/orders/$($order.id)" -Method Delete -Headers $headers
        Write-Host "Successfully deleted test order ORD-2026-0060"
    }
} catch {
    Write-Host "No test order found or already deleted."
}
