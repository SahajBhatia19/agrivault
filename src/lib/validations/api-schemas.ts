import { z } from 'zod';

export const CreateBatchSchema = z.object({
  crop: z.string().default('ONION'),
  variety: z.string().min(1, 'Variety is required').default('Nashik Red Globe'),
  quantityKg: z.number().positive('Quantity must be positive').default(500),
  weight: z.number().positive().optional(),
  estimatedUnitValue: z.number().nonnegative().default(100),
  sourceLocation: z.string().optional().default('Lasalgaon APMC Mandi'),
  procurementLocation: z.string().optional().default('Lasalgaon Mandi, Maharashtra'),
  organizationId: z.string().optional(),
});

export const CreateSampleSchema = z.object({
  sampleSize: z.number().int().positive().default(100),
  sampledTop: z.boolean().default(true),
  sampledMiddle: z.boolean().default(true),
  sampledLeftSide: z.boolean().default(true),
  sampledRightSide: z.boolean().default(true),
  sampledLower: z.boolean().default(true),
  samplingNotes: z.string().optional(),
});

export const AnalyzeImageSchema = z.object({
  image: z.string().min(10, 'Valid base64 image string required'),
  isRescan: z.boolean().optional().default(false),
  previousRejectIds: z.array(z.string()).optional().default([]),
});

export const CreateInspectionSchema = z.object({
  batchId: z.string().min(1, 'batchId is required'),
  inspectionType: z.string().optional().default('INITIAL'),
  imageUrl: z.string().optional(),
  detections: z.array(
    z.object({
      onionIndex: z.number().optional(),
      bbox: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }).optional(),
      bboxX: z.number().optional(),
      bboxY: z.number().optional(),
      bboxWidth: z.number().optional(),
      bboxHeight: z.number().optional(),
      confidence: z.number().optional().default(0.9),
      category: z.string().default('ACCEPTABLE'),
      defectType: z.string().optional().default('NONE'),
      severity: z.string().optional().default('NONE'),
    })
  ).optional().default([]),
  inspectorName: z.string().optional().default('AI Camera System'),
  aiMode: z.string().optional().default('DEMO_AI_MODE'),
});

export const StorageReadingSchema = z.object({
  batchId: z.string().min(1, 'batchId is required'),
  temperature: z.number(),
  humidity: z.number(),
  source: z.string().optional().default('SIMULATION'),
  deviceId: z.string().optional(),
});

export const HumanDecisionSchema = z.object({
  actionStatus: z.enum(['APPROVED', 'OVERRIDDEN']),
  decision: z.enum(['APPROVE', 'OVERRIDE']).optional(),
  overrideReason: z.string().optional(),
  decidedBy: z.string().optional().default('Lead Inspector'),
});

export const DeviceTelemetrySchema = z.object({
  deviceId: z.string().optional(),
  batchId: z.string().min(1, 'batchId is required'),
  temperature: z.number(),
  humidity: z.number(),
  apiKey: z.string().optional(),
  source: z.string().optional().default('ESP32_TELEMETRY'),
});
