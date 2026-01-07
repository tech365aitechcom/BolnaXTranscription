import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing url', { status: 400 })
  }

  const res = await fetch(url)

  return new NextResponse(res.body, {
    headers: {
      'Content-Type': res.headers.get('content-type') || 'audio/mpeg',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
