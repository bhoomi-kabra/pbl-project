import { NextRequest, NextResponse } from 'next/server';
import { updateTicketByAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      ticketId, 
      status, 
      ward, 
      category, 
      contractorName, 
      reopenReason, 
      fineIssued, 
      actionNote, 
      performedBy 
    } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: 'ticketId is required' }, { status: 400 });
    }

    const result = await updateTicketByAdmin(ticketId, {
      status,
      ward,
      category,
      contractorName,
      reopenReason,
      fineIssued,
      actionNote,
      performedBy: performedBy || 'Bhoomi Kabra (Municipal Commissioner)'
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API /api/admin/action error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
