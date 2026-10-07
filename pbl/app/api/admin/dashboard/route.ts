import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function getSectorFromCategory(category: string, textPayload: string = ''): string {
  const cat = (category || '').toUpperCase();
  const text = textPayload.toLowerCase();

  if (cat.includes('GARBAGE') || cat.includes('WASTE') || text.includes('garbage') || text.includes('waste') || text.includes('dump') || text.includes('कचरा')) {
    return 'SOLID_WASTE';
  }
  if (cat.includes('MANHOLE') || cat.includes('DRAINAGE') || cat.includes('SEWER') || text.includes('sewer') || text.includes('manhole') || text.includes('drainage') || text.includes('गटर') || text.includes('ड्रेनेज')) {
    return 'DRAINAGE_SEWAGE';
  }
  if (cat.includes('WIRE') || cat.includes('LIGHT') || cat.includes('ELECTRICAL') || text.includes('light') || text.includes('pole') || text.includes('electricity') || text.includes('wire') || text.includes('लाइट')) {
    return 'ELECTRICAL';
  }
  if (cat.includes('WATER') || text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('पाणी')) {
    return 'WATER_SUPPLY';
  }
  return 'PUBLIC_WORKS_ROADS';
}

/**
 * GET /api/admin/dashboard
 * Fetch department queues from real Neon DB tickets table.
 * Super Admin sees all; Sub-Admin filtered by assigned sector.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'SUPER_ADMIN';
    const sector = searchParams.get('sector');

    const result = await pool.query(`
      SELECT 
        id,
        title,
        description,
        category,
        ward,
        location_name,
        lat as latitude,
        lng as longitude,
        before_image_url,
        after_image_url,
        status,
        citizen_name,
        citizen_email,
        contractor_name,
        upvotes,
        confirm_votes,
        reopen_votes,
        impact_score,
        created_at
      FROM tickets
      ORDER BY created_at DESC;
    `);

    let data = result.rows.map((row) => {
      const assignedSector = getSectorFromCategory(row.category, `${row.title} ${row.description}`);
      return {
        ...row,
        sector: assignedSector,
        citizen_username: row.citizen_name || row.citizen_email
      };
    });

    if (role !== 'SUPER_ADMIN' && sector) {
      data = data.filter((item) => item.sector === sector);
    }

    return NextResponse.json({
      role,
      total_tickets: data.length,
      data
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard data from tickets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
