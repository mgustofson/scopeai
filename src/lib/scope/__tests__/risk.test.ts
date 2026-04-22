import { describe, it, expect } from 'vitest';
import { assessRisk } from '../risk/assess';
import type { PromptContext, SessionInput } from '../types';

const session: SessionInput = {
  projectGoal: 'Ship an MVP',
  taskType: 'feature',
  explorationLevel: 'medium',
  budgetPosture: 'balanced',
  workMode: 'solo',
};

function prompt(partial: Partial<PromptContext>): PromptContext {
  return { promptText: '', ...partial };
}

describe('assessRisk', () => {
  it('rates a focused prompt as low risk', () => {
    const r = assessRisk(session, prompt({ promptText: 'Add a null check to parseConfig', attachedPaths: ['src/config.ts'] }));
    expect(r.overallRisk).toBe('low');
    expect(r.contextRisk).toBe('low');
    expect(r.rewriteRisk).toBe('low');
  });

  it('flags broad-scope language as branching risk', () => {
    const r = assessRisk(session, prompt({ promptText: 'Refactor the entire codebase to use a new auth flow' }));
    expect(r.branchingRisk).not.toBe('low');
    expect(r.reasons.some(s => /broad-scope/i.test(s))).toBe(true);
  });

  it('flags rewrite language as rewriteRisk', () => {
    const r = assessRisk(session, prompt({ promptText: 'Rewrite the parser from scratch' }));
    expect(r.rewriteRisk).not.toBe('low');
    expect(r.recommendations.some(s => /incremental/i.test(s))).toBe(true);
  });

  it('flags heavy attached context', () => {
    const r = assessRisk(session, prompt({ promptText: 'Clean this up', attachedPaths: Array(12).fill('x.ts') }));
    expect(r.contextRisk).toBe('high');
  });

  it('flags iteration when exploration is high even without keywords', () => {
    const r = assessRisk({ ...session, explorationLevel: 'high' }, prompt({ promptText: 'Add logging' }));
    expect(r.iterationRisk).not.toBe('low');
  });

  it('detects side-quest language', () => {
    const r = assessRisk(session, prompt({ promptText: "Fix the login bug. Also, while you're at it, refactor the router" }));
    expect(r.branchingRisk).not.toBe('low');
    expect(r.rewriteRisk === 'low' || r.branchingRisk !== 'low').toBe(true);
  });

  it('cheap posture bumps overall risk more aggressively', () => {
    const p = prompt({ promptText: 'Maybe explore a different approach' });
    const balanced = assessRisk(session, p).overallRisk;
    const cheap = assessRisk({ ...session, budgetPosture: 'cheap' }, p).overallRisk;
    const rankOf = (l: string) => (l === 'high' ? 2 : l === 'medium' ? 1 : 0);
    expect(rankOf(cheap)).toBeGreaterThanOrEqual(rankOf(balanced));
  });
});
