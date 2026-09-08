'use client';

import React, { useEffect, useState, use } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import OnionInspectionStudio from '@/components/inspection/OnionInspectionStudio';
import RepresentativeSamplingWizard from '@/components/inspection/RepresentativeSamplingWizard';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

export default function BatchInspectStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const batchId = resolvedParams.id;
  const [batch, setBatch] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sampling' | 'inspect'>('inspect');

  useEffect(() => {
    fetch(`/api/batches/${batchId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBatch(data.batch);
        }
      })
      .catch((err) => console.error(err));
  }, [batchId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-6">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Link
                href="/batches"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  AI COMPUTER VISION STUDIO
                </span>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Single-Layer Inspection & Rescan Studio ({batchId})
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/batches/${batchId}/passport`}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Digital Passport
              </Link>
              <Link
                href={`/batches/${batchId}/storage`}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                Storage & Risk
              </Link>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('inspect')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'inspect'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Camera Scan & Rescan Studio
            </button>
            <button
              onClick={() => setActiveTab('sampling')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'sampling'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Representative Sampling Quad Diagram
            </button>
          </div>

          {/* Tab Views */}
          {activeTab === 'inspect' && <OnionInspectionStudio batchId={batchId} batchDetails={batch} />}

          {activeTab === 'sampling' && (
            <RepresentativeSamplingWizard
              batchQuantityKg={batch?.quantityKg || 500}
              onProceedToCamera={() => setActiveTab('inspect')}
            />
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
