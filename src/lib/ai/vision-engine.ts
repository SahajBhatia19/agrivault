export interface BoundingBox {
  x: number;      // 0 to 100 percentage
  y: number;      // 0 to 100 percentage
  width: number;  // 0 to 100 percentage
  height: number; // 0 to 100 percentage
}

export type QualityCategory = 'ACCEPTABLE' | 'LOWER_GRADE' | 'REJECT';
export type DefectType = 'NONE' | 'BRUISING' | 'DISCOLORATION' | 'VISIBLE_ROT' | 'SPROUTING' | 'SURFACE_DAMAGE' | 'OTHER';
export type DefectSeverity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface DetectionResult {
  id: string;
  onionIndex: number;
  bbox: BoundingBox;
  confidence: number;
  category: QualityCategory;
  defectType: DefectType;
  severity: DefectSeverity;
  status: 'DETECTED' | 'REMOVED' | 'VERIFIED';
}

export interface InspectionSummary {
  total: number;
  acceptable: number;
  lowerGrade: number;
  reject: number;
  qualityScore: number;
  grade: 'A' | 'B' | 'C' | 'REJECT';
}

export interface AnalysisResponse {
  aiMode: 'DEMO_AI_MODE' | 'REAL_YOLO';
  detections: DetectionResult[];
  summary: InspectionSummary;
  disclaimer: string;
}

/**
 * Calculates prototype quality score (0-100) based on category distribution
 */
export function calculateQualityScore(acceptable: number, lowerGrade: number, reject: number): number {
  const total = acceptable + lowerGrade + reject;
  if (total === 0) return 100;
  
  // Weighting formula: Acceptable = 1.0, Lower Grade = 0.55, Reject = 0.0
  const weightedPoints = (acceptable * 1.0) + (lowerGrade * 0.55) + (reject * 0.0);
  const score = Math.round((weightedPoints / total) * 100);
  return Math.max(0, Math.min(100, score));
}

/**
 * Maps quality score to Prototype Procurement Grading Rubric
 */
export function calculateBatchGrade(score: number): 'A' | 'B' | 'C' | 'REJECT' {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  return 'REJECT';
}

/**
 * Analyzes an onion sample image using real YOLO service or Demo AI Mode fallback
 */
export async function analyzeOnionImage(
  imageBase64: string,
  isRescan: boolean = false,
  previousRejectIds: string[] = []
): Promise<AnalysisResponse> {
  const aiServiceUrl = process.env.AI_SERVICE_URL;

  // Try real YOLO API if configured
  if (aiServiceUrl) {
    try {
      const response = await fetch(`${aiServiceUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, isRescan }),
      });
      if (response.ok) {
        const data = await response.json();
        return {
          aiMode: 'REAL_YOLO',
          detections: data.detections,
          summary: data.summary,
          disclaimer: 'Live YOLO Computer Vision Model Inference',
        };
      }
    } catch (err) {
      console.warn('Real AI service unavailable, falling back to Demo AI Mode', err);
    }
  }

  // Demo AI Mode Fallback
  return generateDemoInference(isRescan, previousRejectIds);
}

/**
 * Generates realistic single-layer individual onion detections for Demo AI Mode.
 */
function generateDemoInference(isRescan: boolean, previousRejectIds: string[] = []): AnalysisResponse {
  const detections: DetectionResult[] = [];
  
  // If rescan, simulate that operator physically removed most rejected onions (e.g. 5 out of 7 removed)
  if (isRescan) {
    // Generate rescan sample layout with reduced reject count
    const rows = 8;
    const cols = 10;
    let index = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = Math.round(5 + c * 9.2 + (Math.random() * 2 - 1));
        const y = Math.round(5 + r * 11.2 + (Math.random() * 2 - 1));
        const width = Math.round(6.8 + (Math.random() * 1.5 - 0.75));
        const height = Math.round(8.2 + (Math.random() * 1.5 - 0.75));

        // In rescan, only 2 rejects remain out of original sample
        const isRemainingReject = (index === 17 || index === 42); 
        const isLowerGrade = (index % 6 === 0 && !isRemainingReject);
        
        let category: QualityCategory = 'ACCEPTABLE';
        let defectType: DefectType = 'NONE';
        let severity: DefectSeverity = 'NONE';

        if (isRemainingReject) {
          category = 'REJECT';
          defectType = index === 17 ? 'VISIBLE_ROT' : 'BRUISING';
          severity = 'HIGH';
        } else if (isLowerGrade) {
          category = 'LOWER_GRADE';
          defectType = 'SURFACE_DAMAGE';
          severity = 'LOW';
        }

        const confidence = parseFloat((0.88 + Math.random() * 0.11).toFixed(2));

        detections.push({
          id: `onion-rescan-${index}`,
          onionIndex: index,
          bbox: { x, y, width, height },
          confidence,
          category,
          defectType,
          severity,
          status: 'DETECTED',
        });
        index++;
      }
    }
  } else {
    // Standard initial sample (100 onions: 76 acceptable, 17 lower grade, 7 reject)
    const rows = 10;
    const cols = 10;
    let index = 1;

    // Fixed indices for the 7 reject onions to make demo reproducible: #08, #17, #31, #42, #56, #73, #91
    const rejectIndices = new Set([8, 17, 31, 42, 56, 73, 91]);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = Math.round(4 + c * 9.2 + (Math.random() * 1.8 - 0.9));
        const y = Math.round(4 + r * 9.2 + (Math.random() * 1.8 - 0.9));
        const width = Math.round(7.2 + (Math.random() * 1.4 - 0.7));
        const height = Math.round(7.8 + (Math.random() * 1.4 - 0.7));

        let category: QualityCategory = 'ACCEPTABLE';
        let defectType: DefectType = 'NONE';
        let severity: DefectSeverity = 'NONE';

        if (rejectIndices.has(index)) {
          category = 'REJECT';
          if (index === 17) {
            defectType = 'VISIBLE_ROT';
            severity = 'HIGH';
          } else if (index === 31) {
            defectType = 'SPROUTING';
            severity = 'HIGH';
          } else if (index === 42) {
            defectType = 'BRUISING';
            severity = 'MEDIUM';
          } else {
            defectType = 'DISCOLORATION';
            severity = 'HIGH';
          }
        } else if (index % 5 === 0 && index <= 85) {
          // 17 lower grade onions
          category = 'LOWER_GRADE';
          defectType = index % 10 === 0 ? 'SURFACE_DAMAGE' : 'BRUISING';
          severity = 'LOW';
        }

        const confidence = parseFloat((0.89 + Math.random() * 0.1).toFixed(2));

        detections.push({
          id: `onion-${index}`,
          onionIndex: index,
          bbox: { x, y, width, height },
          confidence,
          category,
          defectType,
          severity,
          status: 'DETECTED',
        });
        index++;
      }
    }
  }

  const total = detections.length;
  const acceptable = detections.filter(d => d.category === 'ACCEPTABLE').length;
  const lowerGrade = detections.filter(d => d.category === 'LOWER_GRADE').length;
  const reject = detections.filter(d => d.category === 'REJECT').length;
  const qualityScore = calculateQualityScore(acceptable, lowerGrade, reject);
  const grade = calculateBatchGrade(qualityScore);

  return {
    aiMode: 'DEMO_AI_MODE',
    detections,
    summary: {
      total,
      acceptable,
      lowerGrade,
      reject,
      qualityScore,
      grade,
    },
    disclaimer: 'Demo AI Mode (Simulated Single-Layer YOLO Inference)',
  };
}
