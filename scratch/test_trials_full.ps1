# Test script for Trial & Alterations enhancements with Authentication
$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d "{\`"username\`":\`"admin\`",\`"password\`":\`"Admin@123\`"}"
$tokenObj = $loginJson | ConvertFrom-Json
$token = $tokenObj.token

if (-not $token) {
    Write-Host "Failed to obtain auth token. Login response: $loginJson" -ForegroundColor Red
    exit 1
}

Write-Host "Auth Token acquired: $($token.Substring(0, 20))..." -ForegroundColor Green
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}
$baseUrl = "http://localhost:8080/api/v1/trials"

Write-Host "`n=== 1. Testing GET /api/v1/trials/orders-for-trial ===" -ForegroundColor Cyan
$ordersResp = Invoke-RestMethod -Uri "$baseUrl/orders-for-trial" -Method Get -Headers $headers
Write-Host "Found $($ordersResp.Count) orders available for trial selection." -ForegroundColor Green

if ($ordersResp.Count -gt 0) {
    $firstOrder = $ordersResp[0]
    Write-Host "Selected Order: ID=$($firstOrder.id) Code=$($firstOrder.orderCode) Customer=$($firstOrder.customerName) Stage=$($firstOrder.currentStage) PriorTrials=$($firstOrder.trialCount)" -ForegroundColor Yellow

    Write-Host "`n=== 2. Testing POST /api/v1/trials/from-order/$($firstOrder.id) ===" -ForegroundColor Cyan
    $trialResp = Invoke-RestMethod -Uri "$baseUrl/from-order/$($firstOrder.id)" -Method Post -Headers $headers
    $trialId = $trialResp.id
    Write-Host "Trial loaded: ID=$trialId Code=$($trialResp.trialCode) Attempt=$($trialResp.trialAttempt) Stage=$($trialResp.stage)" -ForegroundColor Green

    Write-Host "`n=== 3. Testing PUT /api/v1/trials/$trialId with Consumer Feedback & Checkpoints ===" -ForegroundColor Cyan
    $checkpointsJson = '{"Neck":"PERFECT","Chest / Bust":"PERFECT","Waist":"PERFECT","Hip":"PERFECT","Shoulders":"PERFECT","Armhole":"TIGHT","Sleeves":"PERFECT","Total Length":"PERFECT"}'
    $updateBody = @{
        orderCode = $trialResp.orderCode
        customerMobile = $trialResp.customerMobile
        customerName = $trialResp.customerName
        garmentType = $trialResp.garmentType
        status = "IN_ALTERATION"
        fitStatus = "MINOR"
        trialAttempt = 1
        alterationCount = 1
        customerFeedback = "Client loved the fabric flow. Wants armhole relaxed by 0.5 inch."
        customerRating = 5
        fitPreference = "Comfort / Regular Fit"
        fitCheckpoints = $checkpointsJson
        alterations = @(
            @{
                description = "Ease underarm armhole seam by 0.5 inch"
                category = "Armhole"
                assignedTailor = "Master Tailor"
                priority = "High"
                completed = $false
            }
        )
    } | ConvertTo-Json -Depth 5

    $savedTrial = Invoke-RestMethod -Uri "$baseUrl/$trialId" -Method Put -Headers $headers -Body $updateBody
    Write-Host "Saved Trial:" -ForegroundColor Green
    Write-Host "  - Attempt Count: $($savedTrial.trialAttempt)"
    Write-Host "  - Alteration Count: $($savedTrial.alterationCount)"
    Write-Host "  - Customer Rating: $($savedTrial.customerRating) Stars"
    Write-Host "  - Fit Preference: $($savedTrial.fitPreference)"
    Write-Host "  - Customer Feedback: $($savedTrial.customerFeedback)"
    Write-Host "  - Fit Checkpoints: $($savedTrial.fitCheckpoints)"
    Write-Host "  - Alterations List: $($savedTrial.alterations.Count) items"

    Write-Host "`n=== 4. Testing POST /api/v1/trials/$trialId/schedule-retrial ===" -ForegroundColor Cyan
    $retrialBody = @{
        trialDate = "2026-09-22"
        trialTime = "11:30 AM"
        designerName = "Anita Dongre"
        notes = "Follow-up trial after armhole relaxation."
    } | ConvertTo-Json

    $retrialResp = Invoke-RestMethod -Uri "$baseUrl/$trialId/schedule-retrial" -Method Post -Headers $headers -Body $retrialBody
    Write-Host "Re-trial Scheduled successfully!" -ForegroundColor Green
    Write-Host "  - New Attempt Count: $($retrialResp.trialAttempt) (Stage: $($retrialResp.stage))"
    Write-Host "  - Status: $($retrialResp.status)"

    Write-Host "`n=== 5. Testing POST /api/v1/trials/$trialId/complete-and-advance (Advance to QC) ===" -ForegroundColor Cyan
    $advanceResp = Invoke-RestMethod -Uri "$baseUrl/$trialId/complete-and-advance" -Method Post -Headers $headers
    Write-Host "Trial Advanced to QC!" -ForegroundColor Green
    Write-Host "  - Status: $($advanceResp.status)"
    Write-Host "  - Fit Status: $($advanceResp.fitStatus)"

    Write-Host "`n=== 6. Testing GET /api/v1/trials/kpis ===" -ForegroundColor Cyan
    $kpiResp = Invoke-RestMethod -Uri "$baseUrl/kpis" -Method Get -Headers $headers
    Write-Host "KPIs: Total=$($kpiResp.total), Completed=$($kpiResp.completed), Retrials=$($kpiResp.retrial), Perfect=$($kpiResp.perfect), Minor=$($kpiResp.minor)" -ForegroundColor Green
} else {
    Write-Host "No orders in system to select." -ForegroundColor Yellow
}
