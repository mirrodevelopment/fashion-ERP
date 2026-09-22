$auth = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body '{"username":"admin","password":"Admin@123"}'
$headers = @{ Authorization = "Bearer $($auth.token)" }
$kanban = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/production/kanban-view' -Headers $headers
$kanban | Select-Object -First 5 | Format-List
Write-Host "Total kanban orders: $($kanban.Count)"

$stagesDistribution = $kanban | Group-Object currentStage | Select-Object Name, Count
Write-Host "Stage Distribution:"
$stagesDistribution | Format-Table -AutoSize
