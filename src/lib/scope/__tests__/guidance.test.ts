import { describe, it, expect } from 'vitest';
import { generateGuidance } from '../guidance/generate';
import type { DriftReport, RiskAssessment, SessionInput } from '../types';

const session: SessionInput = {
  projectGoal: 'x',
  taskType: 'feature',
  explorationLevel: 'medium',
  budgetPosture: 'balanced',
  workMode: 'solo',
};

function risk(overrides: Partial<RiskAssessment> = {}): RiskAssessment {
  return {
    overallRisk: 'low',
    contextRisk: 'low',
    iterationRisk: 'low',
    branchingRisk: 'low',
    rewriteRisk: 'low',
    reasons: [],
    recommendations: [],
    ...overrides,
  };
}

describe('generateGuidance', () => {
  it('low risk → proceed, no flags', () => {
    const g = generateGuidance(session, risk());
    expect(g.shouldCheckpoint).toBe(false);
    expect(g.shouldSplitTask).toBe(false);
    expect(g.shouldAskForConfirmation).toBe(false);
    expect(g.message).toMatch(/low risk/i);
  });

  it('high branchingRisk triggers split', () => {
    const g = generateGuidance(session, risk({ branchingRisk: 'high', overallRisk: 'high' }));
    expect(g.shouldSplitTask).toBe(true);
    expect(g.actions.some(a => /split/i.test(a))).toBe(true);
  });

  it('high contextRisk triggers checkpoint', () => {
    const g = generateGuidance(session, risk({ contextRisk: 'high', overallRisk: 'high' }));
    expect(g.shouldCheckpoint).toBe(true);
  });

  it('cheap posture adds cheap-model action', () => {
    const g = generateGuidance({ ...session, budgetPosture: 'cheap' }, risk());
    expect(g.actions.some(a => /cheapest/i.test(a))).toBe(true);
  });

  it('deep posture never asks for confirmation', () => {
    const g = generateGuidance({ ...session, budgetPosture: 'deep' }, risk({ overallRisk: 'high', branchingRisk: 'high' }));
    expect(g.shouldAskForConfirmation).toBe(false);
  });

  it('balanced + overall high asks for confirmation', () => {
    const g = generateGuidance(session, risk({ overallRisk: 'high', rewriteRisk: 'high' }));
    expect(g.shouldAskForConfirmation).toBe(true);
  });

  it('severe drift forces confirmation even on low risk, even under deep posture', () => {
    const drift: DriftReport = {
      level: 'severe',
      declaredTaskType: 'feature',
      inferredTaskType: 'refactor',
      signals: ['x'],
      recommendation: 'Update intake.',
    };
    const g = generateGuidance({ ...session, budgetPosture: 'deep' }, risk(), drift);
    expect(g.shouldAskForConfirmation).toBe(true);
    expect(g.message).toMatch(/drift/i);
    expect(g.actions.some(a => /drift/i.test(a))).toBe(true);
  });

  it('mild drift does not force confirmation', () => {
    const drift: DriftReport = {
      level: 'mild',
      declaredTaskType: 'feature',
      inferredTaskType: 'refactor',
      signals: ['x'],
      recommendation: 'Confirm scope.',
    };
    const g = generateGuidance(session, risk(), drift);
    expect(g.shouldAskForConfirmation).toBe(false);
  });
});
