<#
.SYNOPSIS
    Haulo Boutique ERP - Database Data Purge Runner
.DESCRIPTION
    Safely executes the empty_all_data_except_login.sql script against the fashion_erp PostgreSQL database.
    Wipes all operational & business data while keeping all table structures, constraints, indexes,
    Flyway schema history, the admin user, and the two mandatory stage definitions (ORDER_TAKEN, READY_TO_DELIVER).
.PARAMETER Force
    Skips the confirmation prompt.
.PARAMETER SkipBackup
    Skips creating an automatic pre-wipe backup dump.
.EXAMPLE
    .\run_db_wipe.ps1
.EXAMPLE
    .\run_db_wipe.ps1 -Force -SkipBackup
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
Write-Host " HAULO BOUTIQUE ERP - DATABASE DATA PURGE RUNNER" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Target Database : $DbName on $DbHost`:$DbPort"
Write-Host "Database User   : $DbUser"
Write-Host "Wipe Script     : empty_all_data_except_login.sql"
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
$SqlFile = Join-Path $ScriptDir "empty_all_data_except_login.sql"

if (-not (Test-Path $SqlFile)) {
    # Fallback to repo root relative path
    $SqlFile = "d:\fashion ERP\FASHION-ERP\src\main\resources\db\empty_all_data_except_login.sql"
}

if (-not (Test-Path $SqlFile)) {
    Write-Error "ERROR: SQL wipe script not found at: $SqlFile"
    exit 1
}

Write-Host "[OK] SQL script located: $SqlFile" -ForegroundColor Green

# 3. Confirmation prompt
if (-not $Force) {
    Write-Host "`nWARNING: This will permanently delete all customer, order, payment," -ForegroundColor Yellow
    Write-Host "inventory, employee, design, and measurement records." -ForegroundColor Yellow
    Write-Host "Table schemas, Flyway history, and Admin credentials will be preserved." -ForegroundColor Yellow
    Write-Host ""
    $confirmation = Read-Host "Are you sure you want to purge all data? (Type 'CONFIRM' to proceed)"
    if ($confirmation -ne "CONFIRM") {
        Write-Host "Operation aborted by user. No data was changed." -ForegroundColor Yellow
        exit 0
    }
}

$env:PGPASSWORD = $DbPass

# 4. Optional Pre-wipe Backup
if (-not $SkipBackup -and $PgDumpPath) {
    try {
        $BackupDir = "d:\fashion ERP\FASHION-ERP\backups"
        if (-not (Test-Path $BackupDir)) {
            New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        }
        $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $BackupFile = Join-Path $BackupDir "fashion_erp_pre_purge_$Timestamp.sql"
        Write-Host "`nCreating safety backup before purge..." -ForegroundColor Cyan
        & "$PgDumpPath" -h $DbHost -p $DbPort -U $DbUser -d $DbName -F p -f "$BackupFile"
        Write-Host "[OK] Backup created successfully: $BackupFile" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to create backup: $_. Continuing with wipe as requested..."
    }
}

# 5. Execute Wipe Script
Write-Host "`nExecuting purge script..." -ForegroundColor Cyan
try {
    $output = & "$PsqlPath" -h $DbHost -p $DbPort -U $DbUser -d $DbName -f "$SqlFile" 2>&1
    Write-Host $output
    Write-Host "`n=================================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] DATABASE PURGE COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host " All operational data wiped, tables empty, sequences reset." -ForegroundColor Green
    Write-Host " Admin account preserved: admin / Admin@123" -ForegroundColor Green
    Write-Host " System stages preserved : ORDER_TAKEN, READY_TO_DELIVER" -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Green
} catch {
    Write-Error "ERROR executing SQL wipe: $_"
    exit 1
} finally {
    $env:PGPASSWORD = $null
}
