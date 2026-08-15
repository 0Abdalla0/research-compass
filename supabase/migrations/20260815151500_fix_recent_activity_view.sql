DROP VIEW IF EXISTS "recent_activity";
CREATE OR REPLACE VIEW "recent_activity" AS
  SELECT * FROM "activity"
  ORDER BY "time" DESC
  LIMIT 100;

GRANT SELECT ON "recent_activity" TO anon, authenticated;
