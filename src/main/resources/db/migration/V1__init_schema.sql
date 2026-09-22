-- V1__init_schema.sql
-- Consolidated Fashion ERP Production Schema
-- Pure, clean relational model with customer_mobile as PK / FK across all modules

-- 1. Customers Table (PK: mobile_number)
CREATE TABLE customers (
    mobile_number       VARCHAR(30) PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    first_name          VARCHAR(75),
    last_name           VARCHAR(75),
    salutation          VARCHAR(20),
    gender              VARCHAR(20) DEFAULT 'Female',
    email               VARCHAR(150),
    alt_phone           VARCHAR(30),
    instagram_handle    VARCHAR(100),
    preferred_channel   VARCHAR(30) DEFAULT 'WhatsApp',
    dob                 DATE,
    anniversary         DATE,
    location            VARCHAR(250),
    street_address      TEXT,
    city                VARCHAR(100),
    state               VARCHAR(100),
    pincode             VARCHAR(20),
    landmark            VARCHAR(250),
    avatar_url          TEXT,
    tier                VARCHAR(30) NOT NULL DEFAULT 'REGULAR',
    total_spend         NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance             NUMERIC(12, 2) NOT NULL DEFAULT 0,
    credit_limit        NUMERIC(12, 2) DEFAULT 0,
    favorite_garment    VARCHAR(200),
    fit_preference      VARCHAR(50),
    fabric_allergies    TEXT,
    measurements_on_file BOOLEAN NOT NULL DEFAULT FALSE,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_tier ON customers (tier);
CREATE INDEX idx_customers_name ON customers (name);

-- 2. Orders Table (FK: customer_mobile -> customers)
CREATE TABLE orders (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code              VARCHAR(30) UNIQUE NOT NULL,
    customer_mobile         VARCHAR(30) NOT NULL REFERENCES customers(mobile_number) ON DELETE RESTRICT,
    customer_name           VARCHAR(150),
    garment_type            VARCHAR(100) NOT NULL,
    garment_desc            TEXT,
    collection              VARCHAR(150),
    order_date              DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date  DATE,
    delivered_date          DATE,
    advance_paid            NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount            NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_amount          NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount                  NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status                  VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    due_date                DATE,
    notes                   TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_code            ON orders (order_code);
CREATE INDEX idx_orders_customer_mobile ON orders (customer_mobile);
CREATE INDEX idx_orders_customer_name   ON orders (customer_name);
CREATE INDEX idx_orders_status          ON orders (status);
CREATE INDEX idx_orders_date            ON orders (order_date);
CREATE INDEX idx_orders_expected_deliv  ON orders (expected_delivery_date);

CREATE TABLE order_progress_stages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    stage           VARCHAR(30) NOT NULL,
    completed_at    TIMESTAMP,
    completed_by    VARCHAR(100),
    notes           TEXT
);

CREATE INDEX idx_progress_order ON order_progress_stages (order_id);

-- 3. Precision Tailored Body Measurements Table (34 points, versioning)
CREATE TABLE customer_body_measurements (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_mobile         VARCHAR(30) NOT NULL REFERENCES customers(mobile_number) ON DELETE CASCADE,
    customer_name           VARCHAR(150) NOT NULL,
    garment_type            VARCHAR(50) NOT NULL,
    measurement_type        VARCHAR(20) NOT NULL DEFAULT 'CURRENT',
    is_current              BOOLEAN NOT NULL DEFAULT TRUE,
    version                 INT NOT NULL DEFAULT 1,
    unit                    VARCHAR(10) NOT NULL DEFAULT 'in',

    -- Upper Body
    shoulder                NUMERIC(6, 2),
    bust                    NUMERIC(6, 2),
    under_bust              NUMERIC(6, 2),
    waist                   NUMERIC(6, 2),
    hip                     NUMERIC(6, 2),

    -- Lengths
    blouse_length           NUMERIC(6, 2),
    top_length              NUMERIC(6, 2),
    full_length             NUMERIC(6, 2),
    skirt_length            NUMERIC(6, 2),
    pant_length             NUMERIC(6, 2),

    -- Arms & Sleeves
    armhole                 NUMERIC(6, 2),
    upper_arm               NUMERIC(6, 2),
    sleeve_length           NUMERIC(6, 2),
    sleeve_round            NUMERIC(6, 2),
    elbow_round             NUMERIC(6, 2),
    wrist_round             NUMERIC(6, 2),

    -- Necks
    front_neck_depth        NUMERIC(6, 2),
    back_neck_depth         NUMERIC(6, 2),

    -- Bust Points
    bust_point              NUMERIC(6, 2),
    bust_point_to_bust_point NUMERIC(6, 2),
    shoulder_to_bust        NUMERIC(6, 2),
    shoulder_to_waist       NUMERIC(6, 2),

    -- Widths
    front_width             NUMERIC(6, 2),
    back_width              NUMERIC(6, 2),

    -- Lower Body & Pants
    pant_waist              NUMERIC(6, 2),
    pant_hip                NUMERIC(6, 2),
    thigh_round             NUMERIC(6, 2),
    knee_round              NUMERIC(6, 2),
    calf_round              NUMERIC(6, 2),
    ankle_round             NUMERIC(6, 2),
    crotch_length           NUMERIC(6, 2),
    bottom_opening          NUMERIC(6, 2),

    -- Flares
    waist_to_hip            NUMERIC(6, 2),
    flare                   NUMERIC(6, 2),

    -- Fitting & Auditing
    posture_notes           TEXT,
    shape_notes             TEXT,
    notes                   TEXT,
    recorded_by             VARCHAR(100) DEFAULT 'Master Tailor',
    recorded_at             TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_cbm_mobile_garment_current ON customer_body_measurements (customer_mobile, garment_type, is_current);
CREATE INDEX idx_cbm_mobile                 ON customer_body_measurements (customer_mobile);
CREATE INDEX idx_cbm_garment                ON customer_body_measurements (garment_type);
CREATE INDEX idx_cbm_history                ON customer_body_measurements (customer_mobile, garment_type, version DESC);

-- 4. Customer Measurements Table (Entity Support)
CREATE TABLE customer_measurements (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_mobile     VARCHAR(30) NOT NULL REFERENCES customers(mobile_number) ON DELETE CASCADE,
    garment_type        VARCHAR(50) NOT NULL DEFAULT 'General',
    bust                NUMERIC(6, 2),
    upper_bust          NUMERIC(6, 2),
    under_bust          NUMERIC(6, 2),
    waist               NUMERIC(6, 2),
    high_hip            NUMERIC(6, 2),
    full_hip            NUMERIC(6, 2),
    shoulder            NUMERIC(6, 2),
    cross_front         NUMERIC(6, 2),
    cross_back          NUMERIC(6, 2),
    armhole             NUMERIC(6, 2),
    sleeve_length       NUMERIC(6, 2),
    bicep               NUMERIC(6, 2),
    wrist               NUMERIC(6, 2),
    front_neck          NUMERIC(6, 2),
    back_neck           NUMERIC(6, 2),
    apex_point          NUMERIC(6, 2),
    garment_length      NUMERIC(6, 2),
    posture_notes       TEXT,
    shape_notes         TEXT,
    recorded_by         VARCHAR(100),
    is_active_profile   BOOLEAN NOT NULL DEFAULT TRUE,
    recorded_at         TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_cmeasure_mobile  ON customer_measurements (customer_mobile);
CREATE INDEX idx_cmeasure_garment ON customer_measurements (garment_type);

-- 5. Measurement Profiles & Points (Entity Support)
CREATE TABLE measurement_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_mobile VARCHAR(30) NOT NULL REFERENCES customers(mobile_number) ON DELETE CASCADE,
    garment_type    VARCHAR(100) NOT NULL,
    recorded_by     VARCHAR(100),
    notes           TEXT,
    recorded_at     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE measurement_points (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID NOT NULL REFERENCES measurement_profiles(id) ON DELETE CASCADE,
    point_name      VARCHAR(100) NOT NULL,
    value           NUMERIC(8, 2) NOT NULL,
    unit            VARCHAR(10) NOT NULL DEFAULT '"',
    marker_index    INT,
    sort_order      INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_mprofile_customer ON measurement_profiles (customer_mobile);
CREATE INDEX idx_mpoint_profile    ON measurement_points (profile_id);

-- 6. Inventory Items & Stock Movements
CREATE TABLE inventory_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code       VARCHAR(30) UNIQUE NOT NULL,
    name            VARCHAR(200) NOT NULL,
    category        VARCHAR(100) NOT NULL,
    variant         VARCHAR(100),
    unit            VARCHAR(30) NOT NULL DEFAULT 'Meter',
    stock_qty       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    reserved_qty    NUMERIC(10, 2) NOT NULL DEFAULT 0,
    available_qty   NUMERIC(10, 2) GENERATED ALWAYS AS (stock_qty - reserved_qty) STORED,
    reorder_level   NUMERIC(10, 2) NOT NULL DEFAULT 0,
    purchase_price  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    supplier_name   VARCHAR(200),
    image_url       TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK',
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_code     ON inventory_items (item_code);
CREATE INDEX idx_inventory_category ON inventory_items (category);
CREATE INDEX idx_inventory_status   ON inventory_items (status);

CREATE TABLE stock_movements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    movement_type   VARCHAR(30) NOT NULL,
    quantity        NUMERIC(10, 2) NOT NULL,
    reference       VARCHAR(100),
    notes           TEXT,
    moved_by        VARCHAR(100),
    moved_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_stockmov_item ON stock_movements (item_id);

-- 7. Payments Table (FK: customer_mobile -> customers)
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    customer_mobile VARCHAR(30) NOT NULL REFERENCES customers(mobile_number) ON DELETE RESTRICT,
    total_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
    paid_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance         NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    due_date        DATE,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order     ON payments (order_id);
CREATE INDEX idx_payments_customer  ON payments (customer_mobile);
CREATE INDEX idx_payments_status    ON payments (status);

CREATE TABLE payment_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id      UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    amount          NUMERIC(12, 2) NOT NULL,
    method          VARCHAR(30) NOT NULL DEFAULT 'CASH',
    received_by     VARCHAR(100),
    reference_no    VARCHAR(100),
    transaction_date TIMESTAMP NOT NULL DEFAULT now(),
    notes           TEXT
);

CREATE INDEX idx_txn_payment ON payment_transactions (payment_id);

-- 8. Appointments Table (FK: customer_mobile -> customers)
CREATE TABLE appointments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_mobile VARCHAR(30) NOT NULL REFERENCES customers(mobile_number) ON DELETE CASCADE,
    order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
    appt_type       VARCHAR(30) NOT NULL DEFAULT 'CONSULTATION',
    scheduled_at    TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    status          VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    staff_assigned  VARCHAR(100),
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_appt_customer  ON appointments (customer_mobile);
CREATE INDEX idx_appt_scheduled ON appointments (scheduled_at);
CREATE INDEX idx_appt_status    ON appointments (status);

-- 9. Employees Table
CREATE TABLE employees (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code   VARCHAR(20) UNIQUE NOT NULL,
    name            VARCHAR(150) NOT NULL,
    phone           VARCHAR(30),
    email           VARCHAR(150),
    role            VARCHAR(30) NOT NULL DEFAULT 'TAILOR',
    status          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    joined_date     DATE,
    avatar_url      TEXT,
    specialization  VARCHAR(200),
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_emp_code   ON employees (employee_code);
CREATE INDEX idx_emp_role   ON employees (role);
CREATE INDEX idx_emp_status ON employees (status);

-- 10. Production Stages & QC Checklists
CREATE TABLE production_stages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    stage_name      VARCHAR(100) NOT NULL,
    assigned_to     UUID REFERENCES employees(id) ON DELETE SET NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    notes           TEXT,
    sort_order      INT NOT NULL DEFAULT 0
);

CREATE TABLE qc_checklists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    check_point     VARCHAR(200) NOT NULL,
    result          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    checked_by      UUID REFERENCES employees(id) ON DELETE SET NULL,
    checked_at      TIMESTAMP,
    remarks         TEXT,
    sort_order      INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_prod_order     ON production_stages (order_id);
CREATE INDEX idx_prod_status    ON production_stages (status);
CREATE INDEX idx_qc_order       ON qc_checklists (order_id);

-- 11. Suppliers & Purchase Orders
CREATE TABLE suppliers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code   VARCHAR(20) UNIQUE NOT NULL,
    name            VARCHAR(200) NOT NULL,
    contact_person  VARCHAR(150),
    phone           VARCHAR(30),
    email           VARCHAR(150),
    address         TEXT,
    specialization  VARCHAR(200),
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE purchase_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_code         VARCHAR(30) UNIQUE NOT NULL,
    supplier_id     UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    status          VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    total_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
    order_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_date   DATE,
    received_date   DATE,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE purchase_order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id           UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_id         UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    item_name       VARCHAR(200) NOT NULL,
    quantity        NUMERIC(10, 2) NOT NULL,
    unit            VARCHAR(30) NOT NULL,
    unit_price      NUMERIC(10, 2) NOT NULL,
    total_price     NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    received_qty    NUMERIC(10, 2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_po_supplier ON purchase_orders (supplier_id);
CREATE INDEX idx_po_status   ON purchase_orders (status);
CREATE INDEX idx_poi_po      ON purchase_order_items (po_id);

-- 12. App Users Table
CREATE TABLE app_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    role            VARCHAR(30) NOT NULL DEFAULT 'STAFF',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    last_login      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_username ON app_users (username);

-- 13. Enquiries Table
CREATE TABLE enquiries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_code        VARCHAR(20) UNIQUE NOT NULL,
    customer_name       VARCHAR(150) NOT NULL,
    phone               VARCHAR(30),
    email               VARCHAR(150),
    garment_type        VARCHAR(100),
    notes               TEXT,
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    assigned_to         VARCHAR(100),
    follow_up_date      DATE,
    converted_order_id  UUID REFERENCES orders(id) ON DELETE SET NULL,
    source              VARCHAR(50) DEFAULT 'WALK_IN',
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_enq_status  ON enquiries (status);
CREATE INDEX idx_enq_source  ON enquiries (source);

-- 14. Designs Table (FK: customer_mobile -> customers)
CREATE TABLE designs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_code     VARCHAR(20) UNIQUE NOT NULL,
    title           VARCHAR(200) NOT NULL,
    garment_type    VARCHAR(100) NOT NULL,
    customer_mobile VARCHAR(30) REFERENCES customers(mobile_number) ON DELETE SET NULL,
    order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    style_notes     TEXT,
    designer        VARCHAR(100),
    thumbnail_url   TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_design_status   ON designs (status);
CREATE INDEX idx_design_customer ON designs (customer_mobile);

-- 15. Trials & Alterations (FK: customer_mobile -> customers)
CREATE TABLE trials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trial_code      VARCHAR(30) UNIQUE NOT NULL,
    order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
    order_code      VARCHAR(30),
    customer_mobile VARCHAR(30) REFERENCES customers(mobile_number) ON DELETE CASCADE,
    customer_name   VARCHAR(150),
    garment_type    VARCHAR(100) NOT NULL,
    collection      VARCHAR(150),
    trial_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    trial_time      VARCHAR(20) DEFAULT '11:00 AM',
    stage           VARCHAR(50) DEFAULT 'First Trial',
    status          VARCHAR(30) NOT NULL DEFAULT 'TODAY',
    fit_status      VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    designer_name   VARCHAR(100),
    delivery_date   DATE,
    neck_style      VARCHAR(100),
    sleeve_style    VARCHAR(100),
    lining          VARCHAR(100),
    embroidery      VARCHAR(100),
    fabric          VARCHAR(150),
    spec_notes      TEXT,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE trial_alterations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trial_id        UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
    description     VARCHAR(255) NOT NULL,
    category        VARCHAR(50) NOT NULL DEFAULT 'Fit',
    completed       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_trials_code       ON trials (trial_code);
CREATE INDEX idx_trials_customer   ON trials (customer_mobile);
CREATE INDEX idx_trials_order      ON trials (order_id);
CREATE INDEX idx_trials_status     ON trials (status);
CREATE INDEX idx_alterations_trial ON trial_alterations (trial_id);
