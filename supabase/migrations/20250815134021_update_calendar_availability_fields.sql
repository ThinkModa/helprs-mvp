-- Add availability fields to calendars table
ALTER TABLE calendars 
ADD COLUMN availability_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}, "saturday": {"start": "09:00", "end": "17:00"}, "sunday": {"start": "09:00", "end": "17:00"}}',
ADD COLUMN time_slot_duration INTEGER DEFAULT 15;

-- Remove required_workers from appointment_types table
ALTER TABLE appointment_types 
DROP COLUMN required_workers;

-- Add index for availability queries
CREATE INDEX IF NOT EXISTS idx_calendars_availability ON calendars(company_id, is_active) WHERE is_active = true;

-- Add comment for documentation
COMMENT ON COLUMN calendars.availability_hours IS 'JSON object with day keys and start/end time values for business hours';
COMMENT ON COLUMN calendars.time_slot_duration IS 'Duration of time slots in minutes (default: 15)';
