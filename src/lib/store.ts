import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProjectTask, TierLevel, generateAllTiers, TierEstimateSummary, generateRecommendations, OptimizationRecommendation } from './calculator';

interface ScopeStore {
  projectName: string;
  projectDescription: string;
  tasks: ProjectTask[];
  selectedTier: TierLevel;
  
  // Actions
  setProjectDetails: (name: string, description: string) => void;
  addTask: (task: ProjectTask) => void;
  removeTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  applyTaskOverrides: (transformer: (tasks: ProjectTask[]) => ProjectTask[]) => void;
  setSelectedTier: (tier: TierLevel) => void;
  clearProject: () => void;
  
  // Derived / Utility (Note: Best practice is to calculate these in components, 
  // but we provide a convenience getter for the current estimations)
  getEstimations: () => Record<TierLevel, TierEstimateSummary>;
  getRecommendations: () => OptimizationRecommendation[];
}

export const useScopeStore = create<ScopeStore>()(
  persist(
    (set, get) => ({
      projectName: '',
      projectDescription: '',
      tasks: [],
      selectedTier: 'standard',
      
      setProjectDetails: (name, description) => set({ projectName: name, projectDescription: description }),
      
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      
      removeTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      })),
      
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      })),

      applyTaskOverrides: (transformer) => set((state) => ({
        tasks: transformer(state.tasks)
      })),
      
      setSelectedTier: (tier) => set({ selectedTier: tier }),
      
      clearProject: () => set({ projectName: '', projectDescription: '', tasks: [], selectedTier: 'standard' }),
      
      getEstimations: () => generateAllTiers(get().tasks),

      getRecommendations: () => {
        const state = get();
        const estimations = generateAllTiers(state.tasks);
        return generateRecommendations(state.tasks, state.selectedTier, estimations[state.selectedTier]);
      }
    }),
    {
      name: 'scope-ai-storage', // saves to localStorage
    }
  )
);
