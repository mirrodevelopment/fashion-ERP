$base = 'D:\fashion ERP\FASHION-ERP\front end'

# Key background/color hex values that are still hardcoded in Orders & Customer files
# Mapping: hardcoded value → correct token
# These were found in the deep audit for view-order, order-overview, customer360, new-customer

$replacements = @(
    # --- Lime-dark (button text on lime background) ---
    @{ Pattern = '#0f1406';  Token = 'var(--lime-dark)' }
    @{ Pattern = '#121808';  Token = 'var(--lime-dark)' }
    @{ Pattern = '#0a0600';  Token = 'var(--lime-dark)' }
    @{ Pattern = '#120e0c';  Token = 'var(--lime-dark)' }
    @{ Pattern = '#142204';  Token = 'var(--lime-dark)' }
    @{ Pattern = '#120f0d';  Token = 'var(--lime-dark)' }

    # --- Background body/card tones ---
    @{ Pattern = '#12100e';  Token = 'var(--bg-body-alt)' }
    @{ Pattern = '#14100e';  Token = 'var(--bg-body-alt)' }
    @{ Pattern = '#141210';  Token = 'var(--bg-body-alt)' }
    @{ Pattern = '#181310';  Token = 'var(--bg-body)' }
    @{ Pattern = '#191412';  Token = 'var(--bg-body)' }
    @{ Pattern = '#1c120a';  Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#1a0f05';  Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#1e160e';  Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#201916';  Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#1f1815';  Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#24201c';  Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#100c0a';  Token = 'var(--bg-body-alt)' }
    @{ Pattern = '#0d0804';  Token = 'var(--bg-gradient-deep)' }
    @{ Pattern = '#473228';  Token = 'var(--bg-card-hover)' }

    # --- White (always var(--text-primary)) ---
    @{ Pattern = '#ffffff(?!\s*!important)'; Token = 'var(--text-primary)'; IsRegex = $true }

    # --- Pure black (overlay / bg) ---
    @{ Pattern = '#000000';  Token = 'var(--bg-gradient-deep)' }
)

# Target files: Orders & Customer modules only (not global)
$targets = @(
    "orders\view-order\view-order.css",
    "orders\new-order\new-order.css",
    "orders\order-overview\order-over.css",
    "customer\Customer360\customer360.css",
    "customer\customer-overview\customer-overview.css",
    "customer\new-customer\new-customer.css",
    "delivery\delivery.css",
    "inventory\inventory.css",
    "payments\payments.css",
    "purchases\purchases.css",
    "trials-alterations\trials-alterations.css",
    "production\production.css",
    "production\stages\stages.css",
    "WorkforceManagement\workforce.css",
    "appointments\appointments.css",
    "enquiries\enquiries.css",
    "fabrics-materials\fabrics-materials.css",
    "quality-control\quality-control.css",
    "Measurements\measurement-overview\measurement-overview.css",
    "Measurements\measurement360\measurement360.css",
    "DesignStudio\design-studio.css",
    "login\login.css"
)

$totalReplaced = 0

foreach ($rel in $targets) {
    $path = Join-Path $base $rel
    if (-not (Test-Path $path)) { continue }

    $content = Get-Content $path -Raw -Encoding UTF8
    $original = $content
    $fileReplaced = 0

    foreach ($r in $replacements) {
        $pat = $r.Pattern
        $tok = $r.Token
        $isRegex = if ($r.IsRegex) { $r.IsRegex } else { $false }

        if ($isRegex) {
            $matches = [regex]::Matches($content, $pat, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            if ($matches.Count -gt 0) {
                $content = [regex]::Replace($content, $pat, $tok, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
                $fileReplaced += $matches.Count
            }
        } else {
            # Case insensitive literal replacement
            $count = ([regex]::Matches($content, [regex]::Escape($pat), 'IgnoreCase')).Count
            if ($count -gt 0) {
                $content = [regex]::Replace($content, [regex]::Escape($pat), $tok, 'IgnoreCase')
                $fileReplaced += $count
            }
        }
    }

    if ($fileReplaced -gt 0 -and $content -ne $original) {
        Set-Content $path $content -Encoding UTF8 -NoNewline
        $totalReplaced += $fileReplaced
        Write-Host "  [OK] $fileReplaced replacements in $rel" -ForegroundColor Green
    } else {
        Write-Host "  [--] No matches in $rel" -ForegroundColor DarkGray
    }
}

Write-Host "`nTotal hex replacements made: $totalReplaced" -ForegroundColor Yellow
