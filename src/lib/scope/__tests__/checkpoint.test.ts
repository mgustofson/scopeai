import { describe, it, expect } from 'vitest';
import { checkpointPrompts, shouldTriggerCheckpoint } from '../checkpoint/prompts';
import type { SessionInput } from '../types';

const session: SessionInput = {
  projectGoal: 'Ship the thing',
  taskType: 'feature',
  explorationLevel: 'medium',
  budgetPosture: 'balanced',
  workMode: 'solo',
};

describe('checkpointPrompts', () => {
  it('returns all four prompt strings, non-empty', () => {
    const p = checkpointPrompts(session);
    expect(p.summarizeCurrentState.length).toBeGreaterThan(0);
    expect(p.compressContext.length).toBeGreaterThan(0);
    expect(p.restatePlan.length).toBeGreaterThan(0);
    expect(p.suggestNextStep.length).toBeGreaterThan(0);
  });

  it('weaves goal and posture into summarize prompt', () => {
    const p = checkpointPrompts(session);
    expect(p.summarizeCurrentState).toContain('Ship the thing');
    expect(p.suggestNextStep).toContain('balanced');
    expect(p.suggestNextStep).toContain('feature');
  });
});

describe('shouldTriggerCheckpoint', () => {
  it('returns false when under all thresholds', () => {
    const t = shouldTriggerCheckpoint(session, { turnsSinceLastCheckpoint: 2, filesTouchedCount: 1 });
    expect(t.shouldCheckpoint).toBe(false);
    expect(t.triggeredBy).toHaveLength(0);
  });

  it('triggers on turn threshold', () => {
    const t = shouldTriggerCheckpoint(session, { turnsSinceLastCheckpoint: 25, filesTouchedCount: 1 });
    expect(t.shouldCheckpoint).toBe(true);
    expect(t.triggeredBy).toContain('turns');
  });

  it('triggers on file threshold', () => {
    const t = shouldTriggerCheckpoint(session, { turnsSinceLastCheckpoint: 1, filesTouchedCount: 15 });
    expect(t.shouldCheckpoint).toBe(true);
    expect(t.triggeredBy).toContain('files');
  });

  it('respects posture-specific thresholds (cheap is stricter than deep)', () => {
    const ctx = { turnsSinceLastCheckpoint: 12, filesTouchedCount: 0 };
    expect(shouldTriggerCheckpoint({ ...session, budgetPosture: 'cheap' }, ctx).shouldCheckpoint).toBe(true);
    expect(shouldTriggerCheckpoint({ ...session, budgetPosture: 'deep' }, ctx).shouldCheckpoint).toBe(false);
  });

  it('propagates a guidance-driven trigger', () => {
    const t = shouldTriggerCheckpoint(session, { turnsSinceLastCheckpoint: 0, filesTouchedCount: 0 }, true);
    expect(t.shouldCheckpoint).toBe(true);
    expect(t.triggeredBy).toContain('guidance');
  });
});
