# Haulo Boutique Fashion ERP — Customer & Order Data Implementation File

**Document Version:** 1.0.0  
**Target Environment:** Local / Staging / Production  
**Database:** `fashion_erp` (PostgreSQL 17 on `localhost:5432`)  
**Associated SQL Script:** [`src/main/resources/db/seed_kavya_and_sivasurya.sql`](file:///d:/fashion%20ERP/FASHION-ERP/src/main/resources/db/seed_kavya_and_sivasurya.sql)  
**Execution Status:** Executed and Verified  

---

## 1. Executive Summary

This implementation document details the creation and population of **two complete, high-fidelity customer profiles** along with **three comprehensive bespoke orders each (6 total orders)** for the Haulo Boutique Fashion ERP system.

Every record is fully relational, connecting customer data, complete 34-point tailoring body measurements, active measurement templates, order workflow stages, garment tracker items, quality inspections, fitting trials, and double-entry payment transactions with exact ledger reconciliation.

### Data Scope Overview

| Metric | Kavya Sree S | Sivasurya S | Total / Combined |
| :--- | :--- | :--- | :--- |
| **Mobile Number** | `+91 98401 54321` | `+91 98402 67890` | 2 Customers |
| **VIP Tier** | `VIP_GOLD` | `VIP_PLATINUM` | Haute Couture Clients |
| **Total Spend** | ₹95,000.00 | ₹123,500.00 | **₹218,500.00** |
| **Total Paid** | ₹65,500.00 | ₹91,000.00 | **₹156,500.00** |
| **Balance Due** | ₹29,500.00 | ₹32,500.00 | **₹62,000.00** |
| **Credit Limit** | ₹100,000.00 | ₹150,000.00 | Pre-approved credit |
| **Orders Populated** | 3 Orders | 3 Orders | **6 Orders** |
| **Garments Populated** | 3 Garments | 3 Garments | **6 Garments** |
| **Payment Records** | 3 Parents | 3 Parents | **6 Payments** |
| **Payment Transactions** | 5 Transactions | 5 Transactions | **10 Transactions** |
| **34-Point Measurements** | Complete Profile | Complete Profile | **2 Records** |
| **Measurement Points** | 8 Key Points | 8 Key Points | **16 Points** |
| **Order Progress Steps** | 11 Milestones | 10 Milestones | **21 Stage Logs** |
| **Fitting Trials** | 1 Completed Trial | 1 Completed Trial | **2 Trials** |

---

## 2. Customer Dossiers

### 2.1 Customer 1: Kavya Sree S (`+91 98401 54321`)

* **Full Name:** Kavya Sree S
* **Salutation & Gender:** Ms. / Female
* **Email:** `kavyasree.s@fashionerp.com`
* **Alternative Phone:** `+91 98409 11223`
* **Instagram Handle:** `@kavyasree_couture`
* **Preferred Channel:** `WhatsApp`
* **Date of Birth:** 14 Aug 1996
* **Location:** T. Nagar, Chennai
* **Address:** Plot 14, 2nd Avenue, Panagal Park Road, Chennai, Tamil Nadu — 600017
* **Landmark:** Near GRT Jewellers
* **Customer Tier:** `VIP_GOLD`
* **Favorite Garment:** Bridal Kanjeevaram Silk Saree Blouse & Lehenga
* **Fit Preference:** Snug Contoured Fit
* **Fabric Allergies:** Synthetic polyester lining allergy (*strict 100% mulmul cotton lining only*)
* **Preferred Neckline:** Sweetheart Neckline with Scallop Zari Edge
* **Preferred Sleeve:** Elbow Length with Maggam Work
* **Preferred Occasions:** Engagement, Muhurtham & Reception
* **Delivery Preference:** Store Pickup & Atelier Trial
* **Atelier Notes:** VIP Bridal client for upcoming winter wedding. Prefers antique copper-gold zari embellishments and deep backs with handmade pearl doris.

---

### 2.2 Customer 2: Sivasurya S (`+91 98402 67890`)

* **Full Name:** Sivasurya S
* **Salutation & Gender:** Mr. / Male
* **Email:** `sivasurya.s@fashionerp.com`
* **Alternative Phone:** `+91 98408 22334`
* **Instagram Handle:** `@sivasurya_official`
* **Preferred Channel:** `WhatsApp`
* **Date of Birth:** 20 Apr 1993
* **Location:** Alwarpet, Chennai
* **Address:** 45/2, TTK Road, Near Music Academy, Chennai, Tamil Nadu — 600018
* **Landmark:** Opposite Park Sheraton Circle
* **Customer Tier:** `VIP_PLATINUM`
* **Favorite Garment:** Royal Jodhpuri Bandhgala & Raw Silk Sherwani
* **Fit Preference:** Structured Italian Tailored Fit
* **Fabric Allergies:** None reported (*prefers 100% Bemberg cupro lining*)
* **Preferred Neckline:** Mandarin Collar with Concealed Placket (Height: 1.75")
* **Preferred Sleeve:** Full Sleeve with Working Surgeon Cuffs
* **Preferred Occasions:** Weddings, Galas & Award Ceremonies
* **Delivery Preference:** VIP Home Delivery
* **Atelier Notes:** Groom attire order for grand palace wedding. High attention to shoulder canvassing, bespoke horn buttons, and monogrammed initials (`SS`) inside breast pocket.

---

## 3. Complete 34-Point Anthropometric Measurements

Both customers have complete 34-point tailoring data stored in `customer_body_measurements`, plus standard active profiles in `customer_measurements` and granular markers in `measurement_points`.

| Point # | Anatomical Tailoring Measurement | Kavya Sree S (Inches) | Sivasurya S (Inches) | Measurement Application |
| :---: | :--- | :---: | :---: | :--- |
| **1** | **Shoulder Width** | 14.50" | 18.00" | Yoke balance & shoulder seam placement |
| **2** | **Bust / Chest Round** | 35.00" | 40.00" | Primary circumference across apex |
| **3** | **Under Bust Round** | 30.50" | 36.50" | Blouse ribcage band / rib suppression |
| **4** | **Natural Waist** | 28.00" | 33.00" | Waistband anchorage & suppression |
| **5** | **Full Hip Round** | 38.00" | 41.00" | Kalidar skirt flare & trouser seat |
| **6** | **Blouse / Vest Length** | 14.50" | 0.00" | Upper torso crop length |
| **7** | **Top / Jacket Length** | 25.50" | 44.00" | Anarkali yoke / Sherwani coat length |
| **8** | **Full Garment Length** | 54.00" | 44.00" | Floor clearance calculation |
| **9** | **Skirt Length** | 41.50" | 0.00" | Floor distance wearing wedding heels |
| **10** | **Pant / Trouser Length** | 37.00" | 41.50" | Outseam including waistband |
| **11** | **Armhole Circumference** | 16.00" | 19.00" | Scye depth and sleeve scye comfort |
| **12** | **Upper Arm (Bicep)** | 11.50" | 14.00" | Sleeve bicep circumference |
| **13** | **Sleeve Length** | 11.00" | 25.50" | Crown to cuff edge |
| **14** | **Sleeve Round** | 10.00" | 11.50" | Sleeve hem opening |
| **15** | **Elbow Round** | 9.00" | 12.50" | Elbow flexion point |
| **16** | **Wrist Round** | 5.50" | 7.00" | Cuff button clearance |
| **17** | **Front Neck Depth** | 7.50" | 3.50" | Front neckline plunge / collar height |
| **18** | **Back Neck Depth** | 10.50" | 1.50" | Back plunge (Dori supported) / Collar |
| **19** | **Bust Point (Apex)** | 9.50" | 11.00" | Shoulder to apex vertical distance |
| **20** | **Apex to Apex (Bust Distance)**| 7.25" | 8.50" | Horizontal dart placement |
| **21** | **Shoulder to Bust** | 9.75" | 10.50" | Diagonal chest drape |
| **22** | **Shoulder to Waist** | 14.00" | 17.50" | Front waist length |
| **23** | **Front Across Chest** | 13.00" | 15.50" | Armhole front span |
| **24** | **Back Across Shoulder** | 13.50" | 16.50" | Back armhole span |
| **25** | **Trouser Waist** | 29.00" | 34.00" | Trouser waistband position |
| **26** | **Trouser Hip** | 39.00" | 41.50" | Trouser seat ease |
| **27** | **Thigh Round** | 21.50" | 24.00" | Upper thigh circumference |
| **28** | **Knee Round** | 14.50" | 17.00" | Knee articulation point |
| **29** | **Calf Round** | 13.00" | 15.00" | Churidar taper point |
| **30** | **Ankle Round** | 8.50" | 10.50" | Ankle opening circumference |
| **31** | **Crotch Length (Rise)** | 25.50" | 27.50" | Total rise front to back |
| **32** | **Bottom Opening** | 13.50" | 14.50" | Trouser hem opening |
| **33** | **Waist to Hip Height** | 8.00" | 8.50" | Natural waist to high-hip drop |
| **34** | **Skirt / Silhouette Flare** | 120.00" | 0.00" | Full hem circumference (3.05 meters) |

---

## 4. Comprehensive Orders & Payments Breakdown

### 4.1 Orders for Kavya Sree S (3 Orders)

#### Order 1: `ORD-2026-0101` — Royal Muhurtham Silk Saree Blouse
- **Garment & Collection:** Blouse | *Heritage Temple Silks 2026*
- **Description:** Bespoke Temple Red Kanjeevaram Silk Blouse with heavy Peacock Zardozi & Maggam needlework, padded cups, deep back with pearl doris.
- **Order Date:** 22 days ago | **Delivered Date:** 5 days ago
- **Status / Stage:** `DELIVERED` | `READY_TO_DELIVER`
- **Total Amount:** **₹18,500.00**
- **Advance Paid:** **₹18,500.00**
- **Balance Due:** **₹0.00** (`FULLY_PAID`)
- **Payment Transactions:**
  1. `₹10,000.00` via **UPI** (`UPI/2026/KV-98401-01`) on order date (Booking advance).
  2. `₹8,500.00` via **CARD** (`CARD-AUTH-9821-KV`) 5 days ago (Final handover settlement).
- **Fitting Trial (`TRL-2026-0101`):** Conducted 7 days ago. Rated 5/5 stars ("*Absolute perfection! The neckline sits exactly where I dreamed.*").
- **Garment ID:** `GAR-2026-0101` | Status: `COMPLETED`

#### Order 2: `ORD-2026-0102` — Velvet Flora Sangeet Kalidar Lehenga
- **Garment & Collection:** Lehenga | *Royal Wedding Traditions 2026*
- **Description:** 16-Kali Emerald Green Micro-Velvet Sangeet Lehenga with floral nakshi zardozi border, can-can skirt layer, matching crop blouse and net dupatta.
- **Order Date:** 12 days ago | **Due Date:** 6 days from now
- **Status / Stage:** `IN_PROGRESS` | `STITCHING`
- **Total Amount:** **₹52,000.00**
- **Advance Paid:** **₹35,000.00**
- **Balance Due:** **₹17,000.00** (`PARTIAL`)
- **Payment Transactions:**
  1. `₹25,000.00` via **BANK_TRANSFER** (`NEFT/HDFC/2026/88412-KV`) 12 days ago (50% booking deposit).
  2. `₹10,000.00` via **UPI** (`UPI/2026/KV-SANGEET-02`) 4 days ago (Embroidery milestone).
- **Garment ID:** `GAR-2026-0102` | Status: `IN_PRODUCTION`

#### Order 3: `ORD-2026-0103` — Pastel Organza Cocktail Anarkali Gown
- **Garment & Collection:** Anarkali | *Modern Pastels Atelier 2026*
- **Description:** Blush Pink Pure Organza Floor-Length Anarkali Gown with pearl and sequin yoke embellishments, crepe silk churidar and scalloped sheer dupatta.
- **Order Date:** 2 days ago | **Due Date:** 14 days from now
- **Status / Stage:** `PENDING` | `ORDER_TAKEN`
- **Total Amount:** **₹24,500.00**
- **Advance Paid:** **₹12,000.00**
- **Balance Due:** **₹12,500.00** (`PARTIAL`)
- **Payment Transactions:**
  1. `₹12,000.00` via **UPI** (`UPI/2026/KV-ANARKALI-01`) 2 days ago (Booking deposit).
- **Garment ID:** `GAR-2026-0103` | Status: `IN_PRODUCTION`

---

### 4.2 Orders for Sivasurya S (3 Orders)

#### Order 4: `ORD-2026-0201` — Imperial Ivory Silk Sherwani Set
- **Garment & Collection:** Sherwani | *Royal Wedding Traditions 2026*
- **Description:** Imperial Raw Silk Ivory Wedding Sherwani with antique gold thread tonal dabka work, French velvet safa, churidar and handloom tissue stole.
- **Order Date:** 14 days ago | **Due Date:** 8 days from now
- **Status / Stage:** `IN_PROGRESS` | `EMBROIDERY`
- **Total Amount:** **₹68,000.00**
- **Advance Paid:** **₹45,000.00**
- **Balance Due:** **₹23,000.00** (`PARTIAL`)
- **Payment Transactions:**
  1. `₹30,000.00` via **CARD** (`CARD-AUTH-SS-010`) 14 days ago (Booking deposit).
  2. `₹15,000.00` via **UPI** (`UPI/2026/SS-SHERWANI-02`) 6 days ago (Artisan milestone).
- **Garment ID:** `GAR-2026-0201` | Status: `IN_PRODUCTION`

#### Order 5: `ORD-2026-0202` — Midnight Blue Velvet Bandhgala Suit
- **Garment & Collection:** Bandhgala | *Bespoke Suiting 2026*
- **Description:** Midnight Blue Italian Silk Velvet Jodhpuri Bandhgala with handcrafted brass lion crest buttons, matching slim-fit trousers and satin pocket square.
- **Order Date:** 18 days ago | **Due Date:** Tomorrow
- **Status / Stage:** `READY` | `READY_TO_DELIVER`
- **Total Amount:** **₹36,000.00**
- **Advance Paid:** **₹36,000.00**
- **Balance Due:** **₹0.00** (`FULLY_PAID`)
- **Payment Transactions:**
  1. `₹20,000.00` via **UPI** (`UPI/2026/SS-BANDHGALA-01`) 18 days ago (Initial deposit).
  2. `₹16,000.00` via **CARD** (`CARD-AUTH-SS-022`) 1 day ago (Pre-handover balance).
- **Fitting Trial (`TRL-2026-0202`):** Conducted 2 days ago. Rated 5/5 stars ("*The fit is razor sharp. Shoulders feel comfortable and athletic.*").
- **Garment ID:** `GAR-2026-0202` | Status: `IN_PRODUCTION` (Ready for handover)

#### Order 6: `ORD-2026-0203` — Classic Khadi Silk Kurta & Nehru Jacket Set
- **Garment & Collection:** Kurta Set | *Festive Heritage 2026*
- **Description:** Tussar Silk Textured Mustard Yellow Kurta with hand-quilted Bundi Nehru Jacket, horn buttons and relaxed linen pyjama trousers.
- **Order Date:** 1 day ago | **Due Date:** 10 days from now
- **Status / Stage:** `PENDING` | `ORDER_TAKEN`
- **Total Amount:** **₹19,500.00**
- **Advance Paid:** **₹10,000.00**
- **Balance Due:** **₹9,500.00** (`PARTIAL`)
- **Payment Transactions:**
  1. `₹10,000.00` via **CASH** (`CASH-RCPT-2026-9041`) 1 day ago (Token cash advance).
- **Garment ID:** `GAR-2026-0203` | Status: `IN_PRODUCTION`

---

## 5. Verification Checklist & Live Query Output

The seed script includes automatic validation checks. Running the verification query against PostgreSQL returns:

```sql
SELECT entity, count FROM (
    SELECT 'customers' AS entity, COUNT(*) AS count FROM customers WHERE mobile_number IN ('+91 98401 54321', '+91 98402 67890')
    UNION ALL
    SELECT 'orders', COUNT(*) FROM orders WHERE customer_mobile IN ('+91 98401 54321', '+91 98402 67890')
    UNION ALL
    SELECT 'garments', COUNT(*) FROM garments WHERE customer_mobile IN ('+91 98401 54321', '+91 98402 67890')
    UNION ALL
    SELECT 'payments', COUNT(*) FROM payments WHERE customer_mobile IN ('+91 98401 54321', '+91 98402 67890')
    UNION ALL
    SELECT 'payment_transactions', COUNT(*) FROM payment_transactions WHERE payment_id IN (
        SELECT id FROM payments WHERE customer_mobile IN ('+91 98401 54321', '+91 98402 67890')
    )
    UNION ALL
    SELECT 'customer_body_measurements', COUNT(*) FROM customer_body_measurements WHERE customer_mobile IN ('+91 98401 54321', '+91 98402 67890')
    UNION ALL
    SELECT 'customer_measurements', COUNT(*) FROM customer_measurements WHERE customer_mobile IN ('+91 98401 54321', '+91 98402 67890')
    UNION ALL
    SELECT 'measurement_points', COUNT(*) FROM measurement_points WHERE profile_id IN (
        SELECT id FROM measurement_profiles WHERE customer_mobile IN ('+91 98401 54321', '+91 98402 67890')
    )
    UNION ALL
    SELECT 'order_progress_stages', COUNT(*) FROM order_progress_stages WHERE order_id IN (
        SELECT id FROM orders WHERE customer_mobile IN ('+91 98401 54321', '+91 98402 67890')
    )
    UNION ALL
    SELECT 'qc_checklists', COUNT(*) FROM qc_checklists WHERE order_id IN (
        SELECT id FROM orders WHERE customer_mobile IN ('+91 98401 54321', '+91 98402 67890')
    )
    UNION ALL
    SELECT 'trials', COUNT(*) FROM trials WHERE customer_mobile IN ('+91 98401 54321', '+91 98402 67890')
) verification_summary;
```

### Verified Row Counts in Database:

| Entity | Populated Records | Verification Result |
| :--- | :---: | :---: |
| `customers` | **2** | PASS |
| `orders` | **6** | PASS |
| `garments` | **6** | PASS |
| `payments` | **6** | PASS |
| `payment_transactions` | **10** | PASS |
| `customer_body_measurements` | **2** | PASS |
| `customer_measurements` | **2** | PASS |
| `measurement_points` | **16** | PASS |
| `order_progress_stages` | **21** | PASS |
| `qc_checklists` | **4** | PASS |
| `trials` | **2** | PASS |

---

## 6. How to Re-Run or Refresh This Data

If the database is wiped in the future, re-running this seed is a single command:

```powershell
$env:PGPASSWORD = "crazy@8"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5432 -U postgres -d fashion_erp -f "d:\fashion ERP\FASHION-ERP\src\main\resources\db\seed_kavya_and_sivasurya.sql"
$env:PGPASSWORD = $null
```

The script is completely idempotent:
- Uses `ON CONFLICT (mobile_number) DO UPDATE` for customers.
- Uses `ON CONFLICT (order_code) DO UPDATE` for orders.
- Uses `ON CONFLICT (id) DO NOTHING` or `DO UPDATE` for all relational children.
- Can be run safely multiple times without creating duplicate records.
