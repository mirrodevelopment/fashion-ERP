# Removes background/background-color lines from body{} blocks in module CSS files.
# Does NOT touch background on other selectors (select options, modals, etc.)

function Remove-BodyBackground($filePath) {
    $content = [System.IO.File]::ReadAllText($filePath)
    
    # Match the body { ... } block and strip background lines inside it
    # Pattern: body { ... } where ... may contain background properties
    $result = [System.Text.RegularExpressions.Regex]::Replace(
        $content,
        '((?:^|\n)(?:html,\s*)?body\s*\{[^}]*?)(?:\s*background(?:-color)?:\s*var\(--bg-body\);|background(?:-color)?:\s*var\(--bg-gradient-deep\);\s*(?=\n[^}]*\}))',
        '$1',
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )
    
    if ($result -ne $content) {
        [System.IO.File]::WriteAllText($filePath, $result, [System.Text.Encoding]::UTF8)
        return $true
    }
    return $false
}

$base = "d:\fashion ERP\FASHION-ERP\front end"
$files = @(
    "$base\appointments\appointments.css",
    "$base\customer\new-customer\new-customer.css",
    "$base\dashboard\dashboard.css",
    "$base\design-studio\design-studio.css",
    "$base\enquiries\enquiries.css",
    "$base\fabrics-materials\fabrics-materials.css",
    "$base\fragments\fragments.css",
    "$base\inventory\inventory.css",
    "$base\Measurements\measurement-overview\measurement-overview.css",
    "$base\Measurements\measurement360\measurement360.css",
    "$base\orders\new-order\new-order.css",
    "$base\orders\view-order\view-order.css",
    "$base\payments\payments.css",
    "$base\production\production.css",
    "$base\stages\stages.css",
    "$base\quality-control\quality-control.css",
    "$base\trials-alterations\trials-alterations.css",
    "$base\workforce\workforce.css"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $changed = Remove-BodyBackground $f
        $name = [System.IO.Path]::GetFileName($f)
        if ($changed) { Write-Host "  FIXED  $name" } else { Write-Host "  SKIP   $name" }
    } else {
        Write-Host "  MISS   $f"
    }
}
Write-Host "Done."
