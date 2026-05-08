'use client';

import type { GuidanceOutput, DriftReport } from '@/lib/scope/types';

interface Props {
  guidance: GuidanceOutput;
  drift: DriftReport;
}

const SEVERITY_STYLES = {
  low:    'border-emerald-200 bg-emerald-50',
  medium: 'border-amber-200 bg-amber-50',
  high:   'border-red-200 bg-red-50',
};

const MESSAGE_STYLES = {
  low:    'text-emerald-800',
  medium: 'text-amber-800',
  high:   'text-red-800',
};

type OverallRisk = 'low' | 'medium' | 'high';
function overallFromGuidance(g: GuidanceOutput): OverallRisk {
  if (g.shouldAskForConfirmation) return 'high';
  if (g.shouldCheckpoint || g.shouldSplitTask) return 'medium';
  return 'low';
}

export default function GuidanceCard({ guidance, drift }: Props) {
  const level = overallFromGuidance(guidance);
  return (
    <div className={`rounded-xl border-2 p-5 space-y-4 transition-all duration-300 ${SEVERITY_STYLES[level]}`}>
      {/* Message */}
      <p className={`font-semibold text-sm leading-snug ${MESSAGE_STYLES[level]}`}>
        {guidance.message}
      </p>

      {/* Drift badge */}
      {drift.level !== 'none' && (
        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          drift.level === 'severe' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}>
          <span>⚠</span>
          <span>
            Drift {drift.level}: declared <strong>{drift.declaredTaskType}</strong> → inferred <strong>{drift.inferredTaskType}</strong>
          </span>
        </div>
      )}

      {/* Actions */}
      {guidance.actions.length > 0 && (
        <ul className="space-y-1.5">
          {guidance.actions.map((action, i) => (
            <li key={i} className="flex gap-2 text-xs text-slate-700">
              <span className="mt-0.5 shrink-0 text-slate-400">•</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Flags */}
      <div className="flex flex-wrap gap-2 pt-1">
        {guidance.shouldSplitTask && (
          <span className="text-xs bg-white/70 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">Split task</span>
        )}
        {guidance.shouldCheckpoint && (
          <span className="text-xs bg-white/70 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">Checkpoint</span>
        )}
        {guidance.shouldAskForConfirmation && (
          <span className="text-xs bg-white/70 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">Confirm scope</span>
        )}
      </div>
    </div>
  );
}
