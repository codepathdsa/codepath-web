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

export interface SimulationConfig {
  constraints: { label: string; value: string }[];
  levels: SimLevel[];
}
