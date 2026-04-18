import { NextRequest, NextResponse } from 'next/server';

// Proxy to the Go Playground compile API.
// Avoids CORS — the browser hits /api/compile/go; this server-side route
// forwards to go.dev/_/compile (Google's free, no-key API).
// Zero cost: we pay no API fees, there is no authentication key.
export async function POST(req: NextRequest) {
  let code: string;
  try {
    const body = await req.json();
    code = body?.code;
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing "code" field' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Enforce a reasonable size limit to prevent abuse
  if (code.length > 16_384) {
    return NextResponse.json({ error: 'Code too large (max 16 KB)' }, { status: 413 });
  }

  const params = new URLSearchParams({ body: code, version: '2' });

  try {
    const upstream = await fetch('https://go.dev/_/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(12_000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Go Playground returned ${upstream.status}` },
        { status: 502 }
      );
    }

    const data = await upstream.json() as {
      Errors?: string;
      Events?: { Message: string; Kind: string; Delay: number }[];
    };

    // Normalise to a simple { output, errors } shape for the client
    const output = (data.Events ?? [])
      .filter(e => e.Kind === 'stdout' || e.Kind === 'stderr')
      .map(e => e.Message)
      .join('');

    return NextResponse.json({ output: output.trimEnd(), errors: data.Errors ?? '' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Proxy error: ${msg}` }, { status: 502 });
  }
}
