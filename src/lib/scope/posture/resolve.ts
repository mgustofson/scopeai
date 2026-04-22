import type { SessionInput, SessionProfile } from '../types';
import { POSTURE_CONFIG, type PostureConfig } from '../shared/constants';

export function resolvePosture(input: SessionInput): SessionProfile {
  const cfg = POSTURE_CONFIG[input.budgetPosture];
  return {
    summary: summarize(input),
    likelyCostDrivers: costDrivers(input),
    workingRules: workingRules(input, cfg),
    stopConditions: stopConditions(cfg),
  };
}

export function getPostureConfig(input: SessionInput): PostureConfig {
  return POSTURE_CONFIG[input.budgetPosture];
}

function summarize(input: SessionInput): string {
  return `${input.taskType} session under ${input.budgetPosture} posture, ${input.explorationLevel} exploration, ${input.workMode} mode.`;
}

function costDrivers(input: SessionInput): string[] {
  const drivers: string[] = [];
  if (input.explorationLevel === 'high') drivers.push('High exploration multiplies iteration cost');
  if (input.taskType === 'refactor') drivers.push('Refactors tend to fan out across files');
  if (input.taskType === 'research') drivers.push('Research prompts pull broad context');
  if (input.taskType === 'debug') drivers.push('Debug loops burn tokens on repeated context reloads');
  if (input.workMode === 'multi-agent') drivers.push('Multi-agent runs multiply tokens per step');
  if (drivers.length === 0) drivers.push('Typical iteration and context reload');
  return drivers;
}

function workingRules(input: SessionInput, cfg: PostureConfig): string[] {
  const rules: string[] = [];
  if (cfg.preferCheapModels) rules.push('Prefer the cheapest capable model for each step');
  if (input.budgetPosture === 'cheap') {
    rules.push('Avoid rewrites — edit in place');
    rules.push("Keep context to the files you're actively changing");
  }
  if (input.budgetPosture === 'balanced') {
    rules.push('Default model for most work; escalate only for architectural decisions');
  }
  if (input.budgetPosture === 'deep') {
    rules.push('Depth over speed — but still checkpoint at milestones');
  }
  if (input.taskType === 'debug') rules.push('Reproduce before fixing; no speculative rewrites');
  if (input.taskType === 'refactor') rules.push('Propose a 3-bullet plan before touching files');
  if (input.taskType === 'research') rules.push('Cap reading to 3 files per round before reporting back');
  return rules;
}

function stopConditions(cfg: PostureConfig): string[] {
  return [
    `Checkpoint after ${cfg.maxTurnsBeforeCheckpoint} turns without a summary`,
    `Fork into sub-sessions after touching ${cfg.maxFilesBeforeFork} files`,
    'Stop and reassess after two consecutive failed attempts',
  ];
}
