--
-- PostgreSQL database dump
--

\restrict n0Pile5mjBIXfSYZhz4p9I1dllfmISukiWdAlbkNOZsN7YbFvdXlGMI3OZJCIx5

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(150) NOT NULL,
    role character varying(30) DEFAULT 'STAFF'::character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    email character varying(150),
    phone character varying(30),
    avatar_url text,
    designation character varying(100),
    department character varying(100),
    bio text,
    assigned_branch character varying(150),
    allowed_modules text
);


ALTER TABLE public.app_users OWNER TO postgres;

--
-- Name: COLUMN app_users.allowed_modules; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.app_users.allowed_modules IS 'JSON array of module key strings the user may access. NULL = role default applied at login.';


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    appt_type character varying(30) DEFAULT 'CONSULTATION'::character varying NOT NULL,
    scheduled_at timestamp without time zone NOT NULL,
    duration_minutes integer DEFAULT 60 NOT NULL,
    status character varying(30) DEFAULT 'SCHEDULED'::character varying NOT NULL,
    staff_assigned character varying(100),
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    customer_mobile character varying(30) NOT NULL
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_code character varying(20) NOT NULL,
    name character varying(150) NOT NULL,
    type character varying(30) DEFAULT 'SHOWROOM'::character varying NOT NULL,
    street_address character varying(255),
    city character varying(100),
    state character varying(100),
    pin_code character varying(10),
    country character varying(100),
    phone character varying(20),
    whatsapp character varying(20),
    email character varying(150),
    website character varying(255),
    google_maps_url text,
    active boolean DEFAULT true NOT NULL,
    is_headquarters boolean DEFAULT false NOT NULL,
    manager_id uuid,
    working_hours text,
    features text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: collection_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collection_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    collection_id uuid NOT NULL,
    activity_date date NOT NULL,
    description text NOT NULL,
    activity_type character varying(50) DEFAULT 'SYSTEM'::character varying NOT NULL,
    color character varying(30) DEFAULT '#a855f7'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.collection_activities OWNER TO postgres;

--
-- Name: collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(150) NOT NULL,
    subtitle character varying(250),
    description text,
    season character varying(100),
    year integer DEFAULT 2026,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    designer character varying(100),
    branch character varying(100),
    launch_date date DEFAULT CURRENT_DATE,
    is_featured boolean DEFAULT false NOT NULL,
    cover_image_url text,
    thumbnail_urls text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    production_deadline date,
    progress_percentage integer DEFAULT 0,
    design_progress integer DEFAULT 0,
    materials_progress integer DEFAULT 0,
    production_progress integer DEFAULT 0,
    qc_progress integer DEFAULT 0
);


ALTER TABLE public.collections OWNER TO postgres;

--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_name character varying(150) DEFAULT 'Haulo Designs'::character varying NOT NULL,
    short_name character varying(60) DEFAULT 'HAULO'::character varying NOT NULL,
    tagline character varying(255) DEFAULT 'Bespoke Couture · Luxury Tailoring'::character varying,
    owner_name character varying(150) DEFAULT ''::character varying,
    business_type character varying(100) DEFAULT 'Bespoke Atelier'::character varying,
    gstin character varying(20),
    pan_number character varying(15),
    primary_phone character varying(20),
    whatsapp character varying(20),
    email character varying(150),
    website character varying(255),
    street_address character varying(255),
    city character varying(100),
    state character varying(100),
    pin_code character varying(10),
    country character varying(100) DEFAULT 'India'::character varying,
    logo_base64 text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.company_settings OWNER TO postgres;

--
-- Name: customer_body_measurements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_body_measurements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_mobile character varying(30) NOT NULL,
    customer_name character varying(150) NOT NULL,
    garment_type character varying(50) NOT NULL,
    measurement_type character varying(20) DEFAULT 'CURRENT'::character varying NOT NULL,
    is_current boolean DEFAULT true NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    unit character varying(10) DEFAULT 'in'::character varying NOT NULL,
    shoulder numeric(6,2),
    bust numeric(6,2),
    under_bust numeric(6,2),
    waist numeric(6,2),
    hip numeric(6,2),
    blouse_length numeric(6,2),
    top_length numeric(6,2),
    full_length numeric(6,2),
    skirt_length numeric(6,2),
    pant_length numeric(6,2),
    armhole numeric(6,2),
    upper_arm numeric(6,2),
    sleeve_length numeric(6,2),
    sleeve_round numeric(6,2),
    elbow_round numeric(6,2),
    wrist_round numeric(6,2),
    front_neck_depth numeric(6,2),
    back_neck_depth numeric(6,2),
    bust_point numeric(6,2),
    bust_point_to_bust_point numeric(6,2),
    shoulder_to_bust numeric(6,2),
    shoulder_to_waist numeric(6,2),
    front_width numeric(6,2),
    back_width numeric(6,2),
    pant_waist numeric(6,2),
    pant_hip numeric(6,2),
    thigh_round numeric(6,2),
    knee_round numeric(6,2),
    calf_round numeric(6,2),
    ankle_round numeric(6,2),
    crotch_length numeric(6,2),
    bottom_opening numeric(6,2),
    waist_to_hip numeric(6,2),
    flare numeric(6,2),
    posture_notes text,
    shape_notes text,
    notes text,
    recorded_by character varying(100) DEFAULT 'Master Tailor'::character varying,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.customer_body_measurements OWNER TO postgres;

--
-- Name: customer_measurements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_measurements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_mobile character varying(30) NOT NULL,
    garment_type character varying(50) DEFAULT 'General'::character varying NOT NULL,
    bust numeric(6,2),
    upper_bust numeric(6,2),
    under_bust numeric(6,2),
    waist numeric(6,2),
    high_hip numeric(6,2),
    full_hip numeric(6,2),
    shoulder numeric(6,2),
    cross_front numeric(6,2),
    cross_back numeric(6,2),
    armhole numeric(6,2),
    sleeve_length numeric(6,2),
    bicep numeric(6,2),
    wrist numeric(6,2),
    front_neck numeric(6,2),
    back_neck numeric(6,2),
    apex_point numeric(6,2),
    garment_length numeric(6,2),
    posture_notes text,
    shape_notes text,
    recorded_by character varying(100),
    is_active_profile boolean DEFAULT true NOT NULL,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customer_measurements OWNER TO postgres;

--
-- Name: customer_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_mobile character varying(30) NOT NULL,
    note_text text NOT NULL,
    author_name character varying(100) DEFAULT 'Atelier Staff'::character varying NOT NULL,
    author_badge character varying(10) DEFAULT 'AS'::character varying NOT NULL,
    category character varying(50) DEFAULT 'GENERAL'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customer_notes OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    name character varying(150) NOT NULL,
    email character varying(150),
    location character varying(250),
    avatar_url text,
    tier character varying(30) DEFAULT 'REGULAR'::character varying NOT NULL,
    total_spend numeric(12,2) DEFAULT 0 NOT NULL,
    balance numeric(12,2) DEFAULT 0 NOT NULL,
    favorite_garment character varying(200),
    measurements_on_file boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    mobile_number character varying(30) NOT NULL,
    first_name character varying(75),
    last_name character varying(75),
    salutation character varying(20),
    gender character varying(20) DEFAULT 'Female'::character varying,
    alt_phone character varying(30),
    instagram_handle character varying(100),
    preferred_channel character varying(30) DEFAULT 'WhatsApp'::character varying,
    dob date,
    anniversary date,
    street_address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(20),
    landmark character varying(250),
    credit_limit numeric(12,2) DEFAULT 0,
    fit_preference character varying(50),
    fabric_allergies text,
    preferred_neck character varying(100),
    preferred_sleeve character varying(100),
    preferred_occasions character varying(200),
    delivery_preference character varying(100)
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: designs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.designs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    design_code character varying(20) NOT NULL,
    title character varying(200) NOT NULL,
    garment_type character varying(100) NOT NULL,
    order_id uuid,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    style_notes text,
    designer character varying(100),
    thumbnail_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    customer_mobile character varying(30),
    sub_category character varying(100),
    style character varying(100),
    occasion character varying(100),
    collection character varying(150),
    primary_fabric character varying(200),
    colour_options text,
    sizes character varying(200),
    construction text,
    embroidery text,
    estimated_cost numeric(12,2) DEFAULT 0,
    suggested_price numeric(12,2) DEFAULT 0,
    estimated_labour character varying(50),
    production_status character varying(30) DEFAULT 'Active'::character varying,
    times_used integer DEFAULT 0 NOT NULL,
    last_used_date date,
    tags text,
    image_urls text,
    swatches text,
    notes text,
    created_by character varying(100)
);


ALTER TABLE public.designs OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_code character varying(20) NOT NULL,
    name character varying(150) NOT NULL,
    phone character varying(30),
    email character varying(150),
    role character varying(30) DEFAULT 'TAILOR'::character varying NOT NULL,
    status character varying(30) DEFAULT 'ACTIVE'::character varying NOT NULL,
    joined_date date,
    avatar_url text,
    specialization character varying(200),
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: enquiries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enquiries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enquiry_code character varying(20) NOT NULL,
    customer_name character varying(150) NOT NULL,
    phone character varying(30),
    email character varying(150),
    garment_type character varying(100),
    notes text,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    assigned_to character varying(100),
    follow_up_date date,
    converted_order_id uuid,
    source character varying(50) DEFAULT 'WALK_IN'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    occasion character varying(100),
    preferred_date date,
    estimated_budget numeric(12,2),
    next_action character varying(150),
    fabric_brought boolean DEFAULT false,
    avatar_url character varying(255)
);


ALTER TABLE public.enquiries OWNER TO postgres;

--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO postgres;

--
-- Name: garments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.garments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    garment_code character varying(50) NOT NULL,
    order_id uuid,
    order_code character varying(50) NOT NULL,
    customer_name character varying(150) NOT NULL,
    customer_mobile character varying(30),
    title character varying(150) NOT NULL,
    garment_type character varying(100) NOT NULL,
    specs character varying(250),
    design_code character varying(50),
    collection_name character varying(150),
    production_stage character varying(50) DEFAULT 'DESIGNING'::character varying NOT NULL,
    material_status character varying(50) DEFAULT 'READY'::character varying NOT NULL,
    trial_status character varying(100),
    trial_date date,
    due_date date NOT NULL,
    priority character varying(30) DEFAULT 'NORMAL'::character varying NOT NULL,
    payment_status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    paid_amount numeric(12,2) DEFAULT 0.00,
    total_amount numeric(12,2) DEFAULT 0.00,
    status character varying(50) DEFAULT 'IN_PRODUCTION'::character varying NOT NULL,
    assigned_to character varying(100),
    designer character varying(100),
    branch character varying(100) DEFAULT 'Main Branch'::character varying,
    image_url text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.garments OWNER TO postgres;

--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_code character varying(30) NOT NULL,
    name character varying(200) NOT NULL,
    category character varying(100) NOT NULL,
    variant character varying(100),
    unit character varying(30) DEFAULT 'Meter'::character varying NOT NULL,
    stock_qty numeric(10,2) DEFAULT 0 NOT NULL,
    reserved_qty numeric(10,2) DEFAULT 0 NOT NULL,
    available_qty numeric(10,2) GENERATED ALWAYS AS ((stock_qty - reserved_qty)) STORED,
    reorder_level numeric(10,2) DEFAULT 0 NOT NULL,
    purchase_price numeric(10,2) DEFAULT 0 NOT NULL,
    supplier_name character varying(200),
    image_url text,
    status character varying(30) DEFAULT 'IN_STOCK'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    composition character varying(150),
    weave character varying(100),
    width character varying(50),
    gsm character varying(50),
    hsn_code character varying(30),
    origin character varying(100),
    selling_price numeric(10,2) DEFAULT 0,
    location character varying(100),
    lead_time character varying(50),
    supplier_contact character varying(100),
    notes text
);


ALTER TABLE public.inventory_items OWNER TO postgres;

--
-- Name: measurement_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.measurement_points (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    point_name character varying(100) NOT NULL,
    value numeric(8,2) NOT NULL,
    unit character varying(10) DEFAULT '"'::character varying NOT NULL,
    marker_index integer,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.measurement_points OWNER TO postgres;

--
-- Name: measurement_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.measurement_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    garment_type character varying(100) NOT NULL,
    recorded_by character varying(100),
    notes text,
    recorded_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    customer_mobile character varying(30) NOT NULL
);


ALTER TABLE public.measurement_profiles OWNER TO postgres;

--
-- Name: order_progress_stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_progress_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    stage character varying(50) NOT NULL,
    completed_at timestamp without time zone,
    completed_by character varying(100),
    notes text
);


ALTER TABLE public.order_progress_stages OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_code character varying(30) NOT NULL,
    garment_type character varying(100) NOT NULL,
    garment_desc text,
    collection character varying(150),
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    order_date date DEFAULT CURRENT_DATE NOT NULL,
    due_date date,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    customer_mobile character varying(30) NOT NULL,
    customer_name character varying(150),
    expected_delivery_date date,
    delivered_date date,
    advance_paid numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    balance_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    current_stage character varying(50) DEFAULT 'ORDER'::character varying,
    reference_images text DEFAULT '[]'::text,
    production_notes text,
    qc_rework_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    method character varying(30) DEFAULT 'CASH'::character varying NOT NULL,
    received_by character varying(100),
    reference_no character varying(100),
    transaction_date timestamp without time zone DEFAULT now() NOT NULL,
    notes text
);


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    paid_amount numeric(12,2) DEFAULT 0 NOT NULL,
    balance numeric(12,2) GENERATED ALWAYS AS ((total_amount - paid_amount)) STORED,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    due_date date,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    customer_mobile character varying(30) NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: production_stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.production_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    stage_name character varying(100) NOT NULL,
    assigned_to uuid,
    status character varying(30) DEFAULT 'NOT_STARTED'::character varying NOT NULL,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    notes text,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.production_stages OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    po_id uuid NOT NULL,
    item_id uuid,
    item_name character varying(200) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit character varying(30) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(12,2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
    received_qty numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    po_code character varying(30) NOT NULL,
    supplier_id uuid NOT NULL,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    order_date date DEFAULT CURRENT_DATE NOT NULL,
    expected_date date,
    received_date date,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: qc_checklists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qc_checklists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    check_point character varying(200) NOT NULL,
    result character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    checked_by uuid,
    checked_at timestamp without time zone,
    remarks text,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.qc_checklists OWNER TO postgres;

--
-- Name: stage_definition_employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stage_definition_employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stage_def_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    assignment_type character varying(30) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stage_definition_employees OWNER TO postgres;

--
-- Name: stage_definitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stage_definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stage_key character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    description text,
    required_role character varying(50),
    dept_label character varying(100),
    color_class character varying(50),
    sort_order integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    image_url text
);


ALTER TABLE public.stage_definitions OWNER TO postgres;

--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_id uuid NOT NULL,
    movement_type character varying(30) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    reference character varying(100),
    notes text,
    moved_by character varying(100),
    moved_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    supplier_code character varying(20) NOT NULL,
    name character varying(200) NOT NULL,
    contact_person character varying(150),
    phone character varying(30),
    email character varying(150),
    address text,
    specialization character varying(200),
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: trial_alterations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trial_alterations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trial_id uuid NOT NULL,
    description character varying(255) NOT NULL,
    category character varying(50) DEFAULT 'Fit'::character varying NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    assigned_tailor character varying(100),
    priority character varying(20) DEFAULT 'Normal'::character varying,
    target_date date,
    tailor_notes text,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    completed_at timestamp without time zone,
    completed_by character varying(100)
);


ALTER TABLE public.trial_alterations OWNER TO postgres;

--
-- Name: trials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trial_code character varying(30) NOT NULL,
    order_id uuid,
    order_code character varying(30),
    customer_mobile character varying(30),
    customer_name character varying(150),
    garment_type character varying(100) NOT NULL,
    collection character varying(150),
    trial_date date DEFAULT CURRENT_DATE NOT NULL,
    trial_time character varying(20) DEFAULT '11:00 AM'::character varying,
    stage character varying(50) DEFAULT 'First Trial'::character varying,
    status character varying(30) DEFAULT 'TODAY'::character varying NOT NULL,
    fit_status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    designer_name character varying(100),
    delivery_date date,
    neck_style character varying(100),
    sleeve_style character varying(100),
    lining character varying(100),
    embroidery character varying(100),
    fabric character varying(150),
    spec_notes text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    trial_attempt integer DEFAULT 1 NOT NULL,
    alteration_count integer DEFAULT 0 NOT NULL,
    customer_feedback text,
    customer_rating integer DEFAULT 5,
    fit_preference character varying(50) DEFAULT 'Comfort / Regular Fit'::character varying,
    fit_checkpoints text,
    fit_notes text,
    completed_at timestamp without time zone,
    completed_by character varying(100),
    next_trial_date date
);


ALTER TABLE public.trials OWNER TO postgres;

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name character varying(150) NOT NULL,
    display_title character varying(150),
    department character varying(150),
    email character varying(255),
    phone character varying(50),
    assigned_branch character varying(150),
    bio text,
    avatar_url text,
    clearance_level character varying(50),
    system_role_label character varying(100),
    privileges_summary character varying(100),
    member_since character varying(50),
    tenure_tier character varying(100),
    security_status character varying(100),
    session_lifetime character varying(100),
    emergency_contact character varying(100),
    work_shift character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- Data for Name: app_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_users (id, username, password_hash, full_name, role, active, last_login, created_at, updated_at, email, phone, avatar_url, designation, department, bio, assigned_branch, allowed_modules) FROM stdin;
a95cac38-1158-4d16-9dcd-df9cb4e32976	sivasurya.official.8@gmail.com	$2a$12$bI1eHt6l56/cHinroocG..8ZdNcXhIL4uxt7CQg6N.bcbEptHWhdO	SIVASURYA S	ADMIN	t	\N	2026-10-02 08:33:25.059	2026-10-02 08:33:25.059	sivasurya.official.8@gmail.com	sivasurya.official.8@gmail.com	\N	\N	\N	\N	\N	\N
d74e0819-2f3d-401b-a5ab-102d02ae74b8	admin	$2a$12$CkKSzEFFfJ61XfSMLpId3OmiBTDWkqijh6xDv0QqutbX46vk9gABC	Elena Vance	ADMIN	t	2026-10-02 09:38:51.944915	2026-09-12 15:46:41.735826	2026-10-02 12:40:14.296419	elena.vance@haulo.com	+91 99887 76655	data:image/jpeg;base64,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sshjmsmgonssssvjjjimogkogjjvshvgvgggghjjjigksssogvovvupnvrjggssvggksovogggnugvggihvvvvvigjjjrgpusvolugglvussjvvggulikrgvvgvgigkvvvjvqlvvvuknqrrikgnrihnsogshgtlAHMlgsqnviiggmtvuugjtvvoqvltvjrhvstugjvvnoslvBFrGurqgjnmrnmghjjnpqmomlovrooqvvvugnsgggjvpGEGgnPGtpkuJIrjNusjjqlonkoggvlsgvoggsvgngtujKMPolluAGiqDngjnmHrjjirjvvsqlghohlqwxrphvvkADGHAonpEICnPPqqvirDnuhtHPKOnolioggnow+IulvvjDBBgBloKsmIBIJhjgBOvqgtlPNNqvjikrgg8+iCqWz3+zAL/AMBhyrY6DI7BJpIb6arY4rax5a4qKqZ7/s8x66Vq455OdPMuNLewrhZ5aTzxg456IJZrr77rIqIb7slh45pt7oIKDgRzRcwN/Ey766TK54Rqp776pbjhfk6ekykZZGqTASgvNzwBAnODgvtefs0F36qxDLqL3ESgLM3dc8HRg5HxVacTaM/uAWe8D9DoSPRlTkOPlPEbjBTBk3GAVBbBsMy/6/PrBoBxMO+o+CO0uRQ8+HxclX7YxBA4lgTSMeufzGQ+09kOkp4sRbMxwQCdzHRuMuKMAhDnaKBgmF7qI9YrVRtMvf1rWnBKGY5jKWFT9k9hmcdzPKBxQIa5Zx7ZSNpvP6ULdoHAoX/ScFK47YeVHW0AACs+bbJX2W7b7rZyfU8HNzso2uF6reC4FjqHPUR87Jl0dgRSLIYsdmmeD7ZlTyQDAFhFF9KHr0YXomWQFVZvvIcIlfggXY4XOe3ln06aNidiK92z0REOb1iy5QU29/b48RrztLstClzbUe9Xll24oYynyuMrAucD9O2pI21/+rQamoekvPesK/voK9cPFm3lrppmdP8AXdF8mo/q1lDnoUz/AGBVFrXahSIHAtAECn/8QYfQjumVfwUPrn05Qek8sFVfyZRwN4jEGFRhHB8S5Gb4WUWaU9otqotXdY++94HTJetSnOcpkHrv6MbmfxyltB/rRadade1z6xvNIQXyK0bRp7LaGpjyaPnB/WY6tKCwdLYFvWVcZaXeWy5i/GC/4n3LNLo0KevYOPJ03709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	Director of Haute Couture	Design & Atelier Management	Bespoke couture and artisanal craftsmanship.	Main Flagship Boutique	\N
ccefa282-127e-41b9-9f6e-1161867fc545	aarav	$2a$12$cSLd215cD7q/vPE5NRMdXeo7ImRFLRMEVWnGH83obb45n0n6AcR/W	Aarav Sharma	ADMIN	t	2026-10-02 07:46:27.430035	2026-10-02 07:45:49.976394	2026-10-02 07:45:49.976394	\N	+91 98765 43210	\N	\N	\N	\N	\N	\N
a00d8f43-e94b-4604-b1c4-cb5549313cb3	priya	$2a$12$2JETyJd3jKT/mrfuCTIWA./wSLaV9PTA/5MljMzRKkn1cuVXDHD2u	Priya Couture	ADMIN	t	2026-10-02 08:04:09.814676	2026-10-02 07:54:59.716505	2026-10-02 07:54:59.716505	\N	+91 99887 76655	\N	\N	\N	\N	\N	\N
8c56b66f-4755-4c20-af29-f2075cb6b68c	admin123	$2a$12$4R.YID959acZI4ykNWehXOmKnc7Pj6dXTcXEmKvvhhEN1/HexLa4C	siva	ADMIN	t	\N	2026-10-02 08:15:45.593353	2026-10-02 08:15:45.593353	\N	9344075887	\N	\N	\N	\N	\N	\N
e0cdad05-24bf-4d5b-9194-3eaaa5826030	testowner1	$2a$12$I.YD/ueJZbjuA5lWCQsunOv54ipnS7j8LVOdE.mlQa2WKjISy3ASW	Test Owner	ADMIN	t	\N	2026-10-02 08:28:29.71352	2026-10-02 08:28:29.71352	owner@haulotest.com	+91 99999 11111	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, order_id, appt_type, scheduled_at, duration_minutes, status, staff_assigned, notes, created_at, updated_at, customer_mobile) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, branch_code, name, type, street_address, city, state, pin_code, country, phone, whatsapp, email, website, google_maps_url, active, is_headquarters, manager_id, working_hours, features, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: collection_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collection_activities (id, collection_id, activity_date, description, activity_type, color, created_at) FROM stdin;
\.


--
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collections (id, code, name, subtitle, description, season, year, status, designer, branch, launch_date, is_featured, cover_image_url, thumbnail_urls, created_at, updated_at, production_deadline, progress_percentage, design_progress, materials_progress, production_progress, qc_progress) FROM stdin;
\.


--
-- Data for Name: company_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_settings (id, company_name, short_name, tagline, owner_name, business_type, gstin, pan_number, primary_phone, whatsapp, email, website, street_address, city, state, pin_code, country, logo_base64, created_at, updated_at) FROM stdin;
167d5d45-ec33-4c48-b282-3cfb102116f0	try compny	TC	summa	SIVASURYA S	Bespoke Atelier	\N	\N	+919344075887	\N	sivasurya.official.8@gmail.com	\N	2/78,MUKKONAM,POOLANKINAR (PO),UDUMALPETTAI(TK),TIRUPPUR(DT)	MUKKONAM	Tamil Nadu	642122	India	\N	2026-10-02 13:16:09.081405+05:30	2026-10-02 14:03:25.274214+05:30
\.


--
-- Data for Name: customer_body_measurements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, top_length, full_length, skirt_length, pant_length, armhole, upper_arm, sleeve_length, sleeve_round, elbow_round, wrist_round, front_neck_depth, back_neck_depth, bust_point, bust_point_to_bust_point, shoulder_to_bust, shoulder_to_waist, front_width, back_width, pant_waist, pant_hip, thigh_round, knee_round, calf_round, ankle_round, crotch_length, bottom_opening, waist_to_hip, flare, posture_notes, shape_notes, notes, recorded_by, recorded_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_measurements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_measurements (id, customer_mobile, garment_type, bust, upper_bust, under_bust, waist, high_hip, full_hip, shoulder, cross_front, cross_back, armhole, sleeve_length, bicep, wrist, front_neck, back_neck, apex_point, garment_length, posture_notes, shape_notes, recorded_by, is_active_profile, recorded_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_notes (id, customer_mobile, note_text, author_name, author_badge, category, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (name, email, location, avatar_url, tier, total_spend, balance, favorite_garment, measurements_on_file, notes, created_at, updated_at, mobile_number, first_name, last_name, salutation, gender, alt_phone, instagram_handle, preferred_channel, dob, anniversary, street_address, city, state, pincode, landmark, credit_limit, fit_preference, fabric_allergies, preferred_neck, preferred_sleeve, preferred_occasions, delivery_preference) FROM stdin;
\.


--
-- Data for Name: designs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.designs (id, design_code, title, garment_type, order_id, status, style_notes, designer, thumbnail_url, created_at, updated_at, customer_mobile, sub_category, style, occasion, collection, primary_fabric, colour_options, sizes, construction, embroidery, estimated_cost, suggested_price, estimated_labour, production_status, times_used, last_used_date, tags, image_urls, swatches, notes, created_by) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, employee_code, name, phone, email, role, status, joined_date, avatar_url, specialization, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: enquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, converted_order_id, source, created_at, updated_at, occasion, preferred_date, estimated_budget, next_action, fabric_brought, avatar_url) FROM stdin;
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	init unified schema	SQL	V1__init_unified_schema.sql	\N	postgres	2026-09-25 17:33:17.762075	100	t
\.


--
-- Data for Name: garments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, design_code, collection_name, production_stage, material_status, trial_status, trial_date, due_date, priority, payment_status, paid_amount, total_amount, status, assigned_to, designer, branch, image_url, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, item_code, name, category, variant, unit, stock_qty, reserved_qty, reorder_level, purchase_price, supplier_name, image_url, status, created_at, updated_at, composition, weave, width, gsm, hsn_code, origin, selling_price, location, lead_time, supplier_contact, notes) FROM stdin;
\.


--
-- Data for Name: measurement_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.measurement_points (id, profile_id, point_name, value, unit, marker_index, sort_order) FROM stdin;
\.


--
-- Data for Name: measurement_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.measurement_profiles (id, garment_type, recorded_by, notes, recorded_at, updated_at, customer_mobile) FROM stdin;
\.


--
-- Data for Name: order_progress_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_progress_stages (id, order_id, stage, completed_at, completed_by, notes) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_code, garment_type, garment_desc, collection, amount, status, order_date, due_date, notes, created_at, updated_at, customer_mobile, customer_name, expected_delivery_date, delivered_date, advance_paid, total_amount, balance_amount, current_stage, reference_images, production_notes, qc_rework_count) FROM stdin;
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, total_amount, paid_amount, status, due_date, notes, created_at, updated_at, customer_mobile) FROM stdin;
\.


--
-- Data for Name: production_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.production_stages (id, order_id, stage_name, assigned_to, status, started_at, completed_at, notes, sort_order) FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, po_id, item_id, item_name, quantity, unit, unit_price, received_qty) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, po_code, supplier_id, status, total_amount, order_date, expected_date, received_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: qc_checklists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qc_checklists (id, order_id, check_point, result, checked_by, checked_at, remarks, sort_order) FROM stdin;
\.


--
-- Data for Name: stage_definition_employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stage_definition_employees (id, stage_def_id, employee_id, assignment_type, created_at) FROM stdin;
\.


--
-- Data for Name: stage_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stage_definitions (id, stage_key, display_name, description, required_role, dept_label, color_class, sort_order, active, created_at, updated_at, image_url) FROM stdin;
49d1deb1-0cd1-4fff-b54b-833df0783abf	ORDER_TAKEN	Order Taken	Order intake: fabric requirements noted, advance received, and order committed to the production schedule.	STAFF	Order Intake & Reception	stage-emerald	1	t	2026-09-26 17:47:14.261743	2026-10-02 12:40:14.296419	/front end/assets/stages/Order_Taken_1010.jpg
c0000002-0000-0000-0000-000000000008	READY_TO_DELIVER	Ready to Deliver	Quality approved, packed with care and awaiting customer pickup or boutique handover.	SUPERVISOR	Delivery & Handover	stage-silver	3	t	2026-09-26 17:47:14.261743	2026-10-02 07:43:53.332023	/front end/assets/stages/Ready_8043.jpg
1ff0bbe6-d088-4267-bfa6-5924382443d9	QC	Quality Control	Final inspection before dispatch: stitching, measurements, finishing, and fabric quality verified by QC team.	SUPERVISOR	Quality Control & Inspection	stage-gold	2	t	2026-10-02 07:43:53.437954	2026-10-02 07:43:53.437954	\N
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, item_id, movement_type, quantity, reference, notes, moved_by, moved_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, supplier_code, name, contact_person, phone, email, address, specialization, notes, created_at) FROM stdin;
\.


--
-- Data for Name: trial_alterations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trial_alterations (id, trial_id, description, category, completed, created_at, assigned_tailor, priority, target_date, tailor_notes, status, completed_at, completed_by) FROM stdin;
\.


--
-- Data for Name: trials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, neck_style, sleeve_style, lining, embroidery, fabric, spec_notes, notes, created_at, updated_at, trial_attempt, alteration_count, customer_feedback, customer_rating, fit_preference, fit_checkpoints, fit_notes, completed_at, completed_by, next_trial_date) FROM stdin;
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (id, user_id, full_name, display_title, department, email, phone, assigned_branch, bio, avatar_url, clearance_level, system_role_label, privileges_summary, member_since, tenure_tier, security_status, session_lifetime, emergency_contact, work_shift, created_at, updated_at) FROM stdin;
d44afacf-256f-427f-9140-c8d93bab72c1	d74e0819-2f3d-401b-a5ab-102d02ae74b8	Boutique Admin	Director of Haute Couture	Design & Atelier Management	elena.vance@haulo.com	+91 99887 76655	Main Flagship Boutique	Bespoke couture and artisanal craftsmanship.	data:image/jpeg;base64,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sshjmsmgonssssvjjjimogkogjjvshvgvgggghjjjigksssogvovvupnvrjggssvggksovogggnugvggihvvvvvigjjjrgpusvolugglvussjvvggulikrgvvgvgigkvvvjvqlvvvuknqrrikgnrihnsogshgtlAHMlgsqnviiggmtvuugjtvvoqvltvjrhvstugjvvnoslvBFrGurqgjnmrnmghjjnpqmomlovrooqvvvugnsgggjvpGEGgnPGtpkuJIrjNusjjqlonkoggvlsgvoggsvgngtujKMPolluAGiqDngjnmHrjjirjvvsqlghohlqwxrphvvkADGHAonpEICnPPqqvirDnuhtHPKOnolioggnow+IulvvjDBBgBloKsmIBIJhjgBOvqgtlPNNqvjikrgg8+iCqWz3+zAL/AMBhyrY6DI7BJpIb6arY4rax5a4qKqZ7/s8x66Vq455OdPMuNLewrhZ5aTzxg456IJZrr77rIqIb7slh45pt7oIKDgRzRcwN/Ey766TK54Rqp776pbjhfk6ekykZZGqTASgvNzwBAnODgvtefs0F36qxDLqL3ESgLM3dc8HRg5HxVacTaM/uAWe8D9DoSPRlTkOPlPEbjBTBk3GAVBbBsMy/6/PrBoBxMO+o+CO0uRQ8+HxclX7YxBA4lgTSMeufzGQ+09kOkp4sRbMxwQCdzHRuMuKMAhDnaKBgmF7qI9YrVRtMvf1rWnBKGY5jKWFT9k9hmcdzPKBxQIa5Zx7ZSNpvP6ULdoHAoX/ScFK47YeVHW0AACs+bbJX2W7b7rZyfU8HNzso2uF6reC4FjqHPUR87Jl0dgRSLIYsdmmeD7ZlTyQDAFhFF9KHr0YXomWQFVZvvIcIlfggXY4XOe3ln06aNidiK92z0REOb1iy5QU29/b48RrztLstClzbUe9Xll24oYynyuMrAucD9O2pI21/+rQamoekvPesK/voK9cPFm3lrppmdP8AXdF8mo/q1lDnoUz/AGBVFrXahSIHAtAECn/8QYfQjumVfwUPrn05Qek8sFVfyZRwN4jEGFRhHB8S5Gb4WUWaU9otqotXdY++94HTJetSnOcpkHrv6MbmfxyltB/rRadade1z6xvNIQXyK0bRp7LaGpjyaPnB/WY6tKCwdLYFvWVcZaXeWy5i/GC/4n3LNLo0KevYOPJ03709Rk6/2OunVaSTXQaYcf3yoY9+N0fgYLxGMARqE+uHBQXj4t1uvgfFhCQLTWdaIZVbcSLUX65RuZtW5kkMk6m9BHl6iwJpeomCekLRRTYfQMQaWQQqa49/J+BMfD1qBi6c8kDhGs2eFUlxBkRffMbbceBcdYQJiC3qiawVGeGKtJV1I6PmNwC2K+Ohwz4INXvaacadeQfEChpJ/NTI88BJC1xzTCQAGBGB5uMb5ZmKgpcgTfUbTcSdJHup09G7xx3IbNVSdanUVsiNLFzI3eC+2Qi/ibUFOIGIfca7jsoKw4AABCebXR9iuy9A1xBANvLg42+4nMdbJAJCBXmu2Tf8d22J8BD3dWUMPEriVpMYpaaklbYSfVSfXEOPOWqDoCSgRZAPs930Mvc0KNrSgCIQXcX4RTygfvMVVYPABKhf94rcfmehT3gB4dtmyxpURL7vlZ9XLqpWcrAVUWQONLIZrQKMrdrh7U8Drn8KhYHqhLg3jXeTglscUkJWdYVaEDGKUSwxDuYaTOXFRGCsYjLJMVxKm/LIeFLgQuEbbvAKPEMANF8cLOA7FI+sK4Gd+6IAjEA524TZpioQYlFJQdSWIKICDLIYcxl0dqYswY6P04/cBtqNdaVwaXMeiC/M1nzfYXTLbhmfgNbILqcRr1awZd0+cL28GsM6xCCbcicCwN8TwXEeFq7j21eIqJ8RezgvQTT/ANuTwzxop9VDcqPuv42082Z25xR9eOirYbJSaqBAWgrVl5NkQhxZGVFAgwZRiBjhLc8etO+GJusMIqJbz0caBC0/Hc8PARBAqWkn0Q6IwCCyT/J/hwDpy7qeONu4Qf8AVDvwBizvbrt0UMAve2CJEOT/ANufaucbUcLlac69xrSpx+LS2psqfpWQAEf6z+lYhDfYYt8v7bjRYIM/h099zp9z0khQSuyIqEGSEBXc2b5jDivppjrMYpRkNqRexFsPym/IvZxNftdmUIPGADOFf150KEuGQdlllMY2oI175Sce8qaimJNXfaC7N6LDp7g/2fEtOBApfrJJJKCzyNCf3Qo2jmtNyKPJHtK8NyCBGQN7j+qnNLh3qhCNdPFtoTZa557cPjqpBMrvBartj6PG41/wxvDKW5oe/wA/CvzRgmkOPJ48x4REE/HagAQmNDJeSYrzToW6uXCwEYbrRWLFkXSAtmFuZGsOU3VKZIarkk6odAscyL17mZ4ZY9OIaq0U0JB1FQyzDgtevvOVAgyhLmWYvtD0aDzQVj7zhdwsf92d6syrbcXu66ZwAR5NYnQECoGTL/8AvCeqfmPu7JrZDEuQKzLXmDQ7A3S3MMUm35QhpVwRbbow/hMBFDk5/dKK0Xvcc3Uk8SjvYe4PAgy82Rbk7QERxCoONAQPl6xFgfnUDCCN9vuPaULRZfMvkU6z8y3gkHs2Xb7O9f8AukJ9m5ViDmT0ovVq3Rn7WE4EwM8s926maslM0y8v4Sz2wszR0BF+7Qpj+AuIgJxPi8tHjQSFurlhuWHGK97MRxArmIScZ8+2lMKOC7MBqDKABGQkqkjUbFCvKB8lt5CLKxRpjAnz6Z+Uy1rvKLJ0OTLkCjokZTe/Y6xLHTaD6+DKEue2RCBslaRcxMbAsJnGZMbChArvYfa2ChRHOCHJN7L+xXWy4FuSJgDDL+/KPsNCY9zEuMHvn/aehl/LENqFID20/Q6ipeYNtrqsknkUuJ/L8wv9KdrlmeeZXlUE3UZIQCH9+3SdWaT2dPnMZQQe04+c0cIosxQomgelhkzwJHXVTNLu0wjEYYR5g/VoSUX+VtkN8p7L5QA5IBAGIoj9byyb7hJOxw37UGheYskAHCBfTCMnp1A1xiSFnzJQaokkQAsxcSqstw33+/m1u9kmhkeZbdWvprp+QhmOEMA20bTNDVjk73FdzVy5VR8ScugfXT4141442/vrQgAAcFdY3zVnkjYCo90ofw7yzQZZfR5Yc0396697j4bOIaXoVDgjMHfBmBuTeAL+Wtu4aceWSebLVVzyUzx9hwrW/OBpT5TPe/P5HNKvRgwX4esj9c9Y2e19bSQ383+88ihijFo3LCZ6ft8NFz8pmAg2kjwtrQJ0qj9BTZ2dw7V1U8NwzUQ/YJ/MS39fu2mf4bRTkrET4yKJaTHOP71Ta8dwxZ+dTZlAlRMeo+DJ2OCdtu0CAAcAj6QtS0z4yi3/AEm/m9M9prKngRr/AIDpl44oPz9N59vYgI9xSyNaTPLNLb3DJbtjbd2ytAPJ8IPapgpkMxnv8RHNKYUlGu5P1p29HHh1/fgVDX7AUQssYCzjzLjuwOKJhBF1zVJ6pHfWadg+ZBj3zVhYzGoA6kKBBWqX96qJ/8QAAv/aAAwDAQACAAMAAAAQ33zV5X8BFVcUUUgQUMMw4wwwcUUcIEAsYYcQMMMMQIkM89tnPVpRBZkUY48UMU4wkMM4wk4EMkEo8IMYYIAEMwM884pRBRZw8IwMkgoo88wwEMMMIwsMc8Q0Q088kUYwgEQwEIMwwkcIoYw0gcEogoAIE8gAAUIAMMMsUQY8sEUEwwow08g888A8AAwoQo8oAgsIAQsIAwEoUoAQ4ogsEsUE4csY0Q8QwwIMU084IcowQcM0AwwU0MI4EgsAU0MEIMskQkEw0k4swwEk8IUhXG4MQEMcYAc4Mwk88kswUs4M0QAI0UoQw0gYs4wMwECgEiuUyEsgo22H7q0kI884YIcgs488UE4oc8gwgocA40EI8alt/EuQ4N/HF9/CEQwsYgI0wwUoEQcoEVBAYwkwwww4UQdZPeaeoCgHLPZNjAUYYSkMSkYckoYAwIcIOoEUIAMMIkmSWEgw+08EQE4CZYYQMICwsoUs8A4YMshAGQHgtZ00+51OK6EgwGMAUkMsYYAcoc4sOAoQEssUcxwRy2MvBdtRd5+uXGDBCAU8Y+qCzTIoMQkoMEAMY0EYg897c2cWFJH3PyyWx/lNA4JJutIk/wA+88CJADKKFqULsvA5NRyiZfJKCEGIWeatOWcicKmDNrVvWYfrHHCB2ErGUHjCp4mS8gG13PZ4JXlmHgrnfh4u8m9NSLM5kw3usTzHAPwHf9oArBPgFBxFwAeXfhCXXv8Am1N4LQMeApnS4Qsome5nKyq7qMxoPBcoPlPC/DLwaJ6lysZbduwm+Jdp0HOLb7AGh4ciSIK2MH8Tva0Z2I4V7Zvnc+HR+5P+um8N8/FC3OAwNrw3Jl2M9W4+Pg505ABwjgunrxf6zSJVyb1YLoNmtZDmpy1O7Ktgj2z1vD8BWlspaCtvwn/hoB67xKrDR6aDvVolIA8fwiXAz/VeINXBMP8AYsTTZwAC/wB+hd2FNrwGK8osm+4M4p7ZAoJn9MpyCfD4f+RIHB5EQ26W0ombAZEyKFqosv00xoDuLJJppywbkel076pHZxjLY8fe2hpO6jIP2DBh38r1w8R+H+ah0n7TjlS9BO0zKnF7VNj+M2npog5wqdEGv4/z360pxNP7y5BuPw2w3Sgo9ynyofrkPQB1JsyOU44Klmn12v48eH3LNIPMiMGbe51pX+61RYNe7doj9KQus1f/AK6bb+tACapUBOBDgS4VOkl7Ni2IXAxuG1IzHRbUp6NZ2Gq6I898KZ6KqliW6RtBSj1j4kpsc3IKvbb1FhD1EHHbl7rGZruNGrqATLT8p86cN3xL9LgqLStKZ+RBXrEZistjfBR+B7JMdydO6rVeS7YH2NXMNWdkdHN8mtoW8i95BF2dJEBYZ2bYOkBd98tGizDp4g43Hey5J/wPfHAJPlTYTHGrp3BkwjiLp83Te/8AxQA7uCb7wrqPK6hC3g/yCwN7KwUcUfFqyb7wyG2jltXHXoYQ9RrFb1sQmJe0cICsfA0LXL07olkjIhRd02vbvBlL3LoMRWPzqdNv51Y05u+VTtLtjmvgse3CQF5QdlqfDqwc83FR1qpQekAMuip5/fOiv5z/AAPCEqtVuEd4+qgqNF91FCENxdtsomMq0jEoVKih7IPzy3sLJ17zPBkbuPlcBHV//DFDR5mE5auRO8AVxmUoklWrf8m8ajpAJRZPvvF64bC074DPDuVbsIed5T7PcVMKjBxwv4OHCTUd3/zBUDsO2WOw24xCHHF2Z+FIesOL49gyAsfDw3HmOcwdU7Egy3YFvWWtaz9wHKCD2QZgg2YdkFaEw51Wj9yCEXdnDOy6oO1ayxKeknKHCOGNOrQR4aOv/wAJeQxCoh5OObstn8c5i5olIG/DiU3l2RAxyF1tPjD8slK56lYcWkwAw9BCtRgjkBKejR98GohO+ccMS5hoN0aU1xAV1EbR4uuzIy+Uufw5W389TuFo6SreTM/ocm2+SMT7tWy+GQL3Gt4ZjwrlBjB3IPxuxw0sIXZ8JghTnD9CxLcL5bijbnNkAmuPOlQgF2jNGZDoOPxsEvU1cqyZlOA6etfZYYIijWcQ+zAJ5jSwNIVVMlq20yADO8G7BRlpffOoALZXb5ebalBoY9pwU6KyTQnXWGshp1J9hf8AVuwlwcc6/m27Mvd3kpjbeslmaA1TgAZHcmSK+QwTuA0FbU+4UAQCLvwJexf6PBGCiiNcDwefrdrXyAeUSngm5Z9xh0AQgwKQs0f5F8QS8XPb/wBv0lIC36aZ3w07BlsubX68DuQbg+FzB5ZCusrO7YiinxXkdcdoa1hmbytS6JxBxABodM2yy5TNBcazA8GE87mEboDXxw42E52Falpz+3goVRKYDEh1v6c7Sii0GtreBAOLkvjOIQHJPDh/EKjGxhVxHULPfiZtesTn4vLB/wCrLV6H1te7hDT+vQPVx2CHIskNCIWHT/5/FIempaet9q2CuxN3a1vTiB4ZuAUIxTSKRR1KG+ogU5M1xSSjRfX3Jtxq78Z4bGumo4IbLMFFDDBlM1PC8kisdjR32WC3B3pUBmiNgBfFHEWGM0gmjqG27lcE5PJcUa3BaMGS4FCHO8E/fv1jb0FWIIYJjMwhXAUERzQkPjrzpubhdShWTVYp47I4dg7CtFrRxAqSX5dsZR7U9UovUX1BmNRrYSiJwX/PnT7sBuNuZiFsojl73SHbUIb9NZN4JBf0KAqbQZy0cLUvAX9NTQJMTxS2rmxV5J9OZb3UnEHlVYWaMlJuCxv3E6DINN83wu4UmHeo3pevr3eaiCSXFbFtKoMwBnoKMz7TRwoRbCM2nXm9dNb2L9OBL0HXN6zLr64HhnP37S2jx23AVMFPt+5Gn2tv62N1/XkvxwdvX46AzxP9d2QCdomEqZXAkOi7P+4Xky48dd03+WPFBwAlokpUK7BrO+yhkBPP26BJxCcfUnvlbeFufuj/AAGbIsc8ej1C+mIMHY+di7eWaqJh+Fv0dTVhCWCsn3roZisZ5ctxl+H1J8uyyMI45IcCikx9NLRwoqugzMWvAzbjKUEM7cpPFBORMDUQX0tu6LvMk9JN9vmrL895QFgGtS9l6DPcvcfvegez5IsS26nmHlZS5HGfrIu3y0Xl1qNSWfIIYAqVeQK0cuApNXPM2gEWH1WzGb6ubTztnCaIAYyoG8K7yWG0u3HJg6VbmwGyCiVHCP1mhdBvQY2WysWSDVN3eoqkOo+s8hhVjQhaKs9AYa0jzB9LfdXcwVeGKybEqYo/7OBjmVjnEdVfSeBXV5RTGSnzFpL3ns1qKy7wouXInxY8hWS7vt4yVOzxJcfphXZIVmF3G39q813zaYk6w8kHTIywzsCDgHQVsn7nr8tbAs+TEVJxQKDnQl2KMi6I+crW8cbVRqBC0AC10bPjGRz9BdGwodCGAobk5JxStBV8j40lY3S53ojixn1huam0zSr7MBtCEkibVq3tiQ+v+6Ll4d4O17LpFoszM6bf6+a2+xbybjE5Xh5aD+C9wG02G+i4HU/QGZzajwMXVB1SxeHUBs4kXAObDlwg31YiuvLP82yfKMsdiOuQIrR9GNWTXxMSInb9twmm7BPq5rDeJ6YTJeA8kqp4VT8AjBc6iuBZlIEi/8QAMxEAAgIBBAEDBAEDAwMFAAAAAAECERADEiExQQQgURMiMGEyFEJxUFKBBSMzQHCRobH/2gAIAQIBAT8AoorK/wBKor/2Iv8A0+/9MYv9Kv2WJl+2yxsv/QXlYWbL9iF/oKKK9tYrK/AvyX7r9jxQll+9or3P8zwuvatWcemR9UvKI+o0/kWpB/3ItPzivY/z1+Sx4Xt7HEqsKcl02R9RNEPUxfYtSD8otYbysWWX/wCiv2L3qbJO/ahTn4Z9bU+SGv4kR1IS6fssssT/AAWietGI/VfoXqX5if1Wmf1cPhj9V8RP6l/A/UTZLU1H5ZHXmu2R1nVj9XzVH9S/g+rN82f1TXG0fq9R9Kj62o+2z62p85WGLKZKXArLo/qZxI+sTq0R1oMTTyvbKaRL1XiKPraj8lyf9xJPC6HCPdilFeD6ibqhsssaE30PTk2JSXgW4p2OMaF8WSSNjGmhMtYrLxH+Q9tE0iMWyCklyJyj5I6z8oWqhTiWmOaR9UeoxuxpWJFYceeDa/kcRxfgUGnbxT5sgSIs+pKxTuI2xy5JTsjKmSkWdkoIqsLFjkWRoa4JEVRGVrCWbeGIZWaY7HqSPqsU5vwb5eRSHQkSKEkRYjUpMsWNpRLoVDjE2DiNMpjItG7gTTKZBV73hj7KODcibHRuh/tFqpeCWqvCN4ptsixs5FdibEanIosjDk+nmStDi0iO5W3yRdrlYlHDjFrk2xT4Z4IiwvdeGPsldieJMZBQa5RKMENKyK/R9P4RtcVyiNMaRGKSspM+1D2sUUVTKb9qzO0hO3hdvHVEcIX4JdkmITGmxwYqXR9OxaMRQSxJJigvkkooeJcG8uQna5LdljkkKSYheRNUWTnaoprkTbHF3wKLGuIkRHQh5XskiYoi5ZwiXJAsssslyTm4dMjqOcqGqIocatmlU+X4LVllonNJH1HbttmlO49ik4qxal2hCZxfRqC6xuo7RF5Q/expNk3XAuOhy55ZyyL8WQk2+cWXRuTJx3Jo0NOpOy0WPlCioppYdjkkacpLtWThfNE4SrhinqJVutGnqNOmJ8WJlk+SJKLZFOxfxIp2LCH+CSOWJGrCUuhOSSTZx4ZpJpcllkhEWSaiR5ZtRdFoZJqiXJu2+BTtEmpKkhQinz0akIxVpkNRx76Fqp9Cd1RIQuxrjojyLvKH+Bj4Yn5OyUEyOnFVxlPFCZLkgXl8IbxPSuV2R06NtMcI1x2RcKqSNum+LJRUelZpWv7eDyULCfJ5xYvwsnEQsNiY3hDfJJtEYOUbEq7w8tEYNsu2JjgfTfkenyT0n2RUl/HkipVijzhC7GIX4WPoYsPCGXhdiHyymssSQnzwR7EljgkKmRUeaw1zjaikbS3F9CaaKF7rLy+yaQuysMSHhISplm4crZtVDEhdnTwp0KaZwNJm3jsSxNuxMWaKoT/HIkrNtOxnOEyReFhrK7w0OJYneFPgUrN4niawsLkZeF+J4l1liG0PCxKYneEljgpEk0J0JrCGXwKSonJJWb1YnhPHFiF+J4Y+xXQ/asSQkLDYhIdMcPNYTaLvDLotNcjT+px0Ii8uhC/ExjJCdFp4ZfsYllDEUsSiu1lFDRJM0mtzXk6ZdPostibwvxvE8tsrgpi69iRSFTKQzcOSs4ZsQ9NDjWJ6s4SSSVDJzS4RpqtS35LL4E2xPCXAvxvGosvvDIv2Jm4s3MtiQ2KXPsmv2PTkndkpzINc7kbocUfWi20fUSgxaqS5RGSfQhMX43jU6z2Ia4F+FNm5XVoi03VjaiuRO8SjbKZX6NRIp9nEnzFo+kqTocJNcEZNeCM0+xSTYvw1h41C2WUI2tjjX4GjdRJcuVmnrJcvs1fUSk+HwafqIKNpml6pTltaxfNYkkbUPTTIpp1fBQlY4IjBJkevwWjdEtMeJKxwawyLdkSTt4ofXsWGo9UL1LbpoUt3CNW1L7XyRlKPXJDWk6fTRqeo9RKPdKxeqTilzaNP1MJD1IPzhI4vNCiL3ykOZbIupLDESaSKyumcIsjQzaKAtNGyKKRt7Y/TaT8EvTQjypUf0lu7P6T9n0ZRFpy6FpTT/iRgr5i0Q0oPocpx8EJ2UjaUJfglJpoUk27NSOnVkNOLV2NJTiiElJcElyIaRJfBTsqI4fBsHpiVMZQi+iym2JMc3a+DUipLsS4SOB1a4Iwj3RXwjaq5IpR6NS30KPBFNeRfimuYjjJN0S3LwxNpPsTbbZoqoIax4Fqrod2hJisc+dpuaHbYmvgk0WhO+0Jxujgf+RxnJVXB9KSVWJSoUW+zYhJ4opDSOPnHWLF+CubG3XCLUr45I6ap3iWXpLduQ2zcWObjqW1aFOL4oSQ0iUV8lYYlwb2v7cUbklwrZW5CiIawihxQom0qhfhupMqBcY9EW8MaxVocRLkpEki6LeEJ4r2KLYoMQlXsui7KNpRRRXvfCLvHkSpYeGJ46eHhDxWEPFItY6Zyc43EpMUkbhTkbmbmKXuoRPlNHRbZCFd9+xr2eXi83hYTHhqi+eUbkJZlb6G5fA2xSIsQmixMT99IlDmhadCTWKw8splPMV7Lwmy8OhpfByNMsSNvybI2S0kxqUGRnYmWWKVCmKV4Xsrn3MrDLLHWb9lssbE2yhtHA+jaRPBWNSmj7F4NyFJCeU6Iu0L8DzOVRbRpSco2ySKK9jF7lisclsSKwxolGUfAr+CheyLpiarK9jJ6zukLUn8kNS+GPyaPbWGsNFYbwmWXhG5EeUVml7HhpMkqftToQ5uKNKbnZeLRuS7Ja6X8eR6k5dvOmrmOJFKGod+xocSisP2URstllm6jcJ4Yx8JEpLNMrEWSZo8Rf+TfFeSWvEeq/A5W+WV7NFcN41Y8WaX8c176KwxDYuCzs6zY3ySGrFYkWjhjRaRCMUk65fJrSe9pFs+5ig2LTZD0yq5H0dL/AGj0IeOB6asuMeLFJMm04tEJ7TfE3IlOMeWKcWrTRaKRRRRRRWWso5LLy6GxNiOBGo+DckaOrF0mPSTbdn04LyLTh8n00iEVfs1V5JxuyMWjwJWh2jcxyVciUt0lF8EZyVctkZcWzen0zcbkWvarHEa9tljaGivZP4Foq+SHp6p0VL4Nsvg2P4NqXY+BPMijaSXBFUhk7olOTE688+SMtRSVtUP1LbcI8v4XwKGppyVf/IpKux6qiheoUnwmQbw5pdtIU01aaY5n1P0bzebr/CsSTa4PTxhKKl59jY2zv2N8WXiXQlaGmSbaaolG1yOMYStS5FNy3Lb35GowcJrhRVGnqVXPBqJUpR7FqQclG5P/AI4RHTklu4og+P0b18nqNGU5N/Vaj5iekTUJR8J8DSKEUU8X7ODgtG+JFqTSRHTilRDTWndXyW/gbl8Fs3YWLEykyWvt1HBI3slPjojrJyaTX+GPWo+qaupGTaSqVf8AA4Ju6+6jbJvhJInLmEn4fKF6trqCr/8ACTlKua+UiG3zGhfuXklFtdkft7ia3ppKblubtkdSenpfw5RoastVNuDQkLRT7PoxJaFdP2uRvLZXAlfBoaK0489v2Ox4v2LGpu+rqNP+5mnqS21LlkvURi0peTT1VN8QpEoSW6kyTrbz2Rk6cpRSojJzX3V2Tf7pIbUqW1ENJW22JVSFJf8AJDzedbUhBLca2vLUmoLhHp1JQTkR7Qi8asK5zRRKBRRoafUn7n7LwictsW/hDnB223+0VCiUVLlxQkotV4FqKU5K3wUpeCemtlNVbvgUPskkOLaJQjNEeG3Ibrl3yc1wR+pSbabN0/8Aahzk/BqK+aujVcVKU2nurwennGelFp3wQXI7LEifTKKEuThCpoaTRCDm9okkklistkpo3I3m8TtXhHq51p18lK26VsRts21FsXfSJaLdOMiT20mRkuSTVrs6f6IyjNol90a5VCVPpjU1F7eCDk2lXXmxQHEcV8EVtVRVGnJ2k0WWiyf8XnUdLgg3IuhcmjDYv28vE5UjU1bZuWLLNFtxf+RY9U7nFfCGkKjhjg35Ka75It10ONtuXQ47JJrpk9Nv7kxpxi35YnLd0LtXyVB3tkKT6oW1Fr5LxZGdNceyXQ8SZp3bJLk0NO3ufsYzW1bk0mMiMbGenfaEeDWe7Uk11eKEkl2RdMcbOUSnwkx+OUK+qJTSlyOUXJGpNKS7tidEnLjbHk++Uk6SaXKaISttOKzRV+Ui1VJlyLl8km2hrjDIjlZpx2wihZZ6jU2RryxifAvZ6dPc2Jj6Y2uaFjiimy+MNWbYtfsTrsfLZCDjy1bJL7n5ZsfbIUl0JDu+8R07asWlFDjHyOKS46FFy6FpJDUUSS8Mbob4shrQeooXyP8AkheMtkpxUW2as3OTY0KLZF+GPDR6dNKWJ3sdGxjjJCbFJClEpNm0cRIcZJ2mOl5OLOETk0jmRUlxJ2T5fHHHki/vSI3uQ2bZNvgUeKeJ6tcItvlvEoqRJzUpKS6HoLVkpptUzR0fugnNusIZLyamo5f4w6zT+TnGl/4xD/iyTqTFQ0ViA8WMlFsUaXL5sVt9ko93MV8UyUJN/wAzY/MmaUv+7u/3dEI+ShrM1yUihWa0VxLyKz0tSm/0hYZNcMY0Ib4IorMNTamLWhfJr6sFp1GVtlFeyPsTrskrXA58pN8EZLrihvdwPlKin5HLikuTQhv1IU+IWmLF5n4ykTVwY34R6KH82VnXltg/l+ykLFjY3njKoQqFzmsOCZLRT7RsUaodi5HLmmeihWinXMuWLDzP+OU0lyzU1W+F0I9Iq02/37PUSuf+Czn23cv0h5tUWJ4ZyWxNsT+VlrDt8D+GPaq/ZFx3EtrZprbFJeFhMbzwySpktSEfPI5uT5xFHpf/ABLLNWVzk8X4y2N1FsjwhvnLE+a9tFCbIcCkKSOGajSobT82J00OdO6ojJtEOh+2c4wVs1NWU2UJCYj06rSjnUlti2Pn3TXSEUJJDKNomI8iwmVijaU0Tpxv4IvlJEtN1YopKN+UbUukaf8AGP8Aj26usoKl2Sk5O2xZURRNPiEf8Z9VKoV8jzWZLhP4zVZYxYtG43/oTRa+SxDEqdMS+9wsqcVzVD+5ItNU7PTv/tr2avqErjDv5Lbd4fRFNiQiCEqVZ9W/viv0P3JjUThF5eENOiimVjkTaFLDJxf80aTlKDtojGSUk6/Q4tdo0G6aLHJRVtmr6iUrUeERLw0KRYnwaXM4r9izry3ar/XGGxOxl5vKeUhFFG0Ss2r2Js7RHlC+yy93PwSquR+o2er0tKnyamvGPC5ZKcpO5MsTZVsXBYolpI5bPSwbmv0WWTltg5fCG7d+5YYs3ydsXtSPOH0PC4o58EpcVYtWK6ZF7lymaekoy3t/dihlZYikVyemht0k/nPqp1ptfLovkvNnAmPt+zgRWF7rGjyNFdDt8WKCS57KS5TIatfyNo2bi0UhHDLE78DFyaEr04r9FDl8HrJ8xh7POKFivZde15l1jihZgnKX6RX3UuqHC0bXRd9+1q6aNr7Ka8EXRYkelcpwe1W12b07WPVu9X/jC7ReazQ/gSwhex5ZzlM8iSrg6jz2bxSwkVhK2jrFlFV0VaP+mTUdScfDR6j0+774L7l/9m7w+GarvUn/AJHm8JYWH2jrCyzxmiWKKZ1ht0qfFH1E20mhalykmS1oxdcsoorgQl90spYrHpJr+G1J1ZpSbij1GjpT0pOfCSu0Src6xQ2rGJ+9sjmseS8SFliPCPU6Gv6fXWtCTcb6NXWgluV/ck6Qoa+p/Y4oeGJMmmqkiLvopnQnnRkoasG+r5I9I/6j6vbGWjFdrln7x5Q65I8xF7FloWGLHBSQmNFpMXI2vZqq4n3w1YqOkpL/ADVEJakr36bhT+b9qfz0PRT5iypx7TNzLEy7xo/9Q2aG2SbklSNSTk5Sk7bxFjkkdiI559lCuy/Y0WLDXInJnGErkjoaTTIWtdp+EPUjdP22RnwbxyRuHJPsa+CyyT8YqiWER4xfIsrvN5r2JDSyzTj27xRqvZru32iUGqco47zITo3MTG7WE6EkxpfLHXhexoQsPsXZebLbF2V7UWSlyKTdDdCb7ZFrhVjfy43THFT9Q1JWarluqPKP/8QALhEAAgIBBAICAQQBBAMBAAAAAAECERADEiExIEEEUTATIjJhFAVAUnEjQlCA/9oACAEDAQE/AP8A9Gt//NZz5tNf/DsXgxMtFrEtGEiXxX6Y/j6i9D05r0xpr/e2WsJeD8bNwpWikOEH2iXxoMn8aS6HCS7X+7r8m1EY0Xl2MlCHtH6EH0S+O/RLTlHtFfmp/RDSnIXxn7Y/jfTF8bUP8XUF8V+5H+KvsXxoIjpaS9E/jwfoegr7F8S1dn+Mvs/QghfFT9i+JBdn6MF6FpQ+issirXio8jopM/xoSJfEl6ZLRmhpr8Ci2Q+N9s/QgvRtj9EWkL/ofZvl1Q4yfs2NLsiisJkkuyOpGhuL6Z+0tCbHfdEbFNCaZRtOUW8oqifQrsixzSJtN8GyMuyWgvTHpM2soUWz9IWnRFciGy8KXA5CYpL2OSa4EWSIjVmyI40xCjZGDJRbQo1jojOhSO81Yo4kJ8iJNElTEN5cUysMQnxniiNCgqFBG2P2bUOJzhYY8adtYeLwkNEZtG8UhFiHZt5KaE0T/A8RfBeKZBCs2v8A5D0/7I6ZtRt4JISWJUlyfqJusabolqJD1T9bKdM3XjnEZYTkmW3iQxjwlh+MeiKQ1iKoXRJyRGU2y3Q3Xs/UX2S1UvZ+rZv/ALJzbXYkbj9Qcr/DRHsrjD6WL7H+OIs2kfqIbb7N9dD1JDkyyRRVHJTKxGDNoolFLD7H6GiiMatsTTGkJqhyQnzIdfjiyI5UOdnLIxonLmi80ONmxoUBJFIcSMRLgooosTKKGseuzTQ0UbbFw2NZf4EJ8DbZGJaRuRKTlJiTZtKKs2vFUisrs9CSYosUyVlujcR1BNMcToh2SFJDa9HsfWX+FMY5UOxDVMiuMxwxcj4WEisJckeCzdwOZbZdGnOnyfqRLTIEhiHwS6y/woXI4lFL6HFC6KKK5w0RRJFCGRsSw4pm1DXOLQmhNEZW0LoseJLg9flixvnNFeFD4QptG6/CPZZKdDXGJRZTKORckeHi+S+My6EP/Z1ZyhlCLw0RdEmxptcklxl0IXPaFWE+MJlljvF/jXRHF5b8HysUbaReLH0LlFDgOLRRRWYpUMZeUkNfjQvFoRWaEPDXAkJiYllwHGhRGsReGsooY/xIQn4MQuSh4ihqsW/CLQ0svFEuBuhaqOGsNYvjD/EsLsXhVoWHiI/WefodYTFL+zciuMocbJRoq5YaysP8Swu8UUyhFeMnmyisxXInwPKZPkiuT0VxyUUisP8AGsIWFVF8lofeb5H2VlFFYsU2KSw3WJT4Irm81Q0UXQ/ywfGELCHxl+FISQ+yKGvCLKtiJ6ZTLa9Dfs3NrotDGvzQx2JZeXz4oaFON0N8VmyLLRYhiWavljWH5pYTQ6KxAoSxLo3JF3n34xfI2rG3usjPjkcm2WKSeLQiPjZdnA/wU2fpT+hwnFW1mLplr7EInQ+WRSRZYux+PB+m7KHwJJo/T+htrsuxS4Fh5ZZfmjS075Iaf9DiaquDRLhisYk2LgsY4iTKHwhOyxyNzLZznZE/x0/Z/ji0px6ZLTbFpNOzj6xyXixtfh0oKUJtjhJRSVmhLW312jW19WMtqiKTlpttGtpS05Ld7VkXwMtiHfpm5oUzeKY3eLGUUcDaLLRF2XI3PplnP3hoqS6YnK+S+Ojn8WjJKE1ZDUhtVmnLTdpSRKEW7tE1GO1e2z5c9+s/pcCeLNyEx8lI4s2o2lP7EmUymNvNX6NglFFnZ+3FlsTZz9eFfh3NpIhCF8zpjTg4tS4s1fkS3Jpjbbtiw0PTVm1/YlwIcLdodotlibE8Mopikdjix/RdDfIpFjE2hSZuNxY/w7LhH7Qnq2rRU5v93CJwiONCFh9iY+hCRVjSKWGsX4bkjehjd+FDVeiyy/w0Qj+5G2j2emxu2MrCGucU68H4+y/LjNCQ4m1/Q4oaRXmljT4kn6sdM2pcsnqKTpdYbHl4XWbH5oso2vwjw+RUIolho2jXis7miGottsnq32uBtelXksbkJ3imSsT8KKyrE394TWGyxylRHUaFUyUKKy4mwarEe8oTSXgi8X484YvKhpItiwuyx+EG7P3FMayiSGqF4+hYoawo3JI1IqLpCZfk8VhIseLrFIobReU6ojJNYtDKKxJWhLFDHixGl8eLpzHo6P8AxNb46it0XwsavSeFhfipjLwmW/C8JtMjK/Fqy2acd8qNbT2OPPeGbWRg3wlbNP4c5cydIj8fSiurKrrHyp7dOvsUh3KHgmWX+CyVFIo2mw2lZQuWRVZvMkaCrk+TzOItLUl1FkfiT90iPxYL+TsUYQXCSN6NyHJCZ8udzS+sQZqd5ssTxfnQkvJm0S4EhDG8ckZC05y6ix/xnbap0q+z4kIvSUmuT9v2OUUS1kh66J/Jf/qfran/ADP1tT27P15oalN2U0RXJKG5GyRTOc2yyyyyxP8AIrEOiWfiwi5u0KJ8rQkm5Ij8iW1R2n6mq+kPU1F2hzkyTLyuVRF0OSYuz2KmbUbUODbdDv6Z2uikzaU14WWizcJr8CkWXnQVRs/yJNWifyW7Vlw+2XD7ZvX9jmXfjZuIvkbEXSJT7ZGTv6Rvl2W5eh3E3Kjschc4pFI2H6ZsKKfheaK/s4xozX8W+GaynpScL4/LF8jkbqZuTLVHDQotI/6YrXY0m0PikcissceeyOExiZZSKXlTNjGnEUmmmamtLUUU11+OsRXKJxa5rgZzR7LaklfFDkkKPHDOPsikkUXH0Nvrgt30bebL4E7Gb2uj9SQtRl+CizZ9s2xLG6dk5uT/AKzz+KMl0xtffBF8k5NtDadWJcMS5aHdJISbRdH7XJUStIu0JFMoui7eH14RZyKOHJCmbiyUn1iy/wAcePXImvoukmN8cnDF7Kkn2Rv6KpNv7Ll75EtqtcnL4s5FXuRuh/yFtHYr5sXRLLI9rFjdnIxOmOVcl+Cwotm02m3w0I3I2R+kPThJcxRLQSVxJp3R6TXZ/QuOBdFtrkod3/SLE0lVFr6E42c2bios2xJxVFZj2i8RSvkkknmUrfikQ0+LNrKKxqqpZ0FUGxMeNTTjP+mPSceThl0N0UikkUxxHuSuhdWK7sXJQsONq0/Bd5ijU9EWakvXlpw4tiollGsunj2aaqCWLG+RkX9k4J9Pk1IyTFykUN2yynXZJWJLm2Vt6fDFawmWK/SbHB9uJUfoqIkkJ84RIUaRJ23m8aUNzEh5s9ms+Fj2c8eFlYaUlyielXRu5qi0Wi7G2hytoa91wxer+8OQ5SZGT/8AWy233ybto9WT6N0mK/aErEuSUWk2LrFjZ9CTbNOKjEsboeUzVatYXaNxeKY7LZuEyzU0+dyLjZ0Jjgu2bY3w7Hv6o/kxvtDqsOUUlyOXNobsjC1bOMJsVVaYpUmmTnw+PBEI+XGJ/wAsXyR/jE5LyxeGrDbbvgjVW6FKN9G9dMVW+BdUXyzTVzv7JyXSXjF8UbmXjT9opGtxFDazF8ioTGUN8l5lByHpyNOEnPlcI68X4UTjui0U6+8WNcDdUiDTT4G6qvKHvLfRF1JEV7Pky/ivDTjcvCyisUUUxYvHJfjbP7NRNRtHPAy+USXCI/xaG26teUO8tWyGmlyz0a7/AHeGkv2lHH4LYh5RxZRSWbw6aoaptDOKTLbVFXfJ8iW7VnKkrbdeS4O0RhJiilhyNb+fhBUlind+HuhiGxY6zQy8PsY4lPGquUx7SEW1x0Ur4krG2ka3835Ri5ENNRLGx41Xc3mKtpCxXgn3m2JZoa8HReLLxONxYlHlMt+qoa5K5PlKtfUX1J+Onp7v+iMUlwPLY2S/k86Mbnf15xfJXhflTNv9jsWGIbtEovc0JSQ+RM/1OKXy5te0n4Q0m6b6KSVY9jY2WSeLEfHXEvNoTkK8+vDjweKGsJGov32L/sQo8H+pJOcJe6rCTbpENJLl+F8jWGuSfEZPCxpRqC/IixsZZYmNl4vFY1uJRLp5+XqbtRR+iOm2KKXWbo7KGyjhGvJKL/srCVtISpfjr8D8FnW/mhW/Q5V6YnfohDndJ8vzRRYujWlc3/WdCNzRXH4+fwoazY2ar/cMsUi8cnJeaGJY1l++T+2WJHx4cNlFeL8LxV+diy8P0S5m8c/RtZXjfo3RLXpjxdmu4Qmt0qvoca5x8fjT/wBoxCqi8+sRVi00bK8W6XhZdl10f6lBz04tdpnxPlbf/HqO4P39G365RpqoR/68mLFi/GsWXmuWKn0Qv93/AGT1ow47ZZfJfNDHzXn8iL/lfBqxipuj42vr6WrFQ5t1RG6Vrms14Uc+L/BEZa8H2NuErJ6n7aj2z9KcuVERYmWRafDHx2cYaKxqxctOaXdEu2f6f8S5R1penwj3WUPvxfg/KxoTKtDK8NZftTNHUvtcohJu7VZWHyLU9SP2Pporx1fgb9fdFra3bIRUaUelhorDVj878lldi6HRy3i6Qx000QilJP6ZHXW6ul6eEVikOPJtEihJoTxQlhMWZC8Xn0s2We834TkuMWavHXbfIouLW7xWKKy0MW76XgnWZfh9edoSoaEMeZL96THbdn//xABBEAACAgEDAgQFAgUCBAQGAwEAAQIRIQMSMRBBEyJRYQQgMnGBQpEjMFKhsQUUM2JywUNg0eEVQFNjgvBQkqDx/9oACAEBAAE/Av8A/VGl0f8A5Xoro/8Aysl1Y/5Kkn/5MoXV/wAqLYtQU0X/AOTn/JsUjcKTN8jxGKZuRa/8pp9N5uRZvZvNx4lHjC1UWn/5OoknE3o3r5ZCfqYYmKQtQU0X/wCS7MHh6bJfDrseFOJDjPRdKsUa6bjeRmbul0bzxiGomX//AAe5G5G+Ja+bcjejxEeMPXPEkzczdIWrI8f1FqRZuR4kTxYm9EtYWqKSLRuRvHKRcjzC3mOldaNqNvRddqNiFGiMkWSFuGLkU3fJHVfcU0//AJ+etGJLWcjzep5jzEZSPFZ4jPEY9Q8Zeo9QcxSLGzeKQujF1ZZaPEfYjqM3dGW+lHBtRUjJXSyutfKuioojEaJUum4sjqMWoKS/+Xc0h6qHrj1vc8a+48iwJxLQ7N54lD1l2N+o+w/EZskVOJkrpT6JCFIbNxuLHkolpxZ4eRQRsMoTZVlUbvc3L5LKsca6Ud/mRQl8k5DkWLPRGS2eM13I6zFqJ/8AyMntJarG76YKgamn/SeZFyI6TYtL3JQYtNj0LIaKiV0RNI4E7K6USfSKPyTvszfJHjH+4I60ZFjLo3r1N8X3HqV3Lb7ktxF+qPKZIvqujRRT+ZdF1nI3WzWiXJEdSRDWfAusoJj3R4FMhrC1E/5V9NjI6fqVFHxOpfWj8HmIp9zajahF9KZT+Vko9Fx0zRQ5C4KJfY8Ns8CJLS9CGkVL1HGXqbX6nhiijbH0H7E91kYyYoP1IzY5sjr1yR1IvrRXXaUNdEMQhvAyiWTw0baFRGRu6NdJQRUkQcrFPJpPsPTPDHpji+m01sI0ZZyaSVddaZPohGBV8i+WutDG+kXgaOCc2xLJHptO3SUGK0Jl9KFArpOKEkUIl0iRkbkb0Wn8jLTKKGiMRrA31Z3EOKFH3MojqF30byYFRo6KqzYvkocUTvg1o+Uismh9HSRqrknz1iy16i2llliZfybi+r6SQp1yeIRtrJ4YtNIUEUvkYujE+i6vqxe467FkdRFoSRfy4F0QhnlNsScEOIyLopM2DtGOniFJlGnptsjjovl7k8oUIkVS6SJ5JrrfTceJJG9m5ep4iFqoU0b0Jp9MdOShx9xQZ4Ni0UbCui6186XyNl9MGOiQ45FCYt6HqMjrHiIUzcjF2KiiuriSsUm0UOJtMoUxywOUSUs4Iv1ElWBNmhq9n03Z+Zi5Nq6USWDUwaj6PpdG8vpUmLTkQ0xIpCSG0bkWhfLfy2X0lZcjzFsbE3Yn13kpm8UomeqfSEhZJIymJWRi+lCZ5l3PEa5QtVMc0RkYGkOum0cSujjY9M8MW71G5Gi5KaFLy9EXn+SzXRNdLscjLFpM8IWnE2o2/Ihor5GWIZY2KQ5m43o3IeojfZktDkJikeIeL7m4c7NxlliofSzRW4vaXZ5S6N7I6jN2DcKY52bHZKDXDPFnEj8U1yj/AHCkPUN7FMbLssRYzajwGzS+GnuKdFdHyLoxfNqK0aqpjQyMb5FSItFWcdExPrGhr5LQ5ItvsK1yWNjkzcOZvNx4g3eS2Qd/UNq8Fm83l+5YmPkox1T6ptDk2abwSsTN3TcjHTeacvMSj6EotCjYtJHholHBFm9iMC6JFGhyLpXSurEX8rPioZsb62JshI1F8iGJm9M3HPcSj6lDlGuR6noeJ6njUeOmRnfI6JM5NjMCMDMm2RtMIz0TfRvI38uCumTJZ2IP5EiEKkPBvXcUV2KtErTLsSG0n0uyD+SApfO+ncXySZq5gTEUV03UKTG7fVSOeSU4rgtsti1B6p40vUcjd8m5j+5vijfXBub6Kho7EdtnLtC+rJV9hocfYaExRcmOAhr5X0R36R562abyRJUSojZF4JKxwKZqPKI8DwxTQpCFZCxMi/5FZ6svBM7GsqYhdHZVCZ3MIczxGbpSI6fqOUUSnZf8tIVlGWZo7EUQSQlEaoauRQ4mwiqHDcUUzwzaOIiVdEdzsR56UUaMSPI9JSyS0pIzEg76Ppq8kGP6iemKUoMhqxYmjTaNqEv5b6TQj4iGeliGNlljkWRQqiN7vsOq+ejb0W0e1myxRKGZNuChcn6ja1klNkBJFFCRRjpkUfUlCjb1SKybcCWShGwlJRjg09W2RflHIeexsXZjlKJ4iZuNQixyyJ2S07JKSIak0aeoaepYn/NmUa0cEuSxEpF9JSMsjp0cFORLA/loSEulCgeGRRRJFFYLofSsn6SiK6J9KK6JZNkVETTHVGLJRQ4G1nc7EeRj4N0kNYNGNyIxwS+R6SY46kR2yPAy5oWrNG9S7EodyLyaEiDE/wCU+lElSNSXlZLkolIsXRQFEbMs4RPJSNpjpQkJFfJk7iVokUUNFdO454Ii6wt9drKiRikbO40M3CoVEoZHHBHktDo3R9Da5I0YNT6S+SumoqIlCybDZXA2JeY0yDIv+VIj0m8Elg1cMWSURKjkUellDlQ5s5HayK9htNpQl0QoiiNFFGn9LL6voySKEQH0XVrA7Ipm+kbrZ5SUYsUGisHmsbwKJKBtaNhA0V5xsZkcfQUn3RfTWIkRJHYo2EltkafBAQv5LFwM5JGtEQqHFFV03CtkaJwV8nlRa6dsfPHo0N9G3WCmLpQ4lFGweGR6oT6KbocjxGJplCFZlkcFmoachjRqYpEeDQJDGyxTLTJSyanBHpF5OwmKjVSNJ4NNiF/JeBMs7jRqxolz0ocR2WJ1wb5WXfTwyWBcFdL+SLLNuCUShEdNUbK6Iv5KTNtdY9LOUZGWWyMpWKaHKmeKjJ7DiimI1KbIrBoklYxlDXSrJD8pdjNKSkjaiiSNMiIRf8iRFjR3Fya/0k0IiUOBLSFE2nhmwkmZo0x9a6MiRIsnElhiYm8Em/5F31UuqeREqoXIkb6eSu5KCkPTkjT3UN45PK+4kexsdj1NuDR4stDeRlj6I1PUlT6bTQVESjaKGSK/lSGUWdysmpC4mpA7kRddo11k7KwRx0bwK+tdUyzUSZEQx1/K2rrF5ybkMd2KbJrueL5aNOVmpJoWpIepgjOB4rNzZvfCEpOeSOIkntiKZZfycqiS2Mh5iiJXcsXSPRfyGPnpLkvIhHxEKJqmLomJlnJXRojFjiI7iXVjF0pUSiPAmWNC6PrXRfI2iyyxyFZZVi8rLi+xLS9DwltHoyRlckdVJD1ILJHV3Pgeolg1HuLog7+bUVkEWK0KTRLUI6hB2R/lMZ26PkiI1IKRr6WRYE2NCjtYi/kaKsr5WNC6QkS1Eick6F0sXyY6os3Dmyc2yjaUhroqKaybkbiOp2FydhyhInD0FGyNpjZbN1ENU56M4NxJlm6h6hpyHCzazR4F1vqh9WMwS6RfRs1Y2asa6cnIvlT6r+TtTJR6tC6vnpfXdRLUMyHHHRujlDrpZvZuIyo39zeaer6koq8C1tuKJambQpuzDXyaWpgfV0SRgn0TojqCILBHquqH1ZIRRRQhtIk8GtHksiX0rrZaPOU+j/kX8iKOOncQ0OyNjgOIojGqJidDfzKq6WLUZfWGV0s5ItRIyTEjabBxZklgcvQ3EZkZGlqC/lMmxdaEia6TRKO08RIchSL6MpXk8KBXRmBIXWmU+j6L5OSn2M2Ibz0ssnyLsOJIlEa6X0oox0TQzbH16LpB5JvOBQ6Mi6IMs30bkySH7ko+hXSMmj4WdyViqhi/kz5I9Y9JIaJontaNhtwLon0kk/kafRSMFFdLKJdV1T6SIiRQ0UTRETHElHA4scDb8qY6FRjqyKs8NLox9ISE2eG2eGkhjHE2jgUaWD4Z2hrpeS/nmiKyV0RFlGo6JslGx4HKxLpQvkQyaELpfyUOJQulD3CvoiIhiGrOBMoaGNDgOBtKKGuiv5YC+npLg7dfEkiPxLFLejaUNdGUaZ8O6Z26N5IsXzSIrqmJlmohondjGkJiyuifzSF/Kroyx2WJF7RO+tjRRtNpKPSiiUShrptEiiS6oh0fR9Waeq4Eda+lEl0o0iHIngkxkei+XUdIhlCH0RYySJkuiIjS6J9KOCiSZ3Ey/nYum456pjjZHAuB9E+idlEl8lDibRxIeg4UV7jiVXWLEMrI/lTohqWK+j6RNIRLpH59dmi+kuPlmTQ7stC5IjXfpTF144LRKOcdL/kLkwOMWLkl13DjaFuiXfWzb6CGOI18sl05j0oksdUJ9JDXyPosCkLU6xNLkRMRH59RWQVG5D4O4zsJ4JEyci7O4pURky2Xa6X1fJBxRtRtKMfJXRdGLkkWX0WoN33EhlG009f1FJP5HErrIoi6JIQ0KKGqIbKMGB9H1a6wZtEsdImirLo56R+d9NtnYfy6iNRU+jZBEeipjiZL6TQkLjpRQ+lm4tlnm9Dzegh2bWVk2IenkUMFLp36qTRDW9Td0ocSUOjGUXgQxxGmRdEakOLQzuNfNdEZs83SBoXQ+Tt0i/nosQyXVPpI1YjEIj0XSjaUOA40R6scjJjoh2J4+V8iZRwWjckbr4NzsUkjdCieokaWuu4nfBdCkNkq+Ro46UUbMkUb30Zyh/KjBCXYcSNo0J4L+RfO+RWdifTcLpImiXRC6WbhSZuZZkkmLrJGxofTIn7jZuLZnq42JV0qLPKeRoSQ0Wy2WXRDXkKdojM3DHyPjpZaH8km0N2RaJibGpG3pRtNoyIpEcmmLpfRfO3kg76S4GXkRYxo1OqZEkyxPoujkiHRdXEaEjahwFFIZRTKNvubTb7mwr2+Ri67TRtEcMc7FL5GMTF0tCtko0yi8C5HVdLLFMvrEgRIrHS8i6L5WT5IWIkSJEBDOxrR+SzkrpYrH9xkLssXXAyuj4E/kr5LL6PgRdl0bhM3G6ha54kTchTfVZY9NnB36JWKlgnyUUNEbZtFQ0OIhIeGRZpsgLjol0XyPrPkg+jJDREfRs1WmMQvt0TLvpTEmOPuNMpCrraNy6P5HJHiI3+xufoWzJZfVncSHA2jXybhTIa3sb/TosZNwxIUSqNxLjoiRD6hnfq0WSEzSIERi6L55LIsF4GMaFz11DURITMYE00cFsTYpl2YZOOOlisaY0zaKxV1k6EkUiizebuqZY3079KKNpRRtNptNOjAtpJMpCiuxKLQ5s3ClgQiXBFPcMfSyySKKNM0yKGuq+V9Gul9GuldKNQ1OjTRZBYMFobXSKYhMkkn0UjcPkQ0xJ9Xl9MjvpkXShFDhE2x+Wut9KEmhF0zcJvui10lp2eEeEKCQ6GiKZZtQ40P5Ymn2Fx0fRfPQ10cox5ZLWgv1C1IepaE+k0a0emnJVTJVuwRLG+kRdW+kSjg3G8TvpJiLLGy+uTIj8dNpXS+l9aQsG8jIvouqky+jPEl/SRla4HqDnjg3ZFROzZKhxkuivpBGmXgi89V/I1ZxgrZqfHN4iSk27ZuZv2ci1T/AHErWTT+J9S1JGppk4NM042ycEpdKHBm1iwb0X0lQuilR4m4ooQxyEyy/kXVCGURhNj033Nlko7e5aIR3E4tMTow+m4TwOdC1Ub2xPoizcX0lTFXSnZY9Qb3I2s2tdNEj/MbUU2z4j4iWq3/AEioxWDdWB6mKZDWarg1MohqtM0/ia1GuxvTRJIl5GW5/JXTysuhSJscqR45uciMcCWOrXRR9zb0oo2iXSzeKQmjBpvB7Eo1wSVkNKxQRJ28klnBskulikUY6oTL62M79LIssRaL9zcaBQis/wAr/Ufis+FF47ls3NC1UTd9VLBGUbyKOaXcj5YjmvQ1Eb9rFclZn1PyL7le5sFDAo0SRLJtIRFwWUbqHK+kR/JTYhl9LLkRlIqhWJJolD0IJruKXsT01IiqfBhdzUgqtdKIcjgymWQfTHyMpMcCW5G4TvoyyJocj6JFfyJcGupLUlu5svpRTFosekxaMiS9jRclNUYo1FTN25ZJwdkH2Y4o8pWn6DSFfqJzEzUbF6loRuwRZKaRdki7EMwyvkaZkRuSFLp4bs2v0FuFXcTjDuYZHk1N/ZDhLDkVceT/AG7a5IacYrKNSk8EWPka6Rd9bH0oVkkUbem0emKDNCPBWBC/lf6ropbdRd30SFEjFCoqLNiPiIVIh9aHwb4vDJQjtweZcDbuzxckpEb9ShCfSSQ4Ci7yV7nBXoVLuUIWDcX03DmeJQ9ZHj+w9U8SRuIs3N4NhKFGe46vkWnZGB4ck7sQ4qXI9KPBsnHgSk+Rxi+wtOBsiS03Z4Zsrq+qE11cizcbkKjQ5O3SJIXysXT/AFX6NP7iQoshD1FpEYHhnBrq3+D4TS368USgjW0kuDb5SSZKEvU8Ld3IaPqNJG8TNyLkffp36102pjtM8xGLkThOIlNlSMjKKEhRHApiwPVmLWlZdm25cCo3HiZN8Sy11aHZk3+qPE9Deyja/kTI1dloZRRTKEaJHg7lj5F8rEN0mz4n4p6+PRkVSJakxfESRp/EJn+5SI/FabFKGpwaj4PgoZlInwTY5YZp0zUuy6PEZcWeGqJJrgk6Fqs8U8WJGiToUmeJRviKaZLkwJnKEnY0NDjk2lFCMdGUI3EWOikbEbEcFHm7Fz9BTl3Q532NxKmilVloeC2WOJT6Kyi6L6X0SNFEeOlDF8r6a3/B1P8ApZ7UbNyJaTTybD4XQ3vJ8RBxm0jbK+DTf3TJLETQ1ZR1Fp9ifBM1DSpUa8VVjKG2eMzxbOTahwXqUWzcy2bmKRHbY8vo3RuYpUzcuj56NFo3HiIeobi30yRvuZH9zxJWeKeLkeeDxKN99zeWRkn3GPih6fuOOqQ3qPB4nseJZvR5bN0TdH1N0R6iFJepcfUsRoi6IlyL55K4texPBAWxrJPw1hHw0TU01KbsXwavDPDhFUzWvb5eTQi5zjN9kPgmahHaampIbRuOxwK2fShVIocOlEUOBsYoMaJbkbmKRZuib4jlZ4g9Sy/ctG5CowJxQmmSJbqwR1GsSFngcBaRODi7oWoqHsIuJcexY1WUR2jgmOBtMjyzYmzwzwV6ngoej7ngz9Tw2UURiiKNAXRfyF0+M+FnFSlWF3NxukR1I6X1ZbNL4glKE4yz5jS+JfDJ6m5H1SNKNLpqk07IfVbJ7ZRwiUPYcaIVKPB4XlLG4tGUWJ9I1ZJJMtGOm9G6LKizZkSNkTahxPDPBJRKZTFCR4bPDXZijGOS9yEamncsEdOhYHOhS3nhe54Cvk8FD2x7ikhziKSfBuY5+wn02ZHHuvlvptHAhBkYM0lQuiGR631XTUjvhKPqitkmn2JN9h2+SKl2ZFvTyKW933N2DQh5N3qLgRqE10UnFi1ovlEtOMheQeo2ism1EYs8P1MehtXoQhb4NWMk7NzFI3s3dIiasc0JswNdW8n4No5P0N7IQaybG+WKFFtG6V8FjMFNSFqUjxTxGSRiihEZeo9jEk0eFL+o2z9TZL1GhDSaHEpFFiIkSIutEfmXX/UtPZr2u6sXJbiR1Yf0ouM19KF5ZM0ovV1FFG1JJITyWahOdFoWTwvcjHHJNV0SQopnhZH10pbWJwkjU0oEtNGxmV0ybZEdFvuLTo2jgbUbUeGJFIcR2uwmiy+qjZHEhvuOTvJbZkUhSTHHpgYuTjuRmxyfqRs2ew9JnhsekeGbBqhCixNmixfzf9UXm037HB4mCEoXwT1YiuTPhFHRy/Qcd0biVnpM1EbSAoMWnjknAemxRbFGumpNLBGTfWFo5JafobGkKKfKNkPQ8NCiulfJXyyR4U+zI70sjKPIhNehqTkmbpPuZFqLNm9UWvUr0YpyQpD45LruOV8Fy9S5+ooTfc0oNHmLmbmiT9zcR1V3JakWJoXTR+oX8xs/1CaltXdFG1lG00kX2NKOyEY+iJaWSSaZM1Ol0yOpgUnIad9KRSZg1vqEJioXRfyaK+d1Rldj8lS7MjuTySk0+Sb3mx+o7o2R7nkPCizwF6jjtI13NkTwkeEjZFHAtWKF8TE/3SP9wPXPFQ9RM3lsiyM8m4hyQeP5nxGrsg2Xutvv0b6IifC6e+d9l1lFSNXQfY1FnqmaTdkrssUWbJWalpWdxcC6LgQxfJfzX1sfTZ36btro8SPqeKvU8aPoKSZNm/U9DzS/SLTkbZn8U3T7xNz9BTn6EE+7PNZ4bZPT1DazayvmQhCIGn9P8z/UZeSjsN9UaOm5ypGnBQgkui6/EfDR1eOTU03CVPpgV9jxMEdT1RHViPUROe7A4YE+sZCMDjjqmvnr5KKE2OyUb5Qo+xg2lMkIssvrtRXSjI9tZLijbGXYehE/28TwIj+GR/t2eCzwpC05EYMjpsUaNLj5V8l9fjo24fc2Eom0WmQ0XKSSNHRjpRrrfyfG6G+G5croxS2inZQ7si33MdPDTHGuiZuI82duldUjaNfyUzcX7dJMs3Fr1N3TAuiyLrgqSZKMfQ2xK611wYRGMWeCqK6R569/kbLwhO+k9Zw9z4qSno712ZvMCohFzdLk0dBaa9+idliXyM+K0vD1H6fJuZaFtaI9Ezken6FNdjLI4FJDeS+qsW4onGiJjpfyYMDdF2XEwSW4UPcqXSKNq6cGOi6WWiutI2m02nBhiNGd4ZJG0iIfVDwj9J2/B2GaqsjBr7NZRq6T05V+z6aOlLUfsuSOp4f06cUR+ITrcqLs4638n+oQ/hp9aMiY37kCQmWWPgjRvSLLIpM2oootlklaNskxWUbX8qkKa7ow3aFpo8GI6WOl/Ii+uRPA+lvq7FqNEpm5kptim0R1MGlLPJF7o/LRQjUZ6D6MaFwfG6G7T3Ltk0dGWrKlx3ZDTjCNLg8NctDS9CKo5aG8/N8en4P56oRNC4FMc5PsfxRb+4lP0FvfYWmhwRSJxNNm43Cmiyyxll9LMFIYjIpbewtQ3YJN5Nz9Dzd+lYMi6IxXyUUV1bOTaUbRxkRWCGpKJH4n1FrQfcT+XVL8h2F1XJKUVHJFRjSSx6CT5YyJ2sj81nxUq0Z33KKODcWx/SQaEIybyOobuslZHD62WWX1rrfRiEjaLTNmDw6JeU5HusT+RUMi85FTKrpF9jA4WPTY4jj1sjPI1ZUhQfSGrKJDUUvknlsT56LuPsd0d19irwLT2cF9ZEeSIvl+PX8H8lFm1G0VDVkYUiimebohdWPkXz0jBSKiVEpGwcREWJmCrZ8QlRCRFIpLo+Syukov0FaLvpJd0eNt5P8AcQ9TxI+pJRPIbYPhnhdJQsp+pp3XmMDy+kW4mlq7uj4OUN076Lr36+hHrHgXAvlnBTi4s1obJOJGDkx6c4cli5KTEivkotmTfngz6dEcFllmTzC3GS38nHBfXcbmPUZubEuq68Is3v5K9xacbHoQ/pFox9CjYLSPDfqbTJVllkWq6wlkhLch8Hc1I38j+xHnoxnYZ/6HY0y+mfk+NSepghiZrLdonm9DzIhJ+gn8+4vpYhm19NxyOxS+R9MCpM56Rj6m2Pqbb7Dh7dHXVll2hKihIRtKKoXXHyPptKLksohNSJKumm6ZZ3JoXYfWPHRnbquSRp4ie7Hrw7ZPGfoeK/QWpF+w1Zq6bi2iSNBqakvYly0WJr5KNpXWhpmx+ptKLowOIr62bhSLvpQ8HnF4vsKM75FD1YlSJdH8mxehsj6G0UbjVi05f1EIyX6jIl6jijgvpRQz8FG2yhq0Vkl5Xg8ayD3IibnRvi8UdiA+q7dPx0khEVRJkGv7GprvUfsRF0Zp6v6Wa8/EY4tHw0HhnxUNuqxdF0T6IooaKNpRSMGDBXSjabTZ0stdPuWjevUUh6qPFRLWi+B61HjF313R9TxYEdSLI+zFz0ss3DG3ZyZLLRRXVoaJGzuiEkqFIUyXxOkp7G8ilB9xYiunoLp6ljfRcok6iOd8FPJ4RsSF0kRzuJLJKzR1HHB8XG1GZRSMCosTIv5MGBjLNzLZbLLN3S+rNyod2ODfcjpqJzhGyJtTXA1FDz2PD9CLlHB5mU/cXoRikVf6SMUjbRasvJ36OmUYF0wL5ZG0opIsjKidS1Zv3EvQ4SXoh9IIs3G4s3JWeI+xl8iXy2TZpLy/c1NN8o2kvK0zxFOGw1NKUOeldLExMssvpfyUV/K2s2yRZLpusepLhGX0rol0cbZkV2VwX7j6IufYwmy7K6WSvlEZWhal2bkX0fRkqojySxkRp51IL/mQ+iOEX/gZfyWbjebzeeIIm7wVVddSNxaNJrvdo1JXePlQn1sv5KKMmTJbLYn/AClQ0V0orpXTaLolkwUbLHBG3zEffpuHnsYojGipWNP+oU/U3ovqxVZruo9Phv8Aj6f3GbkRml2HNst9MDkeIjeWWOR4h4hGaEyOdRD6UZOJsXdMlp0yhrpRXSiSYrF8t/yr+VVuJNUWi+tD6ULptRx0XXb0ih5KwU0PUUTxIjUJonJQwzVl5I7SOrJMjNMkUOMtSW30F8PFLghBR1lTp1aH7vpg3oeqjxjxb7m43G8jufY2M8P3JaM+xJuLyLVaIfEPg+Hg0tz5fShoaJxzEg4PlcE/nsvoizcX/LpmPkooZgox0fSuuEdulIXWiuljlt5FNskrlZtjyJE9NMnpbaV4NRUk0J2JOSNnuacUl+TU1VFZfOKNHWctaU54H8TEeueKPVHM3G43s3mjoY3T56Y6UaujGayaP+mxnzq/2NL4PQ0fpjn1ZKaiR1l3N8GPb6j2k44wJinCaqzw0x6Y4Gw2EdNMlp0bSjaUUUUIx0x0aNvyV8vJJfMvkfzUWNy7IW6uDJ4WbbGqJFidG6zUvhiysmmol+wz4ierDMJ0OcnLc5NsjJcjkbjcZ9DbqP8ARL9jwtb/AOlP9meB8Q//AAZ/sf7L4p/+EzR+GnpzvUXBuNxuE+sZbJX+4naNaXmIO3kocLPDaHhNkuD4bS8lmxjizaUUITjGWScoWdxIwOF8DgymbWbeldV/JfsZ7sdeol819NorK+ddWNCXRjTMpHwzwOVD1EarTJwohGcpVFW/Q+G/0+e5S1eP6TyR40/7Hi/8pHViy+upr6cE7ZPWcpSbPEN5YmJ9OT4dvbT7Gr9TILJHoictzcEaid7DSjtgl8tdJwsilEuuEVMUX3ZVcG6+w6FE2NHhscWbDYUUUIp/JgbNxhFm4ssssSRSK62IorrwOXybqN1iQ4o1nUa9SM9h43uPU9zdeFlmj8JPUf8AE8sf7kVowSUUjxI+pvj6m/T/AKkN6PeSPH0YfqJ/HrtX5HraksuWCer/AGN3BYmWbiMxSNSTUbR8L8Yrpmpp3KxaZQl01HL/AHUs/qI+fVXyV0bGNOk0RbbY9RKyE4SjjkozglJ2OhMtm4lkrpSKKKMDRRRQ4+5g22baMevyUIs3M3SXc3N9y/c3e5uYtR+pvPEHqm83m5DmusSj4h1JFbx18PpN9x3J2fDfD6WnHdqvz+noN/D/APMOeh/TM8XS/wDpy/cer6aX9xz1P6UfxX3PBnLmRHThp5/uamru+w/pS9eiEJ9ERkXGUXHuJOOrt7kV5I/Yo29filXxLPg1mT+TxOxJ9yqjfcty+45ba3Ox6m2VJcjWzMpZbIKP6e3J4saXqNy2YJJtlyfY/JSKsbMlMWDnnruocvc3+5uRuiPa+WbV/WLy/rGt3cjpIpehcaE0xtCa6Ozc/Q3R9T8mOldKZTMor3HXqbGKEhKQlIpnxcHt3+hoO6NXTWrGiHw0dPLdvpRRtNo1H1PKhvuzU1HN126P5LLLFInDU5RCT1XBP6kxLBXSij45fxV9j4QozuoZyS5S9zeu7NSEZx5I4xLKJrf/ANS/uRjvXmWUXthLb3IpR003G3Rp75dh7Fy1Y1klG+GQe36jn7EnUng3v1iKUfufUNPon02McJIyZ9C/ktm5l9N5uRY5V2N1mC0csXTcu49X0R4nozfayjHY8r5RFxR4hbs3G6JNQlFpivR1KZGa2m43G5lyPObZDi0bjU1HN0PHl/cXr0XyWX00/iduJLB8J4Hj7orL+Wj/AFBVKB/p8cMcRxZnuSijM3n9zbXcbkvsTjlLlG7w5VmiXmdrsKHlz6nGHix6k4utx90Q11xTr3HyNJ89uTxd0OPpFN82jBGNk5+Wl0qTJQpe5pqOdzPIuGWpLHWrNrKl6dbj6daK65LZZjpuY2+4pUbjcbmWbxyZvZvL6fEaa1I+5pR1I4aZtKibtNdx6+kh/FQH8UPWbN2DhX/KRyfD3pzv0YtSOGb0b0b0bkfH6q8RKux8Jr5o3r1NyHttGptlFrdRBJaaaVjhBq0S2Vkn9S83lIyllXaR5reMEW2+CS3ad9yMd0uBtRh/zWRWkl9Vv1G4W17HlS4shBc9zYq7C5eCvIbfYquxtk+BqXc2RNi9SqixUUusRwQ4VLnpstHDyKn3KV8lfyaKK6xjYtOJ4cTw/colJIepP9MBz+IY/wDceps1jwtU8DUP9vIelQ+jd/ykRcZ84YsN2abeyL9jczxWeIeIazvVv2NLw995PIjembqnb4SPG8SdP6UadeHEm8XHseK2mqHNSWOxW39X4N01L6jxLjTRHUUZbX/c8TZJOC5FTXDf3HNRwljubk6yhwh/WbJQl9Vm5Mr/AJTc+DJuFNoc/cWPQuN4LNucFdbLZPUX5PFFro3w9TH8zw5egtFvueHBclafoS4weJqo0tWxyzwO/UpdW4+o9WC7j+JgP4r0Q9ebNzf86hN9zRzprKKdf4FxlH0jyriOMnPBO1pLbJ2Zw1fB4jo3p2QW1U0Qco1fBqbtvkefQcnpNe54al5tL8o2uWGn7SNSMofoyaPitb2eHqb9202TT3WW0vNwSl4flrPZl4Vc2fCwdvcmP6U6s36X9JS2tcFcZNvoPbL7mz3NrQpH6fcW1Ki/Yc18ktQ3ORGKHCsiZvcWRluV/Ooti0vc2RQqrgc3QtbdKmSntJylyuSMnz+40pG2UZ+XkWFnpke/1HCXqeDI/wBv7n+2ieBpocdJEqH/ADF0Xc0/oj5e3Jv5Ru53Q5FFLiX4ZsaynX5Lw+bHKU0TnJ7UvQSucF6spRnKjW86jWSE6hTN8vqpGl/E3zlW30PVxFrSlpvzbWjfKcKnT9zTa08PhjW31HFNWhRla9CWnVN8nDNHOm3Ihu2yzZ/DX1O/sT1LLLLZZu6bmVYlS5KXqM4NSVI9RJ/gbaxZhrnItPJNGg+3yrTYox6WeIhzlu5wbk0XG9u4335ZPJuyrG0brZBNZf4+SxzQ9ZD132Q9XUZ/EZtY/wCaui/7mVFWi5c9jf3PE9xyrD7i1IZRWPu8Fq8sze6DM+pvdYKyjUj5XRpfSkUoQaSs05LbT5RW34fyrkm4zV+wlfD/AAzdskorDNSUZ5r7ijJuMVK/QeipWuX3yKGstJRIN3RKHdG1v5K67cD+xufY3CXTX+k7G4vOS/QU2N2cGnPcvc2v0NpGl2LOTg1Naic5PNinKMrPEW2yW28jSrPJFxs1OfZ8GhB7vsN9LHfTYeEeGiojaJyH1r+UuminuWLrItbGSM1tkzw01awNQhyjUcZUyk5Lbkrhy5JJt5Q01hjRFLZKlbqxvWSwqXsSlNyir7ku2fwiE98L3cHiecbz59R47GlU4Z7HljJS7G/eqfbhmnV+/c3Nbtp8O05KTeSSnpu7e31R4u5earJZhdc8i8fsmfx64Nuo/QapfXG/sQni3Rvl/T0s+/AtiZ7CZZrvFFm7pvVcFVkWemhL+IK7OelivvI1JeZq/wAHKN/kN+PpFqNEpORpyVI1NPa9xB35RLaq6P5NyHqDlIySdDH0oooooS+ZdPgY/XL8EtPTlzE8HSXYS0/RDhF8Oieg0ScNJJtZ9CWo9xp60o3wKcsOifmg55FNfbGCDS+3sa0alDyY9SVYINRco4pon9W2JONR0fdEJJNJXZWyScnlZSRoQT1XJ8IisV6molpt337Df8Je5FvFD1MLbD7mjK7i0adW1Im5w1Kz+5dW32F5m7Z/DXNkpJvFm2XoZX6RW+R7WyUc2hDZrtmyo2V1VyOKPU0FeqvYXRJ+pVdzUmjVU8TfRaV2SUodNvlsTZGeNsj4eFeb9vlscvkk6GxsUGzYUUUKJtEiap/MuT4fy6MTngoUdo2vUVrua+n4sPcncK38leWyMqjgnLU4cxp82Rlsf1YNHWe/w3wVpPlfk8HnZOxQXLJJPS0mlwyX17oqsfsK3iU0KUlBv9PH3N9ba5Jyv6qZJJ6ei0X4MEkvMzc4q6X3LjvtcDvZa5NyliRLd7ktnZfublVG5ruJl9Meg0mPSNTTkomtHCZu8haNqKN3ZG/J3PhvqkWkbxzrsOcpcM5RUpLbQ4PekajUV7+xTbuQ41B4G6VdILfKkLCroyy2UbSiiTobMvgjpepSso2o2m0oSHFcmrD+Hu9PlRpq5V7j+jGDdL1Rj+pm/GWbU/1Mi6wJ/uakIauJIfw7j/0lbb9iXmlgcMV3G8UkaarcOe1OW7PoaU08tKv7mppad/UqfBoKoy0/yjdCenlPgj4dOmyMk9Lmn2Iq2oy5PBbUuKNOKVXwso27s7+VwzW3pJNKvY0/Cx2fuastTduTpMcNT9VM/iVgumN9HLAtVkZplm72N/sWvQ+JWmoY56Wbhv5PhdubG1Ea8vBuvDK79hEXhjUZRcl9SQ9TzuyFJEoqV2Sh5SpGjp+HH36v5LLY2SdmW6NOFGwcGivkSNrrBFUa/wDwZfJQmfDxv9inuXA8s09NvNnhpXzQ9JOV7jwtPh5Y9H0myPiR7/gUyWnpTTuJP4ScLrK9jbFcM37/ANh6jcKIQ3Qbf2P1RaPLNV/+/g88G5J5XJ/uvM8Lb2JNNt1VkcwTimq7sSis7rHqtqljJKcfK6/7jjB5XLFCSarJ4dq2yOE4umiL2Pb+nt7EI6qcluwNKayqfqS0pI2S9C7MeolTIv3N3TafE/p/kaODDqxtJYGrP8DbuhX+5nZqE8S4NJOuScl6CrdhkIevyP5LLJO+DJCAo0NP0HwS6JYKfodrI+htrg1V/Cl9vkiNHwsMP3ZtS5kbFh7yUXVqQnqL60eIvQezuzdC68Rm3/nyam5NmlrNYnx6ltK+T4j4bxvNGlL/ACf7ealW01obZYIv+BsrLZqRraK/sTvfGWL+5tk3xQlFOO77slKWo++0grdG3+rgUFV1SIZJau3al9SN2LFlcG+nmhZ0bsdt4b/JHbtcW19zKeGbBRNvWKEsnxMd+m/Xr2+SmaeDc3XB52U7JNZIwxuFyhv+HOvVGrh/chLb9jdfBp5mWWWX8lFDNhCHc20fdimq/wC5ui++CUDgp/gvJHNpmYOiLsa5RKO2TXp8l8GinDSixzdfg3eWxSW54f7m98cEmok5bsEdOWHfPY0kt3DHA8rvHmX/AO2Ke1uiOr6/4NykjU+GhPzR7Ci13qvY1Y6m1bTdPwvsac7+uCJasXxEj51ckm7HjG1oV/SkOt+z9xuntTx3IPKyb9780StztvHoVcUr7mZbf7ie2647mrpvFK/ybZR/QbXtbceBWO/URVmOmb7iVcI/+Hac5bna9ka3+nRryWaf+nX9TZ/8Jj/9R/sf/CP/ALv9h/6Vqr9SJ6WpovaxYFPa8ENWPuOSSYsuxpKKr7mnyRipxnfqa2z6e6Ip7hQPL2Ru/kMcqPNN0QVG1SV9zU0pRXqRsW1nFDSq2ce7HuuxG3xOWRw6kVeT4mvFdfJpq5IU+z9DHKf4HujWMElN5/uLdXv7GWluyT+k8TBHTzcXghJSVd/Qkle7iS4Ixq16keDPvwLP3J6W/tTH4mlLbJUuxHVakrbcTVhtnjuPh+ovoQptNZf2ZOWVXJKb3EVHFs/qLg/q7kdFc2mOl7Z7DrTT9yOpsnZpu1tfDJS247o8SThTzktFXYrRZnpFbmQ8GP6hamn/AFFwf6v7iSKK6S+Hi9WGp6Hx3wWN+mvuhmnMq3Zp98DSoje9IWotODbJVqakpIjFVwU/UXRfLRwSY13ZpwrLLVof04SOfq/Y20+PwX7mUyQr9Dd7CdOu3StzzybqTvhE5bpOXq+qLpi0u+BPB5qp8DUu3YhCrEzUjX2ohGmW6tENTbyPP2EsFs7O0Rdqy81ZKMdROEkifwmrCNxe5f3Hcdue5LLHSS25yNVHnJU2LwlDbJ3I08SvseXl/wBhqPKIvN2bt0065NZp7lax2MtEIuMJR/KHs1K9jU01SZZZGMpcI/2+pzRLU2seo2fDae3TT7scIvlHhwXY2L2PCj6I8E1IqCuU2vyT1tS/JqSX5I6/xC/8Zi+N1lzTNWGnqeeCp90eGkRVojGqJVwaf/EZrre16EoKKwyDZuTI8dF1wWujd9F5pexTFJdz3yYj+Bresk4SS4MxXJF4yPBfOC32Iza5HxZO56TXt8iIpz1Ix9WUuKK/BT7mB6UezPDms4ZeKcWXwJq32Oxo63Z2Nowbl+S/LnB6ehSfPIndUz4r4fxY3H6jU0NkqUrf2Nu2NkeG6IycrVG2ODhm7zY4L04tNC1IyX/BITi3iHAt7z3ItfTefQ2S7vHoKMo6iml5JMlqLuV7kFukkjT046apHx8600vUfYRr/G6sn4Wjx7cs0/hfjW92Y+7Z/u9XRls1c+5DUU4qSeC17Gt8aljTX5JScnbfS0RWpP6Yi+B1n3SH8Brf1IWlKDzGiicaWD4aP1M2LufE6U4wtcI0HUhrmi+xFdXgnbjaIzaZq6r2kZqhzvBpxqi/f7nqSkmsIkpSqzdqxe3eab/rd/8AYnp8tZRFr1PLR7ncqmJ4Q5bLsfWOT4RLxtNslJwm0eLixa0e4tr4KRdcsklJZHoJ0PQd2PQlwQ0pRY10uuSMs32/yRapyZe6jh0QbR8Tu8NySyKO7mWR6L2+5FUq7j5Q05t8Z4oiqwSSaSo0IwvuS0Uuz+5DT/hXuyabnupv8ktbLrhHiR4cjvdYKR8JHz37Fn+pc6SO5KVHw8NOOnHalldP9S0rh4seY8/Y+C+MWnCakvsamvPV5ePTo3RGOpN4ND4HvMjFRVJdXFSw0T0WvpyifuaS2Ju0QlzIc4aip1RqaOhGeJbcccmotFQtalyIsjwLpJkconyP6BEUJHGaH2ovBHzLlFQS7X0bxR4eld9jY/01Ia1H2JQn6Mzz3LZrcX7/ACQeTUdQX3I6viaOm5c8WVyYN9ENeD+59WT2Emb+yG6pj4GMinLnC9So7l5cE6Lpe5JYIt1wQ+n/ALGr8Ntnj6SPlxeDV28/3E4PbyLTSlh4JbKRsVL+IKMV/wCIv2NyjqfXZHav4lr3FsnDmsi081ZPTgnnkWHccX+xHLPheZlHx/8AxYfYlIcdSbwaPxUdPShGULaRL42X6YJGrr6k8OQuvw/wym8vBp6WnDhL5/i1Wa5IrQlJpwcX/Y8Jw27ZfsO8sbe7ppx7liGyaNOdSNdbZfc5hIUaIRIwz79Gq9fsX2dJG5r6fz0qq9Rvc7fHoO/wXXHItTb7m+8ovfzErOO58Xp1pQ9uqIpM1+Uj4dKPw+nuWGSWnxQ9J52r/sba75/YUkuxcdtoTxusepLFM330tdx+xn9JGW6H2HIjSeRLuz6eR+3IkokoqcWhaWrHUcZ6hr3aXahaUqjfpgkvD0o3yzmvQhOpu3gbT+xdNYI54Xfgxuya1xSaIPdC5yPqbzRp+VObPhpbdx4i9GfFTU9ZtccEY9G6Pdj9SK6P1PgnLzV9xOX9Ju/5WX8urHfBoe7W8vC9CHlSXoas/VklwxK5DaWELoxUzUhtZienkiqk0VxgS7fsL0K44Gku5tvIuBcxoWXch1ddrE49nk3c+pa4MFtex8PmTl2X+T4hbtGXVIVxNDSevr0Ocd21cLCLVPIpemRxUn7+pjKlyf8ATwJ8I3NWWzT9MkxNu1Zlew3aoX3LISjK+Sl2Y/KLVpVtZGePUkqmvfBrQndPs/7EH/D2X/0MhmoyquGTi4KWcoi6QvREuEfDPP3JKW547j26aj3slHfDdK6+xHTh2J6+3b5IfsaWq5Sapcdj4n4l5jF4Ir16WLOSRKRFv3NzQpJnwU9mrXaXSy/Yz1sRqR2aup9zsPLRHRX6v2Kpv7ih3K6JWiqJLdE08OicKyKSwJrjsScU/wDuJxi7XcSvP9ivVZLi81kjXfBq6m76eDc/yNszQkM9COjthBfl/c1ZVtr1J6Sk28D+Hp5R/tFP6JUz/Z/Er9Bp6f8AtdL/AO5L+3SXl7YYt77C45MfRL8Eo7Xf9yo9kUbSFV9R5pjjcsFv0tdmdyyrfAlGDsi3yWpOnEelFrBKtN+xblF0/sOL1YRbl2ySgnGKT+nPobZQluq/Ydajlu05Kx/D6ekvplI3aa/RRKO7hog/D0uMm5ajb3V7Cc00u1mrJ73B/g4kSe6bY9TYsctHv0ckbjcfg2XlnDQxohOiE40nT4FJf1F+/WSsUPXp8ZFfV7UNvhENJQy1ktDyyLwX0ixkcMcalZqyKz7EXSol5kK+CEq/7l++SOq08ocm1kR70Oh+xSrkZ8Ho2/Efbga7+hON4JwcHvizTlp6kM0mS0P6X5hboxjHuTlum8/Yv6jdHuhbavzDj3t+5JeXkhPy1Jf+5JS0+OPcW2XsSj3sW7uzfXejfGX6a/7nnvDN+Dngwrv8jn2HL7ojhXy/QjOWU1VkrkiCcHzya+lW6cPTKFqVhrHoeJLnmH+Da/0/j3FrXB2sDgsPLT7+hscXmOPVE43GMb5MJ0o5N9pdmfFZWnqfuSfuJLbZKduzeZ9DY2bEKhiGWNjPhv8AgaWex+xj2PwWJ31+NX8B+xpLO5/gbNSdfcVI3CybBITK6OTc7I/S2irFaxZdDV5FO/ucdiPuSq/wLCHH2ORqzS0nqvHAoqKUUP0GlJ8+ZYJN8TX/ALmlscNSFURitSMbne3uTns05ft+59K6NYv+xF0qbf8A6F8eZmlc1mjy0RvZU8xJaNfQ7R4jSqUf+wp07rBWnnzWbRJ7RkaWT37D9SNTbti+hZybq739iM3wP1IXwa3w632uGR8vHPcjKM9JpcrKRK3clxfY05tduw5rVjStexNJ7bJv17dx3Kn2FNPRUHLPY2z7UzX1YR0/+EsrBFeovqQ/lXyM/wBOlLwX6RYmvse5+C3XArsRaRra14XB9xtdiXDYjaLAhiXTXnUfvgoW3H+D6ZZ49SrjbeCK8vFmYri0xc2kNu2RpXk/5ryK6Ny/psb24SRBOctqNOCiqQ2PKstS5wySxTFCcZ8XESrb5atHxba2xX3YpRcUNVlDf4KIy1Fj/JG8Y5PF5t5PEr8i2rnF+jNmfq/c2T7ONfYlDd9UF+BaWKkeBJfTqP8AJzyvyhosXsx+GbX6lUyVx4Iywjyq6NZPZL+xqw3JTiaW6PmXY09OLWrXEuV6MipKD9Ys0peVtrJNuUE4tUVu01Nc8Mh+uL7rBoaiWpslw8GrGSnjk+KfnhH0jf7iF9Q/5LP9L/4eovcafqU/XouSic4wWTU15P8A9CKfoSaX3JXyyTt0V0XRdGzWzQiLuJKMsHtyjjPYui/c9ijCRv4orv3KPhtPbG+76Mb2P7jqSLxtlRp6c13P/E+0R/xJykJZqkjauHySri+5tr2NqbzyRrO6OC/0/sR2KQ56WYOVlxS80xSU+HZudm4THOUW3yjxoNU1+R7GvJJX6Cpcw7CkpG+UXng3W07slJ1yaU7j7o35r0Kwar8PcuO45TjGvfk05yjKM1x3Nlam5Zg1n2J6c461JEY4d4R8NppuavBqJ78epD4eU5dkjxm+10Tnum5CLybhdX1Yk+nw2v4DlKSwzS1oakU49KKRPW7RJSbYoolL0NvuTmj3LL6L5Ju5CXmO/wBxuqVjprLIXlNGyhuLH5Yr1K/cSZgxZCO7UUV+SI0yb1YrscLdyRpq4/sbFLv+CEa7tk3tWo/XBBpv3Fpp8mopJ12OavJuxTRm3V4I1WF+4oYNsfqvJqQx5RSc8EXsebsjO+xfmODu8YJQvhkYvdwOp4Gtjf3L3DTU67Dl7CSvlnuRm7R8Y34W9duRVKCx5iDziPPKIWswdo3aeonteV2NRzwlwaTWnouRJS1KahRHyaOo68zFGdvovkssfVKyT2m4U7VM/wBNnNakooi5YwPUSJ6reD6ujkWSb1OMQ/yOKXCK4KKEL5O+e5FeY5T9jFLBtHfKN3HLJfYqiii/3JTpHwixKZHt05KaY4r6lhi04vnnuJUazuVdlYqwxT7EE7eTV0q8yWDdT4LjflbFGnJEfqyTVXgcu1GY8/ueVotm9dxSj3Nzvgbd4ReO5+kUlkW1/pHpq+T/AG2JLGT/AGzHpNepnFqyLjqR2tGpDNeJtweCoxaw2RThbcWmbtuvff8Ayam1StLnsaLjKl/YpdqHileSEZ/qzfS+tllj6WjxI9jYpZs8KI3BLB/p0XFynt5RKd9zcN+pZNjkxJz+qq9B0hj+ov5L6MikRrOemRNofsZayh3xeChOOM9JYHL2NGO3RiR6tJktNtGnxnlGrPZG+/Yzy7FJYxghBX2OLFON0aunT+/YwpWPFNMUrxIbnWOS5bqRbWJJntRyZeCO+0PdbG/Wx88G+4tCnGiE4PCEzd7imlz3E0yWnbwJuLcXyasIuOX2Gn4danmXZojLybTdlYt9h6b8Nyk82j6NbS90ONT2v8Hlcf8APsTc9J4/Y7/PUrK9WRS9OlMlaZ8P8G292p9PoLiux+MjkvyN1zyPJuzUVkUfUlgXrQ5ckXkSNpQ+suCvU47CXqY4F03XwbZMyuB+g8d+jP0xQvllXJq6viT/AOVHYi0uwnLdY22f5Ek4eeiUK7YfBtHgae1jVyilyO7Rm/XpLmyM6/PBKLSuLz3M8kvpasrPuNexxI3uPub9uUXaNPVXFinfezUV1RrSdRVUR3Ql5JJP+lmr8XrKKX0ni1bkvN2FrTlUezdk9X+KvbgaTb//ALI8RQe/9LWSSUofV/0sfJ36qLKr5FgtEVLUe2CyaHw2np+Z+aXR+iN0rpcFeg2lxlnnn7IiklxgcvQcvRWOxsgsWRsbHIqyii/N0fsNnKOxzWBbfQui4kfMxn3JYFO9jExPrKaNbX3YXB9iGFZWGX2KXAtsab5KblziycU4UR55JxTNmynYkJV3yZ+49z9Dg8y4/wAEZuXZ37D219LQ6cSMksZNuR4kf4JrGOCP3F9iM8r0IvcamfLLua+k8Os9zSjuh4es012ZqfCypx/YejqQWVwP6zS1LjF3mGPwxLmD/Bpa8YScO1kuTmhKI3tZZL5GQhPVltgaektKG1flnYQ3b4x6l9ki3/7m19+PQ/se4/YacmSv1E8+aRpP9hyN3RI4NxjIvYy+5cu4jsUhmSqNNdifr0eTQ1E14f7GlqX5Wxfc3+5PWglbZqa0tT7H4IROw7Nwm3lEs4lyRSr/ACInpd48m71Jvsc+WiWjI8OfDo2S9SGh+pl9hYV2T/iVgcPN5ceo9KTzEjCcuOw1eGU1+owYQueSJp6uavJP6rJO9vqfFQjGW6PDI/E6kUleEyU5b98W9n+C/M3Ii6kn7m9fnsaija1FH6iREaccmJxOGdunI77Gh8NLVft6kNOGlDbFF+Y/yZlzhFGF2/H/AKld/wCxTJe5beCzxFVLCMU/YbvsRxFdMCjbKUUSnbwVSKFz0r2MIS3frJenS+R9X78kkNNZPHv6v3I63/3Dx/ds802cI0+WZ5FLceZP2HWSHJ9RJmnf5FWSSjfmY/h9N9yMYr0NyRI2vkqxU/wWzGET42xPLp0QiS0nmiem/scLnI4tNv8AcwLjkaVn1GtVJ9iS5U+H+oloS7eYipcNMnGWy/Q08tE4+VMjNKPdpkuwmKmqFenL2Jq8oUl0Xtk0PgpS82rhegkoJJLp5aeTyEpeg6xeX7GPyP7m9cDwW1bZOfobXyyVtURVtIToyxabPLBE9RzwiEUT4GZ7kVkZTEX69WunoSskrJI2Gz2IQoiuf7m3y44MYwO8+hF5+xG1ufqJbsstVhfcfFdzh2yM9uRytHlk2XOPHHoacrzEcvU8SW/AtS3ySm/3FIlLOTstwpUseotTlSN/Y3vhZZv05eVonoIcWhqXoh7kxKPKZDPY+Ij/AAZU8rJ8POM/LI+I03Dnmy5epGcmtlnueK2hXt3L8olwJJ8c+hxh2i1VOQvZNm2Xeo/cjHfKopzf7Gh8KoJOdX6LgbRarkTbfohzXYrdyjFV/cjnsUl3JdEu7RjcTX4KRIjhienI8nYtJE5biMa6T7DWBJjYnRfoc9ui6UUjNqmUPmkbSisoqjuQtWVdfYaNvsSk8dx3ttn0m62NvNkJW/NwKfPoKcd6VDpWqJJR80T6uDal9yPc22rsyTxeOxCS2VdG30JW80KTM+pp+pd8j2cG2DrBPSi8coWjFWaJq/RqfZmU8EpeN8Pz54L+w4vbu7HcddITr7dVOa7niy9v2HOb/WzQ+E1NXNUvVmjpR0lUV+TaaixyXk3S7G33HJepRj1JPP8A3Nq2lVTHW53ZTvDHYoXdLI6wT5NjNOL5ZJigMjElHNkVdmOzHC0KMq/7mnWbJNDFW7I+UjvkqIo0x/2KSpl5zZRSWTcmY9CLpV0nGzb3vItndjeU/UsWGmiUr7ZN3NlXAUU7r6iOpnzFt4X0sTUVsyqZvjVciUssjJeuCS9GP0Gk+35Rc4quxSasSNyv3H9sEMV3PqeEYV4Pq7E8WiFRrJryrSm/Yf0kLzXJpZ0tVP0MUI7lCTlJRXc19PZt910hCWpJRirZofAacKc/NL+xjrKkzUiubEv+Y2+uEbShrORLy8YLSVjlnjBP6nXBd4TIaceZ5ZuUXdGpL2MWsEfMamolgjqxNyZycRFd5HQhtoaK/cr16UP3MeuTluzOBnYUfUVJnYdIdcnYj6tjuTIxr0Gpppq8n3RD6l6GN1IcjbcG+KE32Mp3x08XU9S75pltfqx6kSOPsOT7egm75FafYkrsUZYrBlXZyxTrDXBHUv7Ck6pCGuxKnNEo7TXvw2Qi75JRSlcH+CGL90Oil2GqRHufDxzuZ8RoLw98XirND4Cc6lPyx/uQ0tLTxpxrpv8AQT9RSsk0h3lVQ4LsyGnd+YmpJ1ZGXqUbsNUXI3yk6Ns/peBKNV/c9Irk1NV7moo8x4UqjZPWryxFCchaJwaZqPFFdVHdYuOlPsV6n5EkZoTHngd9h8Y5Yq2uPeizPdjqhcEYPlujdj/B5mqo2tJ+g9Zy7Dp/c8tFP6kK5KxYu3hksEli2xcp8DRtjfAkmmpEfIvt3Ki17kXXbA57ZJuODcvXHuY9TvyVyObUuRO17ix2+5u/Bu9OSLvJf8Uu8HxL2Rj7sjNR+pXJ9jM44VDhF15sngaEeZEYfDrujWei/wBX9h7e0hJJRhGNtkILT+rPsK2PU24Qm32K9RMT6MmslLbbHnlFSX0m+S5HudUNZgNtfT/gSvh4L2km+xwY3E9SUzT0u7FSJy9CMHJiwjUb3IVtIbrHY7CyJUfkt9EqyMXB9+mTTj5XJo5WBUNH4IYkOTd+hG2hVHTvuOVqi/QawmkN1ZGU0/YnN1lYFK8I2+pxyL2ZLnP7l2vUoUldYFVCXmszL9IvLLzI2xfHBtL8yvkqL7FCXYsSsjzRJ/xIo+k1v4r+xpqOa/cnLwoL1YtVz+n9iOrt+olpqd4x6oenOPDsfPFGIfSbe7J6u1etkc57m9Ubs3k3R7m5YIzT7klkknFpk4+RuxP6fMW4X5sC193CPpHcrfYpvuOor6hdyUokm9vov8mjHEjwvMJDFp2JUTl2Ntv7CVDMi9ixUxL0KZn7j4SYke6KNRNRHqWko8CMIv0K9iKwfku1Uf7Cu2l/cy5ONYHccWJ+rwYq0zN5J3+BJfsOe7cPvk3V3F/+s5M4JruQlSyhx83lJKXaytzyQQ+Lskt1MvsLUtG54NRd7I8Rz2OeGN7ck9a+EajrSXqRzGXq0Tbk9uryu5FPTQ0priypJWhS3/8AEhF/5JaKlxN//lk3Vnl+pKW6Io8vuJvjlnh6lXtLFPJF3wL7C1KzZtTWe48p5OPL2Yko7bpjddl9jxJz/wDQd3ZeNpw85JJP/wBilFD9WaDVMasyirPsamooinbOTjhk+R8L+4qyj3sTIL3JKjHqVnIpex/+JTolnnsKuw/Y/Al6M+wzTj5fRD3fga9zMSTfc/iKq4Iz5xg3fcwfT9uBesbXsUOqRFX/AOxVyMNM3OXMjd4fuXulHJuTsdkawVeC0uBqmQazgcX2Hu4ZCNK+6FLPsTqkRjXoakcRSfdI+JmoTW0Thrc/Uic2p04+Ue+LUk/sRrUja/KN3aSV+hXpD+55fchHVfBDSf63+ERW3hdEkkOsYNLbBzVZFwa7jt+xHPc+n9zapFNd0Je/5ZBvI8HibV2z3PK3mhSSvBO8f1ElL8G9wmKV5Rft01NWsIy+SEc9PtwU2P7DVRZHucF30Yh12Iyq/wDJubXH5KeTj7nsxegm4m5U8GO5437eg259zau6KJLKNvocOx0+wtuFwST9COY4LZ5ew7XYt+hF3+o8vrwONxNq/Jl/Ufghj7GOxsS+41u/UVt7k3xR9hU/ujkVLFiVEqqLs1J+JqWfD4lP7EpT3fUyWpt04vnNMX9ek/ujVe6Onq+jybkpkNCKzIvgsXRnPBON/TyaU98Wm8lJfSrZGUoTp4Goyz3I6maNtrGR6UvQazy8DxwbXlsbxQn9xu/UUtGemoyjwa2lGHkXfJp4wWTb7HhGw/8AXp/g9iL5RKnH8lcC9O4sOyWR8CYjvQ21g9PUdevRcjk5EH5iTuWODb6nP3s28epGryTaLnCyXPBX4aOB+rK2PB356W6LTshGsoay2QuvYxGxm2+BYFBpkuMizwSaEicU+kclW1yakqc8cKx6jemof81ndE7jUkLdOSkl9zZuI6dZQ1KSJad88jZljM+tIjt6blfBuZ4fc20sGv8AUnhkN7ykzU0ZPiP3QtLWXYXi3xgebW1j0nH3HGWclfc8KT4iz/b66WInw/wr3b54S7M1/hZakcamVbs/iR4YviJr6jT1Ysx0k6ro12R+S6ZOLiRWLQ+RDGQR24FnsUyq7noXXI/sZb4Et15OOC+bN1nif05G1LKG8cjxyabi1kqmW2ueCMltqiWVgu+lLuevoQ4s/VaKSJbjb6s024iltk7N9wQ5Wq7lVmyLzwU+f7GHjuNJdskHzgurY0mvMuVQ1UmujfiRikjThtwKihIlBclD7ojX3Y2u3J4sU6vPYUs5sUs0b9vKFqKvczqdyGkks5KMdKsnJQy+DyyWHZLQj2wVHSku7FJMnqyX0ocJyat4oiqNSO2Uo+jKXdYGnpO/0mnLcsDm0c56JeiLSeCCtWzUtC6vbs5H5ulrk747idId9hccF+tifv0xY10cewo00JRGjhOz6fQjh/UOUXwcfZkHlxQ4lU6Yk/6i3v8AUzeD9VrpNtNZGiLwVyb1aj3JYZup8DwVjI0LuRtWylmxq7JLfqzriyOlpIS9hRyLRW3deSmW12PK00OT7CpdxslK+xHKpRr3FV+5O1yW/XA0sUskFWPmcU1khoaem00s+psi3birKNrIqrK6a04vX1K4s4MNNPgUp6L4tC1oywdhcDm2kuxh5LGvJKyOcFUV6MaqkNegpO67MeCLqmb77dPL2eTdTyfddNPK5HP2yXTRKSaPLj06OPufR9/UeyhR9hKL+5tbNvmGqJP1E+MlXk2JcSEpbeS0+bJRfDIPKTKcb8om6eDy9kZ7lm5cm980OZjm7FHzJ3yd2dziUhNuRp6UnDdtNrI1sKViQl7DyrL9Rtvhns2Oco/qwQn/AEn1cksNpM+Fy2/QTy/uX8nfp3GPsM7lnxq+Kk2or+H7dE7Ezzco8k4/TnpWCFV+DlmK9S+y4O5dmEz8dyR6F4E2sHbkyXff5K9BO0howYXJ+tV3PN9NEucFR9Ta9vJJO/Q3vusieeSWe5KttFJPg08qjajD+xavubzcnyiWFRHt6D5tFS7spn4yYo3JKv7jl9OTdPcjKGan/El9xeV5Ph/iPJtv7HiWOTSu8EcjSGJopdKJcZeTTv0IyX//AA1PsfBPE17m+tT/AKhCdYfRl9Nqeopk47iabRnZXcitTw1ufmI7nDPJCUnuxWf3PjIbNeXvkS6IhDfKKJUpyRZuawL3F7IZDa68tk4Rq44foXgj2odjikK1+kp1wfgkRX4PyzbJd8Eargaq6kKZu4N8XEuIo8MbuXPTbdl4FLy1/c+mS75OW6/uX5eeDFH4NPA5Nc0Sh5sIonyjDRTWZCeD3sf2L9smclZolBpPyjdfg0uzk7wZcsM7mosyfuR2zWT6XybdTbbXYh/EW32F5Ubvc3Lv0inSyST9bLzVsv1Itrl4IYRqUaGpt1WvUmt0W/8A9TNPW/TLlG9F+kje+6E7fSqZfTfH1NyPyWf6jDywn+BdKPhtN51H2WDw7GnFtdN4nnBqNbRKkuxElzRHnk9bJO2ci9Bodx5GrNtYJOiO47WXHKrJ7NCS9RcDWEbe9nlvLHu7dIyyx007KXcfr2IvtRXYhDGWZpilY39zU4V2QlkeURwJofoNl36WT1Nsk4ktaU+xpQxn9jSlUmvwVVj7kJ9icXB2jEoWQzpR/wCkalpPH7njOdp0KnwYMPFZFurnBtzd2YkvpKrA4m9cUOe79NGr5XaNDX3L37olpqf0l60Tx58PBHW9xa2ci1L7m835o8TtY5JWeJU+37EWpcd0WasfE05w9Vjr8Hp+Jq54iTFGHGDW0kUz7IWGav04IR3U7wRWzjg1FhNkecq+jQ79BCGt5w6JezHufJBrhm2cVxgp9zHFHBaSjY+C0ind+xFLuPa+BI9KLOWsDbHG8kIWskoyV5Fapjcf3ElWRpITW3LyXxgrvkmkqJavsOb4Nq4IaVL3EOOb7kZ3ixkufYU8ZWD6XRoSe37GpnTf2NzRp6kashLcuxfsJm20ZjgySfGSi7HHcTuErj2NL4pPDwzfazk2wff8PI9H2f4ybH2kvzgrV/of4L1v6GeLqx7M/wBx/UjcpryyNsue5pS+n7F9/wBy6yfF6NS3r6ZFNul3NHSWjpqPd8mr9P2FPuOTkSihoUvUzJ7VkW6PlopCajkcf1Vj2OTsXQr7DYn+5KJFXeRpUbUXkkU/UptZZdxWT8dHhjTWIjyrwU9t2Jxq7JUXVcWb1H7ikiLwWq4PX0EsVwyUcK5FrgpEKyKX9jU1PSzwpNEfh33wNRhzlkZt8D5YmyMXhpE5KMGXaIm99zT1PMSkvDnnsyS3RXsRUlg05OMul+5dIxWRb+wrbyVTZ6mfUfuSgQ1tSHDI/Fr9SFracv1F6nsy5/0Icn6R/cep7RHf9J5ezojqyjiWURdeaPBF55Gq44FNU4yVxNNaOm3KCbl7kfN3H6ewrl+xpySJpO32GscENO6NOCh2Jx8xtJYE6Hp3dEjAqj9z3H6o5ovzZFwSx3E1hNGbKf1DT9e5GWxkdRev4G77j/uReOCV1hEZ7uTbt9UPb2NvsOC9BY7ixIVFvcTWKKW1XyOLZVG6jfHOBbn2E9iVk9zk5WbUyMMMwmS7NEbcka/NLt0s/wCUjuTFK0rJT8zIOicbk3E/B+BYOexRwzkyUmbCa5HE2m0plP1NhtFFrg3P9ef8kZV7xOMwITU/ZifahxlfBGNfUJ3wanlg37Ca7MUi91RRL6cGlOol2rbHVDj6EkOKSE9rsfLs/AhnYiNUJ+WjsOsDvORRbjXYlwSWbLRLcyu7IZ9R0hrOOR21kXFWX5snsLdxWRJS+/SUfUyfkTsk4x7DlZpxvFEZxhFIk4u8niY9Txe5Fwb4JpcULzxo8sF9hy3SbP8ApMqyzdgw9K/uNef7lu6XIoeFFOWXeD/qJV+DNe3TPSPRFYNif3NhQ4m0UShaVqxKuw4nh1lEZOLx+xd+aNfseJqLkWq2JruyM/6UfES8ld2fg3OLLTdMTlxgSyxSaq0bhGEMe5olW0XSFEljqp12wWsMddiN07FhVYxI+x2Pyyx+hUVkdH2PYz3J+otuBNfgfmZswmUjdtJzcvsexWxJpv3K3vDPCFpcG3a62m2mdiGpyj4ifloXRq1a6x1PJXv/AJMPNkfidr/4ZGe6nLjkpx9yVISKSNyMCwyzBH9jC+5RsNnqsFLsLA1SFYqFFdyWSS4oi8+jE/T+wvD71+UJ6S9Pwjd+P8s1d037GUPIv+Y3f0l4TLExT9Cl+SSPp7FXz3JKn0j1xuGu4kv/AFMGfMmRfrwSwsGOzI4MDXBd4XA77M7e5aLSHtZdOh/2FG8fscOmSuuCDseGak5SZwQhdNonnj9iMaXB4M1x3GnBPNP0Lk89ukY+rwS+onLe76p0VuQoJJW+exCK8Ou+43bexpQU1u4ZBU8kuwl7mPXpRx8m4WWNK8/sNWXwYNjscSn2RBmGOyicDxJR+pWacpSXllL8qzfKPOrX2Ru3Wo9+75ZCKiiVs47FLFnNZFtTFabRxGhehFjWMjbJDWH6izwX1fYWURSu0TRT9RxvBsVcmmk0OObMUORHiyTEfkr0OY9iQpvgXKopvnrOTffpGG3LJassGirtyKyNu/K8cmq/6mRuWOxGo2SnapEnbY/qJ7VVF9NLlU6l/k1INfjkjuRPNGIpUb9P1P/EACwQAQACAgICAgEEAgMBAQEBAAEAESExQVEQYXGBkSChscHR8DDh8UBQYJD/2gAIAQEAAT8h/wD9MSVKlSpUr/8AlD9NSv8A+UP1v/8ANP8A8VSpX/8AGv8Axkr/APiKifpf11KlSoealf8A8NX6X9Vf8Vf/AMM/of8A4H/7X/8AMI+T/lf/ALL/AOeon/z3Liy5f6a/5n/63/4CvB/+h8X+mv03+m/0P/5AQkhPB/8Amv8A4q/Xfm4MuLF//GrwB/yHKf8AFf8Axn/Pf/49Qgfov/CLmPzFSjz/APEf/Nf/AN1SpUCHl/4mPMw5Z8p2od0OaCz2T3Sz/kP1v6Klf/jVKlSpUDyvh/4bXiEkycwgTmMhMtCLQd4yHM/+OvFSv/w6lSpUr9T4f+FriPXDmhER1AxOYVG8SmMWIAyjxKgWWf8Ayv8A+FZL/W+H9dnhtxMjJFmpzEcohZVepa4koIUVRGrCjM24QL3FC7msQHhwPP8A8D/8V1PfPZPZBuf02RDme2I8z4eDsQbmVcwHEDwqc5E+Y9ke2e+AalkVPdEo+sR4l7z2w5SrJhMRJSPFLjhmfACNRui835yoaxLRMz1DjU+iBwUBHLSx/wCV/wDgsOZyE0UbsCeY/KFRh5fTuMFjhlfMVMsrAMwbx4Hfj4SnhLm8UESys6M5sAwSB4gG4NxhUT3QPmBymUwEpcbEXM3DwZz40zAL8SFlDL2AfcKuAuo54YCdsRzLP/luclBSuLCRUVW57p348EYdw4XM2Z75iLEJs3B+PEC3uD5jiWOZVHgVQPCQHuBgg7+B4LxDGJXuJyeI1T2ShHumJcuEUhFLKjluUkD4RjC5WJuZvBFoma4d7hnuVikJaFJ74sqOZMd/8FMrWxjuJyh7Z7kE4mS/CEm1YpynainM7DHJhxNcQDKUq0SK1KzNIkt1ECX4ibEtBk+YgWEXEHDMswIWEUsOUvL43M0zHTcs3MShmBFILL3ieuA8yibJXkscqExMLBE3OxCsS2jvUF8P3DtYl+bpiBl8cJ/wLUowF0QXiZsIlmoQtmfBajLRKUXmpTxMCMMJHgfBBjwBUMOGMFG5kl0XKnE2xB8CYMwhyjXuY57+DYvE8qwLqG6A1g+FyjOwg5bGaAnJwqJCGBmIh1MCNAfEQzAzD0iu40YARTJPRFbwEAvMqlL4RqM3ExCCtiE6hLQfEpg5ZKnKRd5QRwTGhH3uXF3KyvIvwh8Y8Z7m0TwRhBiZlFIjmLTMYxGYsTZiDDUpNJhJxPAXqMBcLQOp8ZXqINToSvmq4EcSsz4jwyoHjSAJRgD9HRxqW3GmGIm2IY+V6ldxEJWaqBFAgWiUyMwNsIExKlWdKJYEThHIwEvwRVNngn0RUijmArHgxVKQrwOZQfA8PGPDJiJJxwQzKXOIitxIwRMQikyglSkyQczSXFmsqXUqajFymWCsVhimnxAQZfhZtiWhmA5mJKVEtmHdNo8V5zITvInSuOfTBo1OkNuGcI4xBSorFLl+GDyJSFrUIQnE0YwMIfD7iu4LFGp2INtrwK+fMHsmsiEsQRiQmpbqOxM1vglIA8KMdeFFRDywMwIVMS4BKePlEpufcuYmjKljKZiB4j8ks5geLUJZDwA1FdTkqCllyoR8TCPBENk2AljJHKRa0LgMkBMpIcRieRjMmBg6ZRGL4DeZHxhMsQIwtltzqRkE3BxDkCB1OR4SjUXhczULhCy4sHwXLipjw3B6InlEYIRzZ2wy3OUyhC/Ay4hD4bwcQMiA5lMcLgsLrLeABRDhhOIDgI4aZnBj4Fwjsw5SIs19DLWGrmIxy3FgmHksxDzc1mOZIvMs/Uo1OuJ3Azq+IBAg+vAgMuMLhfh1TCVcVeT2yjw9kKoQmXDFFXqX8+E4BKdxFMGyXOZuKvcKLI+Bl4KyhuZaY8MpX3ALDCvyOhKZwJcKa7nPHl4VupZKIybmGZmWuLDCm5SovDRYEPEqJUKQ7gWMDzLWYQlxjqCktYzMcEVRS1OhLBqIplvgKDmWSwgdx34KeYhtlbTDWhbFTM3GJQjldz2S9TeNCIOkzFYmk99wyhkrMowpeZlo1DrcveoUi34oi58a1ieWAUHMoNwDcz+INZIMRtzLSGUtAy8tzeEPQhNzJuGWlGmOuPuBygCUPkKs5TwwFTbxUOI8RowfDOIpRCh8LmFMzcg1mchOS4OYrDeXcsMElD3GC9l4TGHyjGktSlbDgiDUoVpLpn1C9CFKuoqmxeo1WpezMBSyjmYNMqhMxbXFmlAouXmcPkCpWZS5m0SCHDLRFOJmOGZhrwKkuWZGpwSBvXxHMamDKjGjJGFLTAbgsNywiS8IP6HyPJcWOpUw3eoMstcGzWVRL6ynqcjLziD3A4jezExsDrIntiQmKEI8xpqXLhAKzO04mLlZ5Sxp1uAGdy5OJ0ZQLlNlDeKJDUNdShqEOI2ppEW8wYgS6iwqcy0NwlSiKxBCtQcStQdYXMVssuMRh34APMzYgHiDhcu6RLnEbjMt4Ko8tly/0JEjIPGBDkjhlDDSDME3LNQOUvI7w5IcbIAwwTM6cli/FZcvxco7mCZlJ4RgA3LXL3Rweo3Fu4VSyzctWRrISMpGeom0u+ItH1gBKjBTErP6ULiGEYPbMFmCZTTNkrJUERqGXKVhIQXIM9EgJbnwr9JBSV+CX5Y/oylN+a2UAIeBeElpEmUy6xCWY3KHeRh7j4ub8bQO4wRZOfApiNdz0gLiX18RhFcLlQgRRBe5YiHiPrKeJSX0mLxK4RnpEhyivU5hx8fnxikq0jfgws8GkaLRwmbVNzAvhmkqDwKJAEdiO5rvc70u8V+l/RVMxBcPSAzvgCPF+C7MmZbiAuCbTHlDMYggRuZXmiWfK0EbyyFTwVvxEgiwiuBzMgxf2wVzFHEyQ34OMplwuFgOZQlQ9MrjmFUsdQMhZNzk4CdEtULN6+PIM9QWFZiXNXhjvZFs8TziOhHswDABSIwmIniZf668DLKpCxQGDzlJSURvBi5dwtwqlBK4IBGkHiJSVB/oEmZWYFMyhZC2wrkhGkQIeCBaBeos+KTJoi2QKmJ6IVnc5mIWstmOAmBTGmBQdZTIBRiEYleHKaGECGCoIlQS8Ss3LXKHcNTnAGYzCpVNTlhtMqwnGYPBx+p8iCDiXzeoFYOU64qyQOEpfGZRNy5TqormBTTC1NRIXEee+VRBZLZhg1Fk7yzdxLrKauCeA+oIteIqIgJkYKyQXw5YILeDowWBgrdX4XQQ+6INLnJl1+FkXuVICmURjLF3kiOcWasDtFbgsnOZME7mGKJGzGixDK14LEf+C9Qw6IuRMITc2hT4WaVRERTSodyouHVUDOIU2MQwgIkqGI6gzWVAI0MMp7TJqWiQvHvU18UQNEVTLMy0S4M2kzYjom0Zjm5nBFlWpcNkokuGJmzKRVxLHwArPmoYKKOY8SU0iuNqg0zDuB2jWnUwZjDE0JgJr5n6Xw4wxtcBIdm/AHzhshfmITPUUNRFhN2LBcS6jRuUGCZiEMpzLz4UvxlplFDKQmopRAbjEkyj4WPgwY8mphqGSpXvA7lrhMmkYQcjBqph+DM7GJaxKjEuVcYsxJ2qV8OZhhguEBLSdkGajFcN0Tue8kbrICpcagzVQaqYkXgMvweGOJnc4mBFhZTOMRFkimfMCmyJwRTiBZTuXxmD3Flmy9xJjFxFeDLRIw2csTQypg8I6Iwhrw+LCUFy43UTqDcxCEDNW4OCUtiIaI4ghejqDbjGI1RYG+UMXKDm2OIQukOkHLtN1Mum0tLQ+JhFSUgjTqWZYYrmcIIiioQIH/CZMc6mIIa6UX5FHUCUgHi5WmUZY5phEFZf0KqDMUvUAvwWfKJcXwy8zEJR4AqNyu4uY8RXWcQhozXnKmOKFymGmNBciUB0yjE3qiwhnyLw+TxFpSLOZcS5TYSuXiKSpsD7mO4hqVBiE18H6jDAFXFtEUmTBioCuoEXcJlg2wlIVKSNUQMolol+BRMStRS0CDYeBrqosL8yyDESWgxuDuZ/QKgJa5apcxOGUZjfcDGPjEo1FOdIpQS/BUGEptTDKuCOECIUnUwShqMfnweC2lAUTpLEcl6SmpTvwCa88w8nhWcpWGGjUGfETMqUSo9gP3GyMpUBLIwpihiHNMSBnyeSIyjEYhtCUZXTDizSMaZYOYCJVRMXNPBPiN7hlqKrUo8QtbipUq01DmlzUsFR1a5Yh6mEYm9JazBHRlbZbuXjNTNLlZ8bYt4RRwxnUuwvg0tMwErCLCCOIvA8hBpAViOGJBqY5cuArIOPAKeF0+GVMkYrUVy/BGVcqo+HMlEGcRExHRXkSYm8ESNRCzKYLZglqlStCBhuCGNFRsRFHKkXuXYeIpKmXmlmhHC4pWLGJWZdRlIkx4OiACLMDMs4YSRjNyXl1NkHi/IeShzL1HOYx2RyAqJUC1BUwZQ68TXhJPfL4GJYEAGHMGD4uPlpibxMEGWiVm0sjGUyblBYxOM7hFYmidfCSsceC78OJcKgWUTqWhSplAhiPBEbqIIYRyAwXmPvFdwhEhG3gHeGO5l3NRNBnM4geEhGHlQzLUXHgsSklrKhaiJYYjNKRGFJ1mBg1Jo4gI4iJlKhhxFeIT3fot5lO4B4uJSd6JuJeIVgZjR1DDMWErUAkZdQmOajfhcLTeM0kq5gFxBiHD4Mr8ARbZVTaOtz2xsTgZQhJiX+EIypaajm/AHEgzFiG/DD9DrxOlJfhShPKleZbl5iNxBpKVLalUErwpYV5yJdMYmXqbbl4YjHp4Zvw/0Q5jiuWZhHpleZSxYmCXMchEbqKlJLZbDctaXEPFjrqcrjVwmkdQAMqpg+VWGcGWLhA6Q34y5Kpgy9Ki52VQmMOEIeOfDqbZcoQkseJtNCWS9hgXmHQHw8TKBqnw4gjESsLZH5HgkGIZVMvA8AdE7oojHTFZE3NZlK0ypigXcKAgwGP5RxCZiEuyMJiKK4S2GN+Rrs5MyJFR8XUyjlDFm2wtHiWHgeSOoNzcw5iwJm8Ls+MCPeb1R4YO5gm4jApiRIZtCEPDqHhCXUpuEGMRFR2xBeAugw68FJZLjEx8ACNYlmXxUmoriL5p4dMXE4guyE28VBEtwJ2XMphj4EuVAksHiyfE/UJJsQWQ1DcWZa5mQCC7hSOtTaXslyYrxXG0yvUzhBx4Mykslyzzf6GpuNCUDuYIt6iGWeWMYEz4ufIBEpiSo38LclU7IQ3EdPEpeCa5lBGih8sdxMpoMZjfJAQ3BnxaRwG4IfqwVF1CCOYtJHhmzwbiUZeNQ2K4QLxAtkUuWcyyCxkgthMjghd1Bly/FwrzVC2SCqEExU0wo1DxbnJhJmmE2u1E8zLyOvCSs+HBFdcTwvtz+jiJxLLAqOPFQQGKHqWYYpDc3mMEqDEFTSH6rUWasTOHwW+QILmaI4TXgtiJNzEvwRuViBvbFKYqWMTMWLpK8UvEKnilzDMNRZsskKRyIpUIwsCBnMDW5ltYCIYg+yYiSr8ViNMqmC4zoTnIbJtI9balzc5hmemo4xkHEGfGPIx7qZaibTU38JAjhL/WYLYFRuuJUYsCOJTUTHgyk1EWUb8CAaZXqUJhBjXcC/FRG3iPGMJeiLHTDGyVkHuoO8e2GpjROxCiqoOcxqLldQfDEgvBHwtiEyTSDw4GCvC2GlvUWCfGRVBhpUqJCLBZS1ARvwtTiRshDiJcP1MMPEyIc+GbyOofAUvEGYJhHMdM2eF4SSSxGV4xFh8CwMaIohUci7Inl1KMzlkKcxmBnHSrwQm0HomlBG1LcoDz4LeIxIU+FaZIwLEuIvSLWo6GBcFQqBpl+HfinMM4btMuGWIxFluDiVADMV/qqb5R4AqDiUzEQ1NpfAZgGSLUzgmpgy3kV2fKUPFgCXATqbDmLw4YYBuNUMNSgixlNymFAy4jkQp1K0iCZ0z3Q7pZhuhkpol9AlEz4KMoLvw4mENEMkrM3gmi1FnWnwmnUdlhSI/oIZgiSzmVjBl4XU28z9K4lTZZzHUzhURgqbhh4YGUFmbl3xKiPuDLuoht8lCIIi9xPF8FOiY8sseYKbhcUDW8+EXLLMPvG8YzCAK1NTfMFMFzUC4KZGZuVM0upgq4EoIBcHhgqIyEN5iE1+PCYOIhEoQlCnnCUjnBARqZ+JyeBdEy8Z+hcuLHiNCWd+OkDhgXcHhyh5lwWpfuBrDAkqzRbBpie2W5iwbi5IcViIyiMC4AmIoSMMQqIleMRh8DCCLgUWlfgNYZ3y6X6hGpakupaqFhahLUFbigPiMmNMyMAQGLAm4FSlsCZINeBZklV4kv8AQZsjYIambDiYIOIEirCBmHuWuaSl5jBgIpECDxOqaGo0B5Ick6YXFrmV8y7TB9xEH1F4rwDnw3dLxjri+QwgsyyjlMvgpKZnyKIME3aFn2i9kWEXTMyZcktdx4oq4LDCbQeo6g58GvKVxHEl8M4zSFuCc/o8R3HiPiZCZeDSYJYhySoMMqdzhKEi5Ce6RHSeiWskAgciNGZtEHMOhBPSljJL9xDcVJmVi4Iii2HVEShKzKXF/QNc4ZUM2j4GSQSlSh4faWnEVAHMuioBZL9MzamaRrcMrhAz8ZvGUlJkjBNxJmEpJkmobmn6OfCpcwxuGEvMSpWJtAsjJw+OOZnKxNiYiyqxCO5mY93LVmFdMxmJyR2PvDezBRqIgpVS6PE0S4UtvErp4BG0EosZApz4oleFeKk3C8QxA1mWgrZLFwOGGSGpTmALzCYA6lt4hHJMmWcTvShLjAGaYclRxqjuGBNZX6KjNpmlRIpPuBZE6GPEwkiTGznI6iVFGkaxpzC7jLMCS2K3GairAnEux9fC3UThGKEeNT4wMt8NymWIKNS3UpjfD45MSpSPzLzfhYitqUnZCOYYr1L9QEL8R3LhqJYIPNlKcVONB8EUPgTYqAXUdRRS8RodQjyowP0Cc+QiB6IFSB2y1VsxBdXqW2rLmrp4iQWPuJQZQvRm6MMYhUJCVELl3mUPEWcG4XJm5hlA1M1uDusRoQuXLwVzEVCZh8jczLY2CdQCYxwHjzMGWoLliCswR4EpU5EWGCAfCDhK0IMsEmmPC9+pRLi0WEsajBUQlEbkCtQHJmqdCUhBcFVCkhQwh+gl+XIoC5m7BwQurZWo/wAx5H0y3clQ4dxl4ZhH/cR77fxjnPMs9RQQxuATiJ3FNSvkh0wuYi4IuqfCHHikMQsMysjLowlHjn5hiPm1QkMI0t9eOWVUEFGSGNdS3qjn1My3UXVwuWsqcVhgxsw+OGZMeAuNlLlvcuETwRHsixu0E7hyTYgCEAr9J+hV4b98PFVFJT3OcfZL8MU9wGG/6ity3SFArRL1MNVssaEWECVzlXvKcy6pGbcRyi8IZmIFTeAShGc0jGtHLDNJeYJPhiTcCeDFy9YI8UGzoYEiMyiZZ0tiG3dJmjcFDXuZAo+oetElGBwdS56lUHLWLKUoPGmKcyUa8AR4AYY0ZWIZqgyMMkzTKXmvB5XMIkdbqG/Iv7lpUL+JOYCdOUvCWm+ZSMzVTGBNQYhdUswdanVHCJvzncJaOJdqoXKhBzggeEL4gIWFEYcT2l6JRIFQ1GBdykzCZEF4lseDiVNEUmSLMUY5R31NxDpMOhLYMJmI24lnXExZgjohY+BzFmuIrYktxDbMfqZ8SgSpRnRDO4lwyEcsJuHkjDxyYqZXh9E60AhJYYhDjFRpT3DR+IupmapLwqFg3FkVSouMCDcYwBqCR8YMZJ61OpGeUXVrMzYQqTLcBG0u7mnEwnRKbM4RFcxboinMbTHuXIbRhZDgIQ4HKKcxqUF5hFCZFqlGnZLikWIERpmhMRs4IKHcamkrE4l+5Yq5mOJwVPhMOJdFDwmWK3BFkhxKh5289P2lrHcThgKxPbUx5lk5ohENDf4nOiNxTZnGblDMDgptNDMSH3LNPhMkaxMSblDDCWjTCxC8hZ1OUnwkEiO7lTaCipg1LXw1y6uFj6JiKVyljNBUQMa04hdH28WzEyTHiIEMYkgnhOKZc+BKlty7IcHjVGJu4ln4vDeLJHZlZQpFD8HnfwNzQXMiKMUC5nCweo5kubQqK5ykAV5OI1/jAxfUUI3KQZkQYJfSHZEedwW1TC6TDnYh2fE2XeYcu4h0yylxECmE3IB1KmYyQiMVBryjaOcINRwiEJDDMJ3CB7nwz4JTxFZQNyjzDgonvwhQzFeomMGcdrPZCoqZbJY+KqZdxUX3BdplNMIQmXwGV3C0FM0lw87wgsP9qlmPzTUGc+E5VFw2oLzR3ChUJrAl7ShVLyflCivmYFBmIIL4gIEELqJbPj4GUwgOmPK+D2Tul1hiYFR+UHdzeRo3L8VagG/BSUeGy6jdiI1kli6meL3gVGUaLHOAxZguM1MIa1hl7idUlPmU5iJw5q3iUV3ixpzlNIBhZdrcbsJHoT3Szhi+E9SU7mc3lwnPkayv0MKnupEFC8N/tE3uKpSXqLfUoLn1YmQQlPQ/MQ6mSf7WrM1DiIvcVN5gA6Ywu4hxcQiuktUTu3ACxz3GJVTbwp4zswYuLUM7ZZK1qerwZGJj+gUpxFJeKJHEMwVx4ZaiAGRFdS1WoA0ygxUvt8EDSNtkFU5lgNZnKSnmDPcaagbWfORPb4HuYnC8Cvcx7leZwFlUOfBPBC4QhHw+YRtny4guINgZYYcmPeJp7w+YHsIFsKK8hwcx3XaziBrxBSDFZJ7xEzh7qUUyo1KWsODUbxqinMuIyhDO2F+Y0Sid7xqmDBqkIZMR650S7LErMEeqXcTpQje2EdhDZhozFu0lvcpwgBTMMolfMFxj4LjFgkfB8eGBuvIC3iYZQCF4jctjZzNJd8S3Usl+Y3ibxg8ciV4beHyBLkIrYlTLVRSwYEh1j5nrCYAvcYF/hK6eA3M3nwtQGUxA8cRgE7JdzFtXAkDSsCPDBlWke05jRSRI9kUy4m9wGTOBUcwMMwB3LqXfM0J6mxxDMeuDUScaiaVK1YrwPtiK+YWazGCGaWWyCalmWYYMedwI4YfCVLGbbENQ6oBW4OUHfhQ9zHuFGYcQXxCQEYw+CP6Ks+GCVKgp3yOLtyzbb7I6QPioSjOTZy+o8GipRBC3LDcWzBKMVBlYuZeJi5tzrrishhTcbqkYYMMyjEQy16nCj0xE1LepnxB5mPBU6lvcPFbbgG/AeyPAyIrHnWLNqVaYqbgG5RxkxEEpge5ykDuXGWmFKXiHSKGZjQkdxhYsIaK8HzldJc5BLcTsQbTLGoPHEWH6OPB5+8SIq4aEJX4zhBMIcxLPmiyiaxiyLpmrBtnpBeKiDmXZxY0tytibyDrNzIJyEzWphNy1KpTMdRURqePE5oY1KqPgJKPDMYQSCyurY6mcyqGmY2Xaw/KMUKhEd7hTljB0wZXHZQHkleCUWkxhEQkW5RyoFzHDEys5DFdSs5zBRy8Rpi9xM7jATTzUD9R4ole8v7xtcyVBwtBJiU+PtnqQIykblJSaMWXwPZH5QzFQRuVHqhNUAaw0YJYZ8GEXmJNyxIJ1Bz4Inio3liUyoEYy5ZtLWKvO0slvpUCoT6gcsypxIPacsN2gm9OiEWmFPCDcR6YyVZlDxqF5mTmI6ZS9wnxGRppg3MrJVFEI8Jjy8/ovweGEWoF5L81CVcsYeDqOLOf7hFg2ZTXOOISYiEQ15eZNVOFKbXLOFW0VwpniWg33MogJhlU+AXHwpBJZEdeLlvAqVahOH6jzRAONx5bRkz+fxA6ZRgVRMypYuoHq4g4lGyN1zxobJ49R3nMI6snrfAqUymP6D8bYnGZCXFxBlw/RZLixadmvCpjDwHfc9QkpqbZ8Ygi4y2LJHwqy4JzMwYXahdw8GobYlWJctJYeOU4Hi5R1PiHhhCMVM9S/UbePBnonZIHrEHE7AQPqbRepnxKGWZ6lw+J6JQ1K9SkLxnJmda4QUPgZI0xLmJw6Z1Jb1GRYWkCViX+hdS48LmfDwLJiXSzFhR5YAO3b3Ce5hjmZgM+oFFBKamkZXB5QtkqV4QXcgWagBEXuNNkAdQoahXwCsxH6ClePmHjLKZXijyPWF7IPHjapkLER9QogIfAJySqRCpWIFJoNRWcmABiVlVLHnxZnuHYhZqAlQG9QJxMPExkjrw5hCVV1P2EpC8E7ZsgH4g8qRx+0KpLyYw6gU7U7m9sSkWe1zGhO7xbMzIp1EFy1Fm+JXUAqDQ7E5xffga8IwOMmIuaEyoS0zM9sPJjeXbiGJBURFg+5cMLnpNiDvfEVUqKHWOIhxj4ln2lzQRO7vxchuGbIengnUd45lM2lmyI4Yyri8UmJ7y1YmXkhRMDEeIbiyDPhpHyVjHNXh/mWh+kDA/3E0iw84uh2Rm2zfYQ1HP3P8T+nuX7h1tPWSIeHESms/wCZVV6INynGYX5J5YzMzefNRuKOI7wEohjqAeZkotYqpmeo1cniQCVluJTBMw0MNOyN57JTKhLA3MGJbr7pVBiBa3zLDMFQiF6jTiBgRISr8LdTczGLMt/oFrL8COpbxMW/DclE2x4QwzmEA6mIkZZOZUBLow3KQmZUF4hr2GEu3/2mrA+iESo/l9ss/APBVQ+2f2JcCbo4gVqVOpcdjxlL3Fu4vfhy3K2uVBRcCxBaBGRBZ8A2qlvJMXiqlIgiJSVlWUmLAzEpcrwHHKUfDSMSnKWKGYLhQww1lXoqH2RbQVLnoxIJUBZV+Fp7RJfgoUwjO0UThMZM3AXDxQHT+iiLM3djLhbj8SvmKqZzOaL4gIwNCMhXqB5ItP0m8Mr+IFfMLlYxzOfD1QollZY34BqLeGhL9+ODLnE9EuuoNkzGEssJdSo/otyiU7me5cPIzuWamsKpv4WOCIGpkYYhaYxJupWZRPfA9y2jpiwXGyZguUpEHSA48FMbOZzGBKOGDlEpu3FrEV3iH43L8XL0JV8+IcnqOBgR/ajA120v7Etu3zDbLAt3UDP1GVXsItvmLOufIAlLAlmvGKHUTpJZpjT3MPuPTwh18WHE41EdSkEl4iag3jJUo6lHkrue2V4h4EkJ1KKJc0QMXBuXNiNHjsVMQR0CEXg1E3C1CBaRKHsld8MOpjEpgIC9JfwiM2SmbghIYN3cSnUBXmUlC9R4PyiW3A4ckCLWTTZcVJmzGbmDRMXBiOUjdvxAk3+0dsa/lLI+2X+7/EvXtuYWn83rqYE1L86gGPywylG5XukH1AZpKRUGpg+CIRRCHxgsLRe2PwwvXg+K0ThHxmSJcEJZ3Gg8pZzdwbLcTIYgoFlhNRXmL1DGI2y1zm5uMDGyLe2XYMLxiZuZ7TF6RxBnFI14jbiZLHwlkoeDpLXFe3heoRaDsj0n+iBgfKTrEdE1FFbY0TYZzucJe2ucQx9P5jQwcS81Dg4isfmUhkIEF+VL1zHsJdoZMzao7Cdh4m781i5YxogJWXGz4VqKZJkYCFDEEdkGUQIGZ6ircHoTTUDEtu1SkitYohAi8NRSxqLrua14n7IUF9RHEqYYGFjEa2zERRanMauCMyzUaRqhfcbzG+ECmOEeUeUxe3xLMX3H5lrvLieuIMY1KHTiGEzPlYL+hHRFY9sArT/UFgv8IPxh0/4mMcvcrJ3GI/c1vIxCzjU0wXPgZ4gjDxt346JR4q0zDmLdwpCDbiC6lO5csnyh4SIo7l+SVMMOIOFI/IeMHB4pPQleGpZl8Mm8XLCGbwivSGepZCIZeohmTEy8R6n2hbiVUw1HhpOJhO0sZvIqYAULjkWPEsUW+3qAxRQE2PuKYn4go/KZ0bqNO/8A1PQxvnUF8EC09UNS6M2dF4kSw+VaposiWnxDHMyEq5o+F8MMZWYJ4CZR8dELQbCpnwBCQilIkYtKyhNQg5JdGI5ihhTUHcA1uYePzNKbnNJXmBAkRlBlaiRBRdxPcQ6JT0g58MZnWIziAjNM5l1hfZGAJhLmGLUUqVMxUCkb5IO2LVRpSPeoYVh82SsS5PljAtI7fxL/AKTlnmZPnqOlr94fkh5mcZFTLCUwA4IaUHhYmZepTgwqiA70Ovme/CUHyVFJh8VwYUwPEpSYx8lWhHwg+Cyzw6+eJ2oVsRy1zFFRzuIIu5tB+IziVFMZ2I9RtUXRcV4jIaRC0uNsLFG4WxLSH1Qb9JqsRaJTFwKYzFiXcLcy3jESV40Y1fUtt4uNkpnIY+0/wjDmi9YiBnRH/M52TJc/tND5mNxLNxzHj1iJkSwCY8EKIxQT47lLVkvWdw/hJTvbpiWE+5RiJLeSI28LgyLcb8fOWJTMzMuHhuZIMxVqORdzUMyzUK3qoFSrRUvYxMxpqVe8yggMKwxADMKzEo+k2YBWCI9TCWYp9w22eZbhLDMhkh8pUG43CFhockeiU8XgQQqARQPpFD7L+Sbx/qDJicXM4QsZ/nwteZUxKSnkIpqLEZU5jUDglsa7jkb4hyxaj1OEpuVGVFM0GXLEJuBEjN5UJ4fV5G5nqMRNStwAPDcrEIwRuDxA8iPhWJtdw1cGchxOMYyE5+YoW2YFqVzNaC58SFqTIpxAXgfcUbEQxW4dkb8zEsdQdxikxveIMzgr+8Qa+SZXJltFNzEUQSeyKZfvwoYx8oiWEFbrLBZEvZHKNJlQ1p+ZdA7f0VKgYCFHMynGYOT4hE8WfqYg/ou+Un1MS5hxhL4QyanqAIKgXNYcQuc9V8SiLDmO243Udalk3KaKcQ4ER+yGZcqM2wZbPqYa1UwBcIRTKrSVErV1G5jEMj5PzATR9svpwwD4lnklEWEYaIjkh9/PwVXbDtjeOYGUQI+EwBFn/SQI+TX/ADVFaQ5wOk+GJGVKJqXBV4XFmXlpeX5fDG4MJT5FeGGGp3gpLIEAmEKXEwm2FJUDwYcIhWZkx4V34IRUupWtSte/BAtEyDRF+DCvP0SnvUTe2hgNRqYqZpEEL83eTzAWxU5X0Q1CmA69eJbF9yzmWRlU7mZSsfQ6lEGMSkoY+4Pa7yEHXZXsZguZYxhyJ6EbauEvpLKru2Vs7PEM5iwUYGO5wILqPrD08axPivBDyt0wpthUzKfEx4uWQSnc52HimF9w9wQ8pKzOJslVBm5hcLTWRlhs3KZWCAVYYRinwlTUxal1BzBhFzdv6h0i0FsdoJM9N9Sj77g+N5npTiN9vAXE/Lh/a8Sg4dDf6LfBm4hcf4QoWKIRDnhlsbgqxmSGiIXeq4h/MyjwTDJPjH0hmEruIwKjWALB7nuQh4jP4BSmMMtmUaJbKaljK9wruJUxLGzBWYJMcgwLgVzCOvFM1AtiCWYhzuNVBGblfMAGNeGIsyMwfA8XBjEU3cWx1CxhQBbYLFVmoQe3AuYT0zyX5nRnxWYc5oWAdeMRGCw1yxks3mGULeFUN8ICXDZf7cQcfLMCUdyuoJTbPcrBhXUdM0Rx4vipURErUV4YQ0fMWOSC5wPuW8DBKOyDNsVeA2yZRrAEY0hxKJbPuFczTxA0kd0IAahjqBIylKlPLADDE9yitRaqKMYzLVmB4qWJcLZgbnRDBGYjwEstQKlDcwGE+bEN3lM0BVKnBAjTnty+oTOBWPCt4+A/zTHWt6MwllXyhtv9ksutfyisL23DPHjJH4Lo54IyUF7ZgEKTNCHC4R88OXuoeKjFHfgaFtx34KB7KcVZ3MjRjEtQcwYHE9koYbptLQqVjcum3kquJRUoyhyQLpg9IFqSVtGN7UgsrEoZjm4nww+Ixri6xeqnqWcmCbBLKlZTl8OjUG9Sq2zI8aH6jcA1aEALLxcTVtlStvlT6he31P8AwX+Yhr8Yln9v/WJ4/wAzPw+Ccor3BuScoqx/2iewri5v6PiaR+DmLw2+0tRaigxFXdfGkSpxLJ2jGWfUZc+5S1SjaK73uXMtdJ3iZaMW1V+zKxeyDYSitMMINi+O5wy4dprFstbX3GqMIIGYDlAGuYi4jxMXpFVY8GSA5MFIJXbuG20Zy2N2GT5kx7ixeJXHEJ6Z6Yfmadx9SnRKltTiiydsNyu78E9y8nriUWwHMVJal2czpst15yUD5fcsJ0OSJfuPuNehdEfCs+Ep2QHCPTmYb6JSmDFt9St70VNvgYSXhGbxQyLIDzUoJ0eFRctKFqMro4lvANXKHFSmj+kVr62NtkyOoKjn70QYwOPSYZ3L9e47xls6m33JTDXvUo19xHsVRLVsPMDZk11BcAq12x1AM7Rl2/zVAay9ah0G/iHivMGoly0sIErLhRUFoLCWw7odkvPdzDFXC7UP9XKkfRA2nomAirmWpl/MCeURwEwP6JTYQeCOatqCao6jSX3uEHXmAhsibr/qVFNnERGHiJfMovzCnMrtlUalRSBy7jz7go83CSReIu2i04Bj1BJjxXhcinEbOR4LMu1DENyizJ4BWE4rfipkDTbE2nzWqlQBk/Ezhr03U3c3Q4YNcXAos4h8S7zl9RF4j7QrQfzN2K0XzNIy+kbxZl0zhYDqDT72UjhgzUp+YbautQo/kigLmc1Us6mLBCRIkN+A1iYj4KY33LggDmXxgt3bPRGOE4BPhBQ7pjzMuIrjwWg7lrtmFGOmGmW/3PjXtjxk5CA1LtHiVIgjPfEzvll6Opz4ZcGXBigGMRZGIOEzKfB7J7Ih2BFWN1uDl0lvMdGjLNgAMqvAzL11ZNQZ9QnI0vr5jFvRRE1vhmCjDOZe8Lr1Ni1lKGlhfHuY8OSNtYtdYmI3sbYtDnpxMikXMOAYuAyLfjxKPCG4/qFatPcwXNk6ZcFDcpxAHUyevALKiLGo8GLSmGVqOtR64EoQ1dyvcqUymV5r9EogHUXhCbjxMocJh1Nu2+p/lM4ipdyivcu4Z6p2zkMoS5gTb45P1ESamK+TAk2slKQbvV+A9ovsZlBdCMA/I/xLddnEEIYJZE/yIWf8swNq43dS+97TuRh9TTHBxAWX07QIs7+YJnlOKxHoLn6QFh5SoVH7PhgBRtwhTmN/aYvbB8QcRB7mHW/UMEGzuQ+0KcxTdS3tEYWu4clA7iG0FrxH9oczDmWOWX9w04mrG7MBuBDGvFf8FLogscQIaKyIaheg7I4bkee4NzkitThAt/UgGoR+YPY8EFo87jtR/wCMgSr8y4/CDhnXMoo/buINOmsbGWocJw8Q4rHJ1LpYxn4n45rPeHJ+J0iIt1Sg6+ZY72b/ALlFHR9x2bnyiHV0MPcXnEvf9QDxnZ+ZQNHtGrMmKieO8rr7mqHN0bzL4CvmPZX/AGjKJgvS/iN4ltI7e8kc1VQ1LFggbF2TMEY5TiAtwriOYzHiVeAvJizDA4HGWKNRSVFAbimO5faqu4491HtbEDiUiMIB5xMedfB5/CGZKL9NwFsMO2PVRsE3qbT7EZRsrSXfD1EhWWpYOXMWLxCBwmFOZ7wdk5D4jrPB/wCEh4E/pjA79osZK/iCQ2enqYmwfT+8c6dMEiiwpKzqVJujcQuBhHFeH6nRgutzkmQRL4a4ZRkx1pgeeKFguYB41+R4nqXKllWBfOKWhoPmVc2rO7oinl6bjwvVldd0xCwsBIl1g6ZgEZ8+4mqfUCirJhLjYxZuDmULIU0OJm3Ut8arcGWzBmrlMXb6l3blijqFw5S6raE5EAi28PF+N6icrRBEz3ibbZW1c4RbrM5PMsao8dj8zuIsmFjiZKbrPuOtDOf9hHzQ5geYXjyxnsZ3sxxF/Vx5rwRQWG/lgoUox+I6w5Y+ILgV+IoMIOeZRVeW5VwB7lywNBa9yxY33DQMaTib6Suwy4ikVoNvbLGu0dVLCRDl4jbOTLMbujMaGRUNMzWzTczC+GZmzS4/eUQvWPT3P6kFKJbOgz8TKmjfMJcFJMnFydM7hU1ipl4n1C25pgXAl2LFaRsOkbF1LYkH7p+6rhRqWuqXookBzcHetTOQzjsIJB3lazKe7EaRtFsyQLYLThqEDb2QUHPrqaL5/mCDV7SkXPNckAUruHEs1cbSyXGfbKXmKZSU8RKBnTFFlPhT5NfpPJVK6EHUjzMK3rERwy4cMYMXzLBCzp4lkHxYrJDQ6JkRd5/xHaooG69kMNDgZc+YoVUPzzhK3hEz7Yzog85yQoUzn6u4VE9r+c+wB+JrmZiFY7bf98S9hANPGmt1Engw2YSVNcbExGiBDn+52YFA77mkq1OBV3ClZ9gg5vUil2uNTM0PxDG56MzdBtuYgvHfMaFtn+IkuTTTh2RVrBFtlqN/UVAoG8G5omockY2mVnE04l0xQ8QX/plNj8v6iit5HMbJvIxdoaM6uZaDJHO5jDjuVrZuqYY+D8OSamKdBFTLbAEVxwLh5DI4kYeEh4UuO5Rh9Jq7+IIaWfbNYbOYdS/ugtgPwXKaS4TbOWVe7Lm83CWFzjEyJ9IvGxQOkY+YyMxhQc6zaljahGrjAcE13EXswsoT83uUuL4DSe5iNkgDCVfWYLnqy64iAtsRWjtVjEtIqHGZcFOeEqUtnEqu60NxS7CYbQItf9pTGDlZeX4JYBSMNNaty3eJUfVZtH14UTAO4wlymFkEqcW2LwjfdTbDK9xTpA5RjEYi9Slv3HFOrm4/iN77josUF9zVcStb48nPhrLJcx4pSxt8GQSFPPxn5IsZfxX/AHLc8D5Jr/MFB+fzKdku2CXFVnbPQdTlWrfqaqjisNcWnI/zC93c6ivvDGOKHHGZaMgtMp6tonzLDXMPUdxqaahvD18zDtt3o/mKJcRz+YkXImy+mJSW6NvExcufdHOyBpcQTZT4qW8843HKL9n1OIVCDm4tbr5cwDi3J3c5EW8wHv7G5QGZ5YZBrRhG4aai41K5fslniYbIgcNEt4dRCDkmCnw0NxIcFzkln2YePiEjbVS+1lM1Skto+z5i0A2G5bOM6gExTFQ2dZ11MoHpifKnGIJfn6gAGjwqjKsu+B4gDLmZagivylWHjglHmY4hTHub+po64suLVGV+0Nys+HwruwJiLaYOYPhoepbdL2xX8oJmIBfUVq+mDvFj6WAlzkepYc9j+ybCnp6lGrESHDMJFxN1Gxb5zg+4VRVoZjFh2MCXCBxNxs4Vk1G0sqvuZu4O3M4kumPbKc3/AEZdtG24sK0qGoCxF5NEweGrbj7Lb6MBc6VmIEtBwm41DaqziKuGXN1UucCANkyjBfJFwoNIvmku5ROI8z0hCviyDmJPcyu4viJkUvqWtujQCZTh84Zbl1AirL6ommcwEe9yobmvcxaYau4NHLfh87Isv14E78CqCCDGYBCe08db3DgjTzPyxFUn3pjXpqG5zCOFxCX75E/mWM0A57Jd3mL2xqqOZWGyBAq5qUljs3KLre3P1AgOHpqKFDbf5mBJ70xKm/7EaNt8eo4Qw9IVqY5MRjWD4RKBouqgKI5zX+tzLdDD4f4gkFVkUSkH1/xPeMJj6mGlZsrmY/DI9VOuQyXlB22/jj6lh13jH9RqDuupvN8cTO207btKHQdl7lMcelSi5OEg+n4i/tMytTHDbESXbqBC/uX3EJXv9BFZgNz3SepSKrXPBBSpk1HWD7TIHWvUYK7EM/OqmYPS+4+xiMCJtBjCkimdzXhfGnnBEkvGwWJTaJShDMQYimK/c3/xNpBUEMdZH3HH/gTnFCIV5hN+xfUN+CU1MtHMDeYAgRUsfxHA491MHs1sqcw0VcCsbRXyaxjLMXq/EA5GcK6lDVRyPuYQaYIqNXqDRP8AUzLZsrX/AFGQGHP2yjO3I1tFYPqHFRV49zKUVbwzLlaZUnJkWUwRpVy1d1y9SmqPCJQqGfmbi2w45g7rk1UQ1FN8w5t9XKYqKpuUS/RmYTrrYhVzhgRWCsBwQSOEqmMJ5j7wRhi2R8UUzmJKlVBtE5pxyv6hdnfcN9wwdDOIj+K4T7pqELpz2jrN+ky3YEBjErCP6cXwngiBcE+UBw51H7YZC0LgcqqKL3fifuZJUYi8bSjU1xwzYXW6gWSdXKWs8w0QwlMVvarwQslWG8Gc5jLCPT4hh2anfzP/AIhno9cL/EY3V/eYowBrnv1Khh5aVAUBG/ibK43Zv4gKTlp6grX0+65IAXtfaArwytss4loYk4afxCjdDdZlYE/HKQ2jvdVMUlV3TK6CPUqaSsqSlOZYNR2hqf8AxTJajiUt/wDePcmsqhR606b/ABKEjmsEubfdqNTgy6hVTR/MzXDpiZIQ3LxmI4Q4TWp2OUsbLjuE3AfL9zjX4Irqe3E9Q/5lBLvqUGYoq5ubK2djqWUiue5kCB/S0uNu+vtgCLsQWyipFyrZ8SxwPPgPglRlzPEtzBkQ8GZ9OouZA6IHaBcVBa/xByd/tLOTU0h6g1pqz6lFpiUabyz6DualScsuMvX/AJNi68ECDYJ0DBWrYbW5txb6jq0xrYh2OXTPcVIkZAcHx+804bCIizS9ywPaKX3j+scTIM7BVb6iqmL4YWbyr90SFr04hFdDMNpfuIfsO84Zi1jMqPg2qCiQ3zKYqIEIvh1KQvKUsuixeCFCBAPuVuHY9TiL/u4KrtHJZc9+EaxkSn3BFN1eoQFcOcm1zAYzNy5quYcKYWWyZ9RMmuYRty94iNR0EcL+Z958GV6ZazN8V3LF7pf1BUqrOZuIcH/1K3OAr5lxajSm5Utq9x6rO9x2N6wy/wDmEMx44lMvGhF0TDAxzdQLsl1dCWYh1iUV2wxZ39Jhcvc1Mbq5aDQ4har9Li2C/wCENhu+eoUh0ZQR7yK1yPg8TM+JRVBpIzRurzjEz9DnmZRkZXNjtx1RB0mzuYlLfCdlWzkYpdPqbGDfySxx+Uq0v5/3UyYb+oNLRTj3KZVdSl7PdyrmT7+SCvWuBEAW5fTLZ3DKCEadxtY9ssWWA/tUPzUkGdkPOJQz17hQNZwn+I+FCccS424PUWyQPkxLvAVqccN0/Hb+Jm6wwwOp0jNO/ERFU+UmI2nUXwBDSyds0JDUE9MManAn3KcX5RuHdqucv/NTePpj6H/bSGZU0GZStBYvgi08RcN4fcUkiZ6/cmc8h8QbdzmLwSwQTkjUN40SphnCGL1AvpUUWlra/MMGDsMAHBNNR60e3iahhquCeymfj4JwW+Y9wJo3MyCGn3Owmo8xK8HgY+AmjRE1YW1ZLEtKWtS5r7l5FHUvTaNGknBz/EyMsRaRszKAsfPNxxwf3DKzFQJUumoJ5V8OiWFqw0dvcrXcpdkBZuKv4lAIBz7IFs5tJZFd1q6mgs825hOSB1U5B8RQBuuZfaHeIhvs4hW7+xqWkByy9SzarOpcLcc0mj4HSZsFxMulWF+4Mjn8tT85HuOe75+oM/CHMBWgAuA2FPShieoYQISokK0O5YEWEil7ZcS5uO078ECL+YwRh/WoEHXuDXcNHb+4yTEEVFsZZmgp7mRaR4onMCBHBuHh2icSoqYB2y9l99SlYpXI5nNN/wBepRU1nj7mRH18xMFP3nyjcYf8c+ZQju/9iFqM+ocir67j7U3bvmMOgsPMhtULWdfdS7OpQ5MxrRrr3FsbnbmIGyuJ3ec9RNLk5lR+bCFAbziY7ge25Zi//Y/xGpfy6i5l5dse6nU4rn1mDeIu5v6hV7p9nuW7B9osZwLlqksVcH4N9RjXl9hLlzUwtlkVlYcVdfcEVpLrb8xKbnXE+ytzRMBU5HmD5lGurhk8nDxniLEJx6TKRfmR/iTV5ieSlXllncQ4I6V5l26OA1L6g7ZZQg/EHH4SBBB8V5KyCZ/4HJA5ahrM0pvuFtHLdZt9SgtrkgLG6IRrxUVUqblsmK5dQ3EzSClN/wBS/Eesf6wzkcZO4ZZH+om1gcY5gLjhhbgDU3+H7n4o65lGm3PxBNgn41Kr+hpJaWr7gfZPYW/eB4ERvXE05bH4jvwSuFruUftOeQv7GpgjFPFzD/2APOrszKYH8OYKqOefULMNOohpaOu44VU+4upnfcV7VcsJeeIs1UvdHtLE5M+ok4PiGVu1x7N/iOQ0jdqLxG30mz/EZkfTGoDdkxmHReZuEdnuA7DG6ip4O9cTGvzWl0gsPdDAeVRiTLVzXdyqgtpkGvxUtNPhaMyq1hlh1BzNn2Eq9zEuppVC8S86dxqlJfcZ/koEpp44m/jDiWKq0AqSv1KwhME9z88BRTeAun2mRze4O/1FuX5am1TDwYLJVTOmsiGIbxGo3EL+DEoOalKA+l/zHfyzTEZjk2phReW/VZh2mn4ih+SqJZt4VMhb6GpYpcPqNaxdLS7i+CH5lqGqA+ZgvLP3zHy0m5Ss6v8AEH3cl1dSl2cxFGf3E0DTptNpft1EhsmNks07l2h8blDV2xArGYpfOWcYRGpxM8zEp09LHwJR1/cFzossvJ8ykY2dTKqJfB8xu+zDv6I498Vwz4AlQ9gswVDdqcjCfm1v1HOrfKVi4LUFq8NM4ynvmUKAbIlLL6geEpr8yrSK0j2TBk8sQgTRKA3dOJ2wfXAgQzPiAJmv2o2LMziOkhddBPymHftBYka7IK1m5fkaccY+SOh/EhSLwqNmxgGCyUYFT0lO8PmKU6j2E0haanvCUrgvEa0Bnl7mBlbeZZ2sD7gRvn8xWTB0Z/eHO8HL8Sl2ZdzBoK5nL9x/iCXteo54LhLwsfEM8Y/zBu/aBf8A+xFOFtWHcG/CsZQBTC5+IbiVHxNeHshgUshhxE2NMRphcqzj7gdhWy/9zBADHeqlgUZw+pg1jn3FtZGuamVP9xD+BNFY8kehddTTtzNl4vUfKiuo5Gz+pkwW7XqPvg4YeqYbvmGusCz10zI2Xt7UaqoK8utkFbi6HzPbg+oCoXfMYFDDmesEwDnd9wQKxwILK2cYsuBgd/T+5tMxzT/3KgzJdQsQwcK3ONjC9spB2lz0gtbXEzxBBDPuK0Kcyz5glMpm8Uw/c+Ey/ZMuK4le41zGs0nSNj7zM/OOtWtyjV/Q/uUq9gmmK8RsgSs8QZG1Q09YUtpLgsjdzUKDpYzPoFTauFxNDScj/qbAxaLQnuMkxOD3ATKHwiN1/mBcsDe+4feIBYBt1Lo3+4iXBupNSC2p/f8AmDRGp9M6jzb8IwcyOyuENXRjOIrZoGOmu5hAN4+I0C0TF9fM+VZ8r9Rw/wBvmUIpTi5UN87hcxiuIrnCnBLuuZji5Zpuxo3Csk+5gtGJzMJgm7xBLt3X8R90KTEP6cPUHBKXZ/1PRyDwCU9yD8yRqzODN3HSlCGrmAy2ru+NyzbOyZPBsv4g+zFGYj6huD/lFupauZrxePiW3Gg9E5t9E9s0BuMK1mIvf5hsfgjFnKSyXLXPH1EVUq3xmcfQgOmpj9pcTTZqNt34CXMsnVucT8wPURymZaw8BoyyUMA5iwcQR4MEAS73Gosy9RbS1e5oU1UdU0HzLeA18pjk+D/2IMjWJh7Epm7vUL2fyEFq19XMHkJKcOOmZfHUsD6fKak4tAVt/wC1B9Ssz4VdcMw4sNOLhaOmX3LIaOW9S2ZXvm41t47Eizm3vj4iuOX4fcAA4dw0eo+jKHfj0lq7tWo4VqcSnoWbDJ1cqJ0birndwseSmt3/ADFWUPqXxkM0P5wQxxl/Eyfg9JYwR3Br6Iyq39pSv24GsSsZDcDVc1OM/Kci3migIusHd1H0oXy9GLWMIkm2FXfqbU45myacQ/HUpksd9ViUL1DtdYilxuUpKVtHqA1OgmjE1U38imzUdtsj9pvezMucmf2le+YYsYsIipyGPcE4/wAp78w7m/2HiU4hJUaiHgUx98E1lV4+Iq0HxjfE/wC6da6dwqG9aeJqTFQs09j/ABG1W3cyyqKxnuXGuKJN7L1/5LeEoS2YMBmcAoJSMNVqYfAJlvu4v03JRoX+0HHv3shC60DWHuYllqlvMHA/UMqll6jbvSppS1A2hkOdMCsBaV/7EXO9BxKNoKiq26OT5mGVavaZY7ftC/8AAY5XePcrDmj7m2iychFpI54Ga2Qp6i89sohgtYv94O+44/tDPTiC7oxDJvFsq8HH0wKF0dOGDoiegnURiF5+0Css8HkhZsn1gyaFUPUVvdxpuVLKfNRMlMLhuLGdHWce4GKHlauXK7zYPN8OvF344gr4iQu0/vA16camqwaNyyiqUR4TBOXqCILWiPx/5S7tUpX/ANn/AK8B7SjxLKIdwdeCwlnW1SWrFY33GDeruHdZXSOajhxHtUC/XIHJFfyFSsbJQY7HUyjRwqUWx+IGtqx3BpYftBmzvqGxwTB7WDD2X+0pUP64zTmEXtyoQWCoj/eIjarZEdm/xAd4e9RCNEcrrVQ9WY1d5gAFNqRziemz7QczF9kAHOhxtC7Jtzwj2DBpg3kps3N390iIvVvi+pntMbvuUxiUuwGtS7Js57jXe0Dk50x3UKP3gNhhJSduJhBbv6RNUcvzE+Q5Xoirr3Gbtq/EL8d7qOXA0y5Sz+xqZitiOqiQCvLp7g0KN47hUjQvmOceE2gxYy8Qj5dEQ181/eZ9U4id3YcTuu6map55h2naHUzL+ETlp66luYekAF98TMN/xDGX1Kcy848F8F6ZZLAcZx1CH0zUa4vkjjDkx0x1LTaxmA0+s4lnFKrFEQwkIi6cKdSsfnctQyKw9SyUUvuY/Mz7/phgg1DrbrL4hzNnJshbkNLKvu5zOJ7vzC2CZxjiU34m5RgD+UQsLA3OS23qyOgfxZjoejqNi1tfhKDYLXe/mEVE/dTLN/56gl1j1AUc/wBRs8S1/wAw0DbxuN8jOKVDeV+SLfG1y4bxfcx69caiQKL6iV+5zHoeIqLuqgVMQkLlh9xn2sCKA50fmNpsEf5RHaOFaI/2z59TKF/KAuqLfvGz2Lm1R4j3Eebz/GPHCG0UWLFiceW1LLzCUGrXEYKxYcRDVkQp6zKP5Imz9wHP2x64Sm2Khi3iBm2/OMFy4sYFCale1i3LqtY/COUhms9StQd5lx94lAULTqAT2sKlEznbMo7PXMAOpV2779QtC38JS/iI01MAv9RLAWrJME55/wAZdsVc+05/Qvid6oMQH0hKF+Li/Z6Y8LpC/wBRKxHRA61PJAb/ANRbaWMcEAWHbzAFFXzcocHF/wAzh0e42BzLDujuALOSqDuAsGshxM3mVvmDDbDqBiGEFamBvvAysT19MyU77eLiNBvGdSgpZDNzYGghMG2Ze5fsKX9QDAC3Q/4gXDeNp6Y0aqzC21wvioCF075Zqaeqlsmw18xmwEq4cRURcwgx8Dx5RQzvMUsx1CKsq/xK1q/cH7fUO4E5bD+Zg+CFFNujlmCv7Nx/K0oOXc28RT4XLlxM3RYYFDNalVLzkJNRp7jvb7gudOSAbtmBKlqyLlmt18wdXu/u4YfzDC7ICg+brmZdtx+JpB3KyI4aNv8AyUrGws0d33AxPqL2xfaw3PIHEvbIXzMo02SzwupYHMfzLcIbpgbWuPUzP03+JsA3u9zHXFwss0ShrpLsV7uA4M9fEbH91xCmD/MqS2pg3l+I68khjpi+peC1OUPknHGFuBZiPvGPiH2A7imnoP8AUYWQKl28wiEWHuv5hCCblM3gncZ6Xv2gIYraJde683afvBi0frj6mlULDX9ngi4PkMopcqcyrEKbfnAJQqx94Uj9xtvpKG/AQ7wcT2/FQlbfU2RDhr7ZcobmGWWcNVNKYXCpfkqFiPrM/wBrMAziUht/MFOSqwyiWkGWTR2Sw4GuGNK3f8xdCjyTOOuoi138S4VpCD6tml8pOCXT4VoDxLUOswXr0HuaYVqr3OUUmxV/Mzn7iKDb/Mp09ow20XUs2l/DTxFz0rJXPzALZGmDjCvcwiL63LRt7Eq15GtS2C91efqV6Uvcpr7lCURyc4lN6X7YPJtd7gVyVp3Hsx6gCO33Mapf71KW+mLxUIw3NBN5Idm38yjZL74rmbkDWv8AMYavBi5keC/SZkkH4hQD3QbTNN5mOg/JA7n2nDGOZcGXLl5l+lfMSH8ETx+8xPqdbNg/NSg/p2mA4KMcRQsExof+J7jpwTszFbv9hF4SvK/6gSLVY/6nU3OQ8GsRAlxwaFMQvgmQ+8+jmcu36mR7qPIf4/E1Vxx7iUGRMsipgNvXUwVr1D3iEAT8Q0SoEtN6itN2D/bEH0NQq23UxN0TKrniW/nAIFXfqHhntk7muYs/6MENYfcVzglTFVeajUY/6SktWaEDr1Cv2PaM7Gwlqi5SIoaPLqU2aR+Z6V7xK0V/iGQ03H1G/gv6grUNXdwo+j4gEgr5CXyw4v54mHMfAyoS9J/iZQOwNyy++jPwfwmA80fA7hsLj4OcgMHJ/wBTf8xghufA+YlZzLoKxFjliIsJlm5PAe5Sp/CMctwpa5Pc2AOzKhWBy9y9R9GMRzv/AGTdgOPca7SYhC5W1Ym2NSmwx/UVqzKpWYisDFiMpw6IPcNhT7gmj7uUeyNnCMFAuD+IXF1XUUHNc5ZYC9/zMb7lCmRe8TNAAaqZicT4ccwBloJWfnsDngzc1Y4IP0bg66ae4VUjEOWM8S1ui14g3HvH9QfJweoIGfmZMn8wqt+nqZ1oTZ8EoNpSHAiOupaM28NxypaPlU3IEqxhmFa/jbOzcb+IHRXvqHa2zFuh5O5db33EXW/3QNZVOuI0yY/OalFFvpqdCcVZ+RH4jT0+4jcALklkGTbuZKFrsnANnEfZFUsGtuEvzY/xP5plUnObiUVRKKM0ucRcQ7jtqHy+Xqb8v2LHpvG4lD53c1nu5/UaVT6rj2xYsVr4S3NzqcvzMUcOo5wf+iIXpKIYCZ8LHUI/cRC6imZxqNNIhwSrLNy13t/mUWDqFeV1FhOYnK4J39xrx9blJBZkav4iKBL2RZUb+48Y/OoW2ojTkh1Qsir0lDUu4EuusEbIty65zEDA+463m6v5IHOGowcmPzADg4CpWDrNrj0GQ0yxuKGo0xwxXUBpbnTanCR293+85X8pXVjv3DFGucxptlgLy7hoDCyyAsVeeyFVFPPxDsi9s05mi0mH5gmn8p6ftomdoxc/yTUoHfTN8PhOPzUoC9LPqUn7zplobYB4j1bgvOLcTBQwYaC5iJ/tOHhlXNWBz6eYZrGKahBmibniHCJYEzbXcYtDft9xdmsdzFmctRLrlu+/mUFGz2R7El4RfXAgjh+blM5fe5wAWaJs5wbil4TiLT6bgdjwzFepV3KEeG3j1QXX1LFc3uUNLazOMczAYtPergAfw9xcPzM+saJcpe+ppnLAWs6LI23d3+8LdJ/dnwbTXUOC2cIof94jhP4I7nHHE0V1KWOaNROL9rlquVhgGvELEKS3KqN1qbHNG5iTF/xCAs7BFsKgngf8ypDTKw2jCA6/eMuwLfUSHTMpQvFTQrEWtYqCEsnxDWI3BoJotfmBWMjnqZgczUK/tB3ZHECJ8PUvJozHh23NY5mUZg29Wl5+T4j08rsO2VFf13+JY/Y4xgopcwS/MAoO2vU5EGfmPb3BI7yYF2lKFSI5DV7i4CvUqPQc2CHrgI53xLoZywzJu/1KXDwW1BOAymXQlON3zKrLnvgiQF/vEtpd9Euv+WAC1KkOYiRnQRj4LHBBRB0gPgY0A2PzAyr3Bd0m4BrHcsc18EFehcz9k5i4loU5Iq8or9PMsY13CVqOjB/aOt8R7yhWQw3Ua0KIbmG7f5Qi+4rO8IadHREq0GftMQLo/wDkpZaQ5l4rwjFFD7jmy8TL2P2r5g5UtMkhTti+dH4mXLczJNEVVeO8RmyD/EG7h83CbZIrqXqsQQ8jiuIgiYMkKsVmwrPOZo/8wLV19RZVn3KIS1uZL6cR6KFkl5u8V8S5MND2MsvL8wD2YhjbIxrmohRhkoLlXZz8SoS6wSMcSqOB7Qw9S4RQPoP+019k36VEg/BBYFpKrT7lig4gOmHfE5RruPFaPXMTBy8VFcPPMrULb9ynUJhgw6INAe4Kk4ZnncIsJ1RAEtuMoXGNi3Z1HNVDwU4xEQ7L1AP9GNo+uYnfziMupVNRGniWDbA6RK7/ADGYL8TBrn3H13+IVDi4mnQfmU0R3KVHDuJz7PylCXbRW6iBapKDShxEskHR3Lw3b27gslXGOW+4Kmz9oGGrY7l/jrO2KkG46tjmDURY4uL6F7EqYbdpDXMTJUbJUWyf9Ebf9nEtXw/buOnAGqYLDmoZVttfUTeWu5fJ8zSPzLFPaEDyamAXRx8x0USyy5/qgseRk7gINrXz/wBJ6YafULMJgKTJc0zkW+nEWczCmP5h3j6TaQw//SYn2jrbG939yvKxMs3H8RS8qdvUBnQ9blgGhxDKn7t1N8/CWigr6S7/ALblng+U/iAg1bsji5utXMLsfcbAPpORMlWL0eoFm4DJHcE5mDETcsuSgmC547mRDMZD5m/+4dctmIwOr+Iqd1MGhcoA45lXQLGrT75lhf5eI+B7SxbuA7jLY+YMveHrGII51gYXQ6Sx47JSIj71qUBq6OIJQUHEIBC3b7ldCwV+0sbzn8RoRYyb+bcCU+YzEau3ZA78dTCBdjMcL0XmXxYmblhwQ0L67lMsZOJaLvbMt+D/AFn2+4OWMY9kahR3dsSS088RFwaMx2scniVeqjBwckKRoJkX0xMGv2S2AZ/eZAVBUo7OeK7xDd+sx0uqn7MFU7/iUL3KNBHtDH1DQtVR28ehvxaXIZ8ciho1LPUq8upkAz/EYpV8n9xgfxAl0xOrbACN8Qy9ftArX6itrxXA9JyzCyv+JazkeJamdxC/XW3LQG+MQs6deoID7O4bejcwyCcwJZNpRdMx0SX1/Mw/zOW0/tMnzyQpmn/XqWXSVVUytDzEiGGfxMNF4f5IFgWm6jLeolZWxLHR0wgNxtp038xYDDywJzxKTTMOMDY83BuoOuop67VxCDBpFtc3cyL7PqXUiHVyj5vqZxlgfE03l7h7luZE6HcclUHnExLqdZl2rL16QYTN+mrhVafwhF57fE1+fXDKBoXvNkOkqUFwU3ByN0xoff1GoJ/dGuf+I6hjnti7C3/cwA4G4LD9sQKZsipVeSonKkNWO6YhvLmTDi5Y5Uylvdx4DAvqMEZ6IQ/tPsQ2ou9rAqhQeohGtzDkrKvU7BfUepDzzMBK+ZfuSse5kY9e4mKX6glo738ywh1+blF51xMK5wBncxgU/MKhvvxEpoWN8T8hMXC7uZLA23CHDELfAOsK58A+tStt33L1qoFHUYP1zA6aMyi7cdRtjkSsuhxMz4wsRW/6mnBcssk+GcH5Q4cioDsZBNYiEqq9yxiGAr8ShmTAoKz6iq4wRZqey4pLXfuOicdOo3u05VzFKxQ7lS1pe4AYdyuCaMRlADe47gOqmSH0gcmLmBeHDKTpYM3aj+jOLeUHYJ5+YP5Val9lhZsajctrX8SxFZuCFkO9vupTPoy+1l+fibDBjBLsXdwa2MMxSp3G4t0YnSxqY9yUQPRtOJifmlTIBjWJgvxXMEfwy7LB0/2gHN9Tu/hz9wDNXTRBe0hX+4mYf5gL+XuHZ9ShL/fEC4nNRDeNbgmJxC+1N4e6ivosw3KlizkJaofFzFaVn7iUYHTWcQm9bb/9Qc6I0NC1zFKYX1uVoXDcmszmJmiJDqLhASUo8woapzNRtLCKfKPlbmVfvBKsjtyzBs0w1xjq5mDdGJm3hqNX/tywV+8csV6llz5bn4JfeNS6ARdy23HuKcNoaVUG2Onph2IlZohjlRUA+0Sh0+IIpy1UAbD0Zhp8dRVN7eHTMj/LUzfykD0bg0OHPEaZ3j3NogUFa1BMH79RdfpE0VHJ6jWf9viITGE1DaWHj4jQTD8MPme4Z/aIcYoxKm+Itf3PQf8AMsVQVPF6xW4beoVbcrzk83MhlW1hPiaGQvOIT9DYfJG2o9f9Mve/imOhn+YqzbEDa9v8SyzilbuAorXz8QwX/ubQnEqBhXBp74qX0Hmk2xm+OypgDYM/Ett9rz9Tp527lKsursxknJARJWNfU0oqrB7jDaZAX7eIPazQbgmw9SwupQQrGUPAl+EszVkJiYxK8NsBYX/SZX0lNY/zEG3HWIlYZjkdfdRaVdpXpObgN9mo5Ml8ksm7qa3/AJgnH5w7xRyQoUabjZTKyOuDNBOYC+h+0wk1lymYMDrYhWM0yhhDD/wfEa01StAfcQb2uGGbxyIiwN3ZAKG/tZlL0xdxF53WO029GmYWK94l+mvWoRaU6h3dbze/mb2ZhVa30y+sGHEwaokewVUUGVJ/cxcKLQGhx/EGYGP2QQBmHPxL3M7lAdhv3MQdp6nChJcQEAt3e/Uf/Yf4iUrjTKzQv1FFW9CsHYfKmg27KqKZH6RGByUE2qrF9/vAN1e+OJlZwbuUE29ZuWBys/b5ici+IhtzhnUFLT8QMrexnxQZzUdmCBlhi5attffEui1HOdxqmmFYmMH7hzCrwe4s83HMUV23AGNzNCR1p3AqGYLuFnmH4G4KX7szDeNo8HrqYrYde4Dr4phXkHECMF4e5l92Yg0aGIbKs8SijdvESA+iX3YI0cBzcG6oHzEsy+upRrZ56mGA+9XMgw9tvPqV3QC569kvoz9xoM51+J/RvP7RoQrp3GpNrf7iVLspxEW9MErRdIyPUO2O44YuviaDN37gWytdJazPuVwfs9SlVLquyGE076gKww/Ep2smzGniOuH06bgLfYOo2HL44iXOfiJpvuYfHq5VkKibVg1EpePlqWllVqziJcVdR1O3cfe/Dw8p/YSxRXMv+aP9Mwdl0d9kAigd6L8SmdPpRyvbUMsY94i2/wDQ7gigD1G2xcepQAA9TeSt49QhKJvu4i3/AJKBu0YZz6aazDk8aDmpdUPcEtUOILlTAeBZ7f6jrbhuWuUv7ksFvZg1KdQBseyrCgpVOoX4NdRic0o7U2dErRpb8KgXVe4HNu0bqGAi1wepqUx25LKhSt7wQGRTHOLsJSy8ZiBS8Srabw3VfCOIz+kMjNyy3pVw4Bp5mSjJuoQlXZj1BEp1/wCQBtjq9y60lermFYr6lIWazWoZ2XvVwlNUfia5X7YGvUpV2nA21mB7HqXVdf3KA3T32dysDRm066mBafmL/iJli0Bgpe/iZM66qF6bzfr3Alp+0Ha3u5wivdmx9pk9ee417B4jnRvmOgOCYNJQQg6FlhmQgBu/gYrPlwT5LWEZQ9XFpSlT0w3I4sLxdMakcII9emCmV64JhkzJxf8AEw1MXKF2wr4u42d6aTsl6lcJyRf+Z9xHf3gtLoPM+R4WLcpAtUCZK3co/T86l2TX4huyj1mComH4lzlRWYezCgf6ZU2Z3X9iY6eCioOT4hR87QLyN4ZVtGK3L0TFPywdOLxHsbi9ZSzVoVAzF0ydxFeIVVmu4CzN3/cdsN1BjDczdIFNrNxb3C5F0RFxVfUKl6G8RbtjE8n1GrVgYPUVYy/COvV/uEKF4/8AY4ZKOJRtb5qWTFImwtCctTQ/JuZlrE5/qbt/4hrGG+IsRBHHTMBc6ccyzYHmLActQsplmtuuXqZeQmJfB2MQYS9Q3cZPcqstV9TZdVijLMdsvkaqUWVvXzHnZlv9pg6oMcsakulb5l16mX0UjuZIEgYb5rHxEellQ1/E9lTMwKZhgWW5/aXm/Mjs0fmUVrEsxrW4aRhYyLx8xsUzctn2e9TAsujMCG4ds/7wQn9hiEvl7T/Mz1UIp9mpljSUqf7qfv1kuNN+XRuUPMLTd5qI0a+gnfjS0rMKsa2MAxX5iGDFZnVX3eIIv56hVPz9MsXBBfDGSLXH7SmPn4l/We5sUxTBMh3VfESEVZyTcJuXxOWHmNv0zAD5YjWrHpl5QYK0eoC6P38QqJNy+nP7wqrRds7Gj0RXK2bZJ8FGoJMCPv8Aidqiw4f9xEmnBxUDayv7iCFVvdbmIcgi0WukrT+lkayj2RyQy7JQ408Rwz28SzMpeKa3M0r8R6R6j6PwguFWwzB0fzHkG4t7Dl9MXs9Ev4FyRyxfPzEeAsHzPTini8S8W8Sp+cLqwhfqJdRh2GUt7ix/ETXvojqV/hGwW90z0L+olMg6qOTbx/mbDX95mpwmGj5Sn1K2CZYnYGUa02viVaAf71Oav7cMuLSnP8kIurhtXsAG5jtuCKnvAL+JxZHEPjKmRU3MautXFugfhl9W1g7iiC5rkBD79SlWKHExuhOZishfcf22Q5jIjbVoMwcYuAYJC3o7RE0sqj7DKAggDBj1LxfECyjjML5qemmUWty0Z/mDR957mnjNJMAQuoZYaJuO07GIo4ELWAQ1L2H1e4Y8BC4A+yDuqC4dwDKg8a/EoJwOiDh97KBpvWWUWPvkmJyCalw+Nkq643OfOmplFV6Zg/siUOB1LOTmerDA4PGo1AU3RBHBq4wFfH1LXuc9i9sPcBlT8x1ap1OpnKsVWMS0V1UtBl2xVLxj6Kz6tinry8fUZlL90Z0se5gd3CQTa/diI2E0T6Db7gmo7leFlRFznJr+URkC4UyRyfxFBPUFD3/MQQdrqLqLYvEXhng9T9wnuVD5s6cvDMBqsfmHC/pn+DTMMFu+ItpKvioaG/cxU+Ji2ZuKbKAIao3KLXzqWeBAnDc5trMp9lwpslYGBriNg24iro+TmOFB/Mp2TibDAfvDMGIaXCREK/8AtLvBkeZp41uCJg0OparR+ooA+xURXwftGlm7JlbbOdEwDYrEHgr95ntjE5Pv8zJ8OpjC+hG9nEDOXqf2CA4yV3hhzqTszMrujf3ODlr8/cX+XqZmipg66nR8hBUYQcvEGhNLVLCHqALKmZl2XxHuQbHPqZ3D8S+RT1C1L0R61DnG7gf6cRACidVufgbIOHKX1B6ius1g/DFCn3K88IzA+33MG7g2mhFq0dPmLoqfN+ZfEpZmkrWoobLmcUJsHI6lqYxKC/8AqU0OL19wAr232RAKbczW0atywXKsKRluC3F0xsaKyvspolkjPuVYSgv1LDvctt+6NJXPxKrbqWcwW3n4lmXKZ9SoOai9WGEWL4gJt2j8wdwOGVOZgAYl3/1DIMtVKQr05zC6r/lLKMcpKYoXEj98TbqoiJi+/wDMvZGiOHLN0dmRSYlJ3/7FUq+YExc5jQuN26+IBVK3D1SLHLO+4WDmCpbIn4iwq2PGIN3bV3N4K+SfvD/BlNlajJncorBU12SgGqlqwcy6KpEc4/uNZ6mhi3i9kyvRbkisJAr7itRajsfkijXX8jZNM5uekcPhVUcLg+49QFEr1dfdShjn1EwHTcwqeVajBhc+pkOLBipmsf3Gu58bjv1FFNsFd0oPxKBcaSf2iosW/iZIfBUFK41n0wFYW33MeNFsNFfEV22zj+4Msb5maenECQ2r/KXe2PuWSrjpd2NXMOiSZn/ZAivKZCv1L2mj3NLF2THGO46FrELFW9y+dqxG9lYZdUzzcrUCnm4j2O4tY12epd5JcDpZfaZ2Ap5io1p16lOzZ+I/vzlNxVfvdzXBnmAEGyVhU+tQqOU8XqYw+/r4ihY5Uy2EhafvQ6BuBXll/EuS1wA3a/34hywH8JVhKl1tcdpZFHl24KgI6hSsVsdR53NL6YmpMkOeTC4ivmx4ZwB0bhCyjmaLF8w4X/mOJkytxVb1Ma3mFrw4+SDxDv0cxuiAhmoU4PTPgPWYdlzZmmVsCU9yyuZRw/M6ll3BwuWg2N394CqlTa4Gm03yYX/zLs43G2iiFL3fuUZ85nKS17VRxNl23Dktmp+63CiyMaiWPcrQ1xFjD94i5+4KNhgKj94WdP4nEGAObQjVL2QrSgfmWZUdJPbXKYJx9wyp4rEslMvmGUMa4lBaov8AMV05yIym7BeyGkf5mMSA/wBQmm0oww74ldj8Qepx/iUKDX7R8DNdw6tbXEZCR4hKwXKm/mVuJdnMQ6/MaPw1MDXUCMnyYxLQZJ1ReIBd5jK0bBx3C1TrUC1c7hF33MMblDvT9pYdNnw7lkArg5mNKCi+IUUT2gB+D4m3QLzEPpncwlLO+5ZWIkaPfLOdX+8da5vfx44HXt1yfEU1v1plbTA8Zy04JUP/ACw7v5ii7EAZYTPw9S9OTyfwvuPGlCQ9fmdu/kGYCb48ZEWVvzwRWPWpVw/tDm2+I5/W5gf7Zg3+epmbY/EyBCDESzyVqNRLjcA6J9xF5o6j2cTBggn3N0vnUqK/iGAd1VRoFWpR2e8cw5XbUZgz1MIB9jxKpb7Rwp1WHqULN9dRa3jhi1pb/mJKsZOVfMv/ALBimaHs7lKrBi8DwfmFMpPxZQF8USwMs4hFOP5iojF/mVxr4QVvyjlmHsieK29wPJAZ2dJLF+Alaj8Iv0dTZydwA9cRHGHqFTVcwuZX5jNU2dwNvwZdWzCAUBp1L0bVfswXem/iF0reRjmquBdaB1LHJi6cHPMxmuPmKOlP5hnWfqEo/KUO25bQnyr3BY6Y/wCveUxwe46tD4EM4PeKF+f6ySrs+38RJ/pnU5XH5TET6X9mNjwN5xnupQG+v7yvPJp6jiDrMwf/AFsAit0hJ7n7nTfLHM10hvwVOw278ZHSIw6dkAvZxNNPV+/iA5WxhWbfhGxiLY49ynKNJQ3p5mbH5gZy0iL7JXsBP3+IRFNxHI/cdCq9wXRdQC+RqHCz1CgyNagNV+VQHq2pWl+/UKLWnJxLhQG6O5hXHCQ1HyIL4ecTFlQ6iinVxOOP1xGWc9z3SykQXbqUsn2T3uaiTkvTq5TnOcVcBySn9oT0bfMsu3+EbM2so52rEEPqXKC7zjqWUCZhxqC/IXEG+KjZiS+JVXDiVjrn4YMvgRyLTpMrLOZkOmDRS46m9YnxCpV4xKyKK4n8za8wRjXUzpc9Kw/aVZJh7Tpj8KTGBI9o/TDdT+05X+z5nB+9Gu56YFsigVP9MsCXb8X3KraXzLvZMqxhGcIGL1ORTf1KZ4WIvk0YsHcEH/XUK9r1Kl6by4gnCX2fm4qr3XEPbEZNZMnzGCfOCWzwjmWmsajsvPpFVEEylkZV+0NS+5isYgpSJlR8xp2Ir6Q2PqiCN1KNaXCYYdTVsY4dCuYhhfiadR1RADdhDqf+op7ZpghyYbA4epeqqi4NsoAm5bYFzIaWCbp95lXTaPqUvj/uGBav4htX/tK1TiNZSm88Rbp1hmmSy/uoIGqsmGgO8XKwd8zkPYl1qFqmxW+JgnEE2jX+ItV6f4l07Zxldnv1BznL+Z6rCAcvzxKDpZxLO3TqBwRTPRLHEqWmfUdck0gv3+hqO4PylO4zkkkpKED5fyEBd/1/iU2QuOIpTvZk3KLOveP5gm1XqamkR1bg2+DEx0NjuYlT95UDD9k4kOolZd8S63ptxLV98SlN5D94YZZIW8Ydyt3hxLic5lV/mVXH0zL46YVsjKcCjzKKdn8RHbUCsW9VqNkWP2jDAzGB6fiaqz3ECGPUpVivMyYoVi8VLHZctsEDALhB228QRQUxUtKdSxVT25gZYUO8kShoK7ltNvuyDo4JdXtTxMW4Jbh/E4mox4L5loOLmbaTmMg55J0XqkmBq8sTjpplhGj1HJdifIEoW4sAmH+pwuBQckAg2ZfSQFe37QVAqwTctwHcKKtTzGmvpxCtC3lC79T9v7x/eDgLf4lPMxy/iF9tuon28ZYUrnMTMk01jmYL4uUan7GmtFuWWtg7npBz/hO192J3lft+056viX7kifuM5nR+0rOkBmvTBmrWGOU/BZoucwjI6nsyz/mK15m6uWbjTz8QgF5DOdspdXEvA5lAY4g6ZWN10dRW11LXdxLKFK3BYpzuN3zVXqMEAT95zbtviFTmzplUPvMpvd/cuklk5MfzKXQnK1X7TJd45jWHb4mUbWzI7ephV8c/MVFUpbi4OR1M+X/EtzyaCKtz8Ym2WLPtBYedof3CWsVvupw1pf8AbgLWVsprzHg5xAbCv2i53evibbmd8ymxdkRGXLjTVPoQtp7VzDwbe8xnqdHh4ghtp7g5LiM+dTEN/wDUT5xeicI5w70O5ZpfP/WKvJOzguU3sYPUSK/OBWCGCbdkY6l/yRlsBNftHywqb5/DfxHdL70fsnrX2EasW/Iy+LG2r/2CIFZHUrcfEto54jON3zP3NyuYYf5mnMJpfxMSZZjReZTXccbbWYlkO0M2cSh1tmGG5qZwhif2VHSmaiRTHSZbcmprysymtrVbK5HH4ny/UYM0r+0dkM/ExWqf6DEpTglXZ0ghlK65l9M+pVFshUGt3Mt7TQYjSO+YcFmo5plWM2EoHHFRuxMZKOO4NaXdo/ubTbnctn4L3mXxm5UrF/yzKtHfcarq6TELeI/oaIOah147/KjEeSPp3BoGqO36sTU6umXVygwTLBvEoobfMRj017lreJiWTGXMd4gFb1BrUpVYer4gA7uCw16TOVwRVWdRyxk5Ih8pWUZXEQ2e4Db1BolnMT8y375hRKpp5PuXql1JtEPXcxgQ2zQ9E5ZfwUDiZdU1K8kwHSrmC0PEVh28SwMLvLEcs/v9xdIIe5sYRW9EAER/aw6DMs2VmNZbuFt5lLV8w5HBLnIe4rdcwWrrUytuY4Q/iM6whmB8EHkhY9aJQpMckfGLxPbXDFKopN7y7rqUh0YaBPxM1awlxXyXiYVKZkt4l3d/nVR1HSC/cuo5TTCaVWvUzlv8yl6c3gdQvcfTmBQ2Of3mu0wLxcIKxqPc55lGvPE3ahBPNyiDKssiHAHDqArr/BLtXi4l046lGcEhyEZ//8QAKxABAQEBAAICAgICAgMBAQADAREAITFBUWEQcYGRobEgwTDR4UBQ8WDw/9oACAEBAAE/EP8AxzT/APIf/vP/ANZ/xv8Azv8A+u/+S666/m6/i6411/8A038XX/ndfzf/AMl//Bddf/JcOv4v/wCO/wDC/wDG66666/8A9Y/F1/8AzXXXXX/+4f8AO/8Anv5uuH83X/8Ath/+i666/wDK6/8A9Ux/+a//AOhmP+czn/z3X/xzTTP5mn/88/4P5f8AzX8X/wAhh+Lr/wAAmn/gf/4Z/wA3H4v4f/1H4GTJpn8CZP8A8M0/E/8A2Gf/ANk00/B+A6mldNMmGc/8n/wzTTTT/wA0/wDO/ifh/wD1TTGMP4Py/g5/4TOfzPzNMY/4BPw6aafmf8ppk/5mP+L/AMU//LP+Zg/I/h8ZyZM6YNP+SaaaaYMPwTJkyaaaaaaaf8DTJpk0/B/xP/Cufw//AKQxpn8DnTP4Caaf8U000/4AwfiZxxNNNNNNNNPwGPzNNNNNNNP/AAP4XL+X/wDSYPyGmmmmcT8zDP4PwGMmTTBp+Jpkzk000/4z/jNNNNNNP/C/hf8A80/4zT8Gv4DBppnOGn4C45/Bgwfiafg/4TJhppn/AME00/E000000/8ACX/yhkz/AOCaaaaf8pj8X8Oc5N7/ACumGMf8z/gPw5z/AMZppppp+Jppp/4XF/8AKGPwEz/zmmmmn/E/F11/4BecXDnJjA/BjX8XXDh/4nOv/hmn4n5f/Cs/+UPwThPwf/HM5/A4/Ez+JnLXP4H4mP8Agv4XXLrjBw/kuX83/wAq/wDhXP8A5KfilpGf4P8A5Fz+DDjXLrnFz+THj8TB+Cfh111/C64/4kF1z+D/AIn/ACX8v/J/8kx+FA0zhvLOfzP+BYmX8XLn/hcZcuuXOf8AgfhNPw6ZM5y64cOuuMXP4ucGD/if8Ll/8Tn/AME00x+EZpphjnTTTTTTTKCYKGBnZjxhqf8AO5f+D/wP+WZyaZP+F/Nzp+Rxl/Nw/m/h/wDE/wDCafiaaYww/wCGLmOGTT8T8T8TC1yYOOYTw8bDzD+4f0w/gYbw/wDjD/gmmmcMmTT8k0/Mzn83Dh1/N/8AFNNM/iaaaaaafgYaafiGv4l/F/4zT8JLc0E72ixEuN5nwugkwhxwy3uJouc/B/Gf8U00wY/5uTT8J+RM/l/M/J+T/wAc0/CaaaaaafgYaHGBp+bnn8U0000/E03kT+dMimmlXL5TQF61NxeE5jHMGRmBGGhaKzKjjnX8B7LfZ+QwaY/5On/Jwfkv/Caf/gmmmmn4DTTBuGPmNHz/AMn8H8E000zqfO+zU+d4eHJcypDkqwyQim8E7kDowMLvFmKmQldKagXJ5MiXOducDWHLBlJmyjvbzeCH5f8Ag/8AGaaaf8R+D/yI8nIsTuNndJO8SMTQzqZ+beSGR9cdiLzIcDPmQb2XPQPeXrFQXPBneQOH64HnalDmJreWB65+N+M5cwzjN9ue8xXXjJpk0Hc7gXnHIZhE1HSZqLueODkYumdbgOPcrRqEHcLwczoOsLH0y8OUILni404G9UMAo/ifmafif8H8E00/M/8ADT5yao3HhcQ3DdUbjAvMnms+KTKADd8ph+dOx1QaGfIJhjxG7Jw3lnt6Z4Vwl8YHvBXM/bgGE/DJGTSKnzm+OnVyND1uKcIup0yB3KCMqwJpeM0Oad2eScwWyEuAyoRyTkx+9fDIesS/LmPIe9RDDHUP3ogGSkONBr86LWIGJZdfByZf3qf83OTJppp+L/xQeXeSG8NhoEy286wd/j9GITeyLkHJrR2XQxzmGgn8DPGRozHUFdR4czvuPBwp55xffNIcyPZDDLckO4/i4B+Mn0yjENZicAL5NDSR6OaWGfNeamLglxJcExOfSf3qnTlW494YDclz+/kqNMPCxyXhMmfxO4brL6wfTkuJmiJuqOMTocmEnPepKGe4XNEnRLDk/wB7tBq70FyRRZh5M0vRm+o4R8P/AAfy5/L/AMBPWaZMuDjB+eDOjkLcefxAEzAnR3HDFVD8LMkTNQKGDjSBe6BDOLu9KZCmQzlpYamExoGpoYE3TyuUr5+XJsZ/WIKLrqHANXOGLGz4aFDUHDjO+MI6DQiHeHD9ZrOHLuP5MHaGnhH8a9NAIeeHIuPfwEfgkgvMa9Z4wjiFvdBMzaal5m+t4solcKDhyuHlkoaiMI4txGHCYTV3eyZ5V1I47pMjDCwIFDOy9yvDgXwZPxM5/ADrjwHeWHey52sMVAmBvjNA4ODxvDiubjpwQ44lZ2EYfw4mOUDU+szxjHdEcHN1Z3OtxINfTtpzy5ivEQS51Fyp7chArmb0x6qv4wBLRgoJ/jL7pqtFMA6Y6LSwDTR3OV1MymVC4pHCjKAguTPOG81MR4M5qzxmM8S9wfGI4Dg+fx3TFqszrESOcXEYD0VpiHTOp6dQi9wmIOb3DI6G8wTAD6Z0g7z5Zm587gDN0HPVNDUhu2ZCbGAAG5J4yLZxruZG+m4WFmUM1ropJhJmBKbw1m9xkMGH1rgXVdA94K4PbrrzusncjcmXkyUYKrMDSyi4gCQzWAO7QhgwMWBI7zAY4TMSxOZ1bvCa4vphBzD5Rgil03gY847hLkkm7i4mrRApjziYT5wAmBMBgLzTnmgphzH8KCDqhLqTcmY6PVwkyO8mXPkxp0uQqT7Mkdvp3NxCrzBNyuEBMAKDnfA38EQ/AmDIM1nzDmlHFK5d7vuFMK/e6y45C62mnDQGVvQaUVdRBLk8Gmq5L5xLvcrm/WQmhiNeZK0buu7o1kwvC7j2A56suTirj8+uZRl/DeMxqjSmPFwC3QcN5LorzA/BOJlBDd9Y6mZ8GHxw7TUsZiriRA1g+BiduAFNBwVHDDPOYXvdO5W3HXxXINmfhugycpLONnncCByuE0Bw6JgE4xlXGgs0XZZJefiz0f5GoRKfvGCMgABM8PmwiDwa7mT3mnH4eLlEaKADHv57woYJkjYrDMZnmE6v4xMb1/BT2Gho4EV0JEuT7MwI6fnecxy3fBN1ITCG2YcVy8JopblDLABhg30H4A3Wjy0Lks6MweYK24nvF+Ikbrp+HmHLMHJU7gVdpTBSx7yTiQmecvKDvbsqGOf2TfIzFUyhjMeYF5nocBboozoKkboCiejedOfJmS67zKXTJBPNzlmKE5Xt4UnHAYhkDJ+HDFZMaQX50KycZs17jQ5lHFB3GnMT1xDUM6GKrKJ5XHgXy5Aq5p+DF6D8Yv7aLimQ6THj04CMswroMfFWBcKDBfGuhGquZ+S4Bwudq8zG595Fw05vLC7y9HfVhecj9Z0JDNA3LuoOqXOZr6Gp3Bio/hDWgFmImlbh56ym3jnFzV8mjomnJziXnQtjJuAh8OZr55H8QOgxPrFeDD54fw4V5PwDPIYgzSXAfFyhaDRUp95cAPpz/Q8MCrnMUR67rWzyOFdcWFaB/B+C61EmPtdJrwairxjExG4XNXg01VcZsXEeMNC3TgYfHloqaG8qdz4HH4fjfvMgwJXCDB+Fw5vWC4get+7oPcas2yoEXJrj5Ohp1vABlpTuV6m5sOsnwM9uXuAf7NzjLiOEImfa5K4c0RyCYVpuK0MNpue442NEjLY5SKYRkfyYTBlO9vhhauVeBykzOirN4Nz+ljgapTnzv4J9HKwXnU8MDwByXb+M1FQ+8eRG9zzjwGNTBAcvdf44ITP8Fu8AZ6yAddB5gmOqFC4gAbwUYkRMNPzgve+XfBMQyE3wOUClwDg1YsyDhv4cRB/VuAh9vNRyluGb07gXkF5Mvhx5h3QVwzHP08u7To8TKqOPKwd4bjqDHhXfHhKXLgeovzgoUYQJGQPY5s6ZfI1fHQdTuawdzFNYMvdxF88IHADpBhMZHmgUz5mA0dNW8n1mu2+XMQzNDlZ0F4etdUMq+WKAuu9hhuNM92odxD4wCCmBBAwDhuUTCpwO8vx2e9zL+Z5cCoukk461TCLeaMjpKdRW5mIw7lTwNETuiINxEQMS/jdQt0koDeSJu/m/rBYq/vS6SfL3IZXd5r84u7PvAQLn4wzcgixkD93BIeGTRswmAuIQ86gk9dNWL3wTdgSPjeN84aHl6yuzTzo19enAtuuAdS5ukW7yiH1mKAzHwZC7qGYGQEzj8L3o3cXKEYAjL2cAKuj2wDLcPBjUOes3qBqEhH3qGFespAo5ITIK4awxyPLpAeaNB8bpC5FHjGfOS1gn6Tm5GNzQw7kbvHNmU53H4BcphJNaJchwwb7kLgdacKAh7uk8ZOuABhIOD4gd0I4K9XdClyta4R5MN4aeHTnhvLvIIst3BlXzgkchlAIr5BwLzva5cyd95SjnxvpMqjcbnzgPUc1xTy4aUtwK+Q6b0YPMMr2+N4Ak3iuMc53C+2N4yGDy0VHCXnJLkvJhnGPlkzkagtDq1NwXJGCA5XTMp84+AxCopm8tCjKezfLGZ5dHC/MNPH8YDdaEHGp1w6GJrD4wE5oDEGPwmmNxhzMl/M6ONwRdPvxv31iciaf0xsH+cBXXAw+jK6ZXDeMKg0IgYK5m3tMLjmVq/gr8fA3txfVm+GYuuVncnwdSFpoKOARa0TGomUTGYelyKzASUciDhSPnDIhm9ObgKziuY6B1OLkA3Jwfw5FuSI9Z22ZeroAybu8DUozHkzVP3oIcYkkLieGCRwO8uMK7oHMItyLz3+LCQ+d2ABxHvDoEGN8abkLQ/DSmoxh+B+KXTWDk2eshHrN71j3Ih4yu6cz0Teo3fmvWZB5zSZ2Gvtg/Bk6SMWru6dA/gs/DuCfwTXRancHHM8MMlxhitA8ZgnGHscyjziSypILzdff1jA8SXednZckYfrfSzh4wPMQ4Npo3KglPnRszSYB5Zpaa+vDmQxD1hBebiAaEmnnQSnc7pjiETGerJpVfGl+Z87nkN0sd0rihcVJu8Mnh3KwEwItNzTAZZHR4uC56xh1zjTFHPjLnoXVx3n4xx46gMZ1wlt5+5sDCYt4TTiYo7uRWfA13PLIfg9yjs0zdaTCOGS+MJMgeYR41WRWZRAZhBTuN4mDxhjDYHNUuYsdzynbgsQxkuDOvNcDjwa3OeOfhcglBd3gGUSEd5z03BffdYnTWMdQcAU96ZpkcWkxx48Na77jCX3gAV5olwQiU1nOw8nw5qX+LYVTE3Qb4yWYPLxqabqtUBw0aLvIrTRDdf8lUx+HPnTn4QecHyfgHCMMOCP3hmr7wWvGd5hYgS3cKO49SahN1+mIAdx6DUe5VpaZsOIYkTuv1iOEPwADUwXMy+DDwDjvNenQczJwJNI3f4YF9Y4hDUhkwyVXP2/nVKi5QnxiR3IpgHqyiCLeSvDohiDKZkUtwCBHdlqwOCHE6/GU94q6leCt9ZSX59ZAkTE/SxoxMt0wsNiM9JkaDNQObsGUrJoxeXQ8mfwzYBKzIwQ1oy4w65/AXLzUyRcosCYOHcXfOWFM1l7wJsYXBD4xYITLTFyuuSKJgLvZ6ez1mxTHTyGZZXROYUD8aWzJcnRgOjOgI3UvrdCGOb4SMwnwOOQXMOm5fFMJx32zdTKhjh1RzIcZSQLlpTV0yXI5I45W59JcMQMgeJ8YOiDiEiYl9gw7oZEgmNrCqZblm8+GPFPX4Vm5MSyXLxWKCOD9V+ZgXjE4OYDZjMK4+NVg5oibkjhcTDEIXXFoBHWGtq7hx+XujlypocZcQfR+KjN6vE3QdcwSbtmZ1TGGFxlJLjKVaw4aCbulwHzmviefnR0Yb59F8a9a5u8hzDnmn3iFMx7m4IHB8zA0rBzs3Whj8jGsgwmUw/HnKN8QX8ChpXnOOO8wYE1EVMJ43Aa5mJ2uSXISo1wyvkwyvDDrWJZD8KZhbrjxhbY9P1iC/bke8Dq50MCpgQCYcYydPMML3ebKXzuM+OCww7/bJri4UxTMCNGmSlyhM/wDCZNRvOmcSXXn7zE+tVmcLNVhDrOS0PFiF36PUAdeIlwiZHOCXuM8zQF43qZySD6wB3WLMHzUlhTRepoe8HcfA/jDhp4zHrUSKmVsuwfxn0aMkdDfuMiO5gOl3HF0MkZZLpqLDjDKe58K6MSqawXNBoXOnhix9Pc3CXFA05yxMFXcmWTwUw0+nJX6mjERkm1TGrl7TLeMd4d0NBo39fgPunCQYEPwOg/H3AXMKGGFYfAwibpn0MuMuWQxuM5ojCLobTRj6zwceW7Hw7sYYZJ9rogHU1MUZ5E3bi0SS6WoAM9+8XpokM3vAeGcEMgGFKZFk1S4wHVoPxI7IXGfBk3xNfVxU84zpzx/BvuauzQAI3w4omAoxOOfCckeN3aZBILojTol7fOoI1ztt6Br3rKL9Yo8F9Y1DMfwhkt1hI9nNNtutYmKT+sYjJvobsnh84Vu6Ju2XO4u2CaYCOC9XdNCZA4f31Jm+XVE94eG7NYpomtTTGGa5Kapl2YfPB1z107deckKYGj71Qro+9L591A1SgZPxlbzVTSh9YCpNFNcGQfOihoQuQfBhLJvZmdwF7uGu+lHRNyGZJMODQHMN/F6KZ4PlrJDTqesQwjmKxcoyJeR8m6hvnBxGi5lIbrXrDOtQ4ph+kwXphq9BuQ5xfDS8dxNT8O9X1xyF/WEK9WW9wDzlKaFMszw5j98NT7zazeHPGunEcMh1ONBMUh3KTc2EMIM4Br3H5H8XlY72kDUdrp2qlopw66PbgG8OZFXRFw5sN+A+g3VMZKd0OZyPRnnce7T1DAUGiZrxiorhavW4zeJGc9Uc3lk13E5PWmCZfea8ZFXDQfiCOdw64hrMFG4juk7fxOOuakpmplJn1V7Yb6D7dWN26yjTPOO2UxR+usDkmS75y464ooDBj5z0EZnxoVDG3r+MSJvCshuGaAa6PjFa8xDrxwWuEs9TCzHE15uBrc8PyPxNYGBk9MKFkSmFyEGdoeNEJ+Eoyx9jJCgvFzdb0c/FpcDjhi83WJ5btuEmuVcBM4/WkG4MvR0w1zR0uiBNy4YDEuqJoNzhrI1vLGKVgmA4KyB96BqZk6oeG/m6Db5yAcTLr51pBy3huCdiPxo6cSJ99ZqpR25zluiyNZp3h8butSu8lIYauIPswkB60duAyaDjd6HMqJpYPN3Ez/SYj1ONUhkr5MJH4xQT8HmSQ0Q/BQyhnTFxpjWuug5Cw05rDczgaNXjfbDGUGFVPWUbglMa+fwEZRDuTGWJXI+dz5/BExHNzd4o4myuAUyCOghw5w6HUXGBxvjuhkhcgTLBYHAuF9T40f8ATE5/LgX0UuIsd5BuWs3DncLXpmAMz4HC3x24gvOmYDxlQZfRkp3GQKZ87NSDQvNkyzBpnya5cM/OZjUFxC4NjlzXA0mLu2LVwW5c9BlvDcmLcXQuZXfOLK6eilxddKONZlMXMhO4x3J+l1FWu3eDL9alcv4Ny0QzyYD3oIm827kExJoTuOuDMqZL26EzjOFWAPBiSBoG6hcj3WY8hpxHth6FusdFr/ekoHJcMBYTFlHM/VxAM4Lkq6/LTuWBcl5yGpMMMQfjKk+s2WdcjqWFPbUvhvNvcy+qlXAm/gXLwzDmNyDgoN3Yr+s8oxXnRHhjhMZwKEy4ehpGPGHHPmfNcubg5qL6ZPLSuHDNXMmGUcyo84mHHITwVGI45vJ84B16BktSupEwAHrKPrA7rzXDQXEVrph9LNZfI+shiwNeEZV7hjmrkjiGZdYfrBwCepiEZ0XxuIDCjCQPH4jht4Vhrnqsy9xkOMYB06kPDk/jmKpyF8NfsswqZ7lyliAqqbomY8ZgmG1Ux+e/wXm9Do/Rxl4c6neLZvvNHCcyIypPhocbgNEFzli6UwmZu8K6dDJQynnDTe4067jcRvhudSNQIszR4zJDWAH85EVyw7qFHTE2YujHAA7xHG8cR81hRBjzalgXpkHVl3RZEck65GXWi5HmMT94eO6tULAzAOUAG7p43CK4oxBMBfeE8b2cN6zoB4c0uL1jGLA3vlS9Y7hzGs8ZzIQ4f6MhisyEmPl8Y0HUmPozJdM2jDFHwmUuHg+Q3N0+DhMsbdXPg4ZhLgiZ/gsMXDurKVnqPe9JvOayZfC4j+E5ubsRzMpPxSch055hLhgHE5l5Yimo7hPXETCSYYY5ZotdBd6t5swKmsWYg7rHmTMIEwHXgTX+7xuJ0Z3VUXJw9ayO7q4yvRc6b4e9QxnDE9ZZlfG7LuqGiLvQbxEwj+KRjkwl9Z6GnU7piZUeOl1mpDTFcg7myTFUcYwv8sUCYEBxxEuRmajamQC/kfGHv5HKjQx7nF3KU0ecWy5mZa6AxW4cmG/jdkPGsi7kuj4Zx4xYbiZEyxyJwPWHm/hSafTRcTS4Kk5isYl0Kz1uMl5/nErkDHiO72xyDD6/gfU/CZlETE/OL6aShjvpnVHm6o+MNopvKTJwDd5/iRjRzwNNrkTCLOhNNpuQ4w24Adwx9TBeYPnB7zAPGsDKEza3eJhzB/Adw4RMjOLE5ILunc1ivSEyNmPdZEz1uXY1hNYhj385Apkh3FHTUZkt+2H0R3cGsDPwHDuGCXImW/A5MyEQN3oBl0UxdHmWDnXxlciCf3nvQdw8P/FyHrWNXz5MRrENWcOV8T+JemC4k1HTIePPTrU4dbzDJ6dIu9bh0tii7sTdd7xW6ZMiJhFmAYiMm4h3OcxUMBh0qN2y6IHxn6pmfTLDeJj8B+Hhcr2wbi161DvKrKQwiuC4iqzB2mZOVWUmEEp7Mr41kQyBHFet6xlw6uCd2kPgz2XPZ4yIMbjomD4xck85I3K5m+BzDy4GLdLJojoCzFVrJmVPpjI3ETK0HGHXPgy+sPgwMJ9ZxyVuJ+MrSvjeGed8xGS9w5d05xzHifhpuxlFYAcjnrqWi5Ok81HczHRkXPGV+/OjBRgBTOD7w0e9N3C55YwYMn4tZmzec85d8xjXyaurFyu6AxEgTDA94mxcmUFfhJahHCjdD3hBlVgkucNb+BJTfe7KTAuQesOv5WQOZJgfDEJuNp1Mgr6ybemII5PUvg3YvJgeLeVh6dkmma3xZCiYWzPo5AmFwwi6Tnr0dPlz8YiehPwlhUKMkQskkkaRTPs10aWCZVybhd1ji4himU7oofTHXnOjOx9GhjyZjLjqBpCYO4xM+c4cfwvZoaySx65XuaWGIX618uPPwCw7h3Ahzt5kkoa0O6vv+8+hj2bjjE6U4kTPwYhwzQqYDPi4al10CuUdeATTJo/nJFk1CtssYUybf6adK7ki4Wq85IEjvRYK9MQI6vBhecPrG5A/zvIOn4JK0dFzU0NE7ofxVDcnmyp+MI2bvRN6ATeRD+97YX4yF64fpnxRkjgAJqDpKLgiZyMgDdYRjj1wLDjbAw5usq5ubg4xvf4TmIsyimVsbH8HgxITKiJk7PPWFGOJgXumJ5upfneKbrlBvE73e82eHU8mYZMyEMs/WAS6l+s8ecoBisvcg8Q+d4nl+9ChkTw5iDAVyOePKnnLTu7Br/swenAGuKOMe1zSHjVJy+XLAuh5uAFXCNEsPe8POI5gB0ppvliDMRjo3xhAyh6eNTXGIN4JhwMcPzGC73F3ngOPjcvNQs/O78XMfDWsWuGgZMX1htH4/TlAYwYbg3vGc+V1hGqnzpOt1dBLgGstJmeW7U0txoyz2esoh9YEPNxRdxCZj4N8/cvwv1ZqaZ0O/gwjpkEqmV/3NYe447gbaR5tCvV86wBbkpn2IaA9sB7ym5A41VZu4/3j5zLPRywDGdxT2wfCx5WZQYIANXiPLhsjd8Qx4uVEzKGZjcA4ZR84m8tPHMYSAw7PhlOym4151eRTGYW4JNPV7vnbvzguYrrrHSywAzgxlgjjzH9mQQ5LJrCP43e/w7sz2PeS+c4aZNgw/il+MDE3M9wzbvBcdC9wQcp85d0u6WBUEzsuGVcl6ZaMhhx3i0zER3Wmc4FylQwb1YJ3vnTmSBujhDw5uTFB63Fwqa1xU1ctbxIM1WwwF43gm840qO6sjDm8vTgK6w+ob5jjawzb9/hRrvLC0NRtBjx4+NKo6wuZAPkbxNcu4z6H4XhA8ZzwEw53MKGYxlxzNEJmxIZXgysLpp/Bxmc2G7NVI+8RO5cMACGMbcKBhF9NAwhkGnxgKGZZxHmiTBC8Ywo6F4/1mk0yFAdA6mkzmhXGkLhugLvEHGPOm5xA4XLcwncHG6AzArgoN5p4JqETVc1mHvdx6yhw5+AVcV3SrvJ5LjlPOq7ugmBOEgCu7KdwWBHGFU3TPGaLuUdcZ+CdCe8q64FYM1AT5xtO7bNyA3akJk4e5+rzfvspZpFNyGzAo3cGS8xJMExoYZpqPARjTcZ6NKZRy8MaPcXCqHrcaqbr1Mk54TAeNR/ExkYw8rObAGEiDmA5uwxeWZbYJr61ku/ZlgUNcLuZ9MmkHDFJkHd8IMN7gHLyZ1PbgBx0yHhXHlDX8PMOzqfGF7d4ZXoYvk3DwD0neIma81veVc1OF1mIdNVTMwhun4+mQMqwPetsAjnTR3bvt+QPtuQmn3YecoscHJDcJCZqyBgDoJMbE86Gsr0deZKzujRxhUZVXA4eGM+cOd5MGJN3TWpwAm8nAUOLwdI/ABExhXC3lqKmCzxhqTuDDyNY8jRGaSp7yPjNEMeA4Rus3vXJwwmcwRe9600akfrPQbwnnVZKKziedLlXeiMEwfzvTn0Ya6Op6wCmM95VOOjiQDOjmAjob5TSPMvggbn4or86wCo/OEhU1GcA4GkQ5EA7yFxEiTNkW/O6q7wbJe3LAxDl329NxU0wZgjKBghNb3lOjl2/ecLgDJsX4xuCYcfweNMGFO5FyWmEb1nrMhWQHBmC49MV703Rz5ygKWFAtuI0Uz4oxkMR+2asJzM+e9p7lPnQDEwWJqEdHzmCWeg/DiHX8U9g4OpAHHWaPw5ebAX4b9NB6Yum4x4Y7uAc+hk518U3CmQ6vZkFwTeAuGSYIHd5cq/hu4ZsVHcmOc1RzYrmW9flh/kzkS4AUK5THh9as4G7ic3TdD6M/BmpiccF6zPTMaw3XGOloIZRHQjeOmNO5Vw5inpuYsOYSS+wYABvjuWp/nzUTT6cR7qavLeUdJL5yEEnLqwEuQmrMQmotxr0c0BMhwm/RcWs2nyYqDjuiuPQf4dFLTfe66TIM73npMWdDcmZWse3PgaDhkGrgT5zhUYD88xtbq6X8ZD0UwAcfk5E85nkw+S6RTDrsO5SuWnJitFMSW8yiuEzjQ3w+peYrMsysVENUSt51ty5iPrI2Jk6BuFAjgDyXPZS5mT7jCQYXCMygciEMlyQH4zVWVdx3P4fwmJHJzTVwuB8uuGv3Zkz3K6DJQcP+JrgrM+XNFIVTyZGdkXoUx//AGMxYiJhbIms/TJ6jA2vGG97EedwLI54XRlF0h86pfGtMi5kBXXwZQWZtGmXgcAmKKsPzzkMPKGfimVW5LL7bp53uV0EcYSTdAwSJnZGf54bx86+GPIA3oOKhlzVbxFiqeceV0gDdg5aVuD4dzd8vP66CnqYr4yDETIADVgY2sOqHjLaTdAXCWTpjA0CJZl5lyw06BMRia/jMO8Y4iG4wY/Lyz38EEWS/Bp5FOlEkzcN9vM7KT+jI/ceHAIei5JLkUPZ9btHLH11k32OdQR8MKXYm4FU7pQEN6NzSOaLrGTBEt+GYS5njejGl+MJbdypq6cG5rdMZsZmVOuYL3AOp1GzmE8mQdDfEZjyGPxMPc0fBiPwwa6jxzaQZjG45vZ9ZCA4dSGumBr18RxpogSR09y4LHngMSgyE6YRg5leDCAmSnnXxuoNOHMH1c1LH05cplKvnOWVMSojShNHMFlieWAL4wvGCdKGFMZPwfOuXNwBke84+4UImFfAhhVg+vA5TnfRtH1fOYLFEoxxbPQQT3bui0DdedcKaExVL94pSyfgP1u0cPmn8uG0DBgt0CLhnlNM8I54PjW1PLkYm7zkhDIfJuvD3upcujpHMvluc9pyRuqqs5FzY90XHviTs7yFrZ7iNTwa3CuAyWYFRD3unC7DGh1hOJ7Za34ZyZJK3LBXoYEwR50yejC8d+RvVDAO4YXIFmOnehouFUcDY4+yyHrD0UyApMftgejvk5qPjOmRzzgM0tKt4HEU3HKfg0sVuSTQpqWNSfarnAn8QcgXE8O9dpK40mpzlj/eYYIgoeMsvLNyWsTczKdD60nTC+amtvm6wIODz+rEoAnz3B6IZRvrlMINX2BuLc7DP7G9rzgfPd0dXecJuBjIYkKNRgEdudpckPcD51gcO8xiHu8l7N4TJPkLnyxnLcMRWM6D43MEPo0COPPMg8iOEII+U1cMamCo96ISl1RamXOVr6M8OZ/IytCOcSOKIwHvKKGUHJRuG7nCy0mDEdEGdwZ51XY6bVMRmE00KaVd3wTuUSmWNfwm1zHPc+55PUwm4mDj4YEXD+8MrZTcgYgOF6spQeu3WoSDNj4yVGWGjJecvAzXSd+MxDDZS8yPX940FdY+C4mvnJmWzPAYNMA5dfxn7SjE/fndYcBOJqYYIGCwEx5AGF5zdFRjoP8ARr8AgExellesz+SuSIC5VKH3h8gyQcVUBjp6njFAV7gIo/W6UC4F4dOHIghnj7dAcjw3X4rI3OOB3MBDmH2YoOBLNRoXkMPTLVg8EwSIwyZd5B7E3bwY8Jb1oXlgR3udMZTIDDHBHuiBqCfgJphya1X8S/I2XM4YABT53STi2LhSiX9ZitrjgW6iHNBzuf6xErk3zE1URxHlhhHXIb97xg41PX1dDDdWvjiV7mS7afJkme2AD6Y+DArHsY16QFr5wgdJJLg/LxBu0K/TXPcYxinm4XMhCY7N3dLn7GcOadmiozwkmZiwz4ZV/l5TITTa6SG1Hci9w4W8menHdF57MwI6uB5mk97kpqGhc9kNcSV6wxc3EyWNG6Re4XRxGM3ofhiXPORUQcRjBkHwfrZjALA1pHMrf+BTG5g4pP0YkGq/q6Br2x5uLgvWBNggRfi0MFfhMb+XU4UurVhczhk8Zp5hNqOjPvXI4YQ1iAZU5QJ19jnzBDM6dmhkTAABlSL3B8FFM4qN7ywVXlkQnEqlyF8tcDdpHjXUryFzD3mCebkIYfI3oDCq4LnC8mS85r+TU0/Qc1g+MsqNdBawrJ1jq1q0NcOs1kjkSBmLuUJXABg5DzqI8YqGqQLq7KM9Bcs4oI57w5rW3XQQ+XWlamV6ZR8JkaXJc2QyRr4jJZAOhbgzFfg/gXfPOX5RMlLzi/DKGZ+cyt+QMWVqfSZVJ9cud4PabtB8dDEToPHpzv8AlrmNIv2qW6mtVcAxZ3Y1cC4Zzg7qB5Y+esQhvFBF9ZrXNA7LrUXA5R5HBdF3Uq3X2yAw3njBzDNSgwzqZi6jl4h0mlGIVYE859JkMmT0GfvGXCZpS0MfacbKuK0vHWmE6ZVWZBnZhj2O8t6HPjHQxMYvjlRZ/RrCj/JkLBPI4lhx9YWEHLV25gkfGYFE1sj4ZXFH4zRFixMNG4snuE/JwEC6SuC+B/AcxGNjGDIPRjWYcaJuDj8LoXOso3/sDG6BlD36OiATEVvItT6FmObw6TCtx0K+DABU8GCHmv8AA3GIlKvtUGQbSV/BAF6P3id6WKADuIDvU9xZtY9diA8e10DHMIQzpTD8zu6WGdMx5pPjE1dExWQHBdpuBDJlQvhqRFzU7I5Ehw3hJlruR7Wk+3fFM9O4IRNfR/vRjEy5PUx0WU8ayR/ODGHEpT96zZXY0zYcvNyfjdLxAxkFc9kd7jHRNbJjuRopgYUXw4E7gOgpuYcuevo4LhSqs+X8Xjgv8nRzMOLRnxyoOuvvnMd0mQ1zZkz8i7wd5OmHmqoXZKs6fzngYtxnPj9Y4OxOZUPJY7Blux5BxwBmUUZfYfWR3yP0ejPlNZjvA4Qgl6ZGDBpjdGi8QITlm44vmR3chnHdPnjuhNFrijR/BgGcXfwYG4CtOTrFzIumliM1HMRNdpMY4Yr4ZgSdXb3KbLnoo4L1YdxZD5GJ291xjN/Bnbj0ieE0s6PnGfOe5qUmntYKVeYb9Jli4dHrPsJmqFkQUplmjMH2PwmKdrxwVoTQ9GVSEc8+SaGE7hiTHKCZa33i6PWpVz1OYvtNRRlZTC1jdyc+JMPLjLNRMnN44d/AxU/vTFJGl9mH9LQ6J7d3WD6MI9pO8FwMP2fJmdF8vrc43yReYcPhvYXE6luT14wT2aS+8rTxvChjzvaaTBZL1yODI+MhPKzE3rMUafzlFDI3ZXmWznh+OBsH3xsuIermGMw2eRRrKBAP3lFZX3qQjzHkjEDywCqyBQ6CFcdBjAKrrFQPqaqKP1lQXjIHHyauXXxlYTTyGLCBPrMip3JqV/WTsDwFc6x8IcaCEfxqCQNQBcKhu8xRwumoZzRF8ZBzybuQ6197h8c3d3B7ZoE7yMXBJzEi4on4pjx3ZXCCaZ/A2Yc/B0Y29HLFu2umkQ+Q09P2MgTieCWeRBeO+Uc+IeXAxAhlI1l3DCBgUvcLFQMJaI5X2rzDCh4ZT4zQ8jkliwQn08DfUxUAfLimUcD+/wCsSYjlJAA4q3MB4ndBom+oRuzHDUskVXeCPMfGGnnKECOLp/w3DBlfBvCO5+BMBDiE8ZGRfGXk5up1cKLW+MBCHpTJcVrICM23xvHemin+GTvgcYdcNPNM/drI61r1a4OTOUG6SonUe5di05TIPf8AeQ+J/nFP8hh8WZLzMuJ3nB+N3mYyYhhTGH4TmDuC5MZ+f3f+k4gDlwoY52mAi6PvFOYfRvPKr1w3WZQRZcIgSm6oaa4brS7aC4rsbxP6d3AbxgJsYgUbjSGWwnDk3g+ncBCOnlBkARhxCmhffrClvnPuz9mMAKaMGZNM0UZPBqGk/EX8Z+DoPeC4QuR5w1mWsT7rlAk+zdEMum1lD6A9Z6jM4YFlPh3ZT+sZYjgRz0zOG6h4MiAjiQY4FpP2Zcmn1kCS3GSecpx40DuK16xX+Wi8EJSGk5D9ZN4OFRsPlcyILijg3irNDGS+G6BugmhcnMfieNdzDzP4GA91dCi/jBI95p8JhvHXC9yYBuTq8H34De51B+90Dno59BmGPTYa8UxJzohE3Y8dlaZCxk3l979gZs87oN3ELBPzFXMbkeNUxt6niuT8QbtghnAGPEuEwhjoYPxij43fNSku94b4d4uK9OaQR+zcVPsYwZ8dYcv7Zp0jTSzNDwUyBkmxJqhp6x83NwVkg3xNEADdFFxdQZ0UXTBgxib73rfH4PyOZdyCJm8btc4dZnMmhlaYw5881hqv48vyrCMg+pm7Kt76PWT9GoM85Y+N626Tn+W8pNxmNT094L05LQ4BmnchE6QCJcgGUTAoWXbJiMGEZ2ZI7VzfZoeXDR5Zro1VMVAsTTa4t6yK7iXNjAuYGF+EfBhPMolmGesoeMvnBOiB7vN5fh5NVXyVxCgYWqP9akKf43DAb6WIToHGOVVh9ZIEf3MWU/zkeP7Gc4Uz6S+t1T/reI8fDMRez9YiHflMEoY/FfKZXzpPyOA/mrdHRuKTJAxqOV5Yp/Ads/AAO5vmBpjOfkMiLfxAp8eHNsfZ+Hnmqblve+gaE8DHFTC1nl86hC6NW1FCYc0ERx4ynYZccJgVjfLgQco4F5Maj3Fa85p8fgJB3HjFwfJi8XcE+cS97lYeNjXemcRHQGZhWmEYwh5g4v1uBrNxq4+6ME9H6yHi4KwnEeI1nkZQ9sUhvxT6wDeMTzrfeAscE9P60xBhheO4uvbrkiFzqOAmwd4cR0MaadTC9s0hQvzqnGeeYU73zuMKtE5p3N7buW5Rh1q3P8JGeB7irQfPT4wJQ/TkhMCeh4ZMRc9YRA7vZ1sDYHKx86wnZi+Xn4yeRcFcWvwb4AbuN+O79mdkbjo0C8btEPw5iUZcgNEAf2zPYccInp14Ex+ozEcIlZLOdUg4JWCa/AIYH1mQz0aFmWQ4vrC74MDgvvBlnpMxOTEehxVhjOwNR3mTzo8LgUuwQADKrQuYkvxkVNA760BRA8aPvHBq5HNF85Y9+Ys/ZvGFx4JM1hvAY3gvHDyPMB6YkAb94ivD8mfAYVrxeh5MkIYE5jsevw8csa6697rzXrB2nRuXyUZVKPzlBiOi1k8X1WeesnZ5HHakdcw5hLeBlSw3/wAzCofPNSg+49eNYe0/y73JswhDUCc3s3EUaiO6bpX9aIcuWG4kijERiijkBAnp0WddIMBLiSMTP5Bje4w8BkG897SYODzEBMAHADwYVyNXzmLyfxEnjouuR9/gfflXyM0d1cCyj96KO3hmAC8Jkr4aJkXlvBB95G+ScGgeB1UmkgFHrxknRcizT2NJQT1jxjXYblV/HrAKJkuzuuIwxyFmnD6u54hcyqZDt0Q+ZA+eGlbkOWPkYHa0zovr3n8bpBvaMOBg4Jnzcqb5km8o8D/GITqh/bTE+UX9DcJX7f8AeNQ8qbvFdng+zMMSO5XxqZuVOkk/9fZx3IkWn9lXGnsSsVZJkfm+XFxEE/eSqeezJYEDCt6fPrfIY/EIyPJFMHkalUXDEHKpx94y64Ae9XS3KYV0KYwZOsACesJZ/CeTR/Jl7kcSNfxhHwbtcco1uRFoDwxcjMPGQ6Y5H879s2MIFGKfd56XCAK+d5tx+xm4lmOhZl1yG67P3jaA4p7Mr2P3Zlb145ELRgPD1kL5y4hHGRAND2aulvkT94W7c84gKde2H6dKg73GkRatETzo18vN0QE/jSXAgmqT8azxnId9hutvQUU/vuSlr86WvoOfzmoEHdFK/TjACVv6wPef+D477In8H/t+DOI8EfL7+xwsuOvgDXL5dn7kyD+fB5r6C4QFoKv2e90STrlZefHSQYX8/bn6e8dePeq/E3AmA/A3bmgTsyAjDVrXWExxwYYBozEd6/HcJeBuFS5AR04A3d+NLLqhcJnYb2fjBccq0dM4l1JxNDo1/ZkN085l6LgFTnxmngtDDwnjWbHDo5aVrX/PJmOKp4x0OD5POpcHGADzzQg5CTCRoZorX1mHLupcYuhoeTIPDSsx3NJeGXFZlCLzBYGGDpuMqfWUDBPOiqwpqCcfvEDQw0/EN2szk+gwKg0U3a7AB7uQ4JP9Ga97PpzaMw2SAezrpKIofPMeZfD/AG/LuQcThioLfB19L3ULEl8/Ov8APfzwySW/H9G6B8tfGBw77OCnVPrm5VDgQK8MkYFd45kL7cgCXWosB7XBh842es5DxvjQxuIh1qeLl48HisC6RuDeIY7j3lOIzgTRxN6zS+tPxgbpO5R85XzGAKdmcCS4b7yfPZvOWNwAfQwGOYDTQ3gPnEOh55MMGW8dfbMCtS9MGoBIPLmOjdXVOQ6kRU8XCpwP2ZqMaeajk+NMdgHEPjiF6wVMnTT73gYPycpPLoZ+hwMBU0wPG4kJkYnp7xc6XrGVT2MDX8GWfZ39ZEDoeY4I9nIDfl/9YgnKh43lD4Tu5PQe/wD64PKyT1gk8pU8u/GZ7nZHzl6vy+Oc/wCsLETi+PHoyp04Jz3uz4YZ14U/ShqVZ1xSEuic1GEzGFYsz2zEBphPX2GJcgYr8HSLhUcmiOjDCZU72kM4+MA1eCapo5cFch9O9DrifrEzfkY82tPOPl1fcaP40oX7N1pNCEsqh3cJ8aZxH61EDAoPU7h4emaMwzAMzkhndSHOu64WcaL95Be9NzDyfF73Hgi9fgCcDtNNoWBea/H4RCdH33x+MiBifpjhJ/GLsD8mTOV5fGSBPWVvTThcROmoLmo5XQecfqQyJBHkj6dY9YmICfIbr6dbX93DiSDWOBO/E1+TnA/jRz6OJ9+chRPa/wBZ8HyVPg3VLR8vj2+cTXvp76ymXtV/HfDv5Ad3QgQHfg/j+sEuYgPtwI/kuaOaRVGUBdNH1jPhM8cOJh+JTE0RMjl3yMxTAZ3FFp/FWLyZ9BJ+9FDjA498GXeTVySrGub5HH56yLhxV3mF1vDMU+Pm7rkvj5yQK16GK+O4GG980BSTV3jP1d3pOcA3kI6bymh1MxQ4E582VCRyXEfZkFC3Pn+qs1f2/ePMv646WqPTn9GC5Dn6FyT1TOea5B58esL4XfJ6wFbkuYztTKNXMK8HAfY1m/fNUcPXa5TFPa0B0w8juFZ5wQpz9atcf4ueNN9NeGs0HSGnUAnX2szbRPs3K8hHdcgkRZe5N+BhPvCj4L78u4xTDm60e2nvIMxed5ukhh74cJ86OyzjEiI8Mo4yjMeA6oV0QOOB3DoJgprzCgdxMLhFuLwcVsMuWm8kZBOmbc846t+cgrcfjlZhGkcFgjjdR4ZX1ovGDxVjftuJ7gkDV4FuBULdvrKl7YPGd5MmV4TUjhoW7062sUfGTMF8/JvMJbdwCQXjB7cfZx9EcpntlIsc+K+cwKpgLhXGMw9xKn9mFfpj7sKQwlI47UuTyJMgIPTQYByHjrIGYLxzJGkDDnJf/WWor99mFj3AuIBet0R6md9saC0ByZekNMp6m46OvHu79IX1P1lQQT3w3ZIJ7e1/br3sh/brEYeOvzi94zz4sJ+5iVEF6wGsoRlOf2d4kf5XD8r/AC/+2QKp68P73ZEAjMta+T5Gj14Omon1BouKhkQmGKAY8EeMIZnjNufMZF7cSVU1/UwF84CRwFZt7/3oPLmVyvcA4jvFz7OQeugaYPzhPf4BByzBK7oTuZU8+mQ0fZmnQ/WMolw0Q4tRncGANDfKGp7k12nX4NfBdCTv5xfR+K6KOao0j66bra+GHhGJgDQMrlsXTJix6PvNge6R0CmU9g/rcCQfebDeZVeXcgpNYB8O3UT+TMtnPE/TlMXc3bFkVk+c8VL6ddHuA/GMAs4h+ubr92EBCp7N5Wdjpf11YUFDp/LoEgIPxngpKIcuUrynG5OgvG+Wapk77+jDFrt+twwVeCTKDoP/AN3OfiBy47tUK/mB5HKOEIxH4vziMRwc46fIsN07pwDCjh+cexwUzvboGB9ZBkDBzL3hvLngqaBvPq4gQMZzAY9Txn33HscopcA/Djy2DLqOvvQ5CaRUIYPsYtW/ehofLINeTzhsSPZlAJX5xxRze9nMOsMeIX7wpbyF6N4RH4ea0s+r53kvR5xfDjhPH04vZlCNfIjuTGOEqgdHedRzCIOLJnGnJ8ztmRkj/OdI5BJ3ElHZvjdOjgYI5hBeXxmEeDAHILE6L5zG56yjGEnTyEJcXl9GXa+xzHPc6aYfr7d3F96xTMIDwW7yOJ/g/d1qB7bXh65VEOKl8HrIpCnvnXXenx9TCiqyPY44ed6vdM7+1wmdFaiPJF/fnO3XGj1+TXJY7XJhhFIOPSaNRw9V1DoSYcFzxqMTdQmM+DCPGA87hx1XNY+cVxqmQzZK1d4yancJvpk0iZ49ZMMB7NQeic8uoIowhdYV6NDJHgl3bWPzjhgPjGII5LZF4fWFc54zyhv+NzbJrWZMYUsAUT7xmA4q0MBnWil8ssR/RzQlzcFyecsDAYF7frQ5ImHyH70YetclDceXDByNXt0Qly85YxuJmE9GmAkD9cYXdA7aX9a5UAfPMB1fGJWHkunb0aAH5TuYk1dPd93eTC+xwV+XAGmCQBU/0ZFSfK38IAeYwp50GpZrGqKqkfY4Y7DHQJ7ZzTj1+zpg5Kf1DknMvnA3mA35yOMNJmNz1xjVh5/BL74nS+WZ+GnvXQ9Y+JqHxijpk3w5kzrw7tbqnTCooPWVD95iqci+I1xo5h1z6VgTMAPthUTDwtypYH5mC6VH1niBh1X/ABgHd7fnRc3at9MuX03Pz8+kXCA4poIvHM4AuBiBRwAF6FGXd3U+jLaIPEXB6qUfJvAHmJkFaZcq+nHgHVxHkpgv1uwym7bwYnRSZeDAnUVfm5fiBna8+E3Q8tDLPrVgM9fYZsHJ/wBsQCOPHy7l+l3hMaNToFul4zhx5zfP4i9uA+RQxEPAH8ZQ7PvXGBxcTyX2YqB3H3rBNvckvxLMbJSZcvljn1sKdhhP4/lwb4nJfgKPW+XJZvet9a+2det2BqiMc5370UoHN2rktV/vMdOmbFIY9rNAhv7ZnoaDmpO5HhighnfFNenQNBofCYIv3jUmeww0wJwAIF6+cAfI3mt/WWfQ+Z0Ko+s7KNPGCi/tn3sWRrJQPE8DhWg+z2ZRyH7cYrx7MkUfDnhaw7vOZQPM5gH21N1FJ7/0XSipAbtAyk79mAS/SejMOBcz1pkC4/znsGIect4wt6+rgaN0p61qet0hXDMeG+L1/VlqeTQJ0zeiZULTUAtPoRpkNefXzv1D00zceGT8anWawwPtjSxhpVzEi9zzzlAXuU8TQ45Ho3H1kcyeDcvg1PrDrkXTIheYVOuTfA4AjnQD3GiwyQSu66Nzei0qM7rWj467IPDeREfvCulw8Hb9MwF5csobl7O7ylLj4nr1mGaEcyODCVqu5z1g+BsHJiFq6kXqcKTXgjJonneOs3pjUq9LlZoJcG/g0+let4+Ce6OPW0tL7mliD7oVdTBlT9nRwu3WempG+fMUDGauJHzp9IGI0npjgs/ozhBD8zFF+l8OfGXpzHncda4UZ631nya743ezN3M0QXt+8hWhF9v60PiXEMMi5whi/RpGVO5r1k9Nyw/Ln2anA/O77ctT51YeU1uX8H8AEecD1j9Y/BkOMTAHbphO43DAaphAbgz2wV4HRDchN5O4vMU65QqzRigRi0kMhOtCs8Y165UtP1guW/4dJ9WcmYpVnqGPrRhvo0giJnsZPRjQetQLZB9OiOXH1dOEjpPOEBQlvjIULzuJqTvi6Wz+twmjEWJK2rv4vz84ZQzWUddTEqY9NzO9ZTT9mUoVXhpVqKeuBnJ+AatnpX48E3jPRNTcnaNCNfoauQPUxZJvzuHYfvIBWQavR+zFKC0X+8OU8KmFW51mhdBl+N15PcyPsTRNz1mJZnO7eNB6zZSb5jA3R8yDAPvKDjn6F3opuOYDR8YPGIdXJXxM8pvFJgDQM++AMpef3qo3hh6LCD13LTmhTibkQzQ5kIFXFD83QL5zOGEnO5p3dGSvPnVfvng1gT7u6Cn0ZUX3etDBzEesWAP67nb31c9Ko+wmUCA8+lzeOikdmpxZ8uMZJZvBE/ccguRTwVTrlyStfou9Pd5TC/W/QuP8Yn1fG485b8Gd+v8Au4CNLcV+WafFmSe8r51QXWwxMFe+IPf/ALGMo0Sj8jk64jMRVPnw6EtD1koSG6pZkjUcOxPTxLvOetMl44PpTK4MPMYMCcEfrCWUePh0x9wO+cHCIVMMaP1G6F9WpqcGiOnw4N0NmfFkHFMSw9nUYYO4ib+MfLA+RjXY46zgK99yJiwCv1zQKX6d+jrDA/TpbYNw/reILHEw4LNB8mlI5Dru9th8F0Ih/LXEblHjuTYnNAuGszOgnxvPmn0K5dHHvfsNdOs+UguGuBvft3Cu8OCZ0GXBnjAwhP8ABjPCU+z42CAB6kP8bu0A+DJSD8OFquG+7lHlyJ1AWpgKKpfb6Mr5Zo7isctxQ3DDRKz1gXkB9vq1y8gs2gkm5NMb2b6rVeH5DdgCXJMHAjk19JkBhL6zfJhXpnj5UuFWry/c19foQ3M/KRXd76wJg9efThJwmoRzo7x0geNXwd/CjAoTN2HPwBuDxvCXLbXFZDeeUOnBajFOBprJqwe8ImORN0xQ70RjU4ONDmqcP0+cd/wbg8nAF1uVRenxkKh8DCoDX8B0LvAAwL4x0OEmynA0jxtcgfGODIzdU6FcLjr3kQO/6HnB8+Z+rjOPBawyhIBVfrK/5wD9R6Y0nhBYfLj44bzhf5yvn+VMroH5g1geTwOGB+0P9GVn/ApwXbK35XDQn1d/owKVz8czVec9DMN58xhM64TeI/tmeGRN3m4AY3+TxzFsaPaPBwnM1NT3BvgDgJ8/G8KA7jD7s6mM6g3ma4DUUv6wNDvp9ZXTTRCGonjmF6KAk7iirVchRzfLE+COYlu5O4KNcWUR3nvnhFlKvlmC9mQY8AOSlpnxvPHD6CHg1jXmkohcwoW6ukce0mVQKfWqkzAOpF/s8YBDV/yfGAF6D3kFiJsAlLlc8qOhCc/GKf6sdOOAg6cPkL9GCKmPic+jvdXenSriU7zVoaJHlytVO5wEPDV93yc9z+P/AN5grH/g/wC8sWfv/QuMIx9q/wCsqT+E/wDvLKylhGG/zbZrfOj/ANBnQoXh8s2roX88x2ffH4HM4NHV3TJx0g7ksAdvi5WBdpHeZ1f+tBlvJiPDCmJ8RPZvR/z6DlNby4odxMjt5lBAfHnz9ZVb8FS4An8iGnK8TeSfWfwCSARBR02JycDjnvoB8nEmNu14fRuBJevU0LGXerh1WCj4kyPUX4zuHuaUiMXBGiXBMH2vDUcA9ppWrfTNOD44Z56xMOO5u9zL1llXl48mSg/aby/4XNBnfscmGH9g46GieBwu1G7b/XAs67qPDzjycOqnv2m+7k85Pa082YSHP1TWRdP0mJ8qvq4flR4fWBEVfRr+OZ6zO4GOWGoQeXKLtmCvjmkkl8cxRmqwwCMMiTLe1Q/WELG/2c96o316ZkXxfSYA6Mv6dPomfeeCbr0aybhfWdr5DpgE9D6MxP2x9cwu7p/jLydM3IDieTxSb5r4sXp3M/Af0atec5LVX05+upugdMUlwvnIwrzEVDnjXgQPSzywoM+DACQIRR/Jc9p4jeA++WaulqvS+MzPcU/0fWfmmMpPhiL99V5frC1j7QgLmUNcmkBNYxrltF4enRjqil6Pf85q1jwFPU1I98kxMLffeDD+nTltAe9j/Jr8T9XD8MmLHEhuAbCwztSM+c+GGrmh9nrOeOoa6pgfeP8AfDY5Gd86pEMyo5KYFw2weesQFr+bgiyv1kRW5NIiYbGWg4PrPjHt6NPA+xzPszCMAfjwxMKvMMYOWRf0FnJcPam6QHvzhqYfHd4q3IbqbUcvmXVfAxnv0TKs5RYu8wbhyfs3klkN9HJt/WuGFgaV5Hq/63m9kGbe/KuOr5fwOPysXV3Tc8rxf28Yd0DotDIclzH0fFyuM6HMJP50uh+mcp1AdHeIeFCb8sNQARbyThSItYsPiZgHxA1e9/Hfga0J8q2K4/rOlnh8wHyaii8Ugvq7nhE5RG5BbQKvFxXZuCo/TlKq9nCmIDjBOvgYF6kNtIPoyfAlECzD/wDeciRHYvBqykIGLCXAgrGAKtU8G4AYhVu92j3uBuJ2uZ8/Ee5mMGzzuxT9hhyVxHqwXwmAVB3D5Zv25ipH8PO+zB4By4nvIYSfrPyRwgETIV6/eokxhjqXhNBHRQjBMLvkuF8Bp0yqV8ejHEiacxwwcc4zv/VlOnw9h9Y/wz0H/LvO68IXeK3d2/NOFr6m64eAyoU1bngPA0o325fkMbvreN0srunBH/HdSuM/2HIfOGrcJ659x1LoK3vdVstCw4QcAgHA7VP8ajCI8D4+8lg46qhxTAzrn3iH07rqSAC2+y46gVsPvndQYNiWeUxAUTl4uURR0/vAggKCPl5H2OJeyOdp2rDFyRyYD2sxPMfmXciK3pP1ixcjz6azl7MAZNGeP06LKakwcgEDQP8AZw21fXTBCxPIW4Re/wAStNFfeT7fCctwwG9W8JAwIhTBAofnuYSA+tVMtUj4feo79vGmgQedlNO2PqpNZUjlI5LIE9S/6xt98TMmL8bgcOSeC68Y+vDb0JkxfSmb9r+A738QvV1VOsFzAPd/reSI4EtDeXinv1lmj+Q73399a9Ho8ufO3nytj+XjzYviYcTE8zIejXBj/Jlzkwz8lh8jBjfH6O7zBLfk/wDmpEb/AKY9qqw/rybh53EYxkHDlcQfRiS6Kg+Hlg3Mnyx6fY7uAHLOZgOu/Vbps9CfxOaI81pwYVWi4LEfZgYHXTivFNDtikRE50+XX+PIhCvjDLF8I4hULjTjdY+Aa95tPQ2dvrniZv8AfbxT6w4VTXSfamS8gK+6Lb9ZypIjeqxPgVInMckEl8y4KqWivTPKgjhNA/RyRJ/ndS18m81KPrFh+WFvMKn0WPg3LYj5hA04TNAiFuizOfpmnMClee/jNIlB3Kl+U5lHSZAQF8Z/sPeZ8WW6NDAYm5obn4GRF0js+3mgKLVFi8o5mmCcfO61qHk1mHiSMPhztY2ONoH9718fw4Hgvy4c0B0bxh3r2s1cjwDcU4bzx1+85w4eb2a5zrh/KIYzCiqgb/efzYT0HXLsqdjyvS5TYK3+wPZmZ1+CrEh4/e//AFjMIK6nTMDeADTw44uhKtXhq5Jd/sI/4m6gBerR4/Q9ZGIaTa1y9NUDwHhHeHnBoU96RLAvxR3+He8U1QL2/IyUtPARH0zPuhCihoitr3+CYeI5Ude0fLnnC0uf0E5pbdOoMZqmN4vYzu6ED9jHrJ8C5H/V3A9K8hIaM9Y1SumbOBRjl9HDlDx+zBi98HuoGPl4uR436ya47PFdUr79BlsqcKDbqxgcUxFaBOZbLPjPDGmiB5jAPfT60BDyV8HvKer7HlcHgSChh36wCaHkvEyEcfxd6dy/LWbunxz5eazzfWXV3XiAK4zQoeSej7NIR7o9cczHkvH9/GCVworzmn9F6dZj06wO/Os54GWvxgEhYWeLj7xc3xN66frefbvKvd69nJKG4pMrfxF+DD+Hoa66YYYYty6p7OpC4UsrggV4Py+kczwA6x/t51YAxTiPhBS68sHigfsxORoOWWy+vrELIvrNeQCVhDys1PAS5LncaYVxpH2MTjzrcApFKn3OdzDZFLsPynXAPArP2jCyYU9B7CTjNSLXXk35MWEKHCBeIbgux4+e7pgEYFgnKsd+j7aJ7nnRbX7L3enKF+Txrp19+BupK+UPBmBY0j4T8voTC2lsKCZLls/h1pFV3YB/OuHlw23KfdbdRQewZhZ9VfGO9V/BlHwOfG8HXdRPWNM+Gkr3gabrTobqnNb2Z8Ff3wMGT5k+t4EefPnDc9/71n4S4sGGn2By1Gp7dFJGMhWJnvYna+JpyJKCIv69Y7kvikBP5wNDD2X6A0k6ILzt8TJ8GTT71nGgg9Dv96Y3yInvcy0cTyZX8XPlD8P8DWu47xdDLz4PM2ZYa+38S64cYx45NMfg8GB4zc+YT+AN49PYjz0muAi2yj8HTtI7yo0a89vC+zPxcAs0NZBBTp8/Pzh86QK/x+Mupd6H+kLNBNJFgqMsGE+u7h1FuP8AaK4ksXJQvZPaZgxKDXcsjuiHtojLrXPY0mQBrE6E8H6whBehxY4m/etgIhnlTy+Fxwkqw9ezCRBYkWvWMTBd5Uvifl+DMDuVWR5RTCkCDEKfxuwqFeOkhAMbECie5JipHg8vck6DU8Cpg7EDIcO5kGY2L5m5QyKP/vSKk8+73JcC+jErl6fDiTPHlhhCRpSLF7izzrZ5daLzitf3loD5l7kDjaMH8y5ue+gmPv8AS6BYPry4Qpj351J2/RucdyAB8sdW9A6Pi7zb/wAF3siANSRqpPcAblpHwn0chzzges8fzq8mHwGVF2+VXkcJn5xJ+v7/ADnoEutV41zV+GE8zElG9KbwG8h+VU15DDhzqM4xnDHGSYCz4W5dfAfC7qiGuWj8mDn5V4XU0Qj9sOjZHztZJceg8h8/vGDsd+LPBPemQ1X8XlfDi6TwCPnAfLZ29/GLNHUieOTBUeUn7DLCJKX2ZxDyvV+zuhZ9ujyp8zQQI8UqFx/vLnFSL4eCY3C18h9H+NbL6zpqZoR+Z8fTD4NNHj+d0SA9F8H4HV+aNnEe+tN66pheWYPHcPwnqjw5hX8/iHxg5yAHmaF/MTHmixPtVliAHpwP6UAK5tR344KowpE76wQ8MKyYSyPbz9N0k349YAmKA3UPWLrHoMfJt3kIvWu6OfksAD53NpZB4uU4vj2aZgMjSThX1T5yElQPLmP6zi6wsP2AzmN3v0+8g0cQYTyOMM+KHlczjq1b7zb1HH7yM0D0ee4Ew4qs+9EffWrxzH8CXzhSrKr9uXcDXVonWh04jm/H8yec0ha5Er+FVXCfi75X8G5wywfgr8DgeVD+cTTyj58WJ+/9JvAHFCCDc+mOBb4yp9PHh31HeTd4uv5NxycGs3krqxOM9RzDtV4P0fsyQNVPs+NadVT/AEmder4+2Qvv6dzg0pIk+Y50zSBDKauI8PMkDK8dQpTb/GPOH99c/R0X3U3SIpCXwEGkaIXs/vGtVg+3yuNG5iLwdzY+a8H3npqgcIaV2hLT+55xXSeSz7+zWNu7QN+nONux0H6TTSYioi/vKIyAI1c8AzqMoPMPDpmNBgc8z0pk1iBk5k8IUQgO7k9jLNYGs6s2ve/GYXLip5OAPZQP5xNKXOu5wMHroWeAM+93C/jMByrfiYJSMOuQyKneet1MPZujHNxL1fRy+tYkXr9ZvCnxX+c3KQce3VwTvvKFT5GjOQQY+L84OFkXJbUC0ex1O8LX2fOe5zVvGHIHuGuvwyj4MeGRNPh5+M37m95MkfGVrXjcbFrmkQoeZ4xo8gxL59MvrfJve9GnNI5zC17Lhy/ez5Xc8qz1cp9aRo/616AcIsLq6svlGP3zTlQuaUPzMbC5H3M0qh98sDlRyUpPM95YCbjUvs0f7U8R5Uz1OoFfHB1iT875M51bne/CuLYe6g9vPGbHrQdY9Z1UuoqT94QJnKR32znmpAaWq1AJE6Nax7w7GUp9GuqksAzO01Ch/JkCiTFKMTHXXFSnthTgC8nuEyiW8nb+mVGgVJ+zBWnW8I/f1+t5nsAoDNHlCubfo1kVp7gD8mOiTdBw5XisLdH6wkmp2543HAhO3HqCeHuk8qF0wlJhZB+XKT0D68rmgXvx9arIuv1vHl/Dv9A4Dm4DMXnkoa7lB6MiIsh840Snl931ix8+z1jkBDUC54LEuROFj2TDwvVHmvrA0Cpb94kgeeyUMoBgvZr0WF8uPLj/AIcDUwB3xm8DveXEaDk/hR2XPyb26/avkHnMYcOG8gE/fgz7Ue9ccAEPfjeTwOZwGDgwLD7HzuBZ4L4ezJ8AP68MsRh4wx+t/wDLJ8ustXCNE96w8RVds7ClzERQjU/nmCfmRc8MTffZIL1CNjuQSEat/h8mMUGwLfoTBbgR+X9Oj+MQOw+cRyB3q9e8C4M/jRXryNPvEMXJrX5LrxCYf7D5Y2W3hi/PrGD1L0H2EucBU7PT8nszXUPU1fY+y5QUAQGD4SaJrceHfmZfSN97jIeTPUVfj6XWUBzyD9fOBdMVB7eenNqJCH6i+sD1dWa161/Qym6fF9YSvL2I/ZnEdG57+YTTSjE1iKh+JP7HUpV6CGre5H94YND186qvfXtN54/qd6g8eyuQ/H3hzH03pBf+nGIBi5c+WolOUinTw3xgsN0k5klvbg6lDN9K+S5RcehyYlPF+j3pqid9s8aIuooTdFwwnyr7ytBO+vwTLbz9J1D6w3HyEee4QvCrxwai3iz6+nckPiHOmHwed/8AWuV0A7h6/CM5lXkYp4xL4cr9Zlx4eDKQv24iA177gBvfjjzHWsPzXuuKd94BqFA2eHdUG+KvheYcBL5rjK9OpDMYNucVOU4lug7OmHzTeP8AeX8L8Mxmn4BftatfBFaXE0zQ+BxnnryJdd4JoLXs8/5yvsjevk/Q4AZCgW/rwmRVXz5afRiDbCehPCmesqqKKYuihBEHh9zIwMRBTPLWrwB+tJq7fej06Ixy8xU9339mffUiXT7XEWHCh4Yjw/EPH3+9Iyk/9vgPj3u0CX9QbH2Mb+lRT6U3WwVL5PHWhyDCuPZ9McJlqvD/AKcxdAAp7MJXycKeKi+xwvwItyVQIKk8zrBYc978/O4Al0jX2D4f1ituBX/+Fmp0Hs52MMQ6Psm4Qv3pNfpnwageeYBI+iZ6E5QUOOyH23Mvtc+cPwb1YDQ+BndHTPK5hyuKGfOULhY1VJ9OUkHNe/lh8TPw+Q+8BbycAJ+9DKhOf9P1hS4KPX6ZpZBR+rgQI8Z9vLgFTTj4MxYhbHxzJ2DKnp3QTyvlyZNZ/wDrVMHzrprNdI5dGc1kDfz8Py6TerpgFZVzHws7qRPHk1qXO8sM6UekfijvGas8Pv8AWBMhIsPPo+95jPGOBt43w8JoTwsrbb9bpn+nCNqcHkF0zvLg5LrSNOgN2RNB9FzQMR440fYdXV+JuKJAOo+vhy1SWfT/ABjZsgzz3483T/RTzT359bxQKll693usKh3LKvo6fWUpSBgj0J43S9X6GLJ4hf7G+QEDwD6+DlCVC/JflZZ6gz0hcQk6vgF1VboD2mV/TmoC8JSM2C8KH9F7dxOVgHb9YKRsz4PgJltYhJO/vKij0PY+MOjQIv8A3gFD1LV7D40sUMCPA8wwsbOxB8IDG4q5kN+svMeh0qeofJlkUsNoEEDqh8Iezc6p1BPrL7OaefvBBPkpqVlfOJ+e+9QV76uHNZi+lD5mCQF+Zjcxn8YEP+AYNX3v2aSHZ6fGWx3jdwm8wOIrJhfgfGcOKI4pHxj2cYjGTHd7w9B6uMpvp+hnJKqb8+McRFsfz9/rBKo69HTNKr8sq1QDtzYaFQ5MncuTdE87jkZk8OcEK5NCXz9HxiSoAzoH2YYen0cSJEB4dMSHgW+chAR30v29JjB6wCB/7xwlEbVpufXKzo3SoKGmwfvAMaoIX+cGWrFen53GBxFi83dZ5N5vRhu8VHLSBRt/RvfXcWVouOkFD7FSud8bBKfwtzEvyIFs7w8yamtgHT5+CYChXuAX7TyfW5A4Dqvywtx6DcvmOgM0LVPyrhTqBHoKfP2MjAlTD4gDdfCop6uf6Z70mWQgDEoxxCqKd5/h3JqQeOGBWleMX2tD+8l5XUtvxn2elPIfI6BHFAEBo/EIPRl3tAXxAOJ5xWO6Kgn9melpsUHzjxUtSgfXxg35Kgt+GQIuwBO54unksvyaEy+MbIx+n3htAA19i/eRDVBA577jEXOoA8KGX1G80Zg5+TtYVrxVGMQz9W5bYLIZQzd0gB71ryzKQcNujoR8pMpkEEL11rwXIuzPrszP9Jvon/Ycx/2acpn6GBm6xp0eop3WZBAcZZQ90L4SZy8dDw0lIEe4P/gr7TzraBAH16M9QUfXmTO9oSSN93IX3jDcgrDrxY9HBbzp7d3TjdLhj3yJlBlbxgeKzuqE7vEpJMQiVeu6fvIdCfeANR5Onu4ipvtPD3AuQTtYvO+mZpSzxp8iYiX2E/Pww+sZkND3hfFwTxOd9apPYJZR/wDmgSSxX2fnF4Tz0DLjuJRg4oe/gZW0vX0hMP40OuMKEefya0Fz7DHzT50ISvAPCKPuGCJPuL/IUjrkHRdUfZzJAfSCenl00RgeuW9FDxiXqdHp8ide8EM4y/Pf8GYQ7+ZZ8N5cuaCuqfwjE12KUI7PkR/DOh9E/NXayA1GkJE9fbh3ElGF+X71SQVqpfhCju7D4ESubBIvHH8j87yDAHJ4IvTP3Lh0/wBat4nH1nanqR39Y690Snfh9maKICOGFEgP0HMpnUK/q5CHwBBD8OXRPi84vyHu7/jMsvwOJm2S4HcdLcvQDB8efOLEul6rCdT6vZeT9YZWjIzp4R3FDqBtp7ytAelZg0eslhmBWnwd3RQBvEp8iOAI3jHRACpOGFFfmVH6HcY39c3rf1MrrX9Bwvj++Ef+3XlQolqhDN4Pi/7LKv1gaONPHkcORD43eNOC/DJ8VH24hpUAeD9dxrE7D3XOaSnw5izxD15/+5/jiUIl8UzYj5q/suhZhAwfDBmq467w3Turs10K6C0cd+A930aLsnk7w9MxQQvXpP38ZovMBYk5LvIZQQR7yTHiVtg73JIj2XJ54k97yuQpHU/jINCdP00XJJJB185D2o2l4txXs9BoD0XI6QA96eQf/eZYLQSiFXS9qE+94c8bmMviDOOkgesZo3jCA9s6fXyZ4LsEEg9YILlCJDxHElAhcfYAm4qlCMAPofqUwlJUkYvhjm7qDCQs5pj/AL9U8eSjmnzadsr5H7+c/DI6PFF+cqXl4VI/fxi0WL48InjX06Y8fywkUOgJF9LcpOnFRydnHLqMZZ9NPwDgiL/VpndInfKHSesE0EK4+6sRPDSKEQBxfXLn9i2vsz4TdGCOQCDoj/Y869bS2yK/WKc3YOzzVMT9IznHQRcPCPnJJpC7+jDoDwnprTsnnz506YkpfPg/1gnSxzyzw5YAidqXDJRNVj9gswUQHqTEjjIq5dDGXL3BZPA+jXhf8H4hqy6XJY+M8P4Sdw5kPM/oukwfsF/F0Lwvg/8AZpp++l/xkVZq/wCchhIg1H2YZcHyuTsrGTn6xBdEOeZj5FhqRxySDfrrqmqD9fvILe+c8h7zOxkUKQ3lPPTuHluWFzz3EN4FMwKzKRX/AGZJik+d/lyePgHi4Ly1Q1T7aYuIiPXeDyRHcWbPWreKDfGogB7qR9T501KoDYfryOruj5L+zrx1bgxIHhfhyiCGp8B8u8xCPR1Tx01vzk95Rbh4HD+tayC8rx8fGSspncD7v05KE7Z+b5htf6SsuZdHmSUP436ogtMAPIP0vl6mCwxevj+HOmkPl1rKZMJI89xd5bnkfuXzkAIgXnbB3/7nklAzyPgj8ZGyHwg3ybwKCTqF8OsR8D19vFwLavWoB45v20BT+LoOGqgKHueVwfhCVsPfR7EBUe5iFHR5fg6dt3g7YEWyVEd4TXX+hcQGeMMx8wlziHIIEua1KqVOPzkqgDWJB/1imqSowXrThg7IM0WrCpleBD9s+ECKcL5JsG/a43ExvyZ6IPMXjwm8tZcormwfGvW8rSr1/YyofFf3iBnul1VA1K3olaX2Q+24PE0zdgKpgb00K/H8GXO/KXHwP5zUUvgziS+yZ+tesg33bbnpNE8H9fOSt084mxJy+1ml5zW2AOVMqMB4Tn3vYQFLkFIhbfkz09JltrJD8do+sQXzCKsyDQT1MRGw+cJT8z8GBXBYdQYl6OALR8XFVT7Rio7U+NFTA0KJ4q6Y9g6tHu66oCEX2sTHInQkJR5k8PznERxecR7jcD9O+vmfWC1SI2j9PvUwpI/b3gPchPh/AfJjc8hj8XVsQX4HqOodFmcly7j8EEFz3gZ14rDi4vjyPRyOuCF/ZzuEDCVHaxokgZ23JN6STiZJRC/YfrCYOye2vDCEMJ9Zok4Q/CTIh6p985RFEGL7B8TSpkIT31LkBI1pfC/XLND0jRe3nkmenhfSzsfgNVKcAFLCzJCAqIohhh1Vl/61Ag+AXn3+8NMKp4cNvNnUVwGQtUi4vFwnn5nMATD09oz+vLLh5BuuR+Xr+tPTpJAxPmlnpPAzeqoGfoGCaE7Va1PxfAX9uHqgDS17hpJiUJAMuxeSIh+nxdQxE7rFCQz55jxK6v1Hh4fGhHXWiJSAESquh/8AZj9pT771vIWciD4I1WC7/HgwKc+BhdZ70HT+Ax/H/f4Qib05VPyLkXyWGnzPrUpEoT5MdQXI+o4ZXo0SpAOOYjT4T7SNNHZAMv21cKIq5KKGCIb2YdvuoPvMn7mYg+lbyGOLw07bM8qTjxC+sBAE+Ox9eDM4upQ77VdQIDPnr4mYdSqxvsild1aeavXfJN4vGAfP3P40aCv6W2LndIJUp6UpZlCdvlD95LgOIj/WOlDwgfzY57XS4SP8MwJNQdefh9UL5x2vwsBY1QaJ6BuB6fb5P9hyEKkR0f1gZngWJXPs1V2kvOnyHcK0rhVMTBji9j33/rCoUuPdnnvrHUw5wfwy9uEBHr5HJdHXQsPrCnoVJoArTovj6wWqPfsKYyYWvrT0X3gnlieHHu58eY4OcH1bMgRxD1L83HPdF6tPM+rlSSMK9PPzkgMsJ5Pf9GdEGqnT5xu3XFZwRPBLvkSURD5yCqXI7zyJcfCnFJ6eMMPNCOOQACf/AGGRxFKHA5z3cIjVGh3xSS729QMP1Jnd4JQR8qjLnI7P/azNZSkAo+Inl3GnXTEQcAOfOckFUF/tcDJw5lZ9yLhrsvRJGvH7GvPan08R+jJCHNCGOlTImBHDzgfM+sfAT9O78v8AJufX+t33f5/JTHWeIPeoics64CmLRzqmM7PdOrvUKCb5mipOvo1fpYL00j8L7TT4XEHgse4Ok/nO8lpZzEta0j7pX7MxAt+1t7h+XSAbPYzelQUd+El86QqRWRFfFzQ7BE4fCUmQgDFZr0k1UDulqD4PY5m3qSBH1XeHFB+p48ZVGmFhT8OQaY7eH2edWCEUweprQNjfGHo6CVH4HVQtD7AwR1yKXMgL7Po17Rpzx6GQ2qhy+l/vIHk8Kiw3Pxj69KSxzMabEIfv1+nAg7oA9PzHGjQCryfDcpdKpKmc6agOHHiv4MggJVvgnzketlqd0gB84hXs45ExB2PiamBSrBlAdlhzJsTwT0Q8C+MrgiC9aYpygh+3z9ZCFYI/35j4NJSf6E9IXOlVhTyvgy3hSvt/6nMofat+zLRLAxAzejmiVypvQDMlx9X5FMRZ8imfFU5vr1cCj4PSCTHUOHDPiivAwM1MCh9cCTWhgTzyDpAmwcGVwEAX3kQVJjp6by/4Lq+DBxxH99cvoEMmV7lbDnrECnBD8YADoRiO/wA8+GF3Ple8nv2LMT0O1jhIFYHwmE8ifipp0Xx5DUiDyOUgABeuCLiAGXhRfp3CJhBue2FRO+eEJTPpGgbl3LU79dSvATX98KWJy+DccFK9o9Y9xFgvj03/AN6G+Q98P3deuCgsI86WyFQ676fYyqSrQLP4aQQJYX5+O5JYH5csKHj613aK8y/FTupElHgcfi+dzBlAMhCVhmKbF6Lc2QL9PM6pRRD39fZiiGIX3xNMPL2hPGhXvPOAu8amRBC8fvBPg18DEZJiyJ79zVO8Uj14Gu8AHeT19uVme0hS/NnPrTxi4hCvDAI4jqx5N+6ePsYwd8KpOSjyPJPsPzheKajeV++XcVqX/QudMi+Bove4U/sQf18job7JctHlvxqAX1MX/s3g8umDpfXrLfGM9FX6uQMOTk+nHGiS09jjiQNmNv8AR9vrUQkkBlfNfe/Y1AX7ofOYLY6dWECP45Pdyhjw+RcIESDwnXLgQoZ4NqJqDyuKayyeeabYpWDsBRgWZPMQHg/a4ovCOId3CWkQdPwYNHgCoP8AWCeg369FykMDxAoDj8Wb7mD/ALco85SH+WqrQz7OQO4BV3KZZ8MWHM+ZrwFPX/1vFBwg/m4e42p/BkFjaw11PNi7yw0wheYb79YT4MCVHn/BmkZ3xlawzpU/0a1L8UWm85i1e7oNS+ZE+1k8/P6Ad0TuDcSQ/DRGMuZ2b1Sd8Ziu7QBQ9L7HMCBAOkL8TBPeIk9eHxTEGbSsp7wyVotWv64ZrS/AfF9w9z5TYXsn8aTuyog+vBw3i8nOkHk8THUW8R24SGu9DrcYJF8ocA+ZghUHPad9XVBSG9Hr+89JTjzV+Mhc6UGX0T3DAPh4vgKPn4wnKAci/E/03whWniYMQ99V/wAnTeePQu1IA8XhhQGzp9gJ5PMwwcZkVFOj/GUPjQUqgJnZohMR8cOqsQ6x9HlGK9fHRO/GPWDeFt6cPWRBXFK8fVM1lwb5BMNaMa+/l1yA88BOfLco8wrj6T9YmRQoeZyGAUYDGSH3up0FsqX3rRB+fjh/3pglPTWfqZcKrwr/AIeNXDxEqnMEQh6UU+sNaPiPbxQ/w3mQMpFiHH+9bxS9A0e+HCWN2+i9ZOUwjFGecJ9GngHvG0ZFUcACn0n+q7xsfExffh7vMSvHqatVANVf/WA6rfJlMJKA8nFxlE4A6T25xvLPhPDQ8fr5dcAg+H/+bCeUH/WWND4MNehyQ6m4K+gcy9rz9poCyHwhcqj4mEDL8mLsgen1/wDN2RCP7YCHAAXhdCdPIPmuHy09uddfl0yD28N2FOC8mvHr39OMCQoOepofZzZQ/Di/obkjp/br/wAi7xnCGHkdyLjIm6TyxofI5eIUgsMvaDx8n4TeVERFPoyb0FBaDe3XR8hgNxKFHiU+zM3yfQdJ7cQeTE9EPrMmwIDQ3pYURAh7/XxqeFE8g58u6QoCMYAgPkK+PGaqoV+5kxEMg8Rgd0Scg/LeyATDq5u9q8fnqz0VI+H6dJvxYyzIOmmQYkr5J410T4vLjT18fwc7zqAtfyLJNJgAWY5RSQkFfe+V01J9KOMRHjIt6okQfimX6EbDAeNeU6k4L4Zp/WTVSnkHHeDqH/DlE9EFo37cnw/Afl6uWGHSew+Q8ZKUPCwDTJL5RW/B+NRIpzyO+cEgJker9JlLY2SgzdYjgHhkAFb1T9HEY9KvARf71fxyA9nxlNSOj4xiKq7keSZe+U9o/IuYPhgVLnGZvUb+8QfZoSF6KHf950RT8x9PrXrUFwvh+E3L8kPbPGvn+KMO+M8aHT6U9OEfliehNCk+QqD3cQVOv5mWLyAfIaGCr0fH8aBV872/9zCkk9YvwvfboWBH4mjLgvnQlxxkOmky68/W8Ux6NHEi09k9GGwU9Pwa+nl876M1JVrj2G+yBysDDeTJb9LMU1JFI/eKEKT39/Ro6LgKYQN1XRs9cSuSbuGTO8LxUo+nm4qVtL6PD9sNtEXoUT+vJkUhPOP8C42q74dM+/8AWYcxUnr4fbg5pZD49h3SXQ1YP7NHsCnq+mtDfYU4eR5zQDSW9eB8hjgReVPHq9X2aHVhheAB9Z1dU4CemnoxNxoaZSEgTwTPBN4+p2T2YlWLKz+b1lEunp0+/pKaqUqCfVD2YjpEOl/Y5wWRnXp8wXEEAer7fTPsz5eChcj8Pj+dH75SHeqJhVHBaOXievHDIDCCPKN8dZWNAPN8pRM1KOWniYz5/OEPT8jACaoiqP3jLwlzr+m5B+xSv1WccBRFAVJ8DuceYqUB6yTwEX30ciZVJBqfx86adPqJmh4QQfH8aFwVzLwPPgya/pAxe/ByAb1pxb5wyfDymIrR+p1Ml4D+7wxY5/HxkCrojR+zfMddu7o9OIoVPpHf1cDP49A9w75PflI9juNRb5+Lhr1ip9PDgFuIvrVbZmUlS4empElHwHnmNkHYnEhrXhx506nPjJTDZ9G8tZcK/wBae/vM18YjDmbyrL8QF+Bc5KwlcMDBo+nnHE1XsTv6xuHOpZ1wbiROZuPtzMw+3Pq/NfMOWoJar4TGre0pD9HxjaIqh9F3LxjwJ3LMZM8+NzJe5Bvgh94I+QQHUgjMhHtk8H5DNQg+Lpfu5UCZFiekpkCXfkCP7zQNw1/oz/LBS+PlPnP9049GHtHdRQv0dzChCOeffMJoUUCvRffxm00eco+3Oh/eC/LOvV5+H280lJz/ANrjQkg3e14uSvCfzMcpnyRT6+9AKPBemLcu+dP4v+nFCmCBJvRBztC8MXVUe4YeZuGkPqq88ZFYDgHwSLPfzlJ/Sh7p5+ZpxELXYnddxIWH9Xkz6gQ4ofvPEgRewjyufGIg4fw+sgLUKUQ76t1ZQxPJ/dzjjl8X4KG86OhADmtQ5ycL2BQEY+X3GECv/qwzVvYT4M+EXAoJmaCI1FfaDmOTPeyASn3iAxXKe3Jro6+86gzU8d1Iu8vrJ5UAfbpMqCGEesYtDIWnjc+DK6i3n1gT4Rb1cRmjKCl5+zKSAvF0AJ+/8mRBT5Ee44ywy+X4GrrBOVPvNOfz0t5ZUM+D8PD8QDvxiA/veesDCLMb8ywEv/AyrmZEyF0gMgTxQPesCiknJD4M1vVaeo5UqrwfK6EnBoN6f7cqjT49h8s96SqnmLqWJH+Msb05IRvIcOBjcnPsO8emgUMyzUVZXN8X8KVNF/AJ6Zo01HQBE9j9YxYmvKB8r6LlwXn2DxafGfeUqtahMsGPToUfS+8ilLwO90cfEHsenvcUQ0KHsn7DCcilEJ+tK6Y//wArnwT7L6+bcMfvfs9DVH1AwPAE8YSytUpPy+h12vgl01BUBKEcrzRGOAvIo3FfKEp+WGLfP93jBxUb6VRvRMBCBtPTxy7hSAPTfs9GH0IbI4fR5zACXSQl45osQeaFfSyYG9uRA9Ho51uGwqr39MBKkUAF/Xs3TML0rH5cZydpQ67pgW/T8vE+d0qxc1BvyB9fOY2V5iX2I5kM6SH97l2LCVhV7AQ+vOQIPYn+EcsNb6Ac+siokogF/mZjV9AifDpvKB0nwzeGT48a+Ie8xeiUmCY20ObzLLVWJuSM+nPLcM082nx+mWiRYiPtykQSlkAfTya75gqc+plcECXwcBuTzbeYZ7ABDxHy3dTaR+jGai6iTKz8Pg/BDLMfOcIZOM55m7SxnlGDLeO6Hj5dUCyt3VkA9ZCBfAv/AKxWIr19cgrRO/6NVGXyoNxVd7fHnH8qZDGHNzwpefBuuGIZNdt3AxwAn47fGI8nF/zmlwAPv7mFPwKVgfKOAhYNGoOkS7YIin+dIQof+wO4tary/l0CMRAncaUUKCh5rd0lSdB/y4jUWvQcPqulxMfMObkEJJ8MdZSsPYcf0iGqBr7L/imsXz82T/OdBfypf1kBgPf/AJr/AFgoarZsP34ymqVOlD6xDeafoI4kKBKWXUQDg/B9ovjGB7BPjzMqu9ITx6urT8ip36Li8gqvMJHG+AvBfsPBi0Ej4iQfRNYgCFERjR1ItgieW8N2pR2Q+01P1oXB+sNM1/fzu8xeZ5+3E77HpdRh8iJ9/rJDyLwKNefOtQ45DDH0c/rXFVz2OCZAtiOT4fjGgU1Txd73TRnwPi/b1hwjAhCn/wB4SxZ5b5+veJNKEOQ/WEzBA2jiYo2548Sex9YK9LCBnlL5bg+0efkl7NeK9DlDzB+NDfDDqxFxe56HAhvuqQh5rkWXJuyjn6m7u+C8jhwYJupj4aT+DrcxcOm+kabeng1xrlFJd0AeX1i0IRXrGDkHi1ER4SXEEJGVI/p9ZPiZcvOZL5VD1wMybM6W/wAGHBL1V1+eetyxHwpuUza9GUY13OA5QDPwzq86aLCVIZqW/wAuidMBrygJPTgXRYUe3CJ7zxyafCckh4uplKD4PxgStSMPH0C5aHHkV49hc7wgfMR/hyqiyHlQnzuxJ4K5j5Fp9fQj40KS8r7xAHL5caffEGP1oSkHxrRR6/GGCUUQryPljjxAA+t3zoPlR4x4gF6rfnU3NBT5ngvrN8XwERn71iNJQ2U/1krQPHw+vsymrEHRe9uXTaFrgvZhaHxfEbetSiZAHxPSSS5o+JGo/ePNl90v7PGhFDTtVf5e50qZafPwclk1iLnzTusofpJHzgNYQnqFhgFfl9vHvHQtVbFPfjeDYet8H5fbr7hvXxiUUyJdB971TX3xDWDskXJItjEPtg5cfApPuYtQQAnA/wBPnJaNh9pvCKCHimgSOUq/GIECqJb97ykQoOKaUL2RA+09a500iRn9zMlWgMX8OmIDttSD9EYlP/qmDCo5V7+AhgZxFbw4hO6bfNN5MpfX0JMZVH+cxRPtM0YctnnEv4AO4q6vjzcMaheDjhbah8+PbjZfDx9MwC338v25sqEHl/5M2K4OThcyiUPMAMwMR4DZccAeZKchg4/im8ysHD8MLuoMQgs78lzTdTp8r8fGMpCD1fMTncnAnP2MavZJC/1gxAXhC6X4Qhop9vcxLtah/JlsFCja16+nC2wr+L6fWOL7Uh793eHEeJziAiHTmYHOf2PXdp+xpJGBRMUXj6TUOjHS59QQP1T3+ndZo+crwYon+wE1maUJIXz35fZksOogSH4Zm/nSSD3n1igo1lgjhjiAcLoPuOK5SiRr9GIkdDwhdL8m8JZaBT2Ljrzs9BYNTufjyAj18fOGhiHr5fJ4wYhEqJHDgQJbn7DUPIryvtPuZeloX2YAIRHTzPU+8o0IAHOOZEOJTvg5lAM6BnXcmKN1YD7i4VVPCfM+Ec/EfiCHPl9G5B57bZ89eddwQgT6bm4p2+zEHRQmaqKBDqcU3kkNfIdRdXRO1h9E3LjRDiPeOgG949HsVwPSAbBSZVYDGffNN2aN6fDvR0ob5jz+nRFH0FuUazCjXMYK4nyyE8vTziFX65/y61WnvDpBj4OG71cxHB58w/OFI5vjb8X4MpAEDiQcN+vpHj9rlPBACy4DHi8eH8GPLXPkOQ9uQjeh8Y6ez8/75vAtPYkf0MEm+8B5c5mH1IuRSj5e8aeS4vyTNscHez1n1ySBVTJ4rwOOgJZ9Z/AlIfR9ZOmtKJ2mLYPkmIgV6HbwwFJvCghOfwMBKAWTo/eCB9P7cBqkePr77guEkanuUk9JxByt4PgJhQvEP6FzD7T/AEwFN3dE/wBYWqMHbiE/emjLnqvaZP0PQsN9V4WAnLpPWF/9OJ4hf33RVUcGCK+kQfhmUlFvhOmCwIJ5+fUyMVRL6NY3z3ERsiD49zUYvUeTyQJivBaIxK6g/wAFSp013BWXwD6TGc8V4RMmKyvhgFZU+hzWiAUfP9x1FuPA6DA1xCeqwCVDOkL8DooPazi/19YZiAvLU9D6zJDsgsG8m66jnmBplAApwBiLoq0IZfCFzwKfBg0qXfRRWLWF2gn1aXIyyRj/ACsS0IxTp6s5nGiEe1vTNlAh9ryRb87E4D+cvYCE9+sF0LZ+svznH7hucUcVgr9GfxD9n/WSUo/gwUE+UzIZvbAK4sjzFeAqfylmPixT+BcfM5L2awDweXns+RyqtEaMPq+zC9vhO17br8Cd/wBSaERZjzy+shoDkW4FoapeH9u4JBBnfr6+8qSk9P8ArI3PnRPb9+8N8xcG8MyRU0sd7jTSZDuosf2fOJUdYg/pvjCVAVB2tfvKgxOI8sABV9/RmAY4oh34jqNIBi+KuNsJ6LDcUVGvvDLRzfQGeMwrV/HtiGkB5NMTr5MojePsznFg/u4FjnyYDofT+EBXFSALVw2IOfNhBesZgKko99O9+taLKY8eS9zbHDB8PYfrMAyvPgM0gKqCh9aEWgDjfWeSEZPp5weRS+D27XEKxCgtfduXElGHgfZhKSl8D0ZRyC5WEuYeJRb1/wBa6lkBV+/feAehien9bosrfJ/bz95YPPAQNUkfhoD9dxsVSqC+nTEPMD4fA7dRQS+OJ75kUAkSn8MRW5cC13gBqxgPozqX2adc8LMkmSxThghECEeWSiPHn39YjRhgnsfOgzcp4QzmxXY2s95rkO7nJbf73idQ68x3g8DvkYf07lVVTyRbD9ashA+onvLG/t/eT6T5c5LP+jLAPQhNA31MLg4fxSArKFa4/wB+gfLj7X7KJ1KDPNF00s7R7eIj6zgW6pK9Sv8AeQ8L0eE+KasN2iA1IMR5nwqHh9Y8o9Jfk+r40FASgf0SwukHa7XymaGh76IfOgIJg+iYIsCqor33zB1qaOMSZTeYMzUhmDXus4I3yk7GJoNwDUoKZ0ySE8E85vN81D9OiDnNPI32fGEoB8U8bqNXl8v85UPA8IIwE0SkJPq6ao73h3RY/BSXzkezhEKuCeSv7DBc/Z/X7zkw6/kn46gi6XESJz6MOvmgY3+l/bjeBAb9ty0x2sC+LjqgWfx8GSRTP0+Y+sFa4jD0OCys+dvDoiVDFQJUcnj0YVnBxWk9fvc0+hzh4Ay+mCF5ygKjl8R7zCwwGUh3QKFRxV9MEFgfs1cpAUaguPEAh+V8ExSl8Adnz+858Y8EJ8ZPNoQ8x9aLppH7bkHWh8G+wZ0iYOlMcPYPNT5Y2hOAjJFfL1HA9E3uJ9B4vk/W4oCLfYPHEygvlBOj6wR58LH+jNLgkfMyF/pbxeMVgWg/vDSMALf0F9OvG/PZ5owq1eDK/RoryhL7YNI79XqHjVO5n/Hgp9p/rG/u4CmSPkNKmb/Dh5/eCgZz1eLlZQn1n0Y1Edf5FgyOWhqf3nzSeFVeeZkzQeB/n9MLhx+5HE4p7B7flaj6CkL08zQKTrmfWqkcel1PRpZH+wD7y4cVofV8GtpMU9563VIhyM+CjhfDmeC65fYHd6c8UxCDN2F6ybxZvdVg3SOFL1yAWXJ1FlMF991DR7D1xwdSQQ6fzkIvaN8fthorPeCqHSnsPs1LqqBb2/GTaACeEwAGPA5P1fWAWbep5ZQSk+LWgJ83hc4AMe75zTJaf70xgmfZWR7tN9CqFRwHvREBgiNZgyAVPk+MQ6s4gVDxmPo4BPdnrMV1AfQvNI2eCa/Ueh62hhRRjo/v3cRIE2ny+X51AuW1CJ5f3ll7Vt4/xjEES1iC852SDqlH9ZneLwHTkCFfQfju42kF6mpNvpnI/wDXxgtkS1n96CfSH5ynfo/+plGqvsM+76yWJens/eIp/rXXA/nWmey9TfBqI62IDfrEFE8j74y8kAhhT71mgyCxXv8AjExR7fcfHTN15oR2395ISBFTyB2YAX4MPUN2dzB4+Je1qOSRSbQ+3fHtfhPVeKim9Lu8iUrz9G6uC8b7Ik8/KfWnfLRL3z+HOAesjTVb5w6J8DjtVO45HvPXd4oOgsAnxuLgr70eB9uJ6JBQMPOQHDymegD3AAPPFxIBHyWD8eroroPq9ekZiBREHVffw4xeh5Pr9+dEkIzluahHhHkPDcTnN44cBgTIgL9Qzx9rJA4iR9J33ODAXzx3ianDt4y8NEqYKmDN2phPfO8t8guJy+pgEnCJz4XLi/hzw/tyQheITLLAJYV7kihq08jlw+1Lrw0fdSJpH8vvyYqLRP15+8A2Bg859ZCBJ8eebop7WuGRvFJObrNOQTB6BfJOYYIGBG5BDaTvHJJlUF7MtPViwKAKknX5c+sSU8h+p3e86J6RtGtoZMYINeC96OU46bYvLQ0F6BKqx4/TgreUvm1vRvIGBBh6gUF8N8nyZZ7yJbAzNkpto/SOhJJ0fgvR7Zd+zLET0GSTAqd5B+/OUN01KP3PhgsBaD1PUb4zniaHufy+sISmkQeMGdCg+/6akSBQupu76Fvr1E3NLVB9H3vCEaVF/fyYWnWXOZyj6qQv1kRWxOCS4YDwUvf9PTgzIeqm+DCU45+8oRoJJPGaY9sfDPCwoeODT+R3gI6SA/nUCvQcD3s9Bw9qx9EpCe3JvgWHzMQDgYTy4186nSYf5WDBD5SH7Hd0U+HRfQVOn6dGYSEroofnAP8ARXOC3g/yV7N0gVlH/tZD7nx4ySfuWzvoEzMoe52eC/GZ+AT1f+3e8d4XmOGPAFvxTJnH2go+j3pFA0pPP/zIqE+kQH3h7PDryH6wrA+RW+Lcv8SQtei+rp+Xn2eE4nPWZekD3/brggWnJTwHhMYCfLA8gc4mtTVThp8GNQG3C23rK4E8Qq0zD5sP0YQPs159MN82Oz2XNAI+3Jf3jvNfD4YRvkeHMj9H2+FxSwNPO5+dFCMfvAcqHqeo0wtbIz1onNxjrPGjkQik6cc+MywAKcOv1kEQiUsj53HTzbc88IifrxjQKgZI+mZ4oJTvNQwLi6eOTeEBJ7BM2PIPgKZ468qVAVw4B8PhXSn3uapX0nuADPGs6A32/ei8BFCKLIfeEmN0kX+v/WaRnBErj4jtfKnxzAb7b6fz/GE2JC9J7yzpVbwe++O6spgKsnnQ5HwfZemRRihFb+4+suEWc4N81hyTVqbg3URi0QXOPvO2ygh4c1N90rL8mhUWnF+kcKwPSJ3704CCk7zGJJ7loTzlnE8kEieXGaIrkf04LmDvkINXKgsm8rTm/WeJCXKR9O9yd733/ty0ehh5T4u6z8dxDqbvrsmRQcjhQiK6tIckhw9H0eP6d6v3o/8AWCknwMNLBUt+/Y96tD4JqYkLiCr78+G3PP3Twf5fEwqmpOiMPmXTFqU5B77Mi2HrBV++by8Erl9M+jG+IMIJ/wCzuOjn+n6f8ZkAJ1MKnh+MrIwO+D16K+MznwiDp46LvG7AxO/rEqq4eWO4pejzcIvy5MdAc+8pgCPYJz4ymHTwHMFBhtGk985oiMgoxeJIF7gdF7iWPLUyQJLX1HG7QE4qPndCGfBf6+8MfJVT340oOCjOvs0Luhh5zQUXnMDHyZ5X9Yl63kYswPE4+VM9o4yFt6HI/W494fIByUFRzwv61KAkG2f7yR7Uc/eMIWydV8s/IgmjpfTic6Vy9M80WsipT51xVgicde3Tjj8/c94YABjzJLlga+gISc9ucxfUUSLPrQDROvFXzTXCHm9j4ywQDoOr7JmRJ6AyfOSsSk8gmVIIcHn3zuQ8PWvKMRX2YagicP4L6020AeY9MRNDwvplESNXgCyYlL4AfPO/Gt5SVKP3+2KWwJwh/mYZnNIPh6HBnolQL9mTHKej95r5AfL17fnVRQ+5GEwQKP6xUnHF90gJ8YhoA6av7wuLgH058frDzuPJ5wr/ACYXcPhliXhSD9M41pBPYRP04eCIH71aSH1rKGs1eyCmhw+D3T1IAz9Yvwic7MJM8BcA1Yfd5nAI9POQD4JiVZPQe82jY4ZrIcVLxkKvMDh8LBKJKB2+r5yX2AIBPfUuIiiy8X/PjApe2Qtr0964RcXp1J/PhcaCGkIz1ejbhcJ5ROHycMgkZSyH3DC3r4FX3OYERHFDl9dtdVQlDwefM0YnACMj53lT+HjzudHtHp0287J3eQDe8dXOeBqjPW92o8fC4RkI/wAl0L4PET+nVKiNZ7ODjijlp3CJbjj4Q81xoNC+PQZImh681yFXfg+H1kohhef2mC8Yzich0cxNwA+b7+NFftYPm/WT5Bb5vi+nLQAM8Sa4Cdp4xOeG9bzMVAeEdHyu+sw8hx9buwHf05E4flJNIME/1ExqNEF4Pn+PevGChFQ8ol3hSkcbaksu8Qafmj525NGYR5GJzneWBH51eatRirDEgnS6o+DNqvQE8OFxlChaqc4Y8SXqGTRY52PDA74BWlHj7TQb2iwBMPSiyoueqeTV2FQHkqwfUyKIhRV9EcAI+ErweAwtxlPdPluQmwgF5mAi8BwU/nmU2PPvufvDSB8ReuOYFq6kjHHUha8P7OY2yR/p55eMA4COfPox4FYxHynvTZ8hPY+39YQeww6gLn2W/W9umWRcNb5qZ+YPUTmTv1zrpIRbjO2et7oJ9i5+5cF2TNrSR4weewh4nyug8rOqx+scBRRPA6VfG6DzHSGkI1eDK/5JIf8AGuUkgyTZCnac2+AHmV9zWAK/h+zLwTm8fwLm1DwCdOPM+Y24wT+9AEAcIfLjmcU4fIuAd4+NHlmBIKvgvefbnKgsfN8TmKBNHL4FwD1u3oab/s+1zI0ugV3TfjLDrpmjuZJUnE8dbmyYfI8OO/B8N7bR4/7wAr3VRI+OfOgoiMEtfiYAPPgFIg+TxH1phQVXk/xgNV/U/vEFAsp7fxk4RBF6KaqiHT+yZ8+x9P8A1mVh/hHOsgIj+zDj6JwmCRzqTz3mLc154J43caPwdvqfWeLIGK8Hv4vxolk2gD3e3HCweD5+Zkpa808fU5kLFiV/amFAiWAE+bp8/JBZPamIxISaP04aUB17+Y6iEYxYBAC8x3gNFDv3HK3UBURp6xfCfAyfoyEPgh0/6zRMs55ND+aqJPg9OHmkW2KPqOOPAJ7D4TXmpjOK+TTVwEF+B/8Abp/pNHz8masOSt6k+MfjgQ8x7TEwlb4gHzGY/Nj9j7YOk0EAev3g86AAh3nrJTCHs0DVrHXyVwywWR4X3c04AV/7c4pHYp2sB3QWaSsETJ16N9R8uFdaFVM3TUp1yGCfCR+QW5/rD4Yxt1Ig0hWMTsuEi58auxyj8HxjmIzzFtOvHk+NPgKqfN/N4z9YXyDSf/DhQ0hBQN3KlfI8fi42d5lQURHE7pYhKgEH3jey0foh47lJAdq193BoqdCL91Mjm4MD3gCQY68HkRa4vkJq6+XJchi1KL6OOEwh8sn966hmhEB48NXspUV/yuoxTatSHy5roS/Ph4NaibhTgboSYI4sXi76+G8KKtUDEI75WfrLBHBaduOg8tjiMgxOUX+TOokJFHIpF5WkMMPASCf9Y0o94fT7vdHSpP1ZlYIh8mP7MBhRWp4f1o3oQ8cyMWIdvtoCIJ6dkwp0Hv0el+3NjJwikvFwKVSH7767nI6qne/vKH0Qvf60p77Hyjg32zKFuQDudOaCPCVi/E3zcfBpx/jVTZQwqf14ztGvaMoE4vfZ+paY8tVPgXyO5wjwB3WGqxEnX7zzOdA8HqnrMixh6Sh94vg1Z9Hm793RB2/RngweRgCw0HwomTTh8959/Wl99ULz6HNOyj44PLw71gFEA/vT4SiHK8o5MYzy9vPfw0E/O4uULzgWCP21Kk/LDurwPCiel9COSYpxKvfvVPiCH+HQbJHPFL9YhQhVfXxdCTpVZw/hoMPHrXv3gChdfk49/GXgxTdXHDAIgoRW6wli8y+Uecz6RoK76b70ZCGl83kyBCvounUDfIEj+nLDeJQ7B8p63ar17v2BZDNw0iP/AFjIqIvKXzgoUvKEoj1+AxFIXlvhvSx1Dvn84EQEpPrR6r9kM2iJVvOGBiPggPXzgT7ejdtAAR9Ov60ROODYvM7PYD5k84DI8hD8nTIhkVFlr6+FzgM+VAfpDMg1DhKqKEzYLOtpKehyX5ApOPv27t7vof8AyzF5nAZ86aNN7zeB4exDy5EPz25MTAT234z0mgvUlfEyNVRaX2t6zJEJ0qHjD5EUpwuRAoRrTtZeJPVrjx6zhVCR95zb5HkMh/Efr+fncJ6IMV3IoUAk4GIdfueTcQQFX9+v3mALj1eIc2cIcfWC9VQhS6SvoeAye7BP13j6HOCfQvmfEco6o/6e+sKTqCfDAMgEBQnL324C9B6Ol8fe+wafeqCKRU/z96HsvKLV6wJKJVfL88ydHeQcnscYL7XC/ZfeF2AAPKL4mEZoito+xPjD3Ytpt8hgAQKSYp4vbktb0Zk/Q+cC5bw4jVsykuBlxPsjioWe0X+UuIaqntrS9noP7a5oSEeX9Z2rR6P6M8OnKIVvjc0MT3rtpzmTHpcLE9uZ0LU88Sz7z08BoTiHkc0pAt9V5EDGuCix84YlDT6xD8ha69ManZQj5TM4lhWenrhaAr16UmWgLf0Bwcu+U8d+kx0hB9p95SF7h1D5TS3ubo/t0PIOH/gfJk3fEglOQMS/D8df3fG9C0Lx/Rj5C6qh8ri1uOksPgWcNihhke/i7sNAzS98MykmjhDjw/Mweb3Rs+CMuK3wlf4mvCJ68mmH9kLP33UKuEQl+/bkU7iJXHqetRwTh8z58ms+gUEB+07NdAzoJGRQQXhzfLMuggBXo+TLgwoi0f8A1iUiw/S6+ci+K7flmdC7cq8BglfGpoQxI8vbGPYZUBz2zUh5PuBlc6MC4R53DOeOB057yAmgV8vc1XOLR6L+xwENCxX8plK0ILgg7n20SvC4T0/I8bgCZXBpRN4iPafcM3SU4b5+825JOvt8My6auo7A7gHHxHV/7wZQOSx/b4mg5KpsQ9GU9I0rDe6LYkex+s+qW/k95sA55FA0PkC1kzrGJK8XAqQEa8t+92wB6KfpPJp+BGhsienIC1fO8eTpkLxHroPpGOq35AXvzhQjyRGN8TdD0K8UWwHTCNoD19huUalGHiKokjHEKL7D9jkToyh5Z7wAQRwBa/LtJikDkGLc8e8ro8Y+w9k0qwnsSGYyvq2bi6YPgqHvuJAqPQoel9Oa+Dp9HQjViu1gpexx7fFwIgJZrrr+oR9axbQkGweDTMgoQIVMICAeGEfDg8UIGgaV0jQ4joX99xDZD4sCqZNx/m08A42Ozw8P1iByyjO/AyKYOvpGWk/FIX3igYB8kn8Zd/WgveaCiGgQT1+3PmnyiefnD/qI4MGJo9US/eRVjxiURw4KtfzMdQ+spARsr0/fc0qcaj+/GMifMg1nEFVJEDPmfsUJ74GDhdSc8N95eteINl+VyiksqvmlPSvvUSLgStRx0YKA7WWxrXtat785CkbJ9nLlFKqscBJikRz0lwQxBU3NeIOmY+rR6E/WJj3fFrho9BOfLpddHDyasVeNPOHcB4BgvoclHPUVQPWGH2L/AKYm7VCAno+8aedcHwH/AHqT9PE9fDmMmCvqYq6Hp/eQqTP9+ZgtWj6cCAClCt6LXTXa+PDlKdDqtrn1tQih34M+e6McH4K4ePlHt9y4qJVS+CdlwES8D8LlNUIokInjIPLgKlHOOjEN4j4+YZ8GMeWvq648mFef8PjOtrwBz9Pt3DfIVSinpMD+F575MHyFu3hd45hfLLvMmF+AOLFHGD3y4bwT7rnwDSQIFa/JrmWbFqOTRNaoP7PjQEk+aPMdWFIl+Xj48bgct9D+mVn9TS/COkBAUoI/1O6PLSnHWTxTGVUnF3mEQF4xXvoZcuXgfB/NzzXnPIn6yzYCl8mvWIlCh8F/XrBhARKnHMqXwLTvs+cTIQioDz68uP6slPF1K+Pj7nhyDQ6vh0Y6oS+jccKxkSwiVji8Ql+wo4FHeKbxFrhF8Ji8YFfJ7jvB+b7fx5cN3ijB9zAYKLDAcr1eawb1cmAd755+9J4X4Hg4OlL8HEaCs5/2ZTAPJHftd5pBQQEdxvWnkz/aa3RbRv8A37MwpLFGPH7MyENL7TMIicU53wZSwfP/ANG6+rYHHcBoMSDr6+sqMHsnWNgECNGBg37DayFTz8Ofx2uZdoOB53y6zL5V0CQwsIwGPVysMaX5R0OkBEfZ5yw4unrDnzgatzkFZE5EyLErwfZugqaXhf50UNUZx/jK4n6HU/63Qkw9uVWAqYesJDpT4OcuUYJZHVTFI9Ach4T3vj9c3UQeUfPxgtas8/8AWAVHkFDjk7vXo/pucUN2RzxKhJ9v1qaSIjECXhAqE9fWrMgxQhgi0RlIR7XEFu0zyL5OlV2qetwCUbQCRw5dALO+zPaD+CP5uK2Hxyn1pPWWle9yI32+NxeiRT3iWwgk+X6xUkhqHxch4oeH3PVzGqvQ+B+7u5n217+tZi8GOiOZQEO8nH0aYFL7PfgnMLyqCHmPSWkiyP8A3qLDGPC/zgq/uxu8bCfYtByVdimFPs1icXj9Ho3o0TlmLqYKjTBdL2D84AjoPgj8u8HnT6oWdzfXRrzEkxzPRrtC8YOzoXguWYjTXKIcxaI/BMfiLUOp/WXsRhPHxvaTwT0/vGnF8z9/ZchBByxV5vAGQsRykQp9rPjdTwLjsQHUgnpylkWq85qXypIA+0m5KPI3/WilJkPT8/W5ahJxz4cNlfZP0lQwiz6AXuMC0k66+6K4RBXlvX4wiPgHzMjCZUM75wOAPbmSrTyHM13koosIjUrFnyPgwQgu6VYOtV+f40o48DB/DkFEdIFLhRIWPx4xEcWW759ZUAd1RffbhoCXt9vXnIgTx9sC9ehnh+DSAjx4b/nJTrr2NPJqHAZ5DrEggnRHgfnQHq8ChByWuINoPxMFIWHRo/6xSFWA24JsQK2RPOfFZDShfGNwxRw8U40zBrkE9/y6rMR6KX71gaPSoz5+9J0wLRWb41bx7xmMOlG/1ix8oL6xUkRQiT+fJuXDd/Xuu7bh36H5flwUTGJxn3CaDJ8i/wB+zer8Twj4V7cs+CLSszIqOsP8xnXwn0B7fdNw9ACweH43B5I8HXp0mFjRoGgAXjeS+HA0FOxC++mkgWsLI+sZy+ijqog8HuzXo0oZXnnGGBF0ftrKwrOyuWJRAoG95VxMj8rxL8plxKnmFL7yCEgwd/S7jq9erHCEx0IQdPARROLuISFErxqY2hxXrroGDqB7YDe/+x+nKq73h5iUayIICfVxXivjGafp2OY0BC2cxkUsvzocl/TGC42cA7+9RdVevcwZ4/N85RiTCpT6MAgl5bK9twfAF4VL6wwjXEkPftgqwT2H7eNVIseJ8f6MeEJ2KYgXnoHvAMFxmUsHimrTQNUW6lhxIn946oO+AU+PnLF8GHiecVFiWxc4DQK+BUJMGD0Tj84PW5l+77woPFfYFMMgPEYnqnjhItyJL+80cQLy8zM5kl4Yah0Cns+9ZRB+iuWRFlKp84OEhCnxglpKDVNi9KrTdJxjpwg5CTMnjqvvU4vUSED4wAYSMOhPep0H3KOauoQ9jKCyJff2Z+A2k+MIUmrL5L5/e5PvVPP1TRe62FhvBRBIHke48Y4UUuKV9CToZax8wx5zxhnRiinDtEctW0PUWfe7vURDA6nASGQtwQOhJ6h4uCYCZEjfC4UAlFM5fVxsISpWP3vnhhGiZIE614PMyBX7CsXM/nzUL4jMwUQQ4z7rO9j4a9btEShWn7yB3Hn1vzumdPv/AFDW/Fnzp5uXkOoetfRnEqqT3E+d7GnpJ4+cmXxI6b8ZKzt75BwqXZ0e3zd5qmrG5RYo2pxfCZlF+xOoen9aZAPiTq+/GvDPgEjKJn5y+T7c+mzvdr4Y+WVF9i6TwuTIejF5PWkAr5VmegpYvVyaKHpwZQank0gFcLzsxUCPIyT489y6ynyP6MJfKWC+S0znro5v8vd0y1nl4fF5M6F1U6OfvIldCE5P6mqcRO0R8HHliKM+64ZTUX5sgh6v4ATeDQJ5yoISA43XL9jnMIBX7Bz9b3KYg6cudv3MgIYCiD5zq7oIr05eF1PtPnIR98V8vZngHqHmZ8R6GOXYkf28rlEIJ3x9NEI9HhH/AM40JWoo/wA5lo4T63yRvdRqRg8MLDIII8grVwBUPoeJx7nSKXr07mc3fEzeIEqZU/vBjgDWWdM15FdhzWjVHlJ9nzNWBdh3Iefyd/nlx0Y6L2naXw5qN815OfOUCCRha8WZnJE4f+xuoRwK7j6ii+jr184Hylg8jvIAP26/x9WpgUgeFiwIZABTBsTqeQnjArOuRGjbiEEWKr8zOAqQ/wBM0bVgMvw7ogTdAnPk+TE+/bm/TTMGxiT/ALTADanhyk9fO6IB6Iw++TXtdCXgHABQ9KFiPkz04RJGp3e01Fyv/wA/eWsLe/JdDwb0HH+ckNjRxfRhwgXKV+spLwJe05iyFR+njFWF8udfzhmI2PdBc9FX4dInAq8UyLfPD3f1/kxXl/matTz476MMluI+rvllW+sXvsnV+UNxIsPiz949/wAWP24sKGGrKjz8ndGtgUOJmPERxcEOeA5e9unyqIBPlPgzHN6UfH2zNIEP2woRBVPJ9ZkBPgsXnrcwjwxlyOKrK5BXyH9Y+oC6q48SYpzJfgy7DrfG51eFtYvzm854pTBoespORP8AWukGP9KZPcD4PycNyrDav8X+conpMsgVQ88vt0DAMSeZ5MUp0TQi6C6DKsieDCOpcEPBhnkAfwY5JFiBExESvZ3wY8ovd84BEUpznntMK22+Sl+jIIIOlz5luv3ITmJYp/hOmVqFy1l+csyhofb4ML3zHo56gRRey/c0MrCnVE9Z3U4O0rlBar9Hp1wGKPZ/1n0ofCJj9pmKQAZ5eHT0+EeD9+92SyhE1UBQ/Bfr5xhygC/OXKS8jjH+tdcShW1+cWZYDItoRkdAcd1zuvGQWfATxluvOr/Cz05URw8xH9ZVVP1dzRxPHX+c2HkF24ChLRW9EyHfIcAk9YUWiOrwH2cz0oH5O4aUiowU+NxlKCRH6YyqOqxH/fbm1D1IruSaJJ/mPxmEl8X6vscl+/MS1QG885YXzdTj73SEXAnnN4lqFB8HeKCL7MT5KgK2ex3XuxUnx77og8l3yeGd1Jyj/GGV6FHhclZQr4ZdPii74C9mZepT9twheC/+porgfTDlF+634cUfF6Ksj0PHl1kCJYIH6ymgAT5MViI/Hr4XADr99DJepDr719S/qGFUJf1yTT1WHhPtf6d18W52n1uX2sPvQekzyRX6Pv5Mw066lJ/TmLjhsURvKm75QQXVT2zCECq6On1ewxSSjx2h5kqwYzYeqfW8MZR2j6HyPv8Ag0fPEPj43CVRw9QPLuiSfPXv/WRNHzpUFzSREDjAf/WAjfscH0YWJ4La4SzfsaryvzgB6pK+DJyQFdEnmnrIIQvUh6LmCEXQDqfLfjRgLBfpCPGm8Zx6DjR3ocTzuAdhbYiccruJ4PluoUHjxH4wdWoUCh9YLFVX1LMKKDeYPn1hDEoK4NiXPUmL1WNjnCyeApW+MVYHJvT9Z9kX4xTnLj+29ux3SAgeveHhrvB1PVN2S4BTKZ0qF314c2Hen25OZelYDLycmUWxTFVZmQb3hywC4UHbllLxhov3l6SXgfK51M1U8k1Cjluge0Cb17TFPJS/D2mGrgGH0fPcuOqotf2btGj0InEKr9dRn5iQd8D5zr0CQRDKhOWU54zQIZ7JrNAF4+HMuICB1OMgEpHlPZiImTvr+zccADnPsu+sh6LJ7xNzVC7jJ9l7xQ4vn7MDMt+xrOKnFFlP5MTch2P7DDUKebB+MDV8AsDSAOvzTBRp4R7Yfeb3MBCAJ8JfouTSAcTJf+sqvJIU4/S6DBPAx/jXBox4IHtM2QKPIM1xcSseKiCzzxB+n3vkmjdBJD6uRv8AmBvKA/JY5AISWt+ZlKgPo1RAJ0GH9GQnP7YTwj5uXI2H46hP3Duard1b/o87k6kHw8bxDCpMBhxnX5MWC7MlyU+gwKovunucKDBSXF+l8SkC6Tpcwg8fPeuoI0VKRPjIoVkafLnlg2C0HR7xxRfZcATvRyzZ0oofcxDyCDykcOZPB8//AD713M9G+M2Snn6TUg/tfJ+n4wdSwg3ysJzyvhu8g/uKPwYqgWw89bhBD4aYgsKIPg0kC0wUikfCP607FShi/GiZPuLJmDbPD2+/vcckh0S9MAcTx1SGYbgSFvxzhcHCTxB8GyOWp0SvD9XzkaFIhEfs0OgGgmcOolLFztG+StL9akUpRq9fA7ycHtrl/wCsez8iWN+WCfbynFnhvvCd2PM3NZANjP7wU40RQxse6E7c5Br4PnI4GH0+zObbQET60GgHH/pcxICqv67TKAAvl19LzIiHlPmO4UAh4FcMGtSC4kwvfKJ8Y6KqHyqGf7iOst18yjQuVSCBoQfu+RuB2lqDERqSlPndGMCcMJG+b88XO0C1+s/knegbyR8P8vX1htH2B9Y8Ukk+RTxHB80Of4GYKMx9Wx08USp6DcN/Qtq+8ENFHtc7lAgU84msFlxPv/073PPb/Q47afeECD7TNcD7S4Rnf82/SYbO74ED+xOZInTwff3HNPU8U3daAj5vMueG6iL7HwZUERHAcy9hGDERGz+m3EUcFnjQg9bOPhgDPkhP35yvLh4JGZiyq700ID0rrMJvgZK66ZirfhTzx94dxwvjjRjRV3z0yiUQXlLzuAXVn1jyzNXiBKEygKGguuBHwakzACh763HAHpe3FATvV8P1pcTAUn84qySp+vjEOZ5Z/k05HBJLPnGHkEwUQLBufrEJyPuZR2PRfqfWSXX7j+GOWMjXleCfOJEG6HgH183BEYrdGkUPHz+lzBmzXhC+85eAr4hPZlZDShQ/9Y9xI4rR9JiCQYCI8/OmDEZILuQiHtPGR4k6iUctdfXDcT3H+jjAUcRrgLcjoDro1Q80+DO7AiU3aloDGOmrSjPfkTxHPEgl+R5w97wfYHGO0rHIy3mn+QnXq48RAAfK63lvS80zwyHsrlFBnPS3D0P6uPOH0AWdMOhiFKlfgPjD4ph+TLmTFHiPoy26EvvUl7G/dZFQge8s9mSQcS9K+6aDgY+33k8Sc+yenIVAeoMqnb6pw4P0+tYc4y0OKv3MiF1S2Sfp1XQfa2Z7i5wPNn+tdwryPi/ThVX7PZp6n9CwuB/hcbPpH/64tSXyp+6PdxXQv/Ruo4g9oP8Ak6+6T28G8H4On9ZYDHx1n8eMbQTlT/PzW4CnT4ZXymgook+O4txQQDr6P7MvbDKPZgP2DnjzpnouAHlXKTf3XLtfpHlBmfBfIe59bnm9DxSe8QHsP03q/wBepl3zMcvlOPTz/wCtxtCEGed6irnl49OTCe0tPP8AHOI4nefXzZPT7H1c4E6UU9fjIxbbWxOma0voUj06g58zpnx4c3glIfvzjPprcoU2p4a8RijJ9+sP5aj143V9kLlZyhFOOcjuqeSbnbj1HjMWgfGknhcIzC8eE6+RB6Jpo8Toa16TdsBFeDzD60mmA8Bj1ZT4bvluBj5+/TgubaNv3MyHnWpmhygeaJ4fWSAKsHy0oI+QGD/JlXYXrzXzzFfE9YP7+MKEqItXM/EKfJNYXTqED5wjkWrxfWDKhJF6MJasKlA+fn4yw/SsPthSeAnu+plF849FZlcBnREJotcUxQb7D+HgjmCorpkn1vCMAq8JxmAaKhfa+MHfZefE94VALzPkfjBeHsn1hXAHIfPBy4Asl9k5p0k38DzC9YtbrBw7YfBciGKlVWeroplCwwjOALgKfWRTPBB5/Hdybpx8P5uAgWvqZWIyte3IKSA786lP0D7ytvgr7HUqUx66M85hBT8nTGl54bE0UPj134b+I/6OFUH7X/eUK/pf+9VU/wD/ABeFzb+LvNMXxX3geSbPZ4mGchROGP8A1mBBTxfF9YsucTywMBP1m5PuBTjNwP8AQJpAlKQbyXMifI+X5V3hUe/X1ikvR8tKCGj4G5Qf0ublCMLOSI/Ug6KPpOdQc9kQ6ng/OVKh8KfRMUQcD0iYLkP08eve8zJwF0yxxeh5uYBWUJfjLYSPav2a6D8nwy9+HBj6cHyP6zvyGdOl9YAK9ftoZBiexHKFQL59OISm+ji48aeT1cQEUGkKuhpw8BP7MUMHwDvPfXcZxLfdy9pt7/hmDOFF4cxHqJLctgVRQ46jzt09T714gfcNc8XF/sb0MXyNt+tB3AGL/COQALnwh8btADy6ygREXv6x54vQ63VFL3hwA0fR0GcDe0rKyZhPcvejt1r0/rIRXlb/AIZcUXg6M7rSAIfCBZuAD2B+nu8sBTgj4f8AHnXIwR+mSwIr+zJZXEwUXg8Z4X1pzMNWp908PxlfRQvmCNaJV5P1x/oxNDx8/wCs5rsHka95DgB65M6lD7s8H1rYme0/hNwAvUV78tyU5MIscZVFfFjoBes/ThnWp/H9uXKPZHMzJwjb4MF/gjUfOiVL9YwmaB8O5D/djslfvD9mS/bjJIT8hBiBPv8Ay/Ju85Kn4+fkfJguAS+P9PrEu+KVd+Dco68Tf88YwccQZSHPln98B910B7cByag5RkRmnfhD4wFROq+5ZhiKsp84iLBgVx9hFOJfvWrsNSF+TIpnwRzhk/UAThfZ0FKlrw+XHunvyH6zXrUi/Pmb0cHv8YISlLxwzVQf5P63CsfeXM6gSHDvMwtIctg/rWFsu8lxgtC/bhpiW4ToerYKPpg6kLbE560BUeIRowiweuPQ8lHmnjeO+CZefW8NQekL05cPy2WX/wB65cIJ3muRB/M/bm8AAMeNN6FZoBf6zCJ7PTvjMiiU4gvrJVkexD5NDA9YyObPsYUQgxXyPRb3Cq+Z/l8b00PJS/63jGrVPJ8TH20bX4r8a/h6qoMMgz5DxT126uWJWeZ84awYMWCFAj4E58aoIlIz1zmOoQEfXO66nuKejhyw6fHOmJBUU5U5SiYHGPz7WL4dM0Ow1sAKff8A7mCA5V+huJMj4N0FE7AfjGngSD04ZSngA/tqqUcX/sxCLG+DUlfp58jxu7Yr2lyRorF5iAtPzHNcuTo5g4UAvofFcnUIoPr/AK3gdIT2aNgSxPeNoA+jDFaojd5GYqYP5B7cyWHYFq7q6JeplLC3xj1l8vWY90P/AHYXST5CP2JzcV/CH/XjIcI+MOLP24iJ1ngv605FQPZ5Za1h7TyUxCcXoUB9mjCIQsEZ6xSGlSgH3gh6wJZ9ms5XO7496rWTj/1zmXKDaA3UE2tblwOKA9L5H+Met1ZEaMrhA1Cvn9TT8NvxZg8xXYpP4zJry6q3CpRL48a7TtFyZX3lEb8eMhoHgowfwQHqaeDzldzGnntx3LrChfL7yapHy6l0muFfJ+zerKW81BoPkNDeYCVhiiTQI4ocfTxcmYA5Z5n+8QNpHPa12ISEcO50EARXjn61IIO+SB/O5xD6V/6w7r9F8eiZPTZ1X0+sKaFz0x+DWZYMIqv/AKcnwHMH4OsWni9DOOiTiM7VL2booscvF/WOMkFwj4bTKndnmzDJVEpSHrSrhHE8+xY+Ngp7uItWS1t+ww77jwQLP+95kf1U1OFkhjgDtTUThC3nncw9fpdYTD5lPBdJ7Uv883vZ1RwHYfOedTxTtnwoBIosxWReX0+zBgppSlNLAgsli6kl4s01VbMBz5+fd3UkT37/AFhIflV7HAAXiRnQc7V8OjrlUL4p79YVo2auySL8zHCDp7K0lkfPwH/vKOBPD3KClOHM9AAniUzC+SiOUnj0H/vXuS0BL6uo8it3Cnygx+751wvDiD/bz+s0n6h3/Fxb0AJ/BcgMU8Ph9f5HMRQzGE9HXvR94R4p/OFPpKky2Snwe3+cBxXlKPXTccoLRt7/ANaLbxvgT5dw7j0e/vvZvDwjofJ86rxEK/ExHJ0YsxQ4PUHcEvzmRxH9H97qcAJmf+j3vznqkOqFyMsYnwU37CGJGBi/7m6AQQfbs5iKSIDOx45n1TgRHHgATZkQPglied1U55548OCqdSvGJYiFRL5OzdOap2NRjwsDF/W8W93HjgPdIunHvNE6BHw/esrlGPePnHCPgD09u7SlIeqPcQPCblecyB5HUihcfvVrUT7e63A6rxE3AvLnp0sWnU1SB1Fzjs3CQ6R4PT8nFCSh9HX61v7PihjPaO4lWdo5JoT21xlKVXy93V0BEXr0xzXsVD0Z8lAJ5JHMGKJu7U5uCtPWNQieCHS7xNQSwSagryX0+ib5m1aTxvmko/sDOlRPg5nxVPy8Pu68YctetKzUQVr94Qk32+dBA6+J9jDzR2Uni7jKtSPnIb8vPnCyqzpH5cxJKePKOTIKnCmQWQ4Llh4El0A1Q6c0Wi/0M3vgAR6Oh9xZ9/xcu1ks96oITxp30Pd0l5Bi78PR8NCX3ifqGEnt4E/25OhR0E8I+iMcDi1Hm8FnjBPYIPRk7JYU87lD5Cyh96NT91ihkkcHEUb9OjgifI77NMQORex9H26q+Mbf5ZVEnqkfWJZMtF9fWZY5cE/zN7d3x940WiQez3c5EUdMI4ZCz0cn70iBMYF7uSR7I/4dLkPl/W66K9dOIHkHnXigls5o2gcjf7dCVQtciYkNxkcuQI8A/wBOV9qcPN3mACWvAEu98UCjVzFdBXy32TJuQKOv3Q1/6NdsHS/L84qgc8nf2yuUMJeP7yNwnQef4wGwR8A6+6Ltcv1mhB8BMjh2rDdIgRa6xFSJ/VM3pfCOgWp7UwYr0fhuKqKnivkzUbgg9G3PeNBT5YhxRUbzIb1oEFg8NFiPbdZIiKT+tz2JiviOdROkeYYMIn1gIe+zCeCXGZcl4b5L6XJuv9gnl/WIPASfHCmOavHtLjpdk/ZzBISUTr/W/9k=	\N	\N	\N	\N	\N	\N	\N	+91 99000 11222	Morning Atelier (09:00 - 18:00)	2026-09-30 12:37:33.221838+05:30	2026-10-02 12:40:14.296419+05:30
\.


--
-- Name: app_users app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);


--
-- Name: app_users app_users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_username_key UNIQUE (username);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: branches branches_branch_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_branch_code_key UNIQUE (branch_code);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: collection_activities collection_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_activities
    ADD CONSTRAINT collection_activities_pkey PRIMARY KEY (id);


--
-- Name: collections collections_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_code_key UNIQUE (code);


--
-- Name: collections collections_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_name_key UNIQUE (name);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);


--
-- Name: customer_body_measurements customer_body_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_body_measurements
    ADD CONSTRAINT customer_body_measurements_pkey PRIMARY KEY (id);


--
-- Name: customer_measurements customer_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_measurements
    ADD CONSTRAINT customer_measurements_pkey PRIMARY KEY (id);


--
-- Name: customer_notes customer_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (mobile_number);


--
-- Name: designs designs_design_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_design_code_key UNIQUE (design_code);


--
-- Name: designs designs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_pkey PRIMARY KEY (id);


--
-- Name: employees employees_employee_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_code_key UNIQUE (employee_code);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: enquiries enquiries_enquiry_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_enquiry_code_key UNIQUE (enquiry_code);


--
-- Name: enquiries enquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: garments garments_garment_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garments
    ADD CONSTRAINT garments_garment_code_key UNIQUE (garment_code);


--
-- Name: garments garments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garments
    ADD CONSTRAINT garments_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_item_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_item_code_key UNIQUE (item_code);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: measurement_points measurement_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_points
    ADD CONSTRAINT measurement_points_pkey PRIMARY KEY (id);


--
-- Name: measurement_profiles measurement_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_profiles
    ADD CONSTRAINT measurement_profiles_pkey PRIMARY KEY (id);


--
-- Name: order_progress_stages order_progress_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_progress_stages
    ADD CONSTRAINT order_progress_stages_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_code_key UNIQUE (order_code);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: production_stages production_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_stages
    ADD CONSTRAINT production_stages_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_po_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_po_code_key UNIQUE (po_code);


--
-- Name: qc_checklists qc_checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qc_checklists
    ADD CONSTRAINT qc_checklists_pkey PRIMARY KEY (id);


--
-- Name: stage_definition_employees stage_definition_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stage_definition_employees
    ADD CONSTRAINT stage_definition_employees_pkey PRIMARY KEY (id);


--
-- Name: stage_definition_employees stage_definition_employees_stage_def_id_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stage_definition_employees
    ADD CONSTRAINT stage_definition_employees_stage_def_id_employee_id_key UNIQUE (stage_def_id, employee_id);


--
-- Name: stage_definitions stage_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stage_definitions
    ADD CONSTRAINT stage_definitions_pkey PRIMARY KEY (id);


--
-- Name: stage_definitions stage_definitions_stage_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stage_definitions
    ADD CONSTRAINT stage_definitions_stage_key_key UNIQUE (stage_key);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_supplier_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_supplier_code_key UNIQUE (supplier_code);


--
-- Name: trial_alterations trial_alterations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trial_alterations
    ADD CONSTRAINT trial_alterations_pkey PRIMARY KEY (id);


--
-- Name: trials trials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trials
    ADD CONSTRAINT trials_pkey PRIMARY KEY (id);


--
-- Name: trials trials_trial_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trials
    ADD CONSTRAINT trials_trial_code_key UNIQUE (trial_code);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_alterations_trial; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alterations_trial ON public.trial_alterations USING btree (trial_id);


--
-- Name: idx_appt_scheduled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appt_scheduled ON public.appointments USING btree (scheduled_at);


--
-- Name: idx_appt_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appt_status ON public.appointments USING btree (status);


--
-- Name: idx_branches_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branches_active ON public.branches USING btree (active);


--
-- Name: idx_branches_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branches_city ON public.branches USING btree (city);


--
-- Name: idx_branches_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branches_type ON public.branches USING btree (type);


--
-- Name: idx_cbm_garment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cbm_garment ON public.customer_body_measurements USING btree (garment_type);


--
-- Name: idx_cbm_history; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cbm_history ON public.customer_body_measurements USING btree (customer_mobile, garment_type, version DESC);


--
-- Name: idx_cbm_mobile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cbm_mobile ON public.customer_body_measurements USING btree (customer_mobile);


--
-- Name: idx_cbm_mobile_garment_current; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cbm_mobile_garment_current ON public.customer_body_measurements USING btree (customer_mobile, garment_type, is_current);


--
-- Name: idx_cmeasure_garment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cmeasure_garment ON public.customer_measurements USING btree (garment_type);


--
-- Name: idx_cmeasure_mobile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cmeasure_mobile ON public.customer_measurements USING btree (customer_mobile);


--
-- Name: idx_col_act_col_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_col_act_col_id ON public.collection_activities USING btree (collection_id);


--
-- Name: idx_collections_feat; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_collections_feat ON public.collections USING btree (is_featured);


--
-- Name: idx_collections_season; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_collections_season ON public.collections USING btree (season);


--
-- Name: idx_collections_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_collections_status ON public.collections USING btree (status);


--
-- Name: idx_collections_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_collections_year ON public.collections USING btree (year);


--
-- Name: idx_cust_notes_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cust_notes_date ON public.customer_notes USING btree (created_at DESC);


--
-- Name: idx_cust_notes_mobile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cust_notes_mobile ON public.customer_notes USING btree (customer_mobile);


--
-- Name: idx_customers_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_name ON public.customers USING btree (name);


--
-- Name: idx_customers_tier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_tier ON public.customers USING btree (tier);


--
-- Name: idx_design_collection; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_design_collection ON public.designs USING btree (collection);


--
-- Name: idx_design_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_design_created ON public.designs USING btree (created_at);


--
-- Name: idx_design_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_design_created_by ON public.designs USING btree (created_by);


--
-- Name: idx_design_occasion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_design_occasion ON public.designs USING btree (occasion);


--
-- Name: idx_design_prod_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_design_prod_status ON public.designs USING btree (production_status);


--
-- Name: idx_design_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_design_status ON public.designs USING btree (status);


--
-- Name: idx_emp_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emp_code ON public.employees USING btree (employee_code);


--
-- Name: idx_emp_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emp_role ON public.employees USING btree (role);


--
-- Name: idx_emp_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emp_status ON public.employees USING btree (status);


--
-- Name: idx_enq_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enq_created ON public.enquiries USING btree (created_at);


--
-- Name: idx_enq_source; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enq_source ON public.enquiries USING btree (source);


--
-- Name: idx_enq_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enq_status ON public.enquiries USING btree (status);


--
-- Name: idx_garments_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_code ON public.garments USING btree (garment_code);


--
-- Name: idx_garments_col; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_col ON public.garments USING btree (collection_name);


--
-- Name: idx_garments_due_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_due_date ON public.garments USING btree (due_date);


--
-- Name: idx_garments_order_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_order_code ON public.garments USING btree (order_code);


--
-- Name: idx_garments_stage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_stage ON public.garments USING btree (production_stage);


--
-- Name: idx_garments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_status ON public.garments USING btree (status);


--
-- Name: idx_garments_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_type ON public.garments USING btree (garment_type);


--
-- Name: idx_inventory_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_category ON public.inventory_items USING btree (category);


--
-- Name: idx_inventory_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_code ON public.inventory_items USING btree (item_code);


--
-- Name: idx_inventory_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_status ON public.inventory_items USING btree (status);


--
-- Name: idx_mpoint_profile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mpoint_profile ON public.measurement_points USING btree (profile_id);


--
-- Name: idx_mprofile_garment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mprofile_garment ON public.measurement_profiles USING btree (garment_type);


--
-- Name: idx_order_progress_stage_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_progress_stage_key ON public.order_progress_stages USING btree (stage);


--
-- Name: idx_orders_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_code ON public.orders USING btree (order_code);


--
-- Name: idx_orders_customer_mobile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_mobile ON public.orders USING btree (customer_mobile);


--
-- Name: idx_orders_customer_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_name ON public.orders USING btree (customer_name);


--
-- Name: idx_orders_expected_deliv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_expected_deliv ON public.orders USING btree (expected_delivery_date);


--
-- Name: idx_orders_order_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_order_date ON public.orders USING btree (order_date);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_payments_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order ON public.payments USING btree (order_id);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_po_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_po_status ON public.purchase_orders USING btree (status);


--
-- Name: idx_po_supplier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_po_supplier ON public.purchase_orders USING btree (supplier_id);


--
-- Name: idx_poi_po; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_poi_po ON public.purchase_order_items USING btree (po_id);


--
-- Name: idx_prod_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prod_order ON public.production_stages USING btree (order_id);


--
-- Name: idx_prod_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prod_status ON public.production_stages USING btree (status);


--
-- Name: idx_progress_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progress_order ON public.order_progress_stages USING btree (order_id);


--
-- Name: idx_qc_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_qc_order ON public.qc_checklists USING btree (order_id);


--
-- Name: idx_sde_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sde_employee ON public.stage_definition_employees USING btree (employee_id);


--
-- Name: idx_sde_stage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sde_stage ON public.stage_definition_employees USING btree (stage_def_id);


--
-- Name: idx_stage_def_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stage_def_active ON public.stage_definitions USING btree (active);


--
-- Name: idx_stage_def_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stage_def_key ON public.stage_definitions USING btree (stage_key);


--
-- Name: idx_stage_def_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stage_def_order ON public.stage_definitions USING btree (sort_order);


--
-- Name: idx_stockmov_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stockmov_item ON public.stock_movements USING btree (item_id);


--
-- Name: idx_trials_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trials_code ON public.trials USING btree (trial_code);


--
-- Name: idx_trials_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trials_customer ON public.trials USING btree (customer_mobile);


--
-- Name: idx_trials_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trials_date ON public.trials USING btree (trial_date);


--
-- Name: idx_trials_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trials_order ON public.trials USING btree (order_id);


--
-- Name: idx_trials_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trials_status ON public.trials USING btree (status);


--
-- Name: idx_txn_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_txn_payment ON public.payment_transactions USING btree (payment_id);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.app_users USING btree (username);


--
-- Name: appointments appointments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: branches branches_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: collection_activities collection_activities_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_activities
    ADD CONSTRAINT collection_activities_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE;


--
-- Name: customer_body_measurements customer_body_measurements_customer_mobile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_body_measurements
    ADD CONSTRAINT customer_body_measurements_customer_mobile_fkey FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: customer_notes customer_notes_customer_mobile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_customer_mobile_fkey FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: designs designs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: enquiries enquiries_converted_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_converted_order_id_fkey FOREIGN KEY (converted_order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: appointments fk_appointments_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: customer_measurements fk_cmeasure_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_measurements
    ADD CONSTRAINT fk_cmeasure_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: designs fk_designs_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT fk_designs_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE SET NULL;


--
-- Name: measurement_profiles fk_mprofiles_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_profiles
    ADD CONSTRAINT fk_mprofiles_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: orders fk_orders_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE RESTRICT;


--
-- Name: payments fk_payments_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE RESTRICT;


--
-- Name: garments garments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garments
    ADD CONSTRAINT garments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: measurement_points measurement_points_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_points
    ADD CONSTRAINT measurement_points_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.measurement_profiles(id) ON DELETE CASCADE;


--
-- Name: order_progress_stages order_progress_stages_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_progress_stages
    ADD CONSTRAINT order_progress_stages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payment_transactions payment_transactions_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE RESTRICT;


--
-- Name: production_stages production_stages_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_stages
    ADD CONSTRAINT production_stages_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: production_stages production_stages_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_stages
    ADD CONSTRAINT production_stages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;


--
-- Name: purchase_order_items purchase_order_items_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE RESTRICT;


--
-- Name: qc_checklists qc_checklists_checked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qc_checklists
    ADD CONSTRAINT qc_checklists_checked_by_fkey FOREIGN KEY (checked_by) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: qc_checklists qc_checklists_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qc_checklists
    ADD CONSTRAINT qc_checklists_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: stage_definition_employees stage_definition_employees_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stage_definition_employees
    ADD CONSTRAINT stage_definition_employees_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: stage_definition_employees stage_definition_employees_stage_def_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stage_definition_employees
    ADD CONSTRAINT stage_definition_employees_stage_def_id_fkey FOREIGN KEY (stage_def_id) REFERENCES public.stage_definitions(id) ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE RESTRICT;


--
-- Name: trial_alterations trial_alterations_trial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trial_alterations
    ADD CONSTRAINT trial_alterations_trial_id_fkey FOREIGN KEY (trial_id) REFERENCES public.trials(id) ON DELETE CASCADE;


--
-- Name: trials trials_customer_mobile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trials
    ADD CONSTRAINT trials_customer_mobile_fkey FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: trials trials_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trials
    ADD CONSTRAINT trials_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict n0Pile5mjBIXfSYZhz4p9I1dllfmISukiWdAlbkNOZsN7YbFvdXlGMI3OZJCIx5

