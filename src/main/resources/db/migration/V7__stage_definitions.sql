-- V7__stage_definitions.sql
-- Creates stage_definitions (workflow blueprint) and stage_definition_employees (junction)
-- Seeds the default 8 boutique production stages

-- ─── 1. Stage Definitions Table ──────────────────────────────────────────────
CREATE TABLE stage_definitions (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_key     VARCHAR(50) UNIQUE NOT NULL,   -- e.g. DESIGNING (immutable key)
    display_name  VARCHAR(100) NOT NULL,          -- e.g. Designing (user-editable label)
    description   TEXT,                           -- optional explanation of the stage
    required_role VARCHAR(50),                    -- e.g. DESIGNER (for employee filtering)
    dept_label    VARCHAR(100),                   -- e.g. Design Studio (shown in modals)
    color_class   VARCHAR(50),                    -- e.g. dot-purple (CSS token)
    sort_order    INT         NOT NULL DEFAULT 0, -- ordering in Kanban columns
    active        BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE INDEX idx_stage_def_key    ON stage_definitions (stage_key);
CREATE INDEX idx_stage_def_active ON stage_definitions (active);
CREATE INDEX idx_stage_def_order  ON stage_definitions (sort_order);

-- ─── 2. Stage Definition ↔ Employee Junction Table ───────────────────────────
-- Links specific employees to a stage definition (optional per-employee pinning)
CREATE TABLE stage_definition_employees (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_def_id    UUID        NOT NULL REFERENCES stage_definitions(id) ON DELETE CASCADE,
    employee_id     UUID        NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assignment_type VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE or DEFAULT
    created_at      TIMESTAMP   NOT NULL DEFAULT now(),
    UNIQUE(stage_def_id, employee_id)
);

CREATE INDEX idx_sde_stage    ON stage_definition_employees (stage_def_id);
CREATE INDEX idx_sde_employee ON stage_definition_employees (employee_id);

-- ─── 3. Seed the default 8 boutique production stages ─────────────────────────
INSERT INTO stage_definitions (stage_key, display_name, description, required_role, dept_label, color_class, sort_order, active)
VALUES
    ('DESIGNING', 'Designing',  'Design consultation, sketch finalisation and measurement review.', 'DESIGNER',    'Design Studio',         'dot-purple', 1, TRUE),
    ('LINING',    'Lining',     'Fabric preparation, lining attachment and inner finishing.',        'FINISHER',    'Finishing & Lining',    'dot-blue',   2, TRUE),
    ('HAND_WORK', 'Hand Work',  'Embroidery, zardozi, maggam and bead work on the garment.',        'EMBROIDERER', 'Embroidery & Maggam',   'dot-pink',   3, TRUE),
    ('CUTTING',   'Cutting',    'Pattern layout, fabric cutting and seam marking.',                  'CUTTER',      'Master Cutting',        'dot-yellow', 4, TRUE),
    ('STITCHING', 'Stitching',  'Garment assembly, stitching, hemming and initial finishing.',       'TAILOR',      'Tailoring & Stitching', 'dot-green',  5, TRUE),
    ('TRIAL',     'Trial',      'Client fitting session and alteration identification.',              'SUPERVISOR',  'Fitting & Trial',       'dot-cyan',   6, TRUE),
    ('QC',        'QC',         'Final quality control audit before dispatch clearance.',             'MANAGER',     'Quality Control',       'dot-coral',  7, TRUE),
    ('READY',     'Ready',      'Garment cleared for handover, packaging and customer dispatch.',    'MANAGER',     'Logistics & Dispatch',  'dot-silver', 8, TRUE)
ON CONFLICT (stage_key) DO NOTHING;
