-- Enable RLS so the Supabase Data API cannot read Project rows.
-- The application connects as a dedicated role with BYPASSRLS.

ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "Project" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "Project" FROM authenticated;
  END IF;
END $$;
