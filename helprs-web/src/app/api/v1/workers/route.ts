import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient() as any;

    const { data: workers, error } = await supabase
      .from('workers')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Error fetching workers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch workers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      workers: workers || [],
      count: workers?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
