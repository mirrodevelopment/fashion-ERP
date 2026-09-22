$css = Get-Content 'front end/DesignStudio/design-studio.css' -Raw
$openCount = ($css.ToCharArray() | Where-Object { $_ -eq '{' }).Count
$closeCount = ($css.ToCharArray() | Where-Object { $_ -eq '}' }).Count
Write-Host "Open braces: $openCount, Close braces: $closeCount"

$html = Get-Content 'front end/DesignStudio/design-studio.html' -Raw
Write-Host "HTML length: $($html.Length)"

# Check duplicate IDs in HTML
$matches = [regex]::Matches($html, 'id="([^"]+)"')
$ids = @{}
$duplicates = @()
foreach ($m in $matches) {
    $id = $m.Groups[1].Value
    if ($ids.ContainsKey($id)) {
        $duplicates += $id
    } else {
        $ids[$id] = 1
    }
}
if ($duplicates.Count -gt 0) {
    Write-Host "Duplicate IDs found: $($duplicates -join ', ')"
} else {
    Write-Host "All HTML element IDs are unique!"
}
