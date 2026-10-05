# Haulo Boutique Fashion ERP — Database Data Purge Implementation File

**Document Version:** 1.0.0  
**Target Environment:** Local / Staging / Production  
**Database Name:** `fashion_erp` (PostgreSQL 17 on `localhost:5432`)  
**Associated Scripts:**  
- SQL Script: [`src/main/resources/db/empty_all_data_except_login.sql`](file:///d:/fashion%20ERP/FASHION-ERP/src/main/resources/db/empty_all_data_except_login.sql)  
- PowerShell Runner: [`src/main/resources/db/run_db_wipe.ps1`](file:///d:/fashion%20ERP/FASHION-ERP/src/main/resources/db/run_db_wipe.ps1)

---

## 1. Executive Summary & Objective

The objective of this implementation is to provide a safe, idempotent, and complete database purge solution for the **Haulo Boutique Fashion ERP** system. 

The procedure wipes **all operational, business, and transactional data rows** across all functional areas of the ERP, leaving the entire relational schema intact with empty tables ready for fresh, real-world data entry.

### Preserved Elements (Zero Disruption)
1. **Schema Integrity:** All 30 table definitions, column types, foreign keys, indexes, triggers, and constraints remain 100% unaltered.
2. **Flyway Migration History:** The `flyway_schema_history` table is completely untouched, guaranteeing that Flyway and Spring Boot will not attempt to re-run past migrations or raise checksum mismatches.
3. **Hibernate Compliance:** Since `application.yaml` specifies `spring.jpa.hibernate.ddl-auto: validate`, empty tables pass validation seamlessly without warnings or startup failures.
4. **Administrative Login:** The primary `admin` user in `app_users` is preserved with active status and password `Admin@123`.
5. **Core System Stages:** The two mandatory production boundary stages (`ORDER_TAKEN` with `sort_order = 1` and `READY_TO_DELIVER` with `sort_order = 2`) in `stage_definitions` are preserved and verified.

---

## 2. Table-by-Table Scope & Classification

The `fashion_erp` database consists of **30 tables**. Below is the exhaustive classification of every table and how it is handled:

### 2.1 Fully Wiped Tables (27 Tables — `TRUNCATE ... RESTART IDENTITY CASCADE`)

| Category | Table Name | Purpose / Contents Wiped |
| :--- | :--- | :--- |
| **Appointments & Trials** | `appointments` | Customer fittings, consultations, bridal appointments |
| | `trial_alterations` | Alteration notes, adjustments, tailor tasks from trials |
| | `trials` | Trial records, trial statuses, fitting observations |
| **Collections & Designs** | `collection_activities`| Collection changelogs, launch events, audits |
| | `collections` | Seasonal collections, lookbooks, categories |
| | `designs` | Custom sketches, design specifications, fabrics assigned |
| | `garments` | Garment pieces, patterns, style references |
| **Customers & Measurements** | `customer_body_measurements` | Detailed anthropometric parameters (chest, waist, etc.) |
| | `customer_measurements` | Measurement sessions and historical logs |
| | `customer_notes` | Private notes, style preferences, VIP tags |
| | `customers` | Customer profiles, contact details, addresses |
| **Employees & Staff** | `employees` | Staff roster, tailors, pattern masters, supervisors |
| **Enquiries & Leads** | `enquiries` | Walk-in enquiries, online requests, lead statuses |
| **Inventory & Purchasing** | `inventory_items` | Fabrics, buttons, threads, trims, packaging materials |
| | `stock_movements` | Stock in, stock out, consumption, adjustments |
| | `purchase_order_items` | Line items on supplier purchase orders |
| | `purchase_orders` | Supplier POs, payment terms, delivery dates |
| | `suppliers` | Fabric mills, trim vendors, vendor profiles |
| **Measurement Templates**| `measurement_points` | Specific anatomical points on profiles |
| | `measurement_profiles` | Standard measurement profiles (Blouse, Kurti, Gown) |
| **Orders & Payments** | `order_progress_stages` | Per-order workflow history and tracking |
| | `orders` | Sales orders, bespoke bookings, delivery deadlines |
| | `payment_transactions` | Gateway logs, receipt numbers, refund transactions |
| | `payments` | Customer payment entries, advances, balances |
| **Production & QC** | `production_stages` | Production floor jobs assigned to tailors |
| | `qc_checklists` | Quality checks, seam tests, defect inspections |
| **Stage Assignments** | `stage_definition_employees`| Staff mappings to production stages |

---

### 2.2 Partially Cleaned & Preserved Tables (2 Tables)

#### 1. `stage_definitions`
- **Action:** All custom, user-defined intermediate stages are removed (`DELETE FROM stage_definitions WHERE stage_key NOT IN ('ORDER_TAKEN', 'READY_TO_DELIVER')`).
- **Preserved:**
  - `ORDER_TAKEN` (Intake stage, `sort_order: 1`, role: `STAFF`)
  - `READY_TO_DELIVER` (Completion stage, `sort_order: 2`, role: `SUPERVISOR`)
- **Idempotency:** An `ON CONFLICT (stage_key) DO UPDATE` block ensures that these two stages always have the correct labels, sort orders, and active states.

#### 2. `app_users`
- **Action:** All temporary or secondary test users are purged (`DELETE FROM app_users WHERE username != 'admin'`).
- **Preserved:**
  - `admin` user is guaranteed to exist with BCrypt hash `$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy` (`Admin@123`), role `ADMIN`, and `active = true`.

---

### 2.3 Untouched Tables (1 Table)

#### 1. `flyway_schema_history`
- **Action:** **Untouched / Skipped.**
- **Reason:** Flyway relies on this table to track database schema versions. Keeping it intact prevents Spring Boot from throwing checksum or baseline errors during application startup.

---

## 3. How to Execute the Purge

Choose any of the following three execution methods based on your preference:

### Method 1: Automated PowerShell Runner (Recommended)

A dedicated PowerShell script has been created with safety prompts, automatic PostgreSQL tool detection, and pre-wipe backup support.

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd "d:\fashion ERP\FASHION-ERP"
   ```
2. Execute the runner:
   ```powershell
   .\src\main\resources\db\run_db_wipe.ps1
   ```
3. Type `CONFIRM` when prompted.
4. **Options:**
   - To bypass the confirmation prompt: `.\run_db_wipe.ps1 -Force`
   - To skip the pre-wipe backup: `.\run_db_wipe.ps1 -Force -SkipBackup`

---

### Method 2: PostgreSQL CLI (`psql`)

If running directly from the command line:

```powershell
$env:PGPASSWORD = "crazy@8"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5432 -U postgres -d fashion_erp -f "d:\fashion ERP\FASHION-ERP\src\main\resources\db\empty_all_data_except_login.sql"
$env:PGPASSWORD = $null
```

---

### Method 3: pgAdmin 4 or DBeaver / Navicat

1. Open **pgAdmin 4** (or your preferred database IDE) and connect to the `fashion_erp` database.
2. Open the **Query Tool**.
3. Open or paste the contents of:  
   [`src/main/resources/db/empty_all_data_except_login.sql`](file:///d:/fashion%20ERP/FASHION-ERP/src/main/resources/db/empty_all_data_except_login.sql)
4. Click **Execute / Run (F5)**.
5. Review the verification output table returned in the Data Output pane.

---

## 4. Verification & Post-Purge Checks

The SQL script includes Section 4 which automatically executes verification counts across every table. The expected output is:

| Table | Expected Row Count | Status |
| :--- | :--- | :--- |
| `appointments` | 0 | Cleared |
| `collection_activities` | 0 | Cleared |
| `collections` | 0 | Cleared |
| `customer_body_measurements` | 0 | Cleared |
| `customer_measurements` | 0 | Cleared |
| `customer_notes` | 0 | Cleared |
| `customers` | 0 | Cleared |
| `designs` | 0 | Cleared |
| `employees` | 0 | Cleared |
| `enquiries` | 0 | Cleared |
| `garments` | 0 | Cleared |
| `inventory_items` | 0 | Cleared |
| `measurement_points` | 0 | Cleared |
| `measurement_profiles` | 0 | Cleared |
| `order_progress_stages` | 0 | Cleared |
| `orders` | 0 | Cleared |
| `payment_transactions` | 0 | Cleared |
| `payments` | 0 | Cleared |
| `production_stages` | 0 | Cleared |
| `purchase_order_items` | 0 | Cleared |
| `purchase_orders` | 0 | Cleared |
| `qc_checklists` | 0 | Cleared |
| `stage_definition_employees` | 0 | Cleared |
| `stock_movements` | 0 | Cleared |
| `suppliers` | 0 | Cleared |
| `trial_alterations` | 0 | Cleared |
| `trials` | 0 | Cleared |
| **`app_users`** | **1** | **Preserved (`admin`)** |
| **`stage_definitions`** | **2** | **Preserved (`ORDER_TAKEN`, `READY_TO_DELIVER`)** |

---

## 5. Post-Purge System State

Once the script completes:
1. **Application Login:** Log in using `admin` / `Admin@123`.
2. **Production Stages:** The Production Room will display the two foundational stages:
   - Stage 1: **Order Taken**
   - Stage 2: **Ready to Deliver**
   New custom departments/stages can be created dynamically via the Production Room configuration.
3. **Transactional Modules:** All modules (Orders, Customers, Measurements, Inventory, Appointments, Enquiries, Quality Control) will start with clean, empty views with zero dummy or orphan records.
4. **Restart Sequences:** Next auto-incrementing serial IDs will start back from 1.
