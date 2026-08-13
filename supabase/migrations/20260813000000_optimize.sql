-- ============================================================
-- ResearchHub — Production Optimization Migration
-- Generated: 2026-08-13
-- ============================================================
-- SAFE MIGRATION: Adds constraints, indexes, junction tables,
-- and timestamps to existing schema without touching any data.
-- RLS remains DISABLED on all tables per project requirement.
-- ============================================================

-- ============================================================
-- SECTION 1: UNIQUE CONSTRAINT — members.email
-- Prevents duplicate account registration
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'members_email_unique' AND conrelid = 'members'::regclass
  ) THEN
    ALTER TABLE "members" ADD CONSTRAINT "members_email_unique" UNIQUE ("email");
  END IF;
END
$$;

-- ============================================================
-- SECTION 2: ADD created_at TIMESTAMPS to all tables
-- Enables proper chronological sorting and time-range queries.
-- ============================================================
ALTER TABLE "members"    ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "papers"     ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "tasks"      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "notes"      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "notes"      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "shots"      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "voiceNotes" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "files"      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "links"      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "meetings"   ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "events"     ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "phases"     ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE "activity"   ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();

-- ============================================================
-- SECTION 3: email_verified flag on members
-- Tracks whether email OTP verification was completed
-- ============================================================
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- SECTION 4: CHECK CONSTRAINTS — enforce valid enum values
-- Prevents invalid status/priority/kind values at DB level
-- ============================================================

-- papers.status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'papers_status_check'
  ) THEN
    ALTER TABLE "papers" ADD CONSTRAINT "papers_status_check"
      CHECK ("status" IN ('To Read', 'Reading', 'Analyzing', 'Completed', 'Important', 'Rejected'));
  END IF;
END
$$;

-- tasks.status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_status_check'
  ) THEN
    ALTER TABLE "tasks" ADD CONSTRAINT "tasks_status_check"
      CHECK ("status" IN ('backlog', 'todo', 'progress', 'review', 'done'));
  END IF;
END
$$;

-- tasks.priority
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_priority_check'
  ) THEN
    ALTER TABLE "tasks" ADD CONSTRAINT "tasks_priority_check"
      CHECK ("priority" IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'));
  END IF;
END
$$;

-- notes.type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notes_type_check'
  ) THEN
    ALTER TABLE "notes" ADD CONSTRAINT "notes_type_check"
      CHECK ("type" IN ('Research', 'Meeting', 'Idea', 'Literature Review', 'Experiment', 'Brainstorm'));
  END IF;
END
$$;

-- events.kind
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_kind_check'
  ) THEN
    ALTER TABLE "events" ADD CONSTRAINT "events_kind_check"
      CHECK ("kind" IN ('meeting', 'deadline', 'milestone', 'personal'));
  END IF;
END
$$;

-- members.role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'members_role_check'
  ) THEN
    ALTER TABLE "members" ADD CONSTRAINT "members_role_check"
      CHECK ("role" IN ('Team Leader', 'Researcher', 'Supervisor', 'Member'));
  END IF;
END
$$;

-- activity.kind
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'activity_kind_check'
  ) THEN
    ALTER TABLE "activity" ADD CONSTRAINT "activity_kind_check"
      CHECK ("kind" IN ('paper', 'task', 'note', 'file', 'voice', 'image', 'comment'));
  END IF;
END
$$;

-- ============================================================
-- SECTION 5: PERFORMANCE INDEXES
-- Based on actual query patterns in db-server.ts and UI routes
-- ============================================================

-- members
CREATE INDEX IF NOT EXISTS "idx_members_email"      ON "members" ("email");
CREATE INDEX IF NOT EXISTS "idx_members_role"       ON "members" ("role");

-- papers
CREATE INDEX IF NOT EXISTS "idx_papers_owner"       ON "papers" ("ownerId");
CREATE INDEX IF NOT EXISTS "idx_papers_status"      ON "papers" ("status");
CREATE INDEX IF NOT EXISTS "idx_papers_year"        ON "papers" ("year" DESC);
CREATE INDEX IF NOT EXISTS "idx_papers_category"    ON "papers" ("category");
CREATE INDEX IF NOT EXISTS "idx_papers_created"     ON "papers" ("created_at" DESC);

-- tasks
CREATE INDEX IF NOT EXISTS "idx_tasks_assignee"     ON "tasks" ("assigneeId");
CREATE INDEX IF NOT EXISTS "idx_tasks_status"       ON "tasks" ("status");
CREATE INDEX IF NOT EXISTS "idx_tasks_priority"     ON "tasks" ("priority");
CREATE INDEX IF NOT EXISTS "idx_tasks_paper"        ON "tasks" ("paperId");
CREATE INDEX IF NOT EXISTS "idx_tasks_phase"        ON "tasks" ("phaseId");
CREATE INDEX IF NOT EXISTS "idx_tasks_due"          ON "tasks" ("due");
CREATE INDEX IF NOT EXISTS "idx_tasks_created"      ON "tasks" ("created_at" DESC);

-- notes
CREATE INDEX IF NOT EXISTS "idx_notes_author"       ON "notes" ("authorId");
CREATE INDEX IF NOT EXISTS "idx_notes_paper"        ON "notes" ("paperId");
CREATE INDEX IF NOT EXISTS "idx_notes_task"         ON "notes" ("taskId");
CREATE INDEX IF NOT EXISTS "idx_notes_updated"      ON "notes" ("updated_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_notes_type"         ON "notes" ("type");

-- shots (screenshots)
CREATE INDEX IF NOT EXISTS "idx_shots_paper"        ON "shots" ("paperId");
CREATE INDEX IF NOT EXISTS "idx_shots_uploader"     ON "shots" ("uploadedBy");
CREATE INDEX IF NOT EXISTS "idx_shots_created"      ON "shots" ("created_at" DESC);

-- voiceNotes
CREATE INDEX IF NOT EXISTS "idx_voice_author"       ON "voiceNotes" ("authorId");
CREATE INDEX IF NOT EXISTS "idx_voice_paper"        ON "voiceNotes" ("paperId");
CREATE INDEX IF NOT EXISTS "idx_voice_task"         ON "voiceNotes" ("taskId");
CREATE INDEX IF NOT EXISTS "idx_voice_created"      ON "voiceNotes" ("created_at" DESC);

-- files
CREATE INDEX IF NOT EXISTS "idx_files_folder"       ON "files" ("folder");
CREATE INDEX IF NOT EXISTS "idx_files_uploader"     ON "files" ("uploadedBy");
CREATE INDEX IF NOT EXISTS "idx_files_ext"          ON "files" ("ext");
CREATE INDEX IF NOT EXISTS "idx_files_created"      ON "files" ("created_at" DESC);

-- links
CREATE INDEX IF NOT EXISTS "idx_links_category"     ON "links" ("category");
CREATE INDEX IF NOT EXISTS "idx_links_paper"        ON "links" ("paperId");
CREATE INDEX IF NOT EXISTS "idx_links_adder"        ON "links" ("addedBy");
CREATE INDEX IF NOT EXISTS "idx_links_created"      ON "links" ("created_at" DESC);

-- meetings
CREATE INDEX IF NOT EXISTS "idx_meetings_date"      ON "meetings" ("date");
CREATE INDEX IF NOT EXISTS "idx_meetings_created"   ON "meetings" ("created_at" DESC);

-- events
CREATE INDEX IF NOT EXISTS "idx_events_date"        ON "events" ("date");
CREATE INDEX IF NOT EXISTS "idx_events_kind"        ON "events" ("kind");
CREATE INDEX IF NOT EXISTS "idx_events_created"     ON "events" ("created_at" DESC);

-- phases
CREATE INDEX IF NOT EXISTS "idx_phases_index"       ON "phases" ("index" ASC);
CREATE INDEX IF NOT EXISTS "idx_phases_progress"    ON "phases" ("progress");

-- activity — CRITICAL: this table grows unboundedly
CREATE INDEX IF NOT EXISTS "idx_activity_member"    ON "activity" ("memberId");
CREATE INDEX IF NOT EXISTS "idx_activity_kind"      ON "activity" ("kind");
CREATE INDEX IF NOT EXISTS "idx_activity_created"   ON "activity" ("created_at" DESC);

-- ============================================================
-- SECTION 6: JUNCTION TABLES (many-to-many relationships)
-- Replace JSONB arrays with proper relational tables
-- Existing JSONB arrays kept for app compatibility during migration
-- ============================================================

-- meeting_participants: replaces meetings.participants JSONB array
CREATE TABLE IF NOT EXISTS "meeting_participants" (
  "meeting_id"  TEXT NOT NULL REFERENCES "meetings"("id") ON DELETE CASCADE,
  "member_id"   TEXT NOT NULL REFERENCES "members"("id")  ON DELETE CASCADE,
  PRIMARY KEY ("meeting_id", "member_id")
);
CREATE INDEX IF NOT EXISTS "idx_mtg_part_member"  ON "meeting_participants" ("member_id");
CREATE INDEX IF NOT EXISTS "idx_mtg_part_meeting" ON "meeting_participants" ("meeting_id");
ALTER TABLE "meeting_participants" DISABLE ROW LEVEL SECURITY;

-- phase_members: replaces phases.members JSONB array
CREATE TABLE IF NOT EXISTS "phase_members" (
  "phase_id"    TEXT NOT NULL REFERENCES "phases"("id")   ON DELETE CASCADE,
  "member_id"   TEXT NOT NULL REFERENCES "members"("id")  ON DELETE CASCADE,
  PRIMARY KEY ("phase_id", "member_id")
);
CREATE INDEX IF NOT EXISTS "idx_phase_mem_member" ON "phase_members" ("member_id");
CREATE INDEX IF NOT EXISTS "idx_phase_mem_phase"  ON "phase_members" ("phase_id");
ALTER TABLE "phase_members" DISABLE ROW LEVEL SECURITY;

-- event_attendees: replaces events.attendees JSONB array
CREATE TABLE IF NOT EXISTS "event_attendees" (
  "event_id"    TEXT NOT NULL REFERENCES "events"("id")   ON DELETE CASCADE,
  "member_id"   TEXT NOT NULL REFERENCES "members"("id")  ON DELETE CASCADE,
  PRIMARY KEY ("event_id", "member_id")
);
CREATE INDEX IF NOT EXISTS "idx_evt_att_member"   ON "event_attendees" ("member_id");
CREATE INDEX IF NOT EXISTS "idx_evt_att_event"    ON "event_attendees" ("event_id");
ALTER TABLE "event_attendees" DISABLE ROW LEVEL SECURITY;

-- shot_comments: normalizes shots.comments JSONB array
-- Existing shots.comments JSONB kept for backward compatibility
CREATE TABLE IF NOT EXISTS "shot_comments" (
  "id"          TEXT        PRIMARY KEY,
  "shot_id"     TEXT        NOT NULL REFERENCES "shots"("id")   ON DELETE CASCADE,
  "author_id"   TEXT        NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
  "text"        TEXT        NOT NULL CHECK (char_length("text") > 0),
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_shot_cmt_shot"    ON "shot_comments" ("shot_id");
CREATE INDEX IF NOT EXISTS "idx_shot_cmt_author"  ON "shot_comments" ("author_id");
CREATE INDEX IF NOT EXISTS "idx_shot_cmt_created" ON "shot_comments" ("created_at" DESC);
ALTER TABLE "shot_comments" DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECTION 7: ACTIVITY PAGINATION VIEW
-- Exposes only the 100 most recent activity entries for
-- performance. Frontend queries this view instead of the table.
-- ============================================================
CREATE OR REPLACE VIEW "recent_activity" AS
  SELECT * FROM "activity"
  ORDER BY "created_at" DESC
  LIMIT 100;

-- ============================================================
-- SECTION 8: GRANT PERMISSIONS
-- Ensure anon + authenticated roles can read/write all tables
-- (Supabase uses these roles for API calls via anon key)
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON "members"              TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "papers"               TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "tasks"                TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "notes"                TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "shots"                TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "voiceNotes"           TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "files"                TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "links"                TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "meetings"             TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "events"               TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "phases"               TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "activity"             TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "meeting_participants" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "phase_members"        TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "event_attendees"      TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "shot_comments"        TO anon, authenticated;
GRANT SELECT                          ON "recent_activity"      TO anon, authenticated;

-- ============================================================
-- SECTION 9: CONFIRM RLS DISABLED on all tables
-- ============================================================
ALTER TABLE "members"              DISABLE ROW LEVEL SECURITY;
ALTER TABLE "papers"               DISABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks"                DISABLE ROW LEVEL SECURITY;
ALTER TABLE "notes"                DISABLE ROW LEVEL SECURITY;
ALTER TABLE "shots"                DISABLE ROW LEVEL SECURITY;
ALTER TABLE "voiceNotes"           DISABLE ROW LEVEL SECURITY;
ALTER TABLE "files"                DISABLE ROW LEVEL SECURITY;
ALTER TABLE "links"                DISABLE ROW LEVEL SECURITY;
ALTER TABLE "meetings"             DISABLE ROW LEVEL SECURITY;
ALTER TABLE "events"               DISABLE ROW LEVEL SECURITY;
ALTER TABLE "phases"               DISABLE ROW LEVEL SECURITY;
ALTER TABLE "activity"             DISABLE ROW LEVEL SECURITY;
ALTER TABLE "meeting_participants" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "phase_members"        DISABLE ROW LEVEL SECURITY;
ALTER TABLE "event_attendees"      DISABLE ROW LEVEL SECURITY;
ALTER TABLE "shot_comments"        DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECTION 10: ATOMIC JSONB UPDATE FUNCTIONS
-- Eliminates N+1 read-then-write patterns in backend
-- ============================================================

-- Atomically toggle a checklist item's `done` boolean
CREATE OR REPLACE FUNCTION toggle_checklist_item(
  p_task_id TEXT,
  p_index   INTEGER
) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "tasks"
  SET "checklist" = jsonb_set(
    "checklist",
    ARRAY[p_index::text, 'done'],
    (NOT ("checklist"->p_index->>'done')::boolean)::text::jsonb
  )
  WHERE "id" = p_task_id;
END;
$$;

-- Atomically append a comment to a paper's analysis JSONB
CREATE OR REPLACE FUNCTION set_paper_analysis(
  p_paper_id TEXT,
  p_section  TEXT,
  p_value    TEXT
) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "papers"
  SET "analysis" = jsonb_set(
    COALESCE("analysis", '{}'::jsonb),
    ARRAY[p_section],
    to_jsonb(p_value)
  )
  WHERE "id" = p_paper_id;
END;
$$;

-- ============================================================
-- DONE — Migration applied successfully.
-- ============================================================
