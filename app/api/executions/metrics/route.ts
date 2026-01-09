import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.BOLNA_API_KEY
    const apiUrl = process.env.BOLNA_API_URL || 'https://api.bolna.ai/v2'

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing BOLNA_API_KEY in environment variables' },
        { status: 500 }
      )
    }

    const userAgents = session.user.agents || []

    if (userAgents.length === 0) {
      return NextResponse.json({
        totalExecutions: 0,
        totalCost: 0,
        totalDuration: 0,
        avgCost: 0,
        avgDuration: 0,
        statusCounts: {
          busy: 0,
          completed: 0,
        },
      })
    }

    // Check if filtering by specific agent
    const searchParams = request.nextUrl.searchParams
    const requestedAgentId = searchParams.get('agent_id')

    // Determine which agents to fetch from
    let agentIdsToFetch: string[] = []

    if (requestedAgentId) {
      // Verify user owns this agent
      const ownsAgent = userAgents.some(
        (agent) => agent.bolnaAgentId === requestedAgentId
      )
      if (!ownsAgent) {
        return NextResponse.json(
          { error: 'Unauthorized: You do not have access to this agent' },
          { status: 403 }
        )
      }
      agentIdsToFetch = [requestedAgentId]
    } else {
      // Fetch from all user's agents
      agentIdsToFetch = userAgents.map((agent) => agent.bolnaAgentId)
    }

    // Fetch Agent conversations (with large page size to get all data)
    const params = new URLSearchParams({
      page_number: '1',
      page_size: '1000', // Fetch up to 1000 executions for metrics calculation
    })

    // Fetch from all agents in parallel
    const fetchPromises = agentIdsToFetch.map((agentId) => {
      const bolnaUrl = `${apiUrl}/agent/${agentId}/executions?${params.toString()}`
      return fetch(bolnaUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }).then((res) => (res.ok ? res.json() : null))
    })

    const results = await Promise.all(fetchPromises)

    // Merge results from all agents
    const allExecutions: any[] = []

    for (const result of results) {
      if (result?.data) {
        allExecutions.push(...result.data)
      }
    }

    // Calculate metrics from Agent conversations
    const totalCost = allExecutions.reduce((sum: number, ex: any) => {
      const cost = ex.total_cost || 0
      return sum + cost / 100 // Divide by 100 to convert to dollars
    }, 0)

    const totalDuration = allExecutions.reduce((sum: number, ex: any) => {
      return sum + (ex.conversation_duration || 0)
    }, 0)

    const completedExecutions = allExecutions.filter(
      (ex: any) => ex.status === 'completed'
    )
    const busyExecutions = allExecutions.filter(
      (ex: any) => ex.status === 'busy'
    )

    const metrics = {
      totalExecutions: allExecutions.length,
      totalCost: totalCost,
      totalDuration: totalDuration,
      avgCost: allExecutions.length > 0 ? totalCost / allExecutions.length : 0,
      avgDuration:
        allExecutions.length > 0 ? totalDuration / allExecutions.length : 0,
      statusCounts: {
        busy: busyExecutions.length,
        completed: completedExecutions.length,
      },
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
