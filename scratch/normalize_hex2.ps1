$base = 'D:\fashion ERP\FASHION-ERP\front end'

# These remaining hex values ARE theme tokens — replace them
$replacements = @(
    # Dark surfaces that missed the first pass (slight variants)
    @{ Pattern = '#0d0a09';   Token = 'var(--bg-body-alt)' }
    @{ Pattern = '#0d0b0a';   Token = 'var(--bg-body-alt)' }
    @{ Pattern = '#0b1008';   Token = 'var(--bg-body-alt)' }
    @{ Pattern = '#0b1406';   Token = 'var(--bg-body-alt)' }
    @{ Pattern = '#120d0b';   Token = 'var(--bg-body-alt)' }
    @{ Pattern = '#140f0d';   Token = 'var(--bg-body-alt)' }
    @{ Pattern = '#14100d';   Token = 'var(--bg-body-alt)' }
    @{ Pattern = '#181512';   Token = 'var(--bg-body)' }
    @{ Pattern = '#1a1412';   Token = 'var(--bg-body)' }
    @{ Pattern = '#1a1614';   Token = 'var(--bg-body)' }
    @{ Pattern = '#1c1412';   Token = 'var(--bg-body)' }
    @{ Pattern = '#1c1512';   Token = 'var(--bg-body)' }
    @{ Pattern = '#1c1613';   Token = 'var(--bg-body)' }
    @{ Pattern = '#1e1715';   Token = 'var(--bg-body)' }
    @{ Pattern = '#1e1814';   Token = 'var(--bg-body)' }
    @{ Pattern = '#1e1b17';   Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#1e1b18';   Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#1f1c18';   Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#231b16';   Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#241c18';   Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#241c19';   Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#241d1a';   Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#25221e';   Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#261f1c';   Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#2b2823';   Token = 'var(--bg-gradient-mid)' }
    @{ Pattern = '#2d2420';   Token = 'var(--bg-gradient-mid)' }

    # Lime-dark text variants
    @{ Pattern = '#0b1406';   Token = 'var(--lime-dark)' }
    @{ Pattern = '#0b1008';   Token = 'var(--lime-dark)' }
    @{ Pattern = '#143506';   Token = 'var(--lime-dark)' }
    @{ Pattern = '#0c4a6e';   Token = 'var(--blue)' }

    # Shorthand whites / blacks that slipped through
    @{ Pattern = '#fff(?!\w)'; Token = 'var(--text-primary)'; IsRegex = $true }
    @{ Pattern = '#000(?!\w)'; Token = 'var(--bg-gradient-deep)'; IsRegex = $true }
    @{ Pattern = '#111(?!\w)'; Token = 'var(--bg-body-alt)'; IsRegex = $true }
    @{ Pattern = '#888(?!\w)'; Token = 'var(--text-muted)'; IsRegex = $true }
    @{ Pattern = '#aaa(?!\w)'; Token = 'var(--text-dim)'; IsRegex = $true }
)

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
    "dashboard\dashboard.css",
    "fragments\nav.css",
    "fragments\fragments.css"
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
            $ms = [regex]::Matches($content, $pat, 'IgnoreCase')
            if ($ms.Count -gt 0) {
                $content = [regex]::Replace($content, $pat, $tok, 'IgnoreCase')
                $fileReplaced += $ms.Count
            }
        } else {
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
    }
}

Write-Host "`nTotal: $totalReplaced replacements" -ForegroundColor Yellow
