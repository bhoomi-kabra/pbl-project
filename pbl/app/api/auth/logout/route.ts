import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin || 'http://localhost:3000';
  const response = NextResponse.redirect(`${origin}/`);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
