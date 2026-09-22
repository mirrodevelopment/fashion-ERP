# Extract all color codes from all CSS files
$cssFiles = Get-ChildItem -Path "D:\fashion ERP\FASHION-ERP\front end" -Recurse -Filter "*.css"
$allColors = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[string]]]::new([System.StringComparer]::OrdinalIgnoreCase)
$fileColorMap = @{}

foreach ($file in $cssFiles) {
    $content = Get-Content $file.FullName -Raw
    $shortPath = $file.FullName.Replace("D:\fashion ERP\FASHION-ERP\front end\", "")
    
    # Find all hex colors
    $hexColors = [regex]::Matches($content, '#[0-9A-Fa-f]{3,8}\b') | ForEach-Object { $_.Value.ToUpper() } | Sort-Object -Unique
    
    $fileColorMap[$shortPath] = $hexColors

    foreach ($color in $hexColors) {
        if (-not $allColors.ContainsKey($color)) { $allColors[$color] = [System.Collections.Generic.List[string]]::new() }
        $allColors[$color].Add($shortPath)
    }
}

Write-Host "=== ALL UNIQUE HEX COLORS ACROSS ALL FILES ($($allColors.Count) unique) ===" -ForegroundColor Cyan
$allColors.Keys | Sort-Object | ForEach-Object {
    $files = $allColors[$_] -join " | "
    Write-Host "$_  ->  $files"
}

Write-Host "`n=== COLORS PER FILE ===" -ForegroundColor Yellow
foreach ($f in ($fileColorMap.Keys | Sort-Object)) {
    Write-Host "`n[$f]" -ForegroundColor Green
    $fileColorMap[$f] | ForEach-Object { Write-Host "  $_" }
}
