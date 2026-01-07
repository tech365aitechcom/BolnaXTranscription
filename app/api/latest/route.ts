import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  try {
    const conversation = storage.getConversation();

    // Return the conversation object (just like example.json)
    // Returns null if no conversation has been received yet
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
