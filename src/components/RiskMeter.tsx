'use client';

import type { RiskLevel } from '@/lib/scope/types';

const CONFIG: Record<RiskLevel, { label: string; bar: string; bg: string; text: string }> = {
  low:    { label: 'Low',    bar: 'bg-emerald-400', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  medium: { label: 'Medium', bar: 'bg-amber-400',   bg: 'bg-amber-50',    text: 'text-amber-700'   },
  high:   { label: 'High',   bar: 'bg-red-500',     bg: 'bg-red-50',      text: 'text-red-700'     },
};

const WIDTH: Record<RiskLevel, string> = { low: 'w-1/3', medium: 'w-2/3', high: 'w-full' };

interface Props {
  label: string;
  level: RiskLevel;
  compact?: boolean;
}

export default function RiskMeter({ label, level, compact = false }: Props) {
  const c = CONFIG[level];
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 w-24 shrink-0">{label}</span>
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${c.bar} ${WIDTH[level]}`} />
        </div>
        <span className={`text-xs font-semibold w-12 text-right ${c.text}`}>{c.label}</span>
      </div>
    );
  }
  return (
    <div className={`rounded-xl px-4 py-3 ${c.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className={`text-sm font-bold ${c.text}`}>{c.label}</span>
      </div>
      <div className="h-2 bg-white/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${c.bar} ${WIDTH[level]}`} />
      </div>
    </div>
  );
}
