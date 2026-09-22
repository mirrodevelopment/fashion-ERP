$base = 'D:\fashion ERP\FASHION-ERP\front end'

# Files that have stale local :root blocks to strip
# Each entry: relative path + whether to strip ALL :root or just specific var groups
$targets = @(
    "customer\Customer360\customer360.css",
    "customer\customer-overview\customer-overview.css",
    "customer\new-customer\new-customer.css",
    "orders\order-overview\order-over.css",
    "orders\view-order\view-order.css",
    "orders\new-order\new-order.css",
    "production\stages\stages.css",
    "WorkforceManagement\workforce.css",
    "Measurements\measurement360\measurement360.css",
    "Measurements\measurement-overview\measurement-overview.css",
    "delivery\delivery.css",
    "purchases\purchases.css",
    "trials-alterations\trials-alterations.css",
    "payments\payments.css",
    "fragments\nav.css",
    "login\login.css",
    "DesignStudio\design-studio.css"
)

$totalStripped = 0
$report = @()

foreach ($rel in $targets) {
    $path = Join-Path $base $rel
    if (-not (Test-Path $path)) {
        Write-Host "[SKIP] Not found: $rel" -ForegroundColor DarkYellow
        continue
    }

    $original = Get-Content $path -Raw -Encoding UTF8
    $modified = $original

    # Strategy: remove :root { ... } blocks that contain ONLY CSS custom properties (--xxx: value)
    # We use a regex that finds :root blocks where every declaration is a CSS variable
    # Pattern: :root optional-whitespace { lines starting with -- or whitespace/comment, ending with }
    
    # Find all :root { } blocks
    $rootPattern = '(?s):root\s*\{([^}]*)\}'
    $matches = [regex]::Matches($modified, $rootPattern)
    
    $removed = 0
    # Process in reverse order to maintain offsets
    $matchList = @($matches) | Sort-Object { $_.Index } -Descending
    
    foreach ($m in $matchList) {
        $innerContent = $m.Groups[1].Value
        
        # Check if ALL declarations inside are CSS variables (--name: value)
        # Strip comments and blank lines first
        $stripped = $innerContent -replace '/\*.*?\*/', '' -replace '(?m)^\s*$', ''
        $lines = $stripped.Split("`n") | Where-Object { $_.Trim() -ne '' }
        
        $allVars = $true
        foreach ($line in $lines) {
            $t = $line.Trim()
            if ($t -ne '' -and $t -notmatch '^--[\w-]+\s*:' -and $t -notmatch '^/\*' -and $t -notmatch '^\*') {
                $allVars = $false
                break
            }
        }
        
        if ($allVars) {
            # Count how many vars are being removed
            $varCount = ($lines | Where-Object { $_.Trim() -match '^--' }).Count
            
            # Remove the entire :root block + surrounding whitespace
            $startIdx = $m.Index
            $endIdx = $m.Index + $m.Length
            
            # Also consume leading whitespace/newlines before :root
            while ($startIdx -gt 0 -and ($modified[$startIdx - 1] -eq "`n" -or $modified[$startIdx - 1] -eq "`r" -or $modified[$startIdx - 1] -eq ' ')) {
                $startIdx--
            }
            
            $before = $modified.Substring(0, $startIdx)
            $after = $modified.Substring($m.Index + $m.Length)
            $modified = $before + "`n" + $after
            
            $removed += $varCount
        }
    }
    
    if ($removed -gt 0) {
        # Clean up excessive blank lines (more than 2 consecutive)
        $modified = [regex]::Replace($modified, '(\r?\n){3,}', "`n`n")
        
        Set-Content $path $modified -Encoding UTF8 -NoNewline
        $totalStripped += $removed
        $msg = "  [OK] Stripped $removed vars from :root | $rel"
        Write-Host $msg -ForegroundColor Green
        $report += $msg
    } else {
        $msg = "  [--] No pure-var :root block found | $rel"
        Write-Host $msg -ForegroundColor DarkGray
        $report += $msg
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total variables stripped: $totalStripped" -ForegroundColor Yellow
$report | Out-File ".\scratch\strip_root_report.txt" -Encoding UTF8
Write-Host "Report saved to scratch\strip_root_report.txt"
