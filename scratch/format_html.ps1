$raw = [System.IO.File]::ReadAllText("$PSScriptRoot/../front end/trials-alterations/trials-alterations.html", [System.Text.Encoding]::UTF8)
Write-Host "Current length: $($raw.Length) characters"

# Check if legacy hardcoded gallery items exist in designGalleryGrid
$target = '<div class="gallery-grid" id="designGalleryGrid">'
Write-Host "Target found: $($raw.Contains($target))"
