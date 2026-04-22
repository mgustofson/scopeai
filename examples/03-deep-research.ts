/**
 * Scenario 3 — Deep posture, research task, multi-agent.
 * User wants a thorough answer and accepts higher cost, but still wants guardrails.
 * Expect: relaxed stop conditions, cost-drivers flagged (multi-agent + research), moderate risk.
 */
import { collectIntake, resolvePosture, assessRisk } from '../src/lib/scope';

const session = collectIntake({
  projectGoal: 'Investigate options for a new vector store',
  taskType: 'research',
  explorationLevel: 'high',
  budgetPosture: 'deep',
  workMode: 'multi-agent',
});

const profile = resolvePosture(session);
const risk = assessRisk(session, {
  promptText: "Explore tradeoffs between pgvector, Qdrant, and LanceDB. I'm not sure which fits our workload — look into their ingest throughput.",
  attachedPaths: ['docs/workload-profile.md', 'docs/latency-targets.md'],
});

console.log('SESSION', session);
console.log('PROFILE', profile);
console.log('RISK', risk);
