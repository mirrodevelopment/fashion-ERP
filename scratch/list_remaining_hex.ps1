$base = 'D:\fashion ERP\FASHION-ERP\front end'
$hexPattern = '#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b'
$files = Get-ChildItem -Path $base -Recurse -Filter '*.css' | Where-Object { $_.FullName -notlike '*theme.css*' }
$unique = @{}
foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    [regex]::Matches($c, $hexPattern) | ForEach-Object { $unique[$_.Value.ToLower()] = 1 }
}
Write-Host "All unique hex values remaining across ALL module files:"
$unique.Keys | Sort-Object | ForEach-Object { Write-Host "  $_" }
Write-Host "Total unique: $($unique.Count)"
