-- =====================================================
-- HELPRS DATABASE SEED DATA
-- Tests for MVP functionality and multi-tenant isolation
-- =====================================================

-- =====================================================
-- 1. COMPANY CREATION AND ISOLATION TESTS
-- =====================================================

-- Test 1.1: Create test companies
INSERT INTO companies (id, name, subdomain, subscription_tier, created_at, updated_at)
VALUES 
  ('test-company-1', 'Test Company 1', 'test1', 'pro', NOW(), NOW()),
  ('test-company-2', 'Test Company 2', 'test2', 'basic', NOW(), NOW());

-- Test 1.2: Create test users for different companies
INSERT INTO users (id, email, first_name, last_name, role, company_id, created_at, updated_at)
VALUES 
  -- Company 1 users
  ('test-admin-1', 'admin1@testcompany1.com', 'Admin', 'One', 'ORG_ADMIN', 'test-company-1', NOW(), NOW()),
  ('test-worker-1', 'worker1@testcompany1.com', 'Worker', 'One', 'WORKER', 'test-company-1', NOW(), NOW()),
  ('test-worker-2', 'worker2@testcompany1.com', 'Worker', 'Two', 'WORKER', 'test-company-1', NOW(), NOW()),
  
  -- Company 2 users
  ('test-admin-2', 'admin2@testcompany2.com', 'Admin', 'Two', 'ORG_ADMIN', 'test-company-2', NOW(), NOW()),
  ('test-worker-3', 'worker3@testcompany2.com', 'Worker', 'Three', 'WORKER', 'test-company-2', NOW(), NOW());

-- =====================================================
-- 2. USER AUTHENTICATION AND ROLES TESTS
-- =====================================================

-- Test 2.1: Create worker roles for Company 1
INSERT INTO worker_roles (id, name, company_id, hourly_rate, created_at, updated_at)
VALUES 
  ('role-1', 'Lead Worker', 'test-company-1', 25.00, NOW(), NOW()),
  ('role-2', 'General Worker', 'test-company-1', 20.00, NOW(), NOW());

-- Test 2.2: Create workers
INSERT INTO workers (id, user_id, company_id, phone, is_lead, created_at, updated_at)
VALUES 
  ('worker-1', 'test-worker-1', 'test-company-1', '+1234567890', true, NOW(), NOW()),
  ('worker-2', 'test-worker-2', 'test-company-1', '+1234567891', false, NOW(), NOW());

-- =====================================================
-- 3. WORKER MANAGEMENT TESTS
-- =====================================================

-- Test 3.1: Set worker availability
INSERT INTO worker_availability (id, worker_id, date, is_available, created_at, updated_at)
VALUES 
  ('avail-1', 'worker-1', CURRENT_DATE + INTERVAL '1 day', true, NOW(), NOW()),  -- Tomorrow
  ('avail-2', 'worker-1', CURRENT_DATE + INTERVAL '2 days', true, NOW(), NOW()), -- Day after tomorrow
  ('avail-3', 'worker-2', CURRENT_DATE + INTERVAL '1 day', true, NOW(), NOW()),  -- Tomorrow
  ('avail-4', 'worker-2', CURRENT_DATE + INTERVAL '2 days', true, NOW(), NOW()); -- Day after tomorrow

-- Test 3.2: Create customers
INSERT INTO customers (id, company_id, first_name, last_name, email, phone, address, created_at, updated_at)
VALUES 
  ('customer-1', 'test-company-1', 'John', 'Doe', 'john@example.com', '+1987654321', '123 Main St, City, State', NOW(), NOW()),
  ('customer-2', 'test-company-1', 'Jane', 'Smith', 'jane@example.com', '+1987654322', '456 Oak Ave, City, State', NOW(), NOW());

-- =====================================================
-- 4. JOB SCHEDULING TESTS
-- =====================================================

-- Test 4.1: Create calendars
INSERT INTO calendars (id, name, company_id, created_at, updated_at)
VALUES 
  ('calendar-1', 'Main Location', 'test-company-1', NOW(), NOW()),
  ('calendar-2', 'Secondary Location', 'test-company-1', NOW(), NOW());

-- Test 4.2: Create appointment types
INSERT INTO appointment_types (id, name, company_id, base_duration, base_price, assignment_type, created_at, updated_at)
VALUES 
  ('apt-type-1', 'House Cleaning', 'test-company-1', 120, 150.00, 'manual_assign', NOW(), NOW()),
  ('apt-type-2', 'Deep Cleaning', 'test-company-1', 240, 300.00, 'auto_assign', NOW(), NOW());

-- Test 4.3: Create forms
INSERT INTO forms (id, name, company_id, created_at, updated_at)
VALUES 
  ('form-1', 'Cleaning Checklist', 'test-company-1', NOW(), NOW());

-- Test 4.4: Create form fields
INSERT INTO form_fields (id, form_id, field_type, label, required, order_index, created_at)
VALUES 
  ('field-1', 'form-1', 'textbox', 'Customer Name', true, 1, NOW()),
  ('field-2', 'form-1', 'textbox', 'Special Instructions', false, 2, NOW()),
  ('field-3', 'form-1', 'yes_no', 'Pets Present', true, 3, NOW());

-- Test 4.5: Create many-to-many relationships
INSERT INTO appointment_type_calendars (appointment_type_id, calendar_id)
VALUES 
  ('apt-type-1', 'calendar-1'),
  ('apt-type-2', 'calendar-1');

INSERT INTO appointment_type_forms (appointment_type_id, form_id)
VALUES 
  ('apt-type-1', 'form-1');

-- Test 4.6: Create jobs
INSERT INTO jobs (id, company_id, customer_id, calendar_id, appointment_type_id, title, scheduled_date, scheduled_time, status, base_price, created_at, updated_at)
VALUES 
  ('job-1', 'test-company-1', 'customer-1', 'calendar-1', 'apt-type-1', 
   'House Cleaning for John Doe', 
   CURRENT_DATE + INTERVAL '1 day', 
   '09:00:00', 
   'scheduled', 150.00, NOW(), NOW()),
  
  ('job-2', 'test-company-1', 'customer-2', 'calendar-1', 'apt-type-2', 
   'Deep Cleaning for Jane Smith', 
   CURRENT_DATE + INTERVAL '2 days', 
   '10:00:00', 
   'open', 300.00, NOW(), NOW());

-- Test 4.7: Assign workers to jobs
INSERT INTO job_workers (job_id, worker_id, is_lead, hourly_rate, assigned_at)
VALUES 
  ('job-1', 'worker-1', true, 25.00, NOW()),
  ('job-1', 'worker-2', false, 20.00, NOW()),
  ('job-2', 'worker-1', true, 25.00, NOW());

-- =====================================================
-- 5. PAYMENT WORKFLOW TESTS
-- =====================================================

-- Test 5.1: Create time entries (simulating clock in/out)
INSERT INTO time_entries (id, job_id, worker_id, clock_in, clock_out, hours_worked, created_at)
VALUES 
  ('time-1', 'job-1', 'worker-1', 
   NOW() + INTERVAL '1 day' + INTERVAL '30 minutes', 
   NOW() + INTERVAL '1 day' + INTERVAL '2 hours' + INTERVAL '30 minutes', 
   2.0, NOW()),
  
  ('time-2', 'job-1', 'worker-2', 
   NOW() + INTERVAL '1 day' + INTERVAL '30 minutes', 
   NOW() + INTERVAL '1 day' + INTERVAL '2 hours' + INTERVAL '30 minutes', 
   2.0, NOW());

-- Test 5.2: Create worker payments
INSERT INTO payments (id, job_id, worker_id, amount, payment_type, status, stripe_payment_intent_id, created_at, updated_at)
VALUES 
  ('payment-1', 'job-1', 'worker-1', 50.00, 'worker_payout', 'pending', 'pi_test_1', NOW(), NOW()),
  ('payment-2', 'job-1', 'worker-2', 40.00, 'worker_payout', 'pending', 'pi_test_2', NOW(), NOW());

-- Note: Customer payments would be handled differently - they don't have a customer_id field
-- The payments table only has worker_id, so customer payments would be tracked differently

-- =====================================================
-- 6. RATING SYSTEM TESTS
-- =====================================================

-- Test 6.1: Create ratings (worker to worker only)
INSERT INTO ratings (id, job_id, from_worker_id, to_worker_id, rating_type, communication_rating, professionalism_rating, timeliness_rating, overall_rating, comments, created_at)
VALUES 
  ('rating-1', 'job-1', 'worker-1', 'worker-2', 'worker_to_worker', 5, 5, 5, 5, 'Great teamwork!', NOW());

-- =====================================================
-- 7. VERIFICATION QUERIES (for testing)
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
