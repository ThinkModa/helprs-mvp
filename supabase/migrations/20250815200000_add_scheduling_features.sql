-- Migration: Add scheduling features
-- Add form required toggle, draft status, and worker count per job

-- Step 1: Add form_required field to forms table
ALTER TABLE forms 
ADD COLUMN form_required boolean DEFAULT false;

-- Step 2: Add draft status to job_status enum
ALTER TYPE job_status ADD VALUE 'draft';

-- Step 3: Add worker_count field to jobs table
ALTER TABLE jobs 
ADD COLUMN worker_count INTEGER DEFAULT 1;

-- Step 4: Add comments to explain the new fields
COMMENT ON COLUMN forms.form_required IS 'Designates if this entire form is required for appointment booking';
COMMENT ON COLUMN jobs.worker_count IS 'Number of workers needed for this specific appointment';

-- Step 5: Create index for form_required
CREATE INDEX idx_forms_form_required ON forms(form_required);

-- Step 6: Create index for job status (will include draft automatically)
CREATE INDEX idx_jobs_status_updated ON jobs(status);

-- Step 7: Note: RLS policy for draft jobs will be handled by existing company isolation policy
