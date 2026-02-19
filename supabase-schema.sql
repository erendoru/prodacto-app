-- Prodacto Database Schema
-- Run this SQL in Supabase Dashboard > SQL Editor

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'TEAM');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('WEB', 'MOBILE', 'BOTH');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BacklogStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "stripe_customer_id" TEXT,
    "monthly_query_count" INTEGER NOT NULL DEFAULT 0,
    "query_reset_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tech_stack" JSONB,
    "platform" "Platform" NOT NULL DEFAULT 'WEB',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "template_type" TEXT,
    "ai_score" JSONB,
    "annotations" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backlog_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "acceptance_criteria" JSONB,
    "readiness_score" JSONB,
    "story_points" INTEGER,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "BacklogStatus" NOT NULL DEFAULT 'TODO',
    "technical_risks" JSONB,
    "test_scenarios" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backlog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_analyses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "report" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "project_id" UUID,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "context_vault" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'note',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "context_vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "description" TEXT,
    "metrics" JSONB NOT NULL,
    "variants" JSONB NOT NULL,
    "sample_size" INTEGER,
    "duration_days" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "results" JSONB,
    "ai_recommendations" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");
CREATE INDEX "context_vault_project_id_idx" ON "context_vault"("project_id");
CREATE INDEX "context_vault_user_id_idx" ON "context_vault"("user_id");
CREATE INDEX "context_vault_type_idx" ON "context_vault"("type");
CREATE INDEX "experiments_project_id_idx" ON "experiments"("project_id");
CREATE INDEX "experiments_user_id_idx" ON "experiments"("user_id");
CREATE INDEX "experiments_status_idx" ON "experiments"("status");
CREATE INDEX "document_versions_document_id_idx" ON "document_versions"("document_id");
CREATE UNIQUE INDEX "document_versions_document_id_version_key" ON "document_versions"("document_id", "version");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "backlog_items" ADD CONSTRAINT "backlog_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "backlog_items" ADD CONSTRAINT "backlog_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "market_analyses" ADD CONSTRAINT "market_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "context_vault" ADD CONSTRAINT "context_vault_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "context_vault" ADD CONSTRAINT "context_vault_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row Level Security
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "backlog_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "market_analyses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "context_vault" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "experiments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document_versions" ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own data
CREATE POLICY "Users can view own data" ON "users" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON "users" FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON "users" FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own projects" ON "projects" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON "projects" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON "projects" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON "projects" FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own documents" ON "documents" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON "documents" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON "documents" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON "documents" FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own backlog items" ON "backlog_items" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own backlog items" ON "backlog_items" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own backlog items" ON "backlog_items" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own backlog items" ON "backlog_items" FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own market analyses" ON "market_analyses" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own market analyses" ON "market_analyses" FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own chat messages" ON "chat_messages" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON "chat_messages" FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own context vault items" ON "context_vault" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own context vault items" ON "context_vault" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own context vault items" ON "context_vault" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own context vault items" ON "context_vault" FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own experiments" ON "experiments" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own experiments" ON "experiments" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own experiments" ON "experiments" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own experiments" ON "experiments" FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own document versions" ON "document_versions" FOR SELECT
  USING (EXISTS (SELECT 1 FROM "documents" WHERE "documents"."id" = "document_versions"."document_id" AND "documents"."user_id" = auth.uid()));
CREATE POLICY "Users can insert own document versions" ON "document_versions" FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can delete own document versions" ON "document_versions" FOR DELETE
  USING (EXISTS (SELECT 1 FROM "documents" WHERE "documents"."id" = "document_versions"."document_id" AND "documents"."user_id" = auth.uid()));

-- Auto-create user profile on signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
