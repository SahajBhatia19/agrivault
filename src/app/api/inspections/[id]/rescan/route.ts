import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateQualityScore, calculateBatchGrade } from '@/lib/ai/vision-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inspectionId } = await params;
    const body = await request.json();
    const { rescanDetections = [], imageUrl } = body;

    const initialInspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
    });

    if (!initialInspection) {
      return NextResponse.json({ success: false, error: 'Initial inspection not found' }, { status: 404 });
    }

    const rescanRejectCount = rescanDetections.filter((d: any) => d.category === 'REJECT').length;
    const removedRejectCount = Math.max(0, initialInspection.rejectCount - rescanRejectCount);

    const acceptableCount = rescanDetections.filter((d: any) => d.category === 'ACCEPTABLE').length;
    const lowerGradeCount = rescanDetections.filter((d: any) => d.category === 'LOWER_GRADE').length;
    const qualityScore = calculateQualityScore(acceptableCount, lowerGradeCount, rescanRejectCount);
    const newGrade = calculateBatchGrade(qualityScore);

    const rescanInspection = await prisma.inspection.create({
      data: {
        batchId: initialInspection.batchId,
        inspectionType: 'RESCAN',
        status: 'VERIFIED',
        totalDetected: rescanDetections.length,
        acceptableCount,
        lowerGradeCount,
        rejectCount: rescanRejectCount,
        rescanDeltaCount: removedRejectCount,
        qualityScore,
        aiMode: initialInspection.aiMode,
        images: imageUrl
          ? {
              create: {
                imageUrl,
                imageType: 'RESCAN',
              },
            }
          : undefined,
        detections: {
          create: rescanDetections.map((d: any, idx: number) => ({
            onionIndex: d.onionIndex || idx + 1,
            bboxX: d.bbox?.x ?? 0,
            bboxY: d.bbox?.y ?? 0,
            bboxWidth: d.bbox?.width ?? 5,
            bboxHeight: d.bbox?.height ?? 5,
            confidence: d.confidence ?? 0.9,
            category: d.category || 'ACCEPTABLE',
            defectType: d.defectType || 'NONE',
            severity: d.severity || 'NONE',
            status: d.category === 'REJECT' ? 'DETECTED' : 'VERIFIED',
          })),
        },
      },
    });

    // Update batch status
    await prisma.batch.update({
      where: { id: initialInspection.batchId },
      data: {
        currentGrade: newGrade,
        status: 'IN_STORAGE',
      },
    });

    await prisma.auditLog.create({
      data: {
        batchId: initialInspection.batchId,
        action: 'RESCAN_COMPLETED',
        details: `Rescan verified. ${removedRejectCount} rejected onions physically removed. Remaining rejects: ${rescanRejectCount}. Updated quality score: ${qualityScore}/100`,
      },
    });

    return NextResponse.json({
      success: true,
      rescanInspection,
      removedRejectCount,
      remainingRejectCount: rescanRejectCount,
      newGrade,
      qualityScore,
      isVerified: rescanRejectCount === 0 || removedRejectCount > 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
