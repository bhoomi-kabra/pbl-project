import { NextRequest, NextResponse } from 'next/server';
import { submitContractorProof } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { afterImageUrl, contractorName, note } = body;

    if (!afterImageUrl || !contractorName) {
      return NextResponse.json(
        { success: false, error: 'Missing afterImageUrl or contractorName' },
        { status: 400 }
      );
    }

    const result = await submitContractorProof(id, afterImageUrl, contractorName, note);
    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket: result.ticket });
  } catch (error) {
    console.error('API POST /api/tickets/[id]/proof error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit proof' }, { status: 500 });
  }
}
