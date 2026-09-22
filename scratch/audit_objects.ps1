$base = 'D:\fashion ERP\FASHION-ERP\front end'

Write-Host "=== BUTTON SELECTORS ACROSS ALL CSS ===" -ForegroundColor Cyan
$files = Get-ChildItem -Path $base -Recurse -Filter "*.css" | Where-Object { $_.FullName -notlike "*theme.css*" }
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $btnSelectors = [regex]::Matches($content, '(?m)^\.btn[-\w]*|^\.button[-\w]*|^button\b') | ForEach-Object { $_.Value } | Sort-Object -Unique
    if ($btnSelectors.Count -gt 0) {
        $short = $f.FullName.Replace($base + '\', '')
        Write-Host "`n  [$short]" -ForegroundColor Yellow
        $btnSelectors | ForEach-Object { Write-Host "    $_" }
    }
}

Write-Host "`n=== TABLE SELECTORS ===" -ForegroundColor Cyan
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $tblSelectors = [regex]::Matches($content, '(?m)^\.(table|data-table|tbl|grid)[-\w]*|^table\b|^th\b|^td\b') | ForEach-Object { $_.Value } | Sort-Object -Unique
    if ($tblSelectors.Count -gt 0) {
        $short = $f.FullName.Replace($base + '\', '')
        Write-Host "`n  [$short]" -ForegroundColor Yellow
        $tblSelectors | Select-Object -First 10 | ForEach-Object { Write-Host "    $_" }
    }
}

Write-Host "`n=== INPUT SELECTORS ===" -ForegroundColor Cyan
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $inpSelectors = [regex]::Matches($content, '(?m)^\.(input|form-input|search|filter)[-\w]*|^input\b|^select\b|^textarea\b') | ForEach-Object { $_.Value } | Sort-Object -Unique
    if ($inpSelectors.Count -gt 0) {
        $short = $f.FullName.Replace($base + '\', '')
        Write-Host "`n  [$short]" -ForegroundColor Yellow
        $inpSelectors | Select-Object -First 8 | ForEach-Object { Write-Host "    $_" }
    }
}

Write-Host "`n=== ORDERS/CUSTOMER BG & COLOR PATTERNS ===" -ForegroundColor Cyan
$targetFiles = @(
    "orders\view-order\view-order.css",
    "orders\new-order\new-order.css",
    "orders\order-overview\order-over.css",
    "customer\Customer360\customer360.css",
    "customer\new-customer\new-customer.css",
    "customer\customer-overview\customer-overview.css"
)
foreach ($rel in $targetFiles) {
    $path = Join-Path $base $rel
    if (Test-Path $path) {
        $c = Get-Content $path -Raw
        Write-Host "`n  [$rel]" -ForegroundColor Yellow
        $bgs = [regex]::Matches($c, 'background[^;]{0,100};') | ForEach-Object { $_.Value.Trim() } | Sort-Object -Unique | Select-Object -First 12
        foreach ($b in $bgs) { Write-Host "    $b" }
    }
}
