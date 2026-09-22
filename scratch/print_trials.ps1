$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token

$trialsJson = curl.exe -s "http://localhost:8080/api/v1/trials" -H "Authorization: Bearer $token"
$trials = ($trialsJson | ConvertFrom-Json).content

Write-Host "Total trials in DB: $($trials.Count)"
foreach ($t in $trials) {
    Write-Host "Trial ID: $($t.id) | Order: $($t.orderCode) | Customer: $($t.customerName) | Garment: $($t.garmentType) | Date: $($t.trialDate) | Status: $($t.status) | FitStatus: $($t.fitStatus)"
}
