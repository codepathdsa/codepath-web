export type ChallengeType = 'DSA' | 'PR Review' | 'War Room' | 'System Design' | 'Tech Debt Tribunal';
export type RoleLevel = 'Junior' | 'Mid' | 'Senior';

export interface ChallengeOption {
  label: string;
  title: string;
  sub: string;
  isCorrect: boolean;
}

export interface TestCase {
  id: string;
  description: string;
  input: string;
  expected: string;
}

export interface ChallengeQuestion {
  q: string;
  hint: string;
  answer: string;
}

// ── PR Review challenge data ──────────────────────────────────────────────────
export interface PRDiffLine {
  lineNumL: number | null;
  lineNumR: number | null;
  type: 'normal' | 'addition' | 'deletion';
  text: string;
}

export interface PRBugOption {
  value: string;
  label: string;
  sub: string;
}

export interface PRReviewData {
  /** PR number shown in the UI, e.g. 847 */
  prNumber: number;
  /** Source branch, e.g. 'feature/profile-eager-load' */
  prBranch: string;
  /** Target branch, usually 'main' */
  prBase: string;
  /** GitHub handle of the PR author */
  prAuthor: string;
  /** File path shown in the diff header */
  prFile: string;
  /** Human-readable age string, e.g. '2 hours ago' */
  prAge: string;
  /** Overview tab — Background section */
  background: string;
  /** Overview tab — Changes section */
  changes: string;
  /** Overview tab — Testing section */
  testing: string;
  /** Progressive hints, revealed one at a time */
  hints: string[];
  /** Unified diff lines */
  diff: PRDiffLine[];
  /** Bug-type options shown in the inline comment box */
  bugOptions: PRBugOption[];
  /** The bugOptions value that must be selected to win */
  correctBugType: string;
  /** Text shown in the result modal on success */
  successExplanation: string;
  /** Text shown in the result modal on failure */
  failExplanation: string;
}

// ── Tech Debt Tribunal challenge data ────────────────────────────────────────
export interface TribunalFile {
  name: string;
  lang: string;
  code: string;
  /** If true, the editor is read-only for this file */
  readOnly?: boolean;
}

export type TribunalCheckKind =
  | { type: 'complexity';   file: string; max: number }
  | { type: 'contains';     file: string; pattern: string }
  | { type: 'not_contains'; file: string; pattern: string };

export interface TribunalObjective {
  label: string;
  check: TribunalCheckKind;
}

export interface TribunalData {
  /** Markdown-lite paragraph shown in the Briefing tab */
  background: string;
  /** Path label shown above the file tree, e.g. 'src/main/java/com/auth' */
  folderPath: string;
  /** File that is open by default (must be a key in files) */
  primaryFile: string;
  files: TribunalFile[];
  objectives: TribunalObjective[];
  hints: string[];
  totalTests: number;
  testFramework: string;
  xp: number;
  successMessage: string;
}
// ─────────────────────────────────────────────────────────────────────────────

export interface Challenge {
  id: string;
  type: ChallengeType;
  badgeClass: string;
  title: string;
  companies: string[];
  timeEst: string;
  level: RoleLevel;
  status: 'In Progress' | 'Not Started' | 'Completed';
  desc: string;
  realWorldContext?: string;
  whyItMatters?: string;
  approach?: string;
  walkthrough?: string[];
  explanation?: string;
  solution: string;
  options?: ChallengeOption[];
  // DSA-specific enrichment
  hints?: string[];
  starterCode?: string;
  topics?: string[];
  testCases?: TestCase[];
  nextChallengeId?: string;
  // System Design enrichment
  simulation?: SimulationConfig;
  complexity?: string | { time: string; space: string };
  questions?: ChallengeQuestion[];
  // PR Review enrichment
  prReview?: PRReviewData;
  // Tech Debt Tribunal enrichment
  tribunalData?: TribunalData;
  /** Primary programming language of this challenge, e.g. 'Java', 'TypeScript' */
  lang?: string;
}

export interface SimCheck {
  type: 'hasNode' | 'hasPath' | 'hasEdge';
  source: string;
  target?: string;
}

export interface SimLevel {
  traffic: number;
  targetLatency: number;
  successMsg: string;
  failMsg: string;
  failNode?: string;    // node type to apply animation to
  failTooltip?: string; // string to show in tooltip
  checks: SimCheck[];
}

// ── Decision gates ────────────────────────────────────────────────────────────
// Pauses the simulation AFTER a level passes and presents a trade-off choice.
// All options can be made to work — the point is the WHY, not gatekeeping.
// Optimal choices add to the engineer's score; suboptimal choices teach.
export interface DecisionOption {
  id: string;
  label: string;        // Short title: "Full replica in RAM"
  sublabel: string;     // "100 GB total · $400/mo · O(1) lookup"
  isOptimal: boolean;
  consequence: string;  // Shown after choosing: what actually happens
}

export interface Decision {
  afterLevel: number;    // 0-indexed: fire after levels[N] passes
  situation: string;     // On-call framing: what just happened
  question: string;      // The trade-off question
  options: DecisionOption[];
  explanation: string;   // Full explanation shown after the choice is made
}

// ── Score rubric ───────────────────────────────────────────────────────────────
export interface ScoreMetric {
  label: string;       // "Speed bonus"
  maxPoints: number;
  description: string; // "Solve all levels in under 8 minutes"
}

export interface SimulationConfig {
  constraints: { label: string; value: string }[];
  levels: SimLevel[];
  decisions?: Decision[];
  scoreMetrics?: ScoreMetric[];
}
