import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: batchId } = await params;
    const body = await request.json();
    const {
      actualDefectRate = 8.5,
      finalQualityScore = 76.0,
      quantityLostKg = 42.0,
      finalRealizedValue = 45800,
      aiAccuracyRating = 91.5,
      notes = 'Batch dispatched to retail chain. Actual loss matched AI risk prediction within 3.5% margin.',
    } = body;

    const outcome = await prisma.outcome.upsert({
      where: { batchId },
      create: {
        batchId,
        actualDefectRate: Number(actualDefectRate),
        finalQualityScore: Number(finalQualityScore),
        quantityLostKg: Number(quantityLostKg),
        finalRealizedValue: Number(finalRealizedValue),
        aiAccuracyRating: Number(aiAccuracyRating),
        notes,
      },
      update: {
        actualDefectRate: Number(actualDefectRate),
        finalQualityScore: Number(finalQualityScore),
        quantityLostKg: Number(quantityLostKg),
        finalRealizedValue: Number(finalRealizedValue),
        aiAccuracyRating: Number(aiAccuracyRating),
        notes,
      },
    });

    // Update batch status to DISPATCHED
    await prisma.batch.update({
      where: { id: batchId },
      data: { status: 'DISPATCHED' },
    });

    await prisma.auditLog.create({
      data: {
        batchId,
        action: 'OUTCOME_RECORDED',
        details: `Final dispatch outcome recorded. Loss: ${quantityLostKg} kg, Realized Value: ₹${finalRealizedValue}, AI Accuracy: ${aiAccuracyRating}%`,
      },
    });

    return NextResponse.json({ success: true, outcome });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
