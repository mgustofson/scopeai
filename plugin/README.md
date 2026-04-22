# Scope plugin for Claude Code

Budget guardrails for iterative builders. Scope watches every prompt you send
Claude Code, classifies its risk, detects scope drift, and injects working
guidance — before the model even starts.

## Install

```sh
# Load for one session only (great for testing):
claude --plugin-dir /path/to/scope/plugin

# Install for a specific project (committed, shared with team):
claude plugin install /path/to/scope/plugin --scope project

# Install for all your projects:
claude plugin install /path/to/scope/plugin --scope user
```

If you've cloned the Scope repo locally, the plugin dir is `scope/plugin/`.

Reload during active development:

```sh
/reload-plugins
```

## Configure your project

Run the interactive setup command after installing:

```
/scope:init
```

This creates `.claude/scope.json` in your project. Minimum manual config:

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

| Field              | Options                                          | Default      |
|--------------------|--------------------------------------------------|--------------|
| `projectGoal`      | any string                                       | **required** |
| `taskType`         | `prototype` `feature` `refactor` `debug` `research` | `prototype` |
| `explorationLevel` | `low` `medium` `high`                           | `medium`     |
| `budgetPosture`    | `cheap` `balanced` `deep`                       | `balanced`   |
| `workMode`         | `solo` `multi-agent` `unknown`                  | `unknown`    |
| `blockOnSevere`    | `true` / `false`                                | `false`      |

No config file in the project → Scope runs silently as a no-op.

## Commands

| Command        | What it does |
|----------------|--------------|
| `/scope:init`  | Interactively create or update `.claude/scope.json` |
| `/scope:brief` | Print the current session brief (goal, rules, stop conditions, first step) |

## What the hook injects

On every prompt, Claude Code sees a context line like:

```
[Scope / posture=balanced] High-risk turn under balanced posture — tighten scope before continuing.
  risk: overall=high, context=low, iteration=low, branching=high, rewrite=high
  drift: severe (declared=feature, inferred=refactor)
  actions:
    • Scope drift: prompt reads like refactor but declared feature. Update intake…
    • Split this into 2-3 smaller steps before executing
    • Avoid rewrites — edit in place
    • Drop side-quests; queue them as follow-ups
    • Ask the user to confirm scope before proceeding
```

With `blockOnSevere: true`, high-risk or drifting prompts are **blocked**
entirely — the model never sees them, and you're prompted to revise.

## Risk dimensions

| Dimension  | What triggers it |
|------------|-----------------|
| `context`  | 5+ attached files or 10+ files already touched |
| `iteration`| Exploratory language ("figure out", "maybe") or high exploration level |
| `branching`| Side-quest language ("also", "while you're at it") or broad scope words ("entire", "refactor") |
| `rewrite`  | Replacement language ("from scratch", "rewrite", "redo") |

`cheap` posture bumps the overall risk level one notch more aggressively than `balanced` or `deep`.

## Scope drift

Scope compares your declared `taskType` to signals in each prompt. If they
diverge significantly (e.g. you declared `feature` but wrote a refactor
prompt), Scope flags it — `mild` for weak signals, `severe` for strong
multi-keyword matches on known high-cost pairs. Severe drift forces a
confirmation action regardless of posture.
