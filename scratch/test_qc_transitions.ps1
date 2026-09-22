$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$token = ($loginJson | ConvertFrom-Json).token

$testOrderId = "ff7296fc-cb5e-4dbf-a107-42a91c9b30c2"

Write-Host "--- 1. Testing POST /api/v1/qc/rework ---"
$reworkRes1 = curl.exe -s -X POST "http://localhost:8080/api/v1/qc/rework?orderId=$testOrderId&targetStage=STITCHING&notes=Check+sleeve+hem" -H "Authorization: Bearer $token"
Write-Host "Rework 1 Response: $reworkRes1"

Write-Host "`n--- 2. Testing second rework increment ---"
$reworkRes2 = curl.exe -s -X POST "http://localhost:8080/api/v1/qc/rework?orderId=$testOrderId&targetStage=CUTTING&notes=Recut+cuff" -H "Authorization: Bearer $token"
Write-Host "Rework 2 Response: $reworkRes2"

Write-Host "`n--- 3. Verifying Order DTO reflection ---"
$orderDto = curl.exe -s "http://localhost:8080/api/v1/orders/$testOrderId" -H "Authorization: Bearer $token" | ConvertFrom-Json
Write-Host "Current Stage: $($orderDto.currentStage), qcReworkCount: $($orderDto.qcReworkCount)"

Write-Host "`n--- 4. Testing POST /api/v1/qc/pass (Dynamic next stage) ---"
$passRes = curl.exe -s -X POST "http://localhost:8080/api/v1/qc/pass?orderId=$testOrderId&notes=Perfect+finishing" -H "Authorization: Bearer $token"
Write-Host "Pass Response: $passRes"

Write-Host "`n--- 5. Resetting order back to original CUTTING stage ---"
curl.exe -s -X POST "http://localhost:8080/api/v1/production/transition?orderId=$testOrderId&targetStage=CUTTING" -H "Authorization: Bearer $token" | Out-Null
Write-Host "Reset complete."
