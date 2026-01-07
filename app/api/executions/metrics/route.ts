import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.BOLNA_API_KEY
    const agentId = process.env.BOLNA_AGENT_ID
    const apiUrl = process.env.BOLNA_API_URL || 'https://api.bolna.ai/v2'

    if (!apiKey || !agentId) {
      return NextResponse.json(
        {
          error:
            'Missing BOLNA_API_KEY or BOLNA_AGENT_ID in environment variables',
        },
        { status: 500 }
      )
    }

    // Fetch Agent conversations (with large page size to get all data)
    const params = new URLSearchParams({
      page_number: '1',
      page_size: '1000', // Fetch up to 1000 executions for metrics calculation
    })

    const bolnaUrl = `${apiUrl}/agent/${agentId}/executions?${params.toString()}`

    const response = await fetch(bolnaUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Bolna API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch metrics from Bolna API', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const executions = data.data || []

    // Calculate metrics from Agent conversations
    const totalCost = executions.reduce((sum: number, ex: any) => {
      const cost = ex.total_cost || 0
      return sum + cost / 100 // Divide by 100 to convert to dollars
    }, 0)

    const totalDuration = executions.reduce((sum: number, ex: any) => {
      return sum + (ex.conversation_duration || 0)
    }, 0)

    const completedExecutions = executions.filter(
      (ex: any) => ex.status === 'completed'
    )
    const busyExecutions = executions.filter((ex: any) => ex.status === 'busy')

    const metrics = {
      totalExecutions: data.total || executions.length,
      totalCost: totalCost,
      totalDuration: totalDuration,
      avgCost: executions.length > 0 ? totalCost / executions.length : 0,
      avgDuration:
        executions.length > 0 ? totalDuration / executions.length : 0,
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
