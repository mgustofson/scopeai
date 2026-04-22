import { describe, it, expect } from 'vitest';
import { collectIntake, IntakeError } from '../intake/collect';

describe('collectIntake', () => {
  it('normalizes and fills defaults', () => {
    const out = collectIntake({ projectGoal: '  Build a CLI  ' });
    expect(out).toEqual({
      projectGoal: 'Build a CLI',
      taskType: 'prototype',
      explorationLevel: 'medium',
      budgetPosture: 'balanced',
      workMode: 'unknown',
    });
  });

  it('accepts mixed-case enums', () => {
    const out = collectIntake({
      projectGoal: 'x',
      taskType: 'Feature',
      explorationLevel: 'HIGH',
      budgetPosture: 'Cheap',
      workMode: 'Solo',
    });
    expect(out.taskType).toBe('feature');
    expect(out.explorationLevel).toBe('high');
    expect(out.budgetPosture).toBe('cheap');
    expect(out.workMode).toBe('solo');
  });

  it('rejects empty projectGoal', () => {
    expect(() => collectIntake({ projectGoal: '   ' })).toThrow(IntakeError);
    expect(() => collectIntake({})).toThrow(/projectGoal/);
  });

  it('rejects unknown enum values', () => {
    expect(() => collectIntake({ projectGoal: 'x', taskType: 'banana' })).toThrow(/taskType/);
    expect(() => collectIntake({ projectGoal: 'x', budgetPosture: 'yolo' })).toThrow(/budgetPosture/);
  });
});
