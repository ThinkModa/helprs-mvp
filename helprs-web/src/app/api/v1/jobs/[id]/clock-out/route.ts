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

    // Find the active time entry for this job and worker
    const { data: timeEntry, error: findError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('job_id', jobId)
      .eq('worker_id', worker_id)
      .is('clock_out', null)
      .single();

    if (findError || !timeEntry) {
      return NextResponse.json(
        { error: 'No active clock-in found for this job' },
        { status: 404 }
      );
    }

    // Calculate hours worked
    const clockOutTime = new Date();
    const clockInTime = new Date(timeEntry.clock_in);
    const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    // Update time entry with clock out time and hours worked
    const { data: updatedEntry, error: updateError } = await supabase
      .from('time_entries')
      .update({
        clock_out: clockOutTime.toISOString(),
        hours_worked: hoursWorked
      })
      .eq('id', timeEntry.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating time entry:', updateError);
      return NextResponse.json(
        { error: 'Failed to clock out' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      time_entry: updatedEntry,
      hours_worked: hoursWorked,
      message: 'Successfully clocked out'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
