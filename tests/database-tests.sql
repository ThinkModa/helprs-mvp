-- =====================================================
-- HELPRS DATABASE TEST SUITE
-- Tests for MVP functionality and multi-tenant isolation
-- =====================================================

-- Enable UUID extension for testing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. COMPANY CREATION AND ISOLATION TESTS
-- =====================================================

-- Test 1.1: Create test companies
INSERT INTO companies (id, name, domain, subscription_tier, created_at, updated_at)
VALUES 
  ('test-company-1', 'Test Company 1', 'test1.helprs.com', 'full_platform', NOW(), NOW()),
  ('test-company-2', 'Test Company 2', 'test2.helprs.com', 'scheduling_only', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test 1.2: Create test users for different companies
INSERT INTO users (id, email, first_name, last_name, role, company_id, created_at, updated_at)
VALUES 
  -- Company 1 users
  ('test-admin-1', 'admin1@testcompany1.com', 'Admin', 'One', 'org_admin', 'test-company-1', NOW(), NOW()),
  ('test-worker-1', 'worker1@testcompany1.com', 'Worker', 'One', 'worker', 'test-company-1', NOW(), NOW()),
  ('test-worker-2', 'worker2@testcompany1.com', 'Worker', 'Two', 'worker', 'test-company-1', NOW(), NOW()),
  
  -- Company 2 users
  ('test-admin-2', 'admin2@testcompany2.com', 'Admin', 'Two', 'org_admin', 'test-company-2', NOW(), NOW()),
  ('test-worker-3', 'worker3@testcompany2.com', 'Worker', 'Three', 'worker', 'test-company-2', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test 1.3: Verify company isolation - Company 1 should only see their data
-- (This would be tested with RLS policies in real application)

-- =====================================================
-- 2. USER AUTHENTICATION AND ROLES TESTS
-- =====================================================

-- Test 2.1: Create worker roles for Company 1
INSERT INTO worker_roles (id, name, company_id, created_at, updated_at)
VALUES 
  ('role-1', 'Lead Worker', 'test-company-1', NOW(), NOW()),
  ('role-2', 'General Worker', 'test-company-1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test 2.2: Assign roles to workers
INSERT INTO workers (id, user_id, company_id, phone, hourly_rate, is_lead, created_at, updated_at)
VALUES 
  ('worker-1', 'test-worker-1', 'test-company-1', '+1234567890', 25.00, true, NOW(), NOW()),
  ('worker-2', 'test-worker-2', 'test-company-1', '+1234567891', 20.00, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test 2.3: Assign workers to roles
INSERT INTO worker_role_assignments (worker_id, role_id, created_at)
VALUES 
  ('worker-1', 'role-1', NOW()),
  ('worker-2', 'role-2', NOW())
ON CONFLICT (worker_id, role_id) DO NOTHING;

-- =====================================================
-- 3. WORKER MANAGEMENT TESTS
-- =====================================================

-- Test 3.1: Set worker availability
INSERT INTO worker_availability (id, worker_id, day_of_week, start_time, end_time, is_available, created_at, updated_at)
VALUES 
  ('avail-1', 'worker-1', 1, '08:00:00', '17:00:00', true, NOW(), NOW()),  -- Monday
  ('avail-2', 'worker-1', 2, '08:00:00', '17:00:00', true, NOW(), NOW()),  -- Tuesday
  ('avail-3', 'worker-2', 1, '09:00:00', '18:00:00', true, NOW(), NOW()),  -- Monday
  ('avail-4', 'worker-2', 2, '09:00:00', '18:00:00', true, NOW(), NOW())   -- Tuesday
ON CONFLICT (id) DO NOTHING;

-- Test 3.2: Create customers
INSERT INTO customers (id, company_id, first_name, last_name, email, phone, address, created_at, updated_at)
VALUES 
  ('customer-1', 'test-company-1', 'John', 'Doe', 'john@example.com', '+1987654321', '123 Main St, City, State', NOW(), NOW()),
  ('customer-2', 'test-company-1', 'Jane', 'Smith', 'jane@example.com', '+1987654322', '456 Oak Ave, City, State', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. JOB SCHEDULING TESTS
-- =====================================================

-- Test 4.1: Create calendars
INSERT INTO calendars (id, name, company_id, created_at, updated_at)
VALUES 
  ('calendar-1', 'Main Location', 'test-company-1', NOW(), NOW()),
  ('calendar-2', 'Secondary Location', 'test-company-1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test 4.2: Create appointment types
INSERT INTO appointment_types (id, name, calendar_id, base_duration_minutes, base_price, created_at, updated_at)
VALUES 
  ('apt-type-1', 'House Cleaning', 'calendar-1', 120, 150.00, NOW(), NOW()),
  ('apt-type-2', 'Deep Cleaning', 'calendar-1', 240, 300.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test 4.3: Create forms
INSERT INTO forms (id, name, company_id, created_at, updated_at)
VALUES 
  ('form-1', 'Cleaning Checklist', 'test-company-1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test 4.4: Create form fields
INSERT INTO form_fields (id, form_id, field_type, label, is_required, field_order, created_at, updated_at)
VALUES 
  ('field-1', 'form-1', 'short_text', 'Customer Name', true, 1, NOW(), NOW()),
  ('field-2', 'form-1', 'long_text', 'Special Instructions', false, 2, NOW(), NOW()),
  ('field-3', 'form-1', 'yes_no', 'Pets Present', true, 3, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test 4.5: Attach form to appointment type
INSERT INTO appointment_type_forms (appointment_type_id, form_id, created_at)
VALUES ('apt-type-1', 'form-1', NOW())
ON CONFLICT (appointment_type_id, form_id) DO NOTHING;

-- Test 4.6: Create jobs
INSERT INTO jobs (id, company_id, customer_id, appointment_type_id, scheduled_start, scheduled_end, status, base_price, created_at, updated_at)
VALUES 
  ('job-1', 'test-company-1', 'customer-1', 'apt-type-1', 
   NOW() + INTERVAL '1 day', 
   NOW() + INTERVAL '1 day' + INTERVAL '2 hours', 
   'scheduled', 150.00, NOW(), NOW()),
  
  ('job-2', 'test-company-1', 'customer-2', 'apt-type-2', 
   NOW() + INTERVAL '2 days', 
   NOW() + INTERVAL '2 days' + INTERVAL '4 hours', 
   'open', 300.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test 4.7: Assign workers to jobs
INSERT INTO job_workers (job_id, worker_id, is_lead, created_at)
VALUES 
  ('job-1', 'worker-1', true, NOW()),
  ('job-1', 'worker-2', false, NOW()),
  ('job-2', 'worker-1', true, NOW())
ON CONFLICT (job_id, worker_id) DO NOTHING;

-- =====================================================
-- 5. PAYMENT WORKFLOW TESTS
-- =====================================================

-- Test 5.1: Create time entries (simulating clock in/out)
INSERT INTO time_entries (id, job_id, worker_id, clock_in, clock_out, hours_worked, hourly_rate, total_pay, created_at, updated_at)
VALUES 
  ('time-1', 'job-1', 'worker-1', 
   NOW() + INTERVAL '1 day' + INTERVAL '30 minutes', 
   NOW() + INTERVAL '1 day' + INTERVAL '2 hours' + INTERVAL '30 minutes', 
   2.0, 25.00, 50.00, NOW(), NOW()),
  
  ('time-2', 'job-1', 'worker-2', 
   NOW() + INTERVAL '1 day' + INTERVAL '30 minutes', 
   NOW() + INTERVAL '1 day' + INTERVAL '2 hours' + INTERVAL '30 minutes', 
   2.0, 20.00, 40.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test 5.2: Create payments
INSERT INTO payments (id, job_id, worker_id, amount, payment_type, status, stripe_payment_intent_id, created_at, updated_at)
VALUES 
  ('payment-1', 'job-1', 'worker-1', 50.00, 'worker_payout', 'pending', 'pi_test_1', NOW(), NOW()),
  ('payment-2', 'job-1', 'worker-2', 40.00, 'worker_payout', 'pending', 'pi_test_2', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test 5.3: Create customer payment
INSERT INTO payments (id, job_id, customer_id, amount, payment_type, status, stripe_payment_intent_id, created_at, updated_at)
VALUES 
  ('payment-3', 'job-1', 'customer-1', 150.00, 'customer_payment', 'completed', 'pi_test_3', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. RATING SYSTEM TESTS
-- =====================================================

-- Test 6.1: Create ratings
INSERT INTO ratings (id, job_id, from_user_id, to_user_id, rating_type, communication_rating, professionalism_rating, timeliness_rating, overall_rating, comments, created_at, updated_at)
VALUES 
  -- Worker rating customer
  ('rating-1', 'job-1', 'test-worker-1', 'customer-1', 'worker_to_customer', 5, 5, 5, 5, 'Great customer!', NOW(), NOW()),
  
  -- Customer rating worker
  ('rating-2', 'job-1', 'customer-1', 'test-worker-1', 'customer_to_worker', 5, 5, 5, 5, 'Excellent work!', NOW(), NOW()),
  
  -- Worker rating worker
  ('rating-3', 'job-1', 'test-worker-1', 'test-worker-2', 'worker_to_worker', 5, 5, 5, 5, 'Great teamwork!', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Verify company isolation
SELECT 'Company 1 Users:' as test_name, COUNT(*) as count FROM users WHERE company_id = 'test-company-1'
UNION ALL
SELECT 'Company 2 Users:' as test_name, COUNT(*) as count FROM users WHERE company_id = 'test-company-2';

-- Verify worker assignments
SELECT 'Workers assigned to Job 1:' as test_name, COUNT(*) as count FROM job_workers WHERE job_id = 'job-1';

-- Verify payment workflow
SELECT 'Pending worker payments:' as test_name, COUNT(*) as count FROM payments WHERE payment_type = 'worker_payout' AND status = 'pending';

-- Verify ratings
SELECT 'Total ratings created:' as test_name, COUNT(*) as count FROM ratings;

-- Verify multi-tenant data separation
SELECT 
  'Company 1 Jobs:' as test_name, COUNT(*) as count 
FROM jobs j 
JOIN companies c ON j.company_id = c.id 
WHERE c.id = 'test-company-1'
UNION ALL
SELECT 
  'Company 2 Jobs:' as test_name, COUNT(*) as count 
FROM jobs j 
JOIN companies c ON j.company_id = c.id 
WHERE c.id = 'test-company-2';

-- =====================================================
-- 8. CLEANUP (Optional - for testing)
-- =====================================================

-- Uncomment to clean up test data
/*
DELETE FROM ratings WHERE job_id IN ('job-1', 'job-2');
DELETE FROM payments WHERE job_id IN ('job-1', 'job-2');
DELETE FROM time_entries WHERE job_id IN ('job-1', 'job-2');
DELETE FROM job_workers WHERE job_id IN ('job-1', 'job-2');
DELETE FROM jobs WHERE id IN ('job-1', 'job-2');
DELETE FROM appointment_type_forms WHERE appointment_type_id IN ('apt-type-1', 'apt-type-2');
DELETE FROM form_fields WHERE form_id = 'form-1';
DELETE FROM forms WHERE id = 'form-1';
DELETE FROM appointment_types WHERE id IN ('apt-type-1', 'apt-type-2');
DELETE FROM calendars WHERE id IN ('calendar-1', 'calendar-2');
DELETE FROM customers WHERE id IN ('customer-1', 'customer-2');
DELETE FROM worker_availability WHERE worker_id IN ('worker-1', 'worker-2');
DELETE FROM worker_role_assignments WHERE worker_id IN ('worker-1', 'worker-2');
DELETE FROM workers WHERE id IN ('worker-1', 'worker-2');
DELETE FROM worker_roles WHERE id IN ('role-1', 'role-2');
DELETE FROM users WHERE id IN ('test-admin-1', 'test-worker-1', 'test-worker-2', 'test-admin-2', 'test-worker-3');
DELETE FROM companies WHERE id IN ('test-company-1', 'test-company-2');
*/

