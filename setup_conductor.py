import os
import json

os.makedirs("conductor/tracks/scope-mvp_20260421", exist_ok=True)
os.makedirs("conductor/code_styleguides", exist_ok=True)

with open("conductor/setup_state.json", "w") as f:
    json.dump({"status": "complete"}, f)

with open("conductor/product.md", "w") as f:
    f.write("# Product Definition: Scope.ai\n\n**Description:** Quote estimation, proposal builder, token optimization, and prompt export.\n**Target Audience:** Freelancers and small design teams.\n**Problem Statement:** Design teams struggle with estimating AI workloads and token costs transparently.\n**Goals:** Estimate completion, export usage, user trust.\n")

with open("conductor/product-guidelines.md", "w") as f:
    f.write("# Product Guidelines\n\n**Voice and Tone:** Professional and trust-building.\n**Design Principles:** Performance first, transparency in modeling.\n")

with open("conductor/workflow.md", "w") as f:
    f.write("# Workflow Guidelines\n\n**Strategy:** Conventional Commits\n**TDD Policy:** Flexible\n**Code Review:** Required for non-trivial changes\n")

with open("conductor/tech-stack.md", "w") as f:
    f.write("# Tech Stack\n\nUnspecified, to be determined upon framework initialization.\n")

with open("conductor/tracks.md", "w") as f:
    f.write("# Tracks Registry\n\n| Status | Track ID | Title | Created | Updated |\n| ------ | -------- | ----- | ------- | ------- |\n| [ ] | scope-mvp_20260421 | Scope.ai Project Plan | 2026-04-21 | 2026-04-21 |\n")

with open("conductor/index.md", "w") as f:
    f.write("# Conductor - Scope.ai\n\n## Quick Links\n- [Product Definition](./product.md)\n- [Product Guidelines](./product-guidelines.md)\n- [Tech Stack](./tech-stack.md)\n- [Workflow](./workflow.md)\n- [Tracks](./tracks.md)\n\n## Active Tracks\n- scope-mvp_20260421\n")

with open("conductor/tracks/scope-mvp_20260421/metadata.json", "w") as f:
    json.dump({
        "id": "scope-mvp_20260421",
        "title": "Scope.ai Project Plan",
        "type": "feature",
        "status": "pending",
        "created": "2026-04-21",
        "updated": "2026-04-21",
        "phases": {"total": 7, "completed": 0},
        "tasks": {"total": 29, "completed": 0}
    }, f, indent=2)

with open("conductor/tracks/scope-mvp_20260421/index.md", "w") as f:
    f.write("""# Track: Scope.ai Project Plan

**ID:** scope-mvp_20260421
**Status:** Pending

## Documents
- [Specification](./spec.md)
- [Implementation Plan](./plan.md)

## Progress
- Phases: 0/7 complete
- Tasks: 0/29 complete

## Quick Links
- [Back to Tracks](../../tracks.md)
- [Product Context](../../product.md)
""")

with open("conductor/tracks/scope-mvp_20260421/spec.md", "w") as f:
    f.write("""# Specification: Scope.ai Project Plan

**Track ID:** scope-mvp_20260421
**Type:** Feature
**Created:** 2026-04-21
**Status:** Draft

## Summary
Complete phased rollout for Scope.ai from Strategy & Alignment to Post-MVP Expansion.

## Context
See product definition. This track imports the full Scope.ai project plan.

## Acceptance Criteria
- [ ] Strategy & alignment complete
- [ ] Product definition & UX approved
- [ ] MVP Build - estimation core complete
- [ ] MVP Build - optimization & prompt export complete
- [ ] Pilot & validation complete
- [ ] Launch readiness and public beta
- [ ] Post-MVP Expansion scoped

## Dependencies
None

## Out of Scope
Runtime automation execution prior to Post-MVP.
""")

with open("conductor/tracks/scope-mvp_20260421/plan.md", "w") as f:
    f.write("""# Implementation Plan: Scope.ai Project Plan

**Track ID:** scope-mvp_20260421
**Spec:** [spec.md](./spec.md)
**Created:** 2026-04-21
**Status:** [ ] Not Started

## Overview

Phased implementation plan for Scope.ai, parsed from the imported project plan.

## Phase 0: Strategy & Alignment

Finalize product thesis, target user, wedge, and MVP boundaries.

### Tasks
- [ ] T0.1 Lock target audience and wedge: Confirm freelancers + small design teams as primary v1 audience.
- [ ] T0.2 Finalize v1 scope: Confirm v1 = estimator + proposal builder + token optimization + proposal-to-prompt export.
- [ ] T0.3 Review PRD with Antigravity: Walk through product narrative, flows, requirements.
- [ ] T0.4 Define success metrics: Set launch metrics for estimate completion, export usage, and user trust.
- [ ] T0.5 Recruit 5-8 design partners: Identify freelancers and design leads for feedback.

### Verification
- [ ] M0: Product thesis approved

## Phase 1: Product Definition & UX

Convert the PRD into task flows, IA, and high-confidence wireframes.

### Tasks
- [ ] T1.1 Map end-to-end user flow: New project -> scope intake -> estimate -> proposal comparison -> prompt export.
- [ ] T1.2 Design scope intake experience: Create form and template system for project type, phases, workflows, etc.
- [ ] T1.3 Design estimate and proposal screens: Build views for cost estimate, proposals, savings recommendations.
- [ ] T1.4 Design prompt export experience: Define export modes: master prompt, prompt pack, markdown operating brief.
- [ ] T1.5 Prototype and validate with design partners: Review clickable prototype with target users.

### Verification
- [ ] M1: UX and architecture approved

## Phase 2: MVP Build - Estimation Core

Implement project model, token estimation logic, proposal generation, and assumptions management.

### Tasks
- [ ] T2.1 Create project and phase data model: Define entities for project, phase, workflow, agent role, proposal tier, assumptions.
- [ ] T2.2 Implement estimation formulas: Translate project inputs into token, cost, and contingency estimates.
- [ ] T2.3 Implement proposal tier generator: Generate Lean, Standard, and Premium options.
- [ ] T2.4 Build estimate UI and assumptions editor: Surface editable assumptions, phase breakdowns.
- [ ] T2.5 Add reporting and exportable summary: Enable clean estimate output for sharing.

### Verification
- [ ] M2: Estimation engine usable end-to-end

## Phase 3: MVP Build - Optimization & Prompt Export

Implement rules engine, savings recommendations, and budget-aware prompt export.

### Tasks
- [ ] T3.1 Build token optimization rules engine: Create transparent rules for context control, model fit, retry loops.
- [ ] T3.2 Generate savings recommendations: Surface actionable savings opportunities with trade-offs.
- [ ] T3.3 Implement proposal-to-prompt export: Generate master prompt, prompt pack, markdown operating brief.
- [ ] T3.4 Design export preview and editing layer: Allow users to preview, tweak verbosity, copy prompt outputs.
- [ ] T3.5 QA exported prompts in Claude Code-style workflows: Test that generated prompts are usable.

### Verification
- [ ] M3: Prompt export and optimization complete

## Phase 4: Pilot & Validation

Ship to design partners, collect feedback, and refine trust, utility, and UX.

### Tasks
- [ ] T4.1 Instrument core events: Track estimate creation, proposal selection, prompt export.
- [ ] T4.2 Run design partner onboarding: Guide selected users through first estimates.
- [ ] T4.3 Collect qualitative feedback: Interview users about estimate trust, export usefulness.
- [ ] T4.4 Prioritize and ship pilot fixes: Address onboarding friction, estimate trust gaps.

### Verification
- [ ] M4: Pilot complete

## Phase 5: Launch Readiness

Prepare positioning, site, product copy, and operational readiness for broader release.

### Tasks
- [ ] T5.1 Finalize brand and positioning: Lock Scope.ai messaging, site copy.
- [ ] T5.2 Create launch website and onboarding assets: Produce landing page, product explainer.
- [ ] T5.3 Define pricing and packaging hypothesis: Set early pricing options.
- [ ] T5.4 Prepare beta support workflow: Define issue triage, user support.
- [ ] T5.5 Launch public beta: Open product to a broader set of users.

### Verification
- [ ] M5: Public beta launch

## Phase 6: Post-MVP Expansion

Extend Scope beyond planning into execution visibility and agent project management.

### Tasks
- [ ] T6.1 Define Agent Workboard requirements: Translate kanban-for-agents concept into specs.
- [ ] T6.2 Design agent workboard prototype: Create board UX for states (scoped, running, blocked, etc).
- [ ] T6.3 Explore runtime integrations: Assess Claude Code, Cursor, and other workflow integrations.
- [ ] T6.4 Plan burn tracking and usage ingestion: Define how actual usage feeds back into Scope.
- [ ] T6.5 Approve expansion roadmap: Prioritize workboard, burn tracking, based on beta data.

### Verification
- [ ] M6: Expansion roadmap approved

## Final Verification
- [ ] All phases verified
- [ ] Project goals met

---

_Generated by Conductor. Tasks will be marked [~] in progress and [x] complete._
""")
