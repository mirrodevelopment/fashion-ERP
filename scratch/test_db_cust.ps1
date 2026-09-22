$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token

$search = curl.exe -s "http://localhost:8080/api/v1/customers?search=Kavya" -H "Authorization: Bearer $token" | ConvertFrom-Json
Write-Host "Search Kavya in customers:"
$search | ConvertTo-Json

$allCust = curl.exe -s "http://localhost:8080/api/v1/customers?size=100" -H "Authorization: Bearer $token" | ConvertFrom-Json
Write-Host "Total customers in DB: $($allCust.totalElements)"
$allCust.content | Select-Object name, phone, email, city, tier, totalSpend | Format-Table



