import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_DEMO_BATCH_125 } from '@/lib/data-fallback';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let batch = null;
    try {
      batch = await prisma.batch.findUnique({
        where: { id },
        include: {
          organization: true,
          samples: { orderBy: { timestamp: 'desc' } },
          inspections: {
            orderBy: { timestamp: 'desc' },
            include: {
              images: true,
              detections: { orderBy: { onionIndex: 'asc' } },
            },
          },
          environmentalReadings: { orderBy: { timestamp: 'desc' } },
          riskAssessments: { orderBy: { timestamp: 'desc' } },
          recommendations: { orderBy: { timestamp: 'desc' } },
          interventions: { orderBy: { timestamp: 'desc' } },
          outcomes: true,
          devices: true,
          auditLogs: { orderBy: { timestamp: 'desc' } },
        },
      });
    } catch (e) {
      console.warn('Prisma lookup error, falling back to mock batch:', e);
    }

    if (!batch && (id === 'ON-2026-00125' || id.startsWith('ON-'))) {
      batch = MOCK_DEMO_BATCH_125 as any;
    }

    if (!batch) {
      return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
