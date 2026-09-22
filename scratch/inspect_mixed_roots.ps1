$base = 'D:\fashion ERP\FASHION-ERP\front end'
$files = @(
    "WorkforceManagement\workforce.css",
    "delivery\delivery.css",
    "login\login.css",
    "DesignStudio\design-studio.css"
)

foreach ($rel in $files) {
    $path = Join-Path $base $rel
    $c = Get-Content $path -Raw
    $m = [regex]::Match($c, '(?s):root\s*\{([^}]*)\}')
    if ($m.Success) {
        Write-Host "`n=== $rel ===" -ForegroundColor Cyan
        Write-Host "Inner content:" -ForegroundColor Yellow
        $m.Groups[1].Value.Split("`n") | ForEach-Object { Write-Host "  $_" }
    } else {
        Write-Host "`n=== $rel === NO :root block found" -ForegroundColor DarkGray
    }
}
