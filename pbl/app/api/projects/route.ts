import { NextRequest, NextResponse } from 'next/server';
import { getRoadProjects, updateProjectPhase } from '@/lib/db';
import { RoadWorkPhase } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ward = searchParams.get('ward') || undefined;
    const projects = await getRoadProjects(ward);
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('API GET /api/projects error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch road projects' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, phase, completionPercentage } = body;

    if (!projectId || !phase) {
      return NextResponse.json({ success: false, error: 'Missing projectId or phase' }, { status: 400 });
    }

    const result = await updateProjectPhase(
      projectId,
      phase as RoadWorkPhase,
      completionPercentage || 50
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: result.project });
  } catch (error) {
    console.error('API PATCH /api/projects error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update project phase' }, { status: 500 });
  }
}
