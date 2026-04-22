import type { SessionInput, BudgetPosture, ExplorationLevel, TaskType, WorkMode } from '../types';

const TASK_TYPES: readonly TaskType[] = ['prototype', 'feature', 'refactor', 'debug', 'research'];
const EXPLORATION: readonly ExplorationLevel[] = ['low', 'medium', 'high'];
const POSTURES: readonly BudgetPosture[] = ['cheap', 'balanced', 'deep'];
const WORK_MODES: readonly WorkMode[] = ['solo', 'multi-agent', 'unknown'];

export class IntakeError extends Error {
  constructor(public readonly field: string, message: string) {
    super(`[intake] ${field}: ${message}`);
    this.name = 'IntakeError';
  }
}

export interface RawIntake {
  projectGoal?: unknown;
  taskType?: unknown;
  explorationLevel?: unknown;
  budgetPosture?: unknown;
  workMode?: unknown;
}

function normalizeString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim().toLowerCase();
  return trimmed.length ? trimmed : undefined;
}

function pick<T extends string>(raw: unknown, allowed: readonly T[], field: string, fallback?: T): T {
  const s = normalizeString(raw);
  if (s && (allowed as readonly string[]).includes(s)) return s as T;
  if (s === undefined && fallback !== undefined) return fallback;
  if (s === undefined) throw new IntakeError(field, 'required');
  throw new IntakeError(field, `must be one of ${allowed.join(', ')} (got "${s}")`);
}

export function collectIntake(raw: RawIntake): SessionInput {
  const goal = typeof raw.projectGoal === 'string' ? raw.projectGoal.trim() : '';
  if (!goal) throw new IntakeError('projectGoal', 'required and must be non-empty');

  return {
    projectGoal: goal,
    taskType: pick(raw.taskType, TASK_TYPES, 'taskType', 'prototype'),
    explorationLevel: pick(raw.explorationLevel, EXPLORATION, 'explorationLevel', 'medium'),
    budgetPosture: pick(raw.budgetPosture, POSTURES, 'budgetPosture', 'balanced'),
    workMode: pick(raw.workMode, WORK_MODES, 'workMode', 'unknown'),
  };
}
