---
name: plan
description: Generate a Scope session brief for a new project or task — collects goal, task type, exploration level, posture, and work mode from the user's description, then outputs a structured brief with risk profile, working rules, stop conditions, and a recommended first step.
---

# Scope — plan

Generate a full session brief from a plain-language project description. This is the "before you start" command — run it once at the top of a new session to set guardrails before any code is written.

## Inputs

Accept the user's description in any of these forms:

1. **Inline** — `/scope:plan Build a CLI that auto-generates commit messages from staged diffs`
2. **Conversational** — user describes the project after invoking the command
3. **With flags** — user specifies posture or task type inline: `build a commit message CLI [cheap] [prototype]`

If the description is missing, ask for it in one sentence before proceeding.

## Inference rules

Derive session config from the description. Use these heuristics:

**taskType:**
- Contains "prototype", "MVP", "hack", "quick", "try out" → `prototype`
- Contains "feature", "add", "implement", "build out" → `feature`
- Contains "refactor", "clean up", "restructure", "migrate" → `refactor`
- Contains "bug", "fix", "broken", "error", "debug" → `debug`
- Contains "research", "explore", "compare", "evaluate", "investigate" → `research`
- Default → `prototype`

**explorationLevel:**
- "small", "simple", "quick", "tiny", specific scope → `low`
- Most cases → `medium`
- "not sure", "explore", "figure out", "open-ended" → `high`

**budgetPosture:**
- User mentions "Pro", "personal", "tight budget", "cheap" → `cheap`
- Explicit "balanced" or no signal → `balanced`
- "Max", "Teams", "enterprise", "deep dive", "thorough" → `deep`

**workMode:**
- "just me", "solo", "personal project" → `solo`
- "agents", "multi-agent", "subagents" → `multi-agent`
- Default → `solo`

## Risk signals to evaluate

Score these dimensions against the description:

- **Context risk** — does it touch many files or systems at once?
- **Iteration risk** — is the goal vague or exploratory?
- **Branching risk** — does it contain multiple sub-goals?
- **Rewrite risk** — does it involve replacing existing code from scratch?

Rate each: `low` / `medium` / `high`

## Output format

Render the brief in this exact structure:

```
# Scope session brief

**Goal:** <goal>
**Posture:** <posture>  |  **Task:** <taskType>  |  **Exploration:** <explorationLevel>  |  **Mode:** <workMode>

---

## Risk: <overall level>
<1-2 sentences explaining what signals drove the risk rating>

| Dimension  | Level  |
|------------|--------|
| Context    | low / medium / high |
| Iteration  | low / medium / high |
| Branching  | low / medium / high |
| Rewrite    | low / medium / high |

## Working rules
- <bullet per rule derived from posture + task type>

## Stop conditions
- Checkpoint after <N> turns without a summary
- Fork into sub-sessions after touching <N> files
- Stop and reassess after two consecutive failed attempts

## Cost drivers
- <bullet per applicable driver>

## Recommended first step
<One concrete, scoped sentence describing the smallest useful thing to build or verify first>
```

## Stop condition thresholds

| Posture  | Max turns | Max files |
|----------|-----------|-----------|
| cheap    | 10        | 5         |
| balanced | 20        | 10        |
| deep     | 35        | 20        |

## Working rules by posture

- **cheap** → "Prefer cheapest capable model", "Avoid rewrites — edit in place", "Keep context to files you're actively changing"
- **balanced** → "Default model for most work; escalate only for architectural decisions"
- **deep** → "Depth over speed — checkpoint at milestones"

Add task-type rules:
- **debug** → "Reproduce before fixing; no speculative rewrites"
- **refactor** → "Propose a 3-bullet plan before touching files"
- **research** → "Cap reading to 3 files per round before reporting back"

## Cost drivers

- `explorationLevel: high` → "High exploration multiplies iteration cost"
- `taskType: refactor` → "Refactors tend to fan out across files"
- `taskType: research` → "Research prompts pull broad context"
- `taskType: debug` → "Debug loops burn tokens on repeated context reloads"
- `workMode: multi-agent` → "Multi-agent runs multiply tokens per step"
- None apply → "Typical iteration and context reload"

## Recommended first step by taskType

- `prototype` → sketch the smallest end-to-end happy path; skip polish and edge cases
- `feature` → write the acceptance criteria in 3 bullets, then touch one file at a time
- `refactor` → propose the refactor plan as 3-5 bullets; confirm before any edits
- `debug` → reproduce the bug in isolation before proposing a fix
- `research` → state the question precisely; cap reading to 3 files before reporting back

## After outputting the brief

Ask the user one question: **"Want me to write this to `.claude/scope.json` so the hook picks it up automatically?"**

If yes, write the file using the Write tool with:
```json
{
  "projectGoal": "<goal>",
  "taskType": "<taskType>",
  "explorationLevel": "<explorationLevel>",
  "budgetPosture": "<posture>",
  "workMode": "<workMode>",
  "blockOnSevere": false
}
```
