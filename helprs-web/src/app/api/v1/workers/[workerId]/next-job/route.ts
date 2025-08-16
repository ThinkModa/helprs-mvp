import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workerId: string }> }
) {
  try {
    const { workerId } = await params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient() as any;

    // Get the worker's next upcoming job (scheduled or in_progress)
    const { data: nextJob, error } = await supabase
      .from('jobs')
      .select(`
        *,
        customer:customers(first_name, last_name, phone, email),
        appointment_type:appointment_types(name, description, base_duration),
        assigned_worker:workers!jobs_assigned_worker_id_fkey(id, hourly_rate),
        form:forms(name)
      `)
      .eq('company_id', companyId)
      .eq('assigned_worker_id', workerId)
      .in('status', ['scheduled', 'in_progress'])
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching next job:', error);
      return NextResponse.json(
        { error: 'Failed to fetch next job' },
        { status: 500 }
      );
    }

    if (!nextJob) {
      return NextResponse.json({
        next_job: null,
        message: 'No upcoming jobs found'
      });
    }

    // Calculate pay based on worker hourly rate and job duration
    const workerHourlyRate = nextJob.assigned_worker?.hourly_rate || 0;
    const jobDuration = nextJob.estimated_duration || nextJob.appointment_type?.base_duration || 60;
    const calculatedPay = workerHourlyRate > 0 && jobDuration > 0 
      ? (workerHourlyRate * jobDuration / 60.0) 
      : nextJob.base_price;

    const transformedJob = {
      id: nextJob.id,
      title: nextJob.title,
      description: nextJob.description,
      status: nextJob.status,
      scheduled_date: nextJob.scheduled_date,
      scheduled_time: nextJob.scheduled_time,
      estimated_duration: nextJob.estimated_duration,
      base_price: nextJob.base_price,
      minimum_price: nextJob.minimum_price,
      calculated_pay: calculatedPay,
      location_address: nextJob.location_address,
      assigned_worker_id: nextJob.assigned_worker_id,
      assignment_date: nextJob.assignment_date,
      assignment_type: nextJob.assignment_type,
      customer: nextJob.customer ? {
        first_name: nextJob.customer.first_name,
        last_name: nextJob.customer.last_name,
        phone: nextJob.customer.phone,
        email: nextJob.customer.email
      } : null,
      appointment_type: nextJob.appointment_type ? {
        name: nextJob.appointment_type.name,
        description: nextJob.appointment_type.description,
        base_duration: nextJob.appointment_type.base_duration
      } : null,
      assigned_worker: nextJob.assigned_worker ? {
        id: nextJob.assigned_worker.id,
        hourly_rate: nextJob.assigned_worker.hourly_rate
      } : null,
      form: nextJob.form ? {
        name: nextJob.form.name
      } : null,
      created_at: nextJob.created_at,
      updated_at: nextJob.updated_at
    };

    return NextResponse.json({
      next_job: transformedJob
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
