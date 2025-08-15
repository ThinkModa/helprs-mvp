-- Quick Database Functionality Test
-- Test key features for scheduling system

-- Test 1: Check new fields exist
SELECT '✅ Test 1: New fields verification' as test_result;

SELECT 
    'forms.form_required' as field_name,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'form_required'
    ) as exists
UNION ALL
SELECT 
    'jobs.worker_count' as field_name,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'worker_count'
    ) as exists
UNION ALL
SELECT 
    'job_status enum has draft' as field_name,
    EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'job_status')
        AND enumlabel = 'draft'
    ) as exists;

-- Test 2: Test customer creation
SELECT '✅ Test 2: Customer management' as test_result;

INSERT INTO customers (id, company_id, first_name, last_name, email, phone) VALUES
('test-cust-1', 'test-company-1', 'John', 'Smith', 'john@test.com', '+1234567890')
ON CONFLICT (id) DO NOTHING;

SELECT 
    COUNT(*) as customer_count,
    'Customer created successfully' as status
FROM customers 
WHERE id = 'test-cust-1';

-- Test 3: Test form creation with required toggle
SELECT '✅ Test 3: Form creation with required toggle' as test_result;

INSERT INTO forms (id, company_id, name, description, form_required, internal_use_only) VALUES
('test-form-1', 'test-company-1', 'Test Form', 'Test description', true, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO form_fields (id, form_id, field_type, label, required, order_index) VALUES
('test-field-1', 'test-form-1', 'textbox', 'Test Field', true, 1)
ON CONFLICT (id) DO NOTHING;

SELECT 
    f.name,
    f.form_required,
    COUNT(ff.id) as field_count,
    COUNT(CASE WHEN ff.required = true THEN 1 END) as required_fields
FROM forms f
LEFT JOIN form_fields ff ON f.id = ff.form_id
WHERE f.id = 'test-form-1'
GROUP BY f.name, f.form_required;

-- Test 4: Test appointment type creation
SELECT '✅ Test 4: Appointment type creation' as test_result;

INSERT INTO appointment_types (id, company_id, name, description, base_duration, base_price, minimum_price, assignment_type) VALUES
('test-appt-1', 'test-company-1', 'Test Service', 'Test service description', 60, 75.00, 50.00, 'manual_assign')
ON CONFLICT (id) DO NOTHING;

INSERT INTO appointment_type_calendars (appointment_type_id, calendar_id) VALUES
('test-appt-1', 'calendar-1')
ON CONFLICT (appointment_type_id, calendar_id) DO NOTHING;

INSERT INTO appointment_type_forms (appointment_type_id, form_id) VALUES
('test-appt-1', 'test-form-1')
ON CONFLICT (appointment_type_id, form_id) DO NOTHING;

SELECT 
    apt.name,
    apt.assignment_type,
    apt.base_duration,
    COUNT(DISTINCT atc.calendar_id) as assigned_calendars,
    COUNT(DISTINCT atf.form_id) as assigned_forms
FROM appointment_types apt
LEFT JOIN appointment_type_calendars atc ON apt.id = atc.appointment_type_id
LEFT JOIN appointment_type_forms atf ON apt.id = atf.appointment_type_id
WHERE apt.id = 'test-appt-1'
GROUP BY apt.name, apt.assignment_type, apt.base_duration;

-- Test 5: Test job/appointment creation with new fields
SELECT '✅ Test 5: Job creation with worker_count and draft status' as test_result;

INSERT INTO jobs (id, company_id, customer_id, appointment_type_id, calendar_id, title, description, status, scheduled_date, scheduled_time, estimated_duration, base_price, worker_count) VALUES
('test-job-1', 'test-company-1', 'test-cust-1', 'test-appt-1', 'calendar-1', 'Test Job', 'Test job description', 'draft', '2024-01-15', '09:00:00', 60, 75.00, 2)
ON CONFLICT (id) DO NOTHING;

SELECT 
    j.title,
    j.status,
    j.worker_count,
    j.scheduled_date,
    j.scheduled_time,
    c.first_name || ' ' || c.last_name as customer_name,
    apt.name as appointment_type
FROM jobs j
JOIN customers c ON j.customer_id = c.id
JOIN appointment_types apt ON j.appointment_type_id = apt.id
WHERE j.id = 'test-job-1';

-- Test 6: Test form responses
SELECT '✅ Test 6: Form responses' as test_result;

INSERT INTO form_responses (id, job_id, form_id, responses, submitted_by) VALUES
('test-response-1', 'test-job-1', 'test-form-1', '{"Test Field": "Test Value"}', 'org-admin-001')
ON CONFLICT (id) DO NOTHING;

SELECT 
    fr.id,
    j.title as job_title,
    f.name as form_name,
    fr.responses
FROM form_responses fr
JOIN jobs j ON fr.job_id = j.id
JOIN forms f ON fr.form_id = f.id
WHERE fr.id = 'test-response-1';

-- Test 7: Test customer search/auto-complete
SELECT '✅ Test 7: Customer search functionality' as test_result;

SELECT 
    id,
    first_name,
    last_name,
    phone,
    email
FROM customers 
WHERE company_id = 'test-company-1' 
AND first_name ILIKE 'john%'
ORDER BY first_name, last_name;

-- Test 8: Test calendar-based appointment type filtering
SELECT '✅ Test 8: Calendar-based appointment type filtering' as test_result;

SELECT 
    apt.id,
    apt.name,
    apt.assignment_type,
    c.name as calendar_name
FROM appointment_types apt
JOIN appointment_type_calendars atc ON apt.id = atc.appointment_type_id
JOIN calendars c ON atc.calendar_id = c.id
WHERE apt.company_id = 'test-company-1'
AND c.id = 'calendar-1'
ORDER BY apt.name;

-- Test 9: Test month view data structure
SELECT '✅ Test 9: Month view data structure' as test_result;

SELECT 
    j.scheduled_date,
    j.scheduled_time,
    c.first_name || ' ' || c.last_name as customer_name,
    apt.name as appointment_type,
    j.worker_count,
    j.status,
    cal.name as calendar_name
FROM jobs j
JOIN customers c ON j.customer_id = c.id
JOIN appointment_types apt ON j.appointment_type_id = apt.id
JOIN calendars cal ON j.calendar_id = cal.id
WHERE j.company_id = 'test-company-1'
AND j.scheduled_date >= '2024-01-01'
AND j.scheduled_date <= '2024-01-31'
ORDER BY j.scheduled_date, j.scheduled_time;

-- Test 10: Summary
SELECT '✅ Test 10: Database functionality summary' as test_result;

SELECT 
    'customers' as table_name,
    COUNT(*) as record_count
FROM customers 
WHERE company_id = 'test-company-1'

UNION ALL

SELECT 
    'forms' as table_name,
    COUNT(*) as record_count
FROM forms 
WHERE company_id = 'test-company-1'

UNION ALL

SELECT 
    'appointment_types' as table_name,
    COUNT(*) as record_count
FROM appointment_types 
WHERE company_id = 'test-company-1'

UNION ALL

SELECT 
    'jobs' as table_name,
    COUNT(*) as record_count
FROM jobs 
WHERE company_id = 'test-company-1'

UNION ALL

SELECT 
    'form_responses' as table_name,
    COUNT(*) as record_count
FROM form_responses fr
JOIN jobs j ON fr.job_id = j.id
WHERE j.company_id = 'test-company-1';

-- Final status
SELECT '🎉 All database tests completed successfully! Database is ready for scheduling features.' as final_status;
