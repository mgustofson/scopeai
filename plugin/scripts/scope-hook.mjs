#!/usr/bin/env node
// Scope Claude Code plugin — UserPromptSubmit hook.
// Self-contained: no dependencies outside node built-ins.
// Canonical logic lives in ../../src/lib/scope (TypeScript, tested).
// If you edit this file, keep behavior in sync with the TS library.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// ─── Constants ──────────────────────────────────────────────────────────────

const TASK_TYPES = ['prototype', 'feature', 'refactor', 'debug', 'research'];
const EXPLORATION = ['low', 'medium', 'high'];
const POSTURES = ['cheap', 'balanced', 'deep'];
const WORK_MODES = ['solo', 'multi-agent', 'unknown'];

const POSTURE_CONFIG = {
  cheap:    { warningAggressiveness: 'high',   maxTurnsBeforeCheckpoint: 10, maxFilesBeforeFork: 5,  askConfirmationOnHighRisk: true,  preferCheapModels: true  },
  balanced: { warningAggressiveness: 'medium', maxTurnsBeforeCheckpoint: 20, maxFilesBeforeFork: 10, askConfirmationOnHighRisk: true,  preferCheapModels: false },
  deep:     { warningAggressiveness: 'low',    maxTurnsBeforeCheckpoint: 35, maxFilesBeforeFork: 20, askConfirmationOnHighRisk: false, preferCheapModels: false },
};

const BREADTH_KEYWORDS = ['refactor','rewrite','migrate','redesign','overhaul','entire','whole codebase','all files','everywhere','across the'];
const ITERATION_KEYWORDS = ['somehow','figure out','explore','play with','try different','experiment','not sure','maybe','look into'];
const BRANCH_KEYWORDS = ['also',"while you're at it",'additionally','and also','by the way','bonus','on top of that'];
const REWRITE_KEYWORDS = ['rewrite','from scratch','redo','start over','replace the','throw out','greenfield'];

const TASK_SIGNATURES = {
  prototype: ['prototype','sketch','hack together','quick and dirty','mvp'],
  feature:   ['add a feature','implement','build out','new endpoint','acceptance criteria'],
  refactor:  ['refactor','rewrite','migrate','redesign','overhaul','restructure'],
  debug:     ['bug','broken','reproduce','stack trace','error','not working','regression'],
  research:  ['investigate','compare','explore options','tradeoffs','benchmark','evaluate'],
};

const SEVERE_PAIRS = [
  ['feature','refactor'],
  ['prototype','refactor'],
  ['debug','refactor'],
  ['debug','research'],
  ['prototype','research'],
];

// ─── Intake ─────────────────────────────────────────────────────────────────

function pick(v, allowed, field, fallback) {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : undefined;
  if (s && allowed.includes(s)) return s;
  if (s === undefined && fallback !== undefined) return fallback;
  throw new Error(`[intake] ${field}: must be one of ${allowed.join(', ')}`);
}

function collectIntake(raw) {
  const goal = typeof raw.projectGoal === 'string' ? raw.projectGoal.trim() : '';
  if (!goal) throw new Error('[intake] projectGoal: required');
  return {
    projectGoal: goal,
    taskType: pick(raw.taskType, TASK_TYPES, 'taskType', 'prototype'),
    explorationLevel: pick(raw.explorationLevel, EXPLORATION, 'explorationLevel', 'medium'),
    budgetPosture: pick(raw.budgetPosture, POSTURES, 'budgetPosture', 'balanced'),
    workMode: pick(raw.workMode, WORK_MODES, 'workMode', 'unknown'),
  };
}

// ─── Risk ───────────────────────────────────────────────────────────────────

function hits(text, words) { const t = text.toLowerCase(); return words.filter(w => t.includes(w)); }
function fromScore(n) { return n >= 2 ? 'high' : n >= 1 ? 'medium' : 'low'; }
function rank(l)      { return l === 'high' ? 2 : l === 'medium' ? 1 : 0; }

function assessRisk(session, prompt) {
  const text = prompt.promptText ?? '';
  const reasons = [], recommendations = [];

  const attached = prompt.attachedPaths?.length ?? 0;
  const touched = prompt.filesTouchedCount ?? 0;
  let contextScore = 0;
  if (attached >= 10) contextScore += 2; else if (attached >= 5) contextScore += 1;
  if (touched >= 10) contextScore += 1;
  const contextRisk = fromScore(contextScore);
  if (contextRisk !== 'low') {
    reasons.push(`Heavy context: ${attached} attached, ${touched} touched`);
    recommendations.push("Narrow attached context to only the files you'll change");
  }

  const iterHits = hits(text, ITERATION_KEYWORDS);
  let iterScore = iterHits.length + (session.explorationLevel === 'high' ? 1 : 0);
  const iterationRisk = fromScore(iterScore);
  if (iterationRisk !== 'low') {
    reasons.push(iterHits.length ? `Exploratory language: ${iterHits.join(', ')}` : 'Session marked high-exploration');
    recommendations.push('Commit to one concrete deliverable for this turn');
  }

  const branchHits = hits(text, BRANCH_KEYWORDS);
  const breadthHits = hits(text, BREADTH_KEYWORDS);
  const branchingRisk = fromScore(branchHits.length + breadthHits.length);
  if (branchingRisk !== 'low') {
    if (branchHits.length)  reasons.push(`Side-quest language: ${branchHits.join(', ')}`);
    if (breadthHits.length) reasons.push(`Broad-scope language: ${breadthHits.join(', ')}`);
    recommendations.push('Drop side-quests; scope to one module first');
  }

  const rewriteHits = hits(text, REWRITE_KEYWORDS);
  const rewriteRisk = fromScore(rewriteHits.length);
  if (rewriteRisk !== 'low') {
    reasons.push(`Rewrite language: ${rewriteHits.join(', ')}`);
    recommendations.push('Prefer incremental edits; keep diffs reviewable');
  }

  const cfg = POSTURE_CONFIG[session.budgetPosture];
  const bump = cfg.warningAggressiveness === 'high' ? 1 : 0;
  const combined = Math.min(2, Math.max(rank(contextRisk), rank(iterationRisk), rank(branchingRisk), rank(rewriteRisk)) + bump);
  const overallRisk = combined >= 2 ? 'high' : combined >= 1 ? 'medium' : 'low';

  return { overallRisk, contextRisk, iterationRisk, branchingRisk, rewriteRisk, reasons, recommendations };
}

// ─── Drift ──────────────────────────────────────────────────────────────────

function inferTaskType(text) {
  let best = { type: null, hits: [] };
  for (const [type, sig] of Object.entries(TASK_SIGNATURES)) {
    const h = hits(text, sig);
    if (h.length > best.hits.length) best = { type, hits: h };
  }
  return best;
}

function detectDrift(session, prompt) {
  const inferred = inferTaskType(prompt.promptText ?? '');
  if (!inferred.type || inferred.type === session.taskType) {
    return { level: 'none', declaredTaskType: session.taskType, inferredTaskType: inferred.type, signals: [], recommendation: null };
  }
  const severe = SEVERE_PAIRS.some(([a,b]) =>
    (a === session.taskType && b === inferred.type) || (a === inferred.type && b === session.taskType)
  ) && inferred.hits.length >= 2;
  return {
    level: severe ? 'severe' : 'mild',
    declaredTaskType: session.taskType,
    inferredTaskType: inferred.type,
    signals: [`Prompt reads like a ${inferred.type} task (matched: ${inferred.hits.join(', ')}), declared ${session.taskType}`],
    recommendation: severe
      ? `Update intake to taskType="${inferred.type}" or narrow this turn back to ${session.taskType}-scope work.`
      : `Confirm whether this turn is still in-scope for a ${session.taskType} session.`,
  };
}

// ─── Guidance ───────────────────────────────────────────────────────────────

function generateGuidance(session, risk, drift) {
  const cfg = POSTURE_CONFIG[session.budgetPosture];
  const actions = [];
  const severeDrift = drift?.level === 'severe';

  const shouldSplitTask = risk.branchingRisk === 'high' || risk.rewriteRisk === 'high';
  const shouldCheckpoint = risk.contextRisk === 'high' || risk.iterationRisk === 'high';
  const shouldAskForConfirmation = severeDrift || (cfg.askConfirmationOnHighRisk && risk.overallRisk === 'high');

  if (severeDrift) actions.push(`Scope drift: prompt reads like ${drift.inferredTaskType} but declared ${drift.declaredTaskType}. ${drift.recommendation ?? ''}`.trim());
  if (shouldSplitTask) actions.push('Split this into 2-3 smaller steps before executing');
  if (shouldCheckpoint) actions.push('Summarize current progress and start a fresh, focused turn');
  if (risk.rewriteRisk !== 'low') actions.push('Avoid rewrites — edit in place');
  if (risk.contextRisk !== 'low') actions.push("Narrow attached context to what you're changing");
  if (risk.iterationRisk !== 'low') actions.push('State one concrete deliverable for this turn');
  if (risk.branchingRisk !== 'low') actions.push('Drop side-quests; queue them as follow-ups');
  if (shouldAskForConfirmation) actions.push('Ask the user to confirm scope before proceeding');
  if (cfg.preferCheapModels) actions.push('Use the cheapest capable model for this step');

  const message = severeDrift
    ? `Scope drift detected — confirm intent before continuing (${drift.declaredTaskType} → ${drift.inferredTaskType}).`
    : risk.overallRisk === 'high'   ? `High-risk turn under ${session.budgetPosture} posture — tighten scope before continuing.`
    : risk.overallRisk === 'medium' ? 'Moderate risk detected — apply the actions below before continuing.'
                                    : 'Low risk — proceed with standard working rules.';

  return { message, actions, shouldCheckpoint, shouldSplitTask, shouldAskForConfirmation };
}

// ─── Hook entrypoint ────────────────────────────────────────────────────────

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', c => (data += c));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function loadConfig(cwd) {
  try { return JSON.parse(readFileSync(join(cwd, '.claude', 'scope.json'), 'utf8')); }
  catch { return null; }
}

function emit(payload) {
  process.stdout.write(JSON.stringify(payload));
  process.exit(0);
}

function buildContext(session, risk, drift, guidance) {
  const lines = [`[Scope / posture=${session.budgetPosture}] ${guidance.message}`];
  lines.push(`  risk: overall=${risk.overallRisk}, context=${risk.contextRisk}, iteration=${risk.iterationRisk}, branching=${risk.branchingRisk}, rewrite=${risk.rewriteRisk}`);
  if (drift.level !== 'none') lines.push(`  drift: ${drift.level} (declared=${drift.declaredTaskType}, inferred=${drift.inferredTaskType})`);
  if (guidance.actions.length) { lines.push('  actions:'); guidance.actions.forEach(a => lines.push(`    • ${a}`)); }
  return lines.join('\n');
}

async function main() {
  const input = JSON.parse(await readStdin());
  const config = loadConfig(input.cwd);
  if (!config) process.exit(0); // No Scope config — silent passthrough.

  const session = collectIntake(config);
  const ctx = { promptText: input.prompt };
  const risk = assessRisk(session, ctx);
  const drift = detectDrift(session, ctx);
  const guidance = generateGuidance(session, risk, drift);

  const shouldBlock = Boolean(config.blockOnSevere) && guidance.shouldAskForConfirmation;
  if (shouldBlock) {
    emit({ decision: 'block', reason: [`[Scope] ${guidance.message}`, ...guidance.actions.map(a => `  • ${a}`)].join('\n') });
    return;
  }

  emit({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: buildContext(session, risk, drift, guidance),
    },
  });
}

main().catch(err => {
  process.stderr.write(`[Scope] hook error: ${err.message}\n`);
  process.exit(1);
});
