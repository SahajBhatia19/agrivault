export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RecommendationAction = 'CONTINUE_STORAGE' | 'INSPECT' | 'MOVE' | 'PRIORITIZE_DISPATCH';

export interface FactorBreakdown {
  humidityExposure: number;      // 0 - 100 score contribution
  visibleDeterioration: number;  // 0 - 100
  storageDuration: number;        // 0 - 100
  temperatureExposure: number;   // 0 - 100
  initialQualityPenalty: number; // 0 - 100
}

export interface RiskEngineResult {
  riskScore: number;            // 0 - 100
  riskLevel: RiskLevel;
  factors: FactorBreakdown;
  potentialValueAtRisk: number; // ₹
  recommendedAction: RecommendationAction;
  recommendationTitle: string;
  recommendationReason: string;
  disclaimer: string;
}

export interface RiskInputParams {
  initialQualityScore: number;
  currentTemperature: number;     // °C (ideal is 15 - 22°C for onions)
  currentHumidity: number;        // % RH (ideal is 60 - 70% for onions)
  avgHumidityLast48h?: number;
  storageDays: number;
  visibleDefectIncreasePct?: number; // e.g. 15% increase in lower grade/rot
  quantityKg: number;
  unitValue: number;              // ₹/kg
}

/**
 * Computes Prototype Deterioration Risk Score and Explainable Recommendation
 */
export function calculateDeteriorationRisk(params: RiskInputParams): RiskEngineResult {
  const {
    initialQualityScore = 78,
    currentTemperature = 26.5,
    currentHumidity = 82.0,
    avgHumidityLast48h = 79.5,
    storageDays = 14,
    visibleDefectIncreasePct = 12,
    quantityKg = 500,
    unitValue = 100,
  } = params;

  // 1. Humidity Exposure Factor (Onions rot quickly above 75% RH)
  const effectiveHumidity = Math.max(currentHumidity, avgHumidityLast48h);
  let humidityExposure = 0;
  if (effectiveHumidity > 70) {
    humidityExposure = Math.min(100, (effectiveHumidity - 70) * 4.5);
  }

  // 2. Temperature Factor (Optimal storage: 15-22°C)
  let temperatureExposure = 0;
  if (currentTemperature > 24) {
    temperatureExposure = Math.min(100, (currentTemperature - 24) * 6.0);
  }

  // 3. Storage Duration Factor (Onions degrade after ~2-3 weeks in high humidity)
  let storageDuration = Math.min(100, (storageDays / 45) * 100);

  // 4. Visible Deterioration Trend
  let visibleDeterioration = Math.min(100, visibleDefectIncreasePct * 4.0);

  // 5. Initial Quality Penalty
  let initialQualityPenalty = Math.max(0, (100 - initialQualityScore) * 0.8);

  // Weighted Aggregation
  const weightedScore = (
    (humidityExposure * 0.35) +
    (visibleDeterioration * 0.25) +
    (temperatureExposure * 0.15) +
    (storageDuration * 0.15) +
    (initialQualityPenalty * 0.10)
  );

  const riskScore = Math.min(100, Math.max(0, Math.round(weightedScore)));

  // Risk Category
  let riskLevel: RiskLevel = 'LOW';
  if (riskScore > 80) riskLevel = 'CRITICAL';
  else if (riskScore > 60) riskLevel = 'HIGH';
  else if (riskScore > 30) riskLevel = 'MEDIUM';

  // Potential Value at Risk (Estimated, non-guaranteed loss)
  const totalValue = quantityKg * unitValue;
  // Risk factor multiplier capped between 5% and 40% of total batch value
  const riskFraction = Math.min(0.40, Math.max(0.05, (riskScore / 100) * 0.35));
  const potentialValueAtRisk = Math.round(totalValue * riskFraction);

  // Explainable Recommendation Engine
  let recommendedAction: RecommendationAction = 'CONTINUE_STORAGE';
  let recommendationTitle = 'Maintain Controlled Storage';
  let recommendationReason = 'Environmental metrics and crop stability are within optimal operational bounds.';

  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendedAction = 'PRIORITIZE_DISPATCH';
    recommendationTitle = 'Prioritize Batch Dispatch Immediately';
    recommendationReason = `Visible deterioration has increased by ${visibleDefectIncreasePct}% while the batch experienced prolonged elevated humidity (${effectiveHumidity}% RH) and temperature (${currentTemperature}°C). Rapid liquidation avoids compounding rot loss.`;
  } else if (riskLevel === 'MEDIUM') {
    if (effectiveHumidity > 75) {
      recommendedAction = 'MOVE';
      recommendationTitle = 'Relocate to Low-Humidity Bay';
      recommendationReason = `High ambient humidity (${effectiveHumidity}%) poses a sprouting and mold risk. Relocate batch to aerated bay.`;
    } else {
      recommendedAction = 'INSPECT';
      recommendationTitle = 'Schedule Physical Re-Inspection';
      recommendationReason = `Storage duration (${storageDays} days) warrants a routine representative sample re-inspection.`;
    }
  }

  return {
    riskScore,
    riskLevel,
    factors: {
      humidityExposure: Math.round(humidityExposure),
      visibleDeterioration: Math.round(visibleDeterioration),
      storageDuration: Math.round(storageDuration),
      temperatureExposure: Math.round(temperatureExposure),
      initialQualityPenalty: Math.round(initialQualityPenalty),
    },
    potentialValueAtRisk,
    recommendedAction,
    recommendationTitle,
    recommendationReason,
    disclaimer: 'Prototype Deterioration Risk Score & Decision Support Model',
  };
}
