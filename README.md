# Scope

Budget guardrails for Claude Code. Scope watches every prompt you send, classifies its risk, detects when you're drifting off-plan, and injects working guidance — before the model even starts.

Built for solo builders and small teams who start fast and want to stay in control of token cost and session sprawl.

## Install

```sh
# 1. Add the Scope marketplace (one-time)
/plugin marketplace add mgustofson/scopeai

# 2. Install the plugin
/plugin install scope@scope
```

## Configure

Run the interactive setup in any project:

```
/scope:init
```

This creates `.claude/scope.json`. Minimum config:

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

| Field | Options | Default |
|---|---|---|
| `projectGoal` | any string | **required** |
| `taskType` | `prototype` `feature` `refactor` `debug` `research` | `prototype` |
| `explorationLevel` | `low` `medium` `high` | `medium` |
| `budgetPosture` | `cheap` `balanced` `deep` | `balanced` |
| `workMode` | `solo` `multi-agent` `unknown` | `unknown` |
| `blockOnSevere` | `true` / `false` | `false` |

No config file → Scope runs silently as a no-op.

## Commands

| Command | What it does |
|---|---|
| `/scope:init` | Create or update `.claude/scope.json` interactively |
| `/scope:brief` | Print current session brief — goal, working rules, stop conditions, next step |

## What it does

On every prompt, Scope evaluates 4 risk dimensions:

| Dimension | Triggered by |
|---|---|
| **context** | 5+ attached files, or 10+ files already touched in the session |
| **iteration** | Exploratory language ("figure out", "maybe", "not sure") or high exploration level |
| **branching** | Side-quest language ("also", "while you're at it") or broad-scope words ("entire", "refactor all") |
| **rewrite** | Full-replacement language ("from scratch", "rewrite", "redo") |

It also detects **scope drift** — when your prompt reads like a different task type than the one you declared. Declared `feature` but wrote a refactor prompt? Scope flags it as severe drift and asks for confirmation before the model proceeds.

### Example guidance (injected as context)

```
[Scope / posture=balanced] Scope drift detected — confirm intent before continuing (feature → refactor).
  risk: overall=high, context=low, iteration=low, branching=high, rewrite=high
  drift: severe (declared=feature, inferred=refactor)
  actions:
    • Scope drift: prompt reads like refactor but declared feature. Update intake to taskType="refactor"…
    • Split this into 2-3 smaller steps before executing
    • Avoid rewrites — edit in place
    • Drop side-quests; queue them as follow-ups
    • Ask the user to confirm scope before proceeding
```

With `blockOnSevere: true`, the prompt is **rejected** entirely — the model never sees it — and you're prompted to revise.

## Postures

| Posture | Warnings | Checkpoint at | Confirm on high risk |
|---|---|---|---|
| `cheap` | Aggressive | 10 turns / 5 files | Yes |
| `balanced` | Medium | 20 turns / 10 files | Yes |
| `deep` | Relaxed | 35 turns / 20 files | No |

## Contributing

Source lives in `src/lib/scope/`. All logic is TypeScript with a full vitest test suite.

```sh
npm install
npm test
```

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT
