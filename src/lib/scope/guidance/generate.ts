import type { DriftReport, GuidanceOutput, RiskAssessment, SessionInput } from '../types';
import { POSTURE_CONFIG } from '../shared/constants';

export function generateGuidance(
  session: SessionInput,
  risk: RiskAssessment,
  drift?: DriftReport,
): GuidanceOutput {
  const cfg = POSTURE_CONFIG[session.budgetPosture];
  const actions: string[] = [];

  const severeDrift = drift?.level === 'severe';
  const shouldSplitTask = risk.branchingRisk === 'high' || risk.rewriteRisk === 'high';
  const shouldCheckpoint = risk.contextRisk === 'high' || risk.iterationRisk === 'high';
  const shouldAskForConfirmation =
    severeDrift || (cfg.askConfirmationOnHighRisk && risk.overallRisk === 'high');

  if (severeDrift && drift) {
    actions.push(
      `Scope drift: prompt reads like a ${drift.inferredTaskType} task but session declared ${drift.declaredTaskType}. ${drift.recommendation ?? ''}`.trim(),
    );
  }

  if (shouldSplitTask) actions.push('Split this into 2-3 smaller steps before executing');
  if (shouldCheckpoint) actions.push('Summarize current progress and start a fresh, focused turn');
  if (risk.rewriteRisk !== 'low') actions.push('Avoid rewrites — edit in place');
  if (risk.contextRisk !== 'low') actions.push("Narrow attached context to what you're changing");
  if (risk.iterationRisk !== 'low') actions.push('State one concrete deliverable for this turn');
  if (risk.branchingRisk !== 'low') actions.push('Drop side-quests; queue them as follow-ups');
  if (shouldAskForConfirmation) actions.push('Ask the user to confirm scope before proceeding');
  if (cfg.preferCheapModels) actions.push('Use the cheapest capable model for this step');

  const message = severeDrift
    ? `Scope drift detected — confirm intent before continuing (${drift!.declaredTaskType} → ${drift!.inferredTaskType}).`
    : risk.overallRisk === 'high'
      ? `High-risk turn under ${session.budgetPosture} posture — tighten scope before continuing.`
      : risk.overallRisk === 'medium'
        ? 'Moderate risk detected — apply the actions below before continuing.'
        : 'Low risk — proceed with standard working rules.';

  return { message, actions, shouldCheckpoint, shouldSplitTask, shouldAskForConfirmation };
}
