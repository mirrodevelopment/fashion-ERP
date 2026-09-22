$auth = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body '{"username":"admin","password":"Admin@123"}'
$headers = @{ Authorization = "Bearer $($auth.token)" }

# Get all stages
$stages = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/production/stage-definitions' -Headers $headers
$handWork = $stages | Where-Object { $_.stageKey -eq 'HAND_WORK' }
Write-Host "Found Hand Work Stage: ID: $($handWork.id), Display: $($handWork.displayName)"

# Edit Hand Work display name to "Zari & Hand Work" and test updating
$updateBody = @{
    displayName = "Zari & Hand Work"
    description = "Intricate Maggam and Zardosi embroidery"
    deptLabel = "Embroidery & Zari Studio"
    colorClass = "dot-pink"
    requiredRole = "EMBROIDERER"
    sortOrder = $handWork.sortOrder
    active = $true
} | ConvertTo-Json

$updated = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/production/stage-definitions/$($handWork.id)" -Method Put -Headers $headers -ContentType 'application/json' -Body $updateBody
Write-Host "Successfully updated stage! New Display Name: $($updated.displayName), StageKey: $($updated.stageKey)"

# Revert back cleanly to "Hand Work"
$revertBody = @{
    displayName = "Hand Work"
    description = "Embroidery, aari, zardosi, and hand embellishment"
    deptLabel = "Embroidery & Maggam"
    colorClass = "dot-pink"
    requiredRole = "EMBROIDERER"
    sortOrder = $handWork.sortOrder
    active = $true
} | ConvertTo-Json

$reverted = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/production/stage-definitions/$($handWork.id)" -Method Put -Headers $headers -ContentType 'application/json' -Body $revertBody
Write-Host "Successfully reverted back! Display Name: $($reverted.displayName), StageKey: $($reverted.stageKey)"
