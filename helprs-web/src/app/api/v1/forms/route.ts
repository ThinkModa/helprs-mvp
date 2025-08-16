import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentTypeId = searchParams.get('appointment_type_id');
    const companyId = searchParams.get('company_id') || 'test-company-1';

    const supabase = createServerClient() as any;

    let query = supabase
      .from('forms')
      .select(`
        *,
        form_fields(*)
      `)
      .eq('company_id', companyId)
      .eq('is_active', true);

    // If appointment type is specified, filter by forms assigned to that appointment type
    if (appointmentTypeId) {
      // Check if the appointment type has a form_id assigned
      const { data: appointmentType } = await supabase
        .from('appointment_types')
        .select('form_id')
        .eq('id', appointmentTypeId)
        .single();
      
      if (appointmentType?.form_id) {
        query = query.eq('id', appointmentType.form_id);
      }
    }

    const { data: forms, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching forms:', error);
      return NextResponse.json(
        { error: 'Failed to fetch forms' },
        { status: 500 }
      );
    }

    // Transform the data to include form fields
    const transformedForms = forms?.map(form => ({
      id: form.id,
      name: form.name,
      description: form.description,
      form_required: false, // This field doesn't exist in the schema, defaulting to false
      internal_use_only: false, // This field doesn't exist in the schema, defaulting to false
      assigned_appointment_types: [], // This field doesn't exist in the schema, using empty array
      fields: form.form_fields?.map((field: any) => ({
        id: field.id,
        label: field.label,
        field_type: field.field_type,
        required: field.required,
        options: field.options,
        order_index: field.order_index
      })) || [],
      created_at: form.created_at,
      updated_at: form.updated_at
    })) || [];

    return NextResponse.json({
      forms: transformedForms,
      count: transformedForms.length
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      fields = [],
      company_id = 'test-company-1'
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient() as any;

    // Create the form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .insert({
        name,
        description,
        company_id,
        is_active: true
      })
      .select()
      .single();

    if (formError) {
      console.error('Error creating form:', formError);
      return NextResponse.json(
        { error: 'Failed to create form' },
        { status: 500 }
      );
    }

    // Create form fields if provided
    if (fields.length > 0) {
      const formFields = fields.map((field: any, index: number) => ({
        form_id: form.id,
        label: field.label,
        field_type: field.field_type,
        required: field.required || false,
        options: field.options,
        order_index: index
      }));

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(formFields);

      if (fieldsError) {
        console.error('Error creating form fields:', fieldsError);
      }
    }

    return NextResponse.json({
      success: true,
      form: form
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
