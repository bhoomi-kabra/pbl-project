import { NextRequest, NextResponse } from 'next/server';
import { getTickets, createTicket } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ward = searchParams.get('ward') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;

    const tickets = await getTickets(ward, category, status);
    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('API GET /api/tickets error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      ward,
      locationName,
      lat,
      lng,
      beforeImageUrl,
      citizenName,
      citizenEmail
    } = body;

    if (!title || !description || !category || !ward || !locationName || !beforeImageUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required complaint parameters' },
        { status: 400 }
      );
    }

    const ticket = await createTicket({
      title,
      description,
      category,
      ward,
      locationName,
      lat: lat || 19.9975,
      lng: lng || 73.7898,
      beforeImageUrl,
      status: 'SUBMITTED',
      citizenName: citizenName || 'Verified Citizen',
      citizenEmail: citizenEmail || 'citizen@nashik.gov.in'
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/tickets error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create ticket' }, { status: 500 });
  }
}
