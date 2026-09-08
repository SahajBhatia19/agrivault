import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateBatchSchema } from '@/lib/validations/api-schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');

    const where: any = {};
    if (status) where.status = status;
    if (riskLevel) where.currentRiskLevel = riskLevel;

    const batches = await prisma.batch.findMany({
      where,
      include: {
        samples: true,
        inspections: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        riskAssessments: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        recommendations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        events: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
      orderBy: { registrationDate: 'desc' },
    });

    return NextResponse.json({ success: true, batches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validation = CreateBatchSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const {
      crop,
      variety,
      quantityKg,
      weight,
      estimatedUnitValue,
      sourceLocation,
      procurementLocation,
      organizationId,
    } = validation.data;

    const effectiveWeight = weight || quantityKg;

    let orgId = organizationId;
    if (!orgId) {
      let firstOrg = await prisma.organization.findFirst();
      if (!firstOrg) {
        firstOrg = await prisma.organization.create({
          data: { name: 'AgriVault Post-Harvest Ops', code: 'AGRI-HQ-01' },
        });
      }
      orgId = firstOrg.id;
    }

    const count = await prisma.batch.count();
    const batchIdNumber = (125 + count + 1).toString().padStart(5, '0');
    const id = `ON-2026-${batchIdNumber}`;
    const totalBatchValue = effectiveWeight * estimatedUnitValue;

    const batch = await prisma.batch.create({
      data: {
        id,
        batchCode: id,
        crop,
        variety,
        weight: effectiveWeight,
        quantityKg: effectiveWeight,
        estimatedUnitValue,
        totalBatchValue,
        source: sourceLocation,
        origin: sourceLocation,
        sourceLocation,
        procurementLocation,
        status: 'REGISTERED',
        organizationId: orgId,
      },
    });

    // Create Batch Event
    await prisma.batchEvent.create({
      data: {
        batchId: batch.id,
        eventType: 'PROCUREMENT',
        title: 'BATCH PROCUREMENT REGISTERED',
        description: `Registered ${effectiveWeight} kg ${variety} batch from ${procurementLocation}`,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        batchId: batch.id,
        entity: 'BATCH',
        entityId: batch.id,
        action: 'BATCH_CREATED',
        details: `Batch ${batch.id} registered (${effectiveWeight} kg, ${variety})`,
      },
    });

    return NextResponse.json({ success: true, batch }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
