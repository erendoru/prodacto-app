-- Run this in Supabase Dashboard > SQL Editor
-- Adds chat sessions support

CREATE TABLE IF NOT EXISTS "chat_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "project_id" UUID REFERENCES "projects"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "session_id" UUID REFERENCES "chat_sessions"("id") ON DELETE CASCADE;

ALTER TABLE "chat_sessions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat sessions" ON "chat_sessions" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON "chat_sessions" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON "chat_sessions" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON "chat_sessions" FOR DELETE USING (auth.uid() = user_id);
