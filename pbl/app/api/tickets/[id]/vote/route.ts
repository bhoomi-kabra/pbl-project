import { NextRequest, NextResponse } from 'next/server';
import { recordVote } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { voteType, userEmail, userName, reason } = body;

    if (!voteType || !['UPVOTE', 'CONFIRM', 'REOPEN'].includes(voteType)) {
      return NextResponse.json({ success: false, error: 'Invalid voteType' }, { status: 400 });
    }

    const result = await recordVote(
      id,
      voteType,
      userEmail || 'citizen@nashik.gov.in',
      userName || 'Local Citizen',
      reason
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket: result.ticket, message: result.message });
  } catch (error) {
    console.error('API POST /api/tickets/[id]/vote error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record vote' }, { status: 500 });
  }
}
