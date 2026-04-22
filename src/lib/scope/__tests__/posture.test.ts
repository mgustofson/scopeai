import { describe, it, expect } from 'vitest';
import { resolvePosture, getPostureConfig } from '../posture/resolve';
import type { SessionInput } from '../types';

const base: SessionInput = {
  projectGoal: 'Ship an MVP',
  taskType: 'feature',
  explorationLevel: 'medium',
  budgetPosture: 'balanced',
  workMode: 'solo',
};

describe('resolvePosture', () => {
  it('returns summary + working rules + stop conditions', () => {
    const p = resolvePosture(base);
    expect(p.summary).toMatch(/balanced/);
    expect(p.workingRules.length).toBeGreaterThan(0);
    expect(p.stopConditions.length).toBe(3);
  });

  it('adds cheap-posture working rules', () => {
    const p = resolvePosture({ ...base, budgetPosture: 'cheap' });
    expect(p.workingRules.some(r => /cheapest capable/i.test(r))).toBe(true);
    expect(p.workingRules.some(r => /edit in place/i.test(r))).toBe(true);
  });

  it('tightens stop conditions under cheap', () => {
    const cheap = resolvePosture({ ...base, budgetPosture: 'cheap' });
    const deep = resolvePosture({ ...base, budgetPosture: 'deep' });
    const cheapTurns = Number(cheap.stopConditions[0].match(/(\d+) turns/)?.[1]);
    const deepTurns = Number(deep.stopConditions[0].match(/(\d+) turns/)?.[1]);
    expect(cheapTurns).toBeLessThan(deepTurns);
  });

  it('flags cost drivers for high exploration + research', () => {
    const p = resolvePosture({ ...base, explorationLevel: 'high', taskType: 'research' });
    expect(p.likelyCostDrivers.some(d => /exploration/i.test(d))).toBe(true);
    expect(p.likelyCostDrivers.some(d => /research/i.test(d))).toBe(true);
  });

  it('exposes config for downstream modules', () => {
    expect(getPostureConfig({ ...base, budgetPosture: 'cheap' }).warningAggressiveness).toBe('high');
    expect(getPostureConfig({ ...base, budgetPosture: 'deep' }).askConfirmationOnHighRisk).toBe(false);
  });
});
