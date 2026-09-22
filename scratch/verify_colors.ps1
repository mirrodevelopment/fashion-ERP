$pattern = '#(a3e635|b4f039|142204|4ade80|f87171|ef4444|38bdf8|c084fc|f472b6|fbbf24|2dd4bf|fb923c|22c55e|65a30d|f97316|ec4899|a855f7|7c3aed|6d28d9|0284c7|14b8a6|fb7185)'
$results = Get-ChildItem -Path 'D:\fashion ERP\FASHION-ERP\front end' -Recurse -Filter '*.css' |
  Where-Object { $_.FullName -notlike '*theme.css*' } |
  Select-String -Pattern $pattern -CaseSensitive:$false

if ($results.Count -eq 0) {
    Write-Host "PERFECT: 0 raw brand hex colors remain in module CSS files!" -ForegroundColor Green
} else {
    Write-Host "REMAINING ($($results.Count) hits):" -ForegroundColor Yellow
    $results | ForEach-Object {
        $short = $_.Filename
        Write-Host "  $short : L$($_.LineNumber)  $($_.Line.Trim())" -ForegroundColor Yellow
    }
}
Write-Host "Scan complete"
