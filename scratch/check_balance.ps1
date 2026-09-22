$content = Get-Content 'front end/DesignStudio/design-studio.js' -Raw
$openBraces = ($content.ToCharArray() | Where-Object { $_ -eq '{' }).Count
$closeBraces = ($content.ToCharArray() | Where-Object { $_ -eq '}' }).Count
$openParens = ($content.ToCharArray() | Where-Object { $_ -eq '(' }).Count
$closeParens = ($content.ToCharArray() | Where-Object { $_ -eq ')' }).Count
$openBrackets = ($content.ToCharArray() | Where-Object { $_ -eq '[' }).Count
$closeBrackets = ($content.ToCharArray() | Where-Object { $_ -eq ']' }).Count
Write-Host "Braces: $openBraces vs $closeBraces"
Write-Host "Parens: $openParens vs $closeParens"
Write-Host "Brackets: $openBrackets vs $closeBrackets"
if ($openBraces -eq $closeBraces -and $openParens -eq $closeParens -and $openBrackets -eq $closeBrackets) {
    Write-Host "ALL MATCH PERFECTLY!"
} else {
    Write-Host "MISMATCH DETECTED!"
}
