import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelData, DEFAULT_MODELS, TierLevel, StrategyLevel } from './constants';
import { ProjectTask, generateAllStrategies, StrategyEstimateSummary, generateRecommendations, OptimizationRecommendation } from './calculator';

interface ScopeStore {
  projectName: string;
  projectDescription: string;
  projectType: 'Web App' | 'Mobile App' | 'Backend API' | 'Scripting/CLI' | 'Landing Page';
  tasks: ProjectTask[];
  selectedStrategy: StrategyLevel;
  tierReasoning: string | null;
  providerFilter: 'All' | 'Anthropic' | 'OpenAI';
  userPlan: 'free' | 'pro' | 'api';
  models: Record<string, ModelData>;
  isModelsLoading: boolean;
  
  // Actions
  setProjectDetails: (name: string, description: string, type: 'Web App' | 'Mobile App' | 'Backend API' | 'Scripting/CLI' | 'Landing Page') => void;
  addTask: (task: ProjectTask) => void;
  removeTask: (taskId: string) => void;
  applyTaskOverrides: (transformer: (tasks: ProjectTask[]) => ProjectTask[]) => void;
  setSelectedStrategy: (strategy: StrategyLevel) => void;
  setProviderFilter: (provider: 'All' | 'Anthropic' | 'OpenAI') => void;
  setUserPlan: (plan: 'free' | 'pro' | 'api') => void;
  clearProject: () => void;
  fetchModels: () => Promise<void>;
  
  // Derived / Utility (Note: Best practice is to calculate these in components, 
  // but we provide a convenience getter for the current estimations)
  getEstimations: () => Record<StrategyLevel, StrategyEstimateSummary>;
  getRecommendations: () => OptimizationRecommendation[];
}

export const useScopeStore = create<ScopeStore>()(
  persist(
    (set, get) => ({
      projectName: '',
      projectDescription: '',
      projectType: 'Web App',
      tasks: [],
      selectedStrategy: 'balanced',
      tierReasoning: null,
      providerFilter: 'Anthropic',
      userPlan: 'free',
      models: DEFAULT_MODELS,
      isModelsLoading: false,
      
      setProjectDetails: (name, description, type) => set({ projectName: name, projectDescription: description, projectType: type }),
      
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      
      removeTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      })),
      
      applyTaskOverrides: (transformer) => set((state) => ({
        tasks: transformer(state.tasks)
      })),
      
      setSelectedStrategy: (strategy) => set({ selectedStrategy: strategy }),
      
      setProviderFilter: (provider) => set((state) => {
        if (state.providerFilter === provider) return {};
        // Clear task overrides because optimizations are provider-specific
        return { 
          providerFilter: provider,
          tasks: state.tasks.map(t => ({ ...t, overrideModel: undefined, overrideContextPumping: undefined }))
        };
      }),
      
      setUserPlan: (plan) => set({ userPlan: plan }),
      
      clearProject: () => set({ projectName: '', projectDescription: '', projectType: 'Web App', tasks: [], selectedStrategy: 'balanced', tierReasoning: null, providerFilter: 'Anthropic' }),
      
      fetchModels: async () => {
        set({ isModelsLoading: true });
        try {
          const res = await fetch('https://openrouter.ai/api/v1/models');
          if (!res.ok) throw new Error('Failed to fetch OpenRouter models');
          const data = await res.json();
          
          // Only pull in the exact models we want from OpenRouter
          const allowedIds = new Set([
            'anthropic/claude-haiku-4.5',
            'anthropic/claude-sonnet-4.6',
            'anthropic/claude-opus-4.7',
            'openai/gpt-5.5',
            'openai/gpt-5.5-pro',
          ]);
          
          const newModels: Record<string, ModelData> = {};
          data.data.forEach((m: any) => {
            if (!allowedIds.has(m.id)) return;
            
            // pricing format: prompt, completion are strings representing cost per token
            const inputCost = Math.max(0, parseFloat(m.pricing?.prompt || "0") || 0) * 1_000_000;
            const outputCost = Math.max(0, parseFloat(m.pricing?.completion || "0") || 0) * 1_000_000;
            
            // Ensure provider names match our filter tabs exactly
            const provider = m.id.startsWith('anthropic/') ? 'Anthropic' : 'OpenAI';
            
            newModels[m.id] = {
              name: m.name.replace(/^(OpenAI|Anthropic):?\s*/i, ''), // Strip "OpenAI: " prefix
              provider,
              input_cost_per_mk: inputCost,
              output_cost_per_mk: outputCost,
              description: m.description || 'Latest flagship model',
              reasoning_tier: (m.id.includes('opus') || m.id.includes('pro')) ? 10 : (m.id.includes('sonnet') || m.id === 'openai/gpt-5.5') ? 8 : 4,
              latency_score: m.id.includes('haiku') ? 1 : (m.id.includes('pro') || m.id.includes('opus')) ? 3 : 2
            };
          });
          
          set({ models: { ...DEFAULT_MODELS, ...newModels }, isModelsLoading: false });
        } catch (e) {
          console.error(e);
          set({ models: DEFAULT_MODELS, isModelsLoading: false });
        }
      },
      
      getEstimations: () => {
        const state = get();
        const activeProvider = state.providerFilter === 'All' ? 'All' : state.providerFilter;
        return generateAllStrategies(state.tasks, activeProvider, state.models);
      },
      
      getRecommendations: () => {
        const state = get();
        const activeProvider = state.providerFilter === 'All' ? 'All' : state.providerFilter;
        const currentEstimate = generateAllStrategies(state.tasks, activeProvider, state.models)[state.selectedStrategy];
        return generateRecommendations(state.tasks, state.selectedStrategy, currentEstimate, state.models);
      }
    }),
    {
      name: 'scope-ai-storage', // saves to localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Purge any stale overrideModel IDs that no longer exist in the model registry
          const validIds = new Set(Object.keys(state.models));
          const cleaned = state.tasks.map(t => 
            (t.overrideModel && !validIds.has(t.overrideModel)) 
              ? { ...t, overrideModel: undefined } 
              : t
          );
          if (cleaned.some((t, i) => t !== state.tasks[i])) {
            useScopeStore.setState({ tasks: cleaned });
          }
        }
      }
    }
  )
);
