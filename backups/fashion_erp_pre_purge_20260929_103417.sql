--
-- PostgreSQL database dump
--

\restrict YHYQkccLc3lbBJnQIEXSaZHPyqG4aRcoAad91dwlBKLgN3aDWEK9jvI0067EaNu

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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.app_users OWNER TO postgres;

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
    stage character varying(30) NOT NULL,
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
    current_stage character varying(30) DEFAULT 'ORDER'::character varying,
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
    tailor_notes text
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
    fit_notes text
);


ALTER TABLE public.trials OWNER TO postgres;

--
-- Data for Name: app_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_users (id, username, password_hash, full_name, role, active, last_login, created_at, updated_at) FROM stdin;
d74e0819-2f3d-401b-a5ab-102d02ae74b8	admin	$2a$12$CkKSzEFFfJ61XfSMLpId3OmiBTDWkqijh6xDv0QqutbX46vk9gABC	Boutique Admin	ADMIN	t	2026-09-29 04:40:15.011523	2026-09-12 15:46:41.735826	2026-09-26 17:42:40.461485
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, order_id, appt_type, scheduled_at, duration_minutes, status, staff_assigned, notes, created_at, updated_at, customer_mobile) FROM stdin;
25110548-b36d-4b25-9138-5e6164dd99ac	\N	FITTING	2026-09-29 05:30:00	45	SCHEDULED	Master Tailor		2026-09-28 05:59:09.876458	2026-09-28 05:59:09.923029	+91 09344 07588
c7965504-7e85-4c0c-b635-438d986b62d0	\N	FITTING	2026-10-10 05:30:00	45	SCHEDULED	Master Tailor		2026-09-28 05:59:20.101304	2026-09-28 05:59:20.103793	+91 09344 07588
83fc652c-ab4b-44e6-b45c-3874e34a945c	\N	FITTING	2026-09-28 05:30:00	45	SCHEDULED	Master Tailor		2026-09-28 05:59:36.457578	2026-09-28 05:59:36.466454	+91 09344 07588
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
-- Data for Name: customer_body_measurements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, top_length, full_length, skirt_length, pant_length, armhole, upper_arm, sleeve_length, sleeve_round, elbow_round, wrist_round, front_neck_depth, back_neck_depth, bust_point, bust_point_to_bust_point, shoulder_to_bust, shoulder_to_waist, front_width, back_width, pant_waist, pant_hip, thigh_round, knee_round, calf_round, ankle_round, crotch_length, bottom_opening, waist_to_hip, flare, posture_notes, shape_notes, notes, recorded_by, recorded_at, updated_at) FROM stdin;
f24f88da-a1ff-4388-93bb-ceaa8d52d257	+91 09344 07588	Ms. SIVASURYA S	CHUDI	CURRENT	t	1	in	14.50	35.00	29.50	29.00	38.00	\N	40.00	\N	\N	39.00	16.00	11.50	18.00	10.50	9.50	6.50	6.50	7.00	\N	\N	\N	\N	13.50	14.00	30.00	40.00	22.00	15.00	13.00	10.00	26.00	12.00	\N	\N	\N	\N	\N	Master Tailor	2026-09-26 12:25:04.166354	2026-09-26 12:25:04.215682
076293b2-b7e5-4521-bbb9-065851dda3d8	+91 98402 12345	Ms. Kavya Shree	LEHENGA	CURRENT	t	1	in	14.50	34.00	29.00	28.00	38.00	14.00	\N	\N	42.00	\N	15.50	11.50	10.50	11.00	10.00	6.50	6.50	8.00	9.50	7.50	9.50	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	140.00	8.00	120.00	\N	\N	\N	Master Tailor	2026-09-28 08:18:00.086047	2026-09-28 08:18:00.137191
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
02361f51-043e-46ce-87d6-11a1dfdf49e1	+91 09344 07588	sdffffffffffffffffffffffffagVSDVGGcsfadzeehdsxf	Atelier Staff	AS	FIT	2026-09-28 06:04:09.608206	2026-09-28 06:04:09.628812
13b28194-4a72-45fa-8cb8-49056f68d986	+91 09344 07588	sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssseeeeeeeeeeeeeeeeeeeeeeeeeeessssssssssssssssssssssssssssssse	Atelier Staff	AS	ALTERATION	2026-09-28 06:04:20.360533	2026-09-28 06:04:20.362042
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (name, email, location, avatar_url, tier, total_spend, balance, favorite_garment, measurements_on_file, notes, created_at, updated_at, mobile_number, first_name, last_name, salutation, gender, alt_phone, instagram_handle, preferred_channel, dob, anniversary, street_address, city, state, pincode, landmark, credit_limit, fit_preference, fabric_allergies, preferred_neck, preferred_sleeve, preferred_occasions, delivery_preference) FROM stdin;
Ms. SIVASURYA S	sivasurya.official.8@gmail.com	mkkk, Chennai	\N	VIP_GOLD	50000.00	0.00	Designer Blouse, Bridal Lehenga, Chudidar, Anarkali Suit, Saree	t	sdfssssssssssssssssssdsffffffffffff	2026-09-26 12:25:03.718792	2026-09-28 08:02:32.338264	+91 09344 07588	SIVASURYA	S	Ms.	Female		@siva	WhatsApp	2004-10-14	\N	2/78,MUKKONAM,POOLANKINAR (PO),UDUMALPETTAI(TK),TIRUPPUR(DT)	Chennai	Tamil Nadu	642122	temeple	25000.00	Structured Corseted	Pure cotton lining only				Standard Boutique Pickup
Ms. Kavya Shree	kavya.shree@gmail.com	T. NagarT. Nagar, Chennai	\N	VIP_GOLD	94314.00	30686.00	Bridal Couture	t		2026-09-28 08:17:59.068107	2026-09-28 12:33:01.701971	+91 98402 12345	Kavya	Shree	Ms.	Female			WhatsApp	\N	\N		Chennai	Tamil Nadu			25000.00	Structured Corseted	Pure cotton lining only				Standard Boutique Pickup
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
e1000001-0000-0000-0000-000000000001	EMP-001	Lakshmi Priya	+91 98401 23451	lakshmi.priya@haulo.in	DESIGNER	ACTIVE	2023-04-10	/front end/assets/employees/EMP-001_4821.jpg	Bridal Couture, Sketching, Draping	{"department":"Designing","role":"Lead Couture Designer","salary":45000,"workload":85,"ordersAssigned":4,"completedMonth":6,"efficiency":98}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000002	EMP-002	Divya Ramachandran	+91 98402 34562	divya.ramachandran@haulo.in	DESIGNER	ACTIVE	2023-08-15	/front end/assets/employees/EMP-002_7193.jpg	Digital CAD, Moodboards, Color Theory	{"department":"Designing","role":"Senior Fashion Illustrator","salary":38000,"workload":75,"ordersAssigned":3,"completedMonth":5,"efficiency":94}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000003	EMP-003	Arun Kumar	+91 98403 45673	arun.kumar@haulo.in	DESIGNER	ACTIVE	2024-01-20	/front end/assets/employees/EMP-003_2854.jpg	Fusion Wear, Neckline Patterns, Draping	{"department":"Designing","role":"Bespoke Pattern Stylist","salary":36000,"workload":70,"ordersAssigned":3,"completedMonth":4,"efficiency":91}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000004	EMP-004	Ramesh Kumar	+91 98404 56784	ramesh.kumar@haulo.in	CUTTER	ACTIVE	2022-11-05	/front end/assets/employees/EMP-004_9341.jpg	Silk Cutting, Pattern Grading, Marker Planning	{"department":"Cutting","role":"Master Cutter","salary":34000,"workload":80,"ordersAssigned":4,"completedMonth":8,"efficiency":95}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000005	EMP-005	Murugan S	+91 98405 67895	murugan.s@haulo.in	CUTTER	ACTIVE	2023-05-12	/front end/assets/employees/EMP-005_1602.jpg	Banarasi Brocade, Sheer Georgette, Velvet	{"department":"Cutting","role":"Precision Layer Cutter","salary":30000,"workload":65,"ordersAssigned":3,"completedMonth":6,"efficiency":92}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000006	EMP-006	Keerthana Muthukrishnan	+91 98406 78906	keerthana.m@haulo.in	CUTTER	ACTIVE	2024-02-18	/front end/assets/employees/EMP-006_8435.jpg	Blouse Pattern Grading, Can-Can Cutting	{"department":"Cutting","role":"CAD Pattern Cutter","salary":28000,"workload":60,"ordersAssigned":2,"completedMonth":5,"efficiency":89}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000007	EMP-007	Saira Banu	+91 98407 89017	saira.banu@haulo.in	TAILOR	ACTIVE	2022-09-01	/front end/assets/employees/EMP-007_3917.jpg	Princess Cut Blouse, Bridal Fitting, Corsetry	{"department":"Stitching","role":"Master Tailor - Bridal","salary":35000,"workload":90,"ordersAssigned":5,"completedMonth":9,"efficiency":97}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000008	EMP-008	Salim Khan	+91 98408 90128	salim.khan@haulo.in	TAILOR	ACTIVE	2023-03-14	/front end/assets/employees/EMP-008_5240.jpg	Anarkali, Lehenga Assemblies, Piping	{"department":"Stitching","role":"Senior Tailor - Ethnic","salary":32000,"workload":75,"ordersAssigned":3,"completedMonth":7,"efficiency":93}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000009	EMP-009	Dhanalakshmi Ganesan	+91 98409 01239	dhanalakshmi.g@haulo.in	TAILOR	ACTIVE	2023-10-22	/front end/assets/employees/EMP-009_6782.jpg	Indo-Western Gowns, Kurti Sets, Concealed Zips	{"department":"Stitching","role":"Senior Tailor - Contemporary","salary":30000,"workload":70,"ordersAssigned":3,"completedMonth":6,"efficiency":90}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000010	EMP-010	Jothi Lakshmi	+91 98410 12340	jothi.lakshmi@haulo.in	FINISHER	ACTIVE	2023-02-11	/front end/assets/employees/EMP-010_3419.jpg	Hand Hemming, Latkan Attachment, Steam Pressing	{"department":"Finishing","role":"Lead Finishing Artist","salary":27000,"workload":80,"ordersAssigned":4,"completedMonth":8,"efficiency":94}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000011	EMP-011	Deepalakshmi Palanisamy	+91 98411 23451	deepalakshmi.p@haulo.in	FINISHER	ACTIVE	2023-07-19	/front end/assets/employees/EMP-011_8251.jpg	Lining Finishing, Delicate Fabric Steam, Hook & Eye	{"department":"Finishing","role":"Final Quality & Pressing Artisan","salary":25000,"workload":65,"ordersAssigned":3,"completedMonth":5,"efficiency":91}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000012	EMP-012	Thenmozhi Arumugam	+91 98412 34562	thenmozhi.a@haulo.in	FINISHER	ACTIVE	2024-03-05	/front end/assets/employees/EMP-012_4903.jpg	Edge Binding, Tassel Making, Final Inspection	{"department":"Finishing","role":"Finishing & Embellishment Specialist","salary":26000,"workload":60,"ordersAssigned":2,"completedMonth":4,"efficiency":88}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000013	EMP-013	Kavitha M	+91 98413 45673	kavitha.m@haulo.in	EMBROIDERER	ACTIVE	2022-06-15	/front end/assets/employees/EMP-013_1764.jpg	Zari, Maggam Work, Pearl Beading	{"department":"Embroidery","role":"Master Zardozi Artisan","salary":36000,"workload":85,"ordersAssigned":4,"completedMonth":7,"efficiency":96}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000014	EMP-014	Meena Rajendran	+91 98414 56784	meena.rajendran@haulo.in	EMBROIDERER	ACTIVE	2023-04-20	/front end/assets/employees/EMP-014_9038.jpg	Kundan Work, Cutwork, Antique Thread Work	{"department":"Embroidery","role":"Senior Aari Embroidery Artist","salary":32000,"workload":75,"ordersAssigned":3,"completedMonth":6,"efficiency":93}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000015	EMP-015	Revathi Karthikeyan	+91 98415 67895	revathi.karthikeyan@haulo.in	EMBROIDERER	ACTIVE	2024-01-10	/front end/assets/employees/EMP-015_2516.jpg	Silk Floss Embroidery, Kasuti, French Knots	{"department":"Embroidery","role":"Bespoke Monogram & Thread Artist","salary":29000,"workload":65,"ordersAssigned":2,"completedMonth":4,"efficiency":90}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000016	EMP-016	Subhasree Balasubramanian	+91 98416 78906	subhasree.b@haulo.in	MANAGER	ACTIVE	2022-01-10	/front end/assets/employees/EMP-016_7389.jpg	Workforce Scheduling, Order Pipeline, Logistics	{"department":"Administration","role":"Operations & Production Manager","salary":55000,"workload":80,"ordersAssigned":5,"completedMonth":8,"efficiency":97}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000017	EMP-017	Anitha Raj	+91 98417 89017	anitha.raj@haulo.in	SUPERVISOR	ACTIVE	2023-01-15	/front end/assets/employees/EMP-017_4612.jpg	Trial Scheduling, Client Measurements, Fitting QC	{"department":"Administration","role":"Client Relations & Fitting Coordinator","salary":40000,"workload":70,"ordersAssigned":3,"completedMonth":5,"efficiency":94}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
e1000001-0000-0000-0000-000000000018	EMP-018	Sowmya Jayaraman	+91 98418 90128	sowmya.j@haulo.in	MANAGER	ACTIVE	2023-09-01	/front end/assets/employees/EMP-018_5827.jpg	Fabric Sourcing, Trim Inventory, Vendor Management	{"department":"Administration","role":"Inventory & Procurement Officer","salary":35000,"workload":60,"ordersAssigned":2,"completedMonth":4,"efficiency":91}	2026-09-28 16:30:14.573886	2026-09-28 16:30:14.573886
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
1	1	init empty schema	SQL	V1__init_empty_schema.sql	\N	postgres	2026-09-25 17:33:17.762075	100	t
2	2	alter garments remove mock defaults	SQL	V2__alter_garments_remove_mock_defaults.sql	-687438762	postgres	2026-09-26 16:30:56.956283	26	t
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
486aad1d-999d-4e35-b166-ed9ee707db6e	3f28e409-0df1-4ff8-be80-be9f719ba915	ORDER	2026-09-28 04:51:18.561437	\N	\N
5ca17125-5f37-4149-a24e-d203479eb427	1b4b355e-b24e-4e7e-b82a-965b10e42c21	ORDER	2026-09-28 07:32:25.952844	\N	\N
b220b79e-9913-4c7a-b857-64a01f82be29	fdf7ae0a-9f1d-4c77-9542-e86c762bfc6b	ORDER	2026-09-28 08:28:24.597294	\N	\N
85028aa0-ca35-4eb6-a090-52f4763ae3c8	6ffc43a3-e152-4cb7-a83f-9196d32743a4	ORDER	2026-09-28 11:25:21.264483	\N	\N
b218f450-552c-4e4b-9dc1-7381a96917f6	851823d9-db7b-4166-a344-f7b8de9b4ec3	ORDER	2026-09-28 12:33:01.568735	\N	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_code, garment_type, garment_desc, collection, amount, status, order_date, due_date, notes, created_at, updated_at, customer_mobile, customer_name, expected_delivery_date, delivered_date, advance_paid, total_amount, balance_amount, current_stage, reference_images, production_notes, qc_rework_count) FROM stdin;
851823d9-db7b-4166-a344-f7b8de9b4ec3	ORD-2026-0005	Silk Anarkali Suit	\N	Heritage Wedding 2026	25000.00	CANCELLED	2026-09-28	\N	\N	2026-09-28 12:33:01.568735	2026-09-28 12:33:01.765847	+91 98402 12345	Ms. Kavya Shree	\N	\N	10000.00	25000.00	15000.00	CUTTING	[]	\N	0
fdf7ae0a-9f1d-4c77-9542-e86c762bfc6b	ORD-2026-0003	Lehenga	Lehenga — Bridal Collection	Bridal Collection	50000.00	CANCELLED	2026-09-28	2026-10-30		2026-09-28 08:28:24.590708	2026-09-28 13:04:58.309673	+91 98402 12345	Ms. Kavya Shree	2026-10-30	\N	50000.00	50000.00	0.00	EEEEEEEEEEEEE	[]	\N	0
3f28e409-0df1-4ff8-be80-be9f719ba915	ORD-2026-0001	Gown	Gown — Minimal Chic	Minimal Chic	5000.00	CANCELLED	2026-09-28	2026-10-24	sdfssssssssssssssssssdsffffffffffff\n[Cancelled: Client Cancellation Request]	2026-09-28 04:51:18.561437	2026-09-28 13:05:38.374065	+91 09344 07588	Ms. SIVASURYA S	2026-10-24	\N	5000.00	5000.00	0.00	READY_TO_DELIVER	[]	\N	0
6ffc43a3-e152-4cb7-a83f-9196d32743a4	ORD-2026-0004	Chudi	Chudi — Bridal Collection	Bridal Collection	50000.00	CANCELLED	2026-09-28	2026-10-11	sssssssssssssssssssssssss\n[Cancelled: Client Cancellation Request]	2026-09-28 11:25:21.263194	2026-09-28 13:06:15.88999	+91 98402 12345	Ms. Kavya Shree	2026-10-11	\N	34314.00	50000.00	15686.00	EEEEEEEEEEEEE	[]	\N	0
1b4b355e-b24e-4e7e-b82a-965b10e42c21	ORD-2026-0002	Lehenga	Bridal Silk Lehenga	Bridal Couture	45000.00	READY	2026-09-28	2026-11-15	Automated test order	2026-09-28 07:32:25.952844	2026-09-28 14:23:38.979044	+91 09344 07588	Ms. SIVASURYA S	2026-11-15	\N	45000.00	45000.00	0.00	READY_TO_DELIVER	[]	\N	0
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes) FROM stdin;
31073c18-d89f-40f6-b88f-7b67a63a6d18	1ef0baf9-f8ec-4bb8-9817-0144f22a182a	4000.00	CASH	Boutique Admin		2026-09-28 07:17:16.504054	Payment recorded via portal
3810f39e-be14-4ae6-97c2-f480c56ad125	1ef0baf9-f8ec-4bb8-9817-0144f22a182a	1000.00	CASH	Staff	\N	2026-09-28 04:51:18.561437	Advance payment at order creation — ORD-2026-0001
20ebf8dc-8f36-4f21-be07-95640a40a6b2	6394456e-a677-4065-b31a-a2c6c108a48a	15000.00	UPI	Staff	\N	2026-09-28 07:32:25.961961	Advance payment collected at order creation — ORD-2026-0002
a6705056-767f-4a3e-aaac-2b01d655c824	6394456e-a677-4065-b31a-a2c6c108a48a	30000.00	CARD	Staff Priya	POS-987654	2026-09-28 07:36:24.677412	Final balance payment at delivery
2a3c52a0-632e-4cbb-b3fa-21825772d433	d6ec09d6-7a98-4908-a393-b8b8dfe0eb35	20000.00	UPI	Staff	\N	2026-09-28 08:28:24.975517	Advance payment collected at order creation — ORD-2026-0003
ff8fc131-a6ed-4046-8f63-8b36866df637	d6ec09d6-7a98-4908-a393-b8b8dfe0eb35	30000.00	CARD	Boutique Admin	POS-554210	2026-09-28 08:36:09.631504	Payment recorded via portal
e2c85af8-9bd7-4c44-aefe-1cbdecf7ac5e	7bf082bb-f14c-429b-8028-66ccc1152fce	34314.00	BANK_TRANSFER	Staff	\N	2026-09-28 11:25:21.356684	Advance payment collected at order creation — ORD-2026-0004
c925f62c-12a8-4cc0-a7aa-88c06dd66606	8ea9ba21-ae51-4677-9540-08aa1d562374	10000.00	CASH	Staff	\N	2026-09-28 12:33:01.6129	Advance payment collected at order creation — ORD-2026-0005
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, total_amount, paid_amount, status, due_date, notes, created_at, updated_at, customer_mobile) FROM stdin;
6394456e-a677-4065-b31a-a2c6c108a48a	1b4b355e-b24e-4e7e-b82a-965b10e42c21	45000.00	45000.00	FULLY_PAID	2026-11-15	Auto-created from order ORD-2026-0002	2026-09-28 07:32:25.961961	2026-09-28 07:36:24.688924	+91 09344 07588
d6ec09d6-7a98-4908-a393-b8b8dfe0eb35	fdf7ae0a-9f1d-4c77-9542-e86c762bfc6b	50000.00	50000.00	FULLY_PAID	2026-10-30	Auto-created from order ORD-2026-0003	2026-09-28 08:28:24.964845	2026-09-28 08:36:09.716899	+91 98402 12345
1ef0baf9-f8ec-4bb8-9817-0144f22a182a	3f28e409-0df1-4ff8-be80-be9f719ba915	5000.00	5000.00	FULLY_PAID	2026-10-24	Backfilled from order ORD-2026-0001	2026-09-28 07:16:30.014899	2026-09-28 08:02:32.319566	+91 09344 07588
7bf082bb-f14c-429b-8028-66ccc1152fce	6ffc43a3-e152-4cb7-a83f-9196d32743a4	50000.00	34314.00	PARTIAL	2026-10-11	Auto-created from order ORD-2026-0004	2026-09-28 11:25:21.339985	2026-09-28 11:25:21.673658	+91 98402 12345
8ea9ba21-ae51-4677-9540-08aa1d562374	851823d9-db7b-4166-a344-f7b8de9b4ec3	25000.00	10000.00	PARTIAL	\N	Auto-created from order ORD-2026-0005	2026-09-28 12:33:01.611888	2026-09-28 12:33:01.706627	+91 98402 12345
\.


--
-- Data for Name: production_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.production_stages (id, order_id, stage_name, assigned_to, status, started_at, completed_at, notes, sort_order) FROM stdin;
a4284481-b342-4088-a744-135f787df50a	3f28e409-0df1-4ff8-be80-be9f719ba915	ORDER_TAKEN	\N	COMPLETED	2026-09-28 04:51:18.561437	2026-09-28 04:51:18.561437	\N	1
652cbb94-7c2d-4f2d-9b60-f89f44d1c158	fdf7ae0a-9f1d-4c77-9542-e86c762bfc6b	ORDER_TAKEN	\N	COMPLETED	2026-09-28 08:28:24.590708	2026-09-28 08:28:24.590708	\N	1
1e6d0a80-2dae-46a1-b4d3-e4f08dbcf6a6	3f28e409-0df1-4ff8-be80-be9f719ba915	READY_TO_DELIVER	\N	COMPLETED	\N	2026-09-28 11:01:37.482981	\N	2
8af21129-e115-4922-945f-84be7aed15ca	6ffc43a3-e152-4cb7-a83f-9196d32743a4	ORDER_TAKEN	\N	COMPLETED	2026-09-28 11:25:21.263194	2026-09-28 11:25:21.263194	\N	1
767ace89-c8ae-429d-a6bf-321fce3d0b38	6ffc43a3-e152-4cb7-a83f-9196d32743a4	SUMMA	\N	COMPLETED	\N	2026-09-28 11:26:54.673306	\N	2
1199297a-153c-4896-97fb-0bb98847db7e	6ffc43a3-e152-4cb7-a83f-9196d32743a4	READY_TO_DELIVER	\N	IN_PROGRESS	2026-09-28 11:26:54.673306	\N	\N	3
455c398a-6e8c-40ba-8d75-37241ba94cb8	fdf7ae0a-9f1d-4c77-9542-e86c762bfc6b	READY_TO_DELIVER	\N	COMPLETED	2026-09-28 11:01:29.881389	2026-09-28 11:01:32.917085	\N	2
f517e4db-524f-4b57-b6ea-667a0c4c0df8	851823d9-db7b-4166-a344-f7b8de9b4ec3	ORDER_TAKEN	\N	COMPLETED	2026-09-28 12:33:01.568735	2026-09-28 12:33:01.568735	\N	1
fe9ee554-872e-440e-a6b4-04a225b5c642	851823d9-db7b-4166-a344-f7b8de9b4ec3	SUMMA	\N	NOT_STARTED	\N	\N	\N	2
6b77546f-23ae-4272-89cd-ebd8259133f9	851823d9-db7b-4166-a344-f7b8de9b4ec3	EEEEEEEEEEEEE	\N	NOT_STARTED	\N	\N	\N	3
ce287c0e-a361-4024-83af-156e81517aaa	851823d9-db7b-4166-a344-f7b8de9b4ec3	READY_TO_DELIVER	\N	NOT_STARTED	\N	\N	\N	4
acdf7db3-35de-4ccd-a065-f942f86883ee	1b4b355e-b24e-4e7e-b82a-965b10e42c21	ORDER_TAKEN	\N	COMPLETED	2026-09-28 07:32:25.952844	2026-09-28 07:32:25.952844	\N	1
edf6bf3c-18cc-4ecf-8b57-cc9af037c6a0	1b4b355e-b24e-4e7e-b82a-965b10e42c21	READY_TO_DELIVER	\N	COMPLETED	2026-09-28 14:23:22.247606	2026-09-28 14:23:38.977021	\N	2
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
49d1deb1-0cd1-4fff-b54b-833df0783abf	ORDER_TAKEN	Order Taken	Order intake, fabric requirements noted, advance paid and order committed to schedule.	STAFF	Order Intake & Reception	stage-emerald	1	t	2026-09-26 17:47:14.261743	2026-09-26 17:47:14.261743	/front end/assets/stages/Order_Taken_1010.jpg
c8247d39-bfcb-4f15-b9bb-676f0a8fbf8d	SUMMA	summa	kskdksd	\N	\N	dot-yellow	2	t	2026-09-28 10:56:32.919013	2026-09-28 10:56:32.919013	/front end/assets/stages/Trial_6034.jpg
1331fbf8-d931-42c5-9da1-72784ba8f190	EEEEEEEEEEEEE	eeeeeeeeeeeee	qwxAS	\N	\N	dot-coral	3	t	2026-09-28 11:26:40.48952	2026-09-28 11:26:40.48952	/front end/assets/stages/QC_7019.jpg
c0000002-0000-0000-0000-000000000008	READY_TO_DELIVER	Ready to Deliver	Quality approved, packaged with care and awaiting customer pickup or boutique handover.	SUPERVISOR	Delivery & Handover	stage-silver	4	t	2026-09-26 17:47:14.261743	2026-09-28 11:26:40.494768	/front end/assets/stages/Ready_8043.jpg
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

COPY public.trial_alterations (id, trial_id, description, category, completed, created_at, assigned_tailor, priority, target_date, tailor_notes) FROM stdin;
\.


--
-- Data for Name: trials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, neck_style, sleeve_style, lining, embroidery, fabric, spec_notes, notes, created_at, updated_at, trial_attempt, alteration_count, customer_feedback, customer_rating, fit_preference, fit_checkpoints, fit_notes) FROM stdin;
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
-- PostgreSQL database dump complete
--

\unrestrict YHYQkccLc3lbBJnQIEXSaZHPyqG4aRcoAad91dwlBKLgN3aDWEK9jvI0067EaNu

