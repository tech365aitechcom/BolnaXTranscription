import { NextRequest } from 'next/server';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialData = `data: ${JSON.stringify({ type: 'connected', message: 'Connected to live updates' })}\n\n`;
      controller.enqueue(encoder.encode(initialData));

      // Subscribe to storage updates
      const unsubscribe = storage.subscribe((data) => {
        const eventData = `data: ${JSON.stringify({ type: 'conversation', data })}\n\n`;
        try {
          controller.enqueue(encoder.encode(eventData));
        } catch (error) {
          console.error('Error sending SSE:', error);
        }
      });

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          const heartbeatData = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`;
          controller.enqueue(encoder.encode(heartbeatData));
        } catch (error) {
          console.error('Error sending heartbeat:', error);
          clearInterval(heartbeat);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
