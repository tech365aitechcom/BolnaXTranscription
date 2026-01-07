import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = process.env.BOLNA_API_KEY;
    const agentId = process.env.BOLNA_AGENT_ID;
    const apiUrl = process.env.BOLNA_API_URL || 'https://api.bolna.ai/v2';

    if (!apiKey || !agentId) {
      return NextResponse.json(
        { error: 'Missing BOLNA_API_KEY or BOLNA_AGENT_ID in environment variables' },
        { status: 500 }
      );
    }

    const { id: executionId } = await params;

    // Fetch specific execution from Bolna API
    const bolnaUrl = `${apiUrl}/agent/${agentId}/execution/${executionId}`;

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
        { error: 'Failed to fetch execution from Bolna API', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching execution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
