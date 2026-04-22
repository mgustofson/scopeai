# Scope Claude Code hook

A `UserPromptSubmit` hook that runs every prompt through the Scope pipeline
and injects guidance into the turn (or blocks it if you opt in to strict mode).

## Setup (in the project you want to test against)

1. **Drop a config** at `.claude/scope.json`. Minimum:

   ```json
   {
     "projectGoal": "Ship the billing rewrite",
     "taskType": "feature",
     "explorationLevel": "medium",
     "budgetPosture": "balanced",
     "workMode": "solo",
     "blockOnSevere": false
   }
   ```

   `taskType`, `explorationLevel`, `budgetPosture`, and `workMode` have safe
   defaults — only `projectGoal` is required.

   Set `"blockOnSevere": true` if you want Scope to reject prompts that
   trigger `shouldAskForConfirmation` (severe drift, or high-risk cheap-posture
   turns). Default is non-blocking: guidance is injected as context.

2. **Register the hook** in the same project's `.claude/settings.json` (or
   `.claude/settings.local.json` if you don't want to commit it):

   ```json
   {
     "hooks": {
       "UserPromptSubmit": [
         {
           "type": "command",
           "command": "npx --yes tsx /ABS/PATH/TO/scope/bin/scope-hook.ts",
           "timeout": 15,
           "statusMessage": "Scope checking..."
         }
       ]
     }
   }
   ```

   Replace `/ABS/PATH/TO/scope` with the absolute path to this repo. The
   first run will download `tsx`; subsequent runs are cached.

## Smoke test without Claude Code

From this repo:

```sh
echo '{"session_id":"x","transcript_path":"/tmp/t","cwd":"'"$PWD"'","permission_mode":"default","hook_event_name":"UserPromptSubmit","prompt":"Refactor the whole thing from scratch"}' \
  | npx tsx bin/scope-hook.ts
```

You should see a JSON object with `hookSpecificOutput.additionalContext`
containing the Scope guidance. If you want to test blocking, copy
`bin/scope.example.json` to `.claude/scope.json` with `blockOnSevere: true`
and rerun.

## What the model sees

On every prompt, Claude Code receives an extra context line like:

```
[Scope / posture=balanced] Scope drift detected — confirm intent before continuing (feature → refactor).
  risk: overall=high, context=low, iteration=low, branching=high, rewrite=high
  drift: severe (declared=feature, inferred=refactor)
  actions:
    • Scope drift: prompt reads like a refactor task but session declared feature. Update intake…
    • Split this into 2-3 smaller steps before executing
    • Avoid rewrites — edit in place
    …
```

If no `.claude/scope.json` exists in the target project's `cwd`, the hook
exits silently and Claude Code proceeds as normal — safe to install globally.

## Troubleshooting

- **Hook not firing**: `/doctor` in Claude Code, or check
  `.claude/settings.json` is valid JSON.
- **`tsx: command not found`**: the hook uses `npx --yes tsx`, so it should
  self-install. If your hook environment blocks network, run
  `npm i -g tsx` once and change the command to `tsx /ABS/PATH/.../scope-hook.ts`.
- **Error in transcript but prompts still go through**: that's by design
  (non-blocking error). Check stderr in the transcript for the cause.
