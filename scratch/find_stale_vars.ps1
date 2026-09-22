$base = 'D:\fashion ERP\FASHION-ERP\front end'
$files = Get-ChildItem -Path $base -Recurse -Filter "*.css" | Where-Object { $_.FullName -notlike "*theme.css*" }

Write-Host "=== STALE LOCAL CSS VARIABLES (var(--xxx) not defined in theme.css) ===" -ForegroundColor Cyan
$themeVars = (Get-Content "$base\fragments\theme\theme.css" -Raw) -split "`n" |
    Where-Object { $_ -match '^\s*--([\w-]+)\s*:' } |
    ForEach-Object { [regex]::Match($_, '--([\w-]+)\s*:').Groups[1].Value }
$themeVarSet = [System.Collections.Generic.HashSet[string]]::new()
$themeVars | ForEach-Object { [void]$themeVarSet.Add($_) }

$staleVarsByFile = @{}
foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    $usedVars = [regex]::Matches($c, 'var\(--([\w-]+)\)') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
    $stale = $usedVars | Where-Object { -not $themeVarSet.Contains($_) }
    if ($stale.Count -gt 0) {
        $short = $f.FullName.Replace($base + '\', '')
        $staleVarsByFile[$short] = $stale
    }
}

foreach ($file in $staleVarsByFile.Keys | Sort-Object) {
    Write-Host "`n  [$file]" -ForegroundColor Yellow
    $staleVarsByFile[$file] | ForEach-Object { Write-Host "    --$_" -ForegroundColor Red }
}
Write-Host "`n=== DONE ===" -ForegroundColor Green
