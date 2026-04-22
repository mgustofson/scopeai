import type { BudgetPosture } from '../types';

export interface PostureConfig {
  warningAggressiveness: 'low' | 'medium' | 'high';
  maxTurnsBeforeCheckpoint: number;
  maxFilesBeforeFork: number;
  askConfirmationOnHighRisk: boolean;
  preferCheapModels: boolean;
}

export const POSTURE_CONFIG: Record<BudgetPosture, PostureConfig> = {
  cheap:    { warningAggressiveness: 'high',   maxTurnsBeforeCheckpoint: 10, maxFilesBeforeFork: 5,  askConfirmationOnHighRisk: true,  preferCheapModels: true  },
  balanced: { warningAggressiveness: 'medium', maxTurnsBeforeCheckpoint: 20, maxFilesBeforeFork: 10, askConfirmationOnHighRisk: true,  preferCheapModels: false },
  deep:     { warningAggressiveness: 'low',    maxTurnsBeforeCheckpoint: 35, maxFilesBeforeFork: 20, askConfirmationOnHighRisk: false, preferCheapModels: false },
};

// Keyword signals used by the risk module. Kept simple & editable on purpose —
// swap for an embedding/LLM scorer behind the same interface later.
export const BREADTH_KEYWORDS = [
  'refactor', 'rewrite', 'migrate', 'redesign', 'overhaul',
  'entire', 'whole codebase', 'all files', 'everywhere', 'across the',
];

export const ITERATION_KEYWORDS = [
  'somehow', 'figure out', 'explore', 'play with', 'try different',
  'experiment', 'not sure', 'maybe', 'look into',
];

export const BRANCH_KEYWORDS = [
  'also', "while you're at it", 'additionally', 'and also',
  'by the way', 'bonus', 'on top of that',
];

export const REWRITE_KEYWORDS = [
  'rewrite', 'from scratch', 'redo', 'start over', 'replace the',
  'throw out', 'greenfield',
];
