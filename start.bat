@echo off
title Haulo Boutique ERP -- Enterprise System Launcher
cls

echo =======================================================================
echo                    HAULO BOUTIQUE ERP (Version 1.0)                    
echo       Tailoring, Boutique and Garment Manufacturing Enterprise ERP     
echo =======================================================================
echo.

echo [1/3] Checking Database (PostgreSQL)...
netstat -ano | findstr :5432 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Database is offline. Attempting to start PostgreSQL...
    net start postgresql-x64-17 >nul 2>&1
    if errorlevel 1 (
        if exist "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" (
            "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\17\data" >nul 2>&1
        )
    )
    timeout /t 3 /nobreak >nul
)

netstat -ano | findstr :5432 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] PostgreSQL is active and listening on port 5432.
) else (
    echo [WARNING] PostgreSQL could not be started automatically.
    echo Please make sure the PostgreSQL service or pg_ctl is running.
)
echo.

echo [2/3] Launching Backend Health Monitor...
echo Application will automatically open in Google Chrome once backend server is ready.
echo Login Desk URL: http://localhost:8080/front%%20end/login/login.html
echo.

start /b powershell -NoProfile -ExecutionPolicy Bypass -Command "for ($i=0; $i -lt 60; $i++) { try { $r = Invoke-WebRequest -Uri 'http://localhost:8080/actuator/health' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { if (Test-Path 'C:\Program Files\Google\Chrome\Application\chrome.exe') { Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' 'http://localhost:8080/front%%20end/login/login.html' } elseif (Test-Path 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe') { Start-Process 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' 'http://localhost:8080/front%%20end/login/login.html' } else { Start-Process 'http://localhost:8080/front%%20end/login/login.html' }; break } } catch {}; Start-Sleep -Seconds 1 }"

echo [3/3] Starting Spring Boot Server on http://localhost:8080...
echo Website Endpoint: http://localhost:8080/
echo Login Desk      : http://localhost:8080/front%%20end/login/login.html
echo REST API Base   : http://localhost:8080/api/v1
echo Default Login   : admin / Admin@123
echo.
echo =======================================================================
echo   Server logs will stream below. Press Ctrl+C to stop the application.
echo =======================================================================
echo.

call "%~dp0mvnw.cmd" spring-boot:run

pause
