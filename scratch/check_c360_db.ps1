$ErrorActionPreference = 'Stop'
$loginBody = @{ username = 'admin'; password = 'Admin@123' } | ConvertTo-Json
$token = (Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method POST -Body $loginBody -ContentType 'application/json').token
$headers = @{ 'Authorization' = "Bearer $token" }

$custsRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/customers' -Headers $headers
$custsList = if ($custsRes.content) { $custsRes.content } else { $custsRes }
Write-Host "Total customers in DB: $($custsList.Count)"
$custsList | Select-Object -First 5 | Format-Table id, name, mobileNumber, tier, city, totalSpent

$bhuvi = $custsList | Where-Object { $_.name -like "*Bhuvaneshwari*" -or $_.name -like "*Kavya*" }
Write-Host "Matched customer(s):"
$bhuvi | Format-Table id, name, mobileNumber, tier, city, totalSpent, preferredNeck, preferredSleeve, preferredOccasions, deliveryPreference

$ordersRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/orders' -Headers $headers
$allOrders = if ($ordersRes.content) { $ordersRes.content } else { $ordersRes }
Write-Host "Total orders in DB: $($allOrders.Count)"
$bhuviMobile = $bhuvi[0].mobileNumber
$bhuviOrders = $allOrders | Where-Object { $_.customerMobile -eq $bhuviMobile -or $_.customerName -eq $bhuvi[0].name }
Write-Host "Orders for $($bhuvi[0].name): $($bhuviOrders.Count)"
$bhuviOrders | Format-Table id, orderCode, garmentType, totalAmount, status, currentStage
