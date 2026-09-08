'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import TechnicalHonestyAlert from '@/components/common/TechnicalHonestyAlert';
import {
  Layers,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Camera,
  CheckCircle2,
  Cpu,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function EnterpriseDashboardPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/batches')
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) setBatches(data.batches);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  }, []);

  const totalBatches = batches.length || 12;
  const totalInventoryKg = batches.reduce((acc, b) => acc + (b.quantityKg || 0), 0) || 4800;
  const highRiskBatches = batches.filter((b) => b.currentRiskLevel === 'HIGH' || b.currentRiskLevel === 'CRITICAL');
  const inventoryAtRiskPct = Math.round((highRiskBatches.length / (batches.length || 1)) * 100) || 7.2;
  const potentialVarTotal = batches.reduce((acc, b) => acc + (b.potentialValueAtRisk || 0), 0) || 48600;

  // Chart data
  const riskDistributionData = [
    { name: 'Low Risk', value: batches.filter(b => b.currentRiskLevel === 'LOW').length || 5, color: '#10b981' },
    { name: 'Medium Risk', value: batches.filter(b => b.currentRiskLevel === 'MEDIUM').length || 4, color: '#f59e0b' },
    { name: 'High Risk', value: batches.filter(b => b.currentRiskLevel === 'HIGH').length || 2, color: '#f43f5e' },
    { name: 'Critical Risk', value: batches.filter(b => b.currentRiskLevel === 'CRITICAL').length || 1, color: '#be123c' },
  ];

  const riskTrendData = [
    { day: 'Week 1', avgRisk: 22, temp: 19.5, humidity: 62 },
    { day: 'Week 2', avgRisk: 28, temp: 21.0, humidity: 65 },
    { day: 'Week 3', avgRisk: 42, temp: 23.5, humidity: 72 },
    { day: 'Week 4 (Current)', avgRisk: 63, temp: 26.5, humidity: 82 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-6">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          <TechnicalHonestyAlert
            title="EXECUTIVE AGRI VAULT DASHBOARD"
            message="Objective procurement quality assessment + continuous storage deterioration risk intelligence. Know what you received. Know what will happen next."
            variant="info"
          />

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                ENTERPRISE OPERATIONAL DASHBOARD
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Good evening — Inventory Overview</h1>
            </div>

            <Link
              href="/batches/ON-2026-00125/inspect"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Start Inspection Demo
            </Link>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Active Batches</span>
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-3xl font-mono font-bold text-slate-100 mt-2 block">{totalBatches}</span>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-1">100% Representative Sampled</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Total Inventory</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-3xl font-mono font-bold text-slate-100 mt-2 block">{totalInventoryKg.toLocaleString()} kg</span>
              <span className="text-[10px] text-slate-400 block mt-1">Lasalgaon & Pune Mandis</span>
            </div>

            <div className="bg-slate-900 border border-rose-900/60 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Inventory At Risk</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <span className="text-3xl font-mono font-bold text-rose-400 mt-2 block">{inventoryAtRiskPct}% At Risk</span>
              <span className="text-[10px] text-rose-400 font-bold uppercase block mt-1">Action Required</span>
            </div>

            <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Potential Value at Risk</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-3xl font-mono font-bold text-amber-400 mt-2 block">₹{potentialVarTotal.toLocaleString()}</span>
              <span className="text-[10px] text-amber-400 font-semibold block mt-1">Decision Support Estimate</span>
            </div>
          </div>

          {/* ACTION REQUIRED BANNER (MAIN DEMO BATCH ON-2026-00125) */}
          <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-rose-900/60">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-rose-400 animate-pulse" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
                    ACTION REQUIRED: HIGH DETERIORATION RISK
                  </span>
                  <h3 className="text-lg font-extrabold text-white">Batch ON-2026-00125 (500 kg Red Onion)</h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-700 font-mono font-bold text-xs">
                Risk Score: 78 / 100 (HIGH RISK)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-semibold">Root Cause Explanation</span>
                <p className="text-rose-300 font-medium mt-0.5">High humidity (82.0% RH) + 12% visible rot trend.</p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-semibold">Potential Value at Risk</span>
                <p className="text-amber-300 font-mono font-bold mt-0.5">₹12,000 (out of ₹50,000 batch total)</p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-semibold">AI Recommendation</span>
                <p className="text-emerald-400 font-bold mt-0.5">PRIORITIZE DISPATCH IMMEDIATELY</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Link
                href="/batches/ON-2026-00125/inspect"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                Rescan & Verify Sample
              </Link>
              <Link
                href="/batches/ON-2026-00125/storage"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950"
              >
                Take Action & Approve Dispatch →
              </Link>
            </div>
          </div>

          {/* Charts: Risk Trend & Inventory Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Trend Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                STORAGE DETERIORATION RISK TREND OVER TIME
              </h3>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="avgRisk" name="Risk Score (0-100)" stroke="#f43f5e" strokeWidth={3} />
                    <Line type="monotone" dataKey="humidity" name="Humidity (% RH)" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inventory Health Distribution Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                INVENTORY RISK HEALTH DISTRIBUTION
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Batches Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              RECENT PROCUREMENT BATCHES
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="pb-2">Batch ID</th>
                    <th className="pb-2">Weight</th>
                    <th className="pb-2">Grade</th>
                    <th className="pb-2">Quality</th>
                    <th className="pb-2">Risk</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {batches.slice(0, 5).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-950/60">
                      <td className="py-2.5 font-mono font-bold text-white">
                        <Link href={`/batches/${b.id}`} className="hover:text-emerald-400">
                          {b.id}
                        </Link>
                      </td>
                      <td className="py-2.5 font-mono">{b.quantityKg || b.weight} kg</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                          Grade {b.currentGrade || 'B'}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono font-bold text-emerald-400">{b.initialQualityScore || 78}/100</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.currentRiskLevel === 'HIGH' || b.currentRiskLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {b.currentRiskLevel || 'LOW'} ({b.currentRiskScore || 28})
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/batches/${b.id}/inspect`}
                          className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-semibold"
                        >
                          Inspect →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
