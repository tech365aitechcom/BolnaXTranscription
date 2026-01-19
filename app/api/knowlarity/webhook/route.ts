import { NextRequest, NextResponse } from 'next/server';

/**
 * Knowlarity Webhook Endpoint for Inbound Calls
 *
 * This endpoint receives webhook notifications from Knowlarity when an inbound call arrives.
 * It then triggers the Bolna AI agent to handle the call.
 *
 * Configure this webhook URL in your Knowlarity dashboard:
 * https://your-domain.com/api/knowlarity/webhook
 */

export async function POST(request: NextRequest) {
  try {
    // Security: Verify request is from Knowlarity by checking origin or add secret token
    const userAgent = request.headers.get('user-agent');
    const origin = request.headers.get('origin');

    console.log('📞 Webhook request from:', { userAgent, origin });

    // Parse incoming webhook data from Knowlarity
    const payload = await request.json();

    console.log('📞 Incoming Knowlarity webhook payload:', JSON.stringify(payload, null, 2));

    // Extract call details from Knowlarity payload
    const {
      caller_id,      // Customer's phone number
      uuid,           // Unique call ID from Knowlarity
      sr_number,      // Knowlarity number that was called
      call_type,      // Type of call
      start_time,     // Call start time
    } = payload;

    if (!caller_id) {
      return NextResponse.json(
        { error: 'Missing caller_id in webhook payload' },
        { status: 400 }
      );
    }

    // Get Bolna API configuration
    const bolnaApiKey = process.env.BOLNA_API_KEY;
    const bolnaAgentId = process.env.BOLNA_AGENT_ID;

    if (!bolnaApiKey || !bolnaAgentId) {
      console.error('❌ Missing Bolna API configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Prepare Bolna agent call initiation
    // This will connect the Bolna AI agent to handle the call
    const bolnaPayload = {
      agent_id: bolnaAgentId,
      recipient_phone_number: caller_id,
      metadata: {
        knowlarity_uuid: uuid,
        knowlarity_sr_number: sr_number,
        call_source: 'knowlarity_inbound',
        start_time: start_time,
      },
    };

    console.log('🤖 Initiating Bolna agent call:', bolnaPayload);

    // Trigger Bolna agent to call the customer
    // Note: This is asynchronous - we don't wait for the call to complete
    const bolnaResponse = await fetch('https://api.bolna.ai/v2/call', {
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
          error: 'Failed to initiate Bolna agent',
          details: errorText
        },
        { status: 500 }
      );
    }

    const bolnaData = await bolnaResponse.json();
    console.log('✅ Bolna agent initiated successfully:', bolnaData);

    // Return success response to Knowlarity
    return NextResponse.json({
      success: true,
      message: 'Call routed to Bolna agent',
      knowlarity_call_id: uuid,
      bolna_execution_id: bolnaData.execution_id || bolnaData.id,
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook verification/testing
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Knowlarity webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
