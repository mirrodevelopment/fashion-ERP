$ErrorActionPreference = 'Stop'

Write-Host "=== 1. Authenticating as admin ===" -ForegroundColor Cyan
$loginBody = @{
    username = "admin"
    password = "Admin@123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginRes.token
Write-Host "Logged in successfully! Token received." -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

Write-Host "`n=== 2. Testing Customer Registration with 4 Preference Fields ===" -ForegroundColor Cyan
$testMobile = "+91 98840" + (Get-Random -Minimum 10000 -Maximum 99999)
$newCustBody = @{
    mobileNumber       = $testMobile
    name               = "Lakshmi Narayanan"
    firstName          = "Lakshmi"
    lastName           = "Narayanan"
    salutation         = "Ms."
    gender             = "Female"
    email              = "lakshmi.narayanan@example.com"
    tier               = "VIP_PLATINUM"
    location           = "T. Nagar, Chennai"
    city               = "Chennai"
    state              = "Tamil Nadu"
    favoriteGarment    = "Kanjeevaram Silk Saree"
    fitPreference      = "Structured Corseted Fit"
    fabricAllergies    = "Pure silk & cotton only"
    preferredNeck      = "Boat Neck"
    preferredSleeve    = "3/4 Sleeve"
    preferredOccasions = "Weddings, Classical Dance Recitals"
    deliveryPreference = "Evening Atelier Delivery"
} | ConvertTo-Json

try {
    $createRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/customers" -Method POST -Headers $headers -Body $newCustBody -ContentType "application/json" -MaximumRedirection 0
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Red
    }
    exit 1
}
Write-Host "Created Customer: $($createRes.name) ($($createRes.mobileNumber))" -ForegroundColor Green
Write-Host "  preferredNeck      : $($createRes.preferredNeck)" -ForegroundColor Yellow
Write-Host "  preferredSleeve    : $($createRes.preferredSleeve)" -ForegroundColor Yellow
Write-Host "  preferredOccasions : $($createRes.preferredOccasions)" -ForegroundColor Yellow
Write-Host "  deliveryPreference : $($createRes.deliveryPreference)" -ForegroundColor Yellow

if ($createRes.preferredNeck -eq "Boat Neck" -and 
    $createRes.preferredSleeve -eq "3/4 Sleeve" -and 
    $createRes.preferredOccasions -eq "Weddings, Classical Dance Recitals" -and
    $createRes.deliveryPreference -eq "Evening Atelier Delivery") {
    Write-Host "  PASS: All 4 preference columns returned on creation!" -ForegroundColor Green
} else {
    Write-Host "  FAIL: Preference columns mismatch on creation!" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== 3. Testing Customer 360 Fetch (GET /customers/{mobile}) ===" -ForegroundColor Cyan
$encodedMobile = [System.Uri]::EscapeDataString($testMobile)
$getRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/customers/$encodedMobile" -Method GET -Headers $headers
if ($getRes.preferredNeck -eq "Boat Neck") {
    Write-Host "  PASS: GET returned preferredNeck: $($getRes.preferredNeck)" -ForegroundColor Green
} else {
    Write-Host "  FAIL: GET did not return correct preferredNeck" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== 4. Testing Customer 360 Update Preferences (PUT /customers/{mobile}) ===" -ForegroundColor Cyan
$updateBody = @{
    preferredNeck      = "Deep U-Back"
    preferredSleeve    = "Elbow Length"
    preferredOccasions = "Festivals, Temple Visits"
    deliveryPreference = "Standard Boutique Pickup"
} | ConvertTo-Json

$updateRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/customers/$encodedMobile" -Method PUT -Headers $headers -Body $updateBody
Write-Host "Updated preferences:" -ForegroundColor Green
Write-Host "  preferredNeck      : $($updateRes.preferredNeck)" -ForegroundColor Yellow
Write-Host "  preferredSleeve    : $($updateRes.preferredSleeve)" -ForegroundColor Yellow
Write-Host "  preferredOccasions : $($updateRes.preferredOccasions)" -ForegroundColor Yellow
Write-Host "  deliveryPreference : $($updateRes.deliveryPreference)" -ForegroundColor Yellow

if ($updateRes.preferredNeck -eq "Deep U-Back" -and $updateRes.preferredSleeve -eq "Elbow Length") {
    Write-Host "  PASS: PUT update persisted successfully!" -ForegroundColor Green
} else {
    Write-Host "  FAIL: PUT update failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== 5. Testing Customer Notes API ===" -ForegroundColor Cyan
$noteBody = @{
    noteText    = "Client prefers heavy zari border on pallu with hand-embroidered maggam blouse."
    authorName  = "Boutique Admin"
    authorBadge = "BA"
    category    = "STYLING"
} | ConvertTo-Json

$noteRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/customers/$encodedMobile/notes" -Method POST -Headers $headers -Body $noteBody
Write-Host "Added Note ID: $($noteRes.id)" -ForegroundColor Green

$notesList = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/customers/$encodedMobile/notes" -Method GET -Headers $headers
Write-Host "Notes count: $($notesList.Count)" -ForegroundColor Green
if ($notesList.Count -ge 1) {
    Write-Host "  PASS: Customer notes API working perfectly!" -ForegroundColor Green
} else {
    Write-Host "  FAIL: Customer notes not returned" -ForegroundColor Red
    exit 1
}

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host "  ALL V16 PREFERENCE & NOTES TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
