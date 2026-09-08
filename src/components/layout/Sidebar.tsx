'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Camera,
  Thermometer,
  ShieldAlert,
  FileText,
  BarChart3,
  Settings,
  PlusCircle,
  Zap,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Batches', href: '/batches', icon: Layers },
    { label: 'Inspection Studio', href: '/batches/ON-2026-00125/inspect', icon: Camera, badge: 'DEMO' },
    { label: 'Storage Monitoring', href: '/batches/ON-2026-00125/storage', icon: Thermometer },
    { label: 'Risk Intelligence', href: '/batches/ON-2026-00125/storage', icon: ShieldAlert },
    { label: 'Digital QR Passport', href: '/batches/ON-2026-00125/passport', icon: FileText },
    { label: 'Analytics & Yield', href: '/analytics', icon: BarChart3 },
    { label: 'Admin & Settings', href: '/admin', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-950/60 min-h-[calc(100vh-61px)] p-4 shrink-0">
      <div className="space-y-6 flex-1">
        <div>
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2.5 px-3">
            PLATFORM NAVIGATION
          </h4>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Hackathon Quick Link */}
      <div className="pt-4 border-t border-slate-800">
        <Link
          href="/batches/ON-2026-00125/inspect"
          className="block p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-700/40 hover:border-emerald-500 transition-all text-center group"
        >
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
            🚀 60-SECOND JUDGE DEMO
          </span>
          <span className="text-xs text-slate-200 font-semibold group-hover:text-white flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Start AI Inspection →
          </span>
        </Link>
      </div>
    </aside>
  );
}
