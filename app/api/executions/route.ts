import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    // Get query parameters from request
    const searchParams = request.nextUrl.searchParams;
    const pageNumber = searchParams.get('page_number') || '1';
    const pageSize = searchParams.get('page_size') || '20';
    const status = searchParams.get('status');
    const callType = searchParams.get('call_type');

    // Build query string
    const params = new URLSearchParams({
      page_number: pageNumber,
      page_size: pageSize,
    });

    if (status) params.append('status', status);
    if (callType) params.append('call_type', callType);

    // Fetch from Bolna API
    const bolnaUrl = `${apiUrl}/agent/${agentId}/executions?${params.toString()}`;

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
        { error: 'Failed to fetch executions from Bolna API', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
