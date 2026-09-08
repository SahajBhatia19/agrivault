import React from 'react';
import { Info, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  title?: string;
  message: string;
  variant?: 'info' | 'warning' | 'success';
}

export default function TechnicalHonestyAlert({
  title = 'TECHNICAL HONESTY NOTICE',
  message,
  variant = 'info',
}: Props) {
  const styles = {
    info: 'bg-slate-900/80 border-slate-700 text-slate-300',
    warning: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
    success: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
  };

  const icons = {
    info: <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
    success: <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
  };

  return (
    <div className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 shadow-sm ${styles[variant]}`}>
      {icons[variant]}
      <div>
        <span className="font-semibold tracking-wider uppercase text-[10px] block text-slate-400 mb-0.5">
          {title}
        </span>
        <p className="opacity-90">{message}</p>
      </div>
    </div>
  );
}
