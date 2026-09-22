$dir = "d:\fashion ERP\FASHION-ERP\front end"
$cssFiles = Get-ChildItem -Path $dir -Recurse -Filter "*.css"

Write-Host "=== STATUS CLASSES & COLORS FOUND ACROSS FILES ==="
foreach ($f in $cssFiles) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $statusMatches = [regex]::Matches($content, '(\.status-[a-zA-Z0-9_-]+|\.badge-[a-zA-Z0-9_-]+|\.tag-[a-zA-Z0-9_-]+)\s*\{([^}]+)\}')
    if ($statusMatches.Count -gt 0) {
        Write-Host "File: $($f.Name) ($($statusMatches.Count) matches)"
        foreach ($m in ($statusMatches | Select-Object -First 3)) {
            $sel = $m.Groups[1].Value
            $body = $m.Groups[2].Value.Trim() -replace '\s+', ' '
            if ($body.Length -gt 80) { $body = $body.Substring(0, 80) + "..." }
            Write-Host "   $sel => $body"
        }
    }
}
