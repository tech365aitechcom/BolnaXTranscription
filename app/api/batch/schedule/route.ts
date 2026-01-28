import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Batch Schedule API - Schedule a batch for execution
 *
 * POST /api/batch/schedule
 *
 * Body:
 * {
 *   batch_id: string,
 *   scheduled_time: string (ISO 8601 format with timezone)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { batch_id, scheduled_time } = body;

    if (!batch_id) {
      return NextResponse.json(
        { error: 'batch_id is required' },
        { status: 400 }
      );
    }

    if (!scheduled_time) {
      return NextResponse.json(
        { error: 'scheduled_time is required (ISO 8601 format with timezone)' },
        { status: 400 }
      );
    }

    // Validate scheduled_time is in the future
    const scheduledDate = new Date(scheduled_time);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid scheduled_time format. Use ISO 8601 format (e.g., 2024-01-25T14:30:00+05:30)' },
        { status: 400 }
      );
    }

    if (scheduledDate < new Date()) {
      return NextResponse.json(
        { error: 'scheduled_time must be in the future' },
        { status: 400 }
      );
    }

    // Get API configuration
    const bolnaApiKey = process.env.BOLNA_API_KEY;

    if (!bolnaApiKey) {
      console.error('❌ Missing Bolna API configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log(`📅 Scheduling batch ${batch_id} for ${scheduled_time}`);

    // Create form data for Bolna API
    const formData = new FormData();
    formData.append('scheduled_at', scheduled_time);

    // Schedule batch via Bolna API
    const bolnaResponse = await fetch(`https://api.bolna.ai/batches/${batch_id}/schedule`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bolnaApiKey}`,
      },
      body: formData,
    });

    if (!bolnaResponse.ok) {
      const errorText = await bolnaResponse.text();
      console.error('❌ Bolna API error:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to schedule batch',
          details: errorText
        },
        { status: bolnaResponse.status }
      );
    }

    const bolnaData = await bolnaResponse.json();
    console.log('✅ Batch scheduled successfully');

    return NextResponse.json({
      success: true,
      message: 'Batch scheduled successfully',
      batch_id: batch_id,
      scheduled_time: scheduled_time,
      scheduled_by: session.user.email,
      data: bolnaData,
    });

  } catch (error) {
    console.error('❌ Batch schedule error:', error);
    return NextResponse.json(
      {
        error: 'Failed to schedule batch',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
