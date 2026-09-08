'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Link from 'next/link';
import { PlusCircle, Filter, Search, ArrowUpDown, Camera, ShieldAlert, FileText } from 'lucide-react';

export default function BatchesInventoryPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'weight' | 'risk'>('date');

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

  const filteredBatches = batches
    .filter((b) => {
      const matchSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) || (b.variety || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchRisk = riskFilter === 'ALL' || b.currentRiskLevel === riskFilter;
      const matchGrade = gradeFilter === 'ALL' || b.currentGrade === gradeFilter;
      return matchSearch && matchRisk && matchGrade;
    })
    .sort((a, b) => {
      if (sortBy === 'weight') return (b.quantityKg || 0) - (a.quantityKg || 0);
      if (sortBy === 'risk') return (b.currentRiskScore || 0) - (a.currentRiskScore || 0);
      return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
    });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-6">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                POST-HARVEST INVENTORY MANAGEMENT
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Active Batch Repository</h1>
            </div>

            <Link
              href="/batches/new"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950"
            >
              <PlusCircle className="w-4 h-4" />
              Register New Batch
            </Link>
          </div>

          {/* Search, Filters & Sorting Controls */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search Batch ID or Variety..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Risk Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px]">Risk:</span>
                {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setRiskFilter(lvl)}
                    className={`px-2 py-0.5 rounded font-bold text-[10px] transition-all ${
                      riskFilter === lvl ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Grade Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px]">Grade:</span>
                {['ALL', 'A', 'B', 'C', 'REJECT'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGradeFilter(g)}
                    className={`px-2 py-0.5 rounded font-bold text-[10px] transition-all ${
                      gradeFilter === g ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Batches Table View */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading persistent batch inventory from PostgreSQL backend...</div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
                      <th className="p-3.5">Batch Code / ID</th>
                      <th className="p-3.5">Crop & Variety</th>
                      <th className="p-3.5">Weight (kg)</th>
                      <th className="p-3.5">Grade</th>
                      <th className="p-3.5">Quality Score</th>
                      <th className="p-3.5">Deterioration Risk</th>
                      <th className="p-3.5">Value at Risk</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredBatches.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-950/60 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-white">
                          <Link href={`/batches/${b.id}`} className="hover:text-emerald-400">
                            {b.id}
                          </Link>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <span className="font-semibold block">{b.crop}</span>
                          <span className="text-[10px] text-slate-500 block">{b.variety}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-200">{b.quantityKg || b.weight} kg</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded font-black text-xs bg-emerald-600 text-white">
                            Grade {b.currentGrade || 'B'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">{b.initialQualityScore || 78}/100</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              b.currentRiskLevel === 'CRITICAL' || b.currentRiskLevel === 'HIGH'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : b.currentRiskLevel === 'MEDIUM'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {b.currentRiskLevel || 'LOW'} ({b.currentRiskScore || 28})
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-amber-400 font-bold">
                          ₹{(b.potentialValueAtRisk || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <Link
                            href={`/batches/${b.id}/inspect`}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold hover:bg-emerald-900 inline-flex items-center gap-1"
                          >
                            <Camera className="w-3 h-3" /> Inspect
                          </Link>
                          <Link
                            href={`/batches/${b.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-semibold hover:bg-slate-800 inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-emerald-400" /> Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
