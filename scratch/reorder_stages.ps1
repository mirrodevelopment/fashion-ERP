$auth = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body '{"username":"admin","password":"Admin@123"}'
$headers = @{ "Authorization" = "Bearer $($auth.token)" }
$stages = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/production/stage-definitions' -Headers $headers

$desiredKeys = @("DESIGNING", "CUTTING", "STITCHING", "HAND_WORK", "LINING", "TRIAL", "QC", "READY")
$orderedIds = @()
foreach ($k in $desiredKeys) {
    $found = $stages | Where-Object { $_.stageKey -eq $k }
    if ($found) { $orderedIds += $found.id }
}

$body = @{ ids = $orderedIds } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/production/stage-definitions/reorder' -Method Patch -Headers $headers -ContentType 'application/json' -Body $body

$kpis = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/dashboard/kpis' -Headers $headers
$kpis.productionPulse | Format-Table stage, name, count, color, imageUrl -AutoSize
