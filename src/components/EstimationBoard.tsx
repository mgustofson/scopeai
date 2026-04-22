"use client";

import { useScopeStore } from "@/lib/store";
import { TierLevel } from "@/lib/constants";
import { TierEstimateSummary } from "@/lib/calculator";

export default function EstimationBoard() {
  const { tasks, selectedTier, setSelectedTier, getEstimations } = useScopeStore();

  if (tasks.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
        <h3 className="text-lg font-medium text-slate-500 mb-2">Awaiting Project Scope</h3>
        <p className="text-sm text-slate-400">Add features in the intake form to generate estimations.</p>
      </div>
    );
  }

  const estimations = getEstimations();

  const TierCard = ({ title, tierId, estimate }: { title: string, tierId: TierLevel, estimate: TierEstimateSummary }) => {
    const isSelected = selectedTier === tierId;
    
    return (
      <button 
        onClick={() => setSelectedTier(tierId)}
        className={`w-full text-left rounded-xl p-5 border-2 transition-all ${
          isSelected 
            ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600' 
            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-xl font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{title}</h3>
            <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              {estimate.modelUsed.replace(/-/g, ' ')}
            </p>
          </div>
          {isSelected && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">Selected</span>
          )}
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total Input Tokens:</span>
            <span className="font-mono font-medium text-slate-800">{estimate.totalInputTokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total Output Tokens:</span>
            <span className="font-mono font-medium text-slate-800">{estimate.totalOutputTokens.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Estimated Cost</p>
          <p className={`text-3xl font-black tracking-tight ${isSelected ? 'text-blue-600' : 'text-emerald-600'}`}>
            ${estimate.totalCost.toFixed(2)}
          </p>
        </div>
      </button>
    );
  };

  const activeEstimate = estimations[selectedTier];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TierCard title="Lean" tierId="lean" estimate={estimations.lean} />
        <TierCard title="Standard" tierId="standard" estimate={estimations.standard} />
        <TierCard title="Premium" tierId="premium" estimate={estimations.premium} />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Active Tier Breakdown: <span className="capitalize text-blue-600">{selectedTier}</span></h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-y border-slate-200">
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Input Tokens</th>
                <th className="px-4 py-3 font-medium">Output Tokens</th>
                <th className="px-4 py-3 font-medium text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeEstimate.tasks.map((data) => (
                <tr key={data.task.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">{data.task.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{data.inputTokens.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{data.outputTokens.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono font-medium text-slate-800 text-right">${data.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold border-y border-slate-200">
                <td className="px-4 py-3 text-slate-800 text-right">Total</td>
                <td className="px-4 py-3 font-mono text-slate-800">{activeEstimate.totalInputTokens.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-slate-800">{activeEstimate.totalOutputTokens.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-blue-600 text-right">${activeEstimate.totalCost.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
