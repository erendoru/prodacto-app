ALTER TABLE "backlog_items" ADD COLUMN IF NOT EXISTS "sub_tasks" JSONB;
ALTER TABLE "backlog_items" ADD COLUMN IF NOT EXISTS "bdd_criteria" JSONB;
ALTER TABLE "backlog_items" ADD COLUMN IF NOT EXISTS "score_reasons" JSONB;
ALTER TABLE "backlog_items" ADD COLUMN IF NOT EXISTS "jira_key" TEXT;
