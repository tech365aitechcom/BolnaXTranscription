import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Knowlarity Outbound Call Endpoint
 *
 * Initiates outbound calls where Bolna AI agent calls customers via Knowlarity
 *
 * POST /api/knowlarity/outbound
 * Body: {
 *   phone_number: string,      // Customer phone number to call
 *   agent_id?: string,          // Optional: specific Bolna agent ID
 *   metadata?: object           // Optional: additional call metadata
 * }
 */

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { phone_number, agent_id, metadata = {} } = body;

    // Validate phone number
    if (!phone_number) {
      return NextResponse.json(
        { error: 'phone_number is required' },
        { status: 400 }
      );
    }

    // Get API keys
    const bolnaApiKey = process.env.BOLNA_API_KEY;
    const knowlarityApiKey = process.env.KNOWLARITY_API_KEY;
    const knowlaritySrNumber = process.env.KNOWLARITY_SR_NUMBER;
    const defaultAgentId = process.env.BOLNA_AGENT_ID;

    if (!bolnaApiKey || !knowlarityApiKey || !knowlaritySrNumber) {
      console.error('❌ Missing API configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Use provided agent_id or default
    const finalAgentId = agent_id || defaultAgentId;

    // Verify user has access to this agent
    const userAgents = session.user.agents || [];
    const hasAccess = session.user.role === 'admin' ||
                     userAgents.some((agent) => agent.bolnaAgentId === finalAgentId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this agent' },
        { status: 403 }
      );
    }

    console.log(`📞 Initiating outbound call to ${phone_number} via Bolna agent ${finalAgentId}`);

    // Step 1: Initiate Bolna agent call
    const bolnaPayload = {
      agent_id: finalAgentId,
      recipient_phone_number: phone_number,
      metadata: {
        ...metadata,
        call_source: 'knowlarity_outbound',
        knowlarity_sr_number: knowlaritySrNumber,
        initiated_by: session.user.email,
        initiated_at: new Date().toISOString(),
      },
    };

    const bolnaResponse = await fetch('https://api.bolna.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bolnaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bolnaPayload),
    });

    if (!bolnaResponse.ok) {
      const errorText = await bolnaResponse.text();
      console.error('❌ Bolna API error:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to initiate Bolna call',
          details: errorText
        },
        { status: 500 }
      );
    }

    const bolnaData = await bolnaResponse.json();
    console.log('✅ Bolna call initiated:', bolnaData);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Outbound call initiated successfully',
      call_details: {
        phone_number,
        agent_id: finalAgentId,
        knowlarity_number: knowlaritySrNumber,
        bolna_execution_id: bolnaData.execution_id || bolnaData.id,
        initiated_by: session.user.name,
      },
      bolna_response: bolnaData,
    });

  } catch (error) {
    console.error('❌ Outbound call error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate outbound call',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check outbound call capability status
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const knowlarityConfigured = !!(
    process.env.KNOWLARITY_API_KEY &&
    process.env.KNOWLARITY_SR_NUMBER
  );

  const bolnaConfigured = !!(
    process.env.BOLNA_API_KEY &&
    process.env.BOLNA_AGENT_ID
  );

  return NextResponse.json({
    outbound_calls_enabled: knowlarityConfigured && bolnaConfigured,
    knowlarity_number: process.env.KNOWLARITY_SR_NUMBER || null,
    available_agents: session.user.agents || [],
    user: {
      name: session.user.name,
      role: session.user.role,
    },
  });
}
