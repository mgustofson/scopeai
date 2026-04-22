/**
 * Scenario 4 — full pipeline: intake → posture → risk → guidance → brief → checkpoint.
 * Demonstrates how the modules compose into a single turn of Scope's work.
 */
import {
  collectIntake,
  resolvePosture,
  assessRisk,
  generateGuidance,
  composeBrief,
  renderBriefMarkdown,
  checkpointPrompts,
  shouldTriggerCheckpoint,
  detectDrift,
} from '../src/lib/scope';

const session = collectIntake({
  projectGoal: 'Ship a billing-aware AI coding assistant',
  taskType: 'feature',
  explorationLevel: 'medium',
  budgetPosture: 'balanced',
  workMode: 'solo',
});

const profile = resolvePosture(session);
const brief = composeBrief(session, profile);

const risk = assessRisk(session, {
  promptText: "Refactor the pricing module and also rewrite the webhook handler from scratch",
  attachedPaths: ['src/pricing/index.ts', 'src/webhooks/handler.ts', 'src/billing/stripe.ts'],
  turnsSinceLastCheckpoint: 8,
  filesTouchedCount: 6,
});

const drift = detectDrift(session, {
  promptText: "Refactor the pricing module and also rewrite the webhook handler from scratch",
});
const guidance = generateGuidance(session, risk, drift);
const trigger = shouldTriggerCheckpoint(
  session,
  { turnsSinceLastCheckpoint: 8, filesTouchedCount: 6 },
  guidance.shouldCheckpoint,
);

console.log('— BRIEF (markdown) —\n');
console.log(renderBriefMarkdown(brief));
console.log('— RISK —');
console.log(risk);
console.log('\n— DRIFT —');
console.log(drift);
console.log('\n— GUIDANCE —');
console.log(guidance);
console.log('\n— CHECKPOINT TRIGGER —');
console.log(trigger);
if (trigger.shouldCheckpoint) {
  console.log('\n— CHECKPOINT PROMPTS —');
  console.log(checkpointPrompts(session));
}
