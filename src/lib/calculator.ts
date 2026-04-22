import { MODELS, TASK_COMPLEXITY, TIER_MULTIPLIERS, ModelId, ComplexityLevel, TierLevel } from './constants';

export interface ProjectTask {
  id: string;
  name: string;
  complexity: ComplexityLevel;
  overrideModel?: ModelId;
  overrideContextPumping?: number;
}

export interface EstimatedTask {
  task: ProjectTask;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  appliedModel: ModelId;
}

export interface TierEstimateSummary {
  tier: TierLevel;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  modelUsed: ModelId;
  tasks: EstimatedTask[];
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  applyOverrides: (tasks: ProjectTask[]) => ProjectTask[];
}

export function calculateTierEstimate(tasks: ProjectTask[], tier: TierLevel): TierEstimateSummary {
  const multipliers = TIER_MULTIPLIERS[tier];
  
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCost = 0;
  
  const estimatedTasks = tasks.map(task => {
    const complexityStats = TASK_COMPLEXITY[task.complexity];
    const appliedModelId = task.overrideModel || multipliers.defaultModel;
    const model = MODELS[appliedModelId];
    const pumping = task.overrideContextPumping ?? multipliers.contextPumping;
    
    // Calculate raw tokens with tier pumping rules
    const rawInputTokens = Math.ceil(complexityStats.baseInputTokens * pumping * multipliers.retries);
    const rawOutputTokens = Math.ceil(complexityStats.baseOutputTokens * multipliers.retries);
    
    // Accumulate globals
    totalInputTokens += rawInputTokens;
    totalOutputTokens += rawOutputTokens;
    
    // Calculate cost in dollars (per million tokens -> mk)
    const inputCost = (rawInputTokens / 1_000_000) * model.input_cost_per_mk;
    const outputCost = (rawOutputTokens / 1_000_000) * model.output_cost_per_mk;
    const taskTotalCost = inputCost + outputCost;
    
    totalCost += taskTotalCost;
    
    return {
      task,
      inputTokens: rawInputTokens,
      outputTokens: rawOutputTokens,
      cost: taskTotalCost,
      appliedModel: appliedModelId
    };
  });

  return {
    tier,
    totalInputTokens,
    totalOutputTokens,
    totalCost,
    modelUsed: multipliers.defaultModel,
    tasks: estimatedTasks
  };
}

export function generateAllTiers(tasks: ProjectTask[]): Record<TierLevel, TierEstimateSummary> {
  return {
    lean: calculateTierEstimate(tasks, 'lean'),
    standard: calculateTierEstimate(tasks, 'standard'),
    premium: calculateTierEstimate(tasks, 'premium'),
  };
}

export function generateRecommendations(tasks: ProjectTask[], currentTier: TierLevel, currentEstimate: TierEstimateSummary): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];
  
  if (tasks.length === 0) return recommendations;
  
  const multipliers = TIER_MULTIPLIERS[currentTier];
  
  // Rule 1: Downgrade Simple Tasks to Haiku
  const simpleTasksUsingExpensiveModel = tasks.filter(t => 
    t.complexity === 'simple' && 
    (t.overrideModel || multipliers.defaultModel) !== 'claude-3-haiku'
  );
  
  if (simpleTasksUsingExpensiveModel.length > 0) {
    // Calculate savings
    let savings = 0;
    simpleTasksUsingExpensiveModel.forEach(t => {
      const currentModelId = t.overrideModel || multipliers.defaultModel;
      const currentModel = MODELS[currentModelId];
      const haiku = MODELS['claude-3-haiku'];
      
      const pumping = t.overrideContextPumping ?? multipliers.contextPumping;
      const stats = TASK_COMPLEXITY[t.complexity];
      const inTokens = Math.ceil(stats.baseInputTokens * pumping * multipliers.retries);
      const outTokens = Math.ceil(stats.baseOutputTokens * multipliers.retries);
      
      const currentCost = ((inTokens / 1_000_000) * currentModel.input_cost_per_mk) + ((outTokens / 1_000_000) * currentModel.output_cost_per_mk);
      const newCost = ((inTokens / 1_000_000) * haiku.input_cost_per_mk) + ((outTokens / 1_000_000) * haiku.output_cost_per_mk);
      
      savings += (currentCost - newCost);
    });
    
    if (savings > 0) {
      recommendations.push({
        id: 'downgrade-simple-haiku',
        title: 'Route simple tasks to Haiku',
        description: `You have ${simpleTasksUsingExpensiveModel.length} simple task(s) using a heavier model. Haiku is more than capable for basic parsing and will reduce costs.`,
        potentialSavings: savings,
        applyOverrides: (currentTasks) => currentTasks.map(t => 
          t.complexity === 'simple' ? { ...t, overrideModel: 'claude-3-haiku' } : t
        )
      });
    }
  }

  // Rule 2: Use 3.5 Sonnet instead of Opus for Premium tier
  if (currentTier === 'premium') {
    const tasksUsingOpus = tasks.filter(t => (t.overrideModel || multipliers.defaultModel) === 'claude-3-opus');
    if (tasksUsingOpus.length > 0) {
      let savings = 0;
      tasksUsingOpus.forEach(t => {
        const currentModel = MODELS['claude-3-opus'];
        const sonnet35 = MODELS['claude-3-5-sonnet'];
        const pumping = t.overrideContextPumping ?? multipliers.contextPumping;
        const stats = TASK_COMPLEXITY[t.complexity];
        const inTokens = Math.ceil(stats.baseInputTokens * pumping * multipliers.retries);
        const outTokens = Math.ceil(stats.baseOutputTokens * multipliers.retries);
        
        const currentCost = ((inTokens / 1_000_000) * currentModel.input_cost_per_mk) + ((outTokens / 1_000_000) * currentModel.output_cost_per_mk);
        const newCost = ((inTokens / 1_000_000) * sonnet35.input_cost_per_mk) + ((outTokens / 1_000_000) * sonnet35.output_cost_per_mk);
        
        savings += (currentCost - newCost);
      });
      
      if (savings > 0) {
        recommendations.push({
          id: 'swap-opus-for-sonnet35',
          title: 'Swap Opus for 3.5 Sonnet',
          description: 'Claude 3.5 Sonnet beats Opus in coding benchmarks but costs 80% less. Highly recommended.',
          potentialSavings: savings,
          applyOverrides: (currentTasks) => currentTasks.map(t => 
            (t.overrideModel || multipliers.defaultModel) === 'claude-3-opus' ? { ...t, overrideModel: 'claude-3-5-sonnet' } : t
          )
        });
      }
    }
  }

  return recommendations;
}
