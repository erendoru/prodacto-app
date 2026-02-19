-- Prodacto Faz 1: DB Schema Changes
-- New tables: context_vault, experiments, document_versions
-- New column: documents.annotations
-- Run this SQL in Supabase Dashboard > SQL Editor

-- ============================================================
-- 1. Add annotations column to existing documents table
-- ============================================================

ALTER TABLE "documents"
  ADD COLUMN IF NOT EXISTS "annotations" JSONB;

-- ============================================================
-- 2. Context Vault table
-- ============================================================

CREATE TABLE "context_vault" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'note',  -- note, persona, competitor, constraint, reference
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "context_vault_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "context_vault"
  ADD CONSTRAINT "context_vault_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "context_vault"
  ADD CONSTRAINT "context_vault_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes for common query patterns
CREATE INDEX "context_vault_project_id_idx" ON "context_vault"("project_id");
CREATE INDEX "context_vault_user_id_idx" ON "context_vault"("user_id");
CREATE INDEX "context_vault_type_idx" ON "context_vault"("type");

-- ============================================================
-- 3. Experiments (A/B Test Plans) table
-- ============================================================

CREATE TABLE "experiments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "description" TEXT,
    "metrics" JSONB NOT NULL,         -- {primary: [...], secondary: [...]}
    "variants" JSONB NOT NULL,         -- [{name, description, allocation}]
    "sample_size" INTEGER,
    "duration_days" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',  -- DRAFT, RUNNING, COMPLETED, CANCELLED
    "results" JSONB,
    "ai_recommendations" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "experiments"
  ADD CONSTRAINT "experiments_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experiments"
  ADD CONSTRAINT "experiments_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "experiments_project_id_idx" ON "experiments"("project_id");
CREATE INDEX "experiments_user_id_idx" ON "experiments"("user_id");
CREATE INDEX "experiments_status_idx" ON "experiments"("status");

-- ============================================================
-- 4. Document Versions table
-- ============================================================

CREATE TABLE "document_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "change_summary" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "document_versions"
  ADD CONSTRAINT "document_versions_document_id_fkey"
  FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "document_versions"
  ADD CONSTRAINT "document_versions_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "document_versions_document_id_idx" ON "document_versions"("document_id");
CREATE UNIQUE INDEX "document_versions_document_id_version_key" ON "document_versions"("document_id", "version");

-- ============================================================
-- 5. Enable Row Level Security on new tables
-- ============================================================

ALTER TABLE "context_vault" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "experiments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document_versions" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS Policies - context_vault
-- ============================================================

CREATE POLICY "Users can view own context vault items"
  ON "context_vault" FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context vault items"
  ON "context_vault" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context vault items"
  ON "context_vault" FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own context vault items"
  ON "context_vault" FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 7. RLS Policies - experiments
-- ============================================================

CREATE POLICY "Users can view own experiments"
  ON "experiments" FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiments"
  ON "experiments" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiments"
  ON "experiments" FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiments"
  ON "experiments" FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 8. RLS Policies - document_versions
--    Users can access versions of documents they own
-- ============================================================

CREATE POLICY "Users can view own document versions"
  ON "document_versions" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "documents"
      WHERE "documents"."id" = "document_versions"."document_id"
        AND "documents"."user_id" = auth.uid()
    )
  );

CREATE POLICY "Users can insert own document versions"
  ON "document_versions" FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own document versions"
  ON "document_versions" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "documents"
      WHERE "documents"."id" = "document_versions"."document_id"
        AND "documents"."user_id" = auth.uid()
    )
  );
