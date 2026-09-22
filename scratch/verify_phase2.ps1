$base = 'D:\fashion ERP\FASHION-ERP\front end'
$files = Get-ChildItem -Path $base -Recurse -Filter '*.css' | Where-Object { $_.FullName -notlike '*theme.css*' }

Write-Host '=== CHECK 1: Zero Local :root Blocks ===' -ForegroundColor Cyan
$rootFiles = $files | Where-Object {
    (Get-Content $_.FullName -Raw) -match '(?m)^\s*:root\s*\{'
}
if ($rootFiles.Count -eq 0) {
    Write-Host '  PASS: No local :root blocks found in any module' -ForegroundColor Green
} else {
    Write-Host "  FAIL: Found :root in $($rootFiles.Count) file(s):" -ForegroundColor Red
    $rootFiles | ForEach-Object { Write-Host "    $($_.FullName.Replace($base+'\',''))" -ForegroundColor Red }
}

Write-Host ''
Write-Host '=== CHECK 2: Stale Variables (not defined in theme.css) ===' -ForegroundColor Cyan
$themeContent = Get-Content "$base\fragments\theme\theme.css" -Raw
$themeVars = [regex]::Matches($themeContent, '(?m)^\s*--([\w-]+)\s*:') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
$themeSet = [System.Collections.Generic.HashSet[string]]::new()
$themeVars | ForEach-Object { [void]$themeSet.Add($_) }
Write-Host "  Theme defines: $($themeSet.Count) variables" -ForegroundColor Gray

$staleCount = 0
$staleFiles = 0
foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    $used = [regex]::Matches($c, 'var\(--([\w-]+)\)') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
    $stale = $used | Where-Object { -not $themeSet.Contains($_) }
    if ($stale.Count -gt 0) {
        $staleCount += $stale.Count
        $staleFiles++
        $shortName = $f.FullName.Replace($base + '\', '')
        Write-Host "  WARN [$shortName] stale: $($stale -join ', ')" -ForegroundColor Yellow
    }
}
if ($staleCount -eq 0) {
    Write-Host '  PASS: Zero stale CSS variables across all modules!' -ForegroundColor Green
} else {
    Write-Host "  RESULT: $staleCount stale vars in $staleFiles files" -ForegroundColor Yellow
}

Write-Host ''
Write-Host '=== CHECK 3: Remaining Bare Hex Colors ===' -ForegroundColor Cyan
$hexPattern = '#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b'
$hexFiles = 0
$totalHex = 0
foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    $m = [regex]::Matches($c, $hexPattern)
    if ($m.Count -gt 0) {
        $hexFiles++
        $totalHex += $m.Count
        $shortName = $f.FullName.Replace($base + '\', '')
        Write-Host "  $($m.Count) hex values in $shortName" -ForegroundColor DarkYellow
    }
}
if ($hexFiles -eq 0) {
    Write-Host '  PASS: Zero bare hex colors in any module!' -ForegroundColor Green
} else {
    Write-Host "  RESULT: $totalHex total hex values across $hexFiles files" -ForegroundColor Yellow
}

Write-Host ''
Write-Host '=== CHECK 4: Wrong-Color Primary CTA Buttons ===' -ForegroundColor Cyan
$darkBgPattern = 'rgba\(\s*(?:1[0-9]|2[0-9]|3[0-9])\s*,\s*(?:1[0-9]|2[0-9])\s*,.*?0\.9'
foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    $btnPrimaryBlocks = [regex]::Matches($c, '(?s)\.btn-primary[^{]*\{[^}]*' + $darkBgPattern + '[^}]*\}')
    if ($btnPrimaryBlocks.Count -gt 0) {
        $shortName = $f.FullName.Replace($base + '\', '')
        Write-Host "  WARN: Dark bg on .btn-primary* in $shortName" -ForegroundColor Red
    }
}
Write-Host '  CHECK 4 Done' -ForegroundColor Gray

Write-Host ''
Write-Host '=== VERIFICATION COMPLETE ===' -ForegroundColor Cyan
