-- Insert test data for mobile app testing

-- Insert test company
INSERT INTO companies (id, name, subdomain, subscription_tier, is_active)
VALUES ('company_1', 'Test Company', 'test', 'trial', true)
ON CONFLICT (id) DO NOTHING;

-- Insert test users
INSERT INTO users (id, email, first_name, last_name, role, company_id, is_active)
VALUES 
  ('user_1', 'admin@test.com', 'Admin', 'User', 'ORG_ADMIN', 'company_1', true),
  ('user_2', 'worker1@test.com', 'Worker', 'One', 'WORKER', 'company_1', true),
  ('user_3', 'worker2@test.com', 'Worker', 'Two', 'WORKER', 'company_1', true)
ON CONFLICT (id) DO NOTHING;

-- Insert test workers
INSERT INTO workers (id, user_id, company_id, phone, is_lead, points)
VALUES 
  ('worker_1', 'user_2', 'company_1', '+1234567890', false, 0),
  ('worker_2', 'user_3', 'company_1', '+1234567891', false, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert test customers
INSERT INTO customers (id, company_id, first_name, last_name, email, phone, address)
VALUES 
  ('customer_1', 'company_1', 'John', 'Doe', 'john@example.com', '+1234567892', '123 Main St, City, State'),
  ('customer_2', 'company_1', 'Jane', 'Smith', 'jane@example.com', '+1234567893', '456 Oak Ave, City, State')
ON CONFLICT (id) DO NOTHING;

-- Insert test calendar
INSERT INTO calendars (id, company_id, name, description, color, is_active, created_by)
VALUES ('calendar_1', 'company_1', 'Main Calendar', 'Primary calendar for jobs', '#3B82F6', true, 'user_1')
ON CONFLICT (id) DO NOTHING;

-- Insert test appointment types
INSERT INTO appointment_types (id, company_id, name, description, duration, base_price, minimum_price, assignment_type)
VALUES 
  ('appt_1', 'company_1', 'House Cleaning', 'Standard house cleaning service', 180, 150.00, 120.00, 'self_assign'),
  ('appt_2', 'company_1', 'Office Maintenance', 'Regular office maintenance and cleaning', 120, 200.00, 180.00, 'self_assign')
ON CONFLICT (id) DO NOTHING;

-- Link appointment types to calendars
INSERT INTO appointment_type_calendars (appointment_type_id, calendar_id)
VALUES 
  ('appt_1', 'calendar_1'),
  ('appt_2', 'calendar_1')
ON CONFLICT DO NOTHING;

-- Insert test jobs
INSERT INTO jobs (id, company_id, customer_id, calendar_id, appointment_type_id, title, description, status, scheduled_date, scheduled_time, estimated_duration, base_price, minimum_price, location_address, worker_count, created_by)
VALUES 
  ('job_1', 'company_1', 'customer_1', 'calendar_1', 'appt_1', 'House Cleaning', 'Deep cleaning service for 3-bedroom house', 'open', '2024-01-15', '09:00', 180, 150.00, 120.00, '123 Main St, City, State', 3, 'user_1'),
  ('job_2', 'company_1', 'customer_2', 'calendar_1', 'appt_2', 'Office Maintenance', 'Regular maintenance and cleaning', 'open', '2024-01-16', '14:00', 120, 200.00, 180.00, '456 Business Ave, City, State', 2, 'user_1'),
  ('job_3', 'company_1', 'customer_1', 'calendar_1', 'appt_1', 'Weekly Cleaning', 'Weekly house cleaning service', 'open', '2024-01-17', '10:00', 180, 150.00, 120.00, '123 Main St, City, State', 2, 'user_1')
ON CONFLICT (id) DO NOTHING;
