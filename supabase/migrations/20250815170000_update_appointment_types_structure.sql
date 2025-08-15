-- Migration: Update appointment_types structure
-- Remove unused fields, add assignment_type, create many-to-many relationships

-- Step 1: Create new many-to-many relationship tables
CREATE TABLE appointment_type_calendars (
    id TEXT PRIMARY KEY DEFAULT 'atc_' || substr(md5(random()::text), 1, 8),
    appointment_type_id TEXT REFERENCES appointment_types(id) ON DELETE CASCADE,
    calendar_id TEXT REFERENCES calendars(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(appointment_type_id, calendar_id)
);

CREATE TABLE appointment_type_forms (
    id TEXT PRIMARY KEY DEFAULT 'atf_' || substr(md5(random()::text), 1, 8),
    appointment_type_id TEXT REFERENCES appointment_types(id) ON DELETE CASCADE,
    form_id TEXT REFERENCES forms(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(appointment_type_id, form_id)
);

-- Step 2: Add assignment_type field to appointment_types
ALTER TABLE appointment_types 
ADD COLUMN assignment_type TEXT CHECK (assignment_type IN ('self_assign', 'auto_assign', 'manual_assign')) DEFAULT 'manual_assign';

-- Step 3: Migrate existing calendar_id and form_id data to new tables
INSERT INTO appointment_type_calendars (appointment_type_id, calendar_id)
SELECT id, calendar_id FROM appointment_types 
WHERE calendar_id IS NOT NULL;

INSERT INTO appointment_type_forms (appointment_type_id, form_id)
SELECT id, form_id FROM appointment_types 
WHERE form_id IS NOT NULL;

-- Step 4: Remove old fields from appointment_types
ALTER TABLE appointment_types 
DROP COLUMN IF EXISTS required_workers,
DROP COLUMN IF EXISTS required_leads,
DROP COLUMN IF EXISTS calendar_id,
DROP COLUMN IF EXISTS form_id;

-- Step 5: Create indexes for performance
CREATE INDEX idx_appointment_type_calendars_appt_type ON appointment_type_calendars(appointment_type_id);
CREATE INDEX idx_appointment_type_calendars_calendar ON appointment_type_calendars(calendar_id);
CREATE INDEX idx_appointment_type_forms_appt_type ON appointment_type_forms(appointment_type_id);
CREATE INDEX idx_appointment_type_forms_form ON appointment_type_forms(form_id);
CREATE INDEX idx_appointment_types_assignment_type ON appointment_types(assignment_type);

-- Step 6: Enable RLS on new tables
ALTER TABLE appointment_type_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_type_forms ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for company isolation
CREATE POLICY "Company Isolation - Appointment Type Calendars" ON appointment_type_calendars
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM appointment_types apt
            JOIN companies c ON apt.company_id = c.id
            WHERE apt.id = appointment_type_calendars.appointment_type_id
            AND c.id = current_setting('app.current_company_id')::TEXT
        )
    );

CREATE POLICY "Company Isolation - Appointment Type Forms" ON appointment_type_forms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM appointment_types apt
            JOIN companies c ON apt.company_id = c.id
            WHERE apt.id = appointment_type_forms.appointment_type_id
            AND c.id = current_setting('app.current_company_id')::TEXT
        )
    );

-- Step 8: Add triggers for updated_at
CREATE TRIGGER update_appointment_type_calendars_updated_at 
    BEFORE UPDATE ON appointment_type_calendars 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_type_forms_updated_at 
    BEFORE UPDATE ON appointment_type_forms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
