import { describe, it, expect } from 'vitest';
import { composeBrief, renderBriefMarkdown } from '../brief/compose';
import { resolvePosture } from '../posture/resolve';
import type { SessionInput } from '../types';

const session: SessionInput = {
  projectGoal: 'Build a CLI tool',
  taskType: 'refactor',
  explorationLevel: 'high',
  budgetPosture: 'balanced',
  workMode: 'solo',
};

describe('composeBrief', () => {
  it('captures goal, posture, and profile', () => {
    const b = composeBrief(session, resolvePosture(session));
    expect(b.goal).toBe('Build a CLI tool');
    expect(b.posture).toBe('balanced');
    expect(b.profile.summary).toMatch(/balanced/);
  });

  it('caps keyRisks at 3', () => {
    const b = composeBrief(session, resolvePosture(session));
    expect(b.keyRisks.length).toBeLessThanOrEqual(3);
  });

  it('produces a task-specific next step', () => {
    const refactor = composeBrief(session, resolvePosture(session));
    expect(refactor.nextStepGuidance).toMatch(/plan|bullets/i);

    const debugInput: SessionInput = { ...session, taskType: 'debug' };
    const debugBrief = composeBrief(debugInput, resolvePosture(debugInput));
    expect(debugBrief.nextStepGuidance).toMatch(/reproduce/i);
  });

  it('renders a readable markdown brief', () => {
    const md = renderBriefMarkdown(composeBrief(session, resolvePosture(session)));
    expect(md).toContain('# Scope session brief');
    expect(md).toContain('Build a CLI tool');
    expect(md).toContain('## Working rules');
    expect(md).toContain('## Stop conditions');
  });
});
