-- Add Performance Indexes for Helprs MVP
-- Migration: 20250115000000_add_performance_indexes.sql
-- Based on actual schema from 20250814175323_initial_schema.sql

-- ============================================================================
-- COMPANY-BASED QUERIES (Multi-tenant isolation)
-- ============================================================================

-- Users table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_company_role ON users(company_id, role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Workers table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_workers_company_user ON workers(company_id, user_id);
CREATE INDEX IF NOT EXISTS idx_workers_is_lead ON workers(is_lead);
CREATE INDEX IF NOT EXISTS idx_workers_points ON workers(points DESC);
CREATE INDEX IF NOT EXISTS idx_workers_background_check ON workers(background_check_status);

-- Customers table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_company_email ON customers(company_id, email);

-- Calendars table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_calendars_is_active ON calendars(is_active);
CREATE INDEX IF NOT EXISTS idx_calendars_created_by ON calendars(created_by);

-- Worker roles table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_worker_roles_hourly_rate ON worker_roles(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_worker_roles_is_active ON worker_roles(is_active);

-- Worker calendar assignments table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_worker_calendar_assignments_is_active ON worker_calendar_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_worker_calendar_assignments_assigned_at ON worker_calendar_assignments(assigned_at);

-- Forms table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_forms_is_active ON forms(is_active);
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);

-- Form fields table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_form_fields_order ON form_fields(form_id, order_index);
CREATE INDEX IF NOT EXISTS idx_form_fields_required ON form_fields(required);

-- Appointment types table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_appointment_types_company_id ON appointment_types(company_id);
CREATE INDEX IF NOT EXISTS idx_appointment_types_form_id ON appointment_types(form_id);
CREATE INDEX IF NOT EXISTS idx_appointment_types_is_active ON appointment_types(is_active);
CREATE INDEX IF NOT EXISTS idx_appointment_types_base_duration ON appointment_types(base_duration);
CREATE INDEX IF NOT EXISTS idx_appointment_types_minimum_price ON appointment_types(minimum_price);

-- ============================================================================
-- JOB SCHEDULING AND MANAGEMENT
-- ============================================================================

-- Jobs table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_appointment_type_id ON jobs(appointment_type_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON jobs(company_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_datetime ON jobs(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_jobs_company_scheduled ON jobs(company_id, scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_jobs_form_id ON jobs(form_id);

-- Job workers table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_job_workers_assigned_at ON job_workers(assigned_at);
CREATE INDEX IF NOT EXISTS idx_job_workers_job_worker ON job_workers(job_id, worker_id);
CREATE INDEX IF NOT EXISTS idx_job_workers_is_lead ON job_workers(is_lead);
CREATE INDEX IF NOT EXISTS idx_job_workers_hourly_rate ON job_workers(hourly_rate);

-- ============================================================================
-- TIME TRACKING AND PAYMENTS
-- ============================================================================

-- Time entries table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_out ON time_entries(clock_out);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_worker ON time_entries(job_id, worker_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date_range ON time_entries(clock_in, clock_out);
CREATE INDEX IF NOT EXISTS idx_time_entries_hours_worked ON time_entries(hours_worked);

-- Payments table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_job_worker ON payments(job_id, worker_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount);

-- ============================================================================
-- RATINGS AND FEEDBACK
-- ============================================================================

-- Ratings table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_ratings_from_worker_id ON ratings(from_worker_id);
CREATE INDEX IF NOT EXISTS idx_ratings_to_worker_id ON ratings(to_worker_id);
CREATE INDEX IF NOT EXISTS idx_ratings_customer_id ON ratings(customer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rating_type ON ratings(rating_type);
CREATE INDEX IF NOT EXISTS idx_ratings_overall_rating ON ratings(overall_rating);
CREATE INDEX IF NOT EXISTS idx_ratings_communication_rating ON ratings(communication_rating);
CREATE INDEX IF NOT EXISTS idx_ratings_professionalism_rating ON ratings(professionalism_rating);
CREATE INDEX IF NOT EXISTS idx_ratings_timeliness_rating ON ratings(timeliness_rating);
CREATE INDEX IF NOT EXISTS idx_ratings_job_from ON ratings(job_id, from_worker_id);
CREATE INDEX IF NOT EXISTS idx_ratings_job_to ON ratings(job_id, to_worker_id);

-- ============================================================================
-- FORM RESPONSES
-- ============================================================================

-- Form responses table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_job_form ON form_responses(job_id, form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_by ON form_responses(submitted_by);
CREATE INDEX IF NOT EXISTS idx_form_responses_created_at ON form_responses(created_at);

-- ============================================================================
-- AVAILABILITY MANAGEMENT
-- ============================================================================

-- Worker availability table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_worker_availability_worker_date ON worker_availability(worker_id, date);
CREATE INDEX IF NOT EXISTS idx_worker_availability_is_available ON worker_availability(is_available);

-- Availability time blocks table indexes (already exist, but adding additional ones)
CREATE INDEX IF NOT EXISTS idx_availability_time_blocks_start_time ON availability_time_blocks(start_time);
CREATE INDEX IF NOT EXISTS idx_availability_time_blocks_end_time ON availability_time_blocks(end_time);
CREATE INDEX IF NOT EXISTS idx_availability_time_blocks_is_available ON availability_time_blocks(is_available);

-- Company availability settings table indexes
CREATE INDEX IF NOT EXISTS idx_company_availability_settings_company_id ON company_availability_settings(company_id);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- Multi-table joins for job management
CREATE INDEX IF NOT EXISTS idx_jobs_company_calendar_status ON jobs(company_id, calendar_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_company_customer_status ON jobs(company_id, customer_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_company_appointment_status ON jobs(company_id, appointment_type_id, status);

-- Worker assignment queries
CREATE INDEX IF NOT EXISTS idx_job_workers_worker_status ON job_workers(worker_id, job_id);
CREATE INDEX IF NOT EXISTS idx_workers_company_lead ON workers(company_id, is_lead);

-- Payment processing queries
CREATE INDEX IF NOT EXISTS idx_payments_job_status ON payments(job_id, status);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_worker_date ON time_entries(job_id, worker_id, clock_in);

-- Rating aggregation queries
CREATE INDEX IF NOT EXISTS idx_ratings_job_rating ON ratings(job_id, overall_rating);
CREATE INDEX IF NOT EXISTS idx_ratings_worker_rating ON ratings(to_worker_id, overall_rating);

-- Calendar and appointment queries
CREATE INDEX IF NOT EXISTS idx_appointment_types_calendar_active ON appointment_types(calendar_id, is_active);
CREATE INDEX IF NOT EXISTS idx_worker_calendar_assignments_worker_active ON worker_calendar_assignments(worker_id, is_active);

-- ============================================================================
-- FULL-TEXT SEARCH INDEXES
-- ============================================================================

-- Enable full-text search on job descriptions
CREATE INDEX IF NOT EXISTS idx_jobs_description_fts ON jobs USING gin(to_tsvector('english', description));

-- Enable full-text search on customer names
CREATE INDEX IF NOT EXISTS idx_customers_name_fts ON customers USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- Enable full-text search on worker names (via users table)
CREATE INDEX IF NOT EXISTS idx_users_name_fts ON users USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- Enable full-text search on company names
CREATE INDEX IF NOT EXISTS idx_companies_name_fts ON companies USING gin(to_tsvector('english', name));

-- ============================================================================
-- PARTIAL INDEXES FOR OPTIMIZATION
-- ============================================================================

-- Only index active jobs
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(company_id, scheduled_date) WHERE status IN ('open', 'scheduling', 'scheduled', 'in_progress');

-- Only index pending payments
CREATE INDEX IF NOT EXISTS idx_payments_pending ON payments(job_id, worker_id) WHERE status = 'pending';

-- Only index clocked-in time entries
CREATE INDEX IF NOT EXISTS idx_time_entries_active ON time_entries(job_id, worker_id) WHERE clock_out IS NULL;

-- Only index lead workers
CREATE INDEX IF NOT EXISTS idx_workers_leads ON workers(company_id, id) WHERE is_lead = true;

-- Only index active users
CREATE INDEX IF NOT EXISTS idx_users_active ON users(company_id, role) WHERE is_active = true;

-- Only index active calendars
CREATE INDEX IF NOT EXISTS idx_calendars_active ON calendars(company_id, id) WHERE is_active = true;

-- ============================================================================
-- UNIQUE INDEXES FOR DATA INTEGRITY
-- ============================================================================

-- Ensure unique subdomains per company (already exists in schema)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_subdomain_unique ON companies(subdomain);

-- Ensure unique emails per user (already exists in schema)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);

-- ============================================================================
-- INDEX MAINTENANCE FUNCTION
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
    'time_entries', 'payments', 'ratings', 'forms', 'form_fields',
    'calendars', 'appointment_types', 'worker_roles', 'worker_calendar_assignments'
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
COMMENT ON INDEX idx_workers_leads IS 'Optimizes queries for lead workers';
COMMENT ON INDEX idx_time_entries_active IS 'Optimizes queries for active time entries';
