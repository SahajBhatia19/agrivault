const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AgriVault database via Node.js...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.deviceTelemetry.deleteMany();
  await prisma.device.deleteMany();
  await prisma.outcome.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.environmentalReading.deleteMany();
  await prisma.storageLocation.deleteMany();
  await prisma.onionDetection.deleteMany();
  await prisma.inspectionImage.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.batchSample.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.gradingConfiguration.deleteMany();

  // 1. Organization
  const org = await prisma.organization.create({
    data: {
      name: 'AgriVault Post-Harvest Ops',
      code: 'AGRI-HQ-01',
    },
  });

  // 2. Users
  const operatorUser = await prisma.user.create({
    data: {
      email: 'operator@agrivault.ai',
      name: 'Rajesh Sharma (Lead Inspector)',
      role: 'OPERATOR',
      organizationId: org.id,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@agrivault.ai',
      name: 'Dr. Anita Verma (Operations Director)',
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  // 3. Storage Locations
  const bayA = await prisma.storageLocation.create({
    data: {
      name: 'Storage Bay A (Cold Storage)',
      warehouseName: 'Nashik Central Agro Warehouse',
      targetTemperature: 18.5,
      targetHumidity: 62.0,
    },
  });

  const bayB = await prisma.storageLocation.create({
    data: {
      name: 'Storage Bay B (Ventilated Ambient)',
      warehouseName: 'Nashik Central Agro Warehouse',
      targetTemperature: 24.0,
      targetHumidity: 78.0,
    },
  });

  // 4. Grading Configuration
  await prisma.gradingConfiguration.create({
    data: {
      gradeAThreshold: 90.0,
      gradeBThreshold: 75.0,
      gradeCThreshold: 60.0,
    },
  });

  // 5. MAIN DEMO BATCH: ON-2026-00125
  const batch125 = await prisma.batch.create({
    data: {
      id: 'ON-2026-00125',
      crop: 'ONION',
      variety: 'Nashik Red Globe',
      quantityKg: 500,
      estimatedUnitValue: 100, // ₹100 / kg
      totalBatchValue: 50000,
      sourceLocation: 'Farm Cluster 4, Lasalgaon',
      procurementLocation: 'Lasalgaon APMC Mandi, Nashik',
      status: 'IN_STORAGE',
      initialGrade: 'B',
      currentGrade: 'B',
      initialQualityScore: 78.0,
      currentRiskScore: 78.0,
      currentRiskLevel: 'HIGH',
      potentialValueAtRisk: 12000,
      organizationId: org.id,
      registrationDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    },
  });

  // Sample record for ON-2026-00125
  await prisma.batchSample.create({
    data: {
      batchId: batch125.id,
      sampleSize: 100,
      sampledTop: true,
      sampledMiddle: true,
      sampledLeftSide: true,
      sampledRightSide: true,
      sampledLower: true,
      samplingNotes: 'Representative 100-onion sample drawn from 5 distinct cart depth quadrants.',
    },
  });

  // Inspection record for ON-2026-00125
  const inspection125 = await prisma.inspection.create({
    data: {
      batchId: batch125.id,
      inspectionType: 'INITIAL',
      status: 'COMPLETED',
      totalDetected: 100,
      acceptableCount: 76,
      lowerGradeCount: 17,
      rejectCount: 7,
      qualityScore: 78.0,
      inspectorName: operatorUser.name,
      aiMode: 'DEMO_AI_MODE',
    },
  });

  // Detections for ON-2026-00125
  const rejectIndices = new Set([8, 17, 31, 42, 56, 73, 91]);
  for (let i = 1; i <= 100; i++) {
    const isReject = rejectIndices.has(i);
    const isLowerGrade = !isReject && (i % 5 === 0 && i <= 85);
    
    await prisma.onionDetection.create({
      data: {
        inspectionId: inspection125.id,
        onionIndex: i,
        bboxX: (i % 10) * 9.2 + 4,
        bboxY: Math.floor((i - 1) / 10) * 9.2 + 4,
        bboxWidth: 7.5,
        bboxHeight: 7.5,
        confidence: 0.94,
        category: isReject ? 'REJECT' : isLowerGrade ? 'LOWER_GRADE' : 'ACCEPTABLE',
        defectType: isReject ? (i === 17 ? 'VISIBLE_ROT' : i === 31 ? 'SPROUTING' : 'BRUISING') : isLowerGrade ? 'SURFACE_DAMAGE' : 'NONE',
        severity: isReject ? 'HIGH' : isLowerGrade ? 'LOW' : 'NONE',
        status: 'DETECTED',
      },
    });
  }

  // Environmental Telemetry progression for ON-2026-00125 (28 -> 45 -> 63 -> 78 risk)
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  await prisma.environmentalReading.createMany({
    data: [
      { batchId: batch125.id, storageLocationId: bayB.id, temperature: 21.0, humidity: 64.0, source: 'ESP32_TELEMETRY', timestamp: new Date(now - 12 * dayMs) },
      { batchId: batch125.id, storageLocationId: bayB.id, temperature: 22.5, humidity: 68.0, source: 'ESP32_TELEMETRY', timestamp: new Date(now - 9 * dayMs) },
      { batchId: batch125.id, storageLocationId: bayB.id, temperature: 24.8, humidity: 76.5, source: 'ESP32_TELEMETRY', timestamp: new Date(now - 5 * dayMs) },
      { batchId: batch125.id, storageLocationId: bayB.id, temperature: 26.5, humidity: 82.0, source: 'ESP32_TELEMETRY', timestamp: new Date(now - 1 * dayMs) },
    ],
  });

  // Risk Progression History
  await prisma.riskAssessment.createMany({
    data: [
      { batchId: batch125.id, riskScore: 28.0, riskLevel: 'LOW', humidityFactor: 15, temperatureFactor: 10, deteriorationFactor: 10, durationFactor: 20, initialQualityFactor: 15, potentialValueAtRisk: 2500, explanation: 'Initial storage within acceptable bounds.', timestamp: new Date(now - 12 * dayMs) },
      { batchId: batch125.id, riskScore: 45.0, riskLevel: 'MEDIUM', humidityFactor: 40, temperatureFactor: 25, deteriorationFactor: 20, durationFactor: 35, initialQualityFactor: 15, potentialValueAtRisk: 5500, explanation: 'Humidity rising in Bay B.', timestamp: new Date(now - 8 * dayMs) },
      { batchId: batch125.id, riskScore: 63.0, riskLevel: 'HIGH', humidityFactor: 75, temperatureFactor: 55, deteriorationFactor: 45, durationFactor: 50, initialQualityFactor: 15, potentialValueAtRisk: 9200, explanation: 'High humidity exposure accelerating rot probability.', timestamp: new Date(now - 4 * dayMs) },
      { batchId: batch125.id, riskScore: 78.0, riskLevel: 'HIGH', humidityFactor: 90, temperatureFactor: 70, deteriorationFactor: 65, durationFactor: 60, initialQualityFactor: 15, potentialValueAtRisk: 12000, explanation: 'Visible deterioration has increased while batch experienced prolonged high humidity (82% RH).', timestamp: new Date() },
    ],
  });

  // High Risk Recommendation for ON-2026-00125
  await prisma.recommendation.create({
    data: {
      batchId: batch125.id,
      action: 'PRIORITIZE_DISPATCH',
      title: 'PRIORITIZE DISPATCH IMMEDIATELY',
      rationale: 'Visible deterioration has increased while the batch has experienced prolonged high humidity (82.0% RH) and elevated temperature (26.5°C). Dispatch now to minimize value loss.',
      status: 'PENDING',
    },
  });

  // 6. Additional Seed Batches (ON-2026-00121 to ON-2026-00128)
  const otherBatchesData = [
    { id: 'ON-2026-00121', grade: 'A', score: 92, risk: 14, level: 'LOW', qty: 1200, unitVal: 110, riskVal: 3500, status: 'IN_STORAGE' },
    { id: 'ON-2026-00122', grade: 'B', score: 81, risk: 42, level: 'MEDIUM', qty: 850, unitVal: 95, riskVal: 7200, status: 'IN_STORAGE' },
    { id: 'ON-2026-00123', grade: 'C', score: 64, risk: 71, level: 'HIGH', qty: 600, unitVal: 80, riskVal: 11500, status: 'IN_STORAGE' },
    { id: 'ON-2026-00124', grade: 'B', score: 76, risk: 86, level: 'CRITICAL', qty: 950, unitVal: 90, riskVal: 22000, status: 'IN_STORAGE' },
    { id: 'ON-2026-00126', grade: 'A', score: 95, risk: 12, level: 'LOW', qty: 1500, unitVal: 115, riskVal: 4000, status: 'IN_STORAGE' },
    { id: 'ON-2026-00127', grade: 'B', score: 79, risk: 48, level: 'MEDIUM', qty: 700, unitVal: 95, riskVal: 6800, status: 'IN_STORAGE' },
    { id: 'ON-2026-00128', grade: 'C', score: 61, risk: 68, level: 'HIGH', qty: 450, unitVal: 75, riskVal: 8900, status: 'IN_STORAGE' },
  ];

  for (const b of otherBatchesData) {
    const createdBatch = await prisma.batch.create({
      data: {
        id: b.id,
        crop: 'ONION',
        variety: 'Agrifound Dark Red',
        quantityKg: b.qty,
        estimatedUnitValue: b.unitVal,
        totalBatchValue: b.qty * b.unitVal,
        sourceLocation: 'Pune Agricultural Zone',
        procurementLocation: 'Pune APMC Yard',
        status: b.status,
        initialGrade: b.grade,
        currentGrade: b.grade,
        initialQualityScore: b.score,
        currentRiskScore: b.risk,
        currentRiskLevel: b.level,
        potentialValueAtRisk: b.riskVal,
        organizationId: org.id,
      },
    });

    await prisma.environmentalReading.create({
      data: {
        batchId: createdBatch.id,
        storageLocationId: bayA.id,
        temperature: 19.5,
        humidity: 63.5,
        source: 'ESP32_TELEMETRY',
      },
    });
  }

  // 7. Devices (ESP32)
  await prisma.device.create({
    data: {
      id: 'ESP32-WH-01',
      name: 'Onion Storage Sensor Node #1',
      apiKey: 'agri_esp32_secret_key_88921',
      storageLocationId: bayB.id,
      assignedBatchId: batch125.id,
      organizationId: org.id,
      status: 'ONLINE',
      lastSeen: new Date(),
    },
  });

  // 8. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { organizationId: org.id, userId: operatorUser.id, batchId: batch125.id, action: 'BATCH_CREATED', details: 'Batch ON-2026-00125 registered (500 kg)' },
      { organizationId: org.id, userId: operatorUser.id, batchId: batch125.id, action: 'SAMPLE_RECORDED', details: 'Representative sampling recorded from 5 locations (100 onions)' },
      { organizationId: org.id, userId: operatorUser.id, batchId: batch125.id, action: 'AI_INSPECTION_COMPLETED', details: 'AI camera inspection analyzed 100 onions: 76 Acceptable, 17 Lower Grade, 7 Reject. Assigned Grade B (Quality Score: 78/100)' },
      { organizationId: org.id, userId: adminUser.id, batchId: batch125.id, action: 'RISK_ALERT_TRIGGERED', details: 'High risk alert generated (78/100) due to elevated humidity exposure (82% RH)' },
    ],
  });

  console.log('Database successfully seeded with realistic AgriVault demo data!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
