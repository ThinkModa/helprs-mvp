import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const body = await request.json();
    const { worker_id } = body;

    if (!jobId || !worker_id) {
      return NextResponse.json(
        { error: 'Job ID and worker ID are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient() as any;

    // Check if job exists and is assigned to the worker
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('assigned_worker_id', worker_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found or not assigned to worker' },
        { status: 404 }
      );
    }

    // Check if already clocked in
    const { data: existingEntry, error: checkError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('job_id', jobId)
      .eq('worker_id', worker_id)
      .is('clock_out', null)
      .single();

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Already clocked in to this job' },
        { status: 400 }
      );
    }

    // Create time entry
    const timeEntryData = {
      job_id: jobId,
      worker_id: worker_id,
      clock_in: new Date().toISOString(),
      clock_out: null,
      hours_worked: null
    };
    
    console.log('Creating time entry with data:', timeEntryData);
    
    const { data: timeEntry, error: insertError } = await supabase
      .from('time_entries')
      .insert(timeEntryData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating time entry:', insertError);
      return NextResponse.json(
        { error: 'Failed to clock in', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      time_entry: timeEntry,
      message: 'Successfully clocked in'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
