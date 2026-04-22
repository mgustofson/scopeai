---
name: init
description: Create or update the .claude/scope.json config for this project — collects project goal, task type, exploration level, budget posture, and work mode interactively.
---

# Scope — init

Interactively set up the Scope guardrails for the current project.

## Steps

1. Check whether `.claude/scope.json` already exists in the current working directory. If it does, read it and show the current values; otherwise show the defaults.

2. Ask the user for each of these fields in order. For any field they don't want to change (or don't answer), keep the current value (or default).

   - **projectGoal** (required, free text): one sentence describing what they're building.
   - **taskType**: one of `prototype | feature | refactor | debug | research`. Default `prototype`.
   - **explorationLevel**: `low | medium | high`. Default `medium`.
   - **budgetPosture**: `cheap | balanced | deep`. Default `balanced`. Briefly explain: `cheap` = strictest warnings and cheapest model preference; `balanced` = default; `deep` = relaxed thresholds.
   - **workMode**: `solo | multi-agent | unknown`. Default `unknown`.
   - **blockOnSevere**: boolean. Default `false`. Explain: when true, Scope *blocks* prompts on severe drift or high-risk turns; when false, Scope only injects guidance as context.

3. Write the result to `.claude/scope.json` as formatted JSON (2-space indent). Use the `Write` tool.

4. Summarize what you wrote in 2-3 lines and remind the user:
   - Scope guidance will appear on every prompt from now on.
   - They can re-run `/scope:init` any time to change posture.
   - They can run `/scope:brief` to see the current session brief.

## Output format

After writing, print the final JSON and a one-line summary like:

> Saved `.claude/scope.json` — `balanced` posture, `feature` task, blocking disabled.

## Notes

- Do NOT ask all fields in one message. Ask one at a time so the user can answer conversationally.
- If the user says "use defaults" or similar, skip straight to writing the file with defaults plus their `projectGoal`.
- Never overwrite existing fields the user didn't explicitly change.
