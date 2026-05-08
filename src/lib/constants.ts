export interface ModelData {
  name: string;
  provider: string;
  input_cost_per_mk: number;
  output_cost_per_mk: number;
  description: string;
  reasoning_tier: number; // 1-10
  latency_score: number; // 1 (fast) - 5 (slow)
}

export const DEFAULT_MODELS: Record<string, ModelData> = {
  // --- Anthropic Claude 4.x ---
  "anthropic/claude-haiku-4.5": {
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    input_cost_per_mk: 1.00,
    output_cost_per_mk: 5.00,
    description: "Fastest Claude model, ideal for simple tasks.",
    reasoning_tier: 4,
    latency_score: 1
  },
  "anthropic/claude-sonnet-4.6": {
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    input_cost_per_mk: 3.00,
    output_cost_per_mk: 15.00,
    description: "Balanced intelligence and speed for production coding.",
    reasoning_tier: 8,
    latency_score: 2
  },
  "anthropic/claude-opus-4.7": {
    name: "Claude Opus 4.7",
    provider: "Anthropic",
    input_cost_per_mk: 5.00,
    output_cost_per_mk: 25.00,
    description: "Top-tier flagship for complex architecture and agentic tasks.",
    reasoning_tier: 10,
    latency_score: 3
  },
  // --- OpenAI GPT-5.5 ---
  "openai/gpt-5.5": {
    name: "GPT-5.5",
    provider: "OpenAI",
    input_cost_per_mk: 5.00,
    output_cost_per_mk: 30.00,
    description: "Flagship multimodal intelligence.",
    reasoning_tier: 8,
    latency_score: 2
  },
  "openai/gpt-5.5-pro": {
    name: "GPT-5.5 Pro",
    provider: "OpenAI",
    input_cost_per_mk: 30.00,
    output_cost_per_mk: 180.00,
    description: "Maximum reasoning and architectural depth.",
    reasoning_tier: 10,
    latency_score: 3
  }
};

export type ModelId = string;

export const TASK_COMPLEXITY = {
  simple: {
    contextPerTurn: 4000,
    outputPerTurn: 200,
    baseTurns: 2,
    min_reasoning_tier: 1,
    description: "Basic CRUD, UI components, static text generation."
  },
  medium: {
    contextPerTurn: 16000,
    outputPerTurn: 600,
    baseTurns: 5,
    min_reasoning_tier: 5,
    description: "API integrations, state management, complex data models."
  },
  complex: {
    contextPerTurn: 128000,
    outputPerTurn: 4000,
    baseTurns: 12,
    min_reasoning_tier: 8,
    description: "Agentic reasoning, deep refactors, architecture loops."
  }
} as const;

export type ComplexityLevel = keyof typeof TASK_COMPLEXITY;

export const TIER_MULTIPLIERS = {
  lean: {
    retries: 1.0,
    contextPumping: 1.0,
  },
  standard: {
    retries: 1.5,
    contextPumping: 1.5,
  },
  premium: {
    retries: 2.5,
    contextPumping: 2.0,
  }
} as const;

export type TierLevel = keyof typeof TIER_MULTIPLIERS;

export const TIER_MODELS: Record<TierLevel, string> = {
  lean: 'anthropic/claude-haiku-4.5',
  standard: 'anthropic/claude-sonnet-4.6',
  premium: 'anthropic/claude-opus-4.7'
};

export type StrategyLevel = 'cost' | 'balanced' | 'quality';

export const STRATEGY_CONFIG: Record<StrategyLevel, { name: string, description: string, color: string }> = {
  cost: {
    name: "Minimize Cost",
    description: "Prioritizes the cheapest model that meets the minimum reasoning requirements for each task.",
    color: "bg-emerald-500"
  },
  balanced: {
    name: "Balanced",
    description: "Balances cost and intelligence. Uses high-performance models for complex work and lean models for basic tasks.",
    color: "bg-amber-500"
  },
  quality: {
    name: "Max Quality",
    description: "Uses the most powerful models available for every task, regardless of cost.",
    color: "bg-rose-500"
  }
};
