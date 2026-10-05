@echo off
title Haulo Boutique ERP -- Demo Data Seed Tool
cls

echo =======================================================================
echo               HAULO BOUTIQUE ERP -- DEMO DATA SEED TOOL               
echo =======================================================================
echo.
echo  This tool will seed complete realistic demo data for:
echo   [+] Company     : Riwayat Haute Couture
echo   [+] Branches    : 3 (Lucknow Flagship HQ, Agra Showroom, Kanpur Studio)
echo   [+] Staff       : 9 Employees (1 Manager + 2 Tailors per branch)
echo   [+] Customers   : 50 Patrons across Lucknow, Agra, and Kanpur
echo   [+] Measurements: 73 Multi-Garment Profiles (Lehenga, Blouse, Chudi, Gown, Saree)
echo   [+] Orders      : 125 Orders (1 to 5 per customer, Lehengas, Suits, Blouses)
echo   [+] Garments    : 150 Garments across all 3 branches with live atelier imagery
echo   [+] Designs     : 24 Haute Couture Designs across all 3 branches
echo   [+] Materials   : 36 Fabric & Trims Inventory Items across all 3 branches
echo   [+] Payments    : 125 Payment records with Advances and Balances
echo   [+] Ledger      : 125 Transactions (UPI, Card, Cash, Net Banking)
echo   [+] Production  : 250 Progress Stages (Intake to Ready)
echo   [+] Fittings    : 60 Customer Trials and Alterations
echo   [+] Collections : 6 Haute Couture Collections (2 per branch with activities)
echo   [+] Leads       : 20 Customer Enquiries
echo.
echo =======================================================================
echo.

if /i "%1"=="-force" goto DO_SEED
if /i "%1"=="-y" goto DO_SEED
if /i "%1"=="/y" goto DO_SEED

set "CONFIRM="
set /p CONFIRM="Seed demo data into fashion_erp? (Type YES to proceed): "
if /i not "%CONFIRM%"=="YES" (
    echo.
    echo [ABORTED] Operation cancelled by user. No database changes were made.
    echo.
    pause
    exit /b 0
)

:DO_SEED
echo.
echo Executing demo data seeding...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0src\main\resources\db\run_db_seed.ps1" -Force

echo.
echo =======================================================================
echo   Done! Launch or refresh your application to explore the demo data.
echo =======================================================================
echo.
pause
