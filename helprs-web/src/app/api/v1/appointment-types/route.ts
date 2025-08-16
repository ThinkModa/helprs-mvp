import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || 'test-company-1';

    const supabase = createServerClient() as any;

    const { data: appointmentTypes, error } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching appointment types:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointment types' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      appointment_types: appointmentTypes || [],
      count: appointmentTypes?.length || 0
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
      base_duration,
      base_price,
      minimum_price,
      assignment_type = 'manual_assign',
      company_id = 'test-company-1'
    } = body;

    if (!name || !base_duration || !base_price) {
      return NextResponse.json(
        { error: 'name, base_duration, and base_price are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient() as any;

    const { data: appointmentType, error } = await supabase
      .from('appointment_types')
      .insert({
        name,
        description,
        base_duration,
        base_price,
        minimum_price,
        assignment_type,
        company_id,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment type:', error);
      return NextResponse.json(
        { error: 'Failed to create appointment type' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment_type: appointmentType
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
