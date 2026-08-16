-- Add githubUsername column to members table
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "githubUsername" TEXT;
