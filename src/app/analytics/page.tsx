'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import TechnicalHonestyAlert from '@/components/common/TechnicalHonestyAlert';
import { BarChart3, TrendingUp, ShieldAlert, Award, FileCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AnalyticsPage() {
  const qualityTrendData = [
    { month: 'May 2026', avgQuality: 88, defectRate: 4.2 },
    { month: 'Jun 2026', avgQuality: 85, defectRate: 5.8 },
    { month: 'Jul 2026', avgQuality: 82, defectRate: 7.1 },
    { month: 'Aug 2026', avgQuality: 79, defectRate: 9.4 },
    { month: 'Sep 2026', avgQuality: 81, defectRate: 8.2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-6">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          <TechnicalHonestyAlert
            title="LONGITUDINAL ANALYTICS & PREDICTIVE ACCURACY"
            message="Analytics summarize longitudinal quality trends, historical defect rates, and AI model evaluation against actual dispatch outcomes."
            variant="info"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                POST-HARVEST INTELLIGENCE METRICS
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Cross-Batch Analytics & Model Accuracy</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Quality Score</span>
              <span className="text-3xl font-mono font-bold text-emerald-400 mt-1 block">81.4 / 100</span>
              <span className="text-[10px] text-slate-400 block">Prototype Grade B Mean</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Defect Rate</span>
              <span className="text-3xl font-mono font-bold text-amber-400 mt-1 block">7.4 %</span>
              <span className="text-[10px] text-slate-400 block">Visible external defects</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Model Accuracy Rating</span>
              <span className="text-3xl font-mono font-bold text-slate-100 mt-1 block">91.8 %</span>
              <span className="text-[10px] text-emerald-400 font-semibold block">Outcome Feedback Loop</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Interventions Actioned</span>
              <span className="text-3xl font-mono font-bold text-slate-100 mt-1 block">28 Batches</span>
              <span className="text-[10px] text-slate-400 block">100% Approved or Logged</span>
            </div>
          </div>

          {/* Quality Trend Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              5-MONTH AVERAGE PROCUREMENT QUALITY & DEFECT TREND
            </h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qualityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="avgQuality" name="Avg Quality Score" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="defectRate" name="Defect Rate (%)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
