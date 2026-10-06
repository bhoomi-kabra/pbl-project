import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    const result = await initializeDatabase();
    return NextResponse.json({
      success: true,
      databaseUrlConfigured: !!(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL),
      result
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
