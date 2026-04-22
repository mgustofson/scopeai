/**
 * Scenario 2 — Balanced posture, refactor task, runaway prompt.
 * User pastes a "refactor the whole thing and also migrate auth" prompt with 12 files attached.
 * Expect: high branching risk, high context risk, recommendations to narrow scope.
 */
import { collectIntake, resolvePosture, assessRisk } from '../src/lib/scope';

const session = collectIntake({
  projectGoal: 'Modernize the internal dashboard',
  taskType: 'refactor',
  explorationLevel: 'high',
  budgetPosture: 'balanced',
  workMode: 'solo',
});

const profile = resolvePosture(session);
const risk = assessRisk(session, {
  promptText:
    "Refactor the entire dashboard to use server actions. Also, while you're at it, migrate the auth layer and rewrite the data fetching from scratch.",
  attachedPaths: Array.from({ length: 12 }, (_, i) => `src/app/route-${i}.tsx`),
  filesTouchedCount: 14,
});

console.log('SESSION', session);
console.log('PROFILE', profile);
console.log('RISK', risk);
