$f = 'D:\fashion ERP\FASHION-ERP\front end\fragments\nav.css'
$c = Get-Content $f -Raw

# Replace local :root block with comment
$c = [regex]::Replace($c, '(?s):root \{[\s\S]*?--nav-font:.*?\n\}', '/* :root nav tokens consolidated into theme/theme.css */')

# Replace nav-scoped token vars with global theme vars
$c = $c -replace 'var\(--nav-lime-pill\)',       'var(--lime-pill)'
$c = $c -replace 'var\(--nav-lime-dark\)',       'var(--lime-dark)'
$c = $c -replace 'var\(--nav-lime-dim\)',        'var(--lime-dim)'
$c = $c -replace 'var\(--nav-lime\)',            'var(--lime)'
$c = $c -replace 'var\(--nav-sidebar-bg\)',      'var(--bg-sidebar)'
$c = $c -replace 'var\(--nav-topbar-bg\)',       'var(--bg-header)'
$c = $c -replace 'var\(--nav-glass-md\)',        'var(--bg-card-strong)'
$c = $c -replace 'var\(--nav-glass-border-md\)', 'var(--border-card-hover)'
$c = $c -replace 'var\(--nav-glass-border\)',    'var(--border-sidebar)'
$c = $c -replace 'var\(--nav-glass\)',           'var(--bg-card)'
$c = $c -replace 'var\(--nav-text-primary\)',    'var(--text-primary)'
$c = $c -replace 'var\(--nav-text-secondary\)',  'var(--text-secondary)'
$c = $c -replace 'var\(--nav-text-muted\)',      'var(--text-muted)'
$c = $c -replace 'var\(--nav-text-dim\)',        'var(--text-dim)'
$c = $c -replace 'var\(--nav-radius\)',          'var(--radius-md)'
$c = $c -replace 'var\(--nav-t\)',              'var(--transition)'
$c = $c -replace 'var\(--nav-font\)',           "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"

# Replace raw hex colors
$c = $c -replace '(?i)#5fa000', 'var(--green-dark)'
$c = $c -replace '(?i)#a3e635', 'var(--lime)'
$c = $c -replace '(?i)#b4f039', 'var(--lime-pill)'
$c = $c -replace '(?i)#142204', 'var(--lime-dark)'
$c = $c -replace '(?i)#ef4444', 'var(--danger)'
$c = $c -replace '(?i)#f87171', 'var(--red)'
$c = $c -replace '(?i)#fbbf24', 'var(--amber)'
$c = $c -replace '(?i)#231[Bb]16', 'var(--bg-warm-deep)'
$c = $c -replace '(?i)#ffffff(?!\w)', 'var(--text-primary)'
$c = $c -replace "var\(--text-primary\)\)" , "#ffffff)"

Set-Content $f $c -Encoding UTF8
Write-Host 'nav.css done'
