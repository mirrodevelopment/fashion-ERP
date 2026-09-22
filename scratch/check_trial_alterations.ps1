$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token

$trialsJson = curl.exe -s "http://localhost:8080/api/v1/trials" -H "Authorization: Bearer $token"
$trials = ($trialsJson | ConvertFrom-Json).content

foreach ($t in $trials) {
    if ($t.alterations -and $t.alterations.Count -gt 0) {
        Write-Host "Trial $($t.orderCode) has $($t.alterations.Count) alterations:"
        foreach ($a in $t.alterations) {
            Write-Host "  - $($a.description) | $($a.category) | Completed: $($a.completed)"
        }
    }
}
