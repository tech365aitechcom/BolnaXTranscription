import { NextResponse } from 'next/server';

/**
 * Download Example CSV - Proxy endpoint to download Bolna's example CSV
 * This bypasses CORS restrictions by fetching server-side
 *
 * GET /api/batch/example-csv
 */
export async function GET() {
  try {
    // Fetch the example CSV from Bolna's S3 bucket (server-side, no CORS issues)
    const response = await fetch(
      'https://bolna-public.s3.amazonaws.com/Bolna+batch+calling+example+csv.csv'
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch example CSV from Bolna' },
        { status: 500 }
      );
    }

    // Get the CSV content
    const csvContent = await response.text();

    // Return the CSV with custom filename in headers
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="hireagent-batch-calling-example.csv"',
      },
    });
  } catch (error) {
    console.error('Error downloading example CSV:', error);
    return NextResponse.json(
      { error: 'Failed to download example CSV' },
      { status: 500 }
    );
  }
}
