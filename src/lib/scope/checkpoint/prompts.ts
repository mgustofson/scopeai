import type { CheckpointPrompts, PromptContext, SessionInput } from '../types';
import { POSTURE_CONFIG } from '../shared/constants';

export function checkpointPrompts(input: SessionInput): CheckpointPrompts {
  return {
    summarizeCurrentState: `Summarize current work on "${input.projectGoal}": what is done, what is broken, what is still open. Be concise — aim for under 150 words.`,
    compressContext: `List only the files and facts that are load-bearing for the next step. Drop everything else from working memory.`,
    restatePlan: `Restate the plan in 3 bullets: (1) the immediate next step, (2) the success condition for that step, (3) what you will explicitly NOT do.`,
    suggestNextStep: `Given the ${input.budgetPosture} posture and a ${input.taskType} task, suggest the single next step as the smallest reversible change.`,
  };
}

export interface CheckpointTrigger {
  shouldCheckpoint: boolean;
  triggeredBy: Array<'turns' | 'files' | 'guidance'>;
  reason: string;
}

export function shouldTriggerCheckpoint(
  input: SessionInput,
  ctx: Pick<PromptContext, 'turnsSinceLastCheckpoint' | 'filesTouchedCount'>,
  guidanceSuggestsCheckpoint = false,
): CheckpointTrigger {
  const cfg = POSTURE_CONFIG[input.budgetPosture];
  const triggers: CheckpointTrigger['triggeredBy'] = [];

  if ((ctx.turnsSinceLastCheckpoint ?? 0) >= cfg.maxTurnsBeforeCheckpoint) triggers.push('turns');
  if ((ctx.filesTouchedCount ?? 0) >= cfg.maxFilesBeforeFork) triggers.push('files');
  if (guidanceSuggestsCheckpoint) triggers.push('guidance');

  if (triggers.length === 0) {
    return { shouldCheckpoint: false, triggeredBy: [], reason: 'Within all thresholds' };
  }

  const parts: string[] = [];
  if (triggers.includes('turns')) parts.push(`${ctx.turnsSinceLastCheckpoint} turns since last checkpoint (limit ${cfg.maxTurnsBeforeCheckpoint})`);
  if (triggers.includes('files')) parts.push(`${ctx.filesTouchedCount} files touched (limit ${cfg.maxFilesBeforeFork})`);
  if (triggers.includes('guidance')) parts.push('risk-based guidance recommended a checkpoint');

  return { shouldCheckpoint: true, triggeredBy: triggers, reason: parts.join('; ') };
}
