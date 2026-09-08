'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import TechnicalHonestyAlert from '@/components/common/TechnicalHonestyAlert';
import { Settings, Shield, Users, FileText, Sliders } from 'lucide-react';

export default function AdminPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    // Demo audit logs seed
    setAuditLogs([
      { id: '1', action: 'BATCH_CREATED', details: 'Batch ON-2026-00125 registered (500 kg Red Onion)', timestamp: '2026-09-08 14:20' },
      { id: '2', action: 'SAMPLE_RECORDED', details: 'Representative sampling logged from 5 cart depth locations (100 onions)', timestamp: '2026-09-08 14:22' },
      { id: '3', action: 'AI_INSPECTION_COMPLETED', details: 'AI camera inspection analyzed 100 onions: 76 Acceptable, 17 Lower Grade, 7 Reject. Assigned Grade B (78/100)', timestamp: '2026-09-08 14:25' },
      { id: '4', action: 'RESCAN_COMPLETED', details: 'Rescan verified. 5 rejected onions physically removed by operator. Sorting verified.', timestamp: '2026-09-08 14:30' },
      { id: '5', action: 'RISK_ALERT_TRIGGERED', details: 'High risk alert generated (78/100) due to elevated humidity exposure (82% RH)', timestamp: '2026-09-08 15:10' },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-6">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          <TechnicalHonestyAlert
            title="ADMINISTRATION & AUDITABILITY"
            message="Grading thresholds are configurable to deployment-specific procurement standards. Audit logs record every user decision, override, and AI inference."
            variant="info"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                SYSTEM CONFIGURATION & GOVERNANCE
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Console & Audit Trail</h1>
            </div>
          </div>

          {/* Configurable Grading Rubric Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              CONFIGURABLE PROCUREMENT GRADING RUBRIC THRESHOLDS
            </h3>
            <p className="text-xs text-slate-400">
              Thresholds are configurable to the exact procurement standard used by your agricultural enterprise.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans font-bold">GRADE A</span>
                <span className="text-emerald-400 font-bold text-sm">≥ 90 Points</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans font-bold">GRADE B</span>
                <span className="text-emerald-400 font-bold text-sm">75 – 89 Points</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans font-bold">GRADE C</span>
                <span className="text-amber-400 font-bold text-sm">60 – 74 Points</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans font-bold">REJECT</span>
                <span className="text-rose-400 font-bold text-sm">&lt; 60 Points</span>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              SYSTEM AUDIT LOG TRAIL
            </h3>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-bold text-emerald-400 mr-2">[{log.action}]</span>
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
