# Implementation Plan: Scope.ai Project Plan (Scoped MVP)

**Track ID:** scope-mvp_20260421
**Spec:** [spec.md](./spec.md)
**Created:** 2026-04-21
**Status:** [~] In Progress

## Overview

A highly focused, robust 4-phase MVP targeting the "Planning & Export" wedge to prove core value immediately, skipping execution/workboards for v1.

## Phase 1: Foundation & Calculation Engine

Set up Next.js architecture, state management, and the core token calculation logic.

### Tasks
- [ ] Setup Next.js, Tailwind, and Zustand configuration.
- [ ] Build data constants (`models.json` for pricing, `heuristics.json` for task token averages).
- [ ] Write pure TypeScript functions that intake a project description and output Lean/Standard/Premium estimates.

### Verification
- [ ] Calculations map correctly in basic console tests/unit tests.

## Phase 2: Intake & Estimation Interface

Build the user-facing forms and interactive estimation canvas.

### Tasks
- [ ] Build the Intake wizard (Project definition, complexity selection).
- [ ] Build the interactive Estimate Canvas (views for Lean, Standard, and Premium).
- [ ] Wire the UI to the local calculation engine for reactive cost updates.

### Verification
- [ ] Users can navigate the intake flow and immediately see priced tiers.

## Phase 3: Optimization Rules Engine

Implement smart suggestions to reduce projected model costs.

### Tasks
- [ ] Implement the "Savings Recommendations" logic for bad model choices.
- [ ] Build the sidebar UI to surface and one-click apply these recommendations to active state.

### Verification
- [ ] Applying a recommendation correctly lowers the projected token usage/cost in the UI.

## Phase 4: Prompt Export Factory

Translate the calculated state into a formatted prompt ready for CLI ingestion.

### Tasks
- [ ] Build the templating engine that translates the Zustand state into an optimized markdown prompt.
- [ ] Build the Export Hub screen.
- [ ] Implement "Copy to Clipboard" and "Download as .md" features.

### Final Verification
- [ ] End-to-end functionality is complete. Scope defined -> Estimated -> Optimized -> Exported.
- [ ] All phases verified.
