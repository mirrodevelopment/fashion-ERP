$dir = "d:\fashion ERP\FASHION-ERP\front end"
$cssFiles = Get-ChildItem -Path $dir -Recurse -Filter "*.css"
Write-Host "Total CSS files found: $($cssFiles.Count)"
Write-Host "-------------------------------------------------------------"

$results = @()
foreach ($f in $cssFiles) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $hasRoot = $content -match ':root\s*\{([^}]+)\}'
    $varCount = 0
    if ($hasRoot) {
        $varCount = ([regex]::Matches($matches[1], '--[a-zA-Z0-9_-]+:')).Count
    }
    $cardMatches = ([regex]::Matches($content, '\.([a-zA-Z0-9_-]*card[a-zA-Z0-9_-]*)')).Count
    $badgeMatches = ([regex]::Matches($content, '\.([a-zA-Z0-9_-]*(badge|status|tag)[a-zA-Z0-9_-]*)')).Count
    $glassMatches = ([regex]::Matches($content, 'backdrop-filter')).Count
    $limeMatches = ([regex]::Matches($content, '(#a3e635|#B8FF2C|#b4f039)', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
    $relPath = $f.FullName.Substring($dir.Length + 1)
    
    $results += [PSCustomObject]@{
        File = $relPath
        RootVars = $varCount
        Cards = $cardMatches
        Badges = $badgeMatches
        Glass = $glassMatches
        LimeOccurrences = $limeMatches
    }
}

$results | Format-Table -AutoSize
