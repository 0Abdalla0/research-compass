-- Create project details table for synchronization across teammates
CREATE TABLE IF NOT EXISTS "project" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "institution" TEXT NOT NULL,
  "phase" TEXT NOT NULL,
  "progress" INTEGER NOT NULL
);

-- Seed with initial project details
INSERT INTO "project" ("id", "name", "topic", "institution", "phase", "progress")
VALUES ('default', 'SehatMasr', 'Ontology-Driven Clinical NLP for Early Sepsis Risk Detection', 'Faculty of Computing · Graduation Research Group 07', 'Phase 3 · Dataset Collection', 46)
ON CONFLICT ("id") DO NOTHING;
