"use client";

import { useScopeStore } from "@/lib/store";

export default function OptimizationSidebar() {
  const { getRecommendations, applyTaskOverrides, tasks } = useScopeStore();
  
  // Don't calculate if there are no tasks
  if (tasks.length === 0) return null;
  
  const recommendations = getRecommendations();

  if (recommendations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 mt-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-2 text-slate-800">Optimization</h3>
        <p className="text-sm text-slate-500">
          Your current tier and task list are fully optimized. No savings found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 mt-6 relative overflow-hidden shadow-sm">
      {/* Subtle glow effect for optimization */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl pointer-events-none" />
      
      <h3 className="text-xl font-bold mb-3 text-slate-800">Cost Optimization</h3>
      <p className="text-sm text-slate-500 mb-5 text-pretty">
        We found {recommendations.length} way{recommendations.length > 1 ? 's' : ''} to optimize your cost without sacrificing output quality.
      </p>

      <div className="space-y-4 relative z-10">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-800 mb-2 tracking-tight">{rec.title}</h4>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{rec.description}</p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="text-sm font-medium text-emerald-600">
                Save ~${rec.potentialSavings.toFixed(2)}
              </div>
              <button
                onClick={() => applyTaskOverrides(rec.applyOverrides)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
              >
                Apply Fix
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
