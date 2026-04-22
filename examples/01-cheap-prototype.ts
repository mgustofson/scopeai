/**
 * Scenario 1 — Solo builder, cheap posture, prototype.
 * A user wants to hack together a CLI over a weekend on a tight budget.
 * Expect: cheap-model rules, tight stop conditions, low risk on a focused prompt.
 */
import { collectIntake, resolvePosture, assessRisk } from '../src/lib/scope';

const session = collectIntake({
  projectGoal: 'Prototype a CLI that summarizes git diffs',
  taskType: 'prototype',
  explorationLevel: 'medium',
  budgetPosture: 'cheap',
  workMode: 'solo',
});

const profile = resolvePosture(session);
const risk = assessRisk(session, {
  promptText: 'Add a --json flag to the summary command',
  attachedPaths: ['src/cli.ts'],
});

console.log('SESSION', session);
console.log('PROFILE', profile);
console.log('RISK', risk);
