import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Temporary type for jobs until we regenerate database types
type Job = any;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      scheduled_date,
      scheduled_time,
      estimated_duration,
      base_price,
      minimum_price,
      location_address,
      worker_count = 1,
      customer_id,
      appointment_type_id,
      form_id,
      company_id = 'test-company-1' // Default to test company
    } = body;

    // Validate required fields
    if (!title || !scheduled_date || !scheduled_time) {
      return NextResponse.json(
        { error: 'title, scheduled_date, and scheduled_time are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient() as any;

    // Create the job
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        title,
        description,
        status: 'open',
        scheduled_date,
        scheduled_time,
        estimated_duration,
        base_price: base_price || 0,
        minimum_price: minimum_price || 0,
        location_address,
        worker_count,
        customer_id,
        appointment_type_id,
        form_id,
        company_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: job
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'open';
    const companyId = searchParams.get('company_id');
    const workerId = searchParams.get('worker_id'); // For filtering "My Jobs"
    const jobType = searchParams.get('type'); // 'available', 'my_jobs', 'all_jobs'

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient() as any;

    let query = supabase
      .from('jobs')
      .select(`
        *,
        customer:customers(first_name, last_name, phone, email),
        appointment_type:appointment_types(name, description, base_duration),
        assigned_worker:workers!jobs_assigned_worker_id_fkey(id, hourly_rate),
        form:forms(name)
      `)
      .eq('company_id', companyId);

    // Apply filters based on job type
    if (jobType === 'available') {
      // Available jobs: open jobs that can be accepted
      query = query.eq('status', 'open');
    } else if (jobType === 'my_jobs' && workerId) {
      // My jobs: jobs assigned to this worker
      query = query.eq('assigned_worker_id', workerId);
    } else if (jobType === 'all_jobs') {
      // All jobs: no status filter, show everything
      // Keep existing status filter if provided
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
    } else {
      // Default: use status filter
      query = query.eq('status', status);
    }

    const { data: jobs, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    // Transform the data to include calculated pay and assignment info
    const transformedJobs = jobs?.map(job => {
      // Calculate pay based on worker hourly rate and job duration
      const workerHourlyRate = job.assigned_worker?.hourly_rate || 0;
      const jobDuration = job.estimated_duration || job.appointment_type?.base_duration || 60;
      const calculatedPay = workerHourlyRate > 0 && jobDuration > 0 
        ? (workerHourlyRate * jobDuration / 60.0) 
        : job.base_price;

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        status: job.status,
        scheduled_date: job.scheduled_date,
        scheduled_time: job.scheduled_time,
        estimated_duration: job.estimated_duration,
        base_price: job.base_price,
        minimum_price: job.minimum_price,
        calculated_pay: calculatedPay,
        location_address: job.location_address,
        assigned_worker_id: job.assigned_worker_id,
        assignment_date: job.assignment_date,
        assignment_type: job.assignment_type,
        customer: job.customer ? {
          first_name: job.customer.first_name,
          last_name: job.customer.last_name,
          phone: job.customer.phone,
          email: job.customer.email
        } : null,
        appointment_type: job.appointment_type ? {
          name: job.appointment_type.name,
          description: job.appointment_type.description,
          base_duration: job.appointment_type.base_duration
        } : null,
        assigned_worker: job.assigned_worker ? {
          id: job.assigned_worker.id,
          hourly_rate: job.assigned_worker.hourly_rate
        } : null,
        form: job.form ? {
          name: job.form.name
        } : null,
        created_at: job.created_at,
        updated_at: job.updated_at
      };
    }) || [];

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
