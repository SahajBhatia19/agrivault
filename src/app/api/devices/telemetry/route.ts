import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDeteriorationRisk } from '@/lib/risk-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, batchId, temperature, humidity, apiKey, source = 'ESP32_TELEMETRY' } = body;

    // Validate request
    if (!batchId || temperature === undefined || humidity === undefined) {
      return NextResponse.json({ success: false, error: 'batchId, temperature and humidity are required' }, { status: 400 });
    }

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        inspections: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
    });

    if (!batch) {
      return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }

    // Save telemetry reading
    const reading = await prisma.environmentalReading.create({
      data: {
        batchId,
        temperature: Number(temperature),
        humidity: Number(humidity),
        source,
        deviceId: deviceId || null,
      },
    });

    // Update Device status if deviceId provided
    if (deviceId) {
      await prisma.device.updateMany({
        where: { id: deviceId },
        data: {
          status: 'ONLINE',
          lastSeen: new Date(),
        },
      });

      await prisma.deviceTelemetry.create({
        data: {
          deviceId,
          batchId,
          temperature: Number(temperature),
          humidity: Number(humidity),
        },
      });
    }

    // Recalculate Risk Score dynamically
    const storageDays = Math.max(1, Math.round((Date.now() - new Date(batch.registrationDate).getTime()) / (1000 * 60 * 60 * 24)));
    const riskResult = calculateDeteriorationRisk({
      initialQualityScore: batch.initialQualityScore || 78,
      currentTemperature: Number(temperature),
      currentHumidity: Number(humidity),
      storageDays,
      quantityKg: batch.quantityKg,
      unitValue: batch.estimatedUnitValue,
    });

    // Save Risk Assessment
    const riskAssessment = await prisma.riskAssessment.create({
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

    // Save or Update Recommendation
    await prisma.recommendation.create({
      data: {
        batchId,
        action: riskResult.recommendedAction,
        title: riskResult.recommendationTitle,
        rationale: riskResult.recommendationReason,
        status: 'PENDING',
      },
    });

    // Update Batch current risk score & value at risk
    await prisma.batch.update({
      where: { id: batchId },
      data: {
        currentRiskScore: riskResult.riskScore,
        currentRiskLevel: riskResult.riskLevel,
        potentialValueAtRisk: riskResult.potentialValueAtRisk,
      },
    });

    return NextResponse.json({
      success: true,
      reading,
      riskAssessment,
      recommendation: riskResult,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
