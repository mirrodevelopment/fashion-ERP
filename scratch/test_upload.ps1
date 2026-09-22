$login = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method Post -ContentType 'application/json' -Body '{"username":"admin","password":"Admin@123"}'
$headers = @{ Authorization = 'Bearer ' + $login.token }
$stages = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/production/stage-definitions' -Method Get -Headers $headers
$lining = $stages | Where-Object { $_.stageKey -eq 'LINING' }
$id = $lining.id
Write-Output "Lining stage ID: $id"

# Test upload using curl
$token = $login.token
$filePath = "d:\fashion ERP\FASHION-ERP\front end\assets\stages\Lining_2084.jpg"
$url = "http://localhost:8080/api/v1/production/stage-definitions/$id/image"

$res = & curl.exe -s -X POST $url -H "Authorization: Bearer $token" -F "file=@$filePath;type=image/jpeg"
Write-Output "Response:"
Write-Output $res
