$base = 'D:\fashion ERP\FASHION-ERP\front end'

# Extract full CSS rule for each major button type to compare visually
$sampleFiles = @(
    "orders\view-order\view-order.css",
    "orders\new-order\new-order.css",
    "orders\order-overview\order-over.css",
    "customer\customer-overview\customer-overview.css",
    "customer\Customer360\customer360.css",
    "customer\new-customer\new-customer.css",
    "delivery\delivery.css",
    "inventory\inventory.css",
    "quality-control\quality-control.css",
    "production\production.css",
    "payments\payments.css",
    "purchases\purchases.css",
    "appointments\appointments.css",
    "WorkforceManagement\workforce.css",
    "trials-alterations\trials-alterations.css"
)

Write-Host "=== PRIMARY / CTA BUTTON STYLES ===" -ForegroundColor Cyan
$primaryPattern = '(?s)\.btn-(primary|primary-action|primary-save|primary-create|primary-record|create-order|create-customer|new-order|new-customer|head-primary|modal-primary|save-lime|update-lime|action-lime|lime-sm|action-primary)[^{]*?\{([^}]{0,500})\}'

foreach ($rel in $sampleFiles) {
    $path = Join-Path $base $rel
    if (Test-Path $path) {
        $c = Get-Content $path -Raw
        $ms = [regex]::Matches($c, $primaryPattern)
        if ($ms.Count -gt 0) {
            $short = $rel
            Write-Host "`n  [$short]" -ForegroundColor Yellow
            foreach ($m in $ms | Select-Object -First 3) {
                Write-Host "    .$($m.Groups[1].Value):" -ForegroundColor White
                $m.Groups[2].Value.Split("`n") | Where-Object { $_.Trim() -ne '' } | Select-Object -First 6 | ForEach-Object { Write-Host "      $($_.Trim())" }
            }
        }
    }
}

Write-Host "`n=== SECONDARY / GHOST BUTTON STYLES ===" -ForegroundColor Cyan
$secondaryPattern = '(?s)\.btn-(secondary|ghost|ghost-draft|cancel|link|translucent|glass-action|glass)[^{]*?\{([^}]{0,500})\}'
foreach ($rel in $sampleFiles) {
    $path = Join-Path $base $rel
    if (Test-Path $path) {
        $c = Get-Content $path -Raw
        $ms = [regex]::Matches($c, $secondaryPattern)
        if ($ms.Count -gt 0) {
            $short = $rel
            Write-Host "`n  [$short]" -ForegroundColor Yellow
            foreach ($m in $ms | Select-Object -First 2) {
                Write-Host "    .$($m.Groups[1].Value):" -ForegroundColor White
                $m.Groups[2].Value.Split("`n") | Where-Object { $_.Trim() -ne '' } | Select-Object -First 6 | ForEach-Object { Write-Host "      $($_.Trim())" }
            }
        }
    }
}

Write-Host "`n=== DANGER BUTTON STYLES ===" -ForegroundColor Cyan
$dangerPattern = '(?s)\.btn-(danger|delete|modal-danger|del)[^{]*?\{([^}]{0,400})\}'
foreach ($rel in $sampleFiles) {
    $path = Join-Path $base $rel
    if (Test-Path $path) {
        $c = Get-Content $path -Raw
        $ms = [regex]::Matches($c, $dangerPattern)
        if ($ms.Count -gt 0) {
            $short = $rel
            Write-Host "`n  [$short]" -ForegroundColor Yellow
            foreach ($m in $ms | Select-Object -First 2) {
                Write-Host "    .$($m.Groups[1].Value):" -ForegroundColor White
                $m.Groups[2].Value.Split("`n") | Where-Object { $_.Trim() -ne '' } | Select-Object -First 5 | ForEach-Object { Write-Host "      $($_.Trim())" }
            }
        }
    }
}

Write-Host "`n=== TABLE th/td BASE STYLES ===" -ForegroundColor Cyan
$tablePattern = '(?s)^(th|td)\s*\{([^}]{0,400})\}'
foreach ($rel in $sampleFiles) {
    $path = Join-Path $base $rel
    if (Test-Path $path) {
        $c = Get-Content $path -Raw
        $ms = [regex]::Matches($c, $tablePattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)
        if ($ms.Count -gt 0) {
            Write-Host "`n  [$rel]" -ForegroundColor Yellow
            foreach ($m in $ms | Select-Object -First 2) {
                Write-Host "    $($m.Groups[1].Value):" -ForegroundColor White
                $m.Groups[2].Value.Split("`n") | Where-Object { $_.Trim() -ne '' } | Select-Object -First 8 | ForEach-Object { Write-Host "      $($_.Trim())" }
            }
        }
    }
}

Write-Host "`n=== FORM INPUT STYLES ===" -ForegroundColor Cyan
$inputPattern = '(?s)\.form-input\s*\{([^}]{0,500})\}'
foreach ($rel in $sampleFiles) {
    $path = Join-Path $base $rel
    if (Test-Path $path) {
        $c = Get-Content $path -Raw
        $ms = [regex]::Matches($c, $inputPattern)
        if ($ms.Count -gt 0) {
            Write-Host "`n  [$rel]" -ForegroundColor Yellow
            $ms[0].Groups[1].Value.Split("`n") | Where-Object { $_.Trim() -ne '' } | Select-Object -First 10 | ForEach-Object { Write-Host "    $($_.Trim())" }
        }
    }
}
