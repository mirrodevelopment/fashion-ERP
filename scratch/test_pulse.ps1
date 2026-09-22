$auth = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body '{"username":"admin","password":"Admin@123"}'
$headers = @{ "Authorization" = "Bearer $($auth.token)" }
$stages = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/production/stage-definitions' -Headers $headers
$stages | Format-Table sortOrder, stageKey, displayName, imageUrl -AutoSize
