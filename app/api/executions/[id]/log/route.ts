import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = process.env.BOLNA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing BOLNA_API_KEY in environment variables' },
        { status: 500 }
      );
    }

    const { id: executionId } = await params;

    // Fetch execution logs from Bolna API
    // Note: The logs endpoint does NOT use /v2/ prefix
    const bolnaUrl = `https://api.bolna.ai/executions/${executionId}/log`;

    console.log('Fetching logs from:', bolnaUrl);
    const response = await fetch(bolnaUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Bolna API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch logs from Bolna API', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching execution logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution logs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
