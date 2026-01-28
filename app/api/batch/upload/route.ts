import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Batch Upload API - Upload CSV file to create a batch call campaign
 *
 * POST /api/batch/upload
 *
 * Form data:
 * - file: CSV file with contact numbers and variables
 * - agent_id: Optional agent ID (uses default if not provided)
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const agentId = formData.get('agent_id') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'CSV file is required' },
        { status: 400 }
      );
    }

    // Get API configuration
    const bolnaApiKey = process.env.BOLNA_API_KEY;
    const defaultAgentId = process.env.BOLNA_AGENT_ID;

    if (!bolnaApiKey) {
      console.error('❌ Missing Bolna API configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Use provided agent_id or default
    const finalAgentId = agentId || defaultAgentId;

    if (!finalAgentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

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

    console.log(`📤 Uploading batch CSV for agent ${finalAgentId}`);
    console.log(`   File: ${file.name} (${file.size} bytes)`);

    // Create FormData for Bolna API
    const bolnaFormData = new FormData();
    bolnaFormData.append('agent_id', finalAgentId);
    bolnaFormData.append('file', file);

    // Upload to Bolna API
    const bolnaResponse = await fetch('https://api.bolna.ai/batches', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bolnaApiKey}`,
      },
      body: bolnaFormData,
    });

    if (!bolnaResponse.ok) {
      const errorText = await bolnaResponse.text();
      console.error('❌ Bolna API error:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to upload batch',
          details: errorText
        },
        { status: bolnaResponse.status }
      );
    }

    const bolnaData = await bolnaResponse.json();
    console.log('✅ Batch uploaded successfully:', bolnaData.batch_id);

    return NextResponse.json({
      success: true,
      message: 'Batch uploaded successfully',
      batch_id: bolnaData.batch_id,
      agent_id: finalAgentId,
      uploaded_by: session.user.email,
      data: bolnaData,
    });

  } catch (error) {
    console.error('❌ Batch upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload batch',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
