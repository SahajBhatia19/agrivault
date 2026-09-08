'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Layers, Calendar, MapPin, AlertTriangle, CheckCircle2, Truck, QrCode, FileText } from 'lucide-react';
import TechnicalHonestyAlert from '@/components/common/TechnicalHonestyAlert';

interface Props {
  batch: any;
}

export default function DigitalBatchPassport({ batch }: Props) {
  if (!batch) return null;

  const passportUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/batches/${batch.id}/passport`
    : `https://agrivault.ai/batches/${batch.id}/passport`;

  const timelineEvents = [
    { title: 'BATCH CREATED', date: 'Day 1', status: 'completed', desc: `${batch.quantityKg} kg registered at ${batch.procurementLocation}` },
    { title: 'INITIAL INSPECTION', date: 'Day 1', status: 'completed', desc: `Representative 100-onion sample analyzed by AI Camera System` },
    { title: 'GRADE ASSIGNED', date: 'Day 1', status: 'completed', desc: `Quality Score: ${batch.initialQualityScore || 78}/100 → Prototype Grade ${batch.initialGrade || 'B'}` },
    { title: 'ENTERED STORAGE', date: 'Day 2', status: 'completed', desc: `Assigned to Storage Bay B (Ambient Ventilated Storage)` },
    { title: 'ENVIRONMENTAL MONITORING', date: 'Day 2-14', status: 'completed', desc: `ESP32 Telemetry logged high humidity spike (82.0% RH)` },
    { title: 'PERIODIC INSPECTION', date: 'Day 10', status: 'completed', desc: `Visible deterioration trend detected in lower quadrant` },
    { title: 'RISK INCREASE', date: 'Day 14', status: 'warning', desc: `Deterioration Risk Score escalated from 28 → 78/100 (HIGH RISK)` },
    { title: 'RECOMMENDED ACTION', date: 'Current', status: 'action', desc: `PRIORITIZE DISPATCH (Potential Value at Risk: ₹${batch.potentialValueAtRisk || 12000})` },
  ];

  return (
    <div className="space-y-6">
      {/* Passport Identity Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-950/60 shrink-0">
              <Shield className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  DIGITAL BATCH PASSPORT
                </span>
                <span className="text-xs text-slate-400 font-mono">Verifiable ID</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white mt-1">{batch.id}</h1>
              <p className="text-xs text-slate-300 font-medium">
                {batch.crop} • {batch.variety} ({batch.quantityKg} KG Batch)
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <QRCodeSVG value={passportUrl} size={70} bgColor="transparent" fgColor="#10b981" />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-slate-200 block">QR Passport Scan</span>
              <span className="text-[10px] text-slate-400 block max-w-[120px] truncate">
                /batches/{batch.id}/passport
              </span>
              <span className="text-[9px] uppercase font-bold text-emerald-400 block pt-1">
                Authentic Chain of Custody
              </span>
            </div>
          </div>
        </div>

        {/* Passport Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Initial Quality</span>
            <span className="text-lg font-mono font-bold text-slate-100">{batch.initialQualityScore || 78}/100</span>
            <span className="text-[10px] text-emerald-400 block font-semibold">Grade {batch.initialGrade || 'B'}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Risk Score</span>
            <span className="text-lg font-mono font-bold text-rose-400">{batch.currentRiskScore || 78}/100</span>
            <span className="text-[10px] text-rose-400 block font-semibold uppercase">{batch.currentRiskLevel || 'HIGH'} RISK</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Batch Value</span>
            <span className="text-lg font-mono font-bold text-slate-100">₹{(batch.totalBatchValue || 50000).toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block">₹{batch.estimatedUnitValue}/kg</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Potential Value at Risk</span>
            <span className="text-lg font-mono font-bold text-amber-400">₹{(batch.potentialValueAtRisk || 12000).toLocaleString()}</span>
            <span className="text-[10px] text-amber-400 block font-semibold">Decision Support Metric</span>
          </div>
        </div>
      </div>

      {/* Visual Passport Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          DIGITAL BATCH PASSPORT LIFECYCLE TIMELINE
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {timelineEvents.map((event, idx) => (
            <div key={idx} className="relative flex items-start gap-4 group">
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  event.status === 'warning'
                    ? 'bg-rose-950 border-rose-500 text-rose-400'
                    : event.status === 'action'
                    ? 'bg-amber-950 border-amber-500 text-amber-400 animate-pulse'
                    : 'bg-emerald-950 border-emerald-500 text-emerald-400'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex-1 space-y-1 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{event.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">{event.date}</span>
                </div>
                <p className="text-xs text-slate-400">{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
