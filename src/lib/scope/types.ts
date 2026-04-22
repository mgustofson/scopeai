// Public types — spec-defined.

export type TaskType = "prototype" | "feature" | "refactor" | "debug" | "research";
export type ExplorationLevel = "low" | "medium" | "high";
export type BudgetPosture = "cheap" | "balanced" | "deep";
export type WorkMode = "solo" | "multi-agent" | "unknown";

export interface SessionInput {
  projectGoal: string;
  taskType: TaskType;
  explorationLevel: ExplorationLevel;
  budgetPosture: BudgetPosture;
  workMode: WorkMode;
}

export interface SessionProfile {
  summary: string;
  likelyCostDrivers: string[];
  workingRules: string[];
  stopConditions: string[];
}

export type RiskLevel = "low" | "medium" | "high";

export interface RiskAssessment {
  overallRisk: RiskLevel;
  contextRisk: RiskLevel;
  iterationRisk: RiskLevel;
  branchingRisk: RiskLevel;
  rewriteRisk: RiskLevel;
  reasons: string[];
  recommendations: string[];
}

export interface GuidanceOutput {
  message: string;
  actions: string[];
  shouldCheckpoint: boolean;
  shouldSplitTask: boolean;
  shouldAskForConfirmation: boolean;
}

// Derived — needed by risk + brief + checkpoint modules.

export interface PromptContext {
  promptText: string;
  attachedPaths?: string[];
  turnCount?: number;
  turnsSinceLastCheckpoint?: number;
  filesTouchedCount?: number;
}

export interface SessionBrief {
  goal: string;
  posture: BudgetPosture;
  profile: SessionProfile;
  keyRisks: string[];
  workingRules: string[];
  stopConditions: string[];
  nextStepGuidance: string;
}

export type DriftLevel = 'none' | 'mild' | 'severe';

export interface DriftReport {
  level: DriftLevel;
  declaredTaskType: TaskType;
  inferredTaskType: TaskType | null;
  signals: string[];
  recommendation: string | null;
}

export interface CheckpointPrompts {
  summarizeCurrentState: string;
  compressContext: string;
  restatePlan: string;
  suggestNextStep: string;
}
