-- The 'status' column already exists as TEXT with a default of 'suggestion'.
-- For this migration, we will consider all pre-existing entries as 'validated'
-- because the suggestion system did not exist before.
UPDATE public.work SET status = 'validated';

-- Create the new enum type for data integrity.
CREATE TYPE public.work_status AS ENUM ('suggestion', 'validated');

-- Alter the column to use the new enum type, casting existing values.
-- All values should be 'validated' at this point.
ALTER TABLE public.work
ALTER COLUMN status TYPE public.work_status
USING status::work_status;

-- Set the default for all new work entries to be 'suggestion'.
ALTER TABLE public.work
ALTER COLUMN status SET DEFAULT 'suggestion';

-- We also need to change the default on the table itself, as the previous default was text.
ALTER TABLE public.work
ALTER COLUMN status SET NOT NULL;