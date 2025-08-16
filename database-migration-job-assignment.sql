-- Database Migration for Job Assignment Functionality
-- This migration adds support for job acceptance, worker hourly rates, and updated job statuses

-- 1. Add hourly_rate to workers table
ALTER TABLE workers ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0.00;

-- 2. Update job_status enum to match new requirements
-- First, create new enum type
CREATE TYPE job_status_new AS ENUM ('open', 'scheduling', 'scheduled', 'in_progress', 'complete');

-- Update existing jobs to use new status values
UPDATE jobs SET status = 'complete' WHERE status = 'completed';
UPDATE jobs SET status = 'open' WHERE status = 'paid';

-- Change the column type
ALTER TABLE jobs ALTER COLUMN status TYPE job_status_new USING status::text::job_status_new;

-- Drop old enum and rename new one
DROP TYPE job_status;
ALTER TYPE job_status_new RENAME TO job_status;

-- 3. Add assignment tracking fields to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS assigned_worker_id TEXT REFERENCES workers(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS assignment_date TIMESTAMP;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS assignment_type TEXT DEFAULT 'manual_assign'; -- 'self_assign', 'manual_assign', 'auto_assign'

-- 4. Add index for better performance on job queries
CREATE INDEX IF NOT EXISTS idx_jobs_status_company ON jobs(status, company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_worker ON jobs(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);

-- 5. Add some sample data for testing
-- Update existing workers with sample hourly rates
UPDATE workers SET hourly_rate = 25.00 WHERE hourly_rate = 0.00 OR hourly_rate IS NULL;

-- Update some existing jobs to be assigned for testing
UPDATE jobs 
SET assigned_worker_id = (SELECT id FROM workers LIMIT 1),
    assignment_date = NOW(),
    status = 'scheduled'
WHERE status = 'open' 
LIMIT 2;

-- 6. Create a view for easier job queries
CREATE OR REPLACE VIEW job_summary AS
SELECT 
    j.id,
    j.company_id,
    j.title,
    j.description,
    j.status,
    j.scheduled_date,
    j.scheduled_time,
    j.estimated_duration,
    j.base_price,
    j.minimum_price,
    j.location_address,
    j.assigned_worker_id,
    j.assignment_date,
    j.assignment_type,
    j.appointment_type_id,
    at.name as appointment_type_name,
    at.base_duration,
    w.hourly_rate,
    CASE 
        WHEN w.hourly_rate > 0 AND j.estimated_duration > 0 
        THEN (w.hourly_rate * j.estimated_duration / 60.0)
        ELSE j.base_price 
    END as calculated_pay,
    c.first_name as customer_first_name,
    c.last_name as customer_last_name,
    j.created_at,
    j.updated_at
FROM jobs j
LEFT JOIN appointment_types at ON j.appointment_type_id = at.id
LEFT JOIN workers w ON j.assigned_worker_id = w.id
LEFT JOIN customers c ON j.customer_id = c.id;

-- 7. Create function to calculate job pay
CREATE OR REPLACE FUNCTION calculate_job_pay(job_id TEXT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    job_duration INTEGER;
    worker_rate DECIMAL(10,2);
    calculated_pay DECIMAL(10,2);
BEGIN
    SELECT j.estimated_duration, w.hourly_rate
    INTO job_duration, worker_rate
    FROM jobs j
    LEFT JOIN workers w ON j.assigned_worker_id = w.id
    WHERE j.id = job_id;
    
    IF job_duration IS NULL OR worker_rate IS NULL OR worker_rate = 0 THEN
        RETURN NULL;
    END IF;
    
    calculated_pay := (worker_rate * job_duration / 60.0);
    RETURN calculated_pay;
END;
$$ LANGUAGE plpgsql;
