-- ============================================================================
-- Migration V9: Add Design Variant Lineage and Blueprint Attribute Columns
-- Enables relational parent-child lineage, blueprint tailoring specs,
-- production readiness metrics, and variant alteration tracking.
-- ============================================================================

ALTER TABLE public.designs
    ADD COLUMN IF NOT EXISTS is_variant boolean DEFAULT false NOT NULL,
    ADD COLUMN IF NOT EXISTS parent_design_id uuid REFERENCES public.designs(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS parent_design_code character varying(30),
    ADD COLUMN IF NOT EXISTS variant_suffix character varying(30),
    ADD COLUMN IF NOT EXISTS neckline character varying(150),
    ADD COLUMN IF NOT EXISTS sleeve_style character varying(150),
    ADD COLUMN IF NOT EXISTS back_design character varying(150),
    ADD COLUMN IF NOT EXISTS lining character varying(150),
    ADD COLUMN IF NOT EXISTS padding character varying(100),
    ADD COLUMN IF NOT EXISTS readiness_score integer DEFAULT 85,
    ADD COLUMN IF NOT EXISTS variant_alteration_notes text;

CREATE INDEX IF NOT EXISTS idx_designs_parent_id ON public.designs USING btree (parent_design_id);
CREATE INDEX IF NOT EXISTS idx_designs_is_variant ON public.designs USING btree (is_variant);
