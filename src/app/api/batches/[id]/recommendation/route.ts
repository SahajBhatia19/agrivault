import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: batchId } = await params;
    const body = await request.json();
    const { actionStatus = 'APPROVED', overrideReason, decidedBy = 'Lead Inspector' } = body;

    const latestRecommendation = await prisma.recommendation.findFirst({
      where: { batchId },
      orderBy: { timestamp: 'desc' },
    });

    if (!latestRecommendation) {
      return NextResponse.json({ success: false, error: 'No pending recommendation found' }, { status: 404 });
    }

    const updatedRecommendation = await prisma.recommendation.update({
      where: { id: latestRecommendation.id },
      data: {
        status: actionStatus,
        overrideReason: actionStatus === 'OVERRIDDEN' ? overrideReason : null,
        decidedBy,
        decidedAt: new Date(),
      },
    });

    // Log intervention
    await prisma.intervention.create({
      data: {
        batchId,
        actionTaken: actionStatus === 'APPROVED' ? `APPROVED: ${latestRecommendation.action}` : `OVERRIDDEN: ${latestRecommendation.action}`,
        performedBy: decidedBy,
        notes: actionStatus === 'OVERRIDDEN' ? `Override Reason: ${overrideReason}` : 'Action approved as recommended by AI Risk Engine.',
      },
    });

    await prisma.auditLog.create({
      data: {
        batchId,
        action: actionStatus === 'APPROVED' ? 'RECOMMENDATION_APPROVED' : 'RECOMMENDATION_OVERRIDDEN',
        details: `Recommendation '${latestRecommendation.title}' was ${actionStatus.toLowerCase()} by ${decidedBy}${overrideReason ? ` (${overrideReason})` : ''}`,
      },
    });

    return NextResponse.json({ success: true, recommendation: updatedRecommendation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
