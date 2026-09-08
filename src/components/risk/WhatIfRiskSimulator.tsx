'use client';

import React, { useState } from 'react';
import { Sliders, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { calculateDeteriorationRisk } from '@/lib/risk-engine';

interface Props {
  currentRiskScore?: number;
  initialQualityScore?: number;
  quantityKg?: number;
  unitValue?: number;
}

export default function WhatIfRiskSimulator({
  currentRiskScore = 78,
  initialQualityScore = 78,
  quantityKg = 500,
  unitValue = 100,
}: Props) {
  const [simHumidity, setSimHumidity] = useState<number>(65.0); // Simulated ideal humidity
  const [simTemp, setSimTemp] = useState<number>(20.0);         // Simulated ideal temp
  const [simDays, setSimDays] = useState<number>(14);

  // Calculate Projected Risk based on simulated parameters
  const projectedResult = calculateDeteriorationRisk({
    initialQualityScore,
    currentTemperature: simTemp,
    currentHumidity: simHumidity,
    storageDays: simDays,
    quantityKg,
    unitValue,
  });

  const projectedRisk = projectedResult.riskScore;
  const delta = projectedRisk - currentRiskScore;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            WHAT-IF DETERIORATION RISK SIMULATOR
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate environmental storage interventions to project batch risk reduction.
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Interactive Decision Support
        </span>
      </div>

      {/* Comparison Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current Risk */}
        <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">CURRENT BATCH RISK</span>
            <span className="text-2xl font-mono font-bold text-rose-400">{currentRiskScore} / 100</span>
            <span className="text-[10px] uppercase font-bold text-rose-400 block mt-0.5">HIGH RISK</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Projected Risk */}
        <div className="bg-slate-950 p-4 rounded-xl border border-emerald-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">PROJECTED SIMULATED RISK</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-emerald-400">{projectedRisk} / 100</span>
              <span className={`text-xs font-mono font-bold ${delta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({delta <= 0 ? '' : '+'}{delta})
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mt-0.5">
              {projectedResult.riskLevel} RISK
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="space-y-5 bg-slate-950 p-5 rounded-xl border border-slate-800">
        {/* Slider 1: Relative Humidity */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Target Ambient Humidity (% RH)</span>
            <span className="font-mono font-bold text-emerald-400">{simHumidity}% RH</span>
          </div>
          <input
            type="range"
            min="45"
            max="95"
            step="1"
            value={simHumidity}
            onChange={(e) => setSimHumidity(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>45% (Dehydrated)</span>
            <span>65% (Optimal)</span>
            <span>95% (Extreme Rot Risk)</span>
          </div>
        </div>

        {/* Slider 2: Ambient Temperature */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Target Storage Temperature (°C)</span>
            <span className="font-mono font-bold text-emerald-400">{simTemp}°C</span>
          </div>
          <input
            type="range"
            min="12"
            max="35"
            step="0.5"
            value={simTemp}
            onChange={(e) => setSimTemp(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>12°C (Cold Storage)</span>
            <span>20°C (Optimal)</span>
            <span>35°C (Sprouting Heat)</span>
          </div>
        </div>

        {/* Slider 3: Storage Days */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Storage Duration (Days)</span>
            <span className="font-mono font-bold text-emerald-400">{simDays} Days</span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={simDays}
            onChange={(e) => setSimDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Disclaimer Callout */}
      <p className="text-[11px] text-slate-400 italic text-center">
        * Scenario projection — not a guaranteed financial or biological outcome.
      </p>
    </div>
  );
}
