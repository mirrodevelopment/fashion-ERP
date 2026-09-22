# ============================================================
# HAULO ERP — Global Theme Color Refactor
# Replaces ALL hardcoded hex colors across ALL CSS files
# with CSS custom property references from theme/theme.css
# ============================================================

$base = 'D:\fashion ERP\FASHION-ERP\front end'

function Replace-Colors {
    param([string]$filePath)
    
    if (-not (Test-Path $filePath)) {
        Write-Warning "NOT FOUND: $filePath"
        return
    }
    
    $c = Get-Content $filePath -Raw -Encoding UTF8

    # ── Brand Lime ──
    $c = $c -replace '(?i)#b4f039\b', 'var(--lime-pill)'
    $c = $c -replace '(?i)#a3e635\b', 'var(--lime)'
    $c = $c -replace '(?i)#142204\b', 'var(--lime-dark)'
    $c = $c -replace '(?i)#c4f024\b', 'var(--lime-bright)'
    $c = $c -replace '(?i)#d4ff32\b', 'var(--lime-soft)'
    $c = $c -replace '(?i)#bef264\b', 'var(--lime-pale)'
    $c = $c -replace '(?i)#b7ff3c\b', 'var(--lime-bright)'
    $c = $c -replace '(?i)#c4ff55\b', 'var(--lime-bright)'
    $c = $c -replace '(?i)#bbf451\b', 'var(--lime-pill)'
    $c = $c -replace '(?i)#b8e61e\b', 'var(--lime)'
    $c = $c -replace '(?i)#b8f04a\b', 'var(--lime-pale)'
    $c = $c -replace '(?i)#5fa000\b', 'var(--green-dark)'
    $c = $c -replace '(?i)#84cc16\b', 'var(--lime)'
    $c = $c -replace '(?i)#c8f560\b', 'var(--lime-pale)'
    $c = $c -replace '(?i)#d6fa7c\b', 'var(--lime-pale)'
    $c = $c -replace '(?i)#c5ff4f\b', 'var(--lime-bright)'
    $c = $c -replace '(?i)#c8f542\b', 'var(--lime-bright)'
    $c = $c -replace '(?i)#d2ff70\b', 'var(--lime-soft)'

    # ── Green ──
    $c = $c -replace '(?i)#4ade80\b', 'var(--green)'
    $c = $c -replace '(?i)#22c55e\b', 'var(--green-bright)'
    $c = $c -replace '(?i)#65a30d\b', 'var(--green-dark)'
    $c = $c -replace '(?i)#15803d\b', 'var(--green-deep)'
    $c = $c -replace '(?i)#166534\b', 'var(--green-forest)'
    $c = $c -replace '(?i)#059669\b', 'var(--green-rich)'
    $c = $c -replace '(?i)#86efac\b', 'var(--green-pale)'
    $c = $c -replace '(?i)#34d399\b', 'var(--green-tint)'
    $c = $c -replace '(?i)#10b981\b', 'var(--green-rich)'
    $c = $c -replace '(?i)#25d366\b', 'var(--whatsapp-green)'

    # ── Red / Danger ──
    $c = $c -replace '(?i)#f87171\b', 'var(--red)'
    $c = $c -replace '(?i)#fb7185\b', 'var(--red-soft)'
    $c = $c -replace '(?i)#fca5a5\b', 'var(--red-pale)'
    $c = $c -replace '(?i)#ef4444\b', 'var(--danger)'
    $c = $c -replace '(?i)#dc2626\b', 'var(--danger-dark)'
    $c = $c -replace '(?i)#b91c1c\b', 'var(--danger-deep)'

    # ── Orange / Amber ──
    $c = $c -replace '(?i)#fb923c\b', 'var(--orange)'
    $c = $c -replace '(?i)#f97316\b', 'var(--orange-deep)'
    $c = $c -replace '(?i)#fbbf24\b', 'var(--amber)'
    $c = $c -replace '(?i)#d97706\b', 'var(--amber-dark)'
    $c = $c -replace '(?i)#b45309\b', 'var(--amber-deep)'
    $c = $c -replace '(?i)#eab308\b', 'var(--amber-bright)'
    $c = $c -replace '(?i)#fde047\b', 'var(--amber-soft)'
    $c = $c -replace '(?i)#fef08a\b', 'var(--amber-pale)'
    $c = $c -replace '(?i)#f59e0b\b', 'var(--amber-dark)'
    $c = $c -replace '(?i)#facc15\b', 'var(--amber)'
    $c = $c -replace '(?i)#ffd875\b', 'var(--amber-soft)'
    $c = $c -replace '(?i)#d4af37\b', 'var(--gold-rich)'
    $c = $c -replace '(?i)#f1df91\b', 'var(--gold-soft)'
    $c = $c -replace '(?i)#fcd34d\b', 'var(--amber-soft)'
    $c = $c -replace '(?i)#fef3c7\b', 'var(--gold-bg)'
    $c = $c -replace '(?i)#fed7aa\b', 'var(--amber-bg)'
    $c = $c -replace '(?i)#ffedd5\b', 'var(--amber-bg)'
    $c = $c -replace '(?i)#ffd76a\b', 'var(--cat-saree-text)'

    # ── Blue ──
    $c = $c -replace '(?i)#38bdf8\b', 'var(--blue)'
    $c = $c -replace '(?i)#7dd3fc\b', 'var(--blue-soft)'
    $c = $c -replace '(?i)#bae6fd\b', 'var(--blue-pale)'
    $c = $c -replace '(?i)#60a5fa\b', 'var(--blue-medium)'
    $c = $c -replace '(?i)#3b82f6\b', 'var(--blue-deep)'
    $c = $c -replace '(?i)#2563eb\b', 'var(--blue-darker)'
    $c = $c -replace '(?i)#0284c7\b', 'var(--blue-darkest)'
    $c = $c -replace '(?i)#0369a1\b', 'var(--blue-anchor)'
    $c = $c -replace '(?i)#22d3ee\b', 'var(--blue-bright)'
    $c = $c -replace '(?i)#0ea5e9\b', 'var(--sky)'
    $c = $c -replace '(?i)#93c5fd\b', 'var(--blue-pale)'
    $c = $c -replace '(?i)#cfe8ff\b', 'var(--blue-bg)'
    $c = $c -replace '(?i)#e0f2fe\b', 'var(--blue-bg)'
    $c = $c -replace '(?i)#bae6fd\b', 'var(--blue-pale)'

    # ── Purple ──
    $c = $c -replace '(?i)#c084fc\b', 'var(--purple)'
    $c = $c -replace '(?i)#a78bfa\b', 'var(--purple-soft)'
    $c = $c -replace '(?i)#c4b5fd\b', 'var(--purple-pale)'
    $c = $c -replace '(?i)#d8b4fe\b', 'var(--purple-paler)'
    $c = $c -replace '(?i)#a855f7\b', 'var(--purple-medium)'
    $c = $c -replace '(?i)#8b5cf6\b', 'var(--purple-deep)'
    $c = $c -replace '(?i)#7c3aed\b', 'var(--purple-deeper)'
    $c = $c -replace '(?i)#6d28d9\b', 'var(--purple-darkest)'
    $c = $c -replace '(?i)#8b48f5\b', 'var(--purple-deeper)'
    $c = $c -replace '(?i)#b56bf8\b', 'var(--purple-medium)'
    $c = $c -replace '(?i)#ede9fe\b', 'var(--purple-bg)'
    $c = $c -replace '(?i)#e9d5ff\b', 'var(--purple-bg)'
    $c = $c -replace '(?i)#dcd6ff\b', 'var(--indigo-bg)'
    $c = $c -replace '(?i)#e2dcff\b', 'var(--indigo-bg)'
    $c = $c -replace '(?i)#a995ff\b', 'var(--cat-kurti-text)'

    # ── Indigo ──
    $c = $c -replace '(?i)#6366f1\b', 'var(--indigo)'
    $c = $c -replace '(?i)#4f46e5\b', 'var(--indigo-dark)'
    $c = $c -replace '(?i)#4338ca\b', 'var(--indigo-darker)'
    $c = $c -replace '(?i)#3b0764\b', 'var(--indigo-deepest)'
    $c = $c -replace '(?i)#818cf8\b', 'var(--indigo-soft)'
    $c = $c -replace '(?i)#a5b4fc\b', 'var(--indigo-pale)'
    $c = $c -replace '(?i)#e0e7ff\b', 'var(--indigo-bg)'
    $c = $c -replace '(?i)#eef2ff\b', 'var(--indigo-bg)'
    $c = $c -replace '(?i)#1e1b4b\b', '#1e1b4b'  # keep — deep nav bg, not a standard token

    # ── Pink ──
    $c = $c -replace '(?i)#f472b6\b', 'var(--pink)'
    $c = $c -replace '(?i)#ec4899\b', 'var(--pink-deep)'
    $c = $c -replace '(?i)#be185d\b', 'var(--pink-deeper)'
    $c = $c -replace '(?i)#9d174d\b', 'var(--pink-darkest)'
    $c = $c -replace '(?i)#f43f5e\b', 'var(--pink-danger)'
    $c = $c -replace '(?i)#fb7185\b', 'var(--pink-soft)'
    $c = $c -replace '(?i)#fda4af\b', 'var(--pink-pale)'
    $c = $c -replace '(?i)#fce7f3\b', 'var(--pink-bg)'
    $c = $c -replace '(?i)#ffd6e0\b', 'var(--pink-bg)'
    $c = $c -replace '(?i)#fed5dc\b', 'var(--pink-bg)'
    $c = $c -replace '(?i)#fee2e2\b', 'var(--danger-bg)'
    $c = $c -replace '(?i)#fdeef2\b', 'var(--pink-bg)'
    $c = $c -replace '(?i)#ff4d6d\b', 'var(--pink-danger)'
    $c = $c -replace '(?i)#ff758f\b', 'var(--pink-soft)'
    $c = $c -replace '(?i)#ff91b8\b', 'var(--cat-lehenga-text)'
    $c = $c -replace '(?i)#ff7597\b', 'var(--pink-deep)'
    $c = $c -replace '(?i)#9a2c49\b', 'var(--pink-deeper)'
    $c = $c -replace '(?i)#e03556\b', 'var(--pink-danger)'

    # ── Teal / Cyan ──
    $c = $c -replace '(?i)#2dd4bf\b', 'var(--teal)'
    $c = $c -replace '(?i)#14b8a6\b', 'var(--teal-dark)'
    $c = $c -replace '(?i)#5eead4\b', 'var(--teal-bright)'
    $c = $c -replace '(?i)#06b6d4\b', 'var(--cyan)'

    # ── Gray / Slate ──
    $c = $c -replace '(?i)#111827\b', 'var(--gray-900)'
    $c = $c -replace '(?i)#1f2937\b', 'var(--gray-800)'
    $c = $c -replace '(?i)#374151\b', 'var(--gray-700)'
    $c = $c -replace '(?i)#4b5563\b', 'var(--gray-600)'
    $c = $c -replace '(?i)#6b7280\b', 'var(--gray-500)'
    $c = $c -replace '(?i)#9ca3af\b', 'var(--gray-400)'
    $c = $c -replace '(?i)#d1d5db\b', 'var(--gray-300)'
    $c = $c -replace '(?i)#e5e7eb\b', 'var(--gray-200)'
    $c = $c -replace '(?i)#f3f4f6\b', 'var(--gray-100)'
    $c = $c -replace '(?i)#1e293b\b', 'var(--slate-800)'
    $c = $c -replace '(?i)#334155\b', 'var(--slate-700)'
    $c = $c -replace '(?i)#475569\b', 'var(--slate-600)'
    $c = $c -replace '(?i)#64748b\b', 'var(--slate-500)'
    $c = $c -replace '(?i)#94a3b8\b', 'var(--slate-400)'
    $c = $c -replace '(?i)#cbd5e1\b', 'var(--slate-300)'
    $c = $c -replace '(?i)#e2e8f0\b', 'var(--slate-200)'
    $c = $c -replace '(?i)#f1f5f9\b', 'var(--slate-100)'
    $c = $c -replace '(?i)#f8fafc\b', 'var(--slate-50)'
    $c = $c -replace '(?i)#f9fafb\b', 'var(--gray-100)'
    $c = $c -replace '(?i)#f8f9fa\b', 'var(--gray-100)'
    $c = $c -replace '(?i)#dee2e6\b', 'var(--gray-200)'
    $c = $c -replace '(?i)#333333\b', 'var(--gray-700)'
    $c = $c -replace '(?i)#444444\b', 'var(--gray-600)'
    $c = $c -replace '(?i)#666666\b', 'var(--gray-500)'
    $c = $c -replace '(?i)#1a1a1a\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#e5e5e5\b', 'var(--gray-200)'
    $c = $c -replace '(?i)#f8f8f8\b', 'var(--gray-100)'

    # ── Dark warm backgrounds (body / gradient) ──
    $c = $c -replace '(?i)#181310\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#181210\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#1a1210\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#12100e\b', 'var(--bg-body-alt)'
    $c = $c -replace '(?i)#1c120a\b', 'var(--bg-gradient-mid)'
    $c = $c -replace '(?i)#0d0804\b', 'var(--bg-gradient-deep)'

    # ── White / Pure ──
    $c = $c -replace '(?i)#ffffff\b', '#ffffff'
    $c = $c -replace '(?i)#fff\b',    '#fff'

    # ── Measurement overview specific blues (unify to warm dark) ──
    $c = $c -replace '(?i)#0c0f14\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#131720\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#151a24\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#181d28\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#19202c\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#202736\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#0c0e14\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#0b0f19\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#13151e\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#1a1c28\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#1e2030\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#0d1205\b', 'var(--lime-dark)'

    # ── Login specific dark ──
    $c = $c -replace '(?i)#070a0e\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#0b0f15\b', 'var(--bg-body)'
    $c = $c -replace '(?i)#101520\b', 'var(--bg-body)'

    Set-Content $filePath $c -Encoding UTF8
    $shortPath = $filePath.Replace('D:\fashion ERP\FASHION-ERP\front end\', '')
    Write-Host "  DONE: $shortPath" -ForegroundColor Green
}

Write-Host "=== HAULO ERP - CSS Color Refactor ===" -ForegroundColor Cyan
Write-Host "Processing 25 CSS files..."

$files = @(
    "$base\fragments\nav.css",
    "$base\dashboard\dashboard.css",
    "$base\DesignStudio\design-studio.css",
    "$base\quality-control\quality-control.css",
    "$base\production\production.css",
    "$base\production\stages\stages.css",
    "$base\appointments\appointments.css",
    "$base\enquiries\enquiries.css",
    "$base\orders\view-order\view-order.css",
    "$base\orders\new-order\new-order.css",
    "$base\orders\order-overview\order-over.css",
    "$base\customer\Customer360\customer360.css",
    "$base\customer\new-customer\new-customer.css",
    "$base\customer\customer-overview\customer-overview.css",
    "$base\delivery\delivery.css",
    "$base\inventory\inventory.css",
    "$base\payments\payments.css",
    "$base\purchases\purchases.css",
    "$base\trials-alterations\trials-alterations.css",
    "$base\WorkforceManagement\workforce.css",
    "$base\fabrics-materials\fabrics-materials.css",
    "$base\Measurements\measurement360\measurement360.css",
    "$base\Measurements\measurement-overview\measurement-overview.css",
    "$base\login\login.css"
)

foreach ($file in $files) {
    Replace-Colors -filePath $file
}

Write-Host "=== All files processed! ===" -ForegroundColor Cyan
