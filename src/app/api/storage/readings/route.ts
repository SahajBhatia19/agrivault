import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StorageReadingSchema } from '@/lib/validations/api-schemas';
import { calculateDeteriorationRisk } from '@/lib/risk-engine';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validation = StorageReadingSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { batchId, temperature, humidity, source, deviceId } = validation.data;

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }

    const reading = await prisma.storageReading.create({
      data: {
        batchId,
        temperature,
        humidity,
        source,
      },
    });

    // Recalculate Risk
    const storageDays = Math.max(1, Math.round((Date.now() - new Date(batch.registrationDate).getTime()) / (1000 * 60 * 60 * 24)));
    const riskResult = calculateDeteriorationRisk({
      initialQualityScore: batch.initialQualityScore || 78,
      currentTemperature: temperature,
      currentHumidity: humidity,
      storageDays,
      quantityKg: batch.quantityKg,
      unitValue: batch.estimatedUnitValue,
    });

    // Save Risk Assessment
    await prisma.riskAssessment.create({
      data: {
        batchId,
        riskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        humidityFactor: riskResult.factors.humidityExposure,
        temperatureFactor: riskResult.factors.temperatureExposure,
        deteriorationFactor: riskResult.factors.visibleDeterioration,
        durationFactor: riskResult.factors.storageDuration,
        initialQualityFactor: riskResult.factors.initialQualityPenalty,
        potentialValueAtRisk: riskResult.potentialValueAtRisk,
        explanation: riskResult.recommendationReason,
      },
    });

    // Save Recommendation
    await prisma.recommendation.create({
      data: {
        batchId,
        action: riskResult.recommendedAction,
        title: riskResult.recommendationTitle,
        rationale: riskResult.recommendationReason,
        status: 'PENDING',
      },
    });

    // Update Batch
    await prisma.batch.update({
      where: { id: batchId },
      data: {
        currentRiskScore: riskResult.riskScore,
        currentRiskLevel: riskResult.riskLevel,
        potentialValueAtRisk: riskResult.potentialValueAtRisk,
      },
    });

    // Create Batch Event
    await prisma.batchEvent.create({
      data: {
        batchId,
        eventType: 'ENVIRONMENTAL_SPIKE',
        title: 'ENVIRONMENTAL TELEMETRY RECORDED',
        description: `Temperature: ${temperature}°C, Humidity: ${humidity}% RH. Recalculated Risk: ${riskResult.riskScore}/100 (${riskResult.riskLevel})`,
      },
    });

    return NextResponse.json({ success: true, reading, riskResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
