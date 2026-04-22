import type { SessionBrief, SessionInput, SessionProfile, TaskType } from '../types';

export function composeBrief(input: SessionInput, profile: SessionProfile): SessionBrief {
  return {
    goal: input.projectGoal,
    posture: input.budgetPosture,
    profile,
    keyRisks: profile.likelyCostDrivers.slice(0, 3),
    workingRules: profile.workingRules,
    stopConditions: profile.stopConditions,
    nextStepGuidance: firstStepFor(input.taskType),
  };
}

export function renderBriefMarkdown(brief: SessionBrief): string {
  const bullets = (items: string[]) => items.map(i => `- ${i}`).join('\n');
  return [
    `# Scope session brief`,
    ``,
    `**Goal:** ${brief.goal}`,
    `**Posture:** ${brief.posture}`,
    ``,
    `## Summary`,
    brief.profile.summary,
    ``,
    `## Key risks`,
    bullets(brief.keyRisks),
    ``,
    `## Working rules`,
    bullets(brief.workingRules),
    ``,
    `## Stop conditions`,
    bullets(brief.stopConditions),
    ``,
    `## Next step`,
    brief.nextStepGuidance,
    ``,
  ].join('\n');
}

function firstStepFor(taskType: TaskType): string {
  switch (taskType) {
    case 'prototype': return 'Sketch the smallest end-to-end happy path; skip polish and edge cases.';
    case 'feature':   return 'Write the acceptance criteria in 3 bullets, then touch one file at a time.';
    case 'refactor':  return 'Propose the refactor plan as 3-5 bullets; confirm before any edits.';
    case 'debug':     return 'Reproduce the bug in isolation before proposing a fix.';
    case 'research':  return 'State the question precisely; cap reading to 3 files before reporting back.';
  }
}
