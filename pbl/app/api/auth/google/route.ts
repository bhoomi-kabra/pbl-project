import { NextRequest, NextResponse } from 'next/server';
import { isGoogleOAuthConfigured, getGoogleAuthUrl } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'GOOGLE_OAUTH_NOT_CONFIGURED',
        message: 'Google OAuth Client ID & Secret are not configured yet in .env.local',
        steps: [
          '1. Go to Google Cloud Console (https://console.cloud.google.com/)',
          '2. Create an OAuth 2.0 Client ID for Web Application',
          '3. Add Authorized Redirect URI: http://localhost:3000/api/auth/google/callback',
          '4. Paste GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET into .env.local'
        ]
      },
      { status: 400 }
    );
  }

  const role = request.nextUrl.searchParams.get('role') || 'CITIZEN';
  const authUrl = getGoogleAuthUrl(origin, role);
  return NextResponse.redirect(authUrl);
}
