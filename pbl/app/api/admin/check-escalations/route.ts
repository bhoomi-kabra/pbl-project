import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * POST /api/admin/check-escalations
 * Sweeps open tickets older than 48 hours and auto-escalates them to the Commissioner (Super Admin)
 */
export async function POST(_req: NextRequest) {
  try {
    const escalationQuery = `
      UPDATE complaints
      SET status = 'ESCALATED_TO_SUPER_ADMIN'
      WHERE status IN ('OPEN', 'ASSIGNED') 
      AND created_at < NOW() - INTERVAL '48 hours'
      RETURNING id, title, sector, created_at;
    `;

    const result = await pool.query(escalationQuery);

    return NextResponse.json({
      success: true,
      message: 'SLA Sweep completed. Automated escalation engines fired.',
      escalated_count: result.rowCount,
      escalated_tickets: result.rows
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SLA engine sweep failed: ' + error.message },
      { status: 500 }
    );
  }
}
