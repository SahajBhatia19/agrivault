import { NextRequest, NextResponse } from 'next/server';
import { analyzeOnionImage } from '@/lib/ai/vision-engine';
import { AnalyzeImageSchema } from '@/lib/validations/api-schemas';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validation = AnalyzeImageSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { image, isRescan, previousRejectIds } = validation.data;
    const analysis = await analyzeOnionImage(image, isRescan, previousRejectIds);

    return NextResponse.json({
      success: true,
      ...analysis,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
