$html = [System.IO.File]::ReadAllText("$PSScriptRoot/../front end/trials-alterations/trials-alterations.html", [System.Text.Encoding]::UTF8)
Write-Host "Contains zari-bloom-back.jpg in HTML: $($html.Contains('zari-bloom-back.jpg'))"
Write-Host "Contains pink_silk.jpg in HTML: $($html.Contains('pink_silk.jpg'))"
Write-Host "Contains Tue, 08 Sep 2026 in HTML: $($html.Contains('Tue, 08 Sep 2026'))"

$hasScript = $html.Contains('trials-alterations.js?v=6')
Write-Host "Has script trials-alterations.js?v=6: $hasScript"
