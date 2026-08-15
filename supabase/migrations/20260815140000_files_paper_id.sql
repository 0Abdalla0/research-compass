ALTER TABLE "files" ADD COLUMN IF NOT EXISTS "paperId" TEXT;
CREATE INDEX IF NOT EXISTS "idx_files_paper" ON "files" ("paperId");
