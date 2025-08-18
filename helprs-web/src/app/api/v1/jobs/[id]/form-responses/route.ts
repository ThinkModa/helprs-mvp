import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient() as any;

    // Fetch form responses for the job, excluding internal-use-only forms
    const { data: formResponses, error } = await supabase
      .from('form_responses')
      .select(`
        *,
        form:forms(
          id,
          name,
          internal_use_only
        )
      `)
      .eq('job_id', jobId)
      .eq('form.internal_use_only', false);

    if (error) {
      console.error('Error fetching form responses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch form responses' },
        { status: 500 }
      );
    }

    // Transform the data to extract just the answers
    const transformedResponses = formResponses?.map(response => {
      const answers = [];
      
      // Parse the JSONB responses and extract just the values
      if (response.responses && typeof response.responses === 'object') {
        Object.values(response.responses).forEach(value => {
          if (value && typeof value === 'string' && value.trim() !== '') {
            answers.push(value.trim());
          }
        });
      }

      return {
        form_name: response.form?.name || 'Unknown Form',
        answers: answers
      };
    }) || [];

    return NextResponse.json({
      form_responses: transformedResponses,
      count: transformedResponses.length
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
