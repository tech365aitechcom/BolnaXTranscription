import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Batch Download API - Download batch data
 *
 * GET /api/batch/[batchId]/download
 */
export async function GET(
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

    console.log(`📥 Downloading batch executions for ${batchId}`);

    // Get batch executions via Bolna API
    const bolnaResponse = await fetch(`https://api.bolna.ai/batches/${batchId}/executions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bolnaApiKey}`,
      },
    });

    if (!bolnaResponse.ok) {
      const errorText = await bolnaResponse.text();
      console.error('❌ Bolna API error:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to download batch executions',
          details: errorText
        },
        { status: bolnaResponse.status }
      );
    }

    const executions = await bolnaResponse.json();
    console.log(`✅ Found ${executions.length} execution(s)`);

    // Convert executions to CSV format
    const csvRows = [];

    // CSV Headers
    csvRows.push([
      'ID',
      'Conversation Time (s)',
      'Total Cost',
      'Created At',
      'Synthesizer Characters',
      'Transcriber Duration',
      'LLM Tokens',
      'Transcript'
    ].join(','));

    // CSV Data
    for (const execution of executions) {
      const row = [
        execution.id || '',
        execution.conversation_time || 0,
        execution.total_cost || 0,
        execution.createdAt || '',
        execution.usage_breakdown?.synthesizerCharacters || 0,
        execution.usage_breakdown?.transcriberDuration || 0,
        execution.usage_breakdown?.llmTokens || 0,
        `"${(execution.transcript || '').replace(/"/g, '""')}"` // Escape quotes in transcript
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    console.log('✅ CSV generated successfully');

    // Return the CSV with proper headers
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="batch-${batchId}-executions.csv"`,
      },
    });

  } catch (error) {
    console.error('❌ Batch download error:', error);
    return NextResponse.json(
      {
        error: 'Failed to download batch data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
