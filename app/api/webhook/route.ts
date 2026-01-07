import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { WebhookData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const data: WebhookData = await request.json();

    // Validate that we have required fields
    if (!data.id || !data.transcript) {
      return NextResponse.json(
        { error: 'Missing required fields: id and transcript' },
        { status: 400 }
      );
    }

    // Store the conversation data (replaces previous one)
    storage.setConversation(data);

    console.log(`Received webhook for conversation ${data.id}`);
    console.log(`Transcript length: ${data.transcript.length} characters`);
    console.log(`Status: ${data.status}`);

    return NextResponse.json({
      success: true,
      message: 'Webhook received successfully',
      conversationId: data.id,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to test if endpoint is working
export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint is active',
    endpoint: '/api/webhook',
    method: 'POST',
    instructions: 'Send POST requests with conversation data to this endpoint',
  });
}
