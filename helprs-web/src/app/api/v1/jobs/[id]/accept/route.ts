import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Temporary type for jobs until we regenerate database types
type Job = any;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { worker_id } = await request.json();

    if (!worker_id) {
      return NextResponse.json(
        { error: 'worker_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient() as any;

    // First, get the job details to check if it's still open and get worker count
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'open' && job.status !== 'scheduling') {
      return NextResponse.json(
        { error: 'Job is no longer accepting workers' },
        { status: 400 }
      );
    }

    // Check if worker is already assigned to this job
    const { data: existingAssignment, error: checkError } = await supabase
      .from('job_workers')
      .select('*')
      .eq('job_id', id)
      .eq('worker_id', worker_id)
      .single();

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Worker is already assigned to this job' },
        { status: 400 }
      );
    }

    // Get current worker count for this job
    const { count: currentWorkers } = await supabase
      .from('job_workers')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', id);

    const requiredWorkers = job.worker_count || 1;
    const newWorkerCount = (currentWorkers || 0) + 1;

    // Add worker to job
    const { error: assignError } = await supabase
      .from('job_workers')
      .insert({
        job_id: id,
        worker_id: worker_id,
        assigned_at: new Date().toISOString()
      });

    if (assignError) {
      console.error('Error assigning worker:', assignError);
      return NextResponse.json(
        { error: 'Failed to assign worker to job' },
        { status: 500 }
      );
    }

    // Update job status based on worker count
    let newStatus = job.status;
    if (newWorkerCount >= requiredWorkers) {
      newStatus = 'scheduled';
    } else if (job.status === 'open') {
      newStatus = 'scheduling';
    }

    // Update job with assignment details and status
    const updateData: any = {
      assigned_worker_id: worker_id,
      assignment_date: new Date().toISOString(),
      assignment_type: 'self_assign'
    };
    
    if (newStatus !== job.status) {
      updateData.status = newStatus;
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating job assignment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update job assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job_status: newStatus,
      accepted_workers: newWorkerCount,
      required_workers: requiredWorkers,
      message: 'Worker successfully assigned to job'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
