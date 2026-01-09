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

    // Try to fetch execution from each of user's agents
    // We don't know which agent this execution belongs to, so we try all
    for (const agent of userAgents) {
      const bolnaUrl = `${apiUrl}/agent/${agent.bolnaAgentId}/execution/${executionId}`;

      const response = await fetch(bolnaUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // If not found in any of user's agents
    return NextResponse.json(
      { error: 'Execution not found or you do not have access to it' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching execution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
