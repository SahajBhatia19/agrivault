import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      include: {
        assignedBatch: true,
        storageLocation: true,
        telemetry: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, devices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, assignedBatchId, storageLocationId } = body;

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'AgriVault Post-Harvest Ops', code: 'AGRI-HQ-01' },
      });
    }

    const deviceId = id || `ESP32-DEV-${Math.floor(100 + Math.random() * 900)}`;
    const apiKey = `agri_esp32_${Math.random().toString(36).substring(2, 12)}`;

    const device = await prisma.device.create({
      data: {
        id: deviceId,
        name: name || `Onion Storage Sensor Node ${deviceId}`,
        apiKey,
        assignedBatchId: assignedBatchId || null,
        storageLocationId: storageLocationId || null,
        organizationId: org.id,
        status: 'ONLINE',
      },
    });

    return NextResponse.json({ success: true, device }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
