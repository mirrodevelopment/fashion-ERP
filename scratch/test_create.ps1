$l = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body '{"username":"admin","password":"Admin@123"}' -ContentType "application/json"
$token = $l.token

$headers = @{
    "Authorization" = "Bearer $token"
}

$testCust = @{
    mobileNumber = "+919884011223"
    name = "Test Client"
    preferredNeck = "Boat Neck"
    preferredSleeve = "3/4 Sleeve"
} | ConvertTo-Json

try {
    # Using WebRequest with MaximumRedirection 0 to see raw response
    $req = [System.Net.HttpWebRequest]::Create("http://localhost:8080/api/v1/customers")
    $req.Method = "POST"
    $req.Headers.Add("Authorization", "Bearer $token")
    $req.ContentType = "application/json"
    $req.AllowAutoRedirect = $false
    
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($testCust)
    $req.ContentLength = $bytes.Length
    $stream = $req.GetRequestStream()
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
    
    $resp = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $body = $reader.ReadToEnd()
    Write-Host "Status Code: " ([int]$resp.StatusCode)
    Write-Host "Location Header: " $resp.Headers["Location"]
    Write-Host "Body: " $body
} catch [System.Net.WebException] {
    $we = $_.Exception
    Write-Host "WebException Status: " $we.Status
    if ($we.Response) {
        Write-Host "HTTP Status: " ([int]$we.Response.StatusCode)
        $reader = New-Object System.IO.StreamReader($we.Response.GetResponseStream())
        Write-Host "Response Body: " $reader.ReadToEnd()
    }
}
