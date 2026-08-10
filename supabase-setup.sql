-- Research Compass Supabase SQL Setup Script (Schema Only)
-- Paste this script directly into the Supabase SQL Editor to create tables.
-- Contains no seed/mock data, starting with a clean blank database.

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS "members" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "initials" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "responsibilities" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "uniId" TEXT,
  "phone" TEXT,
  "uniEmail" TEXT,
  "cv" TEXT,
  "privateEmail" TEXT
);

CREATE TABLE IF NOT EXISTS "papers" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "authors" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "venue" TEXT NOT NULL,
  "doi" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "keywords" JSONB NOT NULL,
  "abstract" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "progress" INTEGER NOT NULL,
  "analysis" JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS "tasks" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "assigneeId" TEXT NOT NULL,
  "due" TEXT NOT NULL,
  "labels" JSONB NOT NULL,
  "checklist" JSONB NOT NULL,
  "paperId" TEXT,
  "phaseId" TEXT,
  "comments" INTEGER NOT NULL,
  "attachments" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "notes" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "updated" TEXT NOT NULL,
  "tags" JSONB NOT NULL,
  "body" TEXT NOT NULL,
  "paperId" TEXT,
  "taskId" TEXT
);

CREATE TABLE IF NOT EXISTS "shots" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "tags" JSONB NOT NULL,
  "source" TEXT NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "paperId" TEXT,
  "hue" INTEGER NOT NULL,
  "comments" JSONB NOT NULL,
  "url" TEXT
);

CREATE TABLE IF NOT EXISTS "voiceNotes" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "seconds" INTEGER NOT NULL,
  "authorId" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "paperId" TEXT,
  "taskId" TEXT
);

CREATE TABLE IF NOT EXISTS "files" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "ext" TEXT NOT NULL,
  "folder" TEXT NOT NULL,
  "size" TEXT NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "url" TEXT
);

CREATE TABLE IF NOT EXISTS "links" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "tags" JSONB NOT NULL,
  "addedBy" TEXT NOT NULL,
  "paperId" TEXT
);

CREATE TABLE IF NOT EXISTS "meetings" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "participants" JSONB NOT NULL,
  "agenda" JSONB NOT NULL,
  "decisions" JSONB NOT NULL,
  "actionItems" JSONB NOT NULL,
  "notes" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "events" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "attendees" JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS "phases" (
  "id" TEXT PRIMARY KEY,
  "index" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "start" TEXT NOT NULL,
  "end" TEXT NOT NULL,
  "progress" INTEGER NOT NULL,
  "members" JSONB NOT NULL,
  "deliverables" JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS "activity" (
  "id" TEXT PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "object" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "kind" TEXT NOT NULL
);

-- 2. Disable Row Level Security (RLS) for Development Access
ALTER TABLE "members" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "papers" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "notes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "shots" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "voiceNotes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "meetings" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "phases" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "activity" DISABLE ROW LEVEL SECURITY;
