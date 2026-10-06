import { NextResponse } from 'next/server';
import { isGoogleOAuthConfigured } from '@/lib/auth';

export async function GET() {
  const configured = isGoogleOAuthConfigured();
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;

  return NextResponse.json({
    configured,
    clientId: configured ? clientId : null,
    redirectUri: '/api/auth/google/callback'
  });
}
