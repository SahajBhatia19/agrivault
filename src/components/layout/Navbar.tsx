'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Cpu, PlusCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AGRI VAULT
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-emerald-400 font-bold -mt-1">
              Post-Harvest Intelligence
            </span>
          </div>
        </Link>

        {/* Demo AI Mode Badge & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-xs text-emerald-400 font-medium shadow-inner">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Demo AI Mode Active</span>
          </div>

          <Link
            href="/batches/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-950"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Batch</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
