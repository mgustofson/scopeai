import type { PromptContext, RiskAssessment, RiskLevel, SessionInput } from '../types';
import {
  BRANCH_KEYWORDS,
  BREADTH_KEYWORDS,
  ITERATION_KEYWORDS,
  POSTURE_CONFIG,
  REWRITE_KEYWORDS,
} from '../shared/constants';

function hits(text: string, words: readonly string[]): string[] {
  const t = text.toLowerCase();
  return words.filter(w => t.includes(w));
}

function fromScore(score: number): RiskLevel {
  if (score >= 2) return 'high';
  if (score >= 1) return 'medium';
  return 'low';
}

function rank(level: RiskLevel): number {
  return level === 'high' ? 2 : level === 'medium' ? 1 : 0;
}

export function assessRisk(session: SessionInput, prompt: PromptContext): RiskAssessment {
  const text = prompt.promptText ?? '';
  const reasons: string[] = [];
  const recommendations: string[] = [];

  // Context — how much material are we pulling in?
  const attached = prompt.attachedPaths?.length ?? 0;
  const touched = prompt.filesTouchedCount ?? 0;
  let contextScore = 0;
  if (attached >= 10) contextScore += 2;
  else if (attached >= 5) contextScore += 1;
  if (touched >= 10) contextScore += 1;
  const contextRisk = fromScore(contextScore);
  if (contextRisk !== 'low') {
    reasons.push(`Heavy context: ${attached} attached path(s), ${touched} file(s) already touched`);
    recommendations.push("Narrow attached context to only the files you'll change");
  }

  // Iteration — is this prompt exploratory/underspecified?
  const iterHits = hits(text, ITERATION_KEYWORDS);
  let iterScore = iterHits.length;
  if (session.explorationLevel === 'high') iterScore += 1;
  const iterationRisk = fromScore(iterScore);
  if (iterationRisk !== 'low') {
    reasons.push(
      iterHits.length
        ? `Exploratory language: ${iterHits.join(', ')}`
        : 'Session marked as high-exploration',
    );
    recommendations.push('Commit to one concrete deliverable for this turn');
  }

  // Branching — side-quests + broad-scope keywords (the two ways work fans out).
  const branchHits = hits(text, BRANCH_KEYWORDS);
  const breadthHits = hits(text, BREADTH_KEYWORDS);
  const branchScore = branchHits.length + breadthHits.length;
  const branchingRisk = fromScore(branchScore);
  if (branchingRisk !== 'low') {
    if (branchHits.length) reasons.push(`Side-quest language: ${branchHits.join(', ')}`);
    if (breadthHits.length) reasons.push(`Broad-scope language: ${breadthHits.join(', ')}`);
    recommendations.push('Drop side-quests; scope to one module first');
  }

  // Rewrite — full-replacement energy.
  const rewriteHits = hits(text, REWRITE_KEYWORDS);
  const rewriteRisk = fromScore(rewriteHits.length);
  if (rewriteRisk !== 'low') {
    reasons.push(`Rewrite language: ${rewriteHits.join(', ')}`);
    recommendations.push('Prefer incremental edits; keep diffs reviewable');
  }

  // Overall — worst dimension, bumped for cheap posture aggressiveness.
  const cfg = POSTURE_CONFIG[session.budgetPosture];
  const aggressivenessBump = cfg.warningAggressiveness === 'high' ? 1 : 0;
  const combinedRank = Math.min(
    2,
    Math.max(rank(contextRisk), rank(iterationRisk), rank(branchingRisk), rank(rewriteRisk)) + aggressivenessBump,
  );
  const overallRisk: RiskLevel = combinedRank >= 2 ? 'high' : combinedRank >= 1 ? 'medium' : 'low';

  return {
    overallRisk,
    contextRisk,
    iterationRisk,
    branchingRisk,
    rewriteRisk,
    reasons,
    recommendations,
  };
}
