import type { DriftReport, PromptContext, SessionInput, TaskType } from '../types';

// Keyword signatures per task type. Deliberately narrow — the detector should
// only speak up when signals are strong; silence is better than noise.
const TASK_SIGNATURES: Record<TaskType, string[]> = {
  prototype: ['prototype', 'sketch', 'hack together', 'quick and dirty', 'mvp'],
  feature:   ['add a feature', 'implement', 'build out', 'new endpoint', 'acceptance criteria'],
  refactor:  ['refactor', 'rewrite', 'migrate', 'redesign', 'overhaul', 'restructure'],
  debug:     ['bug', 'broken', 'reproduce', 'stack trace', 'error', 'not working', 'regression'],
  research:  ['investigate', 'compare', 'explore options', 'tradeoffs', 'benchmark', 'evaluate'],
};

// Pairs that represent a meaningful mismatch. Listed explicitly so we don't
// flag benign overlaps (e.g. "feature" vs "refactor" is a real drift;
// "feature" vs "prototype" often isn't).
const SEVERE_PAIRS: Array<[TaskType, TaskType]> = [
  ['feature', 'refactor'],
  ['prototype', 'refactor'],
  ['debug', 'refactor'],
  ['debug', 'research'],
  ['prototype', 'research'],
];

function signatureHits(text: string, signature: string[]): string[] {
  const t = text.toLowerCase();
  return signature.filter(s => t.includes(s));
}

function inferTaskType(text: string): { type: TaskType | null; hits: string[] } {
  let best: { type: TaskType | null; hits: string[] } = { type: null, hits: [] };
  for (const [type, sig] of Object.entries(TASK_SIGNATURES) as [TaskType, string[]][]) {
    const h = signatureHits(text, sig);
    if (h.length > best.hits.length) best = { type, hits: h };
  }
  return best;
}

function isSeverePair(declared: TaskType, inferred: TaskType): boolean {
  return SEVERE_PAIRS.some(
    ([a, b]) => (a === declared && b === inferred) || (a === inferred && b === declared),
  );
}

export function detectDrift(session: SessionInput, prompt: PromptContext): DriftReport {
  const text = prompt.promptText ?? '';
  const inferred = inferTaskType(text);
  const signals: string[] = [];

  if (!inferred.type || inferred.type === session.taskType) {
    return {
      level: 'none',
      declaredTaskType: session.taskType,
      inferredTaskType: inferred.type,
      signals: [],
      recommendation: null,
    };
  }

  signals.push(
    `Prompt reads like a ${inferred.type} task (matched: ${inferred.hits.join(', ')}), but session declared ${session.taskType}`,
  );

  const severe = isSeverePair(session.taskType, inferred.type);
  const level: DriftReport['level'] = severe && inferred.hits.length >= 2 ? 'severe' : 'mild';

  const recommendation = severe
    ? `Update intake to taskType="${inferred.type}" or narrow this turn back to ${session.taskType}-scope work.`
    : `Confirm whether this turn is still in-scope for a ${session.taskType} session.`;

  return {
    level,
    declaredTaskType: session.taskType,
    inferredTaskType: inferred.type,
    signals,
    recommendation,
  };
}
