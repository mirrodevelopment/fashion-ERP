@echo off
cd /d "%~dp0"

echo =======================================================================
echo                    STOPPING HAULO BOUTIQUE ERP                         
echo =======================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$c = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue; if ($c) { $c | ForEach-Object { Write-Host ('Terminating server process PID ' + $_.OwningProcess + ' on port 8080...'); Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Start-Sleep -Seconds 1; Write-Host '[OK] Fashion ERP server on port 8080 has been stopped successfully.' } else { Write-Host '[INFO] No active server was found listening on port 8080.' }"
echo.
ping 127.0.0.1 -n 2 >nul 2>&1
