-- ============================================================
-- ResearchHub — Communication, Comments, Chat & Notifications Migration
-- Generated: 2026-08-14
-- ============================================================

-- 1. Create Universal Comments Table
CREATE TABLE IF NOT EXISTS "comments" (
  "id"                 TEXT        PRIMARY KEY,
  "user_id"            TEXT        NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
  "project_id"         TEXT, -- references phases.id
  "paper_id"           TEXT        REFERENCES "papers"("id") ON DELETE CASCADE,
  "task_id"            TEXT        REFERENCES "tasks"("id") ON DELETE CASCADE,
  "note_id"            TEXT        REFERENCES "notes"("id") ON DELETE CASCADE,
  "file_id"            TEXT        REFERENCES "files"("id") ON DELETE CASCADE,
  "shot_id"            TEXT        REFERENCES "shots"("id") ON DELETE CASCADE,
  "parent_comment_id"  TEXT        REFERENCES "comments"("id") ON DELETE CASCADE,
  "content"            TEXT        NOT NULL,
  
  -- Attachment metadata
  "url"                TEXT,
  "storage_path"       TEXT,
  "mime_type"          TEXT,
  "size_bytes"         BIGINT,
  
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Conversations Table
CREATE TABLE IF NOT EXISTS "conversations" (
  "id"                 TEXT        PRIMARY KEY,
  "name"               TEXT,
  "is_group"           BOOLEAN     NOT NULL DEFAULT false,
  "paper_id"           TEXT        REFERENCES "papers"("id") ON DELETE CASCADE,
  "phase_id"           TEXT, -- references phases.id
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Conversation Members Table
CREATE TABLE IF NOT EXISTS "conversation_members" (
  "conversation_id"    TEXT        NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "member_id"          TEXT        NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
  PRIMARY KEY ("conversation_id", "member_id")
);

-- 4. Create Messages Table
CREATE TABLE IF NOT EXISTS "messages" (
  "id"                 TEXT        PRIMARY KEY,
  "conversation_id"    TEXT        NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "sender_id"          TEXT        NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
  "message_type"       TEXT        NOT NULL CHECK ("message_type" IN ('text', 'voice', 'image', 'file', 'link', 'system')),
  "content"            TEXT        NOT NULL,
  "reply_to_message_id" TEXT       REFERENCES "messages"("id") ON DELETE SET NULL,
  
  -- Attachment metadata
  "url"                TEXT,
  "storage_path"       TEXT,
  "mime_type"          TEXT,
  "size_bytes"         BIGINT,
  
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at"         TIMESTAMPTZ
);

-- 5. Create Notifications Table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id"                 TEXT        PRIMARY KEY,
  "user_id"            TEXT        NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
  "type"               TEXT        NOT NULL,
  "title"              TEXT        NOT NULL,
  "description"        TEXT        NOT NULL,
  "is_read"            BOOLEAN     NOT NULL DEFAULT false,
  "link"               TEXT,
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Disable RLS on new tables (matching the project policy)
ALTER TABLE "comments"             DISABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations"        DISABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation_members" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "messages"             DISABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications"        DISABLE ROW LEVEL SECURITY;

-- 7. Grant Permissions to anon & authenticated users
GRANT ALL ON "comments"             TO anon, authenticated;
GRANT ALL ON "conversations"        TO anon, authenticated;
GRANT ALL ON "conversation_members" TO anon, authenticated;
GRANT ALL ON "messages"             TO anon, authenticated;
GRANT ALL ON "notifications"        TO anon, authenticated;

-- 8. Add Tables to Supabase Realtime Publication
-- Note: Wrap in DO block to handle cases where realtime publication does not exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "comments";
    ALTER PUBLICATION supabase_realtime ADD TABLE "conversations";
    ALTER PUBLICATION supabase_realtime ADD TABLE "conversation_members";
    ALTER PUBLICATION supabase_realtime ADD TABLE "messages";
    ALTER PUBLICATION supabase_realtime ADD TABLE "notifications";
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Fail silently if publication setup encounters permission issues
END;
$$;
