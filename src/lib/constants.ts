export const MODELS = {
  "claude-3-haiku": {
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    input_cost_per_mk: 0.25,
    output_cost_per_mk: 1.25,
    description: "Fast and light, recommended for simple refactoring and data extraction."
  },
  "claude-3-sonnet": {
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    input_cost_per_mk: 3.00,
    output_cost_per_mk: 15.00,
    description: "Balanced model, good for standard generation workflows."
  },
  "claude-3-opus": {
    name: "Claude 3 Opus",
    provider: "Anthropic",
    input_cost_per_mk: 15.00,
    output_cost_per_mk: 75.00,
    description: "Powerful, use for complex architectural logic and first-draft reasoning."
  },
  "claude-3-5-sonnet": {
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    input_cost_per_mk: 3.00,
    output_cost_per_mk: 15.00,
    description: "State-of-the-art coding and reasoning."
  }
} as const;

export type ModelId = keyof typeof MODELS;

export const TASK_COMPLEXITY = {
  simple: {
    baseInputTokens: 1500,
    baseOutputTokens: 500,
    description: "Minor modifications, single-file scripts, basic UI components."
  },
  medium: {
    baseInputTokens: 5000,
    baseOutputTokens: 2000,
    description: "Multi-file features, standard API endpoints, context-aware bug fixes."
  },
  complex: {
    baseInputTokens: 15000,
    baseOutputTokens: 4000,
    description: "Architectural changes, full frameworks, complex multi-step pipelines requiring extensive context."
  }
} as const;

export type ComplexityLevel = keyof typeof TASK_COMPLEXITY;

export const TIER_MULTIPLIERS = {
  lean: {
    retries: 1.1,
    contextPumping: 1.0,
    defaultModel: "claude-3-haiku" as ModelId
  },
  standard: {
    retries: 1.5,
    contextPumping: 1.5,
    defaultModel: "claude-3-5-sonnet" as ModelId
  },
  premium: {
    retries: 2.5,
    contextPumping: 3.0,
    defaultModel: "claude-3-opus" as ModelId
  }
} as const;

export type TierLevel = keyof typeof TIER_MULTIPLIERS;
