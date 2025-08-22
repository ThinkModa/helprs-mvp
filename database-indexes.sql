-- Helprs MVP Database Indexes for Performance
-- This script creates all necessary indexes for optimal query performance

-- ============================================================================
-- COMPANY-BASED QUERIES (Multi-tenant isolation)
-- ============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_company_role ON users(company_id, role);

-- Workers table indexes
CREATE INDEX IF NOT EXISTS idx_workers_company_id ON workers(company_id);
CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_company_user ON workers(company_id, user_id);
CREATE INDEX IF NOT EXISTS idx_workers_is_lead ON workers(is_lead);
CREATE INDEX IF NOT EXISTS idx_workers_points ON workers(points DESC);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_company_email ON customers(company_id, email);

-- Calendars table indexes
CREATE INDEX IF NOT EXISTS idx_calendars_company_id ON calendars(company_id);

-- Worker roles table indexes
CREATE INDEX IF NOT EXISTS idx_worker_roles_company_id ON worker_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_worker_roles_hourly_rate ON worker_roles(hourly_rate);

-- Forms table indexes
CREATE INDEX IF NOT EXISTS idx_forms_company_id ON forms(company_id);

-- Form fields table indexes
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_order ON form_fields(form_id, order_index);

-- Appointment types table indexes
CREATE INDEX IF NOT EXISTS idx_appointment_types_calendar_id ON appointment_types(calendar_id);
CREATE INDEX IF NOT EXISTS idx_appointment_types_form_id ON appointment_types(form_id);

-- ============================================================================
-- JOB SCHEDULING AND MANAGEMENT
-- ============================================================================

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_calendar_id ON jobs(calendar_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON jobs(company_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_datetime ON jobs(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_jobs_company_scheduled ON jobs(company_id, scheduled_date, status);

-- Job workers table indexes
CREATE INDEX IF NOT EXISTS idx_job_workers_job_id ON job_workers(job_id);
CREATE INDEX IF NOT EXISTS idx_job_workers_worker_id ON job_workers(worker_id);
CREATE INDEX IF NOT EXISTS idx_job_workers_assigned_at ON job_workers(assigned_at);
CREATE INDEX IF NOT EXISTS idx_job_workers_job_worker ON job_workers(job_id, worker_id);

-- ============================================================================
-- TIME TRACKING AND PAYMENTS
-- ============================================================================

-- Time entries table indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_worker_id ON time_entries(worker_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_out ON time_entries(clock_out);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_worker ON time_entries(job_id, worker_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date_range ON time_entries(clock_in, clock_out);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_job_id ON payments(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_worker_id ON payments(worker_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_job_worker ON payments(job_id, worker_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- ============================================================================
-- RATINGS AND FEEDBACK
-- ============================================================================

-- Ratings table indexes
CREATE INDEX IF NOT EXISTS idx_ratings_job_id ON ratings(job_id);
CREATE INDEX IF NOT EXISTS idx_ratings_from_worker_id ON ratings(from_worker_id);
CREATE INDEX IF NOT EXISTS idx_ratings_to_worker_id ON ratings(to_worker_id);
CREATE INDEX IF NOT EXISTS idx_ratings_customer_id ON ratings(customer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rating ON ratings(rating);
CREATE INDEX IF NOT EXISTS idx_ratings_job_from ON ratings(job_id, from_worker_id);
CREATE INDEX IF NOT EXISTS idx_ratings_job_to ON ratings(job_id, to_worker_id);

-- ============================================================================
-- FORM RESPONSES
-- ============================================================================

-- Form responses table indexes
CREATE INDEX IF NOT EXISTS idx_form_responses_job_id ON form_responses(job_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_job_form ON form_responses(job_id, form_id);

-- ============================================================================
-- AVAILABILITY MANAGEMENT
-- ============================================================================

-- Worker availability table indexes
CREATE INDEX IF NOT EXISTS idx_worker_availability_worker_id ON worker_availability(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_availability_date ON worker_availability(date);
CREATE INDEX IF NOT EXISTS idx_worker_availability_worker_date ON worker_availability(worker_id, date);

-- Availability time blocks table indexes
CREATE INDEX IF NOT EXISTS idx_availability_time_blocks_availability_id ON availability_time_blocks(worker_availability_id);
CREATE INDEX IF NOT EXISTS idx_availability_time_blocks_start_time ON availability_time_blocks(start_time);
CREATE INDEX IF NOT EXISTS idx_availability_time_blocks_end_time ON availability_time_blocks(end_time);

-- ============================================================================
-- COMPANY AVAILABILITY SETTINGS
-- ============================================================================

-- Company availability settings table indexes
CREATE INDEX IF NOT EXISTS idx_company_availability_settings_company_id ON company_availability_settings(company_id);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- Multi-table joins for job management
CREATE INDEX IF NOT EXISTS idx_jobs_company_calendar_status ON jobs(company_id, calendar_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_company_customer_status ON jobs(company_id, customer_id, status);

-- Worker assignment queries
CREATE INDEX IF NOT EXISTS idx_job_workers_worker_status ON job_workers(worker_id, job_id);
CREATE INDEX IF NOT EXISTS idx_workers_company_lead ON workers(company_id, is_lead);

-- Payment processing queries
CREATE INDEX IF NOT EXISTS idx_payments_job_status ON payments(job_id, status);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_worker_date ON time_entries(job_id, worker_id, clock_in);

-- Rating aggregation queries
CREATE INDEX IF NOT EXISTS idx_ratings_job_rating ON ratings(job_id, rating);
CREATE INDEX IF NOT EXISTS idx_ratings_worker_rating ON ratings(to_worker_id, rating);

-- ============================================================================
-- FULL-TEXT SEARCH INDEXES
-- ============================================================================

-- Enable full-text search on job descriptions
CREATE INDEX IF NOT EXISTS idx_jobs_description_fts ON jobs USING gin(to_tsvector('english', description));

-- Enable full-text search on customer names
CREATE INDEX IF NOT EXISTS idx_customers_name_fts ON customers USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- Enable full-text search on worker names
CREATE INDEX IF NOT EXISTS idx_workers_name_fts ON workers USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- ============================================================================
-- PARTIAL INDEXES FOR OPTIMIZATION
-- ============================================================================

-- Only index active jobs
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(company_id, scheduled_date) WHERE status IN ('open', 'scheduled', 'in_progress');

-- Only index pending payments
CREATE INDEX IF NOT EXISTS idx_payments_pending ON payments(job_id, worker_id) WHERE status = 'pending';

-- Only index clocked-in time entries
CREATE INDEX IF NOT EXISTS idx_time_entries_active ON time_entries(job_id, worker_id) WHERE clock_out IS NULL;

-- Only index lead workers
CREATE INDEX IF NOT EXISTS idx_workers_leads ON workers(company_id, id) WHERE is_lead = true;

-- ============================================================================
-- UNIQUE INDEXES FOR DATA INTEGRITY
-- ============================================================================

-- Ensure unique subdomains per company
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_subdomain_unique ON companies(subdomain);

-- Ensure unique emails per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);

-- Ensure unique worker per job (if needed)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_job_workers_unique ON job_workers(job_id, worker_id);

-- ============================================================================
-- PERFORMANCE MONITORING INDEXES
-- ============================================================================

-- Index for audit trail queries
CREATE INDEX IF NOT EXISTS idx_all_tables_created_at ON (
  SELECT 'users' as table_name, id, created_at FROM users
  UNION ALL
  SELECT 'workers' as table_name, id, created_at FROM workers
  UNION ALL
  SELECT 'jobs' as table_name, id, created_at FROM jobs
  UNION ALL
  SELECT 'payments' as table_name, id, created_at FROM payments
);

-- ============================================================================
-- INDEX MAINTENANCE
-- ============================================================================

-- Create a function to analyze index usage
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE (
  schemaname text,
  tablename text,
  indexname text,
  idx_scan bigint,
  idx_tup_read bigint,
  idx_tup_fetch bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::text,
    tablename::text,
    indexname::text,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEX STATISTICS
-- ============================================================================

-- Display index creation summary
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public' AND tablename IN (
    'users', 'workers', 'customers', 'companies', 'jobs', 
    'time_entries', 'payments', 'ratings', 'forms', 'form_fields'
  );
  
  RAISE NOTICE 'Created % indexes for Helprs MVP database', index_count;
END $$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_users_company_id IS 'Optimizes queries filtering users by company (multi-tenant isolation)';
COMMENT ON INDEX idx_jobs_company_status IS 'Optimizes job listing queries by company and status';
COMMENT ON INDEX idx_payments_job_worker IS 'Optimizes payment queries for specific job-worker combinations';
COMMENT ON INDEX idx_ratings_job_from IS 'Optimizes rating queries for job participants';
COMMENT ON INDEX idx_jobs_description_fts IS 'Enables full-text search on job descriptions';
COMMENT ON INDEX idx_jobs_active IS 'Optimizes queries for active jobs only';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all indexes were created successfully
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'workers', 'customers', 'companies', 'jobs', 'time_entries', 'payments', 'ratings')
ORDER BY tablename, indexname;

-- Check index sizes
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'workers', 'customers', 'companies', 'jobs', 'time_entries', 'payments', 'ratings')
ORDER BY pg_relation_size(indexname::regclass) DESC;



