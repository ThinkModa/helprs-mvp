-- Helprs Platform Database Schema
-- Complete MVP implementation with multi-tenant architecture

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enums
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ORG_ADMIN', 'WORKER');
CREATE TYPE subscription_tier AS ENUM ('trial', 'basic', 'pro', 'enterprise');
CREATE TYPE job_status AS ENUM ('open', 'scheduling', 'scheduled', 'in_progress', 'completed', 'paid');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'disputed');
CREATE TYPE payment_type AS ENUM ('deposit', 'full_payment', 'worker_payout');
CREATE TYPE rating_type AS ENUM ('worker_to_worker', 'worker_to_customer', 'customer_to_worker');
CREATE TYPE field_type AS ENUM ('short_text', 'long_text', 'radio', 'dropdown', 'multiple_choice', 'address', 'yes_no', 'toggle');
CREATE TYPE background_check_status AS ENUM ('pending', 'clear', 'failed');

-- Companies table (multi-tenant foundation)
CREATE TABLE companies (
    id TEXT PRIMARY KEY DEFAULT 'company_' || substr(md5(random()::text), 1, 8),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    subscription_tier subscription_tier DEFAULT 'trial',
    trial_ends_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table (authentication & roles)
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT 'user_' || substr(md5(random()::text), 1, 8),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role NOT NULL,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Workers table (extended user profiles)
CREATE TABLE workers (
    id TEXT PRIMARY KEY DEFAULT 'worker_' || substr(md5(random()::text), 1, 8),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    phone TEXT,
    profile_picture_url TEXT,
    is_lead BOOLEAN DEFAULT false,
    points INTEGER DEFAULT 0,
    background_check_status background_check_status DEFAULT 'pending',
    stripe_connect_account_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id TEXT PRIMARY KEY DEFAULT 'customer_' || substr(md5(random()::text), 1, 8),
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Calendars table (flexible organization)
CREATE TABLE calendars (
    id TEXT PRIMARY KEY DEFAULT 'calendar_' || substr(md5(random()::text), 1, 8),
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Worker roles table
CREATE TABLE worker_roles (
    id TEXT PRIMARY KEY DEFAULT 'role_' || substr(md5(random()::text), 1, 8),
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    hourly_rate DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Worker calendar assignments
CREATE TABLE worker_calendar_assignments (
    id TEXT PRIMARY KEY DEFAULT 'assignment_' || substr(md5(random()::text), 1, 8),
    worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
    calendar_id TEXT REFERENCES calendars(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    assigned_by TEXT REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(worker_id, calendar_id)
);

-- Forms table
CREATE TABLE forms (
    id TEXT PRIMARY KEY DEFAULT 'form_' || substr(md5(random()::text), 1, 8),
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Form fields table
CREATE TABLE form_fields (
    id TEXT PRIMARY KEY DEFAULT 'field_' || substr(md5(random()::text), 1, 8),
    form_id TEXT REFERENCES forms(id) ON DELETE CASCADE,
    field_type field_type NOT NULL,
    label TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    options JSONB, -- For dropdown/multiple choice options
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Appointment types table
CREATE TABLE appointment_types (
    id TEXT PRIMARY KEY DEFAULT 'appt_type_' || substr(md5(random()::text), 1, 8),
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    calendar_id TEXT REFERENCES calendars(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    base_duration INTEGER NOT NULL, -- minutes
    minimum_price DECIMAL(10,2),
    base_price DECIMAL(10,2),
    required_workers INTEGER DEFAULT 1,
    required_leads INTEGER DEFAULT 0,
    form_id TEXT REFERENCES forms(id),
    is_active BOOLEAN DEFAULT true,
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
    id TEXT PRIMARY KEY DEFAULT 'job_' || substr(md5(random()::text), 1, 8),
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    calendar_id TEXT REFERENCES calendars(id) ON DELETE CASCADE,
    appointment_type_id TEXT REFERENCES appointment_types(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status job_status DEFAULT 'open',
    scheduled_date DATE,
    scheduled_time TIME,
    estimated_duration INTEGER, -- minutes
    base_price DECIMAL(10,2),
    minimum_price DECIMAL(10,2),
    location_address TEXT,
    location_coordinates POINT,
    form_id TEXT REFERENCES forms(id),
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Job workers table (many-to-many)
CREATE TABLE job_workers (
    id TEXT PRIMARY KEY DEFAULT 'job_worker_' || substr(md5(random()::text), 1, 8),
    job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
    is_lead BOOLEAN DEFAULT false,
    hourly_rate DECIMAL(10,2),
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(job_id, worker_id)
);

-- Time entries table (clock in/out)
CREATE TABLE time_entries (
    id TEXT PRIMARY KEY DEFAULT 'time_entry_' || substr(md5(random()::text), 1, 8),
    job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
    clock_in TIMESTAMP,
    clock_out TIMESTAMP,
    hours_worked DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Form responses table
CREATE TABLE form_responses (
    id TEXT PRIMARY KEY DEFAULT 'response_' || substr(md5(random()::text), 1, 8),
    job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
    form_id TEXT REFERENCES forms(id) ON DELETE CASCADE,
    responses JSONB NOT NULL, -- Store all field responses
    submitted_by TEXT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id TEXT PRIMARY KEY DEFAULT 'payment_' || substr(md5(random()::text), 1, 8),
    job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id TEXT REFERENCES workers(id),
    amount DECIMAL(10,2) NOT NULL,
    stripe_payment_intent_id TEXT,
    status payment_status DEFAULT 'pending',
    payment_type payment_type NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
    id TEXT PRIMARY KEY DEFAULT 'rating_' || substr(md5(random()::text), 1, 8),
    job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
    from_worker_id TEXT REFERENCES workers(id),
    to_worker_id TEXT REFERENCES workers(id),
    customer_id TEXT REFERENCES customers(id),
    rating_type rating_type NOT NULL,
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Company availability settings
CREATE TABLE company_availability_settings (
    id TEXT PRIMARY KEY DEFAULT 'avail_setting_' || substr(md5(random()::text), 1, 8),
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    default_block_duration INTEGER DEFAULT 180, -- 3 hours in minutes
    default_start_time TIME DEFAULT '07:00',
    default_end_time TIME DEFAULT '19:00',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id)
);

-- Worker availability table
CREATE TABLE worker_availability (
    id TEXT PRIMARY KEY DEFAULT 'availability_' || substr(md5(random()::text), 1, 8),
    worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(worker_id, date)
);

-- Availability time blocks table
CREATE TABLE availability_time_blocks (
    id TEXT PRIMARY KEY DEFAULT 'time_block_' || substr(md5(random()::text), 1, 8),
    worker_availability_id TEXT REFERENCES worker_availability(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_workers_company_id ON workers(company_id);
CREATE INDEX idx_workers_user_id ON workers(user_id);
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_calendars_company_id ON calendars(company_id);
CREATE INDEX idx_worker_roles_company_id ON worker_roles(company_id);
CREATE INDEX idx_worker_calendar_assignments_worker_id ON worker_calendar_assignments(worker_id);
CREATE INDEX idx_worker_calendar_assignments_calendar_id ON worker_calendar_assignments(calendar_id);
CREATE INDEX idx_forms_company_id ON forms(company_id);
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_appointment_types_company_id ON appointment_types(company_id);
CREATE INDEX idx_appointment_types_calendar_id ON appointment_types(calendar_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_calendar_id ON jobs(calendar_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX idx_job_workers_job_id ON job_workers(job_id);
CREATE INDEX idx_job_workers_worker_id ON job_workers(worker_id);
CREATE INDEX idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX idx_time_entries_worker_id ON time_entries(worker_id);
CREATE INDEX idx_form_responses_job_id ON form_responses(job_id);
CREATE INDEX idx_payments_job_id ON payments(job_id);
CREATE INDEX idx_payments_worker_id ON payments(worker_id);
CREATE INDEX idx_ratings_job_id ON ratings(job_id);
CREATE INDEX idx_worker_availability_worker_id ON worker_availability(worker_id);
CREATE INDEX idx_worker_availability_date ON worker_availability(date);
CREATE INDEX idx_availability_time_blocks_availability_id ON availability_time_blocks(worker_availability_id);

-- Enable Row Level Security on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_calendar_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_time_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Super Admin (can access everything)
CREATE POLICY "Super Admin - Full Access" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text
            AND users.role = 'SUPER_ADMIN'
        )
    );

CREATE POLICY "Super Admin - Full Access" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id::text = auth.uid()::text
            AND u.role = 'SUPER_ADMIN'
        )
    );

-- RLS Policies for Company Isolation (Phase 1 - Basic)
CREATE POLICY "Company Isolation - Users" ON users
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE users.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Company Isolation - Workers" ON workers
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE users.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Company Isolation - Customers" ON customers
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE users.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Company Isolation - Calendars" ON calendars
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE users.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Company Isolation - Worker Roles" ON worker_roles
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE users.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Company Isolation - Forms" ON forms
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE users.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Company Isolation - Appointment Types" ON appointment_types
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE users.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Company Isolation - Jobs" ON jobs
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE users.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Company Isolation - Payments" ON payments
    FOR ALL USING (
        job_id IN (
            SELECT id FROM jobs WHERE company_id IN (
                SELECT company_id FROM users 
                WHERE users.id::text = auth.uid()::text
            )
        )
    );

-- Insert initial Super Admin user
INSERT INTO users (id, email, first_name, last_name, role, is_active)
VALUES (
    'super-admin-001',
    'admin@helprs.com',
    'Super',
    'Admin',
    'SUPER_ADMIN',
    true
);

-- Insert test company
INSERT INTO companies (id, name, subdomain, subscription_tier, trial_ends_at, is_active)
VALUES (
    'test-company-001',
    'Test Company',
    'test',
    'trial',
    NOW() + INTERVAL '30 days',
    true
);

-- Insert test org admin
INSERT INTO users (id, email, first_name, last_name, role, company_id, is_active)
VALUES (
    'org-admin-001',
    'admin@testcompany.com',
    'Test',
    'Admin',
    'ORG_ADMIN',
    'test-company-001',
    true
);

-- Insert test worker
INSERT INTO users (id, email, first_name, last_name, role, company_id, is_active)
VALUES (
    'worker-001',
    'worker@testcompany.com',
    'Test',
    'Worker',
    'WORKER',
    'test-company-001',
    true
);

INSERT INTO workers (id, user_id, company_id, phone, is_lead)
VALUES (
    'worker-profile-001',
    'worker-001',
    'test-company-001',
    '+1234567890',
    false
);

-- Insert company availability settings
INSERT INTO company_availability_settings (company_id, default_block_duration, default_start_time, default_end_time)
VALUES (
    'test-company-001',
    180, -- 3 hours
    '07:00',
    '19:00'
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendars_updated_at BEFORE UPDATE ON calendars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_roles_updated_at BEFORE UPDATE ON worker_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_calendar_assignments_updated_at BEFORE UPDATE ON worker_calendar_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_types_updated_at BEFORE UPDATE ON appointment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_availability_settings_updated_at BEFORE UPDATE ON company_availability_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_availability_updated_at BEFORE UPDATE ON worker_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Helprs Platform Database Schema Successfully Created!' as status;

