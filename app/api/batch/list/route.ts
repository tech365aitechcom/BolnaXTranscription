import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Batch List API - Get all batches for user's agents
 *
 * GET /api/batch/list?agent_id=xxx (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const requestedAgentId = searchParams.get('agent_id');

    // Get API configuration
    const bolnaApiKey = process.env.BOLNA_API_KEY;

    if (!bolnaApiKey) {
      console.error('❌ Missing Bolna API configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get user's agents
    const userAgents = session.user.agents || [];

    if (userAgents.length === 0) {
      return NextResponse.json({
        batches: [],
        total: 0,
      });
    }

    // Determine which agents to fetch from
    let agentIdsToFetch: string[] = [];

    if (requestedAgentId) {
      // Verify user owns this agent
      const ownsAgent = userAgents.some(agent => agent.bolnaAgentId === requestedAgentId);
      if (!ownsAgent && session.user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized: You do not have access to this agent' },
          { status: 403 }
        );
      }
      agentIdsToFetch = [requestedAgentId];
    } else {
      // Fetch from all user's agents
      agentIdsToFetch = userAgents.map(agent => agent.bolnaAgentId);
    }

    console.log(`📋 Fetching batches for ${agentIdsToFetch.length} agent(s)`);

    // Fetch batches from all agents in parallel
    const fetchPromises = agentIdsToFetch.map(async (agentId) => {
      const bolnaUrl = `https://api.bolna.ai/batches/${agentId}/all`;

      const response = await fetch(bolnaUrl, {
        headers: {
          'Authorization': `Bearer ${bolnaApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    });

    const results = await Promise.all(fetchPromises);

    // Merge results from all agents
    const allBatches: any[] = [];

    for (const result of results) {
      if (result) {
        // Bolna API returns batches directly as an array, not wrapped in an object
        if (Array.isArray(result)) {
          allBatches.push(...result);
        } else if (result.batches && Array.isArray(result.batches)) {
          // Fallback in case API structure changes
          allBatches.push(...result.batches);
        }
      }
    }

    // Sort by created_at descending (most recent first)
    allBatches.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    console.log(`✅ Found ${allBatches.length} batch(es)`);

    return NextResponse.json({
      batches: allBatches,
      total: allBatches.length,
    });

  } catch (error) {
    console.error('❌ Batch list error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch batches',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
