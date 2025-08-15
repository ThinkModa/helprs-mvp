import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Temporary type for jobs until we regenerate database types
type Job = any;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'open';
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient() as any;

    // Get jobs with worker count information
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        *,
        customer:customers(first_name, last_name, phone, email),
        appointment_type:appointment_types(name, description),
        job_workers(count),
        form:forms(name)
      `)
      .eq('company_id', companyId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    // Transform the data to include worker count information
    const transformedJobs = jobs?.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      status: job.status,
      scheduled_date: job.scheduled_date,
      scheduled_time: job.scheduled_time,
      estimated_duration: job.estimated_duration,
      base_price: job.base_price,
      minimum_price: job.minimum_price,
      location_address: job.location_address,
      worker_count: job.worker_count || 1,
      required_workers: job.worker_count || 1,
      accepted_workers: job.job_workers?.[0]?.count || 0,
      customer: job.customer ? {
        first_name: job.customer.first_name,
        last_name: job.customer.last_name,
        phone: job.customer.phone,
        email: job.customer.email
      } : null,
      appointment_type: job.appointment_type ? {
        name: job.appointment_type.name,
        description: job.appointment_type.description
      } : null,
      form: job.form ? {
        name: job.form.name
      } : null,
      created_at: job.created_at,
      updated_at: job.updated_at
    })) || [];

    return NextResponse.json({
      jobs: transformedJobs,
      count: transformedJobs.length
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
