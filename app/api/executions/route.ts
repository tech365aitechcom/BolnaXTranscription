import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Get query parameters from request
    const searchParams = request.nextUrl.searchParams;
    const pageNumber = searchParams.get('page_number') || '1';
    const pageSize = searchParams.get('page_size') || '20';
    const status = searchParams.get('status');
    const callType = searchParams.get('call_type');
    const requestedAgentId = searchParams.get('agent_id'); // Optional: filter by specific agent

    // Get user's agents
    const userAgents = session.user.agents || [];

    if (userAgents.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: {
          page_number: parseInt(pageNumber),
          page_size: parseInt(pageSize),
          total_count: 0,
          total_pages: 0,
        },
      });
    }

    // Determine which agents to fetch from
    let agentIdsToFetch: string[] = [];

    if (requestedAgentId) {
      // Verify user owns this agent
      const ownsAgent = userAgents.some(agent => agent.bolnaAgentId === requestedAgentId);
      if (!ownsAgent) {
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

    // Build query string
    const params = new URLSearchParams({
      page_number: pageNumber,
      page_size: pageSize,
    });

    if (status) params.append('status', status);
    if (callType) params.append('call_type', callType);

    // Fetch from all agents in parallel
    const fetchPromises = agentIdsToFetch.map(agentId => {
      const bolnaUrl = `${apiUrl}/agent/${agentId}/executions?${params.toString()}`;
      return fetch(bolnaUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }).then(res => res.ok ? res.json() : null);
    });

    const results = await Promise.all(fetchPromises);

    // Merge results from all agents
    const allExecutions: any[] = [];
    let totalCount = 0;

    for (const result of results) {
      if (result?.data) {
        allExecutions.push(...result.data);
        totalCount += result.pagination?.total_count || 0;
      }
    }

    // Sort by created_at descending (most recent first)
    allExecutions.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    // Apply pagination to merged results
    const pageSizeNum = parseInt(pageSize);
    const pageNumberNum = parseInt(pageNumber);
    const startIndex = (pageNumberNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;
    const paginatedExecutions = allExecutions.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedExecutions,
      pagination: {
        page_number: pageNumberNum,
        page_size: pageSizeNum,
        total_count: allExecutions.length,
        total_pages: Math.ceil(allExecutions.length / pageSizeNum),
      },
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
