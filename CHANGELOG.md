# Changelog

## 0.1.0 — 2026-04-22

### Added
- `UserPromptSubmit` hook — classifies every prompt across 4 risk dimensions (context, iteration, branching, rewrite) and injects working guidance as `additionalContext`
- Scope drift detector — flags when a prompt diverges from the session's declared `taskType`; severe drift forces a confirmation action regardless of posture
- `/scope:init` — interactive command to create or update `.claude/scope.json`
- `/scope:brief` — prints the current session brief (goal, cost drivers, working rules, stop conditions, next step)
- Three budget postures: `cheap`, `balanced`, `deep` — each with distinct warning aggressiveness, checkpoint thresholds, and model routing rules
- `blockOnSevere` config option — opt-in hard blocking for high-risk or severely drifted prompts
