'use client';

import React, { useEffect, useState, use } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import DigitalBatchPassport from '@/components/passport/DigitalBatchPassport';
import Link from 'next/link';
import { ArrowLeft, Camera, ShieldCheck } from 'lucide-react';

export default function BatchPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const batchId = resolvedParams.id;
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`/api/batches/${batchId}`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setBatch(data.batch);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  }, [batchId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-6">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Header */}
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
                  CHAIN OF CUSTODY AUTHENTICATION
                </span>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Verifiable Digital Batch Passport ({batchId})
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/batches/${batchId}/inspect`}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                AI Inspection Studio
              </Link>
              <Link
                href={`/batches/${batchId}/storage`}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                Risk Intelligence
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Loading Digital Passport...</div>
          ) : batch ? (
            <DigitalBatchPassport batch={batch} />
          ) : (
            <div className="p-12 text-center text-rose-400 text-sm">Batch not found</div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
