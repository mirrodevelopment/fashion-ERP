Add-Type -AssemblyName System.Drawing
Get-ChildItem 'scratch/pure_artwork' | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    Write-Host "$($_.Name): $($img.Width)x$($img.Height)"
    $img.Dispose()
}
