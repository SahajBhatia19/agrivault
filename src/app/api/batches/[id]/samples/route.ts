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
      sampleSize = 100,
      sampledTop = true,
      sampledMiddle = true,
      sampledLeftSide = true,
      sampledRightSide = true,
      sampledLower = true,
      samplingNotes = 'Representative sampling drawn from 5 quadrants',
    } = body;

    const sample = await prisma.batchSample.create({
      data: {
        batchId,
        sampleSize: Number(sampleSize),
        sampledTop: Boolean(sampledTop),
        sampledMiddle: Boolean(sampledMiddle),
        sampledLeftSide: Boolean(sampledLeftSide),
        sampledRightSide: Boolean(sampledRightSide),
        sampledLower: Boolean(sampledLower),
        samplingNotes,
      },
    });

    await prisma.auditLog.create({
      data: {
        batchId,
        action: 'SAMPLE_RECORDED',
        details: `Representative sample of ${sampleSize} onions logged from 5 cart locations`,
      },
    });

    return NextResponse.json({ success: true, sample }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
