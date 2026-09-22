$auth = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body '{"username":"admin","password":"Admin@123"}'
$headers = @{ Authorization = "Bearer $($auth.token)" }

# Get a customer
$custs = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/customers?page=0&size=1' -Headers $headers
$customer = $custs.content[0]
Write-Host "Using customer: $($customer.name) (mobile: $($customer.phone))"

$body = @{
    customerMobile = $customer.phone
    customerName = $customer.name
    garmentType = "Blouse"
    garmentDesc = "Test Bridal Blouse Workflow"
    totalAmount = 15000
    advancePaid = 5000
} | ConvertTo-Json

$order = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/orders' -Method Post -Headers $headers -ContentType 'application/json' -Body $body
Write-Host "Created Order Code: $($order.orderCode)"
Write-Host "Current Stage: $($order.currentStage)"
Write-Host "Status: $($order.status)"
