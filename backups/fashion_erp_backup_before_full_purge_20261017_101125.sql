--
-- PostgreSQL database dump
--

\restrict bjIsikBkDQs6kbKxBBQU0gc0jfzIyrCXswiH8JvaKf5vF3zaDoPCPQNJ81wDndm

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

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


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
    allowed_modules text,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    allowed_branches text,
    access_scope character varying(100) DEFAULT 'Full System'::character varying,
    approval_limit numeric(14,2),
    access_health_score integer,
    status character varying(30) DEFAULT 'ACTIVE'::character varying,
    last_active_at timestamp without time zone,
    risk_level character varying(20) DEFAULT 'LOW'::character varying,
    risk_notes text DEFAULT 'No critical permission conflicts detected.'::text,
    authority_limits text DEFAULT '{}'::jsonb,
    branch_access_details text DEFAULT '[]'::jsonb
);


ALTER TABLE public.app_users OWNER TO postgres;

--
-- Name: COLUMN app_users.allowed_modules; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.app_users.allowed_modules IS 'JSON array of module key strings the user may access. NULL = role default applied at login.';


--
-- Name: COLUMN app_users.allowed_branches; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.app_users.allowed_branches IS 'JSON array of branch codes or names the user has access to. NULL/empty falls back to assigned_branch.';


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
    customer_mobile character varying(30) NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    qc_progress integer DEFAULT 0,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    share_customers_across_branches boolean DEFAULT true NOT NULL,
    share_orders_across_branches boolean DEFAULT true NOT NULL,
    share_enquiries_across_branches boolean DEFAULT true NOT NULL,
    share_measurements_across_branches boolean DEFAULT true NOT NULL,
    share_inventory_across_branches boolean DEFAULT true NOT NULL,
    share_garments_across_branches boolean DEFAULT true NOT NULL,
    share_trials_across_branches boolean DEFAULT true NOT NULL,
    session_timeout_minutes integer DEFAULT 20 NOT NULL,
    share_designs_across_branches boolean DEFAULT true NOT NULL,
    share_purchases_across_branches boolean DEFAULT true NOT NULL,
    share_workforce_across_branches boolean DEFAULT true NOT NULL,
    currency_symbol character varying(10) DEFAULT '₹'::character varying NOT NULL,
    order_prefix character varying(10) DEFAULT 'ORD-'::character varying NOT NULL,
    invoice_prefix character varying(10) DEFAULT 'INV-'::character varying NOT NULL
);


ALTER TABLE public.company_settings OWNER TO postgres;

--
-- Name: COLUMN company_settings.session_timeout_minutes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.company_settings.session_timeout_minutes IS 'Inactivity auto-logout duration in minutes (0 = disabled, default = 20)';


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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    delivery_preference character varying(100),
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    branch character varying(100) DEFAULT 'Main Branch'::character varying,
    customer_code character varying(30),
    loyalty_points integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: designs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.designs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    design_code character varying(50) NOT NULL,
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
    created_by character varying(100),
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    is_variant boolean DEFAULT false NOT NULL,
    parent_design_id uuid,
    parent_design_code character varying(30),
    variant_suffix character varying(30),
    neckline character varying(150),
    sleeve_style character varying(150),
    back_design character varying(150),
    lining character varying(150),
    padding character varying(100),
    readiness_score integer DEFAULT 85,
    variant_alteration_notes text,
    turnaround_days integer DEFAULT 12,
    accent_fabric character varying(150),
    complexity character varying(50) DEFAULT 'High'::character varying,
    closure character varying(100),
    branch character varying(100) DEFAULT 'Main Branch'::character varying
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    department character varying(100) DEFAULT 'Stitching'::character varying NOT NULL,
    salary numeric(12,2) DEFAULT 0.00 NOT NULL,
    branch character varying(100) DEFAULT 'Main Branch'::character varying NOT NULL,
    workload integer DEFAULT 0 NOT NULL,
    efficiency integer DEFAULT 95 NOT NULL,
    completed_month integer DEFAULT 0 NOT NULL
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
    avatar_url character varying(255),
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    branch character varying(100) DEFAULT 'Main Branch'::character varying
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    notes text,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    branch character varying(100) DEFAULT 'Main Branch'::character varying,
    supplier_id uuid,
    color_hex character varying(30),
    color_name character varying(100)
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
    sort_order integer DEFAULT 0 NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    customer_mobile character varying(30) NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    branch character varying(100) DEFAULT 'Main Branch'::character varying
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
    notes text,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    qc_rework_count integer DEFAULT 0 NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    branch character varying(100) DEFAULT 'Main Branch'::character varying,
    design_id uuid,
    design_code character varying(50),
    design_category character varying(100),
    priority character varying(30) DEFAULT 'NORMAL'::character varying NOT NULL,
    assigned_to character varying(100),
    measurement_profile_id uuid,
    neck_style character varying(100),
    sleeve_style character varying(100),
    fabric_type character varying(100),
    fabric_colour character varying(100),
    fabric_source character varying(50) DEFAULT 'BOUTIQUE'::character varying,
    payment_method character varying(50) DEFAULT 'CASH'::character varying
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
    notes text,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    customer_mobile character varying(30) NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    sort_order integer DEFAULT 0 NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    received_qty numeric(10,2) DEFAULT 0 NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    branch character varying(100) DEFAULT 'Main Branch'::character varying NOT NULL,
    payment_status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    paid_amount numeric(12,2) DEFAULT 0.00 NOT NULL
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
    sort_order integer DEFAULT 0 NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    image_url text,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    moved_at timestamp without time zone DEFAULT now() NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    gstin character varying(20),
    pan_number character varying(15)
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
    completed_by character varying(100),
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
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
    next_trial_date date,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    branch character varying(100) DEFAULT 'Main Branch'::character varying
);


ALTER TABLE public.trials OWNER TO postgres;

--
-- Name: user_access_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_access_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    action_type character varying(50) NOT NULL,
    description character varying(255) NOT NULL,
    location character varying(100),
    client_info character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_access_logs OWNER TO postgres;

--
-- Name: user_active_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_active_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    device character varying(100) NOT NULL,
    location character varying(100),
    last_seen_at timestamp without time zone DEFAULT now() NOT NULL,
    is_current boolean DEFAULT false
);


ALTER TABLE public.user_active_sessions OWNER TO postgres;

--
-- Name: user_delegations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_delegations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title character varying(150) NOT NULL,
    valid_until timestamp without time zone NOT NULL,
    granted_by character varying(150),
    description character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_delegations OWNER TO postgres;

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
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    company_id uuid DEFAULT 'c0000000-0000-0000-0000-000000000001'::uuid NOT NULL
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- Data for Name: app_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_users (id, username, password_hash, full_name, role, active, last_login, created_at, updated_at, email, phone, avatar_url, designation, department, bio, assigned_branch, allowed_modules, company_id, allowed_branches, access_scope, approval_limit, access_health_score, status, last_active_at, risk_level, risk_notes, authority_limits, branch_access_details) FROM stdin;
53c406fc-424e-43ce-a0c7-e1a8c4f741b3	aura_owner	$2a$12$fc2TuV46vaFeRVitJLFi8OUWBfKsaV.NeqdH1fVLKaDNTD6TUVeEa	Aura Admin	OWNER	t	\N	2026-10-16 12:49:05.673342	2026-10-16 12:49:05.673946	\N	+91 98765 43210	\N	\N	\N	\N	\N	\N	d917a95b-bcd2-49a8-b945-56918a9c47e8	\N	Full System	\N	\N	ACTIVE	\N	LOW	No critical permission conflicts detected.	\N	\N
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, order_id, appt_type, scheduled_at, duration_minutes, status, staff_assigned, notes, created_at, updated_at, customer_mobile, company_id) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, branch_code, name, type, street_address, city, state, pin_code, country, phone, whatsapp, email, website, google_maps_url, active, is_headquarters, manager_id, working_hours, features, notes, created_at, updated_at, company_id) FROM stdin;
\.


--
-- Data for Name: collection_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collection_activities (id, collection_id, activity_date, description, activity_type, color, created_at, company_id) FROM stdin;
\.


--
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collections (id, code, name, subtitle, description, season, year, status, designer, branch, launch_date, is_featured, cover_image_url, thumbnail_urls, created_at, updated_at, production_deadline, progress_percentage, design_progress, materials_progress, production_progress, qc_progress, company_id) FROM stdin;
\.


--
-- Data for Name: company_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_settings (id, company_name, short_name, tagline, owner_name, business_type, gstin, pan_number, primary_phone, whatsapp, email, website, street_address, city, state, pin_code, country, logo_base64, created_at, updated_at, share_customers_across_branches, share_orders_across_branches, share_enquiries_across_branches, share_measurements_across_branches, share_inventory_across_branches, share_garments_across_branches, share_trials_across_branches, session_timeout_minutes, share_designs_across_branches, share_purchases_across_branches, share_workforce_across_branches, currency_symbol, order_prefix, invoice_prefix) FROM stdin;
d917a95b-bcd2-49a8-b945-56918a9c47e8	Aura Luxury Atelier	ALA	\N	Aura Admin	Bespoke Atelier	\N	\N	+91 98765 43210	\N	\N	\N	\N	\N	\N	\N	India	\N	2026-10-16 18:19:05.920841+05:30	2026-10-16 18:19:05.921902+05:30	t	t	t	t	t	t	t	20	t	t	t	₹	ORD-	INV-
\.


--
-- Data for Name: customer_body_measurements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, top_length, full_length, skirt_length, pant_length, armhole, upper_arm, sleeve_length, sleeve_round, elbow_round, wrist_round, front_neck_depth, back_neck_depth, bust_point, bust_point_to_bust_point, shoulder_to_bust, shoulder_to_waist, front_width, back_width, pant_waist, pant_hip, thigh_round, knee_round, calf_round, ankle_round, crotch_length, bottom_opening, waist_to_hip, flare, posture_notes, shape_notes, notes, recorded_by, recorded_at, updated_at, company_id) FROM stdin;
\.


--
-- Data for Name: customer_measurements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_measurements (id, customer_mobile, garment_type, bust, upper_bust, under_bust, waist, high_hip, full_hip, shoulder, cross_front, cross_back, armhole, sleeve_length, bicep, wrist, front_neck, back_neck, apex_point, garment_length, posture_notes, shape_notes, recorded_by, is_active_profile, recorded_at, updated_at, company_id) FROM stdin;
\.


--
-- Data for Name: customer_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_notes (id, customer_mobile, note_text, author_name, author_badge, category, created_at, updated_at, company_id) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (name, email, location, avatar_url, tier, total_spend, balance, favorite_garment, measurements_on_file, notes, created_at, updated_at, mobile_number, first_name, last_name, salutation, gender, alt_phone, instagram_handle, preferred_channel, dob, anniversary, street_address, city, state, pincode, landmark, credit_limit, fit_preference, fabric_allergies, preferred_neck, preferred_sleeve, preferred_occasions, delivery_preference, company_id, branch, customer_code, loyalty_points) FROM stdin;
\.


--
-- Data for Name: designs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.designs (id, design_code, title, garment_type, order_id, status, style_notes, designer, thumbnail_url, created_at, updated_at, customer_mobile, sub_category, style, occasion, collection, primary_fabric, colour_options, sizes, construction, embroidery, estimated_cost, suggested_price, estimated_labour, production_status, times_used, last_used_date, tags, image_urls, swatches, notes, created_by, company_id, is_variant, parent_design_id, parent_design_code, variant_suffix, neckline, sleeve_style, back_design, lining, padding, readiness_score, variant_alteration_notes, turnaround_days, accent_fabric, complexity, closure, branch) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, employee_code, name, phone, email, role, status, joined_date, avatar_url, specialization, notes, created_at, updated_at, company_id, department, salary, branch, workload, efficiency, completed_month) FROM stdin;
1acbf70b-6314-4937-b5e9-91c37df3fc3b	EMP-001	Amina Al-Mansoor			LEAD DRAPER	ACTIVE	2026-10-16	\N		Role: Lead Draper	2026-10-16 13:22:53.607275	2026-10-16 13:22:53.608462	d917a95b-bcd2-49a8-b945-56918a9c47e8	Stitching	0.00	Main Branch	0	95	0
\.


--
-- Data for Name: enquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, converted_order_id, source, created_at, updated_at, occasion, preferred_date, estimated_budget, next_action, fabric_brought, avatar_url, company_id, branch) FROM stdin;
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	init unified schema	SQL	V1__init_unified_schema.sql	\N	postgres	2026-09-25 17:33:17.762075	100	t
2	2	user allowed branches	SQL	V2__user_allowed_branches.sql	-1392298004	postgres	2026-10-06 19:25:15.274489	64	t
3	3	users roles governance	SQL	V3__users_roles_governance.sql	1806073971	postgres	2026-10-07 17:24:37.52634	42	t
4	4	garment 360 seed data	SQL	V4__garment_360_seed_data.sql	-300907860	postgres	2026-10-10 13:19:20.915283	250	t
5	5	design studio catalog seed data	SQL	V5__design_studio_catalog_seed_data.sql	-1427507229	postgres	2026-10-12 15:42:10.7784	427	t
6	6	measurement library seed data	SQL	V6__measurement_library_seed_data.sql	-587590374	postgres	2026-10-12 15:42:11.661972	1861	t
7	7	update production stages branch counts	SQL	V7__update_production_stages_branch_counts.sql	1088643827	postgres	2026-10-15 17:32:54.195108	186	t
8	8	add session timeout to company settings	SQL	V8__add_session_timeout_to_company_settings.sql	-1611691739	postgres	2026-10-16 19:02:00.690935	348	t
9	9	design variant lineage and blueprint attributes	SQL	V9__design_variant_lineage_and_blueprint_attributes.sql	656639590	postgres	2026-10-16 19:02:01.302273	291	t
10	10	comprehensive schema alignment and missing columns	SQL	V10__comprehensive_schema_alignment_and_missing_columns.sql	1597834557	postgres	2026-10-16 19:02:01.64695	139	t
\.


--
-- Data for Name: garments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.garments (id, garment_code, order_id, order_code, customer_name, customer_mobile, title, garment_type, specs, design_code, collection_name, production_stage, material_status, trial_status, trial_date, due_date, priority, payment_status, paid_amount, total_amount, status, assigned_to, designer, branch, image_url, notes, created_at, updated_at, company_id) FROM stdin;
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, item_code, name, category, variant, unit, stock_qty, reserved_qty, reorder_level, purchase_price, supplier_name, image_url, status, created_at, updated_at, composition, weave, width, gsm, hsn_code, origin, selling_price, location, lead_time, supplier_contact, notes, company_id, branch, supplier_id, color_hex, color_name) FROM stdin;
\.


--
-- Data for Name: measurement_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.measurement_points (id, profile_id, point_name, value, unit, marker_index, sort_order, company_id) FROM stdin;
\.


--
-- Data for Name: measurement_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.measurement_profiles (id, garment_type, recorded_by, notes, recorded_at, updated_at, customer_mobile, company_id, branch) FROM stdin;
\.


--
-- Data for Name: order_progress_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_progress_stages (id, order_id, stage, completed_at, completed_by, notes, company_id) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_code, garment_type, garment_desc, collection, amount, status, order_date, due_date, notes, created_at, updated_at, customer_mobile, customer_name, expected_delivery_date, delivered_date, advance_paid, total_amount, balance_amount, current_stage, reference_images, production_notes, qc_rework_count, company_id, branch, design_id, design_code, design_category, priority, assigned_to, measurement_profile_id, neck_style, sleeve_style, fabric_type, fabric_colour, fabric_source, payment_method) FROM stdin;
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes, company_id) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, total_amount, paid_amount, status, due_date, notes, created_at, updated_at, customer_mobile, company_id) FROM stdin;
\.


--
-- Data for Name: production_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.production_stages (id, order_id, stage_name, assigned_to, status, started_at, completed_at, notes, sort_order, company_id) FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, po_id, item_id, item_name, quantity, unit, unit_price, received_qty, company_id) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, po_code, supplier_id, status, total_amount, order_date, expected_date, received_date, notes, created_at, updated_at, company_id, branch, payment_status, paid_amount) FROM stdin;
\.


--
-- Data for Name: qc_checklists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qc_checklists (id, order_id, check_point, result, checked_by, checked_at, remarks, sort_order, company_id) FROM stdin;
\.


--
-- Data for Name: stage_definition_employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stage_definition_employees (id, stage_def_id, employee_id, assignment_type, created_at, company_id) FROM stdin;
\.


--
-- Data for Name: stage_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stage_definitions (id, stage_key, display_name, description, required_role, dept_label, color_class, sort_order, active, created_at, updated_at, image_url, company_id) FROM stdin;
b71e706e-9e8e-4e08-a3fa-911108484bd4	ORDER_TAKEN	Order Taken	Order intake, fabric requirements noted, advance paid and order committed to schedule.	STAFF	Order Intake & Reception	stage-emerald	1	t	2026-10-16 12:52:33.328342	2026-10-16 12:52:33.328342	/front end/assets/stages/Order_Taken_1010.jpg	d917a95b-bcd2-49a8-b945-56918a9c47e8
053609ed-7628-4698-af3f-31bc2fa2e4f5	READY_TO_DELIVER	Ready to Deliver	Quality approved, packaged with care and awaiting customer pickup or boutique handover.	SUPERVISOR	Delivery & Handover	stage-silver	3	t	2026-10-16 12:52:33.384901	2026-10-16 12:52:33.505447	/front end/assets/stages/Ready_8043.jpg	d917a95b-bcd2-49a8-b945-56918a9c47e8
0d0561fd-b16d-4ae3-a4cf-6a70b08e597f	QC	Quality Control	Final inspection before dispatch: stitching, measurements, finishing, and fabric quality verified by QC team.	SUPERVISOR	Quality Control & Inspection	stage-gold	2	t	2026-10-16 12:52:33.540533	2026-10-16 12:52:33.540533	\N	d917a95b-bcd2-49a8-b945-56918a9c47e8
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, item_id, movement_type, quantity, reference, notes, moved_by, moved_at, company_id) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, supplier_code, name, contact_person, phone, email, address, specialization, notes, created_at, company_id, gstin, pan_number) FROM stdin;
\.


--
-- Data for Name: trial_alterations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trial_alterations (id, trial_id, description, category, completed, created_at, assigned_tailor, priority, target_date, tailor_notes, status, completed_at, completed_by, company_id) FROM stdin;
\.


--
-- Data for Name: trials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, neck_style, sleeve_style, lining, embroidery, fabric, spec_notes, notes, created_at, updated_at, trial_attempt, alteration_count, customer_feedback, customer_rating, fit_preference, fit_checkpoints, fit_notes, completed_at, completed_by, next_trial_date, company_id, branch) FROM stdin;
\.


--
-- Data for Name: user_access_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_access_logs (id, company_id, user_id, action_type, description, location, client_info, created_at) FROM stdin;
\.


--
-- Data for Name: user_active_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_active_sessions (id, company_id, user_id, device, location, last_seen_at, is_current) FROM stdin;
\.


--
-- Data for Name: user_delegations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_delegations (id, company_id, user_id, title, valid_until, granted_by, description, created_at) FROM stdin;
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (id, user_id, full_name, display_title, department, email, phone, assigned_branch, bio, avatar_url, clearance_level, system_role_label, privileges_summary, member_since, tenure_tier, security_status, session_lifetime, emergency_contact, work_shift, created_at, updated_at, company_id) FROM stdin;
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
-- Name: stage_definitions stage_definitions_company_stage_key_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stage_definitions
    ADD CONSTRAINT stage_definitions_company_stage_key_unique UNIQUE (company_id, stage_key);


--
-- Name: stage_definitions stage_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stage_definitions
    ADD CONSTRAINT stage_definitions_pkey PRIMARY KEY (id);


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
-- Name: user_access_logs user_access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_access_logs
    ADD CONSTRAINT user_access_logs_pkey PRIMARY KEY (id);


--
-- Name: user_active_sessions user_active_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_active_sessions
    ADD CONSTRAINT user_active_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_delegations user_delegations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_delegations
    ADD CONSTRAINT user_delegations_pkey PRIMARY KEY (id);


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
-- Name: idx_app_users_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_app_users_company_id ON public.app_users USING btree (company_id);


--
-- Name: idx_appointments_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_company_id ON public.appointments USING btree (company_id);


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
-- Name: idx_branches_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branches_company_code ON public.branches USING btree (company_id, branch_code);


--
-- Name: idx_branches_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branches_company_id ON public.branches USING btree (company_id);


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
-- Name: idx_collection_activities_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_collection_activities_company_id ON public.collection_activities USING btree (company_id);


--
-- Name: idx_collections_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_collections_company_id ON public.collections USING btree (company_id);


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
-- Name: idx_customer_body_measurements_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_body_measurements_company_id ON public.customer_body_measurements USING btree (company_id);


--
-- Name: idx_customer_measurements_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_measurements_company_id ON public.customer_measurements USING btree (company_id);


--
-- Name: idx_customer_notes_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_notes_company_id ON public.customer_notes USING btree (company_id);


--
-- Name: idx_customers_company_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_company_branch ON public.customers USING btree (company_id, branch);


--
-- Name: idx_customers_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_company_id ON public.customers USING btree (company_id);


--
-- Name: idx_customers_company_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_company_name ON public.customers USING btree (company_id, name);


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
-- Name: idx_designs_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_designs_company_id ON public.designs USING btree (company_id);


--
-- Name: idx_designs_is_variant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_designs_is_variant ON public.designs USING btree (is_variant);


--
-- Name: idx_designs_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_designs_parent_id ON public.designs USING btree (parent_design_id);


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
-- Name: idx_employees_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_company_id ON public.employees USING btree (company_id);


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
-- Name: idx_enquiries_company_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enquiries_company_branch ON public.enquiries USING btree (company_id, branch);


--
-- Name: idx_enquiries_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enquiries_company_id ON public.enquiries USING btree (company_id);


--
-- Name: idx_garments_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_code ON public.garments USING btree (garment_code);


--
-- Name: idx_garments_col; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_col ON public.garments USING btree (collection_name);


--
-- Name: idx_garments_company_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_company_branch ON public.garments USING btree (company_id, branch);


--
-- Name: idx_garments_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_company_id ON public.garments USING btree (company_id);


--
-- Name: idx_garments_company_stage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garments_company_stage ON public.garments USING btree (company_id, production_stage);


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
-- Name: idx_inventory_company_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_company_status ON public.inventory_items USING btree (company_id, status);


--
-- Name: idx_inventory_items_company_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_items_company_branch ON public.inventory_items USING btree (company_id, branch);


--
-- Name: idx_inventory_items_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_items_company_id ON public.inventory_items USING btree (company_id);


--
-- Name: idx_inventory_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_status ON public.inventory_items USING btree (status);


--
-- Name: idx_inventory_supplier_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_supplier_id ON public.inventory_items USING btree (supplier_id);


--
-- Name: idx_measurement_points_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_measurement_points_company_id ON public.measurement_points USING btree (company_id);


--
-- Name: idx_measurement_profiles_company_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_measurement_profiles_company_branch ON public.measurement_profiles USING btree (company_id, branch);


--
-- Name: idx_measurement_profiles_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_measurement_profiles_company_id ON public.measurement_profiles USING btree (company_id);


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
-- Name: idx_order_progress_stages_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_progress_stages_company_id ON public.order_progress_stages USING btree (company_id);


--
-- Name: idx_orders_assigned_to; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_assigned_to ON public.orders USING btree (assigned_to);


--
-- Name: idx_orders_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_code ON public.orders USING btree (order_code);


--
-- Name: idx_orders_company_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_company_branch ON public.orders USING btree (company_id, branch);


--
-- Name: idx_orders_company_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_company_date ON public.orders USING btree (company_id, order_date DESC);


--
-- Name: idx_orders_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_company_id ON public.orders USING btree (company_id);


--
-- Name: idx_orders_company_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_company_status ON public.orders USING btree (company_id, status);


--
-- Name: idx_orders_customer_mobile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_mobile ON public.orders USING btree (customer_mobile);


--
-- Name: idx_orders_customer_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_name ON public.orders USING btree (customer_name);


--
-- Name: idx_orders_design_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_design_id ON public.orders USING btree (design_id);


--
-- Name: idx_orders_expected_deliv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_expected_deliv ON public.orders USING btree (expected_delivery_date);


--
-- Name: idx_orders_order_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_order_date ON public.orders USING btree (order_date);


--
-- Name: idx_orders_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_priority ON public.orders USING btree (priority);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_payment_transactions_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_company_id ON public.payment_transactions USING btree (company_id);


--
-- Name: idx_payments_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_company_id ON public.payments USING btree (company_id);


--
-- Name: idx_payments_company_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_company_status ON public.payments USING btree (company_id, status);


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
-- Name: idx_production_stages_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_production_stages_company_id ON public.production_stages USING btree (company_id);


--
-- Name: idx_progress_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progress_order ON public.order_progress_stages USING btree (order_id);


--
-- Name: idx_purchase_order_items_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchase_order_items_company_id ON public.purchase_order_items USING btree (company_id);


--
-- Name: idx_purchase_orders_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchase_orders_company_id ON public.purchase_orders USING btree (company_id);


--
-- Name: idx_qc_checklists_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_qc_checklists_company_id ON public.qc_checklists USING btree (company_id);


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
-- Name: idx_stage_definition_employees_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stage_definition_employees_company_id ON public.stage_definition_employees USING btree (company_id);


--
-- Name: idx_stage_definitions_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stage_definitions_company_id ON public.stage_definitions USING btree (company_id);


--
-- Name: idx_stage_defs_company_sort; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stage_defs_company_sort ON public.stage_definitions USING btree (company_id, sort_order);


--
-- Name: idx_stock_movements_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_movements_company_id ON public.stock_movements USING btree (company_id);


--
-- Name: idx_stockmov_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stockmov_item ON public.stock_movements USING btree (item_id);


--
-- Name: idx_suppliers_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_suppliers_company_id ON public.suppliers USING btree (company_id);


--
-- Name: idx_trial_alterations_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trial_alterations_company_id ON public.trial_alterations USING btree (company_id);


--
-- Name: idx_trials_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trials_code ON public.trials USING btree (trial_code);


--
-- Name: idx_trials_company_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trials_company_branch ON public.trials USING btree (company_id, branch);


--
-- Name: idx_trials_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trials_company_id ON public.trials USING btree (company_id);


--
-- Name: idx_trials_company_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trials_company_status ON public.trials USING btree (company_id, status);


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
-- Name: idx_user_access_logs_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_access_logs_company ON public.user_access_logs USING btree (company_id);


--
-- Name: idx_user_access_logs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_access_logs_user ON public.user_access_logs USING btree (user_id);


--
-- Name: idx_user_active_sessions_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_active_sessions_company ON public.user_active_sessions USING btree (company_id);


--
-- Name: idx_user_active_sessions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_active_sessions_user ON public.user_active_sessions USING btree (user_id);


--
-- Name: idx_user_delegations_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_delegations_company ON public.user_delegations USING btree (company_id);


--
-- Name: idx_user_delegations_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_delegations_user ON public.user_delegations USING btree (user_id);


--
-- Name: idx_user_profiles_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_profiles_company_id ON public.user_profiles USING btree (company_id);


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
-- Name: designs designs_parent_design_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_parent_design_id_fkey FOREIGN KEY (parent_design_id) REFERENCES public.designs(id) ON DELETE SET NULL;


--
-- Name: enquiries enquiries_converted_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_converted_order_id_fkey FOREIGN KEY (converted_order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: app_users fk_app_users_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT fk_app_users_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: appointments fk_appointments_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: appointments fk_appointments_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: branches fk_branches_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT fk_branches_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: customer_measurements fk_cmeasure_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_measurements
    ADD CONSTRAINT fk_cmeasure_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: collection_activities fk_collection_activities_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_activities
    ADD CONSTRAINT fk_collection_activities_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: collections fk_collections_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT fk_collections_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: customer_body_measurements fk_customer_body_measurements_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_body_measurements
    ADD CONSTRAINT fk_customer_body_measurements_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: customer_measurements fk_customer_measurements_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_measurements
    ADD CONSTRAINT fk_customer_measurements_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: customer_notes fk_customer_notes_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT fk_customer_notes_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: customers fk_customers_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT fk_customers_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: designs fk_designs_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT fk_designs_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: designs fk_designs_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT fk_designs_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE SET NULL;


--
-- Name: employees fk_employees_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employees_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: enquiries fk_enquiries_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT fk_enquiries_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: garments fk_garments_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garments
    ADD CONSTRAINT fk_garments_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: inventory_items fk_inventory_items_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT fk_inventory_items_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: measurement_points fk_measurement_points_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_points
    ADD CONSTRAINT fk_measurement_points_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: measurement_profiles fk_measurement_profiles_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_profiles
    ADD CONSTRAINT fk_measurement_profiles_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: measurement_profiles fk_mprofiles_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.measurement_profiles
    ADD CONSTRAINT fk_mprofiles_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: order_progress_stages fk_order_progress_stages_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_progress_stages
    ADD CONSTRAINT fk_order_progress_stages_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: orders fk_orders_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: orders fk_orders_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE RESTRICT;


--
-- Name: payment_transactions fk_payment_transactions_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT fk_payment_transactions_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: payments fk_payments_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: payments fk_payments_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE RESTRICT;


--
-- Name: production_stages fk_production_stages_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_stages
    ADD CONSTRAINT fk_production_stages_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items fk_purchase_order_items_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT fk_purchase_order_items_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: purchase_orders fk_purchase_orders_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT fk_purchase_orders_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: qc_checklists fk_qc_checklists_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qc_checklists
    ADD CONSTRAINT fk_qc_checklists_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: stage_definition_employees fk_stage_definition_employees_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stage_definition_employees
    ADD CONSTRAINT fk_stage_definition_employees_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: stage_definitions fk_stage_definitions_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stage_definitions
    ADD CONSTRAINT fk_stage_definitions_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: stock_movements fk_stock_movements_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT fk_stock_movements_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: suppliers fk_suppliers_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT fk_suppliers_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: trial_alterations fk_trial_alterations_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trial_alterations
    ADD CONSTRAINT fk_trial_alterations_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: trials fk_trials_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trials
    ADD CONSTRAINT fk_trials_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: user_profiles fk_user_profiles_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT fk_user_profiles_company FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: garments garments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garments
    ADD CONSTRAINT garments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: inventory_items inventory_items_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


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
-- Name: orders orders_design_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_design_id_fkey FOREIGN KEY (design_id) REFERENCES public.designs(id) ON DELETE SET NULL;


--
-- Name: orders orders_measurement_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_measurement_profile_id_fkey FOREIGN KEY (measurement_profile_id) REFERENCES public.measurement_profiles(id) ON DELETE SET NULL;


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
-- Name: user_access_logs user_access_logs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_access_logs
    ADD CONSTRAINT user_access_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: user_access_logs user_access_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_access_logs
    ADD CONSTRAINT user_access_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: user_active_sessions user_active_sessions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_active_sessions
    ADD CONSTRAINT user_active_sessions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: user_active_sessions user_active_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_active_sessions
    ADD CONSTRAINT user_active_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: user_delegations user_delegations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_delegations
    ADD CONSTRAINT user_delegations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_settings(id) ON DELETE CASCADE;


--
-- Name: user_delegations user_delegations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_delegations
    ADD CONSTRAINT user_delegations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict bjIsikBkDQs6kbKxBBQU0gc0jfzIyrCXswiH8JvaKf5vF3zaDoPCPQNJ81wDndm

