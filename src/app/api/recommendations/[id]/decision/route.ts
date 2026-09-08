import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HumanDecisionSchema } from '@/lib/validations/api-schemas';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recommendationId } = await params;
    const rawBody = await request.json();
    const validation = HumanDecisionSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { actionStatus, overrideReason, decidedBy } = validation.data;

    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      return NextResponse.json({ success: false, error: 'Recommendation not found' }, { status: 404 });
    }

    const updatedRecommendation = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: actionStatus,
        overrideReason: actionStatus === 'OVERRIDDEN' ? overrideReason : null,
        decidedBy,
        decidedAt: new Date(),
      },
    });

    // Create HumanDecision model entry
    const decisionEntry = await prisma.humanDecision.create({
      data: {
        recommendationId,
        decision: actionStatus === 'APPROVED' ? 'APPROVE' : 'OVERRIDE',
        overrideReason: actionStatus === 'OVERRIDDEN' ? overrideReason : null,
        timestamp: new Date(),
      },
    });

    // Create Batch Event
    await prisma.batchEvent.create({
      data: {
        batchId: recommendation.batchId,
        eventType: 'HUMAN_DECISION',
        title: `RECOMMENDATION ${actionStatus}`,
        description: `Human operator (${decidedBy}) ${actionStatus.toLowerCase()} action '${recommendation.action}'${overrideReason ? `. Reason: ${overrideReason}` : ''}`,
      },
    });

    // Log Audit
    await prisma.auditLog.create({
      data: {
        batchId: recommendation.batchId,
        entity: 'RECOMMENDATION',
        entityId: recommendationId,
        action: actionStatus === 'APPROVED' ? 'RECOMMENDATION_APPROVED' : 'RECOMMENDATION_OVERRIDDEN',
        details: `Action '${recommendation.title}' ${actionStatus.toLowerCase()} by ${decidedBy}`,
      },
    });

    return NextResponse.json({ success: true, recommendation: updatedRecommendation, decisionEntry });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
