<#
.SYNOPSIS
    Riwayat Haute Couture - Database Demo Data Seed Runner
.DESCRIPTION
    Safely executes seed_demo_data.sql against the fashion_erp PostgreSQL database.
    Seeds 1 company (Riwayat Haute Couture), 3 branches, 9 employees, 50 customers,
    50 measurements, 125 orders, 125 garments, 125 payments, 250 stages, 60 trials,
    3 collections, and 20 enquiries.
.PARAMETER Force
    Skips the confirmation prompt.
.PARAMETER SkipBackup
    Skips creating an automatic pre-seed backup dump.
.EXAMPLE
    .\run_db_seed.ps1
.EXAMPLE
    .\run_db_seed.ps1 -Force -SkipBackup
#>

param(
    [switch]$Force,
    [switch]$SkipBackup
)

$ErrorActionPreference = "Stop"

# Configuration defaults matching application.yaml
$DbHost = "localhost"
$DbPort = "5432"
$DbName = "fashion_erp"
$DbUser = "postgres"
$DbPass = "crazy@8"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " RIWAYAT HAUTE COUTURE -- DEMO DATA SEED RUNNER" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Target Database : $DbName on $DbHost`:$DbPort"
Write-Host "Database User   : $DbUser"
Write-Host "Seed Script     : seed_demo_data.sql"
Write-Host "Company         : Riwayat Haute Couture"
Write-Host "Branches (3)    : Lucknow Flagship HQ, Agra Showroom, Kanpur Studio"
Write-Host "Volume          : 50 Customers | 125 Orders | 125 Garments | 125 Payments"
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

# 1. Locate psql.exe and pg_dump.exe
$PsqlPath = $null
$PgDumpPath = $null

if (Get-Command psql -ErrorAction SilentlyContinue) {
    $PsqlPath = (Get-Command psql).Source
} else {
    $CommonPaths = @(
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\*\bin\psql.exe"
    )
    foreach ($p in $CommonPaths) {
        $resolved = Resolve-Path $p -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($resolved -and (Test-Path $resolved.Path)) {
            $PsqlPath = $resolved.Path
            break
        }
    }
}

if (-not $PsqlPath -or -not (Test-Path $PsqlPath)) {
    Write-Error "ERROR: psql.exe could not be found. Please ensure PostgreSQL is installed."
    exit 1
}

$PgBinDir = Split-Path -Parent $PsqlPath
$PgDumpCandidate = Join-Path $PgBinDir "pg_dump.exe"
if (Test-Path $PgDumpCandidate) {
    $PgDumpPath = $PgDumpCandidate
}

Write-Host "[OK] Detected PostgreSQL tools at: $PgBinDir" -ForegroundColor Green

# 2. Locate SQL script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) { $ScriptDir = Get-Location }
$SqlFile = Join-Path $ScriptDir "seed_demo_data.sql"

if (-not (Test-Path $SqlFile)) {
    $SqlFile = "d:\fashion ERP\FASHION-ERP\src\main\resources\db\seed_demo_data.sql"
}

if (-not (Test-Path $SqlFile)) {
    Write-Error "ERROR: SQL seed script not found at: $SqlFile"
    exit 1
}

Write-Host "[OK] SQL script located: $SqlFile" -ForegroundColor Green

# 3. Confirmation prompt
if (-not $Force) {
    Write-Host "`nThis will seed rich realistic demo data into $DbName." -ForegroundColor Yellow
    Write-Host "Existing records with identical codes/keys will be skipped safely (ON CONFLICT DO NOTHING)." -ForegroundColor Yellow
    Write-Host ""
    $confirmation = Read-Host "Are you sure you want to seed demo data? (Type 'YES' to proceed)"
    if ($confirmation -ne "YES") {
        Write-Host "Operation aborted by user. No data was changed." -ForegroundColor Yellow
        exit 0
    }
}

$env:PGPASSWORD = $DbPass

# 4. Optional Pre-seed Backup
if (-not $SkipBackup -and $PgDumpPath) {
    try {
        $BackupDir = "d:\fashion ERP\FASHION-ERP\backups"
        if (-not (Test-Path $BackupDir)) {
            New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        }
        $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $BackupFile = Join-Path $BackupDir "fashion_erp_pre_seed_$Timestamp.sql"
        Write-Host "`nCreating safety backup before seeding..." -ForegroundColor Cyan
        & "$PgDumpPath" -h $DbHost -p $DbPort -U $DbUser -d $DbName -F p -f "$BackupFile"
        Write-Host "[OK] Backup created successfully: $BackupFile" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to create backup: $_. Continuing with seed..."
    }
}

# 5. Execute Seed Script
Write-Host "`nExecuting demo seed script..." -ForegroundColor Cyan
try {
    $output = & "$PsqlPath" -h $DbHost -p $DbPort -U $DbUser -d $DbName -f "$SqlFile" 2>&1
    Write-Host $output

    $BranchPagesSql = Join-Path $ScriptDir "seed_branch_pages_data.sql"
    if (Test-Path $BranchPagesSql) {
        Write-Host "`nExecuting multi-branch pages seed script (Designs, Inventory, Measurements, Garments, Collections)..." -ForegroundColor Cyan
        $output2 = & "$PsqlPath" -h $DbHost -p $DbPort -U $DbUser -d $DbName -f "$BranchPagesSql" 2>&1
        Write-Host $output2
    }

    Write-Host "`n=================================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] DEMO DATA SEEDED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host " Company      : Riwayat Haute Couture" -ForegroundColor Green
    Write-Host " Branches     : 3 (Lucknow Flagship HQ, Agra Showroom, Kanpur Studio)" -ForegroundColor Green
    Write-Host " Customers    : 50 patrons with multi-garment body measurements" -ForegroundColor Green
    Write-Host " Orders       : 125 bespoke orders across production & delivery" -ForegroundColor Green
    Write-Host " Garments     : 150 garments across all 3 branches" -ForegroundColor Green
    Write-Host " Designs      : 24 haute couture designs across 3 branches" -ForegroundColor Green
    Write-Host " Materials    : 36 inventory items & fabrics across 3 branches" -ForegroundColor Green
    Write-Host " Collections  : 6 collections across all 3 branches" -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Green
} catch {
    Write-Error "ERROR executing SQL seed: $_"
    exit 1
} finally {
    $env:PGPASSWORD = $null
}
