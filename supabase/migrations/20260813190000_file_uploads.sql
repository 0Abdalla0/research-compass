-- ============================================================
-- ResearchHub — File Uploads & Storage Columns Migration
-- Generated: 2026-08-13
-- ============================================================
-- NOTE: Storage bucket ('documents') and its access policies 
-- should be configured via the Supabase Dashboard UI to avoid 
-- permission errors on system-owned schemas.
-- ============================================================

-- Add new metadata fields to track uploaded files in database tables
ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "storage_path" TEXT;
ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "mime_type" TEXT;
ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "size_bytes" BIGINT;

ALTER TABLE "shots" ADD COLUMN IF NOT EXISTS "storage_path" TEXT;
ALTER TABLE "shots" ADD COLUMN IF NOT EXISTS "mime_type" TEXT;
ALTER TABLE "shots" ADD COLUMN IF NOT EXISTS "size_bytes" BIGINT;

ALTER TABLE "voiceNotes" ADD COLUMN IF NOT EXISTS "storage_path" TEXT;
ALTER TABLE "voiceNotes" ADD COLUMN IF NOT EXISTS "mime_type" TEXT;
ALTER TABLE "voiceNotes" ADD COLUMN IF NOT EXISTS "size_bytes" BIGINT;

ALTER TABLE "papers" ADD COLUMN IF NOT EXISTS "storage_path" TEXT;
ALTER TABLE "papers" ADD COLUMN IF NOT EXISTS "mime_type" TEXT;
ALTER TABLE "papers" ADD COLUMN IF NOT EXISTS "size_bytes" BIGINT;

ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "cv_storage_path" TEXT;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "cv_mime_type" TEXT;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "cv_size_bytes" BIGINT;
