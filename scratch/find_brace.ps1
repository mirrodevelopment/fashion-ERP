$lines = Get-Content 'front end/DesignStudio/design-studio.js'
$depth = 0
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    # strip string literals roughly
    $cleaned = $line -replace '"[^"]*"', '""' -replace "'[^']*'", "''"
    $opens = ($cleaned.ToCharArray() | Where-Object { $_ -eq '{' }).Count
    $closes = ($cleaned.ToCharArray() | Where-Object { $_ -eq '}' }).Count
    $prev = $depth
    $depth += ($opens - $closes)
    if ($line -match '^\s*(function|\(function|window\.)') {
        # function start
    }
    if ($depth -eq 0 -and $prev -ne 0) {
        # function closed
    }
}
Write-Host "Raw braces count: opens = $(($lines -join '' | Select-String '{' -AllMatches).Matches.Count) closes = $(($lines -join '' | Select-String '}' -AllMatches).Matches.Count)"
