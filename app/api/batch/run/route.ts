import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Batch Run API - Execute a batch immediately
 *
 * POST /api/batch/run
 *
 * Body:
 * {
 *   batch_id: string
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
    const { batch_id } = body;

    if (!batch_id) {
      return NextResponse.json(
        { error: 'batch_id is required' },
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

    console.log(`▶️ Running batch ${batch_id} immediately`);

    // Schedule batch for immediate execution (current time + 3 minutes for safety buffer)
    const now = new Date();
    const scheduleTime = new Date(now.getTime() + 3 * 60 * 1000); // 3 minutes from now

    // Format timestamp as Bolna expects: YYYY-MM-DDTHH:mm:ss+00:00 (no milliseconds, explicit timezone)
    const year = scheduleTime.getUTCFullYear();
    const month = String(scheduleTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(scheduleTime.getUTCDate()).padStart(2, '0');
    const hours = String(scheduleTime.getUTCHours()).padStart(2, '0');
    const minutes = String(scheduleTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(scheduleTime.getUTCSeconds()).padStart(2, '0');
    const scheduledTimeISO = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`;

    console.log(`   Scheduling for: ${scheduledTimeISO}`);

    // Create form data for Bolna API
    const formData = new FormData();
    formData.append('scheduled_at', scheduledTimeISO);

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
          error: 'Failed to run batch',
          details: errorText
        },
        { status: bolnaResponse.status }
      );
    }

    const bolnaData = await bolnaResponse.json();
    console.log('✅ Batch started successfully');

    return NextResponse.json({
      success: true,
      message: 'Batch execution started',
      batch_id: batch_id,
      started_by: session.user.email,
      data: bolnaData,
    });

  } catch (error) {
    console.error('❌ Batch run error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run batch',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
