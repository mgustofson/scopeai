import { describe, it, expect } from 'vitest';
import { detectDrift } from '../drift/detect';
import type { PromptContext, SessionInput } from '../types';

const base: SessionInput = {
  projectGoal: 'x',
  taskType: 'feature',
  explorationLevel: 'medium',
  budgetPosture: 'balanced',
  workMode: 'solo',
};

const prompt = (t: string): PromptContext => ({ promptText: t });

describe('detectDrift', () => {
  it('reports none when declared matches inferred', () => {
    const d = detectDrift(base, prompt('Implement a new endpoint with acceptance criteria'));
    expect(d.level).toBe('none');
    expect(d.inferredTaskType).toBe('feature');
  });

  it('reports none when nothing matches any signature', () => {
    const d = detectDrift(base, prompt('Add logging to parseConfig'));
    expect(d.level).toBe('none');
    expect(d.inferredTaskType).toBeNull();
  });

  it('flags severe drift: feature declared, refactor inferred with multiple hits', () => {
    const d = detectDrift(
      base,
      prompt('Refactor the whole module and rewrite the data layer from scratch'),
    );
    expect(d.level).toBe('severe');
    expect(d.inferredTaskType).toBe('refactor');
    expect(d.recommendation).toMatch(/Update intake/);
  });

  it('flags mild drift with a single weak hit', () => {
    const d = detectDrift(base, prompt('We should migrate this over'));
    expect(d.level).toBe('mild');
    expect(d.inferredTaskType).toBe('refactor');
  });

  it('flags severe drift: debug declared, research inferred', () => {
    const d = detectDrift(
      { ...base, taskType: 'debug' },
      prompt('Investigate and compare three approaches, evaluate tradeoffs'),
    );
    expect(d.level).toBe('severe');
    expect(d.inferredTaskType).toBe('research');
  });

  it('stays quiet on benign non-pairs', () => {
    // prototype declared, debug inferred: not in SEVERE_PAIRS → mild, not severe
    const d = detectDrift(
      { ...base, taskType: 'prototype' },
      prompt('There is a bug and the thing is broken with a stack trace'),
    );
    expect(d.level).toBe('mild');
    expect(d.inferredTaskType).toBe('debug');
  });
});
