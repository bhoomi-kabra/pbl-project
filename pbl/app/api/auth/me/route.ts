import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { getUserByEmail } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const sessionUser = verifySessionToken(token);
  if (!sessionUser) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  // Refresh latest data from database
  try {
    const dbUser = await getUserByEmail(sessionUser.email);
    return NextResponse.json({
      authenticated: true,
      user: dbUser || sessionUser
    });
  } catch (err) {
    return NextResponse.json({
      authenticated: true,
      user: sessionUser
    });
  }
}
