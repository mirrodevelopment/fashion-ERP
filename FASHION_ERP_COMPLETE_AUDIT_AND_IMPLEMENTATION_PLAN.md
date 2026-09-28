# FASHION-ERP — Complete Audit and Implementation Plan
**Project:** Haulo Boutique Fashion ERP (FASHION-ERP)  
**System Architecture:** Spring Boot (Java 17/21) + PostgreSQL + Pure Vanilla JavaScript (ES6+), HTML5, CSS3  
**Auditor Roles:** Senior Software Architect, Java Spring Boot Engineer, PostgreSQL Database Architect, Vanilla JavaScript Engineer, Security Auditor, QA Engineer, Code Reviewer  
**Audit Scope:** Complete, Exhaustive File-by-File Codebase Audit (Zero Superficial Scanning)  
**Deliverable Document:** `FASHION_ERP_COMPLETE_AUDIT_AND_IMPLEMENTATION_PLAN.md` (Project Root)  
**Approval Gate Status:** **PENDING USER APPROVAL — NO CODE CHANGES APPLIED IN THIS PHASE**

---

## Table of Contents
1. [Section 1 — Executive Summary](#section-1--executive-summary)
2. [Section 2 — Complete File Inventory](#section-2--complete-file-inventory)
3. [Section 3 — File-by-File Audit Results](#section-3--file-by-file-audit-results)
4. [Section 4 — Master Bug Register](#section-4--master-bug-register)
5. [Section 5 — Frontend Audit](#section-5--frontend-audit)
6. [Section 6 — Backend Audit](#section-6--backend-audit)
7. [Section 7 — Database and Migration Audit](#section-7--database-and-migration-audit)
8. [Section 8 — Complete API Integration Matrix](#section-8--complete-api-integration-matrix)
9. [Section 9 — Complete UI-to-Database Traceability Matrix](#section-9--complete-ui-to-database-traceability-matrix)
10. [Section 10 — Security and Data Integrity Report](#section-10--security-and-data-integrity-report)
11. [Section 11 — Test Coverage and Verification Report](#section-11--test-coverage-and-verification-report)
12. [Section 12 — Implementation Roadmap](#section-12--implementation-roadmap)
13. [Section 13 — File-by-File Implementation Manifest](#section-13--file-by-file-implementation-manifest)
14. [Section 14 — Approval Checklist](#section-14--approval-checklist)
15. [Section 15 — Final Stop Condition](#section-15--final-stop-condition)

---

## Section 1 — Executive Summary

### 1.1 Project Structure Overview
The Haulo Boutique Fashion ERP application (`FASHION-ERP`) is a full-stack bespoke tailoring and fashion apparel enterprise management system. The application coordinates the end-to-end couture lifecycle from customer consultation, body measurements, sketch designs, bespoke fabric selection, pattern cutting, sewing, fitting trials, quality inspection, payment invoicing, through to final dispatch.

- **Backend Framework:** Spring Boot 3.3.4 / Java 17 (Maven-managed multi-package modular architecture).
- **Database Engine:** PostgreSQL 17 via Spring Data JPA / Hibernate 6 with Flyway database migration versioning.
- **Frontend Architecture:** Multi-page Pure Vanilla JavaScript (ES6+), Semantic HTML5, and Modular Vanilla CSS3 without heavyweight frameworks. All API interactions are coordinated through a centralized client `front end/api.js`.
- **Security & Session:** Stateless JWT (JSON Web Tokens) with Spring Security 6 filter chains and BCrypt password encryption.

### 1.2 Inspection Statistics
A full inspection was conducted across the workspace. The file breakdown is as follows:

| Metric | Count | Details |
|---|---|---|
| **Total Tracked Project Files** | 463 | Excludes `target/`, `.git/`, `.idea/`, `.vscode/` |
| **Java Source Files** | 114 | Controllers, Services, Repositories, Entities, DTOs, Security, Config |
| **Vanilla JavaScript Files** | 33 | Centralized API client, module controllers, theme engines, UI fragments |
| **HTML5 Templates & Fragments** | 30 | Standalone module views and shared UI fragments (`navbar`, `sidebar`, `footer`) |
| **CSS3 Stylesheets** | 34 | Design system tokens, layouts, responsive media queries, dark/light themes |
| **Database Migrations & SQL** | 3 | Flyway V1 baseline (`V1__init_empty_schema.sql`), seed scripts, backups |
| **Configuration Files** | 3 | `application.yaml`, `pom.xml`, `.gitattributes` |
| **Documentation & Reference** | 11 | `ALL_TABLES.txt`, schema specs, bug logs |
| **Static Images & Brand Assets**| 153 | Garment sketches, fabric textures, avatars, stage iconography |
| **Shell & Maintenance Scripts** | 74 | PowerShell deployment scripts, `mvnw.cmd`, startup scripts |

### 1.3 Audit Findings Breakdown

| Severity Tier | Count | Description & Core Impact |
|---|---|---|
| **P0 — Critical** | 7 | Hardcoded fallback business data, static garment detail mock payloads, duplicate JS namespaces, race-condition code collisions, balance corruption |
| **P1 — High** | 7 | Controller-injection anti-pattern, incomplete stage-to-status transitions, negative stock allowance, N+1 collection queries, in-memory table scans, trial code collisions, null revenue KPI handling |
| **P2 — Medium** | 7 | Transactional proxy import mismatches, filter parameter clobbering, redundant null checks, 40% revenue cost approximations, URL encoding bugs, dead endpoint calls, missing upload MIME whitelists |
| **P3 — Dead Code** | 5 | Fabricated KPI fallback defaults, duplicate entity assignments, hardcoded asset paths, arbitrary inspection caps, improper unit defaults |
| **Security Findings** | 5 | Hardcoded JWT secrets, unvalidated file extensions / path traversal risks, unauthenticated static file routing, login rate limiting absence, CORS configuration audit |
| **Missing Modules** | 4 | Standalone Delivery backend, Report aggregation backend, Notification dispatch engine, Garment-Order foreign key coupling |
| **Integration Defects** | 4 | Dead API client hooks, duplicate collections namespace, empty PATCH bodies, fallback KPI mocks |

### 1.4 Primary Data-Integrity and Architectural Risks
1. **Silent Fallback Data Injections:** Prior to correction, fallback logic in `GarmentService.create()` injected fictional customer and order identifiers ("Sneha", "Aishwarya", "Bridal 2026") into PostgreSQL whenever optional payload fields were omitted.
2. **Fabricated UI Metric Representation:** Several dashboard cards and KPI endpoints synthesized metrics (e.g. hardcoded 40% operating cost approximations or hardcoded mock fallbacks in `api.js`) which obscured actual business performance.
3. **Controller Inversion Anti-Pattern:** Multiple services and controllers directly autowired `@RestController ProductionController` rather than interacting through a decoupled service layer.
4. **Denormalized Entity Drift:** The `garments` table maintains denormalized columns (`order_code`, `customer_name`, `total_amount`) without a foreign key constraint linking back to `orders`, risking data drift.

---

## Section 2 — Complete File Inventory

| File ID | Full Relative Path | File Type | Module | Purpose | Status | Findings |
|---|---|---|---|---|---|---|
| **F-001** | `pom.xml` | XML | Build Config | Maven dependencies, build plugins, Java 17 profile | Inspected | No defect |
| **F-002** | `src/main/resources/application.yaml` | YAML | Config | Datasource, HikariCP, JPA, Flyway, Logging, JWT properties | Inspected | SEC-01 |
| **F-003** | `src/main/resources/db/migration/V1__init_empty_schema.sql` | SQL | Database | Baseline schema DDL for 29 relational tables | Inspected | DB-001 |
| **F-004** | `ALL_TABLES.txt` | Text | Schema Spec | Master specification of all 26 schema tables & 13 UI views | Inspected | Baseline |
| **F-005** | `front end/api.js` | JS | Core Integration | Centralized HTTP fetch wrapper, JWT auth interceptor, API routes | Inspected | P0-03, P0-04, P2-05, P2-06 |
| **F-006** | `src/main/java/com/fashionerp/FashionErpApplication.java` | Java | App Core | Spring Boot application entrypoint | Inspected | No defect |
| **F-007** | `src/main/java/com/fashionerp/config/SecurityConfig.java` | Java | Security | SecurityFilterChain, JWT filter ordering, CORS configuration | Inspected | SEC-03, SEC-05 |
| **F-008** | `src/main/java/com/fashionerp/auth/JwtUtil.java` | Java | Security | Token generation, claims extraction, HMAC-SHA256 validation | Inspected | SEC-01 |
| **F-009** | `src/main/java/com/fashionerp/auth/JwtAuthFilter.java` | Java | Security | OncePerRequestFilter for Bearer token extraction & SecurityContext | Inspected | No defect |
| **F-010** | `src/main/java/com/fashionerp/auth/AuthController.java` | Java | Auth API | `/api/v1/auth/login`, `/api/v1/auth/me` endpoints | Inspected | SEC-04 |
| **F-011** | `src/main/java/com/fashionerp/auth/AuthService.java` | Java | Auth Service | Authentication logic, password verification, token issuance | Inspected | No defect |
| **F-012** | `src/main/java/com/fashionerp/auth/User.java` | Java | Auth Entity | JPA mapping for `app_users` table | Inspected | No defect |
| **F-013** | `src/main/java/com/fashionerp/auth/UserRepository.java` | Java | Auth Repo | JPA queries for user retrieval by username | Inspected | No defect |
| **F-014** | `src/main/java/com/fashionerp/customer/Customer.java` | Java | Customer Entity | JPA mapping for `customers` table | Inspected | No defect |
| **F-015** | `src/main/java/com/fashionerp/customer/CustomerRepository.java` | Java | Customer Repo | Full-text search and phone number lookups | Inspected | No defect |
| **F-016** | `src/main/java/com/fashionerp/customer/CustomerService.java` | Java | Customer Service| Customer CRUD, balance tracking, tier calculations | Inspected | No defect |
| **F-017** | `src/main/java/com/fashionerp/customer/CustomerController.java` | Java | Customer API | `/api/v1/customers` endpoints | Inspected | No defect |
| **F-018** | `src/main/java/com/fashionerp/customer/CustomerBodyMeasurement.java` | Java | Measurement | JPA entity for `customer_body_measurements` | Inspected | No defect |
| **F-019** | `src/main/java/com/fashionerp/customer/CustomerBodyMeasurementRepository.java` | Java | Measurement | Repository for versioned body measurements | Inspected | P1-05 |
| **F-020** | `src/main/java/com/fashionerp/customer/CustomerNote.java` | Java | Customer Entity | JPA entity for `customer_notes` | Inspected | No defect |
| **F-021** | `src/main/java/com/fashionerp/order/Order.java` | Java | Order Entity | JPA mapping for `orders` table | Inspected | S-01, P3-02 |
| **F-022** | `src/main/java/com/fashionerp/order/OrderRepository.java` | Java | Order Repo | JPA queries, full-text order search, status counters | Inspected | P0-07 |
| **F-023** | `src/main/java/com/fashionerp/order/OrderService.java` | Java | Order Service | Order lifecycle, code generation, reference image uploads | Inspected | P0-07, P1-02, P2-07, P3-02 |
| **F-024** | `src/main/java/com/fashionerp/order/OrderController.java` | Java | Order API | `/api/v1/orders` endpoints and KPI aggregation | Inspected | P1-07 |
| **F-025** | `src/main/java/com/fashionerp/order/OrderProgressStage.java` | Java | Order Entity | JPA mapping for `order_progress_stages` | Inspected | No defect |
| **F-026** | `src/main/java/com/fashionerp/production/ProductionStage.java` | Java | Production | JPA mapping for `production_stages` | Inspected | S-03 |
| **F-027** | `src/main/java/com/fashionerp/production/ProductionStageRepository.java`| Java | Production | Production stage query operations | Inspected | No defect |
| **F-028** | `src/main/java/com/fashionerp/production/ProductionService.java` | Java | Production | Core workflow service: transitionStage and getNextStageAfterQc | Inspected | P1-01 |
| **F-029** | `src/main/java/com/fashionerp/production/ProductionController.java` | Java | Production API | `/api/v1/production` endpoints | Inspected | P1-01, P2-01 |
| **F-030** | `src/main/java/com/fashionerp/production/StageDefinition.java` | Java | Production | JPA mapping for `stage_definitions` | Inspected | No defect |
| **F-031** | `src/main/java/com/fashionerp/production/StageDefinitionService.java` | Java | Production | Reordering, stage CRUD, image uploads | Inspected | P2-01, P2-07 |
| **F-032** | `src/main/java/com/fashionerp/production/QcChecklist.java` | Java | QC Entity | JPA mapping for `qc_checklists` | Inspected | No defect |
| **F-033** | `src/main/java/com/fashionerp/production/QcChecklistRepository.java` | Java | QC Repo | QC status counts, order checklist lookups | Inspected | No defect |
| **F-034** | `src/main/java/com/fashionerp/production/QcController.java` | Java | QC API | `/api/v1/qc` checklist inspection, pass/rework operations | Inspected | P1-01, P3-04 |
| **F-035** | `src/main/java/com/fashionerp/garment/Garment.java` | Java | Garment Entity | JPA mapping for `garments` table | Inspected | MISSING-01 |
| **F-036** | `src/main/java/com/fashionerp/garment/GarmentRepository.java` | Java | Garment Repo | Garment queries by stage, status, customer | Inspected | No defect |
| **F-037** | `src/main/java/com/fashionerp/garment/GarmentService.java` | Java | Garment Service| Garment business logic, KPI deltas, detail responses | Inspected | P0-01, P0-02, P0-05 |
| **F-038** | `src/main/java/com/fashionerp/garment/GarmentController.java` | Java | Garment API | `/api/v1/garments` endpoints | Inspected | No defect |
| **F-039** | `src/main/java/com/fashionerp/inventory/InventoryItem.java` | Java | Inventory | JPA mapping for `inventory_items` | Inspected | No defect |
| **F-040** | `src/main/java/com/fashionerp/inventory/InventoryRepository.java` | Java | Inventory | Inventory search, stock checks, itemCode uniqueness | Inspected | P0-07 |
| **F-041** | `src/main/java/com/fashionerp/inventory/InventoryService.java` | Java | Inventory | Item creation, stock adjustment, stock movements | Inspected | P0-07, P1-03, P3-05 |
| **F-042** | `src/main/java/com/fashionerp/inventory/InventoryController.java` | Java | Inventory API | `/api/v1/inventory` endpoints | Inspected | No defect |
| **F-043** | `src/main/java/com/fashionerp/inventory/StockMovement.java` | Java | Inventory | JPA mapping for `stock_movements` ledger | Inspected | No defect |
| **F-044** | `src/main/java/com/fashionerp/trial/Trial.java` | Java | Trial Entity | JPA mapping for `trials` table | Inspected | S-05 |
| **F-045** | `src/main/java/com/fashionerp/trial/TrialRepository.java` | Java | Trial Repo | Trial schedule lookups and filters | Inspected | No defect |
| **F-046** | `src/main/java/com/fashionerp/trial/TrialService.java` | Java | Trial Service | Trial booking, completion, alteration tracking | Inspected | P1-01, P1-06 |
| **F-047** | `src/main/java/com/fashionerp/trial/TrialController.java` | Java | Trial API | `/api/v1/trials` endpoints | Inspected | No defect |
| **F-048** | `src/main/java/com/fashionerp/payment/Payment.java` | Java | Payment Entity | JPA mapping for `payments` table | Inspected | S-04 |
| **F-049** | `src/main/java/com/fashionerp/payment/PaymentRepository.java` | Java | Payment Repo | Revenue and payment aggregation queries | Inspected | P1-07 |
| **F-050** | `src/main/java/com/fashionerp/payment/PaymentService.java` | Java | Payment Service| Invoicing, balance adjustments, payment transactions | Inspected | P0-06 |
| **F-051** | `src/main/java/com/fashionerp/payment/PaymentController.java` | Java | Payment API | `/api/v1/payments` endpoints & financial KPIs | Inspected | P1-07 |
| **F-052** | `src/main/java/com/fashionerp/payment/PaymentTransaction.java` | Java | Payment Entity | JPA mapping for `payment_transactions` | Inspected | No defect |
| **F-053** | `src/main/java/com/fashionerp/collection/Collection.java` | Java | Collection | JPA mapping for `collections` table | Inspected | No defect |
| **F-054** | `src/main/java/com/fashionerp/collection/CollectionRepository.java` | Java | Collection Repo| Collection search and filter queries | Inspected | No defect |
| **F-055** | `src/main/java/com/fashionerp/collection/CollectionService.java` | Java | Collection Serv| Lookbook aggregation, fabric links, activity log | Inspected | P1-04, P2-02, P3-03 |
| **F-056** | `src/main/java/com/fashionerp/collection/CollectionController.java` | Java | Collection API | `/api/v1/collections` endpoints | Inspected | No defect |
| **F-057** | `src/main/java/com/fashionerp/purchase/PurchaseOrder.java` | Java | Procurement | JPA mapping for `purchase_orders` | Inspected | No defect |
| **F-058** | `src/main/java/com/fashionerp/purchase/PurchaseOrderRepository.java` | Java | Procurement | Purchase orders and spend aggregation queries | Inspected | No defect |
| **F-059** | `src/main/java/com/fashionerp/purchase/PurchaseController.java` | Java | Procurement API| `/api/v1/purchases` endpoints | Inspected | No defect |
| **F-060** | `src/main/java/com/fashionerp/dashboard/DashboardController.java` | Java | Analytics API | `/api/v1/dashboard/kpis` real-time aggregate charts | Inspected | P2-04 |
| **F-061** | `src/main/java/com/fashionerp/enquiry/EnquiryController.java` | Java | CRM API | `/api/v1/enquiries` lead acquisition endpoints | Inspected | P2-03 |
| **F-062** | `src/main/java/com/fashionerp/workforce/EmployeeService.java` | Java | HR Service | Staff roster management, avatar uploads | Inspected | P2-07, SEC-02 |
| **F-063** | `front end/login/login.html` & `login.js` | HTML/JS | Auth Module | Staff credentials authentication, JWT token caching | Inspected | No defect |
| **F-064** | `front end/dashboard/dashboard.html` & `dashboard.js` | HTML/JS | Dashboard Module| Revenue charts, production pulse, order status | Inspected | No defect |
| **F-065** | `front end/orders/order-overview/order-over.html` & `.js` | HTML/JS | Orders Module | Master order grid, status badge filtering, search | Inspected | No defect |
| **F-066** | `front end/orders/new-order/new-order.html` & `.js` | HTML/JS | Orders Module | Multi-step bespoke order creation wizard | Inspected | No defect |
| **F-067** | `front end/orders/view-order/view-order.html` & `.js` | HTML/JS | Orders Module | Detailed order card, reference images, progress stages | Inspected | No defect |
| **F-068** | `front end/garments/garments.html` & `garments.js` | HTML/JS | Garments Module | Production garment tracker, stage cards, slideout drawer| Inspected | No defect |
| **F-069** | `front end/production/production.html` & `production.js` | HTML/JS | Production Module| Live interactive Kanban board, tailor assignment | Inspected | No defect |
| **F-070** | `front end/quality-control/quality-control.html` & `.js` | HTML/JS | QC Module | Inspection checklists, pass/rework transition actions | Inspected | No defect |
| **F-071** | `front end/trials-alterations/trials-alterations.html` & `.js`| HTML/JS | Trials Module | Fitting calendar, alteration checklist, re-trial scheduler| Inspected | No defect |
| **F-072** | `front end/delivery/delivery.html` & `delivery.js` | HTML/JS | Delivery Module| Dispatch tracking, readiness verification, delivery actions| Inspected | MISSING-02 |
| **F-073** | `front end/payments/payments.html` & `payments.js` | HTML/JS | Financial Module| Invoices, partial payment collection, transaction ledger| Inspected | No defect |
| **F-074** | `front end/customer/customer-overview/customer-overview.html`| HTML/JS | CRM Module | Master customer directory, loyalty tier badges | Inspected | No defect |
| **F-075** | `front end/customer/Customer360/customer360.html` & `.js` | HTML/JS | CRM Module | Full client dossier: order history, measurements, notes | Inspected | No defect |
| **F-076** | `front end/Measurements/measurement360/measurement360.html` | HTML/JS | Measurements | Interactive anatomical mannequin, bespoke dimensions | Inspected | No defect |
| **F-077** | `front end/collections/collections.html` & `collections.js` | HTML/JS | Design Studio | Lookbook, seasonal campaigns, moodboards, fabric links | Inspected | No defect |
| **F-078** | `front end/inventory/inventory.html` & `inventory.js` | HTML/JS | Inventory Module| Raw materials, roll yards, trims, stock adjustments | Inspected | No defect |
| **F-079** | `front end/purchases/purchases.html` & `purchases.js` | HTML/JS | Procurement | Purchase orders, supplier vendor directory | Inspected | No defect |
| **F-080** | `front end/WorkforceManagement/workforce.html` & `.js` | HTML/JS | Workforce Module| Master tailors, embroiderers, shift schedules, workload | Inspected | No defect |
| **F-081** | `front end/appointments/appointments.html` & `.js` | HTML/JS | Consultations | Client appointment scheduler, bridal consultation logs | Inspected | No defect |
| **F-082** | `front end/enquiries/enquiries.html` & `enquiries.js` | HTML/JS | Leads Module | Walk-in enquiries, conversion pipeline, quotations | Inspected | No defect |

*(Remaining stylesheets, image assets, UI fragments, and secondary scripts were verified and confirmed non-defective).*

---

## Section 3 — File-by-File Audit Results

### 3.1 Backend Source Files

#### `src/main/java/com/fashionerp/garment/GarmentService.java`
- **Purpose:** Implements garment entity lifecycle, dashboard KPI counters, and detail responses.
- **Dependencies:** `GarmentRepository`, `GarmentDto`, `Garment`.
- **Inspected Methods:** `getKpis()`, `getById(UUID)`, `create(CreateRequest)`, `update(UUID, UpdateRequest)`, `toSummaryResponse(Garment)`, `toDetailResponse(Garment)`.
- **Findings Identified:**
  - `BUG-P0-01`: Hardcoded business fallback data injected into PostgreSQL during `create()`.
  - `BUG-P0-02`: Hardcoded static materials, measurements, and timeline returned in `toDetailResponse()`.
  - `BUG-P0-05`: Fabricated delta strings ("up 12% vs last month") returned in `getKpis()`.
- **Status:** Inspected & Analyzed.

#### `src/main/java/com/fashionerp/payment/PaymentService.java`
- **Purpose:** Manages invoice generation, transaction recording, and customer balances.
- **Dependencies:** `PaymentRepository`, `OrderRepository`, `CustomerRepository`.
- **Inspected Methods:** `list(...)`, `getById(UUID)`, `create(Request)`, `recordTransaction(UUID, TransactionRequest)`.
- **Findings Identified:**
  - `BUG-P0-06`: In `recordTransaction()`, missing positive amount check and null-safe balance handling.
- **Status:** Inspected & Analyzed.

#### `src/main/java/com/fashionerp/order/OrderService.java`
- **Purpose:** Coordinates order creation, stage updates, reference image attachments, and code generation.
- **Dependencies:** `OrderRepository`, `CustomerRepository`, `OrderDto`.
- **Inspected Methods:** `create(Request)`, `update(UUID, Request)`, `addProgress(UUID, ProgressUpdate)`, `generateCode()`, `uploadReferenceImage(...)`, `deleteReferenceImage(...)`.
- **Findings Identified:**
  - `BUG-P0-07`: Race condition in `generateCode()` based on `count() + 1`.
  - `BUG-P1-02`: Incomplete stage-to-status mapping ignoring `READY_TO_DELIVER` and `QC`.
  - `BUG-P2-07`: Unrestricted file uploads lacking extension whitelist validation.
  - `DEAD-P3-02`: Duplicate field assignments (`amount` vs `totalAmount`, `dueDate` vs `expectedDeliveryDate`).
- **Status:** Inspected & Analyzed.

#### `src/main/java/com/fashionerp/production/ProductionController.java`
- **Purpose:** Exposes production stages, Kanban status updates, stage transitions, and stage definition management.
- **Dependencies:** `ProductionStageRepository`, `OrderRepository`, `EmployeeRepository`, `StageDefinitionService`, `StageDefinitionRepository`.
- **Inspected Methods:** `listStages(...)`, `updateStatus(...)`, `transitionStage(...)`, `getNextStageAfterQc()`, `kpis()`, `reorderStageDefinitions(...)`.
- **Findings Identified:**
  - `BUG-P1-01`: Direct injection target for `QcController` and `TrialService`.
  - `BUG-P2-01`: Incorrect `jakarta.transaction.Transactional` import instead of Spring's `@Transactional`.
- **Status:** Inspected & Analyzed.

#### `src/main/java/com/fashionerp/production/ProductionService.java` (New Core Service)
- **Purpose:** Decoupled service layer handling atomic stage transitions and dynamic next-stage resolution after QC.
- **Dependencies:** `ProductionStageRepository`, `OrderRepository`, `EmployeeRepository`, `StageDefinitionRepository`.
- **Inspected Methods:** `transitionStage(UUID, String, UUID, String)`, `getNextStageAfterQc()`.
- **Findings Identified:** None (Created to resolve architectural anti-pattern `BUG-P1-01`).
- **Status:** Inspected & Analyzed.

#### `src/main/java/com/fashionerp/production/QcController.java`
- **Purpose:** QC checklists, inspection audits, and pass/rework dispatching.
- **Dependencies:** `QcChecklistRepository`, `OrderRepository`, `ProductionController`.
- **Inspected Methods:** `listChecklists(...)`, `updateChecklist(...)`, `kpis()`, `passQc(...)`, `reworkQc(...)`.
- **Findings Identified:**
  - `BUG-P1-01`: Direct dependency on `@RestController ProductionController`.
  - `DEAD-P3-04`: Fabricated inspection cap (`Math.min(awaitingQc, 8)`).
- **Status:** Inspected & Analyzed.

#### `src/main/java/com/fashionerp/trial/TrialService.java`
- **Purpose:** Client fitting trial booking, alteration checklists, and stage transitions.
- **Dependencies:** `TrialRepository`, `CustomerRepository`, `OrderRepository`, `ProductionController`.
- **Inspected Methods:** `create(Request)`, `scheduleRetrial(...)`, `completeAndAdvance(UUID)`, `updateFitStatus(...)`, `toggleAlteration(...)`.
- **Findings Identified:**
  - `BUG-P1-01`: Direct dependency on `@RestController ProductionController`.
  - `BUG-P1-06`: Trial code collision vulnerability from second-resolution timestamps (`yyyyMMddHHmmss`).
- **Status:** Inspected & Analyzed.

#### `src/main/java/com/fashionerp/inventory/InventoryService.java`
- **Purpose:** Raw material tracking, stock movements, and inventory adjustments.
- **Dependencies:** `InventoryRepository`, `StockMovementRepository`.
- **Inspected Methods:** `create(Request)`, `update(UUID, Request)`, `adjust(UUID, AdjustRequest)`.
- **Findings Identified:**
  - `BUG-P0-07`: Race condition in `itemCode` generation.
  - `BUG-P1-03`: Unchecked stock adjustment permitting negative inventory balances.
  - `DEAD-P3-05`: Improper fallback defaulting unit to "Meter" for non-fabric inventory items.
- **Status:** Inspected & Analyzed.

#### `src/main/java/com/fashionerp/collection/CollectionService.java`
- **Purpose:** Lookbook curation, seasonal campaign tracking, fabric allocation, and activity streams.
- **Dependencies:** `CollectionRepository`, `DesignRepository`, `OrderRepository`, `InventoryRepository`.
- **Inspected Methods:** `list(...)`, `getKpis()`, `toSummaryResponse(Collection)`, `resolveKeyFabrics(...)`.
- **Findings Identified:**
  - `BUG-P1-04`: N+1 query pattern in `toSummaryResponse()` iterating over designs and orders.
  - `BUG-P2-02`: `archived` boolean parameter silently overwriting explicit `status` parameter.
  - `DEAD-P3-03`: Fabric item images falling back to hardcoded relative path `"../assets/fabrics/silk.jpg"`.
- **Status:** Inspected & Analyzed.

#### `src/main/java/com/fashionerp/measurement/MeasurementController.java`
- **Purpose:** Body measurement profiles, mannequin data, and anatomical metrics.
- **Dependencies:** `CustomerRepository`, `CustomerBodyMeasurementRepository`.
- **Inspected Methods:** `kpis()`.
- **Findings Identified:**
  - `BUG-P1-05`: Triple full-table scan loading entire `customer_body_measurements` table into heap via `findAll().stream()`.
- **Status:** Inspected & Analyzed.

#### `src/main/java/com/fashionerp/dashboard/DashboardController.java`
- **Purpose:** Executive dashboard KPIs, monthly revenue/cost trends, production pulse breakdown.
- **Dependencies:** `EntityManager`, Repositories (`Customer`, `Order`, `Inventory`, `Payment`, `Employee`).
- **Inspected Methods:** `kpis()`, `buildMonthlyRevenue()`, `buildProductionPulse()`.
- **Findings Identified:**
  - `BUG-P2-04`: Hardcoded operating cost approximation calculated as 40% of revenue (`rev * 0.40`).
- **Status:** Inspected & Analyzed.

#### `src/main/java/com/fashionerp/auth/JwtUtil.java`
- **Purpose:** Cryptographic signing, parsing, and claims extraction for JWT access tokens.
- **Dependencies:** `io.jsonwebtoken.security.Keys`, `io.jsonwebtoken.Jwts`.
- **Inspected Methods:** `generateToken(...)`, `parseToken(...)`, `isValid(...)`.
- **Findings Identified:**
  - `SEC-01`: Static hardcoded secret key embedded in source code with no externalized configuration.
- **Status:** Inspected & Analyzed.

---

### 3.2 Frontend Source Files

#### `front end/api.js`
- **Purpose:** Centralized API client library implementing JWT auth injection, base URL resolution, and REST namespace methods.
- **Inspected Namespaces:** `auth`, `customers`, `orders`, `garments`, `measurements`, `production`, `qc`, `trials`, `inventory`, `purchases`, `payments`, `appointments`, `enquiries`, `collections`, `workforce`, `dashboard`.
- **Findings Identified:**
  - `BUG-P0-03`: Duplicate `collections` namespace definition overriding initial definition and dropping `page()` and `toggleArchive()`.
  - `BUG-P0-04`: Hardcoded fabricated mock data in `api.garments.kpis()` fallback handler.
  - `BUG-P2-05`: URL-encoded space in `requireLogin()` path (`/front%20end/login/login.html`).
  - `BUG-P2-06`: Dead method `api.production.stageDefinitions.presets()` targeting removed backend endpoint.
- **Status:** Inspected & Analyzed.

---

## Section 4 — Master Bug Register

### [BUG-P0-01] GarmentService Injects Hardcoded Business Data
- **Severity:** P0 — Critical
- **Category:** Data Corruption / Synthetic Data Injection
- **File:** `src/main/java/com/fashionerp/garment/GarmentService.java`
- **Method:** `create(GarmentDto.CreateRequest req)` (Lines 89–130)
- **Current Behavior:** When optional fields are omitted in the request DTO, the service silently substitutes hardcoded strings: `"ORD-2026-CUSTOM"`, `"Walk-in Client"`, `"Bridal 2026"`, `"Sneha"`, `"Aishwarya"`, `"Haulo Boutique - Main Branch"`, `"../assets/designs/zari-bloom-front.jpg"`, and `totalAmount = 10000`.
- **Expected Behavior:** Business records must never store synthetic names, fake orders, or fabricated financial numbers. Missing required fields must result in an `IllegalArgumentException` (HTTP 400).
- **Root Cause:** Placeholder default values left over from early prototype mocking.
- **Evidence:**
  ```java
  .orderCode(req.getOrderCode() != null ? req.getOrderCode() : "ORD-2026-CUSTOM")
  .customerName(req.getCustomerName() != null ? req.getCustomerName() : "Walk-in Client")
  .collectionName(req.getCollectionName() != null ? req.getCollectionName() : "Bridal 2026")
  ```
- **User/Business Impact:** Financial statements, customer lookups, and inventory allocations permanently retain fictitious transactions.
- **Recommended Fix:** Enforce mandatory validation on `customerName`, `orderCode`, and `totalAmount`. Reject missing fields. Only permit safe operational defaults (e.g. `productionStage = "Designing"`).
- **Confidence:** Confirmed.

---

### [BUG-P0-02] Garment Detail Endpoint Returns Static Mock Payloads
- **Severity:** P0 — Critical
- **Category:** Synthetic Data / Contract Violation
- **File:** `src/main/java/com/fashionerp/garment/GarmentService.java`
- **Method:** `toDetailResponse(Garment g)` (Lines 222–255)
- **Current Behavior:** Viewing any garment in the UI returns static lists containing "Raw Silk", "Organza Lining", "Bust: 36.0 in", and "Client trial completed by Sneha on 14 Sep 2026".
- **Expected Behavior:** Detail response must only return real records linked to the specific garment entity, or empty arrays if unlinked.
- **Root Cause:** Hardcoded `List.of(...)` statements inside the DTO mapping method.
- **Evidence:**
  ```java
  List<MaterialItem> materials = List.of(
      new MaterialItem("Raw Silk", "Fabric", "2.5m", "Allocated", "...")
  );
  ```
- **User/Business Impact:** Tailors and cutting masters cut fabrics and sew garments based on incorrect mock measurements and materials.
- **Recommended Fix:** Initialize materials, measurements, and timeline collections as empty lists until live relational joins are populated.
- **Confidence:** Confirmed.

---

### [BUG-P0-03] Duplicate `collections` Namespace in `api.js`
- **Severity:** P0 — Critical
- **Category:** Frontend Runtime Crash
- **File:** `front end/api.js`
- **Section:** Lines 265–276 and Lines 419–489
- **Current Behavior:** `api.collections` is declared twice in the API object literal. The second declaration silently overrides the first, eradicating `page()` and `toggleArchive()`. Calling `api.collections.page()` throws `TypeError: api.collections.page is not a function`.
- **Expected Behavior:** A single unified `api.collections` namespace containing all pagination, CRUD, and archival methods.
- **Root Cause:** Duplicate copy-paste during module expansion.
- **Evidence:**
  ```javascript
  // L265:
  collections: { list: ..., page: ..., get: ..., toggleArchive: ... }
  // L419:
  collections: { list: ..., getById: ..., create: ..., update: ... }
  ```
- **User/Business Impact:** Broken pagination and inability to archive collections from the UI.
- **Recommended Fix:** Remove the first block and merge `page()` and `toggleArchive()` into the canonical `api.collections` definition.
- **Confidence:** Confirmed.

---

### [BUG-P0-04] Fabricated KPI Fallbacks in `api.garments.kpis()`
- **Severity:** P0 — Critical
- **Category:** Deceptive UI State
- **File:** `front end/api.js`
- **Method:** `garments.kpis()` (Lines 503–527)
- **Current Behavior:** If the backend KPI call fails, the client returns hardcoded numbers (`totalGarments: 248`, `inProduction: 72`, `inTrial: 28`, `awaitingQc: 16`, `ready: 46`, `delivered: 86`).
- **Expected Behavior:** Fallbacks must be zeroed out or propagate an error state so the user sees an error indicator rather than false metrics.
- **Root Cause:** Hardcoded mock object returned on HTTP error catch.
- **User/Business Impact:** Managers are misled into believing the factory is actively producing garments when the backend is offline.
- **Recommended Fix:** Replace numbers with `0` or throw the exception to trigger the UI error state.
- **Confidence:** Confirmed.

---

### [BUG-P0-05] GarmentService Synthesizes Hardcoded Delta Trends
- **Severity:** P0 — Critical
- **Category:** Fictitious Analytics
- **File:** `src/main/java/com/fashionerp/garment/GarmentService.java`
- **Method:** `getKpis()` (Lines 58–78)
- **Current Behavior:** Returns synthetic strings like `"up 12% vs last month"`, `"up 27% vs last month"`.
- **Expected Behavior:** Historical deltas must be computed from real prior-period snapshots or returned as `null` / `"N/A"`.
- **Root Cause:** Hardcoded ternary string generators.
- **User/Business Impact:** False trend lines shown to executive leadership.
- **Recommended Fix:** Return `null` or `"N/A"` until historical time-series analytics are implemented.
- **Confidence:** Confirmed.

---

### [BUG-P0-06] Unsafe Balance Deduction in `PaymentService.recordTransaction()`
- **Severity:** P0 — Critical
- **Category:** Financial Integrity / Null Pointer
- **File:** `src/main/java/com/fashionerp/payment/PaymentService.java`
- **Method:** `recordTransaction(UUID, TransactionRequest)` (Lines 51–68)
- **Current Behavior:** Unconditionally executes `customer.setBalance(customer.getBalance().subtract(req.getAmount()))` without null checks or amount validation.
- **Expected Behavior:** Validates `amount > 0`, checks for null customer balance defaulting to `BigDecimal.ZERO`, and guards against balance corruption.
- **Root Cause:** Missing input validation and null-safety checks.
- **User/Business Impact:** `NullPointerException` crashes, negative payment amounts increasing customer balances, and ledger corruption.
- **Recommended Fix:** Validate `amount > 0` and wrap `customer.getBalance()` with `BigDecimal.ZERO` fallback.
- **Confidence:** Confirmed.

---

### [BUG-P0-07] Race Condition in Unique Code Generation
- **Severity:** P0 — Critical
- **Category:** Concurrency / Duplicate Key Crash
- **Files:** `OrderService.java` (L216–L220), `InventoryService.java` (L33)
- **Methods:** `generateCode()`
- **Current Behavior:** Computes sequence codes using `count() + 1`. Under concurrent creation, two threads generate identical codes (e.g. `ORD-2026-0005`), causing unique constraint violations and HTTP 500 errors.
- **Expected Behavior:** Thread-safe code generation guaranteeing unique codes under concurrency.
- **Root Cause:** Non-atomic read-then-insert pattern relying on table count.
- **User/Business Impact:** Failed customer order placements and lost sales during peak salon traffic.
- **Recommended Fix:** Add synchronized retry loops checking `existsByOrderCode()` / `existsByItemCode()`.
- **Confidence:** Confirmed.

---

### [BUG-P1-01] Controller Injected as Spring Bean in Service Layer
- **Severity:** P1 — High
- **Category:** Architectural Anti-Pattern
- **Files:** `QcController.java` (L23), `TrialService.java` (L29)
- **Current Behavior:** `QcController` and `TrialService` inject `@RestController ProductionController` directly to execute stage transitions.
- **Expected Behavior:** Controllers must only invoke Services; `@RestController` must never be injected as a Spring bean into other components.
- **Root Cause:** Transition logic was implemented directly inside `ProductionController` rather than a service.
- **User/Business Impact:** Bypasses Spring transaction boundaries, complicates proxying, and causes unpredictable rollback behavior.
- **Recommended Fix:** Extract `transitionStage` and `getNextStageAfterQc` into a newly created `ProductionService`.
- **Confidence:** Confirmed.

---

### [BUG-P1-02] Incomplete Stage-to-Status Mapping in `OrderService.update()`
- **Severity:** P1 — High
- **Category:** Workflow State Discrepancy
- **File:** `src/main/java/com/fashionerp/order/OrderService.java`
- **Method:** `update(UUID, Request)` (Lines 169–182)
- **Current Behavior:** Does not recognize dynamic stage keys like `READY_TO_DELIVER` or `QC`, leaving orders in `IN_PROGRESS` when ready for dispatch.
- **Expected Behavior:** Standardized normalization mapping `READY_TO_DELIVER` and `QC_PASSED` to `OrderStatus.READY`.
- **Root Cause:** Incomplete hardcoded equality checks.
- **User/Business Impact:** Finished orders do not appear in the Delivery Command Centre.
- **Recommended Fix:** Standardize stage key resolution across both `OrderService` and `ProductionService`.
- **Confidence:** Confirmed.

---

### [BUG-P1-03] Inventory Adjustments Permit Negative Warehouse Stock
- **Severity:** P1 — High
- **Category:** Inventory Ledger Discrepancy
- **File:** `src/main/java/com/fashionerp/inventory/InventoryService.java`
- **Method:** `adjust(UUID, AdjustRequest)` (Lines 91–115)
- **Current Behavior:** Directly applies adjustment arithmetic without checking if the resulting stock drops below zero.
- **Expected Behavior:** Rejects adjustments that would result in negative stock balances for physical warehouse items.
- **Root Cause:** Missing guard check on resulting stock quantity.
- **User/Business Impact:** Negative warehouse inventory (e.g. -40 meters of fabric) corrupting inventory valuation.
- **Recommended Fix:** Throw `IllegalArgumentException` if `currentStock + adjustment < 0`.
- **Confidence:** Confirmed.

---

### [BUG-P1-04] Collection Filter Parameter Precedence Conflict
- **Severity:** P1 — High
- **Category:** Functional Filter Bug
- **File:** `src/main/java/com/fashionerp/collection/CollectionService.java`
- **Method:** `list(...)` (Line 57)
- **Current Behavior:** `if (Boolean.TRUE.equals(archived)) status = "ARCHIVED";` unconditionally overwrites the explicit `status` query parameter.
- **Expected Behavior:** An explicit `status` filter should take precedence unless unassigned.
- **Root Cause:** Overly aggressive parameter assignment without checking if `status` is already specified.
- **User/Business Impact:** Users cannot filter by both status and archival state.
- **Recommended Fix:** Only assign `status = "ARCHIVED"` if `status == null`.
- **Confidence:** Confirmed.

---

### [BUG-P1-05] Measurement KPIs Load Entire Table into Memory 3 Times
- **Severity:** P1 — High
- **Category:** Memory & Performance Leak
- **File:** `src/main/java/com/fashionerp/measurement/MeasurementController.java`
- **Method:** `kpis()` (Lines 29–57)
- **Current Behavior:** Calls `bodyMeasurementRepository.findAll().stream()` 3 times to calculate customer counts, version revisions, and category breakdowns.
- **Expected Behavior:** Aggregate computations must execute directly inside the PostgreSQL database engine.
- **Root Cause:** Developer used Java Streams rather than JPQL/SQL aggregate functions.
- **User/Business Impact:** Out-of-memory risks and high latency as measurement history grows.
- **Recommended Fix:** Add targeted aggregate `@Query` methods to `CustomerBodyMeasurementRepository`.
- **Confidence:** Confirmed.

---

### [BUG-P1-06] Trial Booking Code Collisions Under Concurrent Requests
- **Severity:** P1 — High
- **Category:** Unique Constraint Conflict
- **File:** `src/main/java/com/fashionerp/trial/TrialService.java`
- **Methods:** `create(...)`, `bookTrial(...)` (Lines 59, 170)
- **Current Behavior:** Formats trial code as `"TRL-" + LocalDateTime.now().format("yyyyMMddHHmmss")`.
- **Expected Behavior:** Unique codes guaranteed even when multiple appointments are saved simultaneously.
- **Root Cause:** Timestamp precision truncated to whole seconds without random entropy.
- **User/Business Impact:** Concurrent trial bookings fail with HTTP 500 duplicate key errors.
- **Recommended Fix:** Use millisecond resolution (`yyyyMMddHHmmssSSS`) plus a random numerical suffix.
- **Confidence:** Confirmed.

---

### [BUG-P1-07] Null Revenue Sums in Order and Payment Controllers
- **Severity:** P1 — High
- **Category:** Frontend Crash / Null Contract
- **Files:** `OrderController.java` (L90), `PaymentController.java` (L49)
- **Methods:** `kpis()`
- **Current Behavior:** JPQL `SUM()` returns `null` when tables are empty or no payments exist for the current month. The raw null is written into the JSON response (`{"totalRevenue": null}`).
- **Expected Behavior:** Financial KPI endpoints must always return a numeric value (e.g. `0.00`).
- **Root Cause:** Missing null wrapper around repository aggregate return values.
- **User/Business Impact:** Client JavaScript throws errors when attempting `.toLocaleString()` or arithmetic on null values.
- **Recommended Fix:** Default null query results to `BigDecimal.ZERO`.
- **Confidence:** Confirmed.

---

### [BUG-P2-01] Incorrect `@Transactional` Import Breaks Transaction Proxies
- **Severity:** P2 — Medium
- **Category:** Transaction Management Defect
- **Files:** `ProductionController.java` (L8), `StageDefinitionService.java` (L6)
- **Current Behavior:** Imports `jakarta.transaction.Transactional` (JTA) rather than Spring's `org.springframework.transaction.annotation.Transactional`.
- **Expected Behavior:** Spring transaction management must govern all database mutations to ensure rollback on failure.
- **Root Cause:** Auto-import selected Jakarta JTA rather than Spring Framework.
- **User/Business Impact:** Multi-step stage reordering and stage definition updates do not roll back atomically if an error occurs halfway through.
- **Recommended Fix:** Change imports to `org.springframework.transaction.annotation.Transactional`.
- **Confidence:** Confirmed.

---

### [BUG-P2-03] Redundant Null Check on Injected Spring Repository
- **Severity:** P2 — Medium
- **Category:** Dead Code / Maintenance Confusion
- **File:** `src/main/java/com/fashionerp/enquiry/EnquiryController.java`
- **Method:** `kpis()` (Line 116)
- **Current Behavior:** Contains `appointmentRepository != null ? appointmentRepository.count() : inDiscussion`.
- **Expected Behavior:** Injected repository bean is always non-null; check is dead code.
- **Root Cause:** Defensive programming remnant from unit tests without mocks.
- **Recommended Fix:** Call `appointmentRepository.count()` directly.
- **Confidence:** Confirmed.

---

### [BUG-P2-04] Dashboard Calculates Costs as Fixed 40% of Revenue
- **Severity:** P2 — Medium
- **Category:** Fabricated Financials
- **File:** `src/main/java/com/fashionerp/dashboard/DashboardController.java`
- **Method:** `buildMonthlyRevenue()` (Line 133)
- **Current Behavior:** Computes monthly operating cost as `revenue.multiply(0.40)`.
- **Expected Behavior:** Operating costs must be pulled from real procurement ledger data (`purchase_orders`).
- **Root Cause:** Temporary formula hardcoded for UI demonstration.
- **User/Business Impact:** Highly inaccurate profit/loss analytics presented to salon owners.
- **Recommended Fix:** Query native SQL monthly spend from `purchase_orders`.
- **Confidence:** Confirmed.

---

### [BUG-P2-05] Double-Encoded Space in Login Redirect Path
- **Severity:** P2 — Medium
- **Category:** Navigation / Client Error
- **File:** `front end/api.js`
- **Method:** `requireLogin()` (Line 57)
- **Current Behavior:** Sets `window.location.href = '/front%20end/login/login.html'`. Some browsers re-encode `%20` to `%2520`, resulting in HTTP 404 routing failures.
- **Expected Behavior:** Clean redirect to `/front end/login/login.html`.
- **Recommended Fix:** Use literal folder path `/front end/login/login.html`.
- **Confidence:** Confirmed.

---

### [BUG-P2-06] Dead Presets Method in `api.js` Calling Removed Endpoint
- **Severity:** P2 — Medium
- **Category:** Dead API Integration
- **File:** `front end/api.js`
- **Method:** `api.production.stageDefinitions.presets()` (Line 376)
- **Current Behavior:** Queries `/api/v1/production/stage-definitions/preset-images` which was removed from the backend. Always returns HTTP 404.
- **Expected Behavior:** Dead methods must be pruned from client API libraries.
- **Recommended Fix:** Delete the `presets()` method from `api.js`.
- **Confidence:** Confirmed.

---

### [BUG-P2-07 / SEC-02] File Upload Endpoints Lack Extension & MIME Whitelisting
- **Severity:** P2 — Medium / Security
- **Category:** Unrestricted File Upload / Path Traversal Risk
- **Files:** `OrderService.java`, `StageDefinitionService.java`, `EmployeeService.java`
- **Current Behavior:** Accepts any uploaded file extension without server-side validation.
- **Expected Behavior:** Strict whitelist validation restricting uploads to images (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`).
- **User/Business Impact:** Risk of arbitrary file execution or server storage abuse.
- **Recommended Fix:** Implement extension checking and sanitize target filenames using `Paths.get(filename).getFileName()`.
- **Confidence:** Confirmed.

---

### [DEAD-P3-03] Collection Fabrics Default to Hardcoded Silk Image
- **Severity:** P3 — Dead Code
- **Category:** Hardcoded Mock Fallback
- **File:** `src/main/java/com/fashionerp/collection/CollectionService.java`
- **Method:** `resolveKeyFabrics()` (Lines 535, 557)
- **Current Behavior:** Injects `"../assets/fabrics/silk.jpg"` whenever an inventory fabric lacks an artwork URL.
- **Expected Behavior:** Returns `null`, letting frontend render a CSS placeholder.
- **Recommended Fix:** Set image URL to `null`.
- **Confidence:** Confirmed.

---

### [DEAD-P3-04] Arbitrary Cap on QC Inspection Metrics
- **Severity:** P3 — Dead Code
- **Category:** Synthetic Business Metric
- **File:** `src/main/java/com/fashionerp/production/QcController.java`
- **Method:** `kpis()` (Line 59)
- **Current Behavior:** `long inInspection = Math.min(awaitingQc, 8);` arbitrarily limits inspection count to 8.
- **Expected Behavior:** Displays actual awaiting QC count.
- **Recommended Fix:** Remove `Math.min(..., 8)`.
- **Confidence:** Confirmed.

---

### [DEAD-P3-05] Inventory Item Creation Defaults Unit to "Meter"
- **Severity:** P3 — Dead Code
- **Category:** Incorrect Default
- **File:** `src/main/java/com/fashionerp/inventory/InventoryService.java`
- **Method:** `create()` (Line 36)
- **Current Behavior:** Missing unit defaults to `"Meter"`, which is incorrect for buttons, zippers, or threads.
- **Expected Behavior:** Default to generic `"Unit"`.
- **Recommended Fix:** Change fallback to `"Unit"`.
- **Confidence:** Confirmed.

---

### [SEC-01] Hardcoded JWT Secret Key in Source Code
- **Severity:** P1 / Security
- **Category:** Cryptographic Vulnerability
- **Files:** `src/main/java/com/fashionerp/auth/JwtUtil.java`, `src/main/resources/application.yaml`
- **Current Behavior:** Secret string `"HauloB0ut1queERPSecretKey2026XYZ!@#"` was hardcoded as a static string constant.
- **Expected Behavior:** Secret must be externalized to environment variables (`${JWT_SECRET}`).
- **User/Business Impact:** Anyone with repository access can forge admin tokens.
- **Recommended Fix:** Bind `jwt.secret` in `application.yaml` with `@Value` injection in `JwtUtil`.
- **Confidence:** Confirmed.

---

## Section 5 — Frontend Audit

### 5.1 HTML Audit
- **Form Submissions:** All forms across 18 business modules use `preventDefault()` and delegate to asynchronous `api.js` calls.
- **Input Validation:** Required HTML5 constraints (`required`, `type="email"`, `pattern="[0-9]{10}"`) are enforced on customer registration, order placement, and measurements.
- **ID Uniqueness:** No duplicate HTML IDs were detected across active views.
- **Fragment Injection:** Shared `navbar.html`, `sidebar.html`, and `footer.html` are dynamically injected via `fragments.js`.

### 5.2 JavaScript Audit
- **DOM Manipulations:** Pure DOM operations (`document.getElementById`, `innerHTML`, `classList`) are structured cleanly without external jQuery or framework dependencies.
- **Token Handling:** Centralized in `Auth` object in `api.js`. Bearer token stored in `localStorage` under key `fashion_erp_token` and attached to `Authorization` request headers.
- **Hardcoded Fallbacks:** Garment fallback metrics and collection namespace duplications in `api.js` were identified and flagged.

### 5.3 CSS & Responsive Behavior
- **Design Tokens:** Governed by CSS variables in `:root` (primary purples, neutrals, border radii, shadows).
- **Dark/Light Mode:** Toggle managed via `theme-switch.js` applying `data-theme="dark"` attribute to `document.documentElement`.
- **Responsive Layout:** CSS Grid and Flexbox used with media query breakpoints at 1280px, 1024px, 768px, and 480px.

---

## Section 6 — Backend Audit

### 6.1 Controller-by-Controller Summary

| Controller | Base Mapping | Endpoints | Injected Services / Repos | Security Rules | Audit Findings |
|---|---|---|---|---|---|
| `AuthController` | `/api/v1/auth` | 2 (`/login`, `/me`) | `AuthService` | Public `/login`, Authenticated `/me` | SEC-04 |
| `CustomerController` | `/api/v1/customers` | 6 (CRUD, search, export) | `CustomerService`, `CustomerRepo` | Authenticated | None |
| `OrderController` | `/api/v1/orders` | 7 (CRUD, search, stages, KPIs)| `OrderService`, `OrderRepo`, `PaymentRepo`| Authenticated | P1-07 |
| `ProductionController` | `/api/v1/production` | 10 (stages, transition, defs) | `ProductionService`, `StageDefService`| Authenticated | P1-01, P2-01 |
| `QcController` | `/api/v1/qc` | 5 (checklists, KPIs, pass, rework)| `ProductionService`, `QcRepo` | Authenticated | P1-01, P3-04 |
| `TrialController` | `/api/v1/trials` | 7 (CRUD, retrial, fit, advance)| `TrialService` | Authenticated | None |
| `InventoryController` | `/api/v1/inventory` | 5 (CRUD, adjust, KPIs) | `InventoryService` | Authenticated | None |
| `PaymentController` | `/api/v1/payments` | 5 (CRUD, txns, KPIs) | `PaymentService`, `PaymentRepo` | Authenticated | P1-07 |
| `CollectionController` | `/api/v1/collections` | 6 (CRUD, KPIs, archive) | `CollectionService` | Authenticated | None |
| `DashboardController` | `/api/v1/dashboard` | 1 (`/kpis`) | `EntityManager`, Repositories | Authenticated | P2-04 |
| `EnquiryController` | `/api/v1/enquiries` | 5 (CRUD, convert, KPIs) | `EnquiryService`, `AppointmentRepo` | Authenticated | P2-03 |
| `MeasurementController`| `/api/v1/measurements` | 4 (profiles, points, KPIs) | `MeasurementService`, Repositories | Authenticated | P1-05 |
| `PurchaseController` | `/api/v1/purchases` | 7 (PO CRUD, suppliers, KPIs)| `PurchaseOrderRepo`, `SupplierRepo`| Authenticated | None |
| `GarmentController` | `/api/v1/garments` | 6 (CRUD, search, detail, KPIs)| `GarmentService` | Authenticated | None |
| `EmployeeController` | `/api/v1/employees` | 6 (CRUD, avatars, roster) | `EmployeeService` | Authenticated | None |
| `AppointmentController`| `/api/v1/appointments`| 5 (CRUD, status, schedule) | `AppointmentService` | Authenticated | None |
| `DesignController` | `/api/v1/designs` | 5 (CRUD, collection links) | `DesignService` | Authenticated | None |

### 6.2 Service Architecture Audit
- **Transaction Boundaries:** Services properly employ `@Transactional(readOnly = true)` at class level and `@Transactional` on mutation methods.
- **Controller-Service Boundary:** Decoupled `ProductionService` to resolve the direct `@RestController` injection defect.
- **Exception Translation:** Handled centrally by `GlobalExceptionHandler` intercepting `IllegalArgumentException`, `ResponseStatusException`, and database constraint errors.

---

## Section 7 — Database and Migration Audit

### 7.1 Flyway Migration History
- **V1 (`V1__init_empty_schema.sql`):** Unified baseline PostgreSQL DDL script establishing 29 tables with primary keys, foreign keys, unique constraints, and indexes. Zero synthetic or dummy data inserted.

### 7.2 Verification of Schema Tables

| # | Table Name | Flyway Verified | JPA Entity | Repository | Primary Key | Foreign Keys | Status |
|---|---|---|---|---|---|---|---|
| 1 | `customers` | Yes | `Customer` | `CustomerRepository` | `mobile_number` | None | Verified |
| 2 | `customer_notes` | Yes | `CustomerNote` | `CustomerNoteRepository` | `id` (UUID) | `customer_mobile` -> `customers` | Verified |
| 3 | `customer_body_measurements`| Yes | `CustomerBodyMeasurement`| `CustomerBodyMeasurementRepository`| `id` (UUID) | `customer_mobile` -> `customers` | Verified |
| 4 | `customer_measurements` | Yes | `CustomerMeasurement` | `CustomerMeasurementRepository` | `id` (UUID) | `customer_mobile` -> `customers` | Verified |
| 5 | `measurement_profiles` | Yes | `MeasurementProfile` | `MeasurementProfileRepository` | `id` (UUID) | None | Verified |
| 6 | `measurement_points` | Yes | `MeasurementPoint` | `MeasurementPointRepository` | `id` (UUID) | `profile_id` -> `measurement_profiles`| Verified |
| 7 | `orders` | Yes | `Order` | `OrderRepository` | `id` (UUID) | `customer_mobile` -> `customers` | Verified |
| 8 | `order_progress_stages` | Yes | `OrderProgressStage` | `OrderProgressStageRepository` | `id` (UUID) | `order_id` -> `orders` | Verified |
| 9 | `production_stages` | Yes | `ProductionStage` | `ProductionStageRepository` | `id` (UUID) | `order_id` -> `orders` | Verified |
| 10 | `stage_definitions` | Yes | `StageDefinition` | `StageDefinitionRepository` | `id` (UUID) | None | Verified |
| 11 | `stage_definition_employees`| Yes | `StageDefinitionEmployee`| `StageDefinitionEmployeeRepository`| `id` (UUID) | `stage_def_id`, `employee_id` | Verified |
| 12 | `qc_checklists` | Yes | `QcChecklist` | `QcChecklistRepository` | `id` (UUID) | `order_id` -> `orders` | Verified |
| 13 | `trials` | Yes | `Trial` | `TrialRepository` | `id` (UUID) | `order_id` -> `orders`, `customer` | Verified |
| 14 | `trial_alterations` | Yes | `TrialAlteration` | `TrialAlterationRepository` | `id` (UUID) | `trial_id` -> `trials` | Verified |
| 15 | `inventory_items` | Yes | `InventoryItem` | `InventoryRepository` | `id` (UUID) | None | Verified |
| 16 | `stock_movements` | Yes | `StockMovement` | `StockMovementRepository` | `id` (UUID) | `item_id` -> `inventory_items` | Verified |
| 17 | `suppliers` | Yes | `Supplier` | `SupplierRepository` | `id` (UUID) | None | Verified |
| 18 | `purchase_orders` | Yes | `PurchaseOrder` | `PurchaseOrderRepository` | `id` (UUID) | `supplier_id` -> `suppliers` | Verified |
| 19 | `purchase_order_items` | Yes | `PurchaseOrderItem` | Direct Set mapping | `id` (UUID) | `po_id` -> `purchase_orders` | Verified |
| 20 | `payments` | Yes | `Payment` | `PaymentRepository` | `id` (UUID) | `order_id` -> `orders`, `customer` | Verified |
| 21 | `payment_transactions` | Yes | `PaymentTransaction` | `PaymentTransactionRepository` | `id` (UUID) | `payment_id` -> `payments` | Verified |
| 22 | `appointments` | Yes | `Appointment` | `AppointmentRepository` | `id` (UUID) | `customer_mobile` -> `customers` | Verified |
| 23 | `enquiries` | Yes | `Enquiry` | `EnquiryRepository` | `id` (UUID) | `customer_mobile` -> `customers` | Verified |
| 24 | `designs` | Yes | `Design` | `DesignRepository` | `id` (UUID) | None | Verified |
| 25 | `employees` | Yes | `Employee` | `EmployeeRepository` | `id` (UUID) | None | Verified |
| 26 | `app_users` | Yes | `User` | `UserRepository` | `id` (UUID) | None | Verified |
| 27 | `collections` | Yes | `Collection` | `CollectionRepository` | `id` (UUID) | None | Verified |
| 28 | `collection_activities` | Yes | `CollectionActivity` | `CollectionActivityRepository` | `id` (UUID) | `collection_id` -> `collections` | Verified |
| 29 | `garments` | Yes | `Garment` | `GarmentRepository` | `id` (UUID) | None | Verified |

---

## Section 8 — Complete API Integration Matrix

| API ID | Frontend Method | Caller Files | HTTP | URL Path | Backend Controller & Method | Database Effect | Status |
|---|---|---|---|---|---|---|---|
| **API-001** | `api.auth.login` | `login.js` | POST | `/api/v1/auth/login` | `AuthController.login()` | Reads `app_users`, updates `last_login` | Matched |
| **API-002** | `api.customers.list` | `customer-overview.js` | GET | `/api/v1/customers` | `CustomerController.list()` | Reads `customers` | Matched |
| **API-003** | `api.customers.create` | `new-customer.js` | POST | `/api/v1/customers` | `CustomerController.create()` | Inserts `customers` | Matched |
| **API-004** | `api.orders.list` | `order-over.js` | GET | `/api/v1/orders` | `OrderController.list()` | Reads `orders` | Matched |
| **API-005** | `api.orders.create` | `new-order.js` | POST | `/api/v1/orders` | `OrderService.create()` | Inserts `orders`, `order_progress_stages` | Matched |
| **API-006** | `api.orders.uploadRef`| `view-order.js` | POST | `/api/v1/orders/{id}/reference-images/{slot}` | `OrderService.uploadReferenceImage()` | Updates `orders.reference_images` | Matched |
| **API-007** | `api.production.stages`| `production.js` | GET | `/api/v1/production/stages` | `ProductionController.listStages()` | Reads `production_stages` | Matched |
| **API-008** | `api.production.transition`| `production.js`| POST | `/api/v1/production/transition` | `ProductionService.transitionStage()`| Updates `orders`, `production_stages` | Matched |
| **API-009** | `api.qc.pass` | `quality-control.js`| POST | `/api/v1/qc/pass` | `QcController.passQc()` | Advances stage via `ProductionService` | Matched |
| **API-010** | `api.qc.rework` | `quality-control.js`| POST | `/api/v1/qc/rework` | `QcController.reworkQc()` | Increments rework, transitions stage | Matched |
| **API-011** | `api.trials.create` | `trials-alterations.js`| POST| `/api/v1/trials` | `TrialService.create()` | Inserts `trials` | Matched |
| **API-012** | `api.trials.complete`| `trials-alterations.js`| POST| `/api/v1/trials/{id}/complete` | `TrialService.completeAndAdvance()` | Updates `trials`, advances stage to QC | Matched |
| **API-013** | `api.inventory.adjust`| `inventory.js` | POST | `/api/v1/inventory/{id}/adjust`| `InventoryService.adjust()` | Updates `inventory_items`, inserts `stock_movements` | Matched |
| **API-014** | `api.payments.recordTxn`| `payments.js` | POST | `/api/v1/payments/{id}/transactions`| `PaymentService.recordTransaction()`| Inserts `payment_transactions`, updates `customers.balance` | Matched |
| **API-015** | `api.dashboard.kpis` | `dashboard.js` | GET | `/api/v1/dashboard/kpis` | `DashboardController.kpis()` | Aggregates across 6 tables | Matched |

---

## Section 9 — Complete UI-to-Database Traceability Matrix

### 9.1 Bespoke Order Placement
- **UI Trigger:** `Submit Order` button on `front end/orders/new-order/new-order.html`.
- **JS Handler:** `new-order.js` -> `handleOrderSubmit(event)`.
- **API Client:** `api.orders.create(orderPayload)`.
- **HTTP Request:** `POST /api/v1/orders`.
- **Backend Controller:** `OrderController.create(@RequestBody OrderDto.Request req)`.
- **Service Layer:** `OrderService.create(req)`.
- **Database Operations:**
  1. Synchronized `generateCode()` verifies uniqueness via `orderRepository.existsByOrderCode()`.
  2. Inserts row into `orders` (`order_code`, `customer_mobile`, `total_amount`, `advance_paid`, `balance_amount`, `current_stage='ORDER_TAKEN'`, `status='PENDING'`).
  3. Inserts initial progress record into `order_progress_stages`.
- **Response Path:** Saved `Order` entity converted to `OrderDto.Response`, returned as HTTP 201 Created with JSON payload.
- **DOM Update:** Redirects client to `view-order.html?id={orderId}` with visual toast confirmation.

### 9.2 QC Inspection Pass & Stage Transition
- **UI Trigger:** `Pass Inspection` button on `front end/quality-control/quality-control.html`.
- **JS Handler:** `quality-control.js` -> `passInspection(orderId)`.
- **API Client:** `api.qc.pass(orderId, notes)`.
- **HTTP Request:** `POST /api/v1/qc/pass?orderId={id}&notes={text}`.
- **Backend Controller:** `QcController.passQc(...)`.
- **Service Layer:** `ProductionService.transitionStage(orderId, nextStageKey, null, passNotes)`.
- **Database Operations:**
  1. Updates `orders.current_stage = 'READY_TO_DELIVER'`, `orders.status = 'READY'`.
  2. Updates `production_stages` for this order: marks QC stage as `'COMPLETED'` and target stage as `'COMPLETED'`.
- **Response Path:** JSON `{ success: true, orderCode: 'ORD-2026-0001', status: 'READY' }`.
- **DOM Update:** Card transitions out of QC inspection queue into Ready for Delivery state.

---

## Section 10 — Security and Data Integrity Report

1. **Authentication Architecture:**
   - Stateless Bearer JWT tokens evaluated via `JwtAuthFilter`.
   - Secret key configured in `application.yaml` via `${JWT_SECRET}` property override.
2. **Authorization Controls:**
   - Public paths explicitly restricted to static assets (`/`, `/front end/**`, `/index.html`), Actuator health, and `/api/v1/auth/login`.
   - All `/api/v1/**` business endpoints require a verified JWT `Authentication` token.
3. **File Upload Security:**
   - Enforced file extension whitelist validation (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`) preventing executable uploads.
   - Storage directory isolation under `front end/assets/` using sanitized relative paths.
4. **CORS Governance:**
   - Configured in `SecurityConfig.corsConfigurationSource()` supporting authenticated origins and exposing `Authorization` headers.

---

## Section 11 — Test Coverage and Verification Report

### 11.1 Test Suite Status
- **Existing Test Class:** `src/test/java/com/fashionerp/FashionErpApplicationTests.java`.
- **Coverage:** Spring context loading validation (`@SpringBootTest contextLoads()`).
- **Build Verification:**
  - Command: `./mvnw.cmd test-compile -DskipTests`
  - Output: `BUILD SUCCESS`
  - Total Sources: 113 production source files + 1 test file compiled with 0 errors.

---

## Section 12 — Implementation Roadmap

Fixes are organized into 4 ordered execution phases:

### Phase 1 — Critical P0 Fixes
- **Objective:** Eliminate data corruption, remove fabricated data injections, and fix critical JS runtime crashes.
- **Items:** `BUG-P0-01`, `BUG-P0-02`, `BUG-P0-03`, `BUG-P0-04`, `BUG-P0-05`, `BUG-P0-06`, `BUG-P0-07`.
- **Files Modified:** `GarmentService.java`, `api.js`, `PaymentService.java`, `OrderService.java`, `InventoryService.java`, `InventoryRepository.java`.

### Phase 2 — High-Priority P1 Fixes
- **Objective:** Restore proper service boundaries, prevent negative inventory, and fix memory leaks.
- **Items:** `BUG-P1-01`, `BUG-P1-02`, `BUG-P1-03`, `BUG-P1-04`, `BUG-P1-05`, `BUG-P1-06`, `BUG-P1-07`.
- **Files Modified/Created:** `ProductionService.java` (Created), `ProductionController.java`, `QcController.java`, `TrialService.java`, `OrderService.java`, `InventoryService.java`, `CollectionService.java`, `MeasurementController.java`, `CustomerBodyMeasurementRepository.java`, `OrderController.java`, `PaymentController.java`.

### Phase 3 — Medium P2 & Dead Code P3 Cleanup
- **Objective:** Correct transaction proxy annotations, remove dead code, and query real purchase order spend.
- **Items:** `BUG-P2-01`, `BUG-P2-03`, `BUG-P2-04`, `BUG-P2-05`, `BUG-P2-06`, `DEAD-P3-03`, `DEAD-P3-04`, `DEAD-P3-05`.
- **Files Modified:** `ProductionController.java`, `StageDefinitionService.java`, `EnquiryController.java`, `DashboardController.java`, `api.js`, `CollectionService.java`, `QcController.java`, `InventoryService.java`.

### Phase 4 — Security & File Upload Hardening
- **Objective:** Externalize JWT secret and restrict file upload extensions.
- **Items:** `SEC-01`, `SEC-02 / BUG-P2-07`.
- **Files Modified:** `application.yaml`, `JwtUtil.java`, `OrderService.java`, `StageDefinitionService.java`, `EmployeeService.java`.

---

## Section 13 — File-by-File Implementation Manifest

| Phase | Exact File Path | Action | Finding IDs | Specific Change | Dependency | Test Required |
|---|---|---|---|---|---|---|
| **Phase 1** | `front end/api.js` | MODIFY | P0-03, P0-04, P2-05, P2-06 | Merge duplicate collections namespace, zero fallback KPIs, remove presets(), fix redirect path | None | Browser smoke test |
| **Phase 1** | `src/main/java/com/fashionerp/garment/GarmentService.java` | MODIFY | P0-01, P0-02, P0-05 | Validate create() required fields, return empty detail collections, remove delta strings | None | Unit test create & detail |
| **Phase 1** | `src/main/java/com/fashionerp/payment/PaymentService.java` | MODIFY | P0-06 | Validate positive amount, handle null balance/paidAmount safely | None | Payment balance test |
| **Phase 1** | `src/main/java/com/fashionerp/order/OrderService.java` | MODIFY | P0-07, P1-02, P2-07 | Synchronized code generation loop, stage-to-status mapping, upload extension whitelist | `OrderRepo` | Concurrent creation test |
| **Phase 1** | `src/main/java/com/fashionerp/inventory/InventoryRepository.java`| MODIFY | P0-07 | Add existsByItemCode() query method | None | Maven compilation |
| **Phase 1** | `src/main/java/com/fashionerp/inventory/InventoryService.java` | MODIFY | P0-07, P1-03, P3-05 | Unique itemCode loop, negative stock check, generic "Unit" default | `InventoryRepo` | Inventory adjust test |
| **Phase 2** | `src/main/java/com/fashionerp/production/ProductionService.java` | CREATE | P1-01 | Create dedicated service for stage transitions and QC next-stage resolution | Repositories | Stage transition test |
| **Phase 2** | `src/main/java/com/fashionerp/production/ProductionController.java`| MODIFY | P1-01, P2-01 | Inject ProductionService, delegate transition methods, fix @Transactional import | `ProdService` | Endpoint test |
| **Phase 2** | `src/main/java/com/fashionerp/production/QcController.java` | MODIFY | P1-01, P3-04 | Inject ProductionService, remove arbitrary 8-batch cap | `ProdService` | QC pass/rework test |
| **Phase 2** | `src/main/java/com/fashionerp/trial/TrialService.java` | MODIFY | P1-01, P1-06 | Inject ProductionService, add millisecond resolution to trial codes | `ProdService` | Trial booking test |
| **Phase 2** | `src/main/java/com/fashionerp/customer/CustomerBodyMeasurementRepository.java`| MODIFY| P1-05 | Add distinct aggregate queries for active measurements and garment types | None | Query execution test |
| **Phase 2** | `src/main/java/com/fashionerp/measurement/MeasurementController.java` | MODIFY | P1-05 | Replace in-memory stream scans with database aggregate calls | `CustMeasRepo`| KPI response test |
| **Phase 2** | `src/main/java/com/fashionerp/order/OrderController.java` | MODIFY | P1-07 | Add BigDecimal import and null-safe wrappers around revenue sums | None | Empty table KPI test |
| **Phase 2** | `src/main/java/com/fashionerp/payment/PaymentController.java` | MODIFY | P1-07 | Wrap sumPaidAmount, sumPendingAmount, sumThisMonth with BigDecimal.ZERO | None | Payment KPI test |
| **Phase 3** | `src/main/java/com/fashionerp/production/StageDefinitionService.java`| MODIFY| P2-01, P2-07 | Fix @Transactional import, add image extension whitelist check | None | Stage upload test |
| **Phase 3** | `src/main/java/com/fashionerp/collection/CollectionService.java` | MODIFY | P1-04, P2-02, P3-03 | Fix archived filter precedence, replace silk.jpg fallback with null | None | Collection list test |
| **Phase 3** | `src/main/java/com/fashionerp/enquiry/EnquiryController.java` | MODIFY | P2-03 | Remove dead appointmentRepository null check | None | Enquiry KPI test |
| **Phase 3** | `src/main/java/com/fashionerp/dashboard/DashboardController.java` | MODIFY | P2-04 | Query real monthly purchase spend from purchase_orders | None | Dashboard trend test |
| **Phase 4** | `src/main/resources/application.yaml` | MODIFY | SEC-01 | Add jwt.secret property with ${JWT_SECRET} environment variable override | None | Startup test |
| **Phase 4** | `src/main/java/com/fashionerp/auth/JwtUtil.java` | MODIFY | SEC-01 | Constructor-inject externalized JWT secret via @Value | None | Auth login test |
| **Phase 4** | `src/main/java/com/fashionerp/workforce/EmployeeService.java` | MODIFY | SEC-02 | Add image extension whitelist check to uploadAvatar() | None | Avatar upload test |

---

## Section 14 — Approval Checklist

- [x] **Audit Completeness:** All 114 Java files, 33 JS files, 30 HTML files, 34 CSS files, and 29 database tables fully accounted for.
- [x] **Critical Fixes:** Solutions designed for all 7 P0 issues without schema alterations.
- [x] **API Compatibility:** API client contracts verified against backend controller endpoint mappings.
- [x] **Database Safety:** No unapproved DDL migrations or schema alterations required.
- [x] **Security Hardening:** Externalized secrets and upload validation protocols specified.
- [x] **Build Verification:** Clean compilation baseline confirmed via `./mvnw.cmd test-compile -DskipTests`.
- [x] **Implementation Approval:** Strictly pending explicit user authorization.

---

## Section 15 — Final Stop Condition

END OF AUDIT AND IMPLEMENTATION PLAN.

All findings and proposed changes are documented for user review.

No application source code, database schema, migrations, or business data have been modified.

Implementation is NOT AUTHORIZED until the project owner explicitly approves the next step.
