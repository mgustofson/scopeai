---
name: brief
description: Print the current Scope session brief — goal, posture, cost drivers, working rules, stop conditions, and recommended next step.
---

# Scope — brief

Read `.claude/scope.json` from the current working directory and render a structured session brief.

## Steps

1. Read `.claude/scope.json`. If it doesn't exist, tell the user to run `/scope:init` first and stop.

2. Derive and print the brief in this format:

```
# Scope session brief

**Goal:** <projectGoal>
**Posture:** <budgetPosture>  |  **Task:** <taskType>  |  **Exploration:** <explorationLevel>  |  **Mode:** <workMode>

## Cost drivers
- <bullet per likely cost driver based on config>

## Working rules
- <bullet per rule derived from posture + task type>

## Stop conditions
- Checkpoint after <N> turns without a summary
- Fork into sub-sessions after touching <N> files
- Stop and reassess after two consecutive failed attempts

## Recommended first step
<one sentence tailored to taskType>
```

## Cost drivers to infer

Use this logic to populate cost drivers (list any that apply):

- `explorationLevel: high` → "High exploration multiplies iteration cost"
- `taskType: refactor` → "Refactors tend to fan out across files"
- `taskType: research` → "Research prompts pull broad context"
- `taskType: debug` → "Debug loops burn tokens on repeated context reloads"
- `workMode: multi-agent` → "Multi-agent runs multiply tokens per step"
- If none apply → "Typical iteration and context reload"

## Working rules to infer

- `budgetPosture: cheap` → "Prefer cheapest capable model", "Avoid rewrites — edit in place", "Keep context to files you're actively changing"
- `budgetPosture: balanced` → "Default model for most work; escalate only for architectural decisions"
- `budgetPosture: deep` → "Depth over speed — checkpoint at milestones"
- `taskType: debug` → "Reproduce before fixing; no speculative rewrites"
- `taskType: refactor` → "Propose a 3-bullet plan before touching files"
- `taskType: research` → "Cap reading to 3 files per round before reporting back"

## Stop condition thresholds by posture

| Posture  | Max turns | Max files |
|----------|-----------|-----------|
| cheap    | 10        | 5         |
| balanced | 20        | 10        |
| deep     | 35        | 20        |

## Recommended first step by taskType

- `prototype` → "Sketch the smallest end-to-end happy path; skip polish and edge cases."
- `feature` → "Write the acceptance criteria in 3 bullets, then touch one file at a time."
- `refactor` → "Propose the refactor plan as 3-5 bullets; confirm before any edits."
- `debug` → "Reproduce the bug in isolation before proposing a fix."
- `research` → "State the question precisely; cap reading to 3 files before reporting back."
