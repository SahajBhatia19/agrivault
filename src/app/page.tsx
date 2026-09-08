'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Eye,
  Award,
  TrendingUp,
  Cpu,
  Zap,
  ArrowRight,
  CheckCircle2,
  Camera,
  Layers,
} from 'lucide-react';
import TechnicalHonestyAlert from '@/components/common/TechnicalHonestyAlert';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/60">
              <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AGRI VAULT
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-emerald-400 font-bold -mt-1">
                AI Post-Harvest Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all"
            >
              Enterprise Dashboard
            </Link>

            <Link
              href="/batches/ON-2026-00125/inspect"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              START INSPECTION DEMO
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-xs text-emerald-400 font-semibold shadow-inner">
          <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>AI-POWERED POST-HARVEST INTELLIGENCE PLATFORM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          AGRI VAULT
        </h1>

        <p className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400 font-sans italic">
          "Know what you received. Know what will happen next."
        </p>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AI-powered quality assessment, representative sampling, batch traceability, storage intelligence, and deterioration-risk decision support for agricultural inventory.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/batches/ON-2026-00125/inspect"
            className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide shadow-2xl shadow-emerald-900/50 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
            START INSPECTION DEMO
          </Link>

          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-800 shadow-xl transition-all"
          >
            EXPLORE PLATFORM →
          </Link>
        </div>

        {/* Technical Honesty Notice */}
        <div className="pt-6 max-w-3xl mx-auto text-left">
          <TechnicalHonestyAlert
            title="TECHNICAL HONESTY & REAL-WORLD DESIGN"
            message="Onion quality assessment at procurement is often subjective and inconsistent. AgriVault uses representative sampling across 5 cart zones, spreading sampled onions in a single layer for visible external computer vision defect detection. RGB cameras evaluate visible external characteristics (size, color, rot, sprouting, bruising); internal rot sensing is outside the MVP scope."
            variant="info"
          />
        </div>
      </section>

      {/* Core Pipeline Section */}
      <section className="bg-slate-900/60 border-y border-slate-800 py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              INTELLIGENCE PIPELINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">PROCURE → INSPECT → STORE → PREDICT → ACT</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold font-mono">
                01
              </div>
              <h3 className="text-base font-bold text-slate-100">Representative Sampling</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Representative samples drawn from Top, Middle, Left, Right, and Lower depth quadrants.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold font-mono">
                02
              </div>
              <h3 className="text-base font-bold text-slate-100">Single-Layer Camera Vision</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detects individual onions, identifies visible rot/sprouting/bruising defects, and assigns prototype Grade A/B/C.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold font-mono">
                03
              </div>
              <h3 className="text-base font-bold text-slate-100">Human Operator Rescan</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI highlights defective onions. Operator physically removes them. Rescan confirms sorting and issues "SORTING VERIFIED".
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold font-mono">
                04
              </div>
              <h3 className="text-base font-bold text-slate-100">Verifiable QR Passport</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                QR code encodes route `/batches/ON-2026-00125` to fetch dynamic live quality and storage health state from backend.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold font-mono">
                05
              </div>
              <h3 className="text-base font-bold text-slate-100">Storage Risk Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates 0-100 Deterioration Risk Score, explains contributing factors, and estimates Potential Value at Risk.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold font-mono">
                06
              </div>
              <h3 className="text-base font-bold text-slate-100">Human Decision Support</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recommends STORE, INSPECT, MOVE, or PRIORITIZE DISPATCH with mandatory override logging and outcome feedback loops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500 space-y-2">
        <p>AGRI VAULT — AI-Powered Post-Harvest Intelligence Platform</p>
        <p className="text-[10px] text-slate-600">"Know what you received. Know what will happen next."</p>
      </footer>
    </div>
  );
}
