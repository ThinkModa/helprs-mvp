-- Migration: Update form builder structure
-- Update field types and add internal_use_only field to forms

-- Step 1: Add internal_use_only field to forms table
ALTER TABLE forms 
ADD COLUMN internal_use_only boolean DEFAULT false;

-- Step 2: Create new field_type enum with updated values
CREATE TYPE field_type_new AS ENUM (
    'textbox',
    'dropdown',
    'checkbox',
    'checkbox_list',
    'yes_no',
    'file_upload',
    'address'
);

-- Step 3: Add a temporary column with the new enum type
ALTER TABLE form_fields ADD COLUMN field_type_new field_type_new;

-- Step 4: Convert existing field types to new ones
UPDATE form_fields SET field_type_new = 'textbox' WHERE field_type = 'short_text';
UPDATE form_fields SET field_type_new = 'textbox' WHERE field_type = 'long_text';
UPDATE form_fields SET field_type_new = 'dropdown' WHERE field_type = 'radio';
UPDATE form_fields SET field_type_new = 'dropdown' WHERE field_type = 'dropdown';
UPDATE form_fields SET field_type_new = 'checkbox_list' WHERE field_type = 'multiple_choice';
UPDATE form_fields SET field_type_new = 'yes_no' WHERE field_type = 'yes_no';
UPDATE form_fields SET field_type_new = 'yes_no' WHERE field_type = 'toggle';
UPDATE form_fields SET field_type_new = 'address' WHERE field_type = 'address';

-- Step 5: Drop the old column and rename the new one
ALTER TABLE form_fields DROP COLUMN field_type;
ALTER TABLE form_fields RENAME COLUMN field_type_new TO field_type;
ALTER TABLE form_fields ALTER COLUMN field_type SET NOT NULL;

-- Step 6: Drop the old enum and rename the new one
DROP TYPE field_type;
ALTER TYPE field_type_new RENAME TO field_type;

-- Step 7: Create index for internal_use_only
CREATE INDEX idx_forms_internal_use_only ON forms(internal_use_only);

-- Step 8: Add comment to explain the field
COMMENT ON COLUMN forms.internal_use_only IS 'Designates if this form is for internal use only (future: customers cannot edit)';
