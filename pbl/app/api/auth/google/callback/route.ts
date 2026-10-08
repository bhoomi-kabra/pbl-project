import { NextRequest, NextResponse } from 'next/server';
import { exchangeGoogleCode, getGoogleUserInfo, signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { upsertUser } from '@/lib/db';
import { UserProfile } from '@/lib/types';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    console.error('Google OAuth callback returned error:', error || 'missing_code');
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error || 'missing_code')}`);
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;
    const tokenData = await exchangeGoogleCode(code, redirectUri);
    const userInfo = await getGoogleUserInfo(tokenData.access_token);

    // Decode requested role from OAuth state payload
    const stateRaw = searchParams.get('state');
    let selectedRole = 'CITIZEN';
    if (stateRaw) {
      try {
        const parsed = JSON.parse(Buffer.from(stateRaw, 'base64url').toString('utf8'));
        if (['CITIZEN', 'WARD_ENGINEER', 'CONTRACTOR', 'SUPER_ADMIN'].includes(parsed.role)) {
          selectedRole = parsed.role;
        }
      } catch {
        // Fallback to default
      }
    }

    // Force SUPER_ADMIN if bhoomikabra12@gmail.com
    if (userInfo.email === 'bhoomikabra12@gmail.com') {
      selectedRole = 'SUPER_ADMIN';
    }

    // Prepare profile from Google data
    const userPayload: UserProfile = {
      id: userInfo.sub || `google_${Date.now()}`,
      name: userInfo.name || userInfo.email?.split('@')[0] || 'Nashik Citizen',
      email: userInfo.email,
      avatar: userInfo.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userInfo.email)}`,
      role: selectedRole as any,
      ward: 'Nashik West'
    };

    // Upsert into Neon DB or persistent memory store
    const savedUser = await upsertUser(userPayload);

    // Create signed session token
    const sessionToken = signSessionToken(savedUser);

    // Build redirect response with secure session cookie
    const targetTab = (selectedRole === 'SUPER_ADMIN' || savedUser.role === 'SUPER_ADMIN' || savedUser.email === 'bhoomikabra12@gmail.com')
      ? 'superadmin'
      : selectedRole === 'WARD_ENGINEER'
      ? 'engineer'
      : selectedRole === 'CONTRACTOR'
      ? 'contractor'
      : 'feed';
    const response = NextResponse.redirect(`${origin}/?auth_success=1&tab=${targetTab}`);
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('Google OAuth Exchange Error:', err);
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(err.message || 'token_exchange_failed')}`);
  }
}
