/**
 * Scope — Claude Code UserPromptSubmit hook.
 *
 * Reads Claude Code's hook JSON on stdin, loads .claude/scope.json from the
 * target project's cwd, runs the Scope pipeline, and emits guidance as
 * additionalContext (non-blocking) — or blocks with a reason if the project
 * config opts in to strict mode.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  collectIntake,
  resolvePosture,
  assessRisk,
  detectDrift,
  generateGuidance,
  type RawIntake,
} from '../src/lib/scope';

interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: 'UserPromptSubmit';
  prompt: string;
}

interface ScopeProjectConfig extends RawIntake {
  // When true, a severe drift or high-risk cheap-posture turn is blocked
  // entirely. When false (default), guidance is injected as context only.
  blockOnSevere?: boolean;
}

async function main(): Promise<void> {
  const raw = await readStdin();
  const input: HookInput = JSON.parse(raw);

  const config = loadProjectConfig(input.cwd);
  if (!config) {
    // No Scope config in this project — stay silent, let Claude Code proceed.
    process.exit(0);
  }

  const session = collectIntake(config);
  resolvePosture(session); // runs validation; profile unused here
  const promptCtx = { promptText: input.prompt };
  const risk = assessRisk(session, promptCtx);
  const drift = detectDrift(session, promptCtx);
  const guidance = generateGuidance(session, risk, drift);

  const shouldBlock = Boolean(config.blockOnSevere) && guidance.shouldAskForConfirmation;

  if (shouldBlock) {
    const reason = [
      `[Scope] ${guidance.message}`,
      ...guidance.actions.map(a => `  • ${a}`),
    ].join('\n');
    emit({ decision: 'block', reason });
    return;
  }

  emit({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: buildContext(session.budgetPosture, risk, drift, guidance),
    },
  });
}

function buildContext(
  posture: string,
  risk: ReturnType<typeof assessRisk>,
  drift: ReturnType<typeof detectDrift>,
  guidance: ReturnType<typeof generateGuidance>,
): string {
  const lines: string[] = [];
  lines.push(`[Scope / posture=${posture}] ${guidance.message}`);
  lines.push(
    `  risk: overall=${risk.overallRisk}, context=${risk.contextRisk}, iteration=${risk.iterationRisk}, branching=${risk.branchingRisk}, rewrite=${risk.rewriteRisk}`,
  );
  if (drift.level !== 'none') {
    lines.push(
      `  drift: ${drift.level} (declared=${drift.declaredTaskType}, inferred=${drift.inferredTaskType})`,
    );
  }
  if (guidance.actions.length) {
    lines.push('  actions:');
    guidance.actions.forEach(a => lines.push(`    • ${a}`));
  }
  return lines.join('\n');
}

function loadProjectConfig(cwd: string): ScopeProjectConfig | null {
  const path = join(cwd, '.claude', 'scope.json');
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as ScopeProjectConfig;
  } catch {
    return null;
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function emit(payload: unknown): void {
  process.stdout.write(JSON.stringify(payload));
  process.exit(0);
}

main().catch(err => {
  // Non-blocking error — surface to transcript but let the prompt proceed.
  process.stderr.write(`[Scope] hook error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
