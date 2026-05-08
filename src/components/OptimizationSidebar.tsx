"use client";

import { useState } from "react";
import { useScopeStore } from "@/lib/store";

export default function OptimizationSidebar() {
  const { getRecommendations, applyTaskOverrides, tasks } = useScopeStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    <div className="bg-white rounded-2xl border border-slate-200/60 mt-6 relative overflow-hidden shadow-lg shadow-slate-200/40">
      {/* Subtle glow effect for optimization */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />
      
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-6 md:p-8 flex items-center justify-between relative z-10 focus:outline-none hover:bg-slate-50/50 transition-colors"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/>
              <path d="M19 17v4"/>
              <path d="M3 5h4"/>
              <path d="M17 19h4"/>
            </svg>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cost Optimization</h3>
          </div>
          <p className="text-sm text-slate-500 font-medium text-pretty">
            We found {recommendations.length} way{recommendations.length > 1 ? 's' : ''} to optimize your cost.
          </p>
        </div>
        
        <div className={`p-2 rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-indigo-50 text-indigo-600' : ''}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 md:px-8 pb-8 space-y-4 relative z-10 border-t border-slate-100/60 pt-6 bg-slate-50/30">
          {recommendations.map((rec) => (
            <div key={rec.id} className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-sm">
              <h4 className="font-bold text-slate-900 mb-1.5 tracking-tight">{rec.title}</h4>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed font-medium">{rec.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Save ~${rec.potentialSavings.toFixed(2)}
                </div>
                <button
                  onClick={() => applyTaskOverrides(rec.applyOverrides)}
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
                >
                  Apply Fix
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
