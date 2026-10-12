# ==============================================================================
# PowerShell Seed Generator: 3 Companies with 3-5 Branches, 20-30 Customers, 40-50 Orders
# ==============================================================================
$outputFile = Join-Path $PSScriptRoot "seed_multi_company_full.sql"
$sw = [System.IO.StreamWriter]::new($outputFile, $false, [System.Text.Encoding]::UTF8)

function W([string]$line) {
    $sw.WriteLine($line)
}

W("-- ==============================================================================")
W("-- MULTI-COMPANY MASTER SEED SCRIPT (3 COMPANIES, 11 BRANCHES, 79 CUSTOMERS, 139 ORDERS)")
W("-- ==============================================================================")
W("BEGIN;")
W("")

# ==============================================================================
# COMPANY 1: RIWAYAT HAUTE COUTURE
# ==============================================================================
$c1_id = "c1000000-0000-0000-0000-000000000001"
W("-- ==============================================================================")
W("-- 1. COMPANY 1: RIWAYAT HAUTE COUTURE (Awadhi & Mughal Royal Bridal)")
W("-- ==============================================================================")
W("INSERT INTO company_settings (id, company_name, short_name, tagline, owner_name, business_type, gstin, pan_number, primary_phone, whatsapp, email, website, street_address, city, state, pin_code, country, logo_base64, share_customers_across_branches, share_orders_across_branches, share_enquiries_across_branches, share_measurements_across_branches, share_inventory_across_branches, share_garments_across_branches, share_trials_across_branches) VALUES (")
W("  '$c1_id', 'Riwayat Haute Couture', 'RIWAYAT', 'Awadhi & Mughal Regal Bespoke Luxury', 'Begum Noor Jahan Singhania', 'Luxury Bridal and Bespoke Atelier', '09AAACR9876M1ZX', 'AAACR9876M', '+91 522 261 4400', '+91 98111 00000', 'concierge@riwayatcouture.com', 'https://riwayatcouture.com', '14/A Hazratganj Heritage Promenade', 'Lucknow', 'Uttar Pradesh', '226001', 'India', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE")
W(") ON CONFLICT (id) DO NOTHING;")
W("")

# C1 Branches (3)
$c1_branches = @(
    @{ id="b1000000-0000-0000-0000-000000000001"; code="HQ-LKO";  name="Hazratganj Flagship HQ";   type="FLAGSHIP"; addr="14/A Hazratganj Promenade"; city="Lucknow"; state="Uttar Pradesh"; pin="226001"; phone="+91 522 261 4400"; hq=$true },
    @{ id="b1000000-0000-0000-0000-000000000002"; code="BR-AGRA"; name="Agra Taj View Lounge";      type="BOUTIQUE"; addr="18 Fatehabad Road";          city="Agra";    state="Uttar Pradesh"; pin="282001"; phone="+91 562 233 8810"; hq=$false },
    @{ id="b1000000-0000-0000-0000-000000000003"; code="BR-KNPR"; name="Kanpur Civil Lines Studio"; type="STUDIO";   addr="42/1 Mall Road, Civil Lines"; city="Kanpur";  state="Uttar Pradesh"; pin="208001"; phone="+91 512 230 5520"; hq=$false }
)

W("-- Branches (3)")
foreach ($b in $c1_branches) {
    $hqVal = if ($b.hq) { "TRUE" } else { "FALSE" }
    W("INSERT INTO branches (id, branch_code, name, type, street_address, city, state, pin_code, country, phone, whatsapp, email, is_headquarters, active, working_hours, company_id) VALUES ('$($b.id)', '$($b.code)', '$($b.name)', '$($b.type)', '$($b.addr)', '$($b.city)', '$($b.state)', '$($b.pin)', 'India', '$($b.phone)', '+91 98111 00000', 'contact@riwayatcouture.com', $hqVal, TRUE, 'Mon-Sat 10:30-20:00', '$c1_id');")
}
W("")

# C1 Employees (6)
$c1_employees = @(
    @{ id="e1000000-0000-0000-0000-000000000001"; code="EMP-RIW-001"; name="Noor Jahan Singhania"; role="DESIGNER"; spec="Royal Nawabi Lehengas"; phone="+91 98111 11001"; email="noor@riwayatcouture.com" },
    @{ id="e1000000-0000-0000-0000-000000000002"; code="EMP-RIW-002"; name="Ustad Rashid Ali";      role="TAILOR";   spec="Master Zardozi & Adda Work"; phone="+91 98111 11002"; email="rashid@riwayatcouture.com" },
    @{ id="e1000000-0000-0000-0000-000000000003"; code="EMP-RIW-003"; name="Shabnam Qureshi";      role="DESIGNER"; spec="Bridal Stylist & Draping"; phone="+91 98111 11003"; email="shabnam@riwayatcouture.com" },
    @{ id="e1000000-0000-0000-0000-000000000004"; code="EMP-RIW-004"; name="Munna Lal Verma";       role="TAILOR";   spec="Master Pattern Cutter"; phone="+91 98111 11004"; email="munnalal@riwayatcouture.com" },
    @{ id="e1000000-0000-0000-0000-000000000005"; code="EMP-RIW-005"; name="Asad Khan";             role="ARTISAN";  spec="Real Silver Mukaish Craft"; phone="+91 98111 11005"; email="asad@riwayatcouture.com" },
    @{ id="e1000000-0000-0000-0000-000000000006"; code="EMP-RIW-006"; name="Zareen Mirza";          role="QC";       spec="Heirloom Quality Auditor"; phone="+91 98111 11006"; email="zareen@riwayatcouture.com" }
)

W("-- Employees (6)")
foreach ($e in $c1_employees) {
    W("INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, company_id) VALUES ('$($e.id)', '$($e.code)', '$($e.name)', '$($e.phone)', '$($e.email)', '$($e.role)', 'ACTIVE', '2023-01-15', '$($e.spec)', '$c1_id');")
}
W("UPDATE branches SET manager_id = 'e1000000-0000-0000-0000-000000000001' WHERE id = 'b1000000-0000-0000-0000-000000000001';")
W("UPDATE branches SET manager_id = 'e1000000-0000-0000-0000-000000000003' WHERE id = 'b1000000-0000-0000-0000-000000000002';")
W("UPDATE branches SET manager_id = 'e1000000-0000-0000-0000-000000000004' WHERE id = 'b1000000-0000-0000-0000-000000000003';")
W("")

# C1 App Users & Profiles (3)
W("-- App Users & Profiles (3)")
W("INSERT INTO app_users (id, username, password_hash, full_name, role, active, email, phone, designation, department, assigned_branch, allowed_branches, company_id) VALUES")
W("('11000000-0000-0000-0000-000000000001', 'riwayat_owner', crypt('Admin@123', gen_salt('bf')), 'Begum Noor Jahan Singhania', 'OWNER', TRUE, 'noor@riwayatcouture.com', '+91 98111 00000', 'Founder & Creative Director', 'Executive', 'HQ-LKO', json_build_array('HQ-LKO','BR-AGRA','BR-KNPR')::text, '$c1_id'),")
W("('11000000-0000-0000-0000-000000000002', 'riwayat_agra', crypt('Admin@123', gen_salt('bf')), 'Shabnam Qureshi', 'BRANCH_ADMIN', TRUE, 'shabnam@riwayatcouture.com', '+91 98111 11003', 'Agra Lounge Manager', 'Operations', 'BR-AGRA', json_build_array('BR-AGRA')::text, '$c1_id'),")
W("('11000000-0000-0000-0000-000000000003', 'riwayat_kanpur', crypt('Admin@123', gen_salt('bf')), 'Munna Lal Verma', 'BRANCH_ADMIN', TRUE, 'munnalal@riwayatcouture.com', '+91 98111 11004', 'Kanpur Studio Manager', 'Operations', 'BR-KNPR', json_build_array('BR-KNPR')::text, '$c1_id');")
W("")

W("INSERT INTO user_profiles (id, user_id, full_name, display_title, department, email, phone, assigned_branch, clearance_level, system_role_label, privileges_summary, company_id) VALUES")
W("('21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'Begum Noor Jahan Singhania', 'Creative Director', 'Executive', 'noor@riwayatcouture.com', '+91 98111 00000', 'HQ-LKO', 'Tier 1 (Executive)', 'Company Owner', 'Full Studio & Settings Access', '$c1_id'),")
W("('21000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', 'Shabnam Qureshi', 'Agra Lounge Manager', 'Operations', 'shabnam@riwayatcouture.com', '+91 98111 11003', 'BR-AGRA', 'Tier 2 (Manager)', 'Branch Manager', 'Agra Branch Operational Authority', '$c1_id'),")
W("('21000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', 'Munna Lal Verma', 'Kanpur Studio Manager', 'Operations', 'munnalal@riwayatcouture.com', '+91 98111 11004', 'BR-KNPR', 'Tier 2 (Manager)', 'Branch Manager', 'Kanpur Branch Operational Authority', '$c1_id');")
W("")

# C1 Stage Definitions (8)
W("-- Stage Definitions (8)")
$c1_stages = @(
    @{ id="31000000-0000-0000-0000-000000000001"; key="ORDER_TAKEN";   name="Concept & Measurement";       desc="Consultation, motif selection, advance payment"; role="STAFF";    dept="Boutique Floor"; col="badge-primary"; sort=10 },
    @{ id="31000000-0000-0000-0000-000000000002"; key="MEASURING";     name="Silhouette Blueprint";        desc="Detailed body contouring and neckline depths";    role="DESIGNER"; dept="Design Room";   col="badge-info";    sort=20 },
    @{ id="31000000-0000-0000-0000-000000000003"; key="PATTERN_MAKING";name="Master Khaka Drafting";       desc="Full size tracing paper khaka & stenciling";      role="DESIGNER"; dept="CAD Room";      col="badge-primary"; sort=30 },
    @{ id="31000000-0000-0000-0000-000000000004"; key="EMBROIDERY";    name="Adda Zardozi & Mukaish";      desc="Wooden adda frame hand zardozi & dabka work";     role="ARTISAN";  dept="Embroidery Adda";col="badge-warning"; sort=40 },
    @{ id="31000000-0000-0000-0000-000000000005"; key="CUTTING";       name="Hand Cutting & Can-Can";      desc="Silk panel bias cutting with double can-can skirt";role="TAILOR";   dept="Cutting Room";   col="badge-dark";    sort=50 },
    @{ id="31000000-0000-0000-0000-000000000006"; key="STITCHING";     name="Assembly & Hand Finishing";   desc="Kali assembly, latkan tassels, and lining stitch";role="TAILOR";   dept="Stitching Bay";  col="badge-purple";  sort=60 },
    @{ id="31000000-0000-0000-0000-000000000007"; key="TRIAL";         name="Bespoke Fitting Session";     desc="Bride trial on mannequin & live fitting review";  role="DESIGNER"; dept="VIP Suite";      col="badge-warning"; sort=70 },
    @{ id="31000000-0000-0000-0000-000000000008"; key="QC_DISPATCH";   name="Final Press & Dispatch";      desc="Steaming, velvet hanger, cedarwood chest delivery";role="QC";       dept="Dispatch Room";  col="badge-success"; sort=80 }
)
foreach ($st in $c1_stages) {
    W("INSERT INTO stage_definitions (id, stage_key, display_name, description, required_role, dept_label, color_class, sort_order, active, company_id) VALUES ('$($st.id)', '$($st.key)', '$($st.name)', '$($st.desc)', '$($st.role)', '$($st.dept)', '$($st.col)', $($st.sort), TRUE, '$c1_id');")
}
W("")

# C1 Collections (3)
W("-- Collections (3)")
W("INSERT INTO collections (id, code, name, subtitle, description, season, year, status, designer, branch, launch_date, is_featured, cover_image_url, progress_percentage, company_id) VALUES")
W("('41000000-0000-0000-0000-000000000001', 'COL-RIW-2026-A', 'Noor-e-Awadh: Shahi Zardozi', 'Regal Awadhi Lehengas in Velvet & Katan Silk', 'Inspired by the grand Nawabi durbars of Lucknow.', 'Bridal 2026', 2026, 'ACTIVE', 'Noor Jahan Singhania', 'HQ-LKO', '2026-01-15', TRUE, '/front end/assets/pink_silk.jpg', 85, '$c1_id'),")
W("('41000000-0000-0000-0000-000000000002', 'COL-RIW-2026-B', 'Mukaish & Chanderi Heirloom', 'Featherlight Silver Mukaish Drapes', 'Intricate hand badla work over translucent pure chanderi weaves.', 'Spring 2026', 2026, 'ACTIVE', 'Shabnam Qureshi', 'BR-AGRA', '2026-02-01', TRUE, '/front end/assets/mannequin-duo.jpg', 70, '$c1_id'),")
W("('41000000-0000-0000-0000-000000000003', 'COL-RIW-2026-C', 'Nawabi Velvet & Jamawar Sherwanis', 'Groom Royal Sherwanis with Antique Brocade', 'Handwoven Pashmina and Jamawar coats for regal grooms.', 'Winter Festive 2026', 2026, 'ACTIVE', 'Noor Jahan Singhania', 'BR-KNPR', '2026-02-20', FALSE, '/front end/assets/pink_silk.jpg', 90, '$c1_id');")
W("")

# C1 Suppliers (3)
W("-- Suppliers (3)")
W("INSERT INTO suppliers (id, supplier_code, name, contact_person, phone, email, address, specialization, company_id) VALUES")
W("('51000000-0000-0000-0000-000000000001', 'SUP-RIW-001', 'Banaras Royal Silk Guild', 'Maheshwar Shastri', '+91 542 240 1199', 'orders@royalsilkguild.in', 'Ghat View Lane, Varanasi, UP', 'Pure Katan Silk & Brocades', '$c1_id'),")
W("('51000000-0000-0000-0000-000000000002', 'SUP-RIW-002', 'Chowk Metallic Thread Traders', 'Haji Irfan Mirza', '+91 522 225 8811', 'chowkzari@mirzatraders.com', 'Chowk Zari Mandi, Lucknow, UP', 'Real Gold & Silver Zardozi Wire', '$c1_id'),")
W("('51000000-0000-0000-0000-000000000003', 'SUP-RIW-003', 'Surat Velvet & Chiffon Mills', 'Ketan Patel', '+91 261 248 9900', 'suratvelvet@pateltextiles.in', 'Ring Road Textile Market, Surat, GJ', 'Micro-Velvet & Pure Silk Chiffon', '$c1_id');")
W("")

# C1 Inventory Items (14) - Note: available_qty is GENERATED ALWAYS!
W("-- Inventory Items (14)")
$c1_items = @(
    @{ id="61000000-0000-0000-0000-000000000001"; code="ITM-RIW-001"; name="Royal Crimson Pure Silk Velvet"; cat="Fabric"; var="Crimson Red"; unit="Meter"; sq=65.0; rq=15.0; p=3200.0; s=6800.0; sup="Surat Velvet & Chiffon Mills"; br="HQ-LKO" },
    @{ id="61000000-0000-0000-0000-000000000002"; code="ITM-RIW-002"; name="Kashi Pure Katan Silk (Emerald)"; cat="Fabric"; var="Emerald Green"; unit="Meter"; sq=80.0; rq=20.0; p=2800.0; s=6200.0; sup="Banaras Royal Silk Guild"; br="HQ-LKO" },
    @{ id="61000000-0000-0000-0000-000000000003"; code="ITM-RIW-003"; name="Pure Chanderi Silk Tissue (Gold)"; cat="Fabric"; var="Tissue Gold"; unit="Meter"; sq=50.0; rq=12.0; p=1900.0; s=4400.0; sup="Banaras Royal Silk Guild"; br="BR-AGRA" },
    @{ id="61000000-0000-0000-0000-000000000004"; code="ITM-RIW-004"; name="Midnight Navy Micro-Velvet"; cat="Fabric"; var="Midnight Navy"; unit="Meter"; sq=55.0; rq=10.0; p=3100.0; s=6600.0; sup="Surat Velvet & Chiffon Mills"; br="BR-KNPR" },
    @{ id="61000000-0000-0000-0000-000000000005"; code="ITM-RIW-005"; name="Pure Silver Mukaish Badla Wire (100g)"; cat="Trim"; var="Silver Badla"; unit="Pack"; sq=40.0; rq=8.0; p=1450.0; s=3100.0; sup="Chowk Metallic Thread Traders"; br="HQ-LKO" },
    @{ id="61000000-0000-0000-0000-000000000006"; code="ITM-RIW-006"; name="Antique Gold Dabka Spools (50g)"; cat="Trim"; var="Antique Gold"; unit="Pack"; sq=60.0; rq=14.0; p=980.0; s=2200.0; sup="Chowk Metallic Thread Traders"; br="HQ-LKO" },
    @{ id="61000000-0000-0000-0000-000000000007"; code="ITM-RIW-007"; name="Ivory Pure Mulberry Organza"; cat="Fabric"; var="Ivory Pearl"; unit="Meter"; sq=75.0; rq=18.0; p=1650.0; s=3800.0; sup="Banaras Royal Silk Guild"; br="BR-AGRA" },
    @{ id="61000000-0000-0000-0000-000000000008"; code="ITM-RIW-008"; name="Handmade Heavy Latkan Tassels (Pair)"; cat="Trim"; var="Gold Pearl"; unit="Pair"; sq=35.0; rq=5.0; p=850.0; s=2100.0; sup="Chowk Metallic Thread Traders"; br="HQ-LKO" },
    @{ id="61000000-0000-0000-0000-000000000009"; code="ITM-RIW-009"; name="Pure Banarasi Jamawar Brocade"; cat="Fabric"; var="Rich Wine"; unit="Meter"; sq=45.0; rq=10.0; p=4200.0; s=8900.0; sup="Banaras Royal Silk Guild"; br="BR-KNPR" },
    @{ id="61000000-0000-0000-0000-000000000010"; code="ITM-RIW-010"; name="Real Pearl Cutdana Beads (250g)"; cat="Trim"; var="Basra Pearl"; unit="Pack"; sq=50.0; rq=10.0; p=1200.0; s=2800.0; sup="Chowk Metallic Thread Traders"; br="HQ-LKO" },
    @{ id="61000000-0000-0000-0000-000000000011"; code="ITM-RIW-011"; name="Structured Bridal Can-Can Net (50m)"; cat="Trim"; var="Firm White"; unit="Roll"; sq=30.0; rq=6.0; p=950.0; s=2400.0; sup="Surat Velvet & Chiffon Mills"; br="HQ-LKO" },
    @{ id="61000000-0000-0000-0000-000000000012"; code="ITM-RIW-012"; name="Butter Satin Underskirt Lining"; cat="Fabric"; var="Crimson Red"; unit="Meter"; sq=90.0; rq=22.0; p=420.0; s=1100.0; sup="Surat Velvet & Chiffon Mills"; br="BR-AGRA" },
    @{ id="61000000-0000-0000-0000-000000000013"; code="ITM-RIW-013"; name="Heavy Canvas Interfacing Stiffener"; cat="Trim"; var="Natural Stiff"; unit="Meter"; sq=70.0; rq=12.0; p=350.0; s=850.0; sup="Surat Velvet & Chiffon Mills"; br="BR-KNPR" },
    @{ id="61000000-0000-0000-0000-000000000014"; code="ITM-RIW-014"; name="Gold Embroidered Zari Border (9m)"; cat="Trim"; var="Zardozi Crest"; unit="Roll"; sq=25.0; rq=5.0; p=2800.0; s=6500.0; sup="Chowk Metallic Thread Traders"; br="HQ-LKO" }
)
foreach ($it in $c1_items) {
    W("INSERT INTO inventory_items (id, item_code, name, category, variant, unit, stock_qty, reserved_qty, reorder_level, purchase_price, selling_price, supplier_name, image_url, status, branch, company_id) VALUES ('$($it.id)', '$($it.code)', '$($it.name)', '$($it.cat)', '$($it.var)', '$($it.unit)', $($it.sq), $($it.rq), 10.0, $($it.p), $($it.s), '$($it.sup)', '/front end/assets/pink_silk.jpg', 'IN_STOCK', '$($it.br)', '$c1_id');")
}
W("")

# C1 Stock Movements & Inter-Branch Transfers (24)
W("-- Stock Movements & Inter-Branch Transfers (24)")
$c1_transfers = @(
    @{ ref="TR-RIW-2026-001"; from="HQ-LKO"; to="BR-AGRA"; itm="61000000-0000-0000-0000-000000000001"; qty=5.0; notes="Transfer: HQ-LKO -> BR-AGRA (Urgent bridal velvet request)" },
    @{ ref="TR-RIW-2026-002"; from="HQ-LKO"; to="BR-KNPR"; itm="61000000-0000-0000-0000-000000000006"; qty=8.0; notes="Transfer: HQ-LKO -> BR-KNPR (Antique gold dabka restock)" },
    @{ ref="TR-RIW-2026-003"; from="BR-AGRA"; to="HQ-LKO"; itm="61000000-0000-0000-0000-000000000003"; qty=6.0; notes="Transfer: BR-AGRA -> HQ-LKO (Gold tissue yardage for lehenga)" },
    @{ ref="TR-RIW-2026-004"; from="HQ-LKO"; to="BR-AGRA"; itm="61000000-0000-0000-0000-000000000005"; qty=4.0; notes="Transfer: HQ-LKO -> BR-AGRA (Silver mukaish for dupatta)" },
    @{ ref="TR-RIW-2026-005"; from="BR-KNPR"; to="HQ-LKO"; itm="61000000-0000-0000-0000-000000000009"; qty=7.0; notes="Transfer: BR-KNPR -> HQ-LKO (Jamawar brocade for sherwani order)" },
    @{ ref="TR-RIW-2026-006"; from="HQ-LKO"; to="BR-KNPR"; itm="61000000-0000-0000-0000-000000000014"; qty=3.0; notes="Transfer: HQ-LKO -> BR-KNPR (Zari border rolls for groom stole)" }
)
$smIdx = 1
foreach ($tr in $c1_transfers) {
    $smId = "71000000-0000-0000-0000-" + $smIdx.ToString("D12")
    W("INSERT INTO stock_movements (id, item_id, movement_type, quantity, reference, notes, moved_by, moved_at, company_id) VALUES ('$smId', '$($tr.itm)', 'ISSUE', $($tr.qty), '$($tr.ref)', '$($tr.notes)', 'Noor Jahan Singhania', NOW() - INTERVAL '$($smIdx) days', '$c1_id');")
    $smIdx++
}
for ($i=1; $i -le 14; $i++) {
    $smId = "71000000-0000-0000-0000-" + ($smIdx + $i).ToString("D12")
    $itId = "61000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO stock_movements (id, item_id, movement_type, quantity, reference, notes, moved_by, moved_at, company_id) VALUES ('$smId', '$itId', 'RECEIPT', 40.0, 'PO-RIW-2026-$($i.ToString('D3'))', 'Bulk shipment received and inspected', 'Zareen Mirza', NOW() - INTERVAL '$($i + 5) days', '$c1_id');")
}
W("")

# C1 Customers (25)
W("-- Customers (25)")
$c1_cust_names = @(
    "Aanya Mehra", "Bhavna Singhal", "Chitrangada Sen", "Deepika Kapoor", "Esha Deol",
    "Fatima Sana", "Gauri Deshmukh", "Huma Qureshi", "Isha Ambani", "Janhvi Kapoor",
    "Kareena Kapoor", "Lavanya Tripathi", "Mira Rajput", "Navya Naveli", "Oindrila Sen",
    "Pragya Jaiswal", "Radhika Merchant", "Soha Ali Khan", "Tara Sutaria", "Urvashi Rautela",
    "Vedika Pinto", "Warina Hussain", "Yami Gautam", "Zoya Akhtar", "Alia Bhatt"
)
$c1_branches_pool = @("HQ-LKO", "HQ-LKO", "BR-AGRA", "BR-KNPR")
$c1_garment_types = @("Bridal Lehenga Choli", "Velvet Sherwani", "Mukaish Anarkali", "Zardozi Saree", "Gharara Ensemble")

for ($i=1; $i -le 25; $i++) {
    $phone = "+91 98111 " + $i.ToString("D5")
    $name = $c1_cust_names[$i-1]
    $first = $name.Split(" ")[0]
    $last = $name.Split(" ")[1]
    $branch = $c1_branches_pool[($i % 4)]
    $city = if ($branch -eq "HQ-LKO") { "Lucknow" } elseif ($branch -eq "BR-AGRA") { "Agra" } else { "Kanpur" }
    $tier = if ($i % 5 -eq 0) { "VIP" } elseif ($i % 3 -eq 0) { "PREMIUM" } else { "REGULAR" }
    $fav = $c1_garment_types[($i % 5)]
    $spend = ($i * 14000.0) + 45000.0
    $bal = if ($i % 2 -eq 0) { 25000.0 } else { 0.0 }
    
    W("INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, location, street_address, city, state, pincode, tier, total_spend, balance, favorite_garment, measurements_on_file, fit_preference, preferred_channel, branch, company_id) VALUES (")
    W("  '$phone', '$name', '$first', '$last', 'Ms.', 'Female', '$($first.ToLower()).$($last.ToLower())@coutureclient.in', '$city, Uttar Pradesh', 'House $i, Royal Colony', '$city', 'Uttar Pradesh', '226001', '$tier', $spend, $bal, '$fav', TRUE, 'Comfort Regal Fit', 'WhatsApp', '$branch', '$c1_id'")
    W(");")
    
    $bmId = "81000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, armhole, sleeve_length, front_neck_depth, back_neck_depth, recorded_by, company_id) VALUES (")
    W("  '$bmId', '$phone', '$name', '$fav', 'CURRENT', TRUE, 1, 'in', 14.5, 36.0, 30.5, 28.0, 38.5, 15.0, 16.5, 19.0, 7.5, 10.0, 'Noor Jahan Singhania', '$c1_id'")
    W(");")
    
    $cmId = "91000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO customer_measurements (id, customer_mobile, garment_type, bust, waist, full_hip, shoulder, sleeve_length, armhole, front_neck, back_neck, garment_length, recorded_by, is_active_profile, company_id) VALUES (")
    W("  '$cmId', '$phone', '$fav', 36.0, 28.0, 38.5, 14.5, 19.0, 16.5, 7.5, 10.0, 44.0, 'Noor Jahan Singhania', TRUE, '$c1_id'")
    W(");")
    
    $mpId = "a1000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO measurement_profiles (id, customer_mobile, garment_type, recorded_by, notes, branch, company_id) VALUES (")
    W("  '$mpId', '$phone', '$fav', 'Noor Jahan Singhania', 'Custom high neck blouse with deep teardrop back cutout.', '$branch', '$c1_id'")
    W(");")
    
    if ($i -le 20) {
        $cnId = "b1000000-0000-0000-0000-" + $i.ToString("D12")
        W("INSERT INTO customer_notes (id, customer_mobile, note_text, author_name, author_badge, category, company_id) VALUES (")
        W("  '$cnId', '$phone', 'Prefers antique gold zardozi highlights over silver dabka.', 'Noor Jahan Singhania', 'NJ', 'PREFERENCE', '$c1_id'")
        W(");")
    }
}
W("")

# C1 Orders (45) & Garments (45)
W("-- Orders (45) & Garments (45)")
$c1_stages_cycle = @("ORDER_TAKEN", "MEASURING", "PATTERN_MAKING", "EMBROIDERY", "CUTTING", "STITCHING", "TRIAL", "QC_DISPATCH")
$c1_statuses = @("PENDING", "IN_PRODUCTION", "IN_PRODUCTION", "IN_PRODUCTION", "IN_PRODUCTION", "IN_PRODUCTION", "READY", "COMPLETED")

for ($j=1; $j -le 45; $j++) {
    $custIdx = (($j - 1) % 25) + 1
    $phone = "+91 98111 " + $custIdx.ToString("D5")
    $custName = $c1_cust_names[$custIdx - 1]
    $ordId = "c1100000-0000-0000-0000-" + $j.ToString("D12")
    $garId = "d1100000-0000-0000-0000-" + $j.ToString("D12")
    $ordCode = "ORD-RIW-" + $j.ToString("D3")
    $garCode = "GAR-RIW-" + $j.ToString("D3")
    $branch = $c1_branches_pool[($j % 4)]
    $stage = $c1_stages_cycle[($j % 8)]
    $status = $c1_statuses[($j % 8)]
    $gType = $c1_garment_types[($j % 5)]
    $totAmount = 65000.0 + ($j * 2500.0)
    $advPaid = if ($status -eq "COMPLETED") { $totAmount } else { [Math]::Round($totAmount * 0.5, 2) }
    $balAmount = [Math]::Round($totAmount - $advPaid, 2)
    $payStatus = if ($balAmount -eq 0) { "PAID" } else { "PARTIAL" }
    
    W("INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, status, order_date, due_date, customer_mobile, customer_name, expected_delivery_date, advance_paid, total_amount, balance_amount, current_stage, branch, company_id) VALUES (")
    W("  '$ordId', '$ordCode', '$gType', 'Heirloom Awadhi $gType handcrafted with zardozi and mukaish', 'Noor-e-Awadh: Shahi Zardozi', $totAmount, '$status', CURRENT_DATE - INTERVAL '$($48 - $j) days', CURRENT_DATE + INTERVAL '$($j * 2) days', '$phone', '$custName', CURRENT_DATE + INTERVAL '$($j * 2) days', $advPaid, $totAmount, $balAmount, '$stage', '$branch', '$c1_id'")
    W(");")
    
    W("INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, collection_name, production_stage, material_status, priority, payment_status, paid_amount, total_amount, status, designer, assigned_to, due_date, branch, company_id) VALUES (")
    W("  '$garId', '$garCode', '$ordId', '$ordCode', '$custName', '$phone', 'Heritage $gType for $custName', '$gType', 'Noor-e-Awadh: Shahi Zardozi', '$stage', 'READY', 'NORMAL', '$payStatus', $advPaid, $totAmount, '$status', 'Noor Jahan Singhania', 'Ustad Rashid Ali', CURRENT_DATE + INTERVAL '$($j * 2) days', '$branch', '$c1_id'")
    W(");")
    
    $ops1 = "e1100000-0000-0000-0000-" + (($j * 2) - 1).ToString("D12")
    $ops2 = "e1100000-0000-0000-0000-" + ($j * 2).ToString("D12")
    W("INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes, company_id) VALUES ('$ops1', '$ordId', 'ORDER_TAKEN', NOW() - INTERVAL '$($50 - $j) days', 'Noor Jahan Singhania', 'Consultation verified and advance logged', '$c1_id');")
    W("INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes, company_id) VALUES ('$ops2', '$ordId', '$stage', NOW() - INTERVAL '2 days', 'Ustad Rashid Ali', 'Active production progressing on schedule', '$c1_id');")
    
    $ps1 = "f1100000-0000-0000-0000-" + (($j * 2) - 1).ToString("D12")
    $ps2 = "f1100000-0000-0000-0000-" + ($j * 2).ToString("D12")
    W("INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, started_at, sort_order, notes, company_id) VALUES ('$ps1', '$ordId', 'Drafting & Khaka', 'e1000000-0000-0000-0000-000000000004', 'COMPLETED', NOW() - INTERVAL '$($45 - $j) days', 1, 'Pattern drafting completed', '$c1_id');")
    W("INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, started_at, sort_order, notes, company_id) VALUES ('$ps2', '$ordId', '$stage', 'e1000000-0000-0000-0000-000000000002', 'IN_PROGRESS', NOW() - INTERVAL '5 days', 2, 'Work currently underway on adda frame', '$c1_id');")
    
    $qcId = "11100000-0000-0000-0000-" + $j.ToString("D12")
    W("INSERT INTO qc_checklists (id, order_id, check_point, result, checked_by, checked_at, remarks, sort_order, company_id) VALUES ('$qcId', '$ordId', 'Zardozi Tension & Knot Density', 'PASSED', 'e1000000-0000-0000-0000-000000000006', NOW() - INTERVAL '1 days', 'Flawless bead alignment and strong anchoring', 1, '$c1_id');")
    
    $payId = "21100000-0000-0000-0000-" + $j.ToString("D12")
    W("INSERT INTO payments (id, order_id, customer_mobile, total_amount, paid_amount, status, due_date, notes, company_id) VALUES ('$payId', '$ordId', '$phone', $totAmount, $advPaid, '$payStatus', CURRENT_DATE + INTERVAL '$($j * 2) days', 'Bespoke tailoring advance token', '$c1_id');")
    
    $pt1 = "31100000-0000-0000-0000-" + (($j * 2) - 1).ToString("D12")
    W("INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, notes, company_id) VALUES ('$pt1', '$payId', $advPaid, 'BANK_TRANSFER', 'Noor Jahan Singhania', 'IMPS/HDFC/$($j.ToString('D6'))', 'Initial 50% deposit received', '$c1_id');")
    
    if ($balAmount -eq 0) {
        $pt2 = "31100000-0000-0000-0000-" + ($j * 2).ToString("D12")
        W("INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, notes, company_id) VALUES ('$pt2', '$payId', $advPaid, 'UPI', 'Noor Jahan Singhania', 'UPI/ICIC/$($j.ToString('D6'))', 'Final settlement prior to delivery', '$c1_id');")
    }
    
    if ($j -le 20) {
        $trlId = "41100000-0000-0000-0000-" + $j.ToString("D12")
        $trlCode = "TRL-RIW-" + $j.ToString("D3")
        W("INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, fit_preference, customer_feedback, trial_attempt, alteration_count, branch, company_id) VALUES (")
        W("  '$trlId', '$trlCode', '$ordId', '$ordCode', '$phone', '$custName', '$gType', 'Noor-e-Awadh: Shahi Zardozi', CURRENT_DATE + INTERVAL '$j days', '11:30 AM', 'First Trial', 'UPCOMING', 'PENDING', 'Noor Jahan Singhania', CURRENT_DATE + INTERVAL '$($j * 2) days', 'Comfort Regal Fit', 'Client requested trial at Lucknow Flagship VIP suite', 1, 0, '$branch', '$c1_id'")
        W(");")
        
        if ($j -le 15) {
            $altId = "51100000-0000-0000-0000-" + $j.ToString("D12")
            W("INSERT INTO trial_alterations (id, trial_id, description, category, completed, assigned_tailor, priority, target_date, tailor_notes, status, company_id) VALUES (")
            W("  '$altId', '$trlId', 'Adjust blouse waist cinch by 0.5 inches', 'Fit', FALSE, 'Ustad Rashid Ali', 'Normal', CURRENT_DATE + INTERVAL '$($j + 3) days', 'Take in side seam slightly.', 'PENDING', '$c1_id'")
            W(");")
        }
    }
}
W("")

# C1 Designs (12)
W("-- Designs (12)")
for ($d=1; $d -le 12; $d++) {
    $desId = "61100000-0000-0000-0000-" + $d.ToString("D12")
    $desCode = "DES-RIW-" + $d.ToString("D3")
    $ordId = "c1100000-0000-0000-0000-" + $d.ToString("D12")
    $custIdx = (($d - 1) % 25) + 1
    $phone = "+91 98111 " + $custIdx.ToString("D5")
    W("INSERT INTO designs (id, design_code, title, garment_type, order_id, status, designer, thumbnail_url, customer_mobile, collection, primary_fabric, estimated_cost, suggested_price, production_status, times_used, image_urls, notes, created_by, company_id) VALUES (")
    W("  '$desId', '$desCode', 'Nawabi Heritage Design #$d', 'Bridal Lehenga', '$ordId', 'APPROVED', 'Noor Jahan Singhania', '/front end/assets/pink_silk.jpg', '$phone', 'Noor-e-Awadh: Shahi Zardozi', 'Royal Silk Velvet & Katan Silk', 35000.0, 95000.0, 'Active', $d, json_build_array('/front end/assets/pink_silk.jpg')::text, 'Intricate floral jaal motif with peacock medallions.', 'Noor Jahan Singhania', '$c1_id'")
    W(");")
}
W("")

# C1 Enquiries (10) & Appointments (10)
W("-- Enquiries (10) & Appointments (10)")
for ($en=1; $en -le 10; $en++) {
    $enqId = "71100000-0000-0000-0000-" + $en.ToString("D12")
    $enqCode = "ENQ-RIW-" + $en.ToString("D3")
    $apptId = "81100000-0000-0000-0000-" + $en.ToString("D12")
    $ordId = "c1100000-0000-0000-0000-" + $en.ToString("D12")
    $name = $c1_cust_names[$en - 1]
    $phone = "+91 98111 " + $en.ToString("D5")
    $branch = $c1_branches_pool[($en % 4)]
    
    W("INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, source, estimated_budget, branch, company_id) VALUES (")
    W("  '$enqId', '$enqCode', '$name', '$phone', 'enquiry$en@coutureclient.in', 'Bridal Lehenga', 'Walk-in enquiry looking for autumn wedding ensemble', 'CONVERTED', 'Noor Jahan Singhania', 'WALK_IN', 120000.0, '$branch', '$c1_id'")
    W(");")
    
    W("INSERT INTO appointments (id, order_id, appt_type, scheduled_at, duration_minutes, status, staff_assigned, notes, customer_mobile, company_id) VALUES (")
    W("  '$apptId', '$ordId', 'CONSULTATION', NOW() + INTERVAL '$en days', 60, 'SCHEDULED', 'Noor Jahan Singhania', 'VIP bridal consultation with family in Flagship salon', '$phone', '$c1_id'")
    W(");")
}
W("")

# ==============================================================================
# COMPANY 2: ZARI & LOOM ATELIER
# ==============================================================================
$c2_id = "c2000000-0000-0000-0000-000000000002"
W("-- ==============================================================================")
W("-- 2. COMPANY 2: ZARI & LOOM ATELIER (Contemporary Banarasi Handloom)")
W("-- ==============================================================================")
W("INSERT INTO company_settings (id, company_name, short_name, tagline, owner_name, business_type, gstin, pan_number, primary_phone, whatsapp, email, website, street_address, city, state, pin_code, country, logo_base64, share_customers_across_branches, share_orders_across_branches, share_enquiries_across_branches, share_measurements_across_branches, share_inventory_across_branches, share_garments_across_branches, share_trials_across_branches) VALUES (")
W("  '$c2_id', 'Zari & Loom Atelier', 'ZARILOOM', 'Contemporary Banarasi Handloom & Bespoke Silks', 'Ananya Sen & Kabir Dasgupta', 'Heritage Handloom Couture Studio', '07BBBCS8765N1ZY', 'BBBCS8765N', '+91 11 2664 8800', '+91 98222 00000', 'contact@zariloomatelier.com', 'https://zariloomatelier.com', 'The Kila, Seven Style Mile, Mehrauli', 'New Delhi', 'Delhi', '110030', 'India', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE")
W(") ON CONFLICT (id) DO NOTHING;")
W("")

# C2 Branches (4)
$c2_branches = @(
    @{ id="b2000000-0000-0000-0000-000000000001"; code="HQ-DEL"; name="Mehrauli Heritage Flagship";  type="FLAGSHIP"; addr="The Kila, Seven Style Mile"; city="New Delhi"; state="Delhi";         pin="110030"; phone="+91 11 2664 8800"; hq=$true },
    @{ id="b2000000-0000-0000-0000-000000000002"; code="BR-BOM"; name="Kala Ghoda Art Boutique";     type="BOUTIQUE"; addr="14 VB Gandhi Marg";          city="Mumbai";    state="Maharashtra";   pin="400001"; phone="+91 22 2284 3100"; hq=$false },
    @{ id="b2000000-0000-0000-0000-000000000003"; code="BR-VNS"; name="Varanasi Weaving Workshop";   type="STUDIO";   addr="K-22/45 Rajghat Fort Road";  city="Varanasi";  state="Uttar Pradesh"; pin="221001"; phone="+91 542 244 1900"; hq=$false },
    @{ id="b2000000-0000-0000-0000-000000000004"; code="BR-JPR"; name="Jaipur Royal Haveli Studio";  type="STUDIO";   addr="Plot 8, Jacob Road";          city="Jaipur";    state="Rajasthan";     pin="302006"; phone="+91 141 222 7100"; hq=$false }
)

W("-- Branches (4)")
foreach ($b in $c2_branches) {
    $hqVal = if ($b.hq) { "TRUE" } else { "FALSE" }
    W("INSERT INTO branches (id, branch_code, name, type, street_address, city, state, pin_code, country, phone, whatsapp, email, is_headquarters, active, working_hours, company_id) VALUES ('$($b.id)', '$($b.code)', '$($b.name)', '$($b.type)', '$($b.addr)', '$($b.city)', '$($b.state)', '$($b.pin)', 'India', '$($b.phone)', '+91 98222 00000', 'contact@zariloomatelier.com', $hqVal, TRUE, 'Mon-Sat 10:00-20:00', '$c2_id');")
}
W("")

# C2 Employees (6)
$c2_employees = @(
    @{ id="e2000000-0000-0000-0000-000000000001"; code="EMP-ZAR-001"; name="Ananya Sen"; role="DESIGNER"; spec="Contemporary Handloom Couture"; phone="+91 98222 11001"; email="ananya@zariloomatelier.com" },
    @{ id="e2000000-0000-0000-0000-000000000002"; code="EMP-ZAR-002"; name="Govindram Ansari"; role="ARTISAN"; spec="Master Handloom Jacquard Weaver"; phone="+91 98222 11002"; email="govind@zariloomatelier.com" },
    @{ id="e2000000-0000-0000-0000-000000000003"; code="EMP-ZAR-003"; name="Priyadarshini Mehta"; role="DESIGNER"; spec="Luxury Saree Stylist, Mumbai"; phone="+91 98222 11003"; email="priya@zariloomatelier.com" },
    @{ id="e2000000-0000-0000-0000-000000000004"; code="EMP-ZAR-004"; name="Raghuveer Singh"; role="TAILOR"; spec="Royal Bandhgala Cutter, Jaipur"; phone="+91 98222 11004"; email="raghuveer@zariloomatelier.com" },
    @{ id="e2000000-0000-0000-0000-000000000005"; code="EMP-ZAR-005"; name="Sumit Karmakar"; role="TAILOR"; spec="Handloom Stitching & Interfacing"; phone="+91 98222 11005"; email="sumit@zariloomatelier.com" },
    @{ id="e2000000-0000-0000-0000-000000000006"; code="EMP-ZAR-006"; name="Aarti Deshmukh"; role="QC"; spec="Silk Purity & Weave Auditor"; phone="+91 98222 11006"; email="aarti@zariloomatelier.com" }
)
W("-- Employees (6)")
foreach ($e in $c2_employees) {
    W("INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, company_id) VALUES ('$($e.id)', '$($e.code)', '$($e.name)', '$($e.phone)', '$($e.email)', '$($e.role)', 'ACTIVE', '2022-06-10', '$($e.spec)', '$c2_id');")
}
W("UPDATE branches SET manager_id = 'e2000000-0000-0000-0000-000000000001' WHERE id = 'b2000000-0000-0000-0000-000000000001';")
W("UPDATE branches SET manager_id = 'e2000000-0000-0000-0000-000000000003' WHERE id = 'b2000000-0000-0000-0000-000000000002';")
W("UPDATE branches SET manager_id = 'e2000000-0000-0000-0000-000000000002' WHERE id = 'b2000000-0000-0000-0000-000000000003';")
W("UPDATE branches SET manager_id = 'e2000000-0000-0000-0000-000000000004' WHERE id = 'b2000000-0000-0000-0000-000000000004';")
W("")

# C2 App Users & Profiles (3)
W("-- App Users & Profiles (3)")
W("INSERT INTO app_users (id, username, password_hash, full_name, role, active, email, phone, designation, department, assigned_branch, allowed_branches, company_id) VALUES")
W("('12000000-0000-0000-0000-000000000001', 'zariloom_owner', crypt('Admin@123', gen_salt('bf')), 'Ananya Sen', 'OWNER', TRUE, 'ananya@zariloomatelier.com', '+91 98222 00000', 'Creative Director & Founder', 'Executive', 'HQ-DEL', json_build_array('HQ-DEL','BR-BOM','BR-VNS','BR-JPR')::text, '$c2_id'),")
W("('12000000-0000-0000-0000-000000000002', 'zariloom_mumbai', crypt('Admin@123', gen_salt('bf')), 'Priyadarshini Mehta', 'BRANCH_ADMIN', TRUE, 'priya@zariloomatelier.com', '+91 98222 11003', 'Mumbai Boutique Manager', 'Operations', 'BR-BOM', json_build_array('BR-BOM')::text, '$c2_id'),")
W("('12000000-0000-0000-0000-000000000003', 'zariloom_jaipur', crypt('Admin@123', gen_salt('bf')), 'Raghuveer Singh', 'BRANCH_ADMIN', TRUE, 'raghuveer@zariloomatelier.com', '+91 98222 11004', 'Jaipur Studio Manager', 'Operations', 'BR-JPR', json_build_array('BR-JPR')::text, '$c2_id');")
W("")

W("INSERT INTO user_profiles (id, user_id, full_name, display_title, department, email, phone, assigned_branch, clearance_level, system_role_label, privileges_summary, company_id) VALUES")
W("('22000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'Ananya Sen', 'Creative Director', 'Executive', 'ananya@zariloomatelier.com', '+91 98222 00000', 'HQ-DEL', 'Tier 1 (Executive)', 'Company Owner', 'Full Atelier Management Control', '$c2_id'),")
W("('22000000-0000-0000-0000-000000000002', '12000000-0000-0000-0000-000000000002', 'Priyadarshini Mehta', 'Mumbai Boutique Manager', 'Operations', 'priya@zariloomatelier.com', '+91 98222 11003', 'BR-BOM', 'Tier 2 (Manager)', 'Branch Manager', 'Mumbai Showroom Management', '$c2_id'),")
W("('22000000-0000-0000-0000-000000000003', '12000000-0000-0000-0000-000000000003', 'Raghuveer Singh', 'Jaipur Studio Manager', 'Operations', 'raghuveer@zariloomatelier.com', '+91 98222 11004', 'BR-JPR', 'Tier 2 (Manager)', 'Branch Manager', 'Jaipur Studio Management', '$c2_id');")
W("")

# C2 Stage Definitions (8)
W("-- Stage Definitions (8)")
$c2_stages = @(
    @{ id="32000000-0000-0000-0000-000000000001"; key="ORDER_TAKEN";   name="Textile Selection & Brief";   desc="Consultation, weave selection, custom border design"; role="STAFF";    dept="Showroom Floor"; col="badge-primary"; sort=10 },
    @{ id="32000000-0000-0000-0000-000000000002"; key="MEASURING";     name="Bespoke Draping Profile";     desc="Draping proportions and shoulder pitch measurements";  role="DESIGNER"; dept="Design Room";   col="badge-info";    sort=20 },
    @{ id="32000000-0000-0000-0000-000000000003"; key="LOOM_SETUP";    name="Master Loom Graph & Weave";   desc="Jacquard card punching & pit loom setup";            role="ARTISAN";  dept="Weaving Shed";  col="badge-primary"; sort=30 },
    @{ id="32000000-0000-0000-0000-000000000004"; key="CUTTING";       name="Precision Grain Cutting";     desc="Cutting along handwoven zari grain lines";            role="TAILOR";   dept="Cutting Table"; col="badge-dark";    sort=40 },
    @{ id="32000000-0000-0000-0000-000000000005"; key="ZARI_WORK";     name="Hand Marori & Resham Edging"; desc="Edge finishing with antique marori thread";           role="ARTISAN";  dept="Embroidery Desk";col="badge-warning";sort=50 },
    @{ id="32000000-0000-0000-0000-000000000006"; key="ASSEMBLY";      name="Tailoring & Habutai Lining";  desc="Hand basting and floating silk lining mount";         role="TAILOR";   dept="Stitching Bay"; col="badge-purple";  sort=60 },
    @{ id="32000000-0000-0000-0000-000000000007"; key="FITTING";       name="Trial & Draping Session";     desc="Mannequin trial and client fitting check";            role="DESIGNER"; dept="VIP Salon";     col="badge-warning"; sort=70 },
    @{ id="32000000-0000-0000-0000-000000000008"; key="QC_DISPATCH";   name="Gold Foil Press & Dispatch";  desc="Vacuum table press, muslin wrap and delivery";       role="QC";       dept="Dispatch Room"; col="badge-success"; sort=80 }
)
foreach ($st in $c2_stages) {
    W("INSERT INTO stage_definitions (id, stage_key, display_name, description, required_role, dept_label, color_class, sort_order, active, company_id) VALUES ('$($st.id)', '$($st.key)', '$($st.name)', '$($st.desc)', '$($st.role)', '$($st.dept)', '$($st.col)', $($st.sort), TRUE, '$c2_id');")
}
W("")

# C2 Collections (3)
W("-- Collections (3)")
W("INSERT INTO collections (id, code, name, subtitle, description, season, year, status, designer, branch, launch_date, is_featured, cover_image_url, progress_percentage, company_id) VALUES")
W("('42000000-0000-0000-0000-000000000001', 'COL-ZAR-2026-A', 'Kashi Katan: Real Gold Zari', 'Heavy Katan Silk Sarees with Pure Zari', 'Handcrafted on heritage pit looms in Varanasi.', 'Festive 2026', 2026, 'ACTIVE', 'Ananya Sen', 'HQ-DEL', '2026-01-10', TRUE, '/front end/assets/pink_silk.jpg', 88, '$c2_id'),")
W("('42000000-0000-0000-0000-000000000002', 'COL-ZAR-2026-B', 'Jamdani Whisper: Featherlight Drapes', 'Pastel Handwoven Jamdani Sarees & Capes', 'Translucent gossamer weaves for modern soirees.', 'Spring/Summer 2026', 2026, 'ACTIVE', 'Priyadarshini Mehta', 'BR-BOM', '2026-02-14', TRUE, '/front end/assets/mannequin-duo.jpg', 65, '$c2_id'),")
W("('42000000-0000-0000-0000-000000000003', 'COL-ZAR-2026-C', 'Rajputana Heritage: Tussar Bandhgalas', 'Men Structured Bandhgala Jackets in Raw Silk', 'Sharp bespoke tailoring in earthy Tussar and Matka silks.', 'Autumn/Winter 2026', 2026, 'ACTIVE', 'Ananya Sen', 'BR-JPR', '2026-02-28', FALSE, '/front end/assets/pink_silk.jpg', 75, '$c2_id');")
W("")

# C2 Suppliers (3)
W("-- Suppliers (3)")
W("INSERT INTO suppliers (id, supplier_code, name, contact_person, phone, email, address, specialization, company_id) VALUES")
W("('52000000-0000-0000-0000-000000000001', 'SUP-ZAR-001', 'Bunkar Sahkari Samiti Varanasi', 'Gopal Das Ansari', '+91 542 233 4488', 'bunkarsamiti@varanasilooms.org', 'Madanpura Weavers Lane, Varanasi, UP', 'Pure Handloom Katan & Kadhwa Silk', '$c2_id'),")
W("('52000000-0000-0000-0000-000000000002', 'SUP-ZAR-002', 'Surat Real Gold Zari Guild', 'Nilesh Jariwala', '+91 261 247 1133', 'zari@suratguild.in', 'Zampa Bazar, Surat, GJ', 'Pure Silver & Electrogilded Gold Zari', '$c2_id'),")
W("('52000000-0000-0000-0000-000000000003', 'SUP-ZAR-003', 'Bhagalpur Ahimsa Silk Co-op', 'Prabhat Mandal', '+91 641 242 7700', 'ahimsa@bhagalpursilk.in', 'Nathnagar, Bhagalpur, BR', 'Wild Tussar, Matka & Eri Silks', '$c2_id');")
W("")

# C2 Inventory Items (16)
W("-- Inventory Items (16)")
$c2_items = @(
    @{ id="62000000-0000-0000-0000-000000000001"; code="ITM-ZAR-001"; name="Varanasi Pure Katan Silk (Vermillion)"; cat="Fabric"; var="Vermillion Red"; unit="Meter"; sq=70.0; rq=16.0; p=3400.0; s=7500.0; sup="Bunkar Sahkari Samiti Varanasi"; br="HQ-DEL" },
    @{ id="62000000-0000-0000-0000-000000000002"; code="ITM-ZAR-002"; name="Kadhwa Floral Booti Silk (Cobalt)"; cat="Fabric"; var="Cobalt Blue"; unit="Meter"; sq=55.0; rq=12.0; p=3800.0; s=8200.0; sup="Bunkar Sahkari Samiti Varanasi"; br="HQ-DEL" },
    @{ id="62000000-0000-0000-0000-000000000003"; code="ITM-ZAR-003"; name="Pure Jamdani Muslin Silk (Blush)"; cat="Fabric"; var="Blush Pink"; unit="Meter"; sq=45.0; rq=10.0; p=2900.0; s=6400.0; sup="Bunkar Sahkari Samiti Varanasi"; br="BR-BOM" },
    @{ id="62000000-0000-0000-0000-000000000004"; code="ITM-ZAR-004"; name="Wild Tussar Ahimsa Silk (Natural)"; cat="Fabric"; var="Raw Beige"; unit="Meter"; sq=60.0; rq=15.0; p=2100.0; s=4800.0; sup="Bhagalpur Ahimsa Silk Co-op"; br="BR-JPR" },
    @{ id="62000000-0000-0000-0000-000000000005"; code="ITM-ZAR-005"; name="Electrogilded Real Gold Zari Spools"; cat="Trim"; var="Fine Gold Zari"; unit="Pack"; sq=50.0; rq=10.0; p=1600.0; s=3600.0; sup="Surat Real Gold Zari Guild"; br="BR-VNS" },
    @{ id="62000000-0000-0000-0000-000000000006"; code="ITM-ZAR-006"; name="Silver Tested Zari Bobbins (200g)"; cat="Trim"; var="Pure Silver Tested"; unit="Pack"; sq=40.0; rq=8.0; p=1100.0; s=2500.0; sup="Surat Real Gold Zari Guild"; br="BR-VNS" },
    @{ id="62000000-0000-0000-0000-000000000007"; code="ITM-ZAR-007"; name="Matka Heavy Handloom Silk (Charcoal)"; cat="Fabric"; var="Charcoal Grey"; unit="Meter"; sq=50.0; rq=12.0; p=2400.0; s=5200.0; sup="Bhagalpur Ahimsa Silk Co-op"; br="BR-JPR" },
    @{ id="62000000-0000-0000-0000-000000000008"; code="ITM-ZAR-008"; name="Handwoven Paisley Border Strip (9m)"; cat="Trim"; var="Kadhwa Paisley"; unit="Roll"; sq=30.0; rq=6.0; p=3200.0; s=7100.0; sup="Bunkar Sahkari Samiti Varanasi"; br="HQ-DEL" },
    @{ id="62000000-0000-0000-0000-000000000009"; code="ITM-ZAR-009"; name="Habutai Silk Ultra-Soft Lining"; cat="Fabric"; var="Neutral Cream"; unit="Meter"; sq=85.0; rq=20.0; p=650.0; s=1500.0; sup="Bunkar Sahkari Samiti Varanasi"; br="BR-BOM" },
    @{ id="62000000-0000-0000-0000-000000000010"; code="ITM-ZAR-010"; name="Antique MOP (Mother of Pearl) Buttons"; cat="Trim"; var="Natural Pearl 18L"; unit="Pack"; sq=40.0; rq=8.0; p=750.0; s=1800.0; sup="Surat Real Gold Zari Guild"; br="BR-JPR" },
    @{ id="62000000-0000-0000-0000-000000000011"; code="ITM-ZAR-011"; name="Tanchoi Brocade Weave (Deep Plum)"; cat="Fabric"; var="Plum Gold"; unit="Meter"; sq=55.0; rq=10.0; p=3600.0; s=7900.0; sup="Bunkar Sahkari Samiti Varanasi"; br="HQ-DEL" },
    @{ id="62000000-0000-0000-0000-000000000012"; code="ITM-ZAR-012"; name="Organza Tissue Facing Ribbon (50m)"; cat="Trim"; var="Translucent Gold"; unit="Roll"; sq=35.0; rq=7.0; p=800.0; s=1900.0; sup="Surat Real Gold Zari Guild"; br="BR-BOM" },
    @{ id="62000000-0000-0000-0000-000000000013"; code="ITM-ZAR-013"; name="Eri Peace Silk Handspun Yardage"; cat="Fabric"; var="Warm Ivory"; unit="Meter"; sq=45.0; rq=9.0; p=2800.0; s=6000.0; sup="Bhagalpur Ahimsa Silk Co-op"; br="BR-VNS" },
    @{ id="62000000-0000-0000-0000-000000000014"; code="ITM-ZAR-014"; name="Tailor Horsehair Canvas (Jacket)"; cat="Trim"; var="Natural Wool-Hair"; unit="Meter"; sq=60.0; rq=12.0; p=850.0; s=1950.0; sup="Bhagalpur Ahimsa Silk Co-op"; br="BR-JPR" },
    @{ id="62000000-0000-0000-0000-000000000015"; code="ITM-ZAR-015"; name="Gilded Marori Braided Cord (25m)"; cat="Trim"; var="Twisted Gold"; unit="Roll"; sq=30.0; rq=5.0; p=950.0; s=2200.0; sup="Surat Real Gold Zari Guild"; br="HQ-DEL" },
    @{ id="62000000-0000-0000-0000-000000000016"; code="ITM-ZAR-016"; name="Banarasi Shikargah Pure Brocade"; cat="Fabric"; var="Hunting Jaal Ruby"; unit="Meter"; sq=35.0; rq=8.0; p=5500.0; s=12000.0; sup="Bunkar Sahkari Samiti Varanasi"; br="HQ-DEL" }
)
foreach ($it in $c2_items) {
    W("INSERT INTO inventory_items (id, item_code, name, category, variant, unit, stock_qty, reserved_qty, reorder_level, purchase_price, selling_price, supplier_name, image_url, status, branch, company_id) VALUES ('$($it.id)', '$($it.code)', '$($it.name)', '$($it.cat)', '$($it.var)', '$($it.unit)', $($it.sq), $($it.rq), 10.0, $($it.p), $($it.s), '$($it.sup)', '/front end/assets/mannequin-duo.jpg', 'IN_STOCK', '$($it.br)', '$c2_id');")
}
W("")

# C2 Stock Movements & Inter-Branch Transfers (28)
W("-- Stock Movements & Inter-Branch Transfers (28)")
$c2_transfers = @(
    @{ ref="TR-ZAR-2026-001"; from="BR-VNS"; to="HQ-DEL"; itm="62000000-0000-0000-0000-000000000001"; qty=8.0; notes="Transfer: BR-VNS -> HQ-DEL (Varanasi loom shipment of Katan silk)" },
    @{ ref="TR-ZAR-2026-002"; from="HQ-DEL"; to="BR-BOM"; itm="62000000-0000-0000-0000-000000000003"; qty=5.0; notes="Transfer: HQ-DEL -> BR-BOM (Jamdani yardage for South Mumbai client)" },
    @{ ref="TR-ZAR-2026-003"; from="BR-VNS"; to="BR-JPR"; itm="62000000-0000-0000-0000-000000000005"; qty=6.0; notes="Transfer: BR-VNS -> BR-JPR (Gold zari bobbins for bandhgala embroidery)" },
    @{ ref="TR-ZAR-2026-004"; from="BR-JPR"; to="HQ-DEL"; itm="62000000-0000-0000-0000-000000000004"; qty=10.0; notes="Transfer: BR-JPR -> HQ-DEL (Raw tussar silk transfer for bridal jacket)" },
    @{ ref="TR-ZAR-2026-005"; from="HQ-DEL"; to="BR-BOM"; itm="62000000-0000-0000-0000-000000000008"; qty=4.0; notes="Transfer: HQ-DEL -> BR-BOM (Paisley border roll for custom saree)" },
    @{ ref="TR-ZAR-2026-006"; from="BR-BOM"; to="HQ-DEL"; itm="62000000-0000-0000-0000-000000000009"; qty=12.0; notes="Transfer: BR-BOM -> HQ-DEL (Habutai lining fabric re-balancing)" },
    @{ ref="TR-ZAR-2026-007"; from="BR-VNS"; to="HQ-DEL"; itm="62000000-0000-0000-0000-000000000016"; qty=6.0; notes="Transfer: BR-VNS -> HQ-DEL (Shikargah heirloom brocade delivery)" },
    @{ ref="TR-ZAR-2026-008"; from="HQ-DEL"; to="BR-JPR"; itm="62000000-0000-0000-0000-000000000015"; qty=5.0; notes="Transfer: HQ-DEL -> BR-JPR (Gilded marori cord for regal collar)" }
)
$smIdx = 1
foreach ($tr in $c2_transfers) {
    $smId = "72000000-0000-0000-0000-" + $smIdx.ToString("D12")
    W("INSERT INTO stock_movements (id, item_id, movement_type, quantity, reference, notes, moved_by, moved_at, company_id) VALUES ('$smId', '$($tr.itm)', 'ISSUE', $($tr.qty), '$($tr.ref)', '$($tr.notes)', 'Ananya Sen', NOW() - INTERVAL '$($smIdx) days', '$c2_id');")
    $smIdx++
}
for ($i=1; $i -le 16; $i++) {
    $smId = "72000000-0000-0000-0000-" + ($smIdx + $i).ToString("D12")
    $itId = "62000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO stock_movements (id, item_id, movement_type, quantity, reference, notes, moved_by, moved_at, company_id) VALUES ('$smId', '$itId', 'RECEIPT', 50.0, 'PO-ZAR-2026-$($i.ToString('D3'))', 'Weaving loom batch verified and accepted', 'Aarti Deshmukh', NOW() - INTERVAL '$($i + 4) days', '$c2_id');")
}
W("")

# C2 Customers (28)
W("-- Customers (28)")
$c2_cust_names = @(
    "Shreya Ghoshal", "Sunidhi Chauhan", "Vidya Balan", "Konkona Sen", "Rani Mukerji",
    "Sushmita Sen", "Dia Mirza", "Kalki Koechlin", "Nandita Das", "Radhika Apte",
    "Tisca Chopra", "Sobhita Dhulipala", "Aditi Rao", "Mrunal Thakur", "Wamiqa Gabbi",
    "Shabana Azmi", "Tanvi Azmi", "Shefali Shah", "Rasika Dugal", "Tillotama Shome",
    "Kriti Sanon", "Kiara Advani", "Shraddha Kapoor", "Ananya Panday", "Shanaya Kapoor",
    "Khushi Kapoor", "Sara Ali Khan", "Janhvi Kapoor"
)
$c2_branches_pool = @("HQ-DEL", "BR-BOM", "BR-VNS", "BR-JPR")
$c2_garment_types = @("Katan Silk Saree", "Jamdani Cape Saree", "Tussar Bandhgala", "Brocade Sherwani Coat", "Tanchoi Kurta Set")

for ($i=1; $i -le 28; $i++) {
    $phone = "+91 98222 " + $i.ToString("D5")
    $name = $c2_cust_names[$i-1]
    $first = $name.Split(" ")[0]
    $last = $name.Split(" ")[1]
    $branch = $c2_branches_pool[($i % 4)]
    $city = if ($branch -eq "HQ-DEL") { "New Delhi" } elseif ($branch -eq "BR-BOM") { "Mumbai" } elseif ($branch -eq "BR-VNS") { "Varanasi" } else { "Jaipur" }
    $tier = if ($i % 4 -eq 0) { "VIP" } elseif ($i % 3 -eq 0) { "PREMIUM" } else { "REGULAR" }
    $fav = $c2_garment_types[($i % 5)]
    $spend = ($i * 16000.0) + 52000.0
    $bal = if ($i % 2 -ne 0) { 32000.0 } else { 0.0 }
    
    W("INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, location, street_address, city, state, pincode, tier, total_spend, balance, favorite_garment, measurements_on_file, fit_preference, preferred_channel, branch, company_id) VALUES (")
    W("  '$phone', '$name', '$first', '$last', 'Ms.', 'Female', '$($first.ToLower()).$($last.ToLower())@handloomclient.in', '$city', 'Suite $i, Heritage Enclave', '$city', 'India', '110001', '$tier', $spend, $bal, '$fav', TRUE, 'Fluid Classic Handloom Fit', 'WhatsApp', '$branch', '$c2_id'")
    W(");")
    
    $bmId = "82000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, armhole, sleeve_length, front_neck_depth, back_neck_depth, recorded_by, company_id) VALUES (")
    W("  '$bmId', '$phone', '$name', '$fav', 'CURRENT', TRUE, 1, 'in', 14.75, 36.5, 31.0, 28.5, 39.0, 15.5, 17.0, 20.0, 8.0, 9.5, 'Ananya Sen', '$c2_id'")
    W(");")
    
    $cmId = "92000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO customer_measurements (id, customer_mobile, garment_type, bust, waist, full_hip, shoulder, sleeve_length, armhole, front_neck, back_neck, garment_length, recorded_by, is_active_profile, company_id) VALUES (")
    W("  '$cmId', '$phone', '$fav', 36.5, 28.5, 39.0, 14.75, 20.0, 17.0, 8.0, 9.5, 52.0, 'Ananya Sen', TRUE, '$c2_id'")
    W(");")
    
    $mpId = "a2000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO measurement_profiles (id, customer_mobile, garment_type, recorded_by, notes, branch, company_id) VALUES (")
    W("  '$mpId', '$phone', '$fav', 'Ananya Sen', 'Tailored for drape over Banarasi Katan silk pallu.', '$branch', '$c2_id'")
    W(");")
    
    if ($i -le 22) {
        $cnId = "b2000000-0000-0000-0000-" + $i.ToString("D12")
        W("INSERT INTO customer_notes (id, customer_mobile, note_text, author_name, author_badge, category, company_id) VALUES (")
        W("  '$cnId', '$phone', 'Collector of authentic Kadhwa weaves; avoids synthetic blends.', 'Ananya Sen', 'AS', 'PREFERENCE', '$c2_id'")
        W(");")
    }
}
W("")

# C2 Orders (48) & Garments (48)
W("-- Orders (48) & Garments (48)")
$c2_stages_cycle = @("ORDER_TAKEN", "MEASURING", "LOOM_SETUP", "CUTTING", "ZARI_WORK", "ASSEMBLY", "FITTING", "QC_DISPATCH")
$c2_statuses = @("PENDING", "IN_PRODUCTION", "IN_PRODUCTION", "IN_PRODUCTION", "IN_PRODUCTION", "IN_PRODUCTION", "READY", "COMPLETED")

for ($j=1; $j -le 48; $j++) {
    $custIdx = (($j - 1) % 28) + 1
    $phone = "+91 98222 " + $custIdx.ToString("D5")
    $custName = $c2_cust_names[$custIdx - 1]
    $ordId = "c2100000-0000-0000-0000-" + $j.ToString("D12")
    $garId = "d2100000-0000-0000-0000-" + $j.ToString("D12")
    $ordCode = "ORD-ZAR-" + $j.ToString("D3")
    $garCode = "GAR-ZAR-" + $j.ToString("D3")
    $branch = $c2_branches_pool[($j % 4)]
    $stage = $c2_stages_cycle[($j % 8)]
    $status = $c2_statuses[($j % 8)]
    $gType = $c2_garment_types[($j % 5)]
    $totAmount = 72000.0 + ($j * 2800.0)
    $advPaid = if ($status -eq "COMPLETED") { $totAmount } else { [Math]::Round($totAmount * 0.5, 2) }
    $balAmount = [Math]::Round($totAmount - $advPaid, 2)
    $payStatus = if ($balAmount -eq 0) { "PAID" } else { "PARTIAL" }
    
    W("INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, status, order_date, due_date, customer_mobile, customer_name, expected_delivery_date, advance_paid, total_amount, balance_amount, current_stage, branch, company_id) VALUES (")
    W("  '$ordId', '$ordCode', '$gType', 'Handwoven bespoke $gType in pure Banarasi Katan silk', 'Kashi Katan: Real Gold Zari', $totAmount, '$status', CURRENT_DATE - INTERVAL '$($52 - $j) days', CURRENT_DATE + INTERVAL '$($j * 2) days', '$phone', '$custName', CURRENT_DATE + INTERVAL '$($j * 2) days', $advPaid, $totAmount, $balAmount, '$stage', '$branch', '$c2_id'")
    W(");")
    
    W("INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, collection_name, production_stage, material_status, priority, payment_status, paid_amount, total_amount, status, designer, assigned_to, due_date, branch, company_id) VALUES (")
    W("  '$garId', '$garCode', '$ordId', '$ordCode', '$custName', '$phone', 'Masterweave $gType for $custName', '$gType', 'Kashi Katan: Real Gold Zari', '$stage', 'READY', 'NORMAL', '$payStatus', $advPaid, $totAmount, '$status', 'Ananya Sen', 'Govindram Ansari', CURRENT_DATE + INTERVAL '$($j * 2) days', '$branch', '$c2_id'")
    W(");")
    
    $ops1 = "e2100000-0000-0000-0000-" + (($j * 2) - 1).ToString("D12")
    $ops2 = "e2100000-0000-0000-0000-" + ($j * 2).ToString("D12")
    W("INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes, company_id) VALUES ('$ops1', '$ordId', 'ORDER_TAKEN', NOW() - INTERVAL '$($55 - $j) days', 'Ananya Sen', 'Textile selection finalized', '$c2_id');")
    W("INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes, company_id) VALUES ('$ops2', '$ordId', '$stage', NOW() - INTERVAL '3 days', 'Govindram Ansari', 'Pit loom weave in progress', '$c2_id');")
    
    $ps1 = "f2100000-0000-0000-0000-" + (($j * 2) - 1).ToString("D12")
    $ps2 = "f2100000-0000-0000-0000-" + ($j * 2).ToString("D12")
    W("INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, started_at, sort_order, notes, company_id) VALUES ('$ps1', '$ordId', 'Loom Jacquard Card Graph', 'e2000000-0000-0000-0000-000000000002', 'COMPLETED', NOW() - INTERVAL '$($48 - $j) days', 1, 'Punch card verified', '$c2_id');")
    W("INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, started_at, sort_order, notes, company_id) VALUES ('$ps2', '$ordId', '$stage', 'e2000000-0000-0000-0000-000000000005', 'IN_PROGRESS', NOW() - INTERVAL '6 days', 2, 'Handloom weaving & edge finishing', '$c2_id');")
    
    $qcId = "12100000-0000-0000-0000-" + $j.ToString("D12")
    W("INSERT INTO qc_checklists (id, order_id, check_point, result, checked_by, checked_at, remarks, sort_order, company_id) VALUES ('$qcId', '$ordId', 'Silk Purity & Gold Zari Burn Test', 'PASSED', 'e2000000-0000-0000-0000-000000000006', NOW() - INTERVAL '1 days', '100% mulberry silk certified with genuine silver zari', 1, '$c2_id');")
    
    $payId = "22100000-0000-0000-0000-" + $j.ToString("D12")
    W("INSERT INTO payments (id, order_id, customer_mobile, total_amount, paid_amount, status, due_date, notes, company_id) VALUES ('$payId', '$ordId', '$phone', $totAmount, $advPaid, '$payStatus', CURRENT_DATE + INTERVAL '$($j * 2) days', 'Handloom booking advance deposit', '$c2_id');")
    
    $pt1 = "32100000-0000-0000-0000-" + (($j * 2) - 1).ToString("D12")
    W("INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, notes, company_id) VALUES ('$pt1', '$payId', $advPaid, 'BANK_TRANSFER', 'Ananya Sen', 'RTGS/HDFC/$($j.ToString('D6'))', 'Booking confirmation advance', '$c2_id');")
    
    if ($balAmount -eq 0) {
        $pt2 = "32100000-0000-0000-0000-" + ($j * 2).ToString("D12")
        W("INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, notes, company_id) VALUES ('$pt2', '$payId', $advPaid, 'CREDIT_CARD', 'Priyadarshini Mehta', 'CC/AMEX/$($j.ToString('D6'))', 'Settlement on boutique collection', '$c2_id');")
    }
    
    if ($j -le 22) {
        $trlId = "42100000-0000-0000-0000-" + $j.ToString("D12")
        $trlCode = "TRL-ZAR-" + $j.ToString("D3")
        W("INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, fit_preference, customer_feedback, trial_attempt, alteration_count, branch, company_id) VALUES (")
        W("  '$trlId', '$trlCode', '$ordId', '$ordCode', '$phone', '$custName', '$gType', 'Kashi Katan: Real Gold Zari', CURRENT_DATE + INTERVAL '$j days', '03:00 PM', 'First Trial', 'UPCOMING', 'PENDING', 'Ananya Sen', CURRENT_DATE + INTERVAL '$($j * 2) days', 'Fluid Classic Handloom Fit', 'Pleat and fall inspection in showroom', 1, 0, '$branch', '$c2_id'")
        W(");")
        
        if ($j -le 16) {
            $altId = "52100000-0000-0000-0000-" + $j.ToString("D12")
            W("INSERT INTO trial_alterations (id, trial_id, description, category, completed, assigned_tailor, priority, target_date, tailor_notes, status, company_id) VALUES (")
            W("  '$altId', '$trlId', 'Refine sleeve lining attachment on bandhgala', 'Lining', FALSE, 'Sumit Karmakar', 'Normal', CURRENT_DATE + INTERVAL '$($j + 2) days', 'Secure hand stitches.', 'PENDING', '$c2_id'")
            W(");")
        }
    }
}
W("")

# C2 Designs (14)
W("-- Designs (14)")
for ($d=1; $d -le 14; $d++) {
    $desId = "62100000-0000-0000-0000-" + $d.ToString("D12")
    $desCode = "DES-ZAR-" + $d.ToString("D3")
    $ordId = "c2100000-0000-0000-0000-" + $d.ToString("D12")
    $custIdx = (($d - 1) % 28) + 1
    $phone = "+91 98222 " + $custIdx.ToString("D5")
    W("INSERT INTO designs (id, design_code, title, garment_type, order_id, status, designer, thumbnail_url, customer_mobile, collection, primary_fabric, estimated_cost, suggested_price, production_status, times_used, image_urls, notes, created_by, company_id) VALUES (")
    W("  '$desId', '$desCode', 'Katan Weave Architectural Saree #$d', 'Katan Silk Saree', '$ordId', 'APPROVED', 'Ananya Sen', '/front end/assets/mannequin-duo.jpg', '$phone', 'Kashi Katan: Real Gold Zari', 'Pure Katan Handloom Silk', 38000.0, 105000.0, 'Active', $d, json_build_array('/front end/assets/mannequin-duo.jpg')::text, 'Geometrical kadhwa booti with antique temple border.', 'Ananya Sen', '$c2_id'")
    W(");")
}
W("")

# C2 Enquiries (12) & Appointments (12)
W("-- Enquiries (12) & Appointments (12)")
for ($en=1; $en -le 12; $en++) {
    $enqId = "72100000-0000-0000-0000-" + $en.ToString("D12")
    $enqCode = "ENQ-ZAR-" + $en.ToString("D3")
    $apptId = "82100000-0000-0000-0000-" + $en.ToString("D12")
    $ordId = "c2100000-0000-0000-0000-" + $en.ToString("D12")
    $name = $c2_cust_names[$en - 1]
    $phone = "+91 98222 " + $en.ToString("D5")
    $branch = $c2_branches_pool[($en % 4)]
    
    W("INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, source, estimated_budget, branch, company_id) VALUES (")
    W("  '$enqId', '$enqCode', '$name', '$phone', 'enquiry$en@handloomclient.in', 'Katan Silk Saree', 'Kala Ghoda boutique visitor interested in custom bridal weave', 'CONVERTED', 'Ananya Sen', 'WALK_IN', 140000.0, '$branch', '$c2_id'")
    W(");")
    
    W("INSERT INTO appointments (id, order_id, appt_type, scheduled_at, duration_minutes, status, staff_assigned, notes, customer_mobile, company_id) VALUES (")
    W("  '$apptId', '$ordId', 'CONSULTATION', NOW() + INTERVAL '$en days', 45, 'SCHEDULED', 'Ananya Sen', 'Showroom consultation and touch-and-feel of pit loom swatches', '$phone', '$c2_id'")
    W(");")
}
W("")

# ==============================================================================
# COMPANY 3: AURA BESPOKE STUDIO
# ==============================================================================
$c3_id = "c3000000-0000-0000-0000-000000000003"
W("-- ==============================================================================")
W("-- 3. COMPANY 3: AURA BESPOKE STUDIO (Architectural Corsetry & Modern Couture)")
W("-- ==============================================================================")
W("INSERT INTO company_settings (id, company_name, short_name, tagline, owner_name, business_type, gstin, pan_number, primary_phone, whatsapp, email, website, street_address, city, state, pin_code, country, logo_base64, share_customers_across_branches, share_orders_across_branches, share_enquiries_across_branches, share_measurements_across_branches, share_inventory_across_branches, share_garments_across_branches, share_trials_across_branches) VALUES (")
W("  '$c3_id', 'Aura Bespoke Studio', 'AURABESPOKE', 'Architectural Corsetry & Modern Red-Carpet Couture', 'Tarun Varma & Shalini Reddy', 'Contemporary Fusion Atelier', '29CCCCA3333P1ZZ', 'CCCCA3333P', '+91 80 4112 7700', '+91 98333 00000', 'studio@aurabespoke.in', 'https://aurabespoke.in', '842 12th Main, HAL 2nd Stage, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 'India', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE")
W(") ON CONFLICT (id) DO NOTHING;")
W("")

# C3 Branches (4)
$c3_branches = @(
    @{ id="b3000000-0000-0000-0000-000000000001"; code="HQ-BLR"; name="Indiranagar Glasshouse HQ";  type="FLAGSHIP"; addr="842 12th Main, Indiranagar";  city="Bengaluru"; state="Karnataka";   pin="560038"; phone="+91 80 4112 7700"; hq=$true },
    @{ id="b3000000-0000-0000-0000-000000000002"; code="BR-HYD"; name="Jubilee Hills Bespoke Villa"; type="BOUTIQUE"; addr="Road No. 36, Jubilee Hills";   city="Hyderabad"; state="Telangana";   pin="500033"; phone="+91 40 2355 9100"; hq=$false },
    @{ id="b3000000-0000-0000-0000-000000000003"; code="BR-MAA"; name="Khader Nawaz Khan Salon";     type="STUDIO";   addr="12 Khader Nawaz Khan Road";    city="Chennai";   state="Tamil Nadu";   pin="600006"; phone="+91 44 2833 4200"; hq=$false },
    @{ id="b3000000-0000-0000-0000-000000000004"; code="BR-PUN"; name="Koregaon Park Studio";        type="STUDIO";   addr="Lane 7, Koregaon Park";        city="Pune";      state="Maharashtra"; pin="411001"; phone="+91 20 2615 8800"; hq=$false }
)

W("-- Branches (4)")
foreach ($b in $c3_branches) {
    $hqVal = if ($b.hq) { "TRUE" } else { "FALSE" }
    W("INSERT INTO branches (id, branch_code, name, type, street_address, city, state, pin_code, country, phone, whatsapp, email, is_headquarters, active, working_hours, company_id) VALUES ('$($b.id)', '$($b.code)', '$($b.name)', '$($b.type)', '$($b.addr)', '$($b.city)', '$($b.state)', '$($b.pin)', 'India', '$($b.phone)', '+91 98333 00000', 'studio@aurabespoke.in', $hqVal, TRUE, 'Mon-Sat 10:00-20:30', '$c3_id');")
}
W("")

# C3 Employees (6)
$c3_employees = @(
    @{ id="e3000000-0000-0000-0000-000000000001"; code="EMP-AUR-001"; name="Tarun Varma"; role="DESIGNER"; spec="Architectural Corsets & Gowns"; phone="+91 98333 11001"; email="tarun@aurabespoke.in" },
    @{ id="e3000000-0000-0000-0000-000000000002"; code="EMP-AUR-002"; name="Shalini Reddy"; role="DESIGNER"; spec="Corsetry Bone Sculpting, Hyderabad"; phone="+91 98333 11002"; email="shalini@aurabespoke.in" },
    @{ id="e3000000-0000-0000-0000-000000000003"; code="EMP-AUR-003"; name="Karthik Sundaram"; role="TAILOR"; spec="Master Tuxedo Tailor, Bangalore"; phone="+91 98333 11003"; email="karthik@aurabespoke.in" },
    @{ id="e3000000-0000-0000-0000-000000000004"; code="EMP-AUR-004"; name="Lakshmi Narayanan"; role="TAILOR"; spec="Pre-Pleated Organza Drape, Chennai"; phone="+91 98333 11004"; email="lakshmi@aurabespoke.in" },
    @{ id="e3000000-0000-0000-0000-000000000005"; code="EMP-AUR-005"; name="Devika Deshpande"; role="ARTISAN"; spec="Spiral Bone Channeling & Moulding"; phone="+91 98333 11005"; email="devika@aurabespoke.in" },
    @{ id="e3000000-0000-0000-0000-000000000006"; code="EMP-AUR-006"; name="Sandeep Nair"; role="QC"; spec="Tensile Stress & Seam Auditor"; phone="+91 98333 11006"; email="sandeep@aurabespoke.in" }
)
W("-- Employees (6)")
foreach ($e in $c3_employees) {
    W("INSERT INTO employees (id, employee_code, name, phone, email, role, status, joined_date, specialization, company_id) VALUES ('$($e.id)', '$($e.code)', '$($e.name)', '$($e.phone)', '$($e.email)', '$($e.role)', 'ACTIVE', '2022-01-20', '$($e.spec)', '$c3_id');")
}
W("UPDATE branches SET manager_id = 'e3000000-0000-0000-0000-000000000001' WHERE id = 'b3000000-0000-0000-0000-000000000001';")
W("UPDATE branches SET manager_id = 'e3000000-0000-0000-0000-000000000002' WHERE id = 'b3000000-0000-0000-0000-000000000002';")
W("UPDATE branches SET manager_id = 'e3000000-0000-0000-0000-000000000004' WHERE id = 'b3000000-0000-0000-0000-000000000003';")
W("UPDATE branches SET manager_id = 'e3000000-0000-0000-0000-000000000005' WHERE id = 'b3000000-0000-0000-0000-000000000004';")
W("")

# C3 App Users & Profiles (3)
W("-- App Users & Profiles (3)")
W("INSERT INTO app_users (id, username, password_hash, full_name, role, active, email, phone, designation, department, assigned_branch, allowed_branches, company_id) VALUES")
W("('13000000-0000-0000-0000-000000000001', 'aura_owner', crypt('Admin@123', gen_salt('bf')), 'Tarun Varma', 'OWNER', TRUE, 'tarun@aurabespoke.in', '+91 98333 00000', 'Creative Director & Co-Founder', 'Executive', 'HQ-BLR', json_build_array('HQ-BLR','BR-HYD','BR-MAA','BR-PUN')::text, '$c3_id'),")
W("('13000000-0000-0000-0000-000000000002', 'aura_hyd', crypt('Admin@123', gen_salt('bf')), 'Shalini Reddy', 'BRANCH_ADMIN', TRUE, 'shalini@aurabespoke.in', '+91 98333 11002', 'Hyderabad Villa Manager', 'Operations', 'BR-HYD', json_build_array('BR-HYD')::text, '$c3_id'),")
W("('13000000-0000-0000-0000-000000000003', 'aura_chennai', crypt('Admin@123', gen_salt('bf')), 'Lakshmi Narayanan', 'BRANCH_ADMIN', TRUE, 'lakshmi@aurabespoke.in', '+91 98333 11004', 'Chennai Salon Manager', 'Operations', 'BR-MAA', json_build_array('BR-MAA')::text, '$c3_id');")
W("")

W("INSERT INTO user_profiles (id, user_id, full_name, display_title, department, email, phone, assigned_branch, clearance_level, system_role_label, privileges_summary, company_id) VALUES")
W("('23000000-0000-0000-0000-000000000001', '13000000-0000-0000-0000-000000000001', 'Tarun Varma', 'Creative Director', 'Executive', 'tarun@aurabespoke.in', '+91 98333 00000', 'HQ-BLR', 'Tier 1 (Executive)', 'Company Owner', 'Universal Studio Administrative Control', '$c3_id'),")
W("('23000000-0000-0000-0000-000000000002', '13000000-0000-0000-0000-000000000002', 'Shalini Reddy', 'Hyderabad Villa Manager', 'Operations', 'shalini@aurabespoke.in', '+91 98333 11002', 'BR-HYD', 'Tier 2 (Manager)', 'Branch Manager', 'Hyderabad Studio Leadership', '$c3_id'),")
W("('23000000-0000-0000-0000-000000000003', '13000000-0000-0000-0000-000000000003', 'Lakshmi Narayanan', 'Chennai Salon Manager', 'Operations', 'lakshmi@aurabespoke.in', '+91 98333 11004', 'BR-MAA', 'Tier 2 (Manager)', 'Branch Manager', 'Chennai Studio Leadership', '$c3_id');")
W("")

# C3 Stage Definitions (8)
W("-- Stage Definitions (8)")
$c3_stages = @(
    @{ id="33000000-0000-0000-0000-000000000001"; key="ORDER_TAKEN";   name="Concept Consultation & Deposit"; desc="Silhouette mapping, bone channel blueprint"; role="STAFF";    dept="Concept Salon";  col="badge-primary"; sort=10 },
    @{ id="33000000-0000-0000-0000-000000000002"; key="MEASURING";     name="Anatomical Scan & Curve Mapping"; desc="Apex angle, waist reduction allowance";       role="DESIGNER"; dept="Fit Suite";      col="badge-info";    sort=20 },
    @{ id="33000000-0000-0000-0000-000000000003"; key="CAD_PATTERN";   name="Vector CAD Pattern Grading";      desc="Algorithmic tension allowance pattern grading";role="DESIGNER"; dept="CAD Lab";        col="badge-primary"; sort=30 },
    @{ id="33000000-0000-0000-0000-000000000004"; key="CORSET_BONING"; name="Spiral Steel Channel Insertion";  desc="Memory steel bone insertion & twill capping";  role="TAILOR";   dept="Boning Desk";    col="badge-warning"; sort=40 },
    @{ id="33000000-0000-0000-0000-000000000005"; key="CONSTRUCTION";  name="Liquid Shell Draping";           desc="Micro-organza and fluid crepe drape assembly"; role="TAILOR";   dept="Assembly Studio";col="badge-dark";    sort=50 },
    @{ id="33000000-0000-0000-0000-000000000006"; key="FITTING";       name="Corset Cinch Trial";              desc="Checking breathing ease and waist reduction";  role="DESIGNER"; dept="Fitting Suite";  col="badge-purple";  sort=60 },
    @{ id="33000000-0000-0000-0000-000000000007"; key="QC_PRESS";      name="High-Pressure Vacuum Press";      desc="Seam tension test and industrial vacuum press";role="QC";       dept="QC Station";     col="badge-warning"; sort=70 },
    @{ id="33000000-0000-0000-0000-000000000008"; key="FINAL_DISPATCH";name="Runway Luxury Packaging";        desc="Hardbox magnetic packaging with satin garment cover";role="STAFF";dept="Concierge Desk";col="badge-success"; sort=80 }
)
foreach ($st in $c3_stages) {
    W("INSERT INTO stage_definitions (id, stage_key, display_name, description, required_role, dept_label, color_class, sort_order, active, company_id) VALUES ('$($st.id)', '$($st.key)', '$($st.name)', '$($st.desc)', '$($st.role)', '$($st.dept)', '$($st.col)', $($st.sort), TRUE, '$c3_id');")
}
W("")

# C3 Collections (3)
W("-- Collections (3)")
W("INSERT INTO collections (id, code, name, subtitle, description, season, year, status, designer, branch, launch_date, is_featured, cover_image_url, progress_percentage, company_id) VALUES")
W("('43000000-0000-0000-0000-000000000001', 'COL-AUR-2026-A', 'Metropolis: Structured Corsetry', 'Victorian Steel Boning Meets Modern Gowns', 'Internal architectural steel corsetry and sculpted skirts.', 'Spring 2026', 2026, 'ACTIVE', 'Tarun Varma', 'HQ-BLR', '2026-01-20', TRUE, '/front end/assets/pink_silk.jpg', 80, '$c3_id'),")
W("('43000000-0000-0000-0000-000000000002', 'COL-AUR-2026-B', 'Liquid Organza: Pre-Draped Sarees', 'Molten Lilac & Gunmetal Pre-Stitched Sarees', 'Zero-fuss pre-draped cocktail gowns with pleated pallus.', 'Resort 2026', 2026, 'ACTIVE', 'Shalini Reddy', 'BR-HYD', '2026-02-18', TRUE, '/front end/assets/mannequin-duo.jpg', 72, '$c3_id'),")
W("('43000000-0000-0000-0000-000000000003', 'COL-AUR-2026-C', 'Sovereign Line: Architectural Tuxedos', 'Architectural Shoulders & Pochampally Piping', 'Sharply tailored power dressing in black crepe viscose.', 'Autumn 2026', 2026, 'ACTIVE', 'Tarun Varma', 'BR-MAA', '2026-03-01', FALSE, '/front end/assets/pink_silk.jpg', 65, '$c3_id');")
W("")

# C3 Suppliers (3)
W("-- Suppliers (3)")
W("INSERT INTO suppliers (id, supplier_code, name, contact_person, phone, email, address, specialization, company_id) VALUES")
W("('53000000-0000-0000-0000-000000000001', 'SUP-AUR-001', 'Pochampally Handloom Union', 'K. Mallesh Goud', '+91 8685 244 112', 'orders@pochampallyunion.org', 'Weavers Colony, Pochampally, TS', 'Double Ikat Silk & Handwovens', '$c3_id'),")
W("('53000000-0000-0000-0000-000000000002', 'SUP-AUR-002', 'German Spiral Boning Imports', 'Jahangir Hussain', '+91 40 2474 8830', 'sales@boningimports.in', 'Abids Commercial Street, Hyderabad, TS', 'Galvanized Spiral Steel Boning & Busks', '$c3_id'),")
W("('53000000-0000-0000-0000-000000000003', 'SUP-AUR-003', 'Surat Micro-Organza & Crepe Mills', 'Vikramaditya Shah', '+91 261 249 5511', 'orders@suratorganza.com', 'Surat SEZ Textile Hub, Surat, GJ', 'Shimmer Liquid Organza & Heavy Crepe', '$c3_id');")
W("")

# C3 Inventory Items (15)
W("-- Inventory Items (15)")
$c3_items = @(
    @{ id="63000000-0000-0000-0000-000000000001"; code="ITM-AUR-001"; name="Spiral Steel Corset Bones (50pc pack)"; cat="Trim"; var="6mm x 30cm"; unit="Pack"; sq=55.0; rq=12.0; p=1250.0; s=2700.0; sup="German Spiral Boning Imports"; br="HQ-BLR" },
    @{ id="63000000-0000-0000-0000-000000000002"; code="ITM-AUR-002"; name="Heavy Structured Crepe Viscose (Onyx)"; cat="Fabric"; var="Midnight Onyx"; unit="Meter"; sq=80.0; rq=18.0; p=1150.0; s=2600.0; sup="Surat Micro-Organza & Crepe Mills"; br="HQ-BLR" },
    @{ id="63000000-0000-0000-0000-000000000003"; code="ITM-AUR-003"; name="Shimmer Liquid Organza (Lilac)"; cat="Fabric"; var="Lilac Iridescent"; unit="Meter"; sq=65.0; rq=15.0; p=1450.0; s=3200.0; sup="Surat Micro-Organza & Crepe Mills"; br="BR-HYD" },
    @{ id="63000000-0000-0000-0000-000000000004"; code="ITM-AUR-004"; name="Pochampally Ikat Monochrome Silk"; cat="Fabric"; var="Monochrome Geo"; unit="Meter"; sq=50.0; rq=10.0; p=1900.0; s=4100.0; sup="Pochampally Handloom Union"; br="BR-HYD" },
    @{ id="63000000-0000-0000-0000-000000000005"; code="ITM-AUR-005"; name="Reinforced Herringbone Twill Boning Tape"; cat="Trim"; var="Natural Cotton 20mm"; unit="Roll"; sq=45.0; rq=10.0; p=700.0; s=1600.0; sup="German Spiral Boning Imports"; br="HQ-BLR" },
    @{ id="63000000-0000-0000-0000-000000000006"; code="ITM-AUR-006"; name="Invisible Concealed Heavy YKK Zippers"; cat="Trim"; var="Assorted Neutrals"; unit="Pack"; sq=60.0; rq=15.0; p=650.0; s=1500.0; sup="German Spiral Boning Imports"; br="BR-MAA" },
    @{ id="63000000-0000-0000-0000-000000000007"; code="ITM-AUR-007"; name="Liquid Micro-Organza (Champagne Sheen)"; cat="Fabric"; var="Champagne"; unit="Meter"; sq=70.0; rq=16.0; p=1400.0; s=3100.0; sup="Surat Micro-Organza & Crepe Mills"; br="BR-MAA" },
    @{ id="63000000-0000-0000-0000-000000000008"; code="ITM-AUR-008"; name="Molded Bra Cups (Sculpted Contours)"; cat="Trim"; var="Sizes 32-38"; unit="Pair"; sq=50.0; rq=12.0; p=450.0; s=1100.0; sup="German Spiral Boning Imports"; br="HQ-BLR" },
    @{ id="63000000-0000-0000-0000-000000000009"; code="ITM-AUR-009"; name="Fluid Satin Back Crepe (Emerald)"; cat="Fabric"; var="Emerald Luxe"; unit="Meter"; sq=55.0; rq=12.0; p=1350.0; s=3000.0; sup="Surat Micro-Organza & Crepe Mills"; br="BR-PUN" },
    @{ id="63000000-0000-0000-0000-000000000010"; code="ITM-AUR-010"; name="Precision Stainless Steel Eyelet Rivets"; cat="Trim"; var="Silver Nickel 5mm"; unit="Pack"; sq=40.0; rq=8.0; p=800.0; s=1850.0; sup="German Spiral Boning Imports"; br="HQ-BLR" },
    @{ id="63000000-0000-0000-0000-000000000011"; code="ITM-AUR-011"; name="Structured Tuxedo Shoulder Pads (Tailored)"; cat="Trim"; var="Dense Felt"; unit="Pair"; sq=50.0; rq=10.0; p=350.0; s=900.0; sup="German Spiral Boning Imports"; br="BR-MAA" },
    @{ id="63000000-0000-0000-0000-000000000012"; code="ITM-AUR-012"; name="Pochampally Double Ikat Saree Silk (Wine)"; cat="Fabric"; var="Crimson & Wine"; unit="Meter"; sq=40.0; rq=8.0; p=2100.0; s=4600.0; sup="Pochampally Handloom Union"; br="BR-HYD" },
    @{ id="63000000-0000-0000-0000-000000000013"; code="ITM-AUR-013"; name="Cupro Antistatic Breathable Lining"; cat="Fabric"; var="Matte Black"; unit="Meter"; sq=90.0; rq=20.0; p=550.0; s=1300.0; sup="Surat Micro-Organza & Crepe Mills"; br="BR-PUN" },
    @{ id="63000000-0000-0000-0000-000000000014"; code="ITM-AUR-014"; name="Horsehair Hem Braid (50mm Crinoline)"; cat="Trim"; var="Black Stiff 50m"; unit="Roll"; sq=35.0; rq=7.0; p=950.0; s=2200.0; sup="German Spiral Boning Imports"; br="HQ-BLR" },
    @{ id="63000000-0000-0000-0000-000000000015"; code="ITM-AUR-015"; name="Liquid Micro-Organza (Gunmetal Silver)"; cat="Fabric"; var="Gunmetal Sheen"; unit="Meter"; sq=60.0; rq=14.0; p=1500.0; s=3300.0; sup="Surat Micro-Organza & Crepe Mills"; br="BR-HYD" }
)
foreach ($it in $c3_items) {
    W("INSERT INTO inventory_items (id, item_code, name, category, variant, unit, stock_qty, reserved_qty, reorder_level, purchase_price, selling_price, supplier_name, image_url, status, branch, company_id) VALUES ('$($it.id)', '$($it.code)', '$($it.name)', '$($it.cat)', '$($it.var)', '$($it.unit)', $($it.sq), $($it.rq), 10.0, $($it.p), $($it.s), '$($it.sup)', '/front end/assets/pink_silk.jpg', 'IN_STOCK', '$($it.br)', '$c3_id');")
}
W("")

# C3 Stock Movements & Inter-Branch Transfers (24)
W("-- Stock Movements & Inter-Branch Transfers (24)")
$c3_transfers = @(
    @{ ref="TR-AUR-2026-001"; from="HQ-BLR"; to="BR-HYD"; itm="63000000-0000-0000-0000-000000000001"; qty=10.0; notes="Transfer: HQ-BLR -> BR-HYD (Spiral boning packs for corset gowns)" },
    @{ ref="TR-AUR-2026-002"; from="BR-HYD"; to="HQ-BLR"; itm="63000000-0000-0000-0000-000000000004"; qty=8.0; notes="Transfer: BR-HYD -> HQ-BLR (Pochampally ikat silk for Bangalore client)" },
    @{ ref="TR-AUR-2026-003"; from="HQ-BLR"; to="BR-MAA"; itm="63000000-0000-0000-0000-000000000002"; qty=12.0; notes="Transfer: HQ-BLR -> BR-MAA (Onyx heavy crepe for tuxedo order)" },
    @{ ref="TR-AUR-2026-004"; from="BR-HYD"; to="BR-PUN"; itm="63000000-0000-0000-0000-000000000003"; qty=7.0; notes="Transfer: BR-HYD -> BR-PUN (Lilac liquid organza roll transfer)" },
    @{ ref="TR-AUR-2026-005"; from="HQ-BLR"; to="BR-PUN"; itm="63000000-0000-0000-0000-000000000005"; qty=5.0; notes="Transfer: HQ-BLR -> BR-PUN (Herringbone boning tape replenishment)" },
    @{ ref="TR-AUR-2026-006"; from="BR-MAA"; to="HQ-BLR"; itm="63000000-0000-0000-0000-000000000007"; qty=9.0; notes="Transfer: BR-MAA -> HQ-BLR (Champagne liquid micro-organza yardage)" }
)
$smIdx = 1
foreach ($tr in $c3_transfers) {
    $smId = "73000000-0000-0000-0000-" + $smIdx.ToString("D12")
    W("INSERT INTO stock_movements (id, item_id, movement_type, quantity, reference, notes, moved_by, moved_at, company_id) VALUES ('$smId', '$($tr.itm)', 'ISSUE', $($tr.qty), '$($tr.ref)', '$($tr.notes)', 'Tarun Varma', NOW() - INTERVAL '$($smIdx) days', '$c3_id');")
    $smIdx++
}
for ($i=1; $i -le 15; $i++) {
    $smId = "73000000-0000-0000-0000-" + ($smIdx + $i).ToString("D12")
    $itId = "63000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO stock_movements (id, item_id, movement_type, quantity, reference, notes, moved_by, moved_at, company_id) VALUES ('$smId', '$itId', 'RECEIPT', 45.0, 'PO-AUR-2026-$($i.ToString('D3'))', 'Boning and fabric inspection cleared', 'Sandeep Nair', NOW() - INTERVAL '$($i + 3) days', '$c3_id');")
}
W("")

# C3 Customers (26)
W("-- Customers (26)")
$c3_cust_names = @(
    "Samantha Ruth", "Nayanthara Kurian", "Trisha Krishnan", "Pooja Hegde", "Rashmika Mandanna",
    "Sai Pallavi", "Keerthy Suresh", "Tamannaah Bhatia", "Kajal Aggarwal", "Raashii Khanna",
    "Rakul Preet", "Shriya Saran", "Ileana Cruz", "Amala Paul", "Nithya Menen",
    "Parvathy Thiruvothu", "Anupama Parameswaran", "Malavika Mohanan", "Aishwarya Lekshmi",
    "Regina Cassandra", "Lavanya Tripathi", "Nivetha Thomas", "Megha Akash", "Kalyani Priyadarshan",
    "Priyanka Mohan", "Samyuktha Menon"
)
$c3_branches_pool = @("HQ-BLR", "BR-HYD", "BR-MAA", "BR-PUN")
$c3_garment_types = @("Spiral Boned Corset Gown", "Liquid Organza Pre-Draped Saree", "Empress Tuxedo Jacket", "Corset Lehenga Choli", "Architectural Cape Jumpsuit")

for ($i=1; $i -le 26; $i++) {
    $phone = "+91 98333 " + $i.ToString("D5")
    $name = $c3_cust_names[$i-1]
    $first = $name.Split(" ")[0]
    $last = $name.Split(" ")[1]
    $branch = $c3_branches_pool[($i % 4)]
    $city = if ($branch -eq "HQ-BLR") { "Bengaluru" } elseif ($branch -eq "BR-HYD") { "Hyderabad" } elseif ($branch -eq "BR-MAA") { "Chennai" } else { "Pune" }
    $tier = if ($i % 5 -eq 0) { "VIP" } elseif ($i % 3 -eq 0) { "PREMIUM" } else { "REGULAR" }
    $fav = $c3_garment_types[($i % 5)]
    $spend = ($i * 15000.0) + 48000.0
    $bal = if ($i % 2 -eq 0) { 28000.0 } else { 0.0 }
    
    W("INSERT INTO customers (mobile_number, name, first_name, last_name, salutation, gender, email, location, street_address, city, state, pincode, tier, total_spend, balance, favorite_garment, measurements_on_file, fit_preference, preferred_channel, branch, company_id) VALUES (")
    W("  '$phone', '$name', '$first', '$last', 'Ms.', 'Female', '$($first.ToLower()).$($last.ToLower())@auraclient.in', '$city', 'Villa $i, Silicon Enclave', '$city', 'India', '560001', '$tier', $spend, $bal, '$fav', TRUE, 'Ultra Hourglass Cinch', 'WhatsApp', '$branch', '$c3_id'")
    W(");")
    
    $bmId = "83000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, armhole, sleeve_length, front_neck_depth, back_neck_depth, recorded_by, company_id) VALUES (")
    W("  '$bmId', '$phone', '$name', '$fav', 'CURRENT', TRUE, 1, 'in', 14.25, 34.5, 29.0, 25.5, 37.0, 16.0, 16.0, 0.0, 7.5, 12.0, 'Tarun Varma', '$c3_id'")
    W(");")
    
    $cmId = "93000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO customer_measurements (id, customer_mobile, garment_type, bust, waist, full_hip, shoulder, sleeve_length, armhole, front_neck, back_neck, garment_length, recorded_by, is_active_profile, company_id) VALUES (")
    W("  '$cmId', '$phone', '$fav', 34.5, 25.5, 37.0, 14.25, 0.0, 16.0, 7.5, 12.0, 16.0, 'Tarun Varma', TRUE, '$c3_id'")
    W(");")
    
    $mpId = "a3000000-0000-0000-0000-" + $i.ToString("D12")
    W("INSERT INTO measurement_profiles (id, customer_mobile, garment_type, recorded_by, notes, branch, company_id) VALUES (")
    W("  '$mpId', '$phone', '$fav', 'Tarun Varma', '14-bone spiral steel corset foundation with 2-inch waist cinch target.', '$branch', '$c3_id'")
    W(");")
    
    if ($i -le 20) {
        $cnId = "b3000000-0000-0000-0000-" + $i.ToString("D12")
        W("INSERT INTO customer_notes (id, customer_mobile, note_text, author_name, author_badge, category, company_id) VALUES (")
        W("  '$cnId', '$phone', 'Red carpet VIP fitting required; prefers plunging neckline with internal illusion mesh.', 'Tarun Varma', 'TV', 'PREFERENCE', '$c3_id'")
        W(");")
    }
}
W("")

# C3 Orders (46) & Garments (46)
W("-- Orders (46) & Garments (46)")
$c3_stages_cycle = @("ORDER_TAKEN", "MEASURING", "CAD_PATTERN", "CORSET_BONING", "CONSTRUCTION", "FITTING", "QC_PRESS", "FINAL_DISPATCH")
$c3_statuses = @("PENDING", "IN_PRODUCTION", "IN_PRODUCTION", "IN_PRODUCTION", "IN_PRODUCTION", "IN_PRODUCTION", "READY", "COMPLETED")

for ($j=1; $j -le 46; $j++) {
    $custIdx = (($j - 1) % 26) + 1
    $phone = "+91 98333 " + $custIdx.ToString("D5")
    $custName = $c3_cust_names[$custIdx - 1]
    $ordId = "c3100000-0000-0000-0000-" + $j.ToString("D12")
    $garId = "d3100000-0000-0000-0000-" + $j.ToString("D12")
    $ordCode = "ORD-AUR-" + $j.ToString("D3")
    $garCode = "GAR-AUR-" + $j.ToString("D3")
    $branch = $c3_branches_pool[($j % 4)]
    $stage = $c3_stages_cycle[($j % 8)]
    $status = $c3_statuses[($j % 8)]
    $gType = $c3_garment_types[($j % 5)]
    $totAmount = 68000.0 + ($j * 2600.0)
    $advPaid = if ($status -eq "COMPLETED") { $totAmount } else { [Math]::Round($totAmount * 0.5, 2) }
    $balAmount = [Math]::Round($totAmount - $advPaid, 2)
    $payStatus = if ($balAmount -eq 0) { "PAID" } else { "PARTIAL" }
    
    W("INSERT INTO orders (id, order_code, garment_type, garment_desc, collection, amount, status, order_date, due_date, customer_mobile, customer_name, expected_delivery_date, advance_paid, total_amount, balance_amount, current_stage, branch, company_id) VALUES (")
    W("  '$ordId', '$ordCode', '$gType', 'Architectural $gType with spiral steel corsetry and fluid draping', 'Metropolis: Structured Corsetry', $totAmount, '$status', CURRENT_DATE - INTERVAL '$($50 - $j) days', CURRENT_DATE + INTERVAL '$($j * 2) days', '$phone', '$custName', CURRENT_DATE + INTERVAL '$($j * 2) days', $advPaid, $totAmount, $balAmount, '$stage', '$branch', '$c3_id'")
    W(");")
    
    W("INSERT INTO garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, collection_name, production_stage, material_status, priority, payment_status, paid_amount, total_amount, status, designer, assigned_to, due_date, branch, company_id) VALUES (")
    W("  '$garId', '$garCode', '$ordId', '$ordCode', '$custName', '$phone', 'Sculpted $gType for $custName', '$gType', 'Metropolis: Structured Corsetry', '$stage', 'READY', 'HIGH', '$payStatus', $advPaid, $totAmount, '$status', 'Tarun Varma', 'Shalini Reddy', CURRENT_DATE + INTERVAL '$($j * 2) days', '$branch', '$c3_id'")
    W(");")
    
    $ops1 = "e3100000-0000-0000-0000-" + (($j * 2) - 1).ToString("D12")
    $ops2 = "e3100000-0000-0000-0000-" + ($j * 2).ToString("D12")
    W("INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes, company_id) VALUES ('$ops1', '$ordId', 'ORDER_TAKEN', NOW() - INTERVAL '$($52 - $j) days', 'Tarun Varma', 'Waist reduction and corset bone layout confirmed', '$c3_id');")
    W("INSERT INTO order_progress_stages (id, order_id, stage, completed_at, completed_by, notes, company_id) VALUES ('$ops2', '$ordId', '$stage', NOW() - INTERVAL '2 days', 'Shalini Reddy', 'Corset channel stitching in progress', '$c3_id');")
    
    $ps1 = "f3100000-0000-0000-0000-" + (($j * 2) - 1).ToString("D12")
    $ps2 = "f3100000-0000-0000-0000-" + ($j * 2).ToString("D12")
    W("INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, started_at, sort_order, notes, company_id) VALUES ('$ps1', '$ordId', 'Vector Pattern CAD Grading', 'e3000000-0000-0000-0000-000000000001', 'COMPLETED', NOW() - INTERVAL '$($46 - $j) days', 1, 'Algorithmic curves plotted', '$c3_id');")
    W("INSERT INTO production_stages (id, order_id, stage_name, assigned_to, status, started_at, sort_order, notes, company_id) VALUES ('$ps2', '$ordId', '$stage', 'e3000000-0000-0000-0000-000000000002', 'IN_PROGRESS', NOW() - INTERVAL '5 days', 2, 'Inserting memory steel ribs into channels', '$c3_id');")
    
    $qcId = "13100000-0000-0000-0000-" + $j.ToString("D12")
    W("INSERT INTO qc_checklists (id, order_id, check_point, result, checked_by, checked_at, remarks, sort_order, company_id) VALUES ('$qcId', '$ordId', 'Corset Bone Channel Tensile Strength', 'PASSED', 'e3000000-0000-0000-0000-000000000006', NOW() - INTERVAL '1 days', 'Zero rib poke-through under 25kg strain test', 1, '$c3_id');")
    
    $payId = "23100000-0000-0000-0000-" + $j.ToString("D12")
    W("INSERT INTO payments (id, order_id, customer_mobile, total_amount, paid_amount, status, due_date, notes, company_id) VALUES ('$payId', '$ordId', '$phone', $totAmount, $advPaid, '$payStatus', CURRENT_DATE + INTERVAL '$($j * 2) days', 'Bespoke corsetry advance token', '$c3_id');")
    
    $pt1 = "33100000-0000-0000-0000-" + (($j * 2) - 1).ToString("D12")
    W("INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, notes, company_id) VALUES ('$pt1', '$payId', $advPaid, 'BANK_TRANSFER', 'Tarun Varma', 'IMPS/ICIC/$($j.ToString('D6'))', 'Initial advance token', '$c3_id');")
    
    if ($balAmount -eq 0) {
        $pt2 = "33100000-0000-0000-0000-" + ($j * 2).ToString("D12")
        W("INSERT INTO payment_transactions (id, payment_id, amount, method, received_by, reference_no, notes, company_id) VALUES ('$pt2', '$payId', $advPaid, 'UPI', 'Tarun Varma', 'UPI/SBIN/$($j.ToString('D6'))', 'Full balance settled upon final fitting', '$c3_id');")
    }
    
    if ($j -le 20) {
        $trlId = "43100000-0000-0000-0000-" + $j.ToString("D12")
        $trlCode = "TRL-AUR-" + $j.ToString("D3")
        W("INSERT INTO trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, fit_preference, customer_feedback, trial_attempt, alteration_count, branch, company_id) VALUES (")
        W("  '$trlId', '$trlCode', '$ordId', '$ordCode', '$phone', '$custName', '$gType', 'Metropolis: Structured Corsetry', CURRENT_DATE + INTERVAL '$j days', '02:00 PM', 'Corset Cinch Trial', 'UPCOMING', 'PENDING', 'Tarun Varma', CURRENT_DATE + INTERVAL '$($j * 2) days', 'Ultra Hourglass Cinch', 'Client fitting session in Indiranagar Glasshouse', 1, 0, '$branch', '$c3_id'")
        W(");")
        
        if ($j -le 15) {
            $altId = "53100000-0000-0000-0000-" + $j.ToString("D12")
            W("INSERT INTO trial_alterations (id, trial_id, description, category, completed, assigned_tailor, priority, target_date, tailor_notes, status, company_id) VALUES (")
            W("  '$altId', '$trlId', 'Trim side back bone by 0.5 inches for seating comfort', 'Comfort', FALSE, 'Shalini Reddy', 'Normal', CURRENT_DATE + INTERVAL '$($j + 2) days', 'Recap bone tip with galvanized cap.', 'PENDING', '$c3_id'")
            W(");")
        }
    }
}
W("")

# C3 Designs (12)
W("-- Designs (12)")
for ($d=1; $d -le 12; $d++) {
    $desId = "63100000-0000-0000-0000-" + $d.ToString("D12")
    $desCode = "DES-AUR-" + $d.ToString("D3")
    $ordId = "c3100000-0000-0000-0000-" + $d.ToString("D12")
    $custIdx = (($d - 1) % 26) + 1
    $phone = "+91 98333 " + $custIdx.ToString("D5")
    W("INSERT INTO designs (id, design_code, title, garment_type, order_id, status, designer, thumbnail_url, customer_mobile, collection, primary_fabric, estimated_cost, suggested_price, production_status, times_used, image_urls, notes, created_by, company_id) VALUES (")
    W("  '$desId', '$desCode', 'Metropolis Corset Gown #$d', 'Corset Gown', '$ordId', 'APPROVED', 'Tarun Varma', '/front end/assets/pink_silk.jpg', '$phone', 'Metropolis: Structured Corsetry', 'Heavy Twill & Liquid Organza', 32000.0, 98000.0, 'Active', $d, json_build_array('/front end/assets/pink_silk.jpg')::text, '14 spiral steel bones with sweetheart neckline and flowing organza skirt.', 'Tarun Varma', '$c3_id'")
    W(");")
}
W("")

# C3 Enquiries (10) & Appointments (10)
W("-- Enquiries (10) & Appointments (10)")
for ($en=1; $en -le 10; $en++) {
    $enqId = "73100000-0000-0000-0000-" + $en.ToString("D12")
    $enqCode = "ENQ-AUR-" + $en.ToString("D3")
    $apptId = "83100000-0000-0000-0000-" + $en.ToString("D12")
    $ordId = "c3100000-0000-0000-0000-" + $en.ToString("D12")
    $name = $c3_cust_names[$en - 1]
    $phone = "+91 98333 " + $en.ToString("D5")
    $branch = $c3_branches_pool[($en % 4)]
    
    W("INSERT INTO enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, source, estimated_budget, branch, company_id) VALUES (")
    W("  '$enqId', '$enqCode', '$name', '$phone', 'enquiry$en@auraclient.in', 'Corset Gown', 'Red carpet awards ceremony consultation inquiry', 'CONVERTED', 'Tarun Varma', 'REFERRAL', 135000.0, '$branch', '$c3_id'")
    W(");")
    
    W("INSERT INTO appointments (id, order_id, appt_type, scheduled_at, duration_minutes, status, staff_assigned, notes, customer_mobile, company_id) VALUES (")
    W("  '$apptId', '$ordId', 'CONSULTATION', NOW() + INTERVAL '$en days', 60, 'SCHEDULED', 'Tarun Varma', 'Anatomical fitting and curve mapping consultation', '$phone', '$c3_id'")
    W(");")
}
W("")

W("COMMIT;")
$sw.Flush()
$sw.Close()

Write-Host "Seed SQL successfully generated at: $outputFile" -ForegroundColor Green
