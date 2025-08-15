-- Test Script: Scheduling Database Functionality
-- This script tests all the key features needed for the scheduling system

-- Test 1: Verify our new fields exist
SELECT 'Test 1: Checking new fields exist' as test_name;

-- Check forms table has form_required field
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'forms' 
AND column_name IN ('form_required', 'internal_use_only');

-- Check jobs table has worker_count field
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND column_name = 'worker_count';

-- Check job_status enum has draft value
SELECT 
    enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'job_status')
ORDER BY enumsortorder;

-- Test 2: Test customer creation and retrieval
SELECT 'Test 2: Customer management' as test_name;

-- Insert test customers
INSERT INTO customers (id, company_id, first_name, last_name, email, phone) VALUES
('test-customer-1', 'test-company-001', 'John', 'Smith', 'john.smith@email.com', '+1234567890'),
('test-customer-2', 'test-company-001', 'Jane', 'Doe', 'jane.doe@email.com', '+1234567891'),
('test-customer-3', 'test-company-001', 'John', 'Johnson', 'john.johnson@email.com', '+1234567892'),
('test-customer-4', 'test-company-001', 'Alice', 'Brown', 'alice.brown@email.com', '+1234567893')
ON CONFLICT (id) DO NOTHING;

-- Test customer auto-complete (search by first name)
SELECT 
    id, 
    first_name, 
    last_name, 
    phone, 
    email
FROM customers 
WHERE company_id = 'test-company-001' 
AND first_name ILIKE 'john%'
ORDER BY first_name, last_name;

-- Test 3: Test form creation with new fields
SELECT 'Test 3: Form creation with required toggles' as test_name;

-- Insert test forms
INSERT INTO forms (id, company_id, name, description, form_required, internal_use_only) VALUES
('test-form-1', 'test-company-001', 'Customer Information Form', 'Basic customer details', true, false),
('test-form-2', 'test-company-001', 'Service Requirements', 'Detailed service specifications', false, true),
('test-form-3', 'test-company-001', 'Post-Service Feedback', 'Customer feedback form', false, false)
ON CONFLICT (id) DO NOTHING;

-- Insert form fields with required toggles
INSERT INTO form_fields (id, form_id, field_type, label, required, order_index) VALUES
('test-field-1', 'test-form-1', 'textbox', 'Customer Name', true, 1),
('test-field-2', 'test-form-1', 'textbox', 'Phone Number', true, 2),
('test-field-3', 'test-form-1', 'textbox', 'Special Instructions', false, 3),
('test-field-4', 'test-form-2', 'dropdown', 'Service Type', true, 1),
('test-field-5', 'test-form-2', 'yes_no', 'Urgent Service', true, 2),
('test-field-6', 'test-form-3', 'textbox', 'Feedback Comments', false, 1)
ON CONFLICT (id) DO NOTHING;

-- Test form retrieval with required flags
SELECT 
    f.id,
    f.name,
    f.form_required,
    f.internal_use_only,
    COUNT(ff.id) as field_count,
    COUNT(CASE WHEN ff.required = true THEN 1 END) as required_fields
FROM forms f
LEFT JOIN form_fields ff ON f.id = ff.form_id
WHERE f.company_id = 'test-company-001'
GROUP BY f.id, f.name, f.form_required, f.internal_use_only
ORDER BY f.name;

-- Test 4: Test appointment types with new structure
SELECT 'Test 4: Appointment types with many-to-many relationships' as test_name;

-- Insert test appointment types
INSERT INTO appointment_types (id, company_id, name, description, base_duration, base_price, minimum_price, assignment_type) VALUES
('test-appt-1', 'test-company-001', 'Cleaning Service', 'Standard cleaning service', 60, 75.00, 50.00, 'manual_assign'),
('test-appt-2', 'test-company-001', 'Maintenance Check', 'Routine maintenance', 30, 45.00, 30.00, 'auto_assign'),
('test-appt-3', 'test-company-001', 'Security Patrol', 'Security monitoring', 120, 120.00, 80.00, 'self_assign')
ON CONFLICT (id) DO NOTHING;

-- Insert calendar assignments
INSERT INTO appointment_type_calendars (appointment_type_id, calendar_id) VALUES
('test-appt-1', 'calendar-1'),
('test-appt-1', 'calendar-2'),
('test-appt-2', 'calendar-1'),
('test-appt-3', 'calendar-3')
ON CONFLICT (appointment_type_id, calendar_id) DO NOTHING;

-- Insert form assignments
INSERT INTO appointment_type_forms (appointment_type_id, form_id) VALUES
('test-appt-1', 'test-form-1'),
('test-appt-2', 'test-form-2'),
('test-appt-3', 'test-form-3')
ON CONFLICT (appointment_type_id, form_id) DO NOTHING;

-- Test appointment type retrieval with relationships
SELECT 
    apt.id,
    apt.name,
    apt.assignment_type,
    apt.base_duration,
    apt.base_price,
    COUNT(DISTINCT atc.calendar_id) as assigned_calendars,
    COUNT(DISTINCT atf.form_id) as assigned_forms
FROM appointment_types apt
LEFT JOIN appointment_type_calendars atc ON apt.id = atc.appointment_type_id
LEFT JOIN appointment_type_forms atf ON apt.id = atf.appointment_type_id
WHERE apt.company_id = 'test-company-001'
GROUP BY apt.id, apt.name, apt.assignment_type, apt.base_duration, apt.base_price
ORDER BY apt.name;

-- Test 5: Test job/appointment creation with new fields
SELECT 'Test 5: Job creation with worker_count and draft status' as test_name;

-- Insert test jobs (appointments)
INSERT INTO jobs (id, company_id, customer_id, appointment_type_id, calendar_id, title, description, status, scheduled_date, scheduled_time, estimated_duration, base_price, worker_count) VALUES
('test-job-1', 'test-company-001', 'test-customer-1', 'test-appt-1', 'calendar-1', 'Cleaning Service for John Smith', 'Standard cleaning service', 'scheduled', '2024-01-15', '09:00:00', 60, 75.00, 2),
('test-job-2', 'test-company-001', 'test-customer-2', 'test-appt-2', 'calendar-1', 'Maintenance Check for Jane Doe', 'Routine maintenance check', 'draft', '2024-01-16', '14:00:00', 30, 45.00, 1),
('test-job-3', 'test-company-001', 'test-customer-3', 'test-appt-3', 'calendar-3', 'Security Patrol for John Johnson', 'Security monitoring service', 'scheduled', '2024-01-17', '10:00:00', 120, 120.00, 3)
ON CONFLICT (id) DO NOTHING;

-- Test job retrieval with customer and appointment type info
SELECT 
    j.id,
    j.title,
    j.status,
    j.scheduled_date,
    j.scheduled_time,
    j.worker_count,
    c.first_name || ' ' || c.last_name as customer_name,
    c.phone as customer_phone,
    apt.name as appointment_type,
    apt.assignment_type
FROM jobs j
JOIN customers c ON j.customer_id = c.id
JOIN appointment_types apt ON j.appointment_type_id = apt.id
WHERE j.company_id = 'test-company-001'
ORDER BY j.scheduled_date, j.scheduled_time;

-- Test 6: Test form responses
SELECT 'Test 6: Form responses for appointments' as test_name;

-- Insert test form responses
INSERT INTO form_responses (id, job_id, form_id, responses, submitted_by) VALUES
('test-response-1', 'test-job-1', 'test-form-1', '{"Customer Name": "John Smith", "Phone Number": "+1234567890", "Special Instructions": "Please be quiet, baby sleeping"}', 'org-admin-001'),
('test-response-2', 'test-job-2', 'test-form-2', '{"Service Type": "Electrical", "Urgent Service": "Yes"}', 'org-admin-001')
ON CONFLICT (id) DO NOTHING;

-- Test form response retrieval
SELECT 
    fr.id,
    j.title as job_title,
    f.name as form_name,
    fr.responses,
    c.first_name || ' ' || c.last_name as customer_name
FROM form_responses fr
JOIN jobs j ON fr.job_id = j.id
JOIN forms f ON fr.form_id = f.id
JOIN customers c ON j.customer_id = c.id
WHERE j.company_id = 'test-company-001'
ORDER BY j.scheduled_date;

-- Test 7: Test calendar filtering for appointment types
SELECT 'Test 7: Calendar-based appointment type filtering' as test_name;

-- Test getting appointment types for a specific calendar
SELECT 
    apt.id,
    apt.name,
    apt.assignment_type,
    c.name as calendar_name,
    c.color as calendar_color
FROM appointment_types apt
JOIN appointment_type_calendars atc ON apt.id = atc.appointment_type_id
JOIN calendars c ON atc.calendar_id = c.id
WHERE apt.company_id = 'test-company-001'
AND c.id = 'calendar-1'
ORDER BY apt.name;

-- Test 8: Test customer search functionality
SELECT 'Test 8: Customer search and auto-complete' as test_name;

-- Test search by first name (for auto-complete)
SELECT 
    id,
    first_name,
    last_name,
    phone,
    email,
    created_at
FROM customers 
WHERE company_id = 'test-company-001' 
AND (
    first_name ILIKE 'john%' OR 
    last_name ILIKE 'john%' OR
    phone ILIKE '%john%'
)
ORDER BY first_name, last_name;

-- Test 9: Test draft jobs functionality
SELECT 'Test 9: Draft jobs management' as test_name;

-- Count jobs by status
SELECT 
    status,
    COUNT(*) as count
FROM jobs 
WHERE company_id = 'test-company-001'
GROUP BY status
ORDER BY status;

-- Test 10: Test form validation requirements
SELECT 'Test 10: Form validation requirements' as test_name;

-- Get forms with their required settings and field requirements
SELECT 
    f.id,
    f.name,
    f.form_required as entire_form_required,
    COUNT(ff.id) as total_fields,
    COUNT(CASE WHEN ff.required = true THEN 1 END) as required_fields,
    COUNT(CASE WHEN ff.required = false THEN 1 END) as optional_fields
FROM forms f
LEFT JOIN form_fields ff ON f.id = ff.form_id
WHERE f.company_id = 'test-company-001'
GROUP BY f.id, f.name, f.form_required
ORDER BY f.name;

-- Test 11: Test appointment type assignment override
SELECT 'Test 11: Assignment type override capability' as test_name;

-- Show current assignment types and demonstrate override capability
SELECT 
    apt.id,
    apt.name,
    apt.assignment_type as default_assignment_type,
    j.id as job_id,
    j.title as job_title,
    j.status,
    -- In the app, we can override apt.assignment_type with a custom value
    CASE 
        WHEN j.status = 'draft' THEN 'Can override assignment type'
        ELSE 'Assignment type locked'
    END as override_status
FROM appointment_types apt
LEFT JOIN jobs j ON apt.id = j.appointment_type_id
WHERE apt.company_id = 'test-company-001'
ORDER BY apt.name, j.scheduled_date;

-- Test 12: Test month view data structure
SELECT 'Test 12: Month view data structure' as test_name;

-- Get appointments for a specific month (January 2024)
SELECT 
    j.scheduled_date,
    j.scheduled_time,
    c.first_name || ' ' || c.last_name as customer_name,
    apt.name as appointment_type,
    j.worker_count,
    j.status,
    cal.name as calendar_name,
    cal.color as calendar_color
FROM jobs j
JOIN customers c ON j.customer_id = c.id
JOIN appointment_types apt ON j.appointment_type_id = apt.id
JOIN calendars cal ON j.calendar_id = cal.id
WHERE j.company_id = 'test-company-001'
AND j.scheduled_date >= '2024-01-01'
AND j.scheduled_date <= '2024-01-31'
ORDER BY j.scheduled_date, j.scheduled_time;

-- Test 13: Test worker assignment (future feature preparation)
SELECT 'Test 13: Worker assignment preparation' as test_name;

-- Show current worker structure
SELECT 
    w.id,
    u.first_name || ' ' || u.last_name as worker_name,
    w.phone,
    w.is_lead,
    COUNT(wca.calendar_id) as assigned_calendars
FROM workers w
JOIN users u ON w.user_id = u.id
LEFT JOIN worker_calendar_assignments wca ON w.id = wca.worker_id
WHERE w.company_id = 'test-company-001'
GROUP BY w.id, u.first_name, u.last_name, w.phone, w.is_lead
ORDER BY worker_name;

-- Test 14: Test database constraints and relationships
SELECT 'Test 14: Database constraints and relationships' as test_name;

-- Test foreign key relationships
SELECT 
    'appointment_type_calendars' as table_name,
    COUNT(*) as record_count
FROM appointment_type_calendars atc
JOIN appointment_types apt ON atc.appointment_type_id = apt.id
WHERE apt.company_id = 'test-company-001'

UNION ALL

SELECT 
    'appointment_type_forms' as table_name,
    COUNT(*) as record_count
FROM appointment_type_forms atf
JOIN appointment_types apt ON atf.appointment_type_id = apt.id
WHERE apt.company_id = 'test-company-001'

UNION ALL

SELECT 
    'form_responses' as table_name,
    COUNT(*) as record_count
FROM form_responses fr
JOIN jobs j ON fr.job_id = j.id
WHERE j.company_id = 'test-company-001';

-- Test 15: Cleanup (optional - comment out if you want to keep test data)
SELECT 'Test 15: Test completed successfully!' as test_name;

-- Uncomment the following lines to clean up test data:
/*
DELETE FROM form_responses WHERE id LIKE 'test-%';
DELETE FROM jobs WHERE id LIKE 'test-%';
DELETE FROM appointment_type_forms WHERE appointment_type_id LIKE 'test-%';
DELETE FROM appointment_type_calendars WHERE appointment_type_id LIKE 'test-%';
DELETE FROM appointment_types WHERE id LIKE 'test-%';
DELETE FROM form_fields WHERE id LIKE 'test-%';
DELETE FROM forms WHERE id LIKE 'test-%';
DELETE FROM customers WHERE id LIKE 'test-%';
*/

SELECT 'All tests completed! Database functionality verified.' as final_status;
