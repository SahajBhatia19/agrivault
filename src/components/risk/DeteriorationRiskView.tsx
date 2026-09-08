'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Zap,
} from 'lucide-react';
import TechnicalHonestyAlert from '@/components/common/TechnicalHonestyAlert';
import WhatIfRiskSimulator from '@/components/risk/WhatIfRiskSimulator';

interface Props {
  batch: any;
  onDecisionSubmitted?: () => void;
}

export default function DeteriorationRiskView({ batch, onDecisionSubmitted }: Props) {
  const [isOverriding, setIsOverriding] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null);

  if (!batch) return null;

  const riskScore = batch.currentRiskScore || 78;
  const riskLevel = batch.currentRiskLevel || 'HIGH';
  const potentialVar = batch.potentialValueAtRisk || 12000;
  const totalValue = batch.totalBatchValue || 50000;

  const latestRecommendation = batch.recommendations?.[0] || {
    id: 'rec-125',
    action: 'PRIORITIZE_DISPATCH',
    title: 'PRIORITIZE DISPATCH IMMEDIATELY',
    rationale: 'Visible deterioration has increased while the batch has experienced prolonged high humidity (82.0% RH) and elevated temperature (26.5°C).',
    status: 'PENDING',
  };

  const handleDecision = async (actionStatus: 'APPROVED' | 'OVERRIDDEN') => {
    if (actionStatus === 'OVERRIDDEN' && !overrideReason.trim()) {
      alert('Please state a valid reason for overriding the AI recommendation.');
      return;
    }

    setIsSubmitting(true);
    setDecisionFeedback(null);

    try {
      const res = await fetch(`/api/recommendations/${latestRecommendation.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionStatus,
          overrideReason: actionStatus === 'OVERRIDDEN' ? overrideReason : undefined,
          decidedBy: 'Lead Inspector',
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);
      if (data.success) {
        setDecisionFeedback(
          actionStatus === 'APPROVED'
            ? 'Decision logged! Recommended dispatch order initiated.'
            : `Override logged: ${overrideReason}`
        );
        setIsOverriding(false);
        if (onDecisionSubmitted) onDecisionSubmitted();
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setDecisionFeedback('Failed to log decision');
    }
  };

  return (
    <div className="space-y-6">
      <TechnicalHonestyAlert
        title="PROTOTYPE DETERIORATION RISK ENGINE"
        message="Risk score is a prototype decision-support metric based on environmental sensor readings, visual quality trends, and crop storage duration. Potential Value at Risk is an estimate, not guaranteed financial loss."
        variant="info"
      />

      {/* Main Risk Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
        
        {/* VISUALLY DOMINANT RISK SCORE GAUGE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-5">
            {/* Dominant Circular Score Gauge */}
            <div className="w-20 h-20 rounded-2xl bg-rose-950/90 border-2 border-rose-600 flex flex-col items-center justify-center text-rose-400 font-mono font-black text-3xl shadow-xl shadow-rose-950/70 shrink-0">
              <span>{riskScore}</span>
              <span className="text-[9px] font-sans font-normal text-rose-300 -mt-1">/ 100</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 bg-rose-950 px-2.5 py-0.5 rounded border border-rose-800">
                  PROTOTYPE RISK SCORE
                </span>
                <span className="text-xs text-slate-400 font-mono">0–100 Scale</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                {riskScore >= 75 ? 'HIGH RISK' : riskScore >= 50 ? 'MODERATE-HIGH RISK' : 'LOW RISK'}
              </h2>
              <p className="text-xs text-slate-400">
                Action recommended to avoid compounding rot degradation.
              </p>
            </div>
          </div>

          {/* Potential Value at Risk */}
          <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/60 text-right min-w-[220px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">POTENTIAL VALUE AT RISK</span>
            <span className="text-3xl font-mono font-bold text-rose-400 block">₹{potentialVar.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block">Total Batch Value: ₹{totalValue.toLocaleString()}</span>
          </div>
        </div>

        {/* CONTRIBUTING RISK FACTORS BREAKDOWN */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            EXPLAINABLE CONTRIBUTING FACTORS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Humidity Exposure</span>
                <span className="font-mono font-bold text-rose-400">82.0% RH</span>
              </div>
              <p className="text-[11px] text-slate-400">+12% above rot safety limit (70%).</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Temperature</span>
                <span className="font-mono font-bold text-amber-400">26.5°C</span>
              </div>
              <p className="text-[11px] text-slate-400">+2.5°C above cold target (24°C).</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Storage Duration</span>
                <span className="font-mono font-bold text-slate-200">14 Days</span>
              </div>
              <p className="text-[11px] text-slate-400">Ambient ventilated bay storage.</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Visible Deterioration</span>
                <span className="font-mono font-bold text-rose-400">+12% Rot</span>
              </div>
              <p className="text-[11px] text-slate-400">Increasing visible rot trend.</p>
            </div>
          </div>
        </div>

        {/* AI ACTION RECOMMENDATION & HUMAN DECISION */}
        <div className="bg-slate-950 border border-emerald-800/80 rounded-xl p-5 space-y-4 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  AI RECOMMENDATION ENGINE
                </h3>
                <span className="text-sm font-black text-emerald-400">
                  RECOMMENDED ACTION: {latestRecommendation.action}
                </span>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
              latestRecommendation.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              Status: {latestRecommendation.status}
            </span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
            <span className="font-bold text-slate-200 block">{latestRecommendation.title}</span>
            <p className="text-slate-300 leading-relaxed italic">"{latestRecommendation.rationale}"</p>
          </div>

          {/* Decision Buttons */}
          {latestRecommendation.status === 'PENDING' && !decisionFeedback && (
            <div className="space-y-3 pt-2">
              {!isOverriding ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDecision('APPROVED')}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    APPROVE RECOMMENDED DISPATCH
                  </button>

                  <button
                    onClick={() => setIsOverriding(true)}
                    className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
                  >
                    OVERRIDE RECOMMENDATION
                  </button>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-amber-400 block">
                    Override Rationale (Required for Audit Logging):
                  </label>
                  <textarea
                    rows={2}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Enter operational reason for overriding recommendation..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDecision('OVERRIDDEN')}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                    >
                      Confirm Override
                    </button>
                    <button
                      onClick={() => setIsOverriding(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {decisionFeedback && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{decisionFeedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* WHAT-IF SIMULATOR SECTION */}
      <WhatIfRiskSimulator
        currentRiskScore={riskScore}
        initialQualityScore={batch.initialQualityScore || 78}
        quantityKg={batch.quantityKg}
        unitValue={batch.estimatedUnitValue}
      />
    </div>
  );
}
