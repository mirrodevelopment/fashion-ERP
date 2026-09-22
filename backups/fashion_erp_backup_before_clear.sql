--
-- PostgreSQL database dump
--

\restrict xS6dbGCKD0xTHh6a2ui9MI3MaYynoO68AQ8tQ2zGS2Qm0IPQ2V5hDW2Yn0FKdPf

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
    fabric_allergies text
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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
    balance_amount numeric(12,2) DEFAULT 0.00 NOT NULL
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
    created_at timestamp without time zone DEFAULT now() NOT NULL
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.trials OWNER TO postgres;

--
-- Data for Name: app_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_users (id, username, password_hash, full_name, role, active, last_login, created_at, updated_at) FROM stdin;
d74e0819-2f3d-401b-a5ab-102d02ae74b8	admin	$2a$12$CkKSzEFFfJ61XfSMLpId3OmiBTDWkqijh6xDv0QqutbX46vk9gABC	Boutique Admin	ADMIN	t	2026-09-15 13:32:03.208581	2026-09-12 15:46:41.735826	2026-09-12 15:46:41.735826
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, order_id, appt_type, scheduled_at, duration_minutes, status, staff_assigned, notes, created_at, updated_at, customer_mobile) FROM stdin;
a0000001-0000-0000-0000-000000000001	d0000001-0000-0000-0000-000000000003	CONSULTATION	2026-09-12 10:00:00	60	CONFIRMED	Pranesh B	New design consultation for bridal lehenga	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 98402 11982
a0000001-0000-0000-0000-000000000002	d0000001-0000-0000-0000-000000000002	MEASUREMENT	2026-09-12 11:30:00	45	CONFIRMED	Sneha Patel	Detailed measurements for Chudi sets	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 97890 54321
a0000001-0000-0000-0000-000000000003	d0000001-0000-0000-0000-000000000004	TRIAL	2026-09-12 14:00:00	45	CONFIRMED	Latha Menon	Blouse trial and neckline depth adjustment	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 98840 99881
a0000001-0000-0000-0000-000000000004	d0000001-0000-0000-0000-000000000001	DELIVERY	2026-09-12 16:00:00	30	CONFIRMED	Pranesh B	Customer pickup for bridal blouse and saree set	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 99628 44110
e950e7c0-a4e0-4cec-b2d4-bc56a6912b62	\N	FITTING	2026-09-20 09:00:00	45	SCHEDULED	Master Tailor	First fitting for Royal Heritage Lehenga	2026-09-15 05:21:01.983041	2026-09-15 05:21:01.991106	+919876540001
8bc4293f-7e98-4628-ad8d-cc146860a77e	\N	FITTING	2026-09-20 09:00:00	45	SCHEDULED	Master Tailor	First fitting for Royal Heritage Lehenga	2026-09-15 06:16:13.550308	2026-09-15 06:16:13.556206	+919876540001
98b9be6e-58f6-4cb6-bb2e-c3baa5c3df15	\N	FITTING	2026-09-20 09:00:00	45	SCHEDULED	Master Tailor	First fitting for Royal Heritage Lehenga	2026-09-15 07:23:39.240108	2026-09-15 07:23:39.241143	+919876540001
bba81c98-8888-49b2-8ed5-ce827de5434d	\N	FITTING	2026-09-20 09:00:00	45	SCHEDULED	Master Tailor	First fitting for Royal Heritage Lehenga	2026-09-15 07:30:32.010729	2026-09-15 07:30:32.015171	+919876540001
caa22672-2579-4e80-98aa-567c23acae0d	\N	FITTING	2026-09-20 09:00:00	45	SCHEDULED	Master Tailor	First fitting for Royal Heritage Lehenga	2026-09-15 07:51:06.423735	2026-09-15 07:51:06.423735	+919876540001
\.


--
-- Data for Name: customer_body_measurements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_body_measurements (id, customer_mobile, customer_name, garment_type, measurement_type, is_current, version, unit, shoulder, bust, under_bust, waist, hip, blouse_length, top_length, full_length, skirt_length, pant_length, armhole, upper_arm, sleeve_length, sleeve_round, elbow_round, wrist_round, front_neck_depth, back_neck_depth, bust_point, bust_point_to_bust_point, shoulder_to_bust, shoulder_to_waist, front_width, back_width, pant_waist, pant_hip, thigh_round, knee_round, calf_round, ankle_round, crotch_length, bottom_opening, waist_to_hip, flare, posture_notes, shape_notes, notes, recorded_by, recorded_at, updated_at) FROM stdin;
29a980bd-9df9-4c14-ad7a-e5b3eb126444	+91 98400 22119	Meera Pillai	CHUDI	CURRENT	t	1	in	13.00	31.00	\N	25.00	\N	44.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Straight cut kurta with pant length allowance.	\N	\N	Master Rajesh	2026-08-24 09:30:00	2026-09-15 10:36:00.5632
fbec4c2a-0781-4700-9ddf-df10076acc21	+91 90987 66554	Divya Raj	BLOUSE	CURRENT	t	1	in	13.50	33.00	\N	27.00	\N	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Boat neck front with deep drop back; extra ease on armhole.	\N	\N	Sneha Patel	2026-08-25 12:20:00	2026-09-15 10:36:00.5632
77e9379c-a8bb-4d5d-9a55-d162161cb67f	+91 93422 11009	Anitha Raj	GOWN	CURRENT	t	1	in	14.00	34.00	\N	28.00	\N	56.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Empire waist floor-length evening gown with soft trail.	\N	\N	Master Rajesh	2026-08-28 16:45:00	2026-09-15 10:36:00.5632
f6fdcbc0-a312-4619-a3ae-20332dde6b28	+91 98401 22334	Sneha Reddy	SAREE	CURRENT	t	1	in	14.00	35.00	\N	29.00	\N	44.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Pre-pleated pallu measurement with elasticated waistband comfort.	\N	\N	Sneha Patel	2026-08-30 11:00:00	2026-09-15 10:36:00.5632
87a66c30-84d8-4f51-bcc5-0486b72501fa	+91 99628 44110	Kavya Nair	BLOUSE	CURRENT	t	1	in	14.00	34.00	\N	28.00	\N	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Needs 0.25 inch extra ease under armhole; stitch with soft gold piping.	\N	\N	Sneha Patel	2026-09-12 15:46:41.7682	2026-09-15 10:36:00.5632
f7000bea-ac8e-4390-957a-3b51f3abd5eb	+91 98451 66789	Radhika Iyer	CHUDI	CURRENT	t	1	in	13.50	32.00	\N	26.00	\N	46.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Princess cut chudi with side slits and soft crepe inner lining.	\N	\N	Master Rajesh	2026-09-06 14:15:00	2026-09-15 10:36:00.5632
ce7f3027-a2eb-4bf6-bb11-0e0c0cf9d10f	+91 98412 76123	Isha Menon	SAREE	CURRENT	t	1	in	14.50	36.00	\N	30.00	\N	44.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Designer pallu pleats and saree drape specifications.	\N	\N	Master Rajesh	2026-08-20 17:00:00	2026-09-15 10:36:00.5632
70ee8b10-89e2-4ac0-b4ab-ad26740bd294	+91 96321 44567	Neha Bhat	LEHENGA	CURRENT	t	1	in	14.00	34.00	\N	28.00	\N	42.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	High-waist bridal lehenga with dual tassels.	\N	\N	Sneha Patel	2026-08-22 15:10:00	2026-09-15 10:36:00.5632
b4b580eb-4a5c-4513-9def-3d3b2b11bafe	+91 99801 33445	Pooja Sinha	BLOUSE	CURRENT	t	1	in	14.00	34.00	\N	28.00	\N	40.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Indo-western jacket dress with corset boning.	\N	\N	Sneha Patel	2026-08-18 13:40:00	2026-09-15 10:36:00.5632
5d71ec90-2f0b-4dca-aa51-4b9cca3c2dd8	+91 98840 99881	Priya Sharma	LEHENGA	CURRENT	t	1	in	14.50	36.00	\N	30.00	\N	42.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Heavy can-can flared waist fitting. Double waistband lining.	\N	\N	Sneha Patel	2026-09-05 10:30:00	2026-09-15 10:36:00.5632
98afcc3e-f7f7-4ac3-a789-5dbc872fc83c	+919876540001	Tara Varma	BLOUSE	CURRENT	t	1	in	14.00	34.50	\N	28.00	\N	14.50	\N	\N	\N	\N	\N	\N	11.00	\N	\N	\N	7.00	8.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Erect posture, narrow shoulder	\N	\N	\N	2026-09-15 05:08:06.450674	2026-09-15 05:08:06.462071
65d575a0-695b-472e-a970-e9ffc372e8a9	+919876540001	Tara Varma	LEHENGA	CURRENT	t	1	in	\N	\N	\N	30.00	40.00	42.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Standard flair lehenga	\N	\N	\N	2026-09-15 05:21:01.755198	2026-09-15 05:21:01.763285
7c1a3ee2-2faf-44f8-acc8-d7a680f914cb	+919876540002	Priya Sharma	BLOUSE	OLD	f	1	in	14.50	34.00	29.00	28.00	\N	14.00	\N	\N	\N	\N	15.50	11.50	10.50	11.00	10.00	6.50	6.50	8.00	9.50	7.50	9.50	14.00	13.50	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:38:58.562701	2026-09-15 05:38:58.612152
1ef63560-1ca6-45b1-bcf4-840833273ed4	+919876540002	Priya Sharma	BLOUSE	OLD	f	2	in	14.50	34.50	29.50	29.00	\N	14.00	\N	\N	\N	\N	16.00	11.50	11.00	11.00	10.00	6.50	7.00	8.50	9.50	7.50	9.50	14.00	13.50	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:38:58.610498	2026-09-15 05:48:41.833806
c030a3bf-0df7-4922-a800-b82c39761b3c	+919876540002	Priya Sharma	BLOUSE	OLD	f	3	in	14.50	34.00	29.00	28.00	\N	14.00	\N	\N	\N	\N	15.50	11.50	10.50	11.00	10.00	6.50	6.50	8.00	9.50	7.50	9.50	14.00	13.50	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:48:41.831706	2026-09-15 05:48:41.865118
d80713d3-c4af-43bb-9bf6-910dfec7a793	+919876540002	Priya Sharma	CHUDI	OLD	f	1	in	14.50	35.00	29.50	29.00	38.00	\N	40.00	\N	\N	39.00	16.00	11.50	18.00	10.50	9.50	6.50	6.50	7.00	\N	\N	\N	\N	13.50	14.00	30.00	40.00	22.00	15.00	13.00	10.00	26.00	12.00	\N	\N	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:38:58.63557	2026-09-15 05:48:41.920488
7ef07c5b-1b4c-4e1d-af43-6a05e2c8a48e	+919876540002	Priya Sharma	LEHENGA	CURRENT	t	1	in	14.50	34.00	29.00	28.00	38.00	14.00	\N	\N	42.00	\N	15.50	11.50	10.50	11.00	10.00	6.50	6.50	8.00	9.50	7.50	9.50	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	140.00	8.00	120.00	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:48:52.093167	2026-09-15 05:48:52.093167
d9f36e8d-955f-44a7-8138-5166abe6fb55	+919876540002	Priya Sharma	SAREE	CURRENT	t	1	in	14.50	34.00	29.00	28.00	\N	14.00	\N	\N	\N	\N	15.50	11.50	10.50	11.00	10.00	6.50	6.50	8.00	9.50	7.50	9.50	14.00	13.50	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:48:52.118895	2026-09-15 05:48:52.11998
795fa040-85aa-40c1-aef7-83966ed1b7d7	+919876540002	Priya Sharma	GOWN	CURRENT	t	1	in	14.50	34.50	29.50	28.50	38.50	\N	\N	56.00	\N	\N	16.00	11.50	22.00	10.50	9.50	6.50	6.50	7.50	9.50	7.50	9.50	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	150.00	8.00	140.00	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:48:52.139905	2026-09-15 05:48:52.140986
0910795f-afcd-4525-af66-1363719ca77c	+919876540002	Priya Sharma	BLOUSE	OLD	f	4	in	14.50	34.50	29.50	29.00	\N	14.00	\N	\N	\N	\N	16.00	11.50	11.00	11.00	10.00	6.50	7.00	8.50	9.50	7.50	9.50	14.00	13.50	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:48:41.862466	2026-09-15 05:52:54.094611
b5d538a7-1d3f-4818-b6ac-a4bda4ab2a31	+919876540002	Priya Sharma	BLOUSE	CURRENT	t	6	in	14.50	34.50	29.50	29.00	\N	14.00	\N	\N	\N	\N	16.00	11.50	11.00	11.00	10.00	6.50	7.00	8.50	9.50	7.50	9.50	14.00	13.50	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:52:54.12074	2026-09-15 05:52:54.121844
53f7b686-3e78-413d-ab63-18e028f4d0bd	+919876540002	Priya Sharma	BLOUSE	OLD	f	5	in	14.50	34.00	29.00	28.00	\N	14.00	\N	\N	\N	\N	15.50	11.50	10.50	11.00	10.00	6.50	6.50	8.00	9.50	7.50	9.50	14.00	13.50	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:52:54.093028	2026-09-15 05:52:54.122937
4ef08f99-abbf-4fd5-bfb0-a7953e5600f1	+919876540002	Priya Sharma	CHUDI	CURRENT	t	3	in	14.50	35.00	29.50	29.00	38.00	\N	40.00	\N	\N	39.00	16.00	11.50	18.00	10.50	9.50	6.50	6.50	7.00	\N	\N	\N	\N	13.50	14.00	30.00	40.00	22.00	15.00	13.00	10.00	26.00	12.00	\N	\N	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:52:54.141101	2026-09-15 05:52:54.142267
c75e0c7b-6e20-475e-8fba-5b61418e3df3	+919876540002	Priya Sharma	CHUDI	OLD	f	2	in	14.50	35.00	29.50	29.00	38.00	\N	40.00	\N	\N	39.00	16.00	11.50	18.00	10.50	9.50	6.50	6.50	7.00	\N	\N	\N	\N	13.50	14.00	30.00	40.00	22.00	15.00	13.00	10.00	26.00	12.00	\N	\N	\N	\N	\N	Master Tailor Sneha	2026-09-15 05:48:41.915671	2026-09-15 05:52:54.143319
\.


--
-- Data for Name: customer_measurements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_measurements (id, customer_mobile, garment_type, bust, upper_bust, under_bust, waist, high_hip, full_hip, shoulder, cross_front, cross_back, armhole, sleeve_length, bicep, wrist, front_neck, back_neck, apex_point, garment_length, posture_notes, shape_notes, recorded_by, is_active_profile, recorded_at, updated_at) FROM stdin;
63b83269-5594-4092-b6d2-61b584b9c829	+91 98400 22119	Chudi Set	31.00	\N	\N	25.00	\N	\N	13.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	44.00	Straight cut kurta with pant length allowance.	\N	Master Rajesh	t	2026-08-24 09:30:00	2026-09-15 10:36:00.5632
3b31d0ee-6955-4cf9-91bf-1bec9b84388b	+91 90987 66554	Blouse	33.00	\N	\N	27.00	\N	\N	13.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	14.00	Boat neck front with deep drop back; extra ease on armhole.	\N	Sneha Patel	t	2026-08-25 12:20:00	2026-09-15 10:36:00.5632
0a8ec0ed-707f-47ab-a626-31c43b5e6ec9	+91 93422 11009	Gown	34.00	\N	\N	28.00	\N	\N	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	56.00	Empire waist floor-length evening gown with soft trail.	\N	Master Rajesh	t	2026-08-28 16:45:00	2026-09-15 10:36:00.5632
51eb8d1a-71df-43fc-b440-43699f50a367	+91 98401 22334	Saree	35.00	\N	\N	29.00	\N	\N	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	44.00	Pre-pleated pallu measurement with elasticated waistband comfort.	\N	Sneha Patel	t	2026-08-30 11:00:00	2026-09-15 10:36:00.5632
54bf88fd-fcf3-4bd0-823d-738e0a321d65	+91 99628 44110	Blouse	34.00	\N	\N	28.00	\N	\N	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	14.00	Needs 0.25 inch extra ease under armhole; stitch with soft gold piping.	\N	Sneha Patel	t	2026-09-12 15:46:41.7682	2026-09-15 10:36:00.5632
596efff7-2b2d-44fb-96c5-ba69c86bb519	+91 98451 66789	Chudi Set	32.00	\N	\N	26.00	\N	\N	13.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	46.00	Princess cut chudi with side slits and soft crepe inner lining.	\N	Master Rajesh	t	2026-09-06 14:15:00	2026-09-15 10:36:00.5632
b49b0820-9683-4fc5-88b2-f019f45b6e16	+91 98412 76123	Saree	36.00	\N	\N	30.00	\N	\N	14.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	44.00	Designer pallu pleats and saree drape specifications.	\N	Master Rajesh	t	2026-08-20 17:00:00	2026-09-15 10:36:00.5632
6808e0a6-51c9-4447-ae13-e6ca2e587f61	+91 96321 44567	Lehenga	34.00	\N	\N	28.00	\N	\N	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	42.00	High-waist bridal lehenga with dual tassels.	\N	Sneha Patel	t	2026-08-22 15:10:00	2026-09-15 10:36:00.5632
98dd25d2-efb3-4642-b1d2-b03660f98057	+91 99801 33445	Custom	34.00	\N	\N	28.00	\N	\N	14.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	40.00	Indo-western jacket dress with corset boning.	\N	Sneha Patel	t	2026-08-18 13:40:00	2026-09-15 10:36:00.5632
b98625b9-2be5-406d-9f9e-86b13b9aead4	+91 98840 99881	Lehenga	36.00	\N	\N	30.00	\N	\N	14.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	42.00	Heavy can-can flared waist fitting. Double waistband lining.	\N	Sneha Patel	t	2026-09-05 10:30:00	2026-09-15 10:36:00.5632
848f12a5-d8dd-4542-abab-409de36523b4	+919876540001	Blouse	34.50	\N	\N	28.00	\N	\N	14.00	\N	\N	\N	11.00	\N	\N	7.00	8.50	\N	14.50	Erect posture, narrow shoulder	\N	\N	t	2026-09-15 05:08:06.450674	2026-09-15 05:08:06.462071
1e0081fc-3737-4dd7-b7f9-358abb046d7b	+919876540001	Lehenga	\N	\N	\N	30.00	36.00	40.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	42.00	Standard flair lehenga	\N	\N	t	2026-09-15 05:21:01.755198	2026-09-15 05:21:01.763285
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (name, email, location, avatar_url, tier, total_spend, balance, favorite_garment, measurements_on_file, notes, created_at, updated_at, mobile_number, first_name, last_name, salutation, gender, alt_phone, instagram_handle, preferred_channel, dob, anniversary, street_address, city, state, pincode, landmark, credit_limit, fit_preference, fabric_allergies) FROM stdin;
Kavya Nair	kavya.nair@gmail.com	Chennai, Tamil Nadu	https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80	VIP_PLATINUM	48500.00	3200.00	Bridal Kente & Silk Lehenga	t	Prefers handwoven Kanjeevarams and bespoke zardozi embroidery.	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 99628 44110	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Ananya Iyer	ananya.iyer@gmail.com	T. Nagar, Chennai	https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80	VIP_GOLD	24000.00	0.00	Raw Silk Lehenga & Choli	t	Prefers pastel shades and minimalist zardozi work.	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 98402 11982	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Radhika Menon	radhika.menon@outlook.com	Alwarpet, Chennai	https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80	VIP_PLATINUM	62000.00	18500.00	Designer Blouse & Saree Set	t	VIP customer since Mar 2023.	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 97890 54321	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Priya Sharma	priya.sharma@gmail.com	Nungambakkam, Chennai	https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop&q=80	REGULAR	18000.00	10000.00	Bespoke Evening Gown	t	Prefers lightweight fabrics with delicate hand embroidery.	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 98840 99881	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Sneha Reddy	sneha.reddy@gmail.com	Adyar, Chennai	https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80	REGULAR	9500.00	0.00	Kurti & Straight Pants Set	t	Classic contemporary Indo-western styling.	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 98401 22334	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Meera Krishnan	meera.krishnan@example.com	Besant Nagar, Chennai	\N	VIP_GOLD	0.00	0.00	Banarasi Silk Saree & Blouse	f	Prefers organic silk and subtle zardozi work	2026-09-12 10:27:01.232791	2026-09-12 10:27:01.430537	+91 98765 43210	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Radhika Iyer	radhika.iyer@gmail.com	Coimbatore, Tamil Nadu	https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80	REGULAR	15400.00	0.00	Chudi Set	t	Prefers pure cotton and chanderi silks.	2026-09-15 10:07:51.137009	2026-09-15 10:07:51.137009	+91 98451 66789	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Anitha Raj	anitha.raj@gmail.com	Madurai, Tamil Nadu	https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80	REGULAR	12800.00	0.00	Gown	t	Bespoke western flair with traditional borders.	2026-09-15 10:07:51.137009	2026-09-15 10:07:51.137009	+91 93422 11009	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Divya Raj	divya.raj@outlook.com	Kochi, Kerala	https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80	REGULAR	21000.00	0.00	Blouse	t	Intricate hand embroidery specialist request.	2026-09-15 10:07:51.137009	2026-09-15 10:07:51.137009	+91 90987 66554	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Meera Pillai	meera.pillai@gmail.com	Trivandrum, Kerala	https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80	REGULAR	8900.00	1200.00	Chudi Set	t	Comfort fit with slit ease.	2026-09-15 10:07:51.137009	2026-09-15 10:07:51.137009	+91 98400 22119	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Neha Bhat	neha.bhat@gmail.com	Mangalore, Karnataka	https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80	REGULAR	19800.00	0.00	Lehenga	t	Festive celebration wear.	2026-09-15 10:07:51.137009	2026-09-15 10:07:51.137009	+91 96321 44567	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Isha Menon	isha.menon@gmail.com	Calicut, Kerala	https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80	REGULAR	14500.00	2400.00	Saree	t	Pleat styling and bespoke fall/pico.	2026-09-15 10:07:51.137009	2026-09-15 10:07:51.137009	+91 98412 76123	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Pooja Sinha	pooja.sinha@gmail.com	Mumbai, Maharashtra	https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80	REGULAR	34200.00	0.00	Custom	t	Couture designer cuts and bespoke patterns.	2026-09-15 10:07:51.137009	2026-09-15 10:07:51.137009	+91 99801 33445	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
Tara Varma	\N	\N	\N	VIP_GOLD	0.00	0.00	Bridal Lehenga	t	\N	2026-09-15 05:06:49.007696	2026-09-15 05:08:06.468854	+919876540001	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	Chennai	\N	\N	\N	0.00	\N	\N
Priya Sharma	priya.sharma@example.com	\N	\N	VIP_GOLD	0.00	0.00	\N	t	\N	2026-09-15 05:38:58.452327	2026-09-15 05:38:58.566688	+919876540002	\N	\N	\N	Female	\N	\N	WhatsApp	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N
\.


--
-- Data for Name: designs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.designs (id, design_code, title, garment_type, order_id, status, style_notes, designer, thumbnail_url, created_at, updated_at, customer_mobile, sub_category, style, occasion, collection, primary_fabric, colour_options, sizes, construction, embroidery, estimated_cost, suggested_price, estimated_labour, production_status, times_used, last_used_date, tags, image_urls, swatches, notes, created_by) FROM stdin;
de000001-0000-0000-0000-000000000006	DES-2026-0005	Festive Anarkali — New Season 2026	Anarkali	\N	DRAFT	Concept design for Diwali festive collection 2026. Floor-length Anarkali in burnt orange and gold, heavy kali pattern.	Lakshmi Priya	https://images.unsplash.com/photo-1545126127-e70e00b5c98f?w=400&auto=format&fit=crop&q=80	2026-09-08 17:49:12.169662	2026-09-12 17:49:12.169662	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	\N	Active	0	\N	\N	\N	\N	\N	\N
de000001-0000-0000-0000-000000000007	DES-2026-0004	Heritage Silk Saree Blouse Template	Saree Blouse	\N	ARCHIVED	Standard heritage blouse template for Kanjeevarum sarees. Deep back, elbow sleeve, piping in contrasting silk. Catalog reference.	Lakshmi Priya	https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=400&auto=format&fit=crop&q=80	2026-08-23 17:49:12.169662	2026-09-12 17:49:12.169662	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	\N	Active	0	\N	\N	\N	\N	\N	\N
de000001-0000-0000-0000-000000000008	DES-2026-0003	Contemporary Kurta — Corporate Collection	Kurta	\N	DRAFT	Slim-fit cotton kurta for corporate wear. Mandarin collar, no embroidery, placket buttons. 4-color variants — navy, slate, ivory, olive.	Lakshmi Priya	https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80	2026-09-09 17:49:12.169662	2026-09-12 17:49:12.169662	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	\N	Active	0	\N	\N	\N	\N	\N	\N
de000001-0000-0000-0000-000000000009	DES-2026-0002	Bridal Gown — Western Fusion Concept	Gown	\N	IN_REVIEW	A-line bridal gown with trail, lace overlay on bodice, satin skirt. Fusion India-Western. Client review scheduled for next week.	Lakshmi Priya	https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&auto=format&fit=crop&q=80	2026-09-10 17:49:12.169662	2026-09-12 17:49:12.169662	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	\N	Active	0	\N	\N	\N	\N	\N	\N
de000001-0000-0000-0000-000000000010	DES-2026-0001	Embroidered Palazzo Set — Party Wear	Palazzo Set	\N	DRAFT	Wide-leg palazzo in net with under-layer, crop top with mirror embroidery. Target: party wear segment. Instagram lookbook planned.	Lakshmi Priya	https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&auto=format&fit=crop&q=80	2026-09-11 17:49:12.169662	2026-09-12 17:49:12.169662	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	\N	Active	0	\N	\N	\N	\N	\N	\N
de000001-0000-0000-0000-000000000001	DES-2026-0010	Zardozi Bridal Blouse — Kavya Nair	Blouse	d0000001-0000-0000-0000-000000000001	APPROVED	Heavy zardozi on front yoke, gold piping, boat-neck, 3/4 sleeve with cuff. Inner lining in soft beige satoon.	Lakshmi Priya	https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80	2026-09-02 17:49:12.169662	2026-09-12 17:49:12.169662	+91 99628 44110	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	\N	Active	0	\N	\N	\N	\N	\N	\N
de000001-0000-0000-0000-000000000002	DES-2026-0009	Bridal Silk Lehenga — Ananya Iyer	Lehenga	d0000001-0000-0000-0000-000000000003	IN_REVIEW	Heavy can-can skirt, double-layer brocade panel, thread & mirror work. Contrasting dupatta with scalloped border.	Lakshmi Priya	https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&auto=format&fit=crop&q=80	2026-09-04 17:49:12.169662	2026-09-12 17:49:12.169662	+91 98402 11982	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	\N	Active	0	\N	\N	\N	\N	\N	\N
de000001-0000-0000-0000-000000000003	DES-2026-0008	Royal Blue Chudi Set — Radhika Menon	Chudi	d0000001-0000-0000-0000-000000000002	APPROVED	Two sets — royal blue and ivory. Side zipper, contrast piping, soft inner lining with lurex thread at hem. Straight fit.	Lakshmi Priya	https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&auto=format&fit=crop&q=80	2026-09-05 17:49:12.169662	2026-09-12 17:49:12.169662	+91 97890 54321	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	\N	Active	0	\N	\N	\N	\N	\N	\N
de000001-0000-0000-0000-000000000004	DES-2026-0007	Princess Cut Raw Silk Blouse	Blouse	d0000001-0000-0000-0000-000000000004	APPROVED	Princess cut pattern, round neck, potli buttons at back, soft padded bust line. Raw silk exterior with satoon lining.	Lakshmi Priya	https://images.unsplash.com/photo-1602573991155-21f0143b6747?w=400&auto=format&fit=crop&q=80	2026-09-06 17:49:12.169662	2026-09-12 17:49:12.169662	+91 98840 99881	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	\N	Active	0	\N	\N	\N	\N	\N	\N
de000001-0000-0000-0000-000000000005	DES-2026-0006	Summer Chic Kurti — Sneha Reddy	Kurti	d0000001-0000-0000-0000-000000000005	APPROVED	Indo-western A-line kurti, handwoven linen, pintuck at bust, 3/4 sleeve. Paired with straight palazzo in contrast.	Lakshmi Priya	https://images.unsplash.com/photo-1583937443435-3c5a5dc87d7e?w=400&auto=format&fit=crop&q=80	2026-09-07 17:49:12.169662	2026-09-12 17:49:12.169662	+91 98401 22334	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	\N	Active	0	\N	\N	\N	\N	\N	\N
c9d78625-e9a1-4016-86bb-74d5e1f24df3	DS-2026-001	Zari Bloom	Blouse	\N	APPROVED	\N	Priya S	../assets/designs/zari-bloom-front.jpg	2026-09-15 18:32:53.986675	2026-09-15 18:32:53.986675	\N	Bridal Couture	Embroidered	Wedding	Royal Heritage	Banarasi Raw Silk	Crimson Red, Emerald Green, Royal Blue, Mustard Gold	Custom / Made to Measure	Padded, Sweetheart Neck, Dori Tie Back	Antique Zari, Cutdana Beads, Micro Sequins	2850.00	8500.00	6 hours	Active	18	2026-09-06	Bridal,Zari,Handwork,Bestseller,Sweetheart Neck	../assets/designs/zari-bloom-front.jpg,../assets/designs/zari-bloom-back.jpg,../assets/designs/zari-bloom-detail.jpg	#B82E5A,#D4AF37,#2D5A27	Intricate floral zari jaal with sweetheart neckline and tasseled dori tie back.	Priya S
9f2f2f91-a6e9-4f5f-8104-3432f0aa09af	DS-2026-002	Garden Party Lehenga	Lehenga	\N	APPROVED	\N	Aditi Rao	../assets/designs/garden-party.jpg	2026-09-15 18:32:53.986675	2026-09-15 18:32:53.986675	\N	Mehendi & Sangeet	Printed & Embroidered	Sangeet	Spring Blossom	Organza Silk	Blush Pink, Mint Green, Lilac, Champagne	Custom Waist & Length	Can-Can Layered, Cancan Net, Side Zip with Tassels	Resham Threadwork, Pearl Beads & Mirrors	7200.00	24000.00	16 hours	Active	12	2026-09-09	Pastel,Floral,Organza,Flared Skirt	../assets/designs/garden-party.jpg,../assets/designs/lehenga-mannequin.png	#E6A7B8,#F7D070,#A9E8D8	Lightweight 24-kali organza skirt with hand-embroidered pearl blouse and sheer dupatta.	Aditi Rao
b6f71edf-ed75-47b0-9bf2-04c52499c24e	DS-2026-003	Regal Drape Saree	Saree	\N	APPROVED	\N	Priya S	../assets/designs/regal-drape.jpg	2026-09-15 18:32:53.986675	2026-09-15 18:32:53.986675	\N	Heritage Weaves	Woven Brocade	Wedding	Varanasi Gold	Kanjivaram Pure Silk	Vermilion Red, Peacock Blue, Mustard Korvai	Standard 6.2m with Blouse Piece	Traditional Korvai Weave, Heavy Pallu with Tassels	Authentic Zari Weaving on Loom	11500.00	32000.00	4 hours (Tailoring & Fall Pico)	Active	15	2026-09-08	Heritage,Silk Mark,Gold Zari,Bridal	../assets/designs/regal-drape.jpg,../assets/designs/saree-stage.png	#991B1B,#D97706,#4338CA	Pure mulberry silk with real gold-coated zari pallu and matching contrast blouse.	Priya S
31baf7f1-cf96-4af7-abda-2707048bd6c9	DS-2026-004	Midnight Grace Gown	Gown	\N	APPROVED	\N	Aditi Rao	../assets/designs/midnight-grace.jpg	2026-09-15 18:32:53.986675	2026-09-15 18:32:53.986675	\N	Evening Soiree	Contemporary Silhouette	Reception	Nocturne Elegance	Micro Velvet & Satin	Midnight Blue, Wine Bordeaux, Obsidian Black	Custom Fitted	Boning Corset Bodice, Off-Shoulder, Thigh-high Draped Slit	Bugle Beads, Jet Black Crystals along Corset	6500.00	19500.00	12 hours	Active	8	2026-09-01	Evening Wear,Velvet,Corset,Slit Gown	../assets/designs/midnight-grace.jpg,../assets/designs/gown-mannequin.png	#1E1B4B,#312E81,#0F172A	Architectural structured corset gown crafted in plush velvet with a flared satin train.	Aditi Rao
62a06bb2-ca38-4714-a3d3-905e86522f8e	DS-2026-005	Meadow Grace Kurti	Kurti	\N	APPROVED	\N	Priya S	../assets/designs/meadow-grace.jpg	2026-09-15 18:32:53.986675	2026-09-15 18:32:53.986675	\N	Luxury Pret	A-Line Anarkali	Festive	Spring Blossom	Chanderi Silk & Mulmul	Sage Mint, Marigold Yellow, Dusty Rose	S, M, L, XL, Custom	Angrakha Style Yoke, 16 Kali Flare, Pockets	Fine Gota Patti, Zardozi Floral Sprigs	2200.00	6800.00	5 hours	Active	22	2026-09-07	Chanderi,Anarkali,Pastel Green,Hand Embroidery	../assets/designs/meadow-grace.jpg,../assets/designs/kurti-mannequin.png	#10B981,#F59E0B,#EC4899	Flowy Chanderi Anarkali kurti paired with cropped cigarette pants and organza dupatta.	Priya S
ca258fbc-e0f6-490d-a37a-02ecae304352	DS-2026-006	Classic Elegance Blouse	Blouse	\N	APPROVED	\N	Aditi Rao	../assets/designs/classic-elegance.jpg	2026-09-15 18:32:53.986675	2026-09-15 18:32:53.986675	\N	Festive Occasion	Gota Patti Work	Festive	Royal Heritage	Tussar Silk with Gota Patti	Mustard Gold, Rani Pink, Bottle Green	Custom Made to Measure	Princess Cut, Deep U-Back with Fabric Tie	Rajasthani Gota Patti & Zari Borders	2400.00	7200.00	5.5 hours	Active	14	2026-09-05	Tussar,Gota Patti,Elbow Sleeve,Festive	../assets/designs/classic-elegance.jpg,../assets/designs/blouse-stage.png	#D4AF37,#991B1B,#1E3A8A	Princess-cut Tussar blouse with Rajasthani gold gota patti border and elbow sleeves.	Aditi Rao
9e62ecf5-8f45-473b-946d-667dfffeddde	DS-2026-007	Indigo Dreams Suit	Suit	\N	IN_REVIEW	\N	Priya S	../assets/designs/indigo-dreams.jpg	2026-09-15 18:32:53.986675	2026-09-15 18:32:53.986675	\N	Formal Pret	Straight Cut	Formal	Everyday Luxury	Handloom Cotton & Khadi	Indigo Blue, Off-White, Slate Grey	XS, S, M, L, XL, Custom	Straight Cut Kurta, Cigarette Pant, Organza Dupatta	Hand Block Print, Indigo Natural Dye	1900.00	5700.00	4 hours	Active	19	2026-09-04	Indigo,Block Print,Straight Cut,Summer	../assets/designs/indigo-dreams.jpg,../assets/designs/suit-stage.png	#1E3A8A,#7C3AED,#1F2937	Hand block-printed indigo Khadi suit with matching cigarette pants and organza dupatta.	Priya S
1980d509-f3b1-4213-a46f-069f90ff29af	DS-2026-008	Rose Ombre Sharara	Sharara	\N	APPROVED	\N	Aditi Rao	../assets/designs/rose-ombre.jpg	2026-09-15 18:32:53.986675	2026-09-15 18:32:53.986675	\N	Festive Ethnic	Ombre Printed	Festive	Spring Blossom	Georgette & Net	Blush to Magenta, Ivory to Gold, Lavender to Purple	S, M, L, Custom	Wide Leg Sharara, Flared Hem, Fringe Trim	Sequin Border, Mukaish Work on Kurti	3200.00	9600.00	7 hours	Active	9	2026-09-03	Sharara,Ombre,Sequin,Festive	../assets/designs/rose-ombre.jpg,../assets/designs/sharara-stage.png	#FB7185,#F9A8D4,#C084FC	Ombre dip-dyed georgette sharara with mukaish kurti and sheer net dupatta with sequin border.	Aditi Rao
9199f2f1-6aa3-47e1-9f83-85d38d62a5f1	DS-2026-009	Skyline Couture Gown	Gown	\N	DRAFT	\N	Priya S	../assets/designs/skyline.jpg	2026-09-15 18:32:53.986675	2026-09-15 18:32:53.986675	\N	Cocktail	Mermaid Silhouette	Party	Modern Met Gala	Duchess Satin & Net	Ice Blue, Silver Lilac, Royal Sapphire	Custom Fitted	Sculpted Sweetheart Neckline with Flared Flounce	Crystal Net Yoke & Sequined Accents	5800.00	17500.00	10 hours	Active	11	2026-09-05	Mermaid,Satin,Sculpted,Cocktail	../assets/designs/skyline.jpg,../assets/designs/gown-stage.png	#60A5FA,#818CF8,#C084FC	Figure-contouring mermaid cocktail gown with structured shoulder flounce and crystal yoke.	Priya S
c82d41c6-d2e9-404f-90aa-bd2b9d8cf597	DS-2026-010	Minimal Muse Blouse	Blouse	\N	APPROVED	\N	Aditi Rao	../assets/designs/minimal-muse.jpg	2026-09-15 18:32:53.986675	2026-09-15 18:32:53.986675	\N	Contemporary Classic	Boat Neck Minimalist	Formal	Everyday Luxury	Matka Silk with Threadwork	Ivory White, Charcoal Grey, Tan Gold	Custom Made to Measure	Boat Neck, Elbow Sleeves, Concealed Side Zipper	Tonal Hand Kantha Stitching along Neckline	1600.00	4800.00	3.5 hours	Active	31	2026-09-09	Boat Neck,Matka Silk,Minimalist,Workwear	../assets/designs/minimal-muse.jpg,../assets/designs/blouse-stage.png	#1F2937,#4B5563,#F3F4F6	Sophisticated minimalist blouse suitable for handloom sarees and formal occasions.	Aditi Rao
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, employee_code, name, phone, email, role, status, joined_date, avatar_url, specialization, notes, created_at, updated_at) FROM stdin;
a1000001-0000-0000-0000-000000000001	EMP-001	Lakshmi Priya	+91 98401 23451	lakshmi.p@haulo.in	DESIGNER	ACTIVE	2024-01-14	\N	Sketching, Pattern Making	Lead bridal couture designer.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
a1000001-0000-0000-0000-000000000002	EMP-002	Ramesh K	+91 98402 34562	ramesh.k@haulo.in	CUTTER	ACTIVE	2023-09-15	\N	Fabric Cutting, Marker Making	Senior master cutter.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
a1000001-0000-0000-0000-000000000003	EMP-003	Saira Banu	+91 98403 45673	saira.b@haulo.in	TAILOR	ACTIVE	2024-03-10	\N	Blouse, Chudi, Alteration	High speed precision tailoring.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
a1000001-0000-0000-0000-000000000004	EMP-004	Suresh Kumar	+91 98404 56784	suresh.k@haulo.in	TAILOR	ACTIVE	2023-05-20	\N	Lehenga, Bridal Sets	Master tailor specialized in zardozi assemblies.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
a1000001-0000-0000-0000-000000000005	EMP-005	Latha Menon	+91 98405 67895	latha.m@haulo.in	TAILOR	ACTIVE	2024-02-01	\N	Hemming, Finishing	Expert finishing artist.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
a1000001-0000-0000-0000-000000000006	EMP-006	Anitha Raj	+91 98406 78906	anitha.r@haulo.in	SUPERVISOR	ACTIVE	2023-11-15	\N	Client Trials, Alteration Fit	Head of customer trial fitting.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
a1000001-0000-0000-0000-000000000007	EMP-007	Sneha Rao	+91 98407 89017	sneha.r@haulo.in	QC_SPECIALIST	ACTIVE	2024-04-12	\N	12-point Quality Audit	Senior QC lead inspector.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
a1000001-0000-0000-0000-000000000008	EMP-008	Pranesh B	+91 98408 90128	pranesh.b@haulo.in	MANAGER	ACTIVE	2022-08-01	\N	Operations Management	Boutique & Workshop General Manager.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
\.


--
-- Data for Name: enquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enquiries (id, enquiry_code, customer_name, phone, email, garment_type, notes, status, assigned_to, follow_up_date, converted_order_id, source, created_at, updated_at) FROM stdin;
e9000001-0000-0000-0000-000000000001	ENQ-2026-0012	Divya Krishnan	+91 99401 23456	divya.k@gmail.com	Bridal Lehenga	Looking for heavy zardozi work for November wedding	PENDING	Pranesh B	2026-09-14	\N	INSTAGRAM	2026-09-10 17:49:11.68248	2026-09-12 17:49:11.68248
e9000001-0000-0000-0000-000000000002	ENQ-2026-0011	Meera Pillai	+91 98402 34567	meera.p@outlook.com	Saree Blouse	Wants bespoke blouse for silk saree, bridal collection	FOLLOW_UP	Lakshmi P	2026-09-13	\N	WALK_IN	2026-09-09 17:49:11.68248	2026-09-12 17:49:11.68248
e9000001-0000-0000-0000-000000000003	ENQ-2026-0010	Aarthi Subramaniam	+91 97801 45678	aarthi.s@gmail.com	Churidar Set	2 matching churidar sets for sister's wedding	CONVERTED	Pranesh B	\N	\N	REFERRAL	2026-09-07 17:49:11.68248	2026-09-12 17:49:11.68248
e9000001-0000-0000-0000-000000000004	ENQ-2026-0009	Pooja Venkatesh	+91 96100 56789	pooja.v@gmail.com	Gown	Evening gown for corporate award night	PENDING	Lakshmi P	2026-09-15	\N	PHONE	2026-09-08 17:49:11.68248	2026-09-12 17:49:11.68248
e9000001-0000-0000-0000-000000000005	ENQ-2026-0008	Swathi Balakumar	+91 98403 67890	swathi.b@gmail.com	Lehenga	Budget lehenga for sangeet, no heavy work needed	LOST	Pranesh B	\N	\N	INSTAGRAM	2026-09-06 17:49:11.68248	2026-09-12 17:49:11.68248
e9000001-0000-0000-0000-000000000006	ENQ-2026-0007	Nithya Raghavan	+91 98404 78901	nithya.r@gmail.com	Kurti Set	Corporate casual 3-piece kurti set, comfortable fabric	FOLLOW_UP	Anitha R	2026-09-13	\N	WALK_IN	2026-09-05 17:49:11.68248	2026-09-12 17:49:11.68248
e9000001-0000-0000-0000-000000000007	ENQ-2026-0006	Janani Murugan	+91 99201 89012	janani.m@gmail.com	Silk Saree Blouse	Kanjeevarum blouse with embroidered yoke	CONVERTED	Lakshmi P	\N	\N	PHONE	2026-09-04 17:49:11.68248	2026-09-12 17:49:11.68248
e9000001-0000-0000-0000-000000000008	ENQ-2026-0005	Rekha Srinivasan	+91 98405 90123	rekha.s@gmail.com	Anarkali Set	Full length Anarkali with dupatta for reception	PENDING	Anitha R	2026-09-16	\N	INSTAGRAM	2026-09-03 17:49:11.68248	2026-09-12 17:49:11.68248
e9000001-0000-0000-0000-000000000009	ENQ-2026-0004	Kavitha Mohan	+91 98801 01234	kavitha.m@gmail.com	Blouse	Trendy boat-neck blouse for party wear	FOLLOW_UP	Lakshmi P	2026-09-14	\N	REFERRAL	2026-09-02 17:49:11.68248	2026-09-12 17:49:11.68248
e9000001-0000-0000-0000-000000000010	ENQ-2026-0003	Lalitha Sundar	+91 97001 12345	lalitha.s@gmail.com	Wedding Guest Set	Mother of bride, looking for dignified set piece	CONVERTED	Pranesh B	\N	\N	WALK_IN	2026-08-31 17:49:11.68248	2026-09-12 17:49:11.68248
e9000001-0000-0000-0000-000000000011	ENQ-2026-0002	Brinda Rajan	+91 98901 23456	brinda.r@gmail.com	Lehenga Skirt	Just the skirt component for mix-and-match bridal	PENDING	Lakshmi P	2026-09-17	\N	INSTAGRAM	2026-08-29 17:49:11.68248	2026-09-12 17:49:11.68248
e9000001-0000-0000-0000-000000000012	ENQ-2026-0001	Padma Krishnaswamy	+91 99001 34567	padma.k@gmail.com	Designer Blouse	Designer blouse for Mysore silk, contrasting embroidery	PENDING	Anitha R	2026-09-18	\N	PHONE	2026-08-28 17:49:11.68248	2026-09-12 17:49:11.68248
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	init schema	SQL	V1__init_schema.sql	-173506753	postgres	2026-09-15 13:54:55.809581	100	t
2	2	seed data	SQL	V2__seed_data.sql	-1603058699	postgres	2026-09-15 13:54:55.809581	100	t
3	3	extend designs table	SQL	V3__extend_designs_table.sql	-1474457359	postgres	2026-09-15 18:32:53.652311	226	t
4	4	seed designs	SQL	V4__seed_designs.sql	-237494671	postgres	2026-09-15 18:32:53.96269	30	t
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, item_code, name, category, variant, unit, stock_qty, reserved_qty, reorder_level, purchase_price, supplier_name, image_url, status, created_at, updated_at) FROM stdin;
e0000001-0000-0000-0000-000000000001	FAB-0012	Banarasi Silk	Fabrics	Rani Pink	Meter	120.00	30.00	50.00	1250.00	Varanasi Weavers Co.	\N	IN_STOCK	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682
e0000001-0000-0000-0000-000000000002	FAB-0045	Georgette	Fabrics	Ivory	Meter	60.00	20.00	30.00	480.00	Surat Textiles Ltd.	\N	LOW_STOCK	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682
e0000001-0000-0000-0000-000000000003	LIN-0008	Satoon Lining	Linings	Beige	Meter	200.00	40.00	50.00	95.00	Chennai Lining Hub	\N	IN_STOCK	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682
e0000001-0000-0000-0000-000000000004	THD-0021	Embroidery Thread	Threads	Gold Zari	Spool	45.00	10.00	20.00	180.00	Surat Threads	\N	IN_STOCK	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682
e0000001-0000-0000-0000-000000000005	ACC-0034	Designer Button	Accessories	Antique Gold	Pack	15.00	5.00	25.00	350.00	Mumbai Trims	\N	LOW_STOCK	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682
\.


--
-- Data for Name: measurement_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.measurement_points (id, profile_id, point_name, value, unit, marker_index, sort_order) FROM stdin;
a8598921-0aea-4f0c-bf39-429e462dc80c	b0000001-0000-0000-0000-000000000001	Shoulder	14.00	"	\N	1
3b95c542-2ddd-4210-93d1-38ccea631754	b0000001-0000-0000-0000-000000000001	Bust	34.00	"	\N	2
c2f8a5ba-6c82-468a-b30e-02de3314cd32	b0000001-0000-0000-0000-000000000001	Under Bust	30.00	"	\N	3
c7bab451-45d9-4430-b722-6b71e156b3c3	b0000001-0000-0000-0000-000000000001	Waist	28.00	"	\N	4
63862741-398b-4d6d-b37e-afbee5310406	b0000001-0000-0000-0000-000000000001	Length	14.00	"	\N	5
09ad528a-2cb5-496e-9129-5af0e5a34535	b0000001-0000-0000-0000-000000000001	Sleeve Length	10.50	"	\N	6
667f4784-8290-4ab1-b839-33dd84fc629c	b0000001-0000-0000-0000-000000000001	Front Neck Depth	6.50	"	\N	7
5b6ef4d7-a7da-497e-a9c0-e086ea1470eb	b0000001-0000-0000-0000-000000000001	Back Neck Depth	8.00	"	\N	8
0ab41fa0-bc95-48ee-8ae9-c424e64d0385	b0000001-0000-0000-0000-000000000001	Armhole	16.00	"	\N	9
c0ca2e89-e9ba-46db-b345-d6e4008af3fb	b0000001-0000-0000-0000-000000000001	Sleeve Round	11.00	"	\N	10
1474b5dc-994b-4f08-a5ae-0cf0ec9ae4a5	b0000001-0000-0000-0000-000000000002	Bust	36.00	"	\N	1
8e71f49f-73b4-4bce-8c34-4da18283aa86	b0000001-0000-0000-0000-000000000002	Waist	30.00	"	\N	2
7e49be30-85db-4c7a-8df5-858f18017eb4	b0000001-0000-0000-0000-000000000002	Shoulder	14.50	"	\N	3
9be4ecf3-0260-41c6-a65f-e28681c06da7	b0000001-0000-0000-0000-000000000002	Length	42.00	"	\N	4
1646fe51-36cd-4673-8066-21c1555b2bf7	b0000001-0000-0000-0000-000000000003	Bust	32.00	"	\N	1
5544cc02-c9c1-4d45-a802-9b213fb32c7a	b0000001-0000-0000-0000-000000000003	Waist	26.00	"	\N	2
1a45370a-8874-4fc5-9615-ef2970b6e93e	b0000001-0000-0000-0000-000000000003	Shoulder	13.50	"	\N	3
45fe0796-c2aa-4151-a1a7-23eb549aae40	b0000001-0000-0000-0000-000000000003	Length	46.00	"	\N	4
1eb4405b-1408-4ce3-9153-79a37954df17	b0000001-0000-0000-0000-000000000004	Bust	35.00	"	\N	1
40a221e2-92f0-4e4d-9d24-b67350b31572	b0000001-0000-0000-0000-000000000004	Waist	29.00	"	\N	2
1f2a0b8c-9927-45d6-998d-584d99899baa	b0000001-0000-0000-0000-000000000004	Shoulder	14.00	"	\N	3
859e35da-2126-4baf-9e98-5d929b161f0a	b0000001-0000-0000-0000-000000000004	Length	44.00	"	\N	4
f404ab9d-64ea-4550-9145-94f8e72a569c	b0000001-0000-0000-0000-000000000005	Bust	34.00	"	\N	1
5867118c-a15f-482c-99f2-f4809f3c7b80	b0000001-0000-0000-0000-000000000005	Waist	28.00	"	\N	2
cd21ac47-ef1c-4f0d-82f6-51b4a18054f4	b0000001-0000-0000-0000-000000000005	Shoulder	14.00	"	\N	3
b4d84d05-d6ad-4083-a943-c27196fd37fd	b0000001-0000-0000-0000-000000000005	Length	56.00	"	\N	4
e51054a3-d863-417b-9e4c-ff0ba7d2f12a	b0000001-0000-0000-0000-000000000006	Bust	33.00	"	\N	1
6be2c17f-4f31-4f7b-83c7-f8715fd89c74	b0000001-0000-0000-0000-000000000006	Waist	27.00	"	\N	2
8d1a9e97-8860-405f-b168-a0911ff71ce7	b0000001-0000-0000-0000-000000000006	Shoulder	13.50	"	\N	3
3f702ab6-e4e5-4f0c-911c-ae7d3f152538	b0000001-0000-0000-0000-000000000006	Length	14.00	"	\N	4
2667b1c5-e058-4c85-94f0-2616189c26ec	b0000001-0000-0000-0000-000000000007	Bust	31.00	"	\N	1
3cd0941f-6ac8-482c-9024-7c9e14e55b0c	b0000001-0000-0000-0000-000000000007	Waist	25.00	"	\N	2
26bc0ca3-369d-4211-bbf8-477706fe365a	b0000001-0000-0000-0000-000000000007	Shoulder	13.00	"	\N	3
a2350204-cd3c-4e60-b66f-e2c900217bb8	b0000001-0000-0000-0000-000000000007	Length	44.00	"	\N	4
6c28729a-ae3b-4523-8559-053bbaf1eb39	b0000001-0000-0000-0000-000000000008	Bust	34.00	"	\N	1
51f50316-2ba6-40c0-9e6d-0e21167202cb	b0000001-0000-0000-0000-000000000008	Waist	28.00	"	\N	2
bb76781a-18ee-4ece-903d-8d5328a61a26	b0000001-0000-0000-0000-000000000008	Shoulder	14.00	"	\N	3
b986b8c1-7448-455b-834a-3e64ab85bbce	b0000001-0000-0000-0000-000000000008	Length	42.00	"	\N	4
d8b2e753-1744-4764-a999-95d16602a211	b0000001-0000-0000-0000-000000000009	Bust	36.00	"	\N	1
ce34a309-abbd-4da9-80d5-b77db0df0e41	b0000001-0000-0000-0000-000000000009	Waist	30.00	"	\N	2
044306fe-433d-4057-a2e5-a8ed6d34a0ab	b0000001-0000-0000-0000-000000000009	Shoulder	14.50	"	\N	3
2974d252-40cb-4a2e-a193-c690b7448c91	b0000001-0000-0000-0000-000000000009	Length	44.00	"	\N	4
fd32bc15-6373-49d1-87b5-3bc8cfb18fe9	b0000001-0000-0000-0000-000000000010	Bust	34.00	"	\N	1
8cdc8def-1afc-4b35-8f60-9e2360aad953	b0000001-0000-0000-0000-000000000010	Waist	28.00	"	\N	2
c7603e9c-115e-4c3f-a298-656c9a934d96	b0000001-0000-0000-0000-000000000010	Shoulder	14.00	"	\N	3
ab8e1c9c-ec11-47cb-b657-4e2432950c5f	b0000001-0000-0000-0000-000000000010	Length	40.00	"	\N	4
\.


--
-- Data for Name: measurement_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.measurement_profiles (id, garment_type, recorded_by, notes, recorded_at, updated_at, customer_mobile) FROM stdin;
b0000001-0000-0000-0000-000000000001	Blouse	Sneha Patel	Needs 0.25 inch extra ease under armhole; stitch with soft gold piping.	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 99628 44110
b0000001-0000-0000-0000-000000000002	Lehenga	Sneha Patel	Heavy can-can flared waist fitting. Double waistband lining.	2026-09-05 10:30:00	2026-09-15 10:07:51.137009	+91 98840 99881
b0000001-0000-0000-0000-000000000003	Chudi Set	Master Rajesh	Princess cut chudi with side slits and soft crepe inner lining.	2026-09-06 14:15:00	2026-09-15 10:07:51.137009	+91 98451 66789
b0000001-0000-0000-0000-000000000004	Saree	Sneha Patel	Pre-pleated pallu measurement with elasticated waistband comfort.	2026-08-30 11:00:00	2026-09-15 10:07:51.137009	+91 98401 22334
b0000001-0000-0000-0000-000000000005	Gown	Master Rajesh	Empire waist floor-length evening gown with soft trail.	2026-08-28 16:45:00	2026-09-15 10:07:51.137009	+91 93422 11009
b0000001-0000-0000-0000-000000000006	Blouse	Sneha Patel	Boat neck front with deep drop back; extra ease on armhole.	2026-08-25 12:20:00	2026-09-15 10:07:51.137009	+91 90987 66554
b0000001-0000-0000-0000-000000000007	Chudi Set	Master Rajesh	Straight cut kurta with pant length allowance.	2026-08-24 09:30:00	2026-09-15 10:07:51.137009	+91 98400 22119
b0000001-0000-0000-0000-000000000008	Lehenga	Sneha Patel	High-waist bridal lehenga with dual tassels.	2026-08-22 15:10:00	2026-09-15 10:07:51.137009	+91 96321 44567
b0000001-0000-0000-0000-000000000009	Saree	Master Rajesh	Designer pallu pleats and saree drape specifications.	2026-08-20 17:00:00	2026-09-15 10:07:51.137009	+91 98412 76123
b0000001-0000-0000-0000-000000000010	Custom	Sneha Patel	Indo-western jacket dress with corset boning.	2026-08-18 13:40:00	2026-09-15 10:07:51.137009	+91 99801 33445
\.


--
-- Data for Name: order_progress_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_progress_stages (id, order_id, stage, completed_at, completed_by, notes) FROM stdin;
8ddd0aab-4288-4c5c-9cd8-bcbfec12425f	d0000001-0000-0000-0000-000000000001	ORDER	2026-09-08 15:46:41.7682	Pranesh B	Order logged with advance payment
1be363e3-d823-4dc3-b67b-b72511f81eac	d0000001-0000-0000-0000-000000000001	MEASUREMENT	2026-09-09 15:46:41.7682	Sneha Patel	Measurements verified from profile
2218a391-0dd8-4ffb-8b48-a0b075af9b22	d0000001-0000-0000-0000-000000000001	CUTTING	2026-09-10 15:46:41.7682	Suresh Kumar	Fabric cut accurately to pattern
e1690c60-8ce7-45fa-8a93-a92dbc12bc7e	d0000001-0000-0000-0000-000000000001	SEWING	2026-09-11 15:46:41.7682	Latha Menon	Stitching in progress
64b0ac73-b0df-428f-a6fd-287c0bf778a8	f7e1b1e9-9bee-44e9-b052-46dbe548c119	ORDER	2026-09-12 10:27:01.671715	\N	\N
c268d15e-25db-48f6-81d4-526fc737eee2	1ba9d503-628e-421e-99a3-f84584378ee8	ORDER	2026-09-15 05:21:01.904465	\N	\N
bab7cf37-78fe-406c-84ee-fb183e551672	d50fd9fb-fad5-4918-9273-b5551f4279fd	ORDER	2026-09-15 06:16:13.432465	\N	\N
5ea199f3-e150-4292-bf01-173e9511b823	1715090f-7b7c-4626-98b6-17d966ab4fa0	ORDER	2026-09-15 07:23:39.202709	\N	\N
1bc5bf23-cd16-4dac-a26c-0ef41b5117b6	42047ef3-1938-4bfe-9a9a-c7ed8a5a7c67	ORDER	2026-09-15 07:30:31.949402	\N	\N
e4a7eaaa-11dc-44da-ad53-497b45bc36b3	9acd62c1-3596-4507-8a35-9f70974df089	ORDER	2026-09-15 07:50:36.941081	\N	\N
9ff18490-2bcf-48dd-a4c1-3e7e78344c9a	9acd62c1-3596-4507-8a35-9f70974df089	DELIVERY	2026-09-15 07:50:37.002805	Dispatch Master Rakesh	Hand delivered in luxury garment trunk with accessories
134bc07d-46bb-49d3-893c-b529949d82b2	50bc4645-a3a3-48b6-8553-9f208548cc29	ORDER	2026-09-15 07:51:06.402203	\N	\N
206b2876-d69b-42e0-a6ca-9f6137c6c716	b42dcaa8-d1ff-4307-82dd-1f4f39050994	ORDER	2026-09-15 08:13:07.885263	\N	\N
be1a55fc-e181-49af-be41-41f84ecac2df	b42dcaa8-d1ff-4307-82dd-1f4f39050994	DELIVERY	2026-09-15 08:13:07.963518	Dispatch Master Rakesh	Hand delivered in luxury garment trunk with accessories
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_code, garment_type, garment_desc, collection, amount, status, order_date, due_date, notes, created_at, updated_at, customer_mobile, customer_name, expected_delivery_date, delivered_date, advance_paid, total_amount, balance_amount) FROM stdin;
9acd62c1-3596-4507-8a35-9f70974df089	ORD-2026-0011	Bridal Lehenga	Handcrafted Zari & Resham Embroidered Velvet Lehenga	Royal Rajputana	25000.00	DELIVERED	2026-09-15	2026-10-05	Urgent order for royal wedding ceremony	2026-09-15 07:50:36.941081	2026-09-15 07:50:37.002804	+919876540001	Ananya Sen Sharma	2026-10-05	2026-09-15	10000.00	25000.00	15000.00
50bc4645-a3a3-48b6-8553-9f208548cc29	ORD-2026-0012	Lehenga	Bridal Silk Lehenga with Zardozi	Royal Heritage	45000.00	PENDING	2026-09-15	\N	Trial needed 3 days prior	2026-09-15 07:51:06.402203	2026-09-15 07:51:06.403282	+919876540001	Tara Varma	\N	\N	0.00	45000.00	45000.00
b42dcaa8-d1ff-4307-82dd-1f4f39050994	ORD-2026-0013	Bridal Lehenga	Handcrafted Zari & Resham Embroidered Velvet Lehenga	Royal Rajputana	25000.00	DELIVERED	2026-09-15	2026-10-05	Urgent order for royal wedding ceremony	2026-09-15 08:13:07.885263	2026-09-15 08:13:07.974655	+919876540001	Ananya Sen Sharma	2026-10-05	2026-09-15	10000.00	25000.00	15000.00
d0000001-0000-0000-0000-000000000004	ORD-2026-0525	Blouse	1 Princess Cut Raw Silk Blouse with potli buttons	Festive Collection	2500.00	READY	2026-09-07	2026-09-13	Ready for customer pickup.	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 98840 99881	Priya Sharma	2026-09-13	2026-09-12	54500.00	2500.00	0.00
d0000001-0000-0000-0000-000000000005	ORD-2026-0524	Kurti	1 Kurti, 1 Pants in pure handwoven linen	Summer Chic	6800.00	DELIVERED	2026-09-06	2026-09-11	Delivered and confirmed via WhatsApp.	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 98401 22334	Sneha Reddy	2026-09-11	2026-09-12	45900.00	6800.00	0.00
d0000001-0000-0000-0000-000000000001	ORD-2026-0528	Blouse	1 Blouse, 1 Saree with bespoke zardozi embroidery	Bridal Collection	12500.00	IN_PROGRESS	2026-09-08	2026-09-22	Matching silk lining, gold piping.	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 99628 44110	Kavya Nair	2026-09-22	\N	300000.00	12500.00	0.00
d0000001-0000-0000-0000-000000000002	ORD-2026-0527	Chudi	2 Designer Chudi sets in royal blue and ivory	Custom Design	4800.00	IN_PROGRESS	2026-09-08	2026-09-18	Side zipper, soft inner lining.	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 97890 54321	Radhika Menon	2026-09-18	\N	164900.00	4800.00	0.00
d0000001-0000-0000-0000-000000000003	ORD-2026-0526	Lehenga	1 Silk Bridal Lehenga with heavy can-can	Bridal Collection	18500.00	IN_PROGRESS	2026-09-07	2026-10-05	Trial required on 18 Sep.	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 98402 11982	Ananya Iyer	2026-10-05	\N	112500.00	18500.00	0.00
f7e1b1e9-9bee-44e9-b052-46dbe548c119	ORD-2026-0006	Saree	Bespoke bridal Banarasi silk saree with contrast hand-embroidered blouse	Heritage Silk Collection	24500.00	PENDING	2026-09-12	2026-10-15	Urgent delivery required before engagement function	2026-09-12 10:27:01.671715	2026-09-12 10:27:01.728254	+91 98765 43210	Meera Krishnan	2026-10-15	\N	0.00	24500.00	24500.00
1ba9d503-628e-421e-99a3-f84584378ee8	ORD-2026-0007	Lehenga	Bridal Silk Lehenga with Zardozi	Royal Heritage	45000.00	PENDING	2026-09-15	\N	Trial needed 3 days prior	2026-09-15 05:21:01.904465	2026-09-15 05:21:01.909802	+919876540001	Tara Varma	2026-09-29	\N	0.00	45000.00	45000.00
d50fd9fb-fad5-4918-9273-b5551f4279fd	ORD-2026-0008	Lehenga	Bridal Silk Lehenga with Zardozi	Royal Heritage	45000.00	PENDING	2026-09-15	\N	Trial needed 3 days prior	2026-09-15 06:16:13.42578	2026-09-15 06:16:13.436099	+919876540001	Tara Varma	2026-09-29	\N	0.00	45000.00	45000.00
1715090f-7b7c-4626-98b6-17d966ab4fa0	ORD-2026-0009	Lehenga	Bridal Silk Lehenga with Zardozi	Royal Heritage	45000.00	PENDING	2026-09-15	\N	Trial needed 3 days prior	2026-09-15 07:23:39.202709	2026-09-15 07:23:39.208144	+919876540001	Tara Varma	2026-09-29	\N	0.00	45000.00	45000.00
42047ef3-1938-4bfe-9a9a-c7ed8a5a7c67	ORD-2026-0010	Lehenga	Bridal Silk Lehenga with Zardozi	Royal Heritage	45000.00	PENDING	2026-09-15	\N	Trial needed 3 days prior	2026-09-15 07:30:31.949402	2026-09-15 07:30:31.961737	+919876540001	Tara Varma	2026-09-29	\N	0.00	45000.00	45000.00
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_transactions (id, payment_id, amount, method, received_by, reference_no, transaction_date, notes) FROM stdin;
1dfaa804-a231-471e-af6a-c90965ed0a33	f0000001-0000-0000-0000-000000000001	12500.00	UPI	Suresh Kumar	UPI-9928172635	2026-09-12 15:46:41.7682	\N
7c601928-5536-40ba-bcb3-93ae338355e2	f0000001-0000-0000-0000-000000000002	2400.00	CARD	Priya Menon	TXN-CARD-8812	2026-09-12 15:46:41.7682	\N
23ce035c-f84b-4894-8ca4-92e4751df880	f0000001-0000-0000-0000-000000000003	10000.00	BANK_TRANSFER	Pranesh B	NEFT-00192837	2026-09-12 15:46:41.7682	\N
67c7e6d5-e416-458d-ac92-e7ab174874e0	f0000001-0000-0000-0000-000000000004	2500.00	CASH	Staff	RCP-0042	2026-09-12 15:46:41.7682	\N
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, total_amount, paid_amount, status, due_date, notes, created_at, updated_at, customer_mobile) FROM stdin;
f1000009-0001-0000-0000-000000000001	d0000001-0000-0000-0000-000000000001	12500.00	12500.00	FULLY_PAID	2026-09-10	Sep - Blouse zardozi payment	2026-09-07 17:49:11.68248	2026-09-12 17:49:11.68248	+91 99628 44110
f1000008-0001-0000-0000-000000000001	d0000001-0000-0000-0000-000000000001	48500.00	48500.00	FULLY_PAID	2026-08-05	Aug - Platinum full clearance	2026-08-12 17:49:11.68248	2026-09-12 17:49:11.68248	+91 99628 44110
f1000007-0001-0000-0000-000000000001	d0000001-0000-0000-0000-000000000001	62000.00	62000.00	FULLY_PAID	2026-07-08	Jul - Premium bridal full	2026-07-12 17:49:11.68248	2026-09-12 17:49:11.68248	+91 99628 44110
f1000006-0001-0000-0000-000000000001	d0000001-0000-0000-0000-000000000001	35000.00	35000.00	FULLY_PAID	2026-06-05	Jun - Bridal collection full	2026-06-12 17:49:11.68248	2026-09-12 17:49:11.68248	+91 99628 44110
f1000005-0001-0000-0000-000000000001	d0000001-0000-0000-0000-000000000001	48500.00	48500.00	FULLY_PAID	2026-05-02	May - VIP platinum order full	2026-05-13 17:49:11.68248	2026-09-12 17:49:11.68248	+91 99628 44110
f1000004-0001-0000-0000-000000000002	d0000001-0000-0000-0000-000000000001	12500.00	12500.00	FULLY_PAID	2026-04-10	Apr - Blouse zardozi final	2026-04-16 17:49:11.68248	2026-09-12 17:49:11.68248	+91 99628 44110
f1000003-0001-0000-0000-000000000001	d0000001-0000-0000-0000-000000000001	28000.00	28000.00	FULLY_PAID	2026-03-08	Mar - Zardozi saree full payment	2026-03-13 17:49:11.68248	2026-09-12 17:49:11.68248	+91 99628 44110
f1000002-0001-0000-0000-000000000002	d0000001-0000-0000-0000-000000000001	22000.00	22000.00	FULLY_PAID	2026-02-14	Feb - Bridal set full settlement	2026-02-14 17:49:11.68248	2026-09-12 17:49:11.68248	+91 99628 44110
f1000001-0001-0000-0000-000000000003	d0000001-0000-0000-0000-000000000001	18500.00	18500.00	FULLY_PAID	2026-01-25	Jan - Bridal lehenga advance	2026-01-18 17:49:11.68248	2026-09-12 17:49:11.68248	+91 99628 44110
f0000001-0000-0000-0000-000000000001	d0000001-0000-0000-0000-000000000001	12500.00	12500.00	FULLY_PAID	2026-09-22	Fully paid via UPI	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 99628 44110
f1000009-0001-0000-0000-000000000003	d0000001-0000-0000-0000-000000000003	18500.00	10000.00	PARTIAL	2026-09-20	Sep - Lehenga advance	2026-09-11 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98402 11982
f1000008-0001-0000-0000-000000000002	d0000001-0000-0000-0000-000000000003	18500.00	18500.00	FULLY_PAID	2026-08-10	Aug - Bridal lehenga delivered	2026-08-15 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98402 11982
f1000007-0001-0000-0000-000000000005	d0000001-0000-0000-0000-000000000003	12500.00	12500.00	FULLY_PAID	2026-07-30	Jul - Silk lehenga partial	2026-07-24 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98402 11982
f1000006-0001-0000-0000-000000000002	d0000001-0000-0000-0000-000000000003	18500.00	18500.00	FULLY_PAID	2026-06-12	Jun - Lehenga final balance	2026-06-15 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98402 11982
f1000005-0001-0000-0000-000000000004	d0000001-0000-0000-0000-000000000003	12000.00	12000.00	FULLY_PAID	2026-05-20	May - Lehenga installment	2026-05-22 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98402 11982
f1000004-0001-0000-0000-000000000003	d0000001-0000-0000-0000-000000000003	18500.00	8500.00	PARTIAL	2026-04-15	Apr - Lehenga 2nd instalment	2026-04-19 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98402 11982
f1000003-0001-0000-0000-000000000002	d0000001-0000-0000-0000-000000000003	18500.00	10000.00	PARTIAL	2026-03-12	Mar - Bridal lehenga advance	2026-03-16 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98402 11982
f1000002-0001-0000-0000-000000000001	d0000001-0000-0000-0000-000000000003	12500.00	12500.00	FULLY_PAID	2026-02-10	Feb - Silk lehenga full payment	2026-02-11 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98402 11982
f0000001-0000-0000-0000-000000000003	d0000001-0000-0000-0000-000000000003	18500.00	10000.00	PARTIAL	2026-10-05	Advance paid via Card	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 98402 11982
f1000009-0001-0000-0000-000000000002	d0000001-0000-0000-0000-000000000002	4800.00	2400.00	PARTIAL	2026-09-15	Sep - Chudi advance	2026-09-09 17:49:11.68248	2026-09-12 17:49:11.68248	+91 97890 54321
f1000008-0001-0000-0000-000000000005	d0000001-0000-0000-0000-000000000002	62000.00	50000.00	PARTIAL	2026-08-28	Aug - Luxury set advance	2026-08-24 17:49:11.68248	2026-09-12 17:49:11.68248	+91 97890 54321
f1000007-0001-0000-0000-000000000004	d0000001-0000-0000-0000-000000000002	24000.00	24000.00	FULLY_PAID	2026-07-25	Jul - Designer set full	2026-07-21 17:49:11.68248	2026-09-12 17:49:11.68248	+91 97890 54321
f1000006-0001-0000-0000-000000000004	d0000001-0000-0000-0000-000000000002	4800.00	4800.00	FULLY_PAID	2026-06-25	Jun - Chudi final	2026-06-21 17:49:11.68248	2026-09-12 17:49:11.68248	+91 97890 54321
f1000005-0001-0000-0000-000000000003	d0000001-0000-0000-0000-000000000002	24000.00	12000.00	PARTIAL	2026-05-15	May - Designer chudi advance	2026-05-19 17:49:11.68248	2026-09-12 17:49:11.68248	+91 97890 54321
f1000004-0001-0000-0000-000000000001	d0000001-0000-0000-0000-000000000002	62000.00	62000.00	FULLY_PAID	2026-04-05	Apr - Platinum bridal set full	2026-04-13 17:49:11.68248	2026-09-12 17:49:11.68248	+91 97890 54321
f1000002-0001-0000-0000-000000000005	d0000001-0000-0000-0000-000000000002	4800.00	4800.00	FULLY_PAID	2026-02-28	Feb - Chudi balance cleared	2026-02-23 17:49:11.68248	2026-09-12 17:49:11.68248	+91 97890 54321
f1000001-0001-0000-0000-000000000004	d0000001-0000-0000-0000-000000000002	4800.00	2500.00	PARTIAL	2026-01-28	Jan - Chudi partial	2026-01-21 17:49:11.68248	2026-09-12 17:49:11.68248	+91 97890 54321
f0000001-0000-0000-0000-000000000002	d0000001-0000-0000-0000-000000000002	4800.00	2400.00	PARTIAL	2026-09-18	50% advance received	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 97890 54321
f1000008-0001-0000-0000-000000000003	d0000001-0000-0000-0000-000000000004	8000.00	8000.00	FULLY_PAID	2026-08-15	Aug - Gown full	2026-08-18 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98840 99881
f1000007-0001-0000-0000-000000000003	d0000001-0000-0000-0000-000000000004	18000.00	10000.00	PARTIAL	2026-07-18	Jul - Festive advance	2026-07-18 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98840 99881
f1000006-0001-0000-0000-000000000003	d0000001-0000-0000-0000-000000000004	2500.00	2500.00	FULLY_PAID	2026-06-18	Jun - Blouse cash	2026-06-18 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98840 99881
f1000005-0001-0000-0000-000000000002	d0000001-0000-0000-0000-000000000004	18000.00	18000.00	FULLY_PAID	2026-05-10	May - Festive gown full	2026-05-16 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98840 99881
f1000003-0001-0000-0000-000000000003	d0000001-0000-0000-0000-000000000004	2500.00	2500.00	FULLY_PAID	2026-03-18	Mar - Blouse cash	2026-03-19 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98840 99881
f1000002-0001-0000-0000-000000000003	d0000001-0000-0000-0000-000000000004	8500.00	8500.00	FULLY_PAID	2026-02-20	Feb - Gown advance payment	2026-02-17 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98840 99881
f1000001-0001-0000-0000-000000000002	d0000001-0000-0000-0000-000000000004	2500.00	2500.00	FULLY_PAID	2026-01-20	Jan - Princess blouse cash payment	2026-01-15 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98840 99881
f0000001-0000-0000-0000-000000000004	d0000001-0000-0000-0000-000000000004	2500.00	2500.00	FULLY_PAID	2026-09-13	Paid in Cash at pickup desk	2026-09-12 15:46:41.7682	2026-09-12 15:46:41.7682	+91 98840 99881
f1000008-0001-0000-0000-000000000004	d0000001-0000-0000-0000-000000000005	6800.00	3500.00	PARTIAL	2026-08-22	Aug - Kurti advance	2026-08-21 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98401 22334
f1000007-0001-0000-0000-000000000002	d0000001-0000-0000-0000-000000000005	9500.00	9500.00	FULLY_PAID	2026-07-12	Jul - Casual full payment	2026-07-15 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98401 22334
f1000005-0001-0000-0000-000000000005	d0000001-0000-0000-0000-000000000005	6800.00	6800.00	FULLY_PAID	2026-05-28	May - Summer set final	2026-05-25 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98401 22334
f1000004-0001-0000-0000-000000000004	d0000001-0000-0000-0000-000000000005	9500.00	9500.00	FULLY_PAID	2026-04-20	Apr - Summer Chic full	2026-04-22 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98401 22334
f1000003-0001-0000-0000-000000000004	d0000001-0000-0000-0000-000000000005	6800.00	6800.00	FULLY_PAID	2026-03-22	Mar - Kurti full payment	2026-03-22 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98401 22334
f1000002-0001-0000-0000-000000000004	d0000001-0000-0000-0000-000000000005	5500.00	3000.00	PARTIAL	2026-02-25	Feb - Kurti partial	2026-02-20 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98401 22334
f1000001-0001-0000-0000-000000000001	d0000001-0000-0000-0000-000000000005	6800.00	6800.00	FULLY_PAID	2026-01-15	Jan - Kurti set delivery	2026-01-12 17:49:11.68248	2026-09-12 17:49:11.68248	+91 98401 22334
13975d79-3e99-4fa7-8d26-6bbe9100382a	1ba9d503-628e-421e-99a3-f84584378ee8	45000.00	0.00	PENDING	\N	Initial booking payment	2026-09-15 05:21:02.052424	2026-09-15 05:21:02.059961	+919876540001
4fb39307-975b-4097-81b0-69943467d0e1	d50fd9fb-fad5-4918-9273-b5551f4279fd	45000.00	0.00	PENDING	\N	Initial booking payment	2026-09-15 06:16:13.628138	2026-09-15 06:16:13.638361	+919876540001
fb54960e-eed9-4e54-b57d-27716cb87da8	1715090f-7b7c-4626-98b6-17d966ab4fa0	45000.00	0.00	PENDING	\N	Initial booking payment	2026-09-15 07:23:39.268791	2026-09-15 07:23:39.269796	+919876540001
d740cc4c-ef5b-48ea-a507-6b1b097270d3	42047ef3-1938-4bfe-9a9a-c7ed8a5a7c67	45000.00	0.00	PENDING	\N	Initial booking payment	2026-09-15 07:30:32.041644	2026-09-15 07:30:32.046151	+919876540001
ff1e356f-20fb-44b5-95de-0ac5f76fda13	50bc4645-a3a3-48b6-8553-9f208548cc29	45000.00	0.00	PENDING	\N	Initial booking payment	2026-09-15 07:51:06.45656	2026-09-15 07:51:06.460397	+919876540001
\.


--
-- Data for Name: production_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.production_stages (id, order_id, stage_name, assigned_to, status, started_at, completed_at, notes, sort_order) FROM stdin;
aa000001-0000-0000-0001-000000000001	d0000001-0000-0000-0000-000000000001	DESIGNING	\N	COMPLETED	2026-09-08 17:49:11.68248	2026-09-09 05:49:11.68248	Sketch and pattern confirmed by customer	1
aa000001-0000-0000-0001-000000000002	d0000001-0000-0000-0000-000000000001	CUTTING	\N	COMPLETED	2026-09-09 17:49:11.68248	2026-09-10 09:49:11.68248	Raw silk cut to pattern	2
aa000001-0000-0000-0001-000000000003	d0000001-0000-0000-0000-000000000001	STITCHING	\N	IN_PROGRESS	2026-09-10 17:49:11.68248	\N	Main body stitching underway	3
aa000001-0000-0000-0001-000000000004	d0000001-0000-0000-0000-000000000001	HAND_WORK	\N	NOT_STARTED	\N	\N	Zardozi embroidery pending	4
aa000001-0000-0000-0001-000000000005	d0000001-0000-0000-0000-000000000001	LINING	\N	NOT_STARTED	\N	\N	Gold piping and lining	5
aa000001-0000-0000-0001-000000000006	d0000001-0000-0000-0000-000000000001	HEMMING	\N	NOT_STARTED	\N	\N	Final hemming	6
aa000001-0000-0000-0001-000000000007	d0000001-0000-0000-0000-000000000001	TRIAL	\N	NOT_STARTED	\N	\N	Customer trial fitting	7
aa000001-0000-0000-0001-000000000008	d0000001-0000-0000-0000-000000000001	QC	\N	NOT_STARTED	\N	\N	Quality checklist	8
aa000001-0000-0000-0001-000000000009	d0000001-0000-0000-0000-000000000001	READY	\N	NOT_STARTED	\N	\N	Ready for dispatch	9
aa000002-0000-0000-0001-000000000001	d0000001-0000-0000-0000-000000000002	DESIGNING	\N	COMPLETED	2026-09-08 17:49:11.68248	2026-09-09 09:49:11.68248	Royal blue and ivory pattern designed	1
aa000002-0000-0000-0001-000000000002	d0000001-0000-0000-0000-000000000002	CUTTING	\N	COMPLETED	2026-09-09 17:49:11.68248	2026-09-10 11:49:11.68248	Both sets cut	2
aa000002-0000-0000-0001-000000000003	d0000001-0000-0000-0000-000000000002	STITCHING	\N	COMPLETED	2026-09-10 17:49:11.68248	2026-09-11 17:49:11.68248	Base stitching done	3
aa000002-0000-0000-0001-000000000004	d0000001-0000-0000-0000-000000000002	HAND_WORK	\N	IN_PROGRESS	2026-09-11 17:49:11.68248	\N	Embroidery and piping in progress	4
aa000002-0000-0000-0001-000000000005	d0000001-0000-0000-0000-000000000002	LINING	\N	NOT_STARTED	\N	\N	Soft inner lining	5
aa000002-0000-0000-0001-000000000006	d0000001-0000-0000-0000-000000000002	HEMMING	\N	NOT_STARTED	\N	\N	Final hemming	6
aa000002-0000-0000-0001-000000000007	d0000001-0000-0000-0000-000000000002	TRIAL	\N	NOT_STARTED	\N	\N	Fitting trial	7
aa000002-0000-0000-0001-000000000008	d0000001-0000-0000-0000-000000000002	QC	\N	NOT_STARTED	\N	\N	Quality checklist	8
aa000002-0000-0000-0001-000000000009	d0000001-0000-0000-0000-000000000002	READY	\N	NOT_STARTED	\N	\N	Ready for pickup	9
aa000003-0000-0000-0001-000000000001	d0000001-0000-0000-0000-000000000003	DESIGNING	\N	COMPLETED	2026-09-07 17:49:11.68248	2026-09-08 17:49:11.68248	Bridal lehenga sketch approved	1
aa000003-0000-0000-0001-000000000002	d0000001-0000-0000-0000-000000000003	CUTTING	\N	IN_PROGRESS	2026-09-08 17:49:11.68248	\N	Heavy can-can and silk being cut	2
aa000003-0000-0000-0001-000000000003	d0000001-0000-0000-0000-000000000003	STITCHING	\N	NOT_STARTED	\N	\N	Main assembly	3
aa000003-0000-0000-0001-000000000004	d0000001-0000-0000-0000-000000000003	HAND_WORK	\N	NOT_STARTED	\N	\N	Heavy embroidery	4
aa000003-0000-0000-0001-000000000005	d0000001-0000-0000-0000-000000000003	LINING	\N	NOT_STARTED	\N	\N	Can-can and lining	5
aa000003-0000-0000-0001-000000000006	d0000001-0000-0000-0000-000000000003	HEMMING	\N	NOT_STARTED	\N	\N	Hem and finishing	6
aa000003-0000-0000-0001-000000000007	d0000001-0000-0000-0000-000000000003	TRIAL	\N	NOT_STARTED	\N	\N	Customer trial 18 Sep	7
aa000003-0000-0000-0001-000000000008	d0000001-0000-0000-0000-000000000003	QC	\N	NOT_STARTED	\N	\N	QC audit	8
aa000003-0000-0000-0001-000000000009	d0000001-0000-0000-0000-000000000003	READY	\N	NOT_STARTED	\N	\N	Ready for delivery	9
aa000004-0000-0000-0001-000000000001	d0000001-0000-0000-0000-000000000004	DESIGNING	\N	COMPLETED	2026-09-07 17:49:11.68248	2026-09-07 11:49:11.68248	Pattern finalized	1
aa000004-0000-0000-0001-000000000002	d0000001-0000-0000-0000-000000000004	CUTTING	\N	COMPLETED	2026-09-07 17:49:11.68248	2026-09-07 23:49:11.68248	Raw silk cut	2
aa000004-0000-0000-0001-000000000003	d0000001-0000-0000-0000-000000000004	STITCHING	\N	COMPLETED	2026-09-08 17:49:11.68248	2026-09-09 05:49:11.68248	Princess cut stitched	3
aa000004-0000-0000-0001-000000000004	d0000001-0000-0000-0000-000000000004	HAND_WORK	\N	COMPLETED	2026-09-09 17:49:11.68248	2026-09-10 09:49:11.68248	Potli buttons hand-attached	4
aa000004-0000-0000-0001-000000000005	d0000001-0000-0000-0000-000000000004	LINING	\N	COMPLETED	2026-09-10 17:49:11.68248	2026-09-10 23:49:11.68248	Inner lining complete	5
aa000004-0000-0000-0001-000000000006	d0000001-0000-0000-0000-000000000004	HEMMING	\N	COMPLETED	2026-09-11 17:49:11.68248	2026-09-11 07:49:11.68248	Hemmed	6
aa000004-0000-0000-0001-000000000007	d0000001-0000-0000-0000-000000000004	TRIAL	\N	COMPLETED	2026-09-11 17:49:11.68248	2026-09-12 05:49:11.68248	Trial done, no alterations	7
aa000004-0000-0000-0001-000000000008	d0000001-0000-0000-0000-000000000004	QC	\N	COMPLETED	2026-09-12 05:49:11.68248	2026-09-12 11:49:11.68248	All 12 QC points passed	8
aa000004-0000-0000-0001-000000000009	d0000001-0000-0000-0000-000000000004	READY	\N	COMPLETED	2026-09-12 11:49:11.68248	2026-09-12 12:49:11.68248	Packed and tagged, ready for pickup	9
aa000005-0000-0000-0001-000000000001	d0000001-0000-0000-0000-000000000005	DESIGNING	\N	COMPLETED	2026-09-06 17:49:11.68248	2026-09-06 23:49:11.68248	Handwoven linen pattern	1
aa000005-0000-0000-0001-000000000002	d0000001-0000-0000-0000-000000000005	CUTTING	\N	COMPLETED	2026-09-07 17:49:11.68248	2026-09-07 17:49:11.68248	Linen cut	2
aa000005-0000-0000-0001-000000000003	d0000001-0000-0000-0000-000000000005	STITCHING	\N	COMPLETED	2026-09-07 17:49:11.68248	2026-09-08 09:49:11.68248	Indo-western stitching	3
aa000005-0000-0000-0001-000000000004	d0000001-0000-0000-0000-000000000005	HAND_WORK	\N	COMPLETED	2026-09-08 17:49:11.68248	2026-09-09 09:49:11.68248	Embroidery complete	4
aa000005-0000-0000-0001-000000000005	d0000001-0000-0000-0000-000000000005	LINING	\N	COMPLETED	2026-09-09 17:49:11.68248	2026-09-10 05:49:11.68248	Lining attached	5
aa000005-0000-0000-0001-000000000006	d0000001-0000-0000-0000-000000000005	HEMMING	\N	COMPLETED	2026-09-10 17:49:11.68248	2026-09-10 21:49:11.68248	Bottom hem and cuffs	6
aa000005-0000-0000-0001-000000000007	d0000001-0000-0000-0000-000000000005	TRIAL	\N	COMPLETED	2026-09-10 17:49:11.68248	2026-09-11 01:49:11.68248	Trial done	7
aa000005-0000-0000-0001-000000000008	d0000001-0000-0000-0000-000000000005	QC	\N	COMPLETED	2026-09-11 17:49:11.68248	2026-09-11 11:49:11.68248	QC passed	8
aa000005-0000-0000-0001-000000000009	d0000001-0000-0000-0000-000000000005	READY	\N	COMPLETED	2026-09-11 17:49:11.68248	2026-09-12 05:49:11.68248	Delivered and confirmed	9
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
c1000001-0000-0000-0000-000000000001	PO-2026-0024	b1000001-0000-0000-0000-000000000001	SENT	145000.00	2026-09-10	2026-09-18	\N	Bridal raw silk replenishment.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
c1000001-0000-0000-0000-000000000002	PO-2026-0023	b1000001-0000-0000-0000-000000000002	PARTIALLY_RECEIVED	32400.00	2026-09-08	2026-09-15	\N	Handmade brass and pearl buttons.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
c1000001-0000-0000-0000-000000000003	PO-2026-0022	b1000001-0000-0000-0000-000000000003	RECEIVED	68000.00	2026-09-06	2026-09-11	\N	Varanasi metallic zari spools.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
c1000001-0000-0000-0000-000000000004	PO-2026-0021	b1000001-0000-0000-0000-000000000004	DRAFT	28500.00	2026-09-12	2026-09-22	\N	New season velvet borders.	2026-09-12 16:36:35.109694	2026-09-12 16:36:35.109694
\.


--
-- Data for Name: qc_checklists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qc_checklists (id, order_id, check_point, result, checked_by, checked_at, remarks, sort_order) FROM stdin;
ba000004-0000-0000-0001-000000000001	d0000001-0000-0000-0000-000000000004	Seam Strength	PASS	\N	2026-09-12 11:49:11.68248	All seams secure	1
ba000004-0000-0000-0001-000000000002	d0000001-0000-0000-0000-000000000004	Thread Trims	PASS	\N	2026-09-12 11:49:11.68248	No loose threads	2
ba000004-0000-0000-0001-000000000003	d0000001-0000-0000-0000-000000000004	Button Attachment	PASS	\N	2026-09-12 11:49:11.68248	Potli buttons firm	3
ba000004-0000-0000-0001-000000000004	d0000001-0000-0000-0000-000000000004	Measurement Accuracy	PASS	\N	2026-09-12 11:49:11.68248	Within tolerance	4
ba000004-0000-0000-0001-000000000005	d0000001-0000-0000-0000-000000000004	Lining Quality	PASS	\N	2026-09-12 11:49:11.68248	Smooth and even	5
ba000004-0000-0000-0001-000000000006	d0000001-0000-0000-0000-000000000004	Embroidery Finish	PASS	\N	2026-09-12 11:49:11.68248	Even embroidery density	6
ba000004-0000-0000-0001-000000000007	d0000001-0000-0000-0000-000000000004	Zipper / Closure	PASS	\N	2026-09-12 11:49:11.68248	Zipper runs smooth	7
ba000004-0000-0000-0001-000000000008	d0000001-0000-0000-0000-000000000004	Fabric Defects	PASS	\N	2026-09-12 11:49:11.68248	No snags or pulls	8
ba000004-0000-0000-0001-000000000009	d0000001-0000-0000-0000-000000000004	Color Consistency	PASS	\N	2026-09-12 11:49:11.68248	Uniform dye lot	9
ba000004-0000-0000-0001-000000000010	d0000001-0000-0000-0000-000000000004	Hemming Finish	PASS	\N	2026-09-12 11:49:11.68248	Clean hem all around	10
ba000004-0000-0000-0001-000000000011	d0000001-0000-0000-0000-000000000004	Label & Tag Placement	PASS	\N	2026-09-12 11:49:11.68248	Label stitched correctly	11
ba000004-0000-0000-0001-000000000012	d0000001-0000-0000-0000-000000000004	Customer Approval	PASS	\N	2026-09-12 12:49:11.68248	Customer signed off	12
ba000005-0000-0000-0001-000000000001	d0000001-0000-0000-0000-000000000005	Seam Strength	PASS	\N	2026-09-11 11:49:11.68248	Seams strong	1
ba000005-0000-0000-0001-000000000002	d0000001-0000-0000-0000-000000000005	Thread Trims	PASS	\N	2026-09-11 11:49:11.68248	Clean finish	2
ba000005-0000-0000-0001-000000000003	d0000001-0000-0000-0000-000000000005	Button Attachment	PASS	\N	2026-09-11 11:49:11.68248	All buttons secure	3
ba000005-0000-0000-0001-000000000004	d0000001-0000-0000-0000-000000000005	Measurement Accuracy	REWORK	\N	2026-09-11 11:49:11.68248	Sleeve 0.5" short — fixed	4
ba000005-0000-0000-0001-000000000005	d0000001-0000-0000-0000-000000000005	Lining Quality	PASS	\N	2026-09-11 11:49:11.68248	Smooth and tidy	5
ba000005-0000-0000-0001-000000000006	d0000001-0000-0000-0000-000000000005	Embroidery Finish	PASS	\N	2026-09-11 11:49:11.68248	Tight and even	6
ba000005-0000-0000-0001-000000000007	d0000001-0000-0000-0000-000000000005	Zipper / Closure	PASS	\N	2026-09-11 11:49:11.68248	Zipper smooth	7
ba000005-0000-0000-0001-000000000008	d0000001-0000-0000-0000-000000000005	Fabric Defects	PASS	\N	2026-09-11 11:49:11.68248	No defects	8
ba000005-0000-0000-0001-000000000009	d0000001-0000-0000-0000-000000000005	Color Consistency	PASS	\N	2026-09-11 11:49:11.68248	Uniform	9
ba000005-0000-0000-0001-000000000010	d0000001-0000-0000-0000-000000000005	Hemming Finish	PASS	\N	2026-09-11 11:49:11.68248	Clean hem	10
ba000005-0000-0000-0001-000000000011	d0000001-0000-0000-0000-000000000005	Label & Tag Placement	PASS	\N	2026-09-11 12:49:11.68248	Label ok	11
ba000005-0000-0000-0001-000000000012	d0000001-0000-0000-0000-000000000005	Customer Approval	PASS	\N	2026-09-12 05:49:11.68248	Customer happy	12
ba000001-0000-0000-0001-000000000001	d0000001-0000-0000-0000-000000000001	Seam Strength	PENDING	\N	\N	\N	1
ba000001-0000-0000-0001-000000000002	d0000001-0000-0000-0000-000000000001	Thread Trims	PENDING	\N	\N	\N	2
ba000001-0000-0000-0001-000000000003	d0000001-0000-0000-0000-000000000001	Button Attachment	PENDING	\N	\N	\N	3
ba000001-0000-0000-0001-000000000004	d0000001-0000-0000-0000-000000000001	Measurement Accuracy	PENDING	\N	\N	\N	4
ba000001-0000-0000-0001-000000000005	d0000001-0000-0000-0000-000000000001	Lining Quality	PENDING	\N	\N	\N	5
ba000001-0000-0000-0001-000000000006	d0000001-0000-0000-0000-000000000001	Embroidery Finish	PENDING	\N	\N	\N	6
ba000001-0000-0000-0001-000000000007	d0000001-0000-0000-0000-000000000001	Customer Approval	PENDING	\N	\N	\N	7
ba000002-0000-0000-0001-000000000001	d0000001-0000-0000-0000-000000000002	Seam Strength	PENDING	\N	\N	\N	1
ba000002-0000-0000-0001-000000000002	d0000001-0000-0000-0000-000000000002	Thread Trims	PENDING	\N	\N	\N	2
ba000002-0000-0000-0001-000000000003	d0000001-0000-0000-0000-000000000002	Measurement Accuracy	PENDING	\N	\N	\N	3
ba000002-0000-0000-0001-000000000004	d0000001-0000-0000-0000-000000000002	Customer Approval	PENDING	\N	\N	\N	4
ba000003-0000-0000-0001-000000000001	d0000001-0000-0000-0000-000000000003	Seam Strength	PENDING	\N	\N	\N	1
ba000003-0000-0000-0001-000000000002	d0000001-0000-0000-0000-000000000003	Embroidery Finish	PENDING	\N	\N	\N	2
ba000003-0000-0000-0001-000000000003	d0000001-0000-0000-0000-000000000003	Lining Quality	PENDING	\N	\N	\N	3
ba000003-0000-0000-0001-000000000004	d0000001-0000-0000-0000-000000000003	Customer Approval	PENDING	\N	\N	\N	4
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
b1000001-0000-0000-0000-000000000001	SUP-001	Shree Textiles	Rajesh Sharma	+91 98201 12345	sales@shreetextiles.com	Surat, Gujarat	Pure Silks & Banarasi Brocades	\N	2026-09-12 16:36:35.109694
b1000001-0000-0000-0000-000000000002	SUP-002	Kumar Buttons	Manoj Kumar	+91 98401 54321	orders@kumarbuttons.in	Chennai, Tamil Nadu	Mother of Pearl & Antique Buttons	\N	2026-09-12 16:36:35.109694
b1000001-0000-0000-0000-000000000003	SUP-003	Zari World	Vikram Sethi	+91 98111 67890	vikram@zariworld.com	Varanasi, Uttar Pradesh	Pure Gold & Silver Zari Threads	\N	2026-09-12 16:36:35.109694
b1000001-0000-0000-0000-000000000004	SUP-004	Apex Trims	Suresh Patel	+91 98222 78901	info@apextrims.com	Mumbai, Maharashtra	Designer Laces & Borders	\N	2026-09-12 16:36:35.109694
b1000001-0000-0000-0000-000000000005	SUP-005	Sri Balaji Fashions	Balaji R	+91 98400 89012	balaji@sribalaji.in	Chennai, Tamil Nadu	Satoon & Cotton Linings	\N	2026-09-12 16:36:35.109694
\.


--
-- Data for Name: trial_alterations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trial_alterations (id, trial_id, description, category, completed, created_at) FROM stdin;
c07acbe9-c7e3-46fb-9b45-2245414eca0b	e55cf463-9b4f-4a82-bc39-33ca7fa4d875	Take in waist by 0.5" on both sides	Fit	f	2026-09-15 12:55:52.537322
d843b712-0236-4a1a-b0fa-2deeabb80e57	e55cf463-9b4f-4a82-bc39-33ca7fa4d875	Shorten sleeve length by 0.75"	Length	t	2026-09-15 12:55:52.537322
\.


--
-- Data for Name: trials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trials (id, trial_code, order_id, order_code, customer_mobile, customer_name, garment_type, collection, trial_date, trial_time, stage, status, fit_status, designer_name, delivery_date, neck_style, sleeve_style, lining, embroidery, fabric, spec_notes, notes, created_at, updated_at) FROM stdin;
e55cf463-9b4f-4a82-bc39-33ca7fa4d875	TRL-2026-0001	d0000001-0000-0000-0000-000000000001	ORD-2026-0528	+91 99628 44110	Kavya Nair	Blouse	Bridal Collection	2026-09-15	11:00 AM	First Trial	TODAY	PERFECT	Sneha Patel	2026-09-29	Round (Front), Deep Back	3/4 Sleeve	Silk	Zari Embroidery	Raw Silk with Brocade Lining	Handle with care. Customer prefers subtle embroidery.	Fit is immaculate. Customer satisfied.	2026-09-15 12:55:52.537322	2026-09-15 12:55:52.537322
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
-- Name: customer_body_measurements customer_body_measurements_customer_mobile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_body_measurements
    ADD CONSTRAINT customer_body_measurements_customer_mobile_fkey FOREIGN KEY (customer_mobile) REFERENCES public.customers(mobile_number) ON DELETE CASCADE;


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

\unrestrict xS6dbGCKD0xTHh6a2ui9MI3MaYynoO68AQ8tQ2zGS2Qm0IPQ2V5hDW2Yn0FKdPf

