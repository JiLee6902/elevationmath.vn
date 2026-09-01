import { NextResponse } from 'next/server';

// Lightweight liveness probe for the platform health check.
// Must NOT touch the database so the probe stays fast and reliable even
// during a cold start (heavy pages like `/` are force-dynamic + query DB).
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ status: 'ok' });
}
