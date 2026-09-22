-- V3__extend_designs_table.sql
-- Extends the existing `designs` table with rich Design Studio fields
-- All columns are nullable so existing rows are unaffected

ALTER TABLE designs
    ADD COLUMN IF NOT EXISTS sub_category       VARCHAR(100),
    ADD COLUMN IF NOT EXISTS style              VARCHAR(100),
    ADD COLUMN IF NOT EXISTS occasion           VARCHAR(100),
    ADD COLUMN IF NOT EXISTS collection         VARCHAR(150),
    ADD COLUMN IF NOT EXISTS primary_fabric     VARCHAR(200),
    ADD COLUMN IF NOT EXISTS colour_options     TEXT,
    ADD COLUMN IF NOT EXISTS sizes              VARCHAR(200),
    ADD COLUMN IF NOT EXISTS construction       TEXT,
    ADD COLUMN IF NOT EXISTS embroidery         TEXT,
    ADD COLUMN IF NOT EXISTS estimated_cost     NUMERIC(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS suggested_price    NUMERIC(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS estimated_labour   VARCHAR(50),
    ADD COLUMN IF NOT EXISTS production_status  VARCHAR(30) DEFAULT 'Active',
    ADD COLUMN IF NOT EXISTS times_used         INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_used_date     DATE,
    ADD COLUMN IF NOT EXISTS tags               TEXT,
    ADD COLUMN IF NOT EXISTS image_urls         TEXT,
    ADD COLUMN IF NOT EXISTS swatches           TEXT,
    ADD COLUMN IF NOT EXISTS notes              TEXT,
    ADD COLUMN IF NOT EXISTS created_by         VARCHAR(100);

-- Indexes for common filter/sort operations
CREATE INDEX IF NOT EXISTS idx_design_occasion    ON designs (occasion);
CREATE INDEX IF NOT EXISTS idx_design_collection  ON designs (collection);
CREATE INDEX IF NOT EXISTS idx_design_prod_status ON designs (production_status);
CREATE INDEX IF NOT EXISTS idx_design_created_by  ON designs (created_by);
