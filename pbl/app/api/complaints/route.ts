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
 * GET /api/complaints
 * Fetches real citizen complaints directly from Neon DB tickets table.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sector = searchParams.get('sector');
    const ward = searchParams.get('ward');

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

    let complaints = result.rows.map((row) => {
      const assignedSector = getSectorFromCategory(row.category, `${row.title} ${row.description}`);
      return {
        ...row,
        sector: assignedSector,
        citizen_username: row.citizen_name || row.citizen_email
      };
    });

    if (sector && sector !== 'ALL') {
      complaints = complaints.filter((c) => c.sector === sector);
    }
    if (ward && ward !== 'All') {
      complaints = complaints.filter((c) => c.ward === ward);
    }

    return NextResponse.json({
      success: true,
      total: complaints.length,
      complaints
    });
  } catch (error: any) {
    console.error('Error fetching complaints from tickets table:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/complaints
 * Logs a new complaint directly into Neon DB tickets table and complaints table.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      title, 
      description, 
      latitude, 
      longitude, 
      ward,
      locationName,
      beforeImageUrl,
      citizenName, 
      citizenEmail 
    } = body;

    if (!title || !description || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required geo-metadata or text payload parameters.' },
        { status: 400 }
      );
    }

    const assignedSector = getSectorFromCategory('', `${title} ${description}`);
    const newId = `tkt-${Date.now()}`;
    const defaultWard = ward || 'Panchavati';
    const locName = locationName || `Nashik (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

    // Map sector to ticket category
    let category = 'POTHOLE';
    if (assignedSector === 'SOLID_WASTE') category = 'GARBAGE_DUMP';
    else if (assignedSector === 'DRAINAGE_SEWAGE') category = 'OPEN_MANHOLE';
    else if (assignedSector === 'ELECTRICAL') category = 'ELECTRICAL_WIRE';
    else if (assignedSector === 'WATER_SUPPLY') category = 'WATER_LEAKAGE';

    const insertTicketQuery = `
      INSERT INTO tickets (
        id, title, description, category, ward, location_name, lat, lng,
        before_image_url, status, citizen_name, citizen_email, upvotes,
        confirm_votes, reopen_votes, impact_score, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, 'SUBMITTED', $10, $11, 1, 0, 0, 100, NOW()
      )
      RETURNING *;
    `;

    const ticketResult = await pool.query(insertTicketQuery, [
      newId,
      title,
      description,
      category,
      defaultWard,
      locName,
      latitude,
      longitude,
      beforeImageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      citizenName || 'Verified Citizen',
      citizenEmail || 'citizen@nashik.gov.in'
    ]);

    return NextResponse.json(
      {
        success: true,
        message: `Complaint routed successfully to the ${assignedSector} Department queue.`,
        ticket: ticketResult.rows[0],
        sector: assignedSector
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API /api/complaints error:', error);
    return NextResponse.json(
      { error: 'Neon Database transaction error: ' + error.message },
      { status: 500 }
    );
  }
}
