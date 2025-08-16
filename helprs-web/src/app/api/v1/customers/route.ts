import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || 'test-company-1';

    const supabase = createServerClient() as any;

    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      customers: customers || [],
      count: customers?.length || 0
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
      first_name,
      last_name,
      phone,
      email,
      address,
      company_id = 'test-company-1'
    } = body;

    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'first_name and last_name are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient() as any;

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        first_name,
        last_name,
        phone,
        email,
        address,
        company_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: customer
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
