-- ============================================================
-- ResearchHub — File Uploads & Storage Optimization Migration
-- Generated: 2026-08-13
-- ============================================================

-- Ensure storage schema holds the documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, 52428800, null)
ON CONFLICT (id) DO NOTHING;

-- Disable RLS on storage to allow anon uploads as requested
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Grant permissions for storage schema
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;

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
