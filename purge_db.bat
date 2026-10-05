@echo off
title Haulo Boutique ERP -- Database Purge Tool
cls

echo =======================================================================
echo               HAULO BOUTIQUE ERP -- DATABASE PURGE TOOL               
echo =======================================================================
echo.
echo  This tool will wipe all operational and business data from fashion_erp:
echo   - Customers, Measurements, Orders, Payments, Garments
echo   - Inventory items, Stock, Purchase Orders, Suppliers, Appointments
echo.
echo  The following will be SAFELY PRESERVED:
echo   [+] All 33 Table Schemas, Columns, Constraints, and Indexes (DDL intact)
echo   [+] Flyway migration history (tables are NOT dropped)
echo   [+] Admin account login (admin / Admin@123)
echo   [+] System workflow boundary stages (ORDER_TAKEN, READY_TO_DELIVER)
echo   [+] Automatic pre-purge safety backup saved to the 'backups' folder
echo.
echo =======================================================================
echo.

if /i "%1"=="-force" goto DO_PURGE
if /i "%1"=="-y" goto DO_PURGE
if /i "%1"=="/y" goto DO_PURGE

set "CONFIRM="
set /p CONFIRM="Are you sure you want to purge the database? (Type YES to proceed): "
if /i not "%CONFIRM%"=="YES" (
    echo.
    echo [ABORTED] Operation cancelled by user. No database changes were made.
    echo.
    pause
    exit /b 0
)

:DO_PURGE
echo.
echo Executing database purge...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0src\main\resources\db\run_db_wipe.ps1" -Force

echo.
echo =======================================================================
echo   Done. You can now start the application fresh with start.bat
echo =======================================================================
echo.
pause
