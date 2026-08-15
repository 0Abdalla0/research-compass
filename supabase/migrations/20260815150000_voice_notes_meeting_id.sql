ALTER TABLE "voiceNotes" ADD COLUMN IF NOT EXISTS "meetingId" TEXT;
CREATE INDEX IF NOT EXISTS "idx_voice_meeting" ON "voiceNotes" ("meetingId");
