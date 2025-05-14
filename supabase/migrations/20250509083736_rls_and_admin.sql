-- Enable RLS and add admin role for source, work, and voice_actors tables

-- 1. Create admin role if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END$$;

-- 2. Enable RLS on the relevant tables
ALTER TABLE source ENABLE ROW LEVEL SECURITY;
ALTER TABLE work ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_actors ENABLE ROW LEVEL SECURITY;

-- 3. Create basic RLS policies
-- Allow full access to admin, restrict others (example: only owner can CRUD)

-- Policy for source
drop policy if exists "admin_full_access" on source;
create policy "admin_full_access" on source
  for all
  to admin
  using (true)
  with check (true);

-- Policy for work
drop policy if exists "admin_full_access" on work;
create policy "admin_full_access" on work
  for all
  to admin
  using (true)
  with check (true);

-- Policy for voice_actors
drop policy if exists "admin_full_access" on voice_actors;
create policy "admin_full_access" on voice_actors
  for all
  to admin
  using (true)
  with check (true);

-- Example: allow owner access for non-admins (customize as needed)
-- Uncomment and adapt if you want owner-based policies
-- create policy "users_can_access_their_rows" on source for all using (auth.uid() = owner_id);
