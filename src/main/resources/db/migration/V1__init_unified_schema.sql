-- =======================================================================
-- HAULO BOUTIQUE FASHION ERP — UNIFIED DATABASE SCHEMA (V1)
-- Complete consolidated DDL: 32 tables, constraints, indexes, sequences
-- Baseline bootstrap: Admin user, core stages, and clean company settings
-- =======================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--
-- PostgreSQL database dump
--


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
-- Name: app_users; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: COLUMN app_users.allowed_modules; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.app_users.allowed_modules IS 'JSON array of module key strings the user may access. NULL = role default applied at login.';


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: collection_activities; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: collections; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_name character varying(150) DEFAULT 'Haulo Designs'::character varying NOT NULL,
    short_name character varying(60) DEFAULT 'HAULO'::character varying NOT NULL,
    tagline character varying(255) DEFAULT 'Bespoke Couture Â· Luxury Tailoring'::character varying,
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


--
-- Name: customer_body_measurements; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: customer_measurements; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: customer_notes; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: designs; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: enquiries; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: garments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: measurement_points; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: measurement_profiles; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: order_progress_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_progress_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    stage character varying(50) NOT NULL,
    completed_at timestamp without time zone,
    completed_by character varying(100),
    notes text
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: production_stages; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: qc_checklists; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: stage_definition_employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stage_definition_employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stage_def_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    assignment_type character varying(30) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: stage_definitions; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: trial_alterations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: trials; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: app_users app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);


--
-- Name: app_users app_users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_username_key UNIQUE (username);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: branches branches_branch_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_branch_code_key UNIQUE (branch_code);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: collection_activities collection_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_activities
    ADD CONSTRAINT collection_activities_pkey PRIMARY KEY (id);


--
-- Name: collections collections_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_code_key UNIQUE (code);


--
-- Name: collections collections_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_name_key UNIQUE (name);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);


--
-- Name: customer_body_measurements customer_body_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_body_measurements
    ADD CONSTRAINT customer_body_measurements_pkey PRIMARY KEY (id);


--
-- Name: customer_measurements customer_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_measurements
    ADD CONSTRAINT customer_measurements_pkey PRIMARY KEY (id);


--
-- Name: customer_notes customer_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (mobile_number);


--
-- Name: designs designs_design_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_design_code_key UNIQUE (design_code);


--
-- Name: designs designs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_pkey PRIMARY KEY (id);


--
-- Name: employees employees_employee_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_code_key UNIQUE (employee_code);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: enquiries enquiries_enquiry_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_enquiry_code_key UNIQUE (enquiry_code);


--
-- Name: enquiries enquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_pkey PRIMARY KEY (id);


--
-- Name: garments garments_garment_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garments
    ADD CONSTRAINT garments_garment_code_key UNIQUE (garment_code);


--
-- Name: garments garments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garments
    ADD CONSTRAINT garments_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_item_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_item_code_key UNIQUE (item_code);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: measurement_points measurement_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurement_points
    ADD CONSTRAINT measurement_points_pkey PRIMARY KEY (id);


--
-- Name: measurement_profiles measurement_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurement_profiles
    ADD CONSTRAINT measurement_profiles_pkey PRIMARY KEY (id);


--
-- Name: order_progress_stages order_progress_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_progress_stages
    ADD CONSTRAINT order_progress_stages_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_code_key UNIQUE (order_code);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: production_stages production_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_stages
    ADD CONSTRAINT production_stages_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_po_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_po_code_key UNIQUE (po_code);


--
-- Name: qc_checklists qc_checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_checklists
    ADD CONSTRAINT qc_checklists_pkey PRIMARY KEY (id);


--
-- Name: stage_definition_employees stage_definition_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_definition_employees
    ADD CONSTRAINT stage_definition_employees_pkey PRIMARY KEY (id);


--
-- Name: stage_definition_employees stage_definition_employees_stage_def_id_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_definition_employees
    ADD CONSTRAINT stage_definition_employees_stage_def_id_employee_id_key UNIQUE (stage_def_id, employee_id);


--
-- Name: stage_definitions stage_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_definitions
    ADD CONSTRAINT stage_definitions_pkey PRIMARY KEY (id);


--
-- Name: stage_definitions stage_definitions_stage_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_definitions
    ADD CONSTRAINT stage_definitions_stage_key_key UNIQUE (stage_key);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_supplier_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_supplier_code_key UNIQUE (supplier_code);


--
-- Name: trial_alterations trial_alterations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trial_alterations
    ADD CONSTRAINT trial_alterations_pkey PRIMARY KEY (id);


--
-- Name: trials trials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trials
    ADD CONSTRAINT trials_pkey PRIMARY KEY (id);


--
-- Name: trials trials_trial_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trials
    ADD CONSTRAINT trials_trial_code_key UNIQUE (trial_code);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);


--
-- Name: idx_alterations_trial; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alterations_trial ON public.trial_alterations USING btree (trial_id);


--
-- Name: idx_appt_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appt_scheduled ON public.appointments USING btree (scheduled_at);


--
-- Name: idx_appt_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appt_status ON public.appointments USING btree (status);


--
-- Name: idx_branches_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branches_active ON public.branches USING btree (active);


--
-- Name: idx_branches_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branches_city ON public.branches USING btree (city);


--
-- Name: idx_branches_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branches_type ON public.branches USING btree (type);


--
-- Name: idx_cbm_garment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cbm_garment ON public.customer_body_measurements USING btree (garment_type);


--
-- Name: idx_cbm_history; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cbm_history ON public.customer_body_measurements USING btree (customer_mobile, garment_type, version DESC);


--
-- Name: idx_cbm_mobile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cbm_mobile ON public.customer_body_measurements USING btree (customer_mobile);


--
-- Name: idx_cbm_mobile_garment_current; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cbm_mobile_garment_current ON public.customer_body_measurements USING btree (customer_mobile, garment_type, is_current);


--
-- Name: idx_cmeasure_garment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cmeasure_garment ON public.customer_measurements USING btree (garment_type);


--
-- Name: idx_cmeasure_mobile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cmeasure_mobile ON public.customer_measurements USING btree (customer_mobile);


--
-- Name: idx_col_act_col_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_col_act_col_id ON public.collection_activities USING btree (collection_id);


--
-- Name: idx_collections_feat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_collections_feat ON public.collections USING btree (is_featured);


--
-- Name: idx_collections_season; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_collections_season ON public.collections USING btree (season);


--
-- Name: idx_collections_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_collections_status ON public.collections USING btree (status);


--
-- Name: idx_collections_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_collections_year ON public.collections USING btree (year);


--
-- Name: idx_cust_notes_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cust_notes_date ON public.customer_notes USING btree (created_at DESC);


--
-- Name: idx_cust_notes_mobile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cust_notes_mobile ON public.customer_notes USING btree (customer_mobile);


--
-- Name: idx_customers_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_name ON public.customers USING btree (name);


--
-- Name: idx_customers_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_tier ON public.customers USING btree (tier);


--
-- Name: idx_design_collection; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_design_collection ON public.designs USING btree (collection);


--
-- Name: idx_design_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_design_created ON public.designs USING btree (created_at);


--
-- Name: idx_design_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_design_created_by ON public.designs USING btree (created_by);


--
-- Name: idx_design_occasion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_design_occasion ON public.designs USING btree (occasion);


--
-- Name: idx_design_prod_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_design_prod_status ON public.designs USING btree (production_status);


--
-- Name: idx_design_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_design_status ON public.designs USING btree (status);


--
-- Name: idx_emp_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emp_code ON public.employees USING btree (employee_code);


--
-- Name: idx_emp_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emp_role ON public.employees USING btree (role);


--
-- Name: idx_emp_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emp_status ON public.employees USING btree (status);


--
-- Name: idx_enq_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enq_created ON public.enquiries USING btree (created_at);


--
-- Name: idx_enq_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enq_source ON public.enquiries USING btree (source);


--
-- Name: idx_enq_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enq_status ON public.enquiries USING btree (status);


--
-- Name: idx_garments_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garments_code ON public.garments USING btree (garment_code);


--
-- Name: idx_garments_col; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garments_col ON public.garments USING btree (collection_name);


--
-- Name: idx_garments_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garments_due_date ON public.garments USING btree (due_date);


--
-- Name: idx_garments_order_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garments_order_code ON public.garments USING btree (order_code);


--
-- Name: idx_garments_stage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garments_stage ON public.garments USING btree (production_stage);


--
-- Name: idx_garments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garments_status ON public.garments USING btree (status);


--
-- Name: idx_garments_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_garments_type ON public.garments USING btree (garment_type);


--
-- Name: idx_inventory_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_category ON public.inventory_items USING btree (category);


--
-- Name: idx_inventory_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_code ON public.inventory_items USING btree (item_code);


--
-- Name: idx_inventory_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_status ON public.inventory_items USING btree (status);


--
-- Name: idx_mpoint_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mpoint_profile ON public.measurement_points USING btree (profile_id);


--
-- Name: idx_mprofile_garment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mprofile_garment ON public.measurement_profiles USING btree (garment_type);


--
-- Name: idx_order_progress_stage_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_progress_stage_key ON public.order_progress_stages USING btree (stage);


--
-- Name: idx_orders_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_code ON public.orders USING btree (order_code);


--
-- Name: idx_orders_customer_mobile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_customer_mobile ON public.orders USING btree (customer_mobile);


--
-- Name: idx_orders_customer_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_customer_name ON public.orders USING btree (customer_name);


--
-- Name: idx_orders_expected_deliv; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_expected_deliv ON public.orders USING btree (expected_delivery_date);


--
-- Name: idx_orders_order_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_order_date ON public.orders USING btree (order_date);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_payments_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_order ON public.payments USING btree (order_id);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_po_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_status ON public.purchase_orders USING btree (status);


--
-- Name: idx_po_supplier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_supplier ON public.purchase_orders USING btree (supplier_id);


--
-- Name: idx_poi_po; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_poi_po ON public.purchase_order_items USING btree (po_id);


--
-- Name: idx_prod_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prod_order ON public.production_stages USING btree (order_id);


--
-- Name: idx_prod_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prod_status ON public.production_stages USING btree (status);


--
-- Name: idx_progress_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progress_order ON public.order_progress_stages USING btree (order_id);


--
-- Name: idx_qc_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qc_order ON public.qc_checklists USING btree (order_id);


--
-- Name: idx_sde_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sde_employee ON public.stage_definition_employees USING btree (employee_id);


--
-- Name: idx_sde_stage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sde_stage ON public.stage_definition_employees USING btree (stage_def_id);


--
-- Name: idx_stage_def_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stage_def_active ON public.stage_definitions USING btree (active);


--
-- Name: idx_stage_def_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stage_def_key ON public.stage_definitions USING btree (stage_key);


--
-- Name: idx_stage_def_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stage_def_order ON public.stage_definitions USING btree (sort_order);


--
-- Name: idx_stockmov_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stockmov_item ON public.stock_movements USING btree (item_id);


--
-- Name: idx_trials_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trials_code ON public.trials USING btree (trial_code);


--
-- Name: idx_trials_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trials_customer ON public.trials USING btree (customer_mobile);


--
-- Name: idx_trials_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trials_date ON public.trials USING btree (trial_date);


--
-- Name: idx_trials_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trials_order ON public.trials USING btree (order_id);


--
-- Name: idx_trials_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trials_status ON public.trials USING btree (status);


--
-- Name: idx_txn_payment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_txn_payment ON public.payment_transactions USING btree (payment_id);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_username ON public.app_users USING btree (username);


--
-- Name: appointments appointments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: branches branches_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: collection_activities collection_activities_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collection_activities
    ADD CONSTRAINT collection_activities_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE;


--
-- Name: customer_body_measurements customer_body_measurements_customer_mobile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_body_measurements
    ADD CONSTRAINT customer_body_measurements_customer_mobile_fkey FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: customer_notes customer_notes_customer_mobile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_customer_mobile_fkey FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: designs designs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: enquiries enquiries_converted_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_converted_order_id_fkey FOREIGN KEY (converted_order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: appointments fk_appointments_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: customer_measurements fk_cmeasure_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_measurements
    ADD CONSTRAINT fk_cmeasure_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: designs fk_designs_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT fk_designs_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE SET NULL;


--
-- Name: measurement_profiles fk_mprofiles_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurement_profiles
    ADD CONSTRAINT fk_mprofiles_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: orders fk_orders_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE RESTRICT;


--
-- Name: payments fk_payments_customer_mobile; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_customer_mobile FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE RESTRICT;


--
-- Name: garments garments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.garments
    ADD CONSTRAINT garments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: measurement_points measurement_points_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurement_points
    ADD CONSTRAINT measurement_points_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.measurement_profiles(id) ON DELETE CASCADE;


--
-- Name: order_progress_stages order_progress_stages_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_progress_stages
    ADD CONSTRAINT order_progress_stages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payment_transactions payment_transactions_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE RESTRICT;


--
-- Name: production_stages production_stages_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_stages
    ADD CONSTRAINT production_stages_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: production_stages production_stages_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_stages
    ADD CONSTRAINT production_stages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;


--
-- Name: purchase_order_items purchase_order_items_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE RESTRICT;


--
-- Name: qc_checklists qc_checklists_checked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_checklists
    ADD CONSTRAINT qc_checklists_checked_by_fkey FOREIGN KEY (checked_by) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: qc_checklists qc_checklists_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_checklists
    ADD CONSTRAINT qc_checklists_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: stage_definition_employees stage_definition_employees_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_definition_employees
    ADD CONSTRAINT stage_definition_employees_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: stage_definition_employees stage_definition_employees_stage_def_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_definition_employees
    ADD CONSTRAINT stage_definition_employees_stage_def_id_fkey FOREIGN KEY (stage_def_id) REFERENCES public.stage_definitions(id) ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE RESTRICT;


--
-- Name: trial_alterations trial_alterations_trial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trial_alterations
    ADD CONSTRAINT trial_alterations_trial_id_fkey FOREIGN KEY (trial_id) REFERENCES public.trials(id) ON DELETE CASCADE;


--
-- Name: trials trials_customer_mobile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trials
    ADD CONSTRAINT trials_customer_mobile_fkey FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


--
-- Name: trials trials_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trials
    ADD CONSTRAINT trials_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--



-- =======================================================================
-- ESSENTIAL BOOTSTRAP MASTER DATA (Admin user & Core Stages)
-- =======================================================================

INSERT INTO public.app_users (
    id, username, password_hash, full_name, role, active, created_at, updated_at
) VALUES (
    'd74e0819-2f3d-401b-a5ab-102d02ae74b8',
    'admin',
    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Boutique Admin',
    'ADMIN',
    true,
    NOW(),
    NOW()
) ON CONFLICT (username) DO UPDATE SET active = true, role = 'ADMIN', updated_at = NOW();

INSERT INTO public.user_profiles (
    id, user_id, full_name, created_at, updated_at
) VALUES (
    'd44afacf-256f-427f-9140-c8d93bab72c1',
    'd74e0819-2f3d-401b-a5ab-102d02ae74b8',
    'Boutique Admin',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET full_name = 'Boutique Admin', updated_at = NOW();

INSERT INTO public.stage_definitions (
    id, stage_key, display_name, description, required_role, dept_label, color_class, sort_order, active, created_at, updated_at
) VALUES
(
    '49d1deb1-0cd1-4fff-b54b-833df0783abf',
    'ORDER_TAKEN',
    'Order Taken',
    'Order intake: fabric requirements noted, advance received, and order committed to the production schedule.',
    'STAFF',
    'Order Intake & Reception',
    'stage-emerald',
    1,
    true,
    NOW(),
    NOW()
),
(
    'b0000001-0000-0000-0000-000000000001',
    'QC',
    'Quality Control',
    'Final inspection before dispatch: stitching, measurements, finishing, and fabric quality verified by QC team.',
    'SUPERVISOR',
    'Quality Control & Inspection',
    'stage-gold',
    2,
    true,
    NOW(),
    NOW()
),
(
    'c0000002-0000-0000-0000-000000000008',
    'READY_TO_DELIVER',
    'Ready to Deliver',
    'Quality approved, packed with care and awaiting customer pickup or boutique handover.',
    'SUPERVISOR',
    'Delivery & Handover',
    'stage-silver',
    3,
    true,
    NOW(),
    NOW()
) ON CONFLICT (stage_key) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO public.company_settings (
    id, company_name, short_name, tagline, owner_name, business_type, country
) VALUES (
    'dbd45e9d-a976-4d2e-8b04-04194619973c',
    'Haulo Designs',
    'HAULO',
    'Bespoke Couture · Luxury Tailoring',
    'Boutique Admin',
    'Bespoke Atelier',
    'India'
) ON CONFLICT (id) DO NOTHING;

