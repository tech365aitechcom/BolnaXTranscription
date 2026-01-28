import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Batch Stop API - Stop a running batch
 *
 * POST /api/batch/[batchId]/stop
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> | { batchId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const batchId = resolvedParams.batchId;

    console.log('🛑 Stop request for batch:', batchId);

    if (!batchId) {
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

    console.log(`🛑 Stopping batch ${batchId}`);

    // Stop batch via Bolna API
    const bolnaResponse = await fetch(`https://api.bolna.ai/batches/${batchId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bolnaApiKey}`,
      },
    });

    if (!bolnaResponse.ok) {
      const errorText = await bolnaResponse.text();
      console.error('❌ Bolna API error:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to stop batch',
          details: errorText
        },
        { status: bolnaResponse.status }
      );
    }

    console.log('✅ Batch stopped successfully');

    return NextResponse.json({
      success: true,
      message: 'Batch stopped successfully',
      batch_id: batchId,
      stopped_by: session.user.email,
    });

  } catch (error) {
    console.error('❌ Batch stop error:', error);
    return NextResponse.json(
      {
        error: 'Failed to stop batch',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
