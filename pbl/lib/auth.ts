import crypto from 'crypto';
import { UserProfile, UserRole, Ward } from './types';

const AUTH_SECRET = 
  process.env.AUTH_SECRET || 
  process.env.GOOGLE_CLIENT_SECRET || 
  'nashik-monitor-secure-civic-auth-key-2026';

export const SESSION_COOKIE_NAME = 'nmc_session_token';

/**
 * Checks whether Google OAuth is configured in .env.local
 */
export function isGoogleOAuthConfigured(): boolean {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(
    clientId && 
    clientSecret && 
    !clientId.includes('your_google_client_id') && 
    !clientSecret.includes('your_google_client_secret')
  );
}

/**
 * Generates the Google OAuth 2.0 authorization URL with role encoding
 */
export function getGoogleAuthUrl(origin: string, role: string = 'CITIZEN'): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const redirectUri = `${origin}/api/auth/google/callback`;
  const statePayload = {
    nonce: crypto.randomBytes(8).toString('hex'),
    role: role
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges authorization code for Google access tokens
 */
export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Google token exchange failed: ${errorData}`);
  }

  return await res.json();
}

/**
 * Fetches user profile data from Google using access token
 */
export async function getGoogleUserInfo(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Google userinfo fetch failed: ${errorData}`);
  }

  return await res.json();
}

/**
 * Signs user session payload into a secure HMAC-SHA256 token
 */
export function signSessionToken(user: UserProfile): string {
  const payload = {
    ...user,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verifies and decodes the HMAC-SHA256 session token
 */
export function verifySessionToken(token: string): UserProfile | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');

    if (signature.length !== expectedSig.length) return null;
    const match = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
    if (!match) return null;

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      avatar: payload.avatar,
      role: payload.role as UserRole,
      ward: payload.ward as Ward
    };
  } catch {
    return null;
  }
}
