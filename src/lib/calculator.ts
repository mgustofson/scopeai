import { ModelData, TASK_COMPLEXITY, TIER_MULTIPLIERS, ModelId, ComplexityLevel, TierLevel, StrategyLevel } from './constants';

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
  estimatedTurns: number;
  isOptimal: boolean;
  reasoningScore: number;
  latencyScore: number;
}

export interface TimeEstimates {
  free: string;
  pro: string;
  api: string;
}

export interface StrategyEstimateSummary {
  strategy: StrategyLevel;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  totalTurns: number;
  timeEstimates: TimeEstimates;
  avgLatency: number;
  avgConfidence: number;
  tasks: EstimatedTask[];
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  applyOverrides: (tasks: ProjectTask[]) => ProjectTask[];
}

export function getTimeEstimates(totalTurns: number, avgLatency: number = 3): TimeEstimates {
  // Latency multiplier: scale the time based on model speed (1-5)
  const latencyMult = avgLatency / 2.5; 
  
  const getLabel = (turns: number, limitPerBlock: number) => {
    const adjustedTurns = turns * latencyMult;
    const blocks = Math.ceil(adjustedTurns / limitPerBlock);
    if (blocks <= 1) return "Under 5 hours";
    if (blocks === 2) return "1-2 Days";
    if (blocks <= 4) return "2-3 Days";
    if (blocks <= 10) return "1-2 Weeks";
    return "2+ Weeks";
  };

  return {
    free: getLabel(totalTurns, 30),
    pro: getLabel(totalTurns, 150),
    api: "Instant (API speed)"
  };
}

export function findOptimalModel(
  taskComplexity: ComplexityLevel, 
  strategy: StrategyLevel, 
  models: Record<string, ModelData>,
  providerPreference: 'All' | 'Anthropic' | 'OpenAI' = 'All'
): string {
  const complexity = TASK_COMPLEXITY[taskComplexity];
  const allModels = Object.entries(models);
  
  const candidateModels = allModels.filter(([id, data]) => {
    if (providerPreference !== 'All' && data.provider !== providerPreference) return false;
    // Must meet min reasoning floor
    return data.reasoning_tier >= complexity.min_reasoning_tier;
  });

  if (candidateModels.length === 0) {
    // No models meet the reasoning floor — relax the filter and pick any available model
    const anyModel = allModels.length > 0 ? allModels.sort((a, b) => b[1].reasoning_tier - a[1].reasoning_tier)[0][0] : 'anthropic/claude-sonnet-4.6';
    return anyModel;
  }

  if (strategy === 'cost') {
    // Return the cheapest model that meets the floor
    return candidateModels.sort((a, b) => a[1].input_cost_per_mk - b[1].input_cost_per_mk)[0][0];
  }

  if (strategy === 'quality') {
    // Return the most powerful model
    return candidateModels.sort((a, b) => b[1].reasoning_tier - a[1].reasoning_tier)[0][0];
  }

  // Balanced strategy:
  // For Simple: cheapest. For Medium: mid-range. For Complex: highest tier.
  if (taskComplexity === 'simple') {
    return candidateModels.sort((a, b) => a[1].input_cost_per_mk - b[1].input_cost_per_mk)[0][0];
  }
  
  if (taskComplexity === 'medium') {
    // Prefer tier 7-8 models (Sonnet, GPT-4o)
    const midModels = candidateModels.filter(m => m[1].reasoning_tier >= 7 && m[1].reasoning_tier <= 8);
    return midModels.length > 0 ? midModels[0][0] : candidateModels[0][0];
  }

  // Complex tasks in balanced mode get the top-tier models
  return candidateModels.sort((a, b) => b[1].reasoning_tier - a[1].reasoning_tier)[0][0];
}

export function calculateStrategyEstimate(
  tasks: ProjectTask[], 
  strategy: StrategyLevel, 
  providerPreference: 'All' | 'Anthropic' | 'OpenAI' = 'All', 
  models: Record<string, ModelData>
): StrategyEstimateSummary {
  // Consolidate Posture into Strategy:
  // cost -> lean, balanced -> standard, quality -> premium
  const posture: TierLevel = strategy === 'cost' ? 'lean' : strategy === 'quality' ? 'premium' : 'standard';
  const multipliers = TIER_MULTIPLIERS[posture];
  
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCost = 0;
  let totalTurns = 0;
  let totalLatency = 0;
  let totalReasoning = 0;
  
  const estimatedTasks = tasks.map(task => {
    const complexityStats = TASK_COMPLEXITY[task.complexity];
    const optimalModelId = findOptimalModel(task.complexity, strategy, models, providerPreference);
    // If the task has a stale override that no longer exists in the model map, discard it
    const appliedModelId = (task.overrideModel && models[task.overrideModel]) ? task.overrideModel : optimalModelId;
    const model = models[appliedModelId];
    
    if (!model) {
      // Absolute emergency — should never happen with DEFAULT_MODELS populated
      return {
        task,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        appliedModel: appliedModelId,
        estimatedTurns: 0,
        isOptimal: false,
        reasoningScore: 0,
        latencyScore: 0
      };
    }
    
    const pumping = task.overrideContextPumping ?? multipliers.contextPumping;
    const estimatedTurns = Math.ceil((complexityStats as any).baseTurns * multipliers.retries);
    const avgContextPerTurn = (complexityStats as any).contextPerTurn * pumping;
    
    const rawInputTokens = Math.ceil(avgContextPerTurn * estimatedTurns);
    const rawOutputTokens = Math.ceil((complexityStats as any).outputPerTurn * estimatedTurns);
    
    totalInputTokens += rawInputTokens;
    totalOutputTokens += rawOutputTokens;
    
    const inputCost = (rawInputTokens / 1_000_000) * model.input_cost_per_mk;
    const outputCost = (rawOutputTokens / 1_000_000) * model.output_cost_per_mk;
    const taskTotalCost = Math.max(0, inputCost + outputCost);
    
    totalCost += taskTotalCost;
    totalTurns += estimatedTurns;
    totalLatency += model.latency_score;
    totalReasoning += model.reasoning_tier;
    
    return {
      task,
      inputTokens: rawInputTokens,
      outputTokens: rawOutputTokens,
      cost: taskTotalCost,
      appliedModel: appliedModelId,
      estimatedTurns,
      isOptimal: appliedModelId === optimalModelId,
      reasoningScore: model.reasoning_tier,
      latencyScore: model.latency_score
    };
  });

  const avgLatency = tasks.length > 0 ? totalLatency / tasks.length : 1;
  const avgConfidence = tasks.length > 0 ? (totalReasoning / tasks.length) * 10 : 0;

  return {
    strategy,
    totalInputTokens,
    totalOutputTokens,
    totalCost,
    totalTurns,
    timeEstimates: getTimeEstimates(totalTurns, avgLatency),
    avgLatency,
    avgConfidence,
    tasks: estimatedTasks
  };
}

export function generateAllStrategies(
  tasks: ProjectTask[], 
  providerPreference: 'All' | 'Anthropic' | 'OpenAI' = 'All', 
  models: Record<string, ModelData>
): Record<StrategyLevel, StrategyEstimateSummary> {
  return {
    cost: calculateStrategyEstimate(tasks, 'cost', providerPreference, models),
    balanced: calculateStrategyEstimate(tasks, 'balanced', providerPreference, models),
    quality: calculateStrategyEstimate(tasks, 'quality', providerPreference, models),
  };
}

export function generateRecommendations(
  tasks: ProjectTask[], 
  currentStrategy: StrategyLevel, 
  currentEstimate: StrategyEstimateSummary, 
  models: Record<string, ModelData>
): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];
  if (tasks.length === 0) return recommendations;
  
  const subOptimalTasks = currentEstimate.tasks.filter(t => !t.isOptimal);
  
  if (subOptimalTasks.length > 0) {
    let totalPotentialSavings = 0;
    subOptimalTasks.forEach(t => {
      const optimalId = findOptimalModel(t.task.complexity, currentStrategy, models);
      const optimalModel = models[optimalId];
      if (optimalModel) {
        const optimalCost = ((t.inputTokens / 1_000_000) * optimalModel.input_cost_per_mk) + ((t.outputTokens / 1_000_000) * optimalModel.output_cost_per_mk);
        if (t.cost > optimalCost) {
          totalPotentialSavings += (t.cost - optimalCost);
        }
      }
    });

    if (totalPotentialSavings > 0.01) {
      recommendations.push({
        id: 'apply_optimal_routing',
        title: 'Apply Optimal Model Routing',
        description: `You have ${subOptimalTasks.length} tasks using non-optimal models. Switching to the recommended models for your ${currentStrategy} strategy will save tokens.`,
        potentialSavings: totalPotentialSavings,
        applyOverrides: (tks) => tks.map(t => ({ ...t, overrideModel: undefined }))
      });
    }
  }

  return recommendations;
}
