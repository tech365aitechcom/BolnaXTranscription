import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const apiKey = process.env.BOLNA_API_KEY;
    const apiUrl = process.env.BOLNA_API_URL || 'https://api.bolna.ai/v2';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing BOLNA_API_KEY in environment variables' },
        { status: 500 }
      );
    }

    const { id: executionId } = await params;
    const userAgents = session.user.agents || [];

    if (userAgents.length === 0) {
      return NextResponse.json(
        { error: 'No agents found for user' },
        { status: 404 }
      );
    }

    // First, verify user owns this execution by trying to fetch it from their agents
    let hasAccess = false;
    for (const agent of userAgents) {
      const verifyUrl = `${apiUrl}/agent/${agent.bolnaAgentId}/execution/${executionId}`;
      const verifyResponse = await fetch(verifyUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (verifyResponse.ok) {
        hasAccess = true;
        break;
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Execution not found or you do not have access to it' },
        { status: 404 }
      );
    }

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
